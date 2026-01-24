import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button, Avatar, Textarea, Accordion, AccordionItem, addToast } from "@heroui/react";
import { FiThumbsUp, FiStar, FiShare2, FiMessageSquare, FiUserPlus, FiX } from "react-icons/fi";
import { routes } from "../../router/routes";
import { useUserStore } from "../../store";
import { Loading } from "../../components/Loading";
import { 
  fetchVideoDetail, 
  toggleVideoLike, 
  toggleVideoFavorite, 
  toggleCommentLike,
  fetchVideoComments,
  postVideoComment,
  type VideoDetail, 
  type CommentItem 
} from "../../api/front/video";
import { toggleFollowUser } from "../../api/front/user";
import VideoPlayer from "../../components/VideoPlayer";
import { mockVideoData, mockVideoComments } from "../../api/mock/front/videoDetail";

// --- Sub-components for responsive layout ---

const EpisodesList = ({ 
  episodes, 
  currentId, 
  onEpisodeClick 
}: { 
  episodes: VideoDetail['episodes']; 
  currentId: string | undefined; 
  onEpisodeClick: (id: string) => void;
}) => (
  <Accordion variant="splitted" defaultExpandedKeys={["1"]} className="px-0">
    <AccordionItem 
      key="1" 
      aria-label="视频选集" 
      title={<span className="font-bold">视频选集</span>}
      classNames={{
        base: "bg-[var(--bg-elevated)] shadow-none border border-[var(--border-color)]",
        title: "text-sm"
      }}
    >
      <div className="space-y-1 max-h-80 overflow-y-auto custom-scrollbar">
        {episodes && episodes.length > 0 ? (
          episodes.map((ep, index) => (
            <div 
              key={ep.id}
              className={`flex items-center justify-between p-2.5 rounded-lg text-sm cursor-pointer transition-all ${
                ep.id === currentId 
                  ? "bg-[var(--primary-color)]/20 text-[var(--primary-color)] shadow-sm font-medium" 
                  : "hover:bg-[var(--bg-color)] text-[var(--text-color-secondary)] hover:text-[var(--text-color)]"
              }`}
              onClick={() => onEpisodeClick(ep.id)}
            >
              <span className="truncate pr-2">P{index + 1}. {ep.title}</span>
              <span className={`text-xs shrink-0 ${ep.id === currentId ? "opacity-100" : "opacity-60"}`}>
                {ep.duration}
              </span>
            </div>
          ))
        ) : (
          <div className="p-4 text-center text-sm text-[var(--text-color-secondary)]">暂无选集</div>
        )}
      </div>
    </AccordionItem>
  </Accordion>
);

const RecommendationsList = ({ 
  recommendations, 
  onRecommendationClick 
}: { 
  recommendations: VideoDetail['recommendations']; 
  onRecommendationClick: (id: string) => void;
}) => (
  <div className="space-y-4">
    <h3 className="text-base font-bold px-1">相关推荐</h3>
    <div className="space-y-4">
      {recommendations.map(item => (
        <div
          key={item.id}
          className="flex gap-3 group cursor-pointer"
          onClick={() => onRecommendationClick(item.id)}
        >
          <div className="relative w-40 h-24 bg-slate-800 rounded-xl overflow-hidden shrink-0 shadow-sm group-hover:shadow-md transition-shadow">
            <img 
              src={item.coverUrl || "/DefaultImage/MyDefaultHomeVodie.png"} 
              alt={item.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/DefaultImage/MyDefaultHomeVodie.png";
              }}
            />
            <div className="absolute bottom-1.5 right-1.5 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded font-medium">
              {item.duration}
            </div>
          </div>
          <div className="flex-1 min-w-0 flex flex-col gap-1 py-0.5">
            <div className="text-sm font-medium line-clamp-2 group-hover:text-[var(--primary-color)] transition-colors leading-snug">
              {item.title}
            </div>
            <div className="space-y-0.5">
              <div className="text-[11px] text-[var(--text-color-secondary)] truncate">
                {item.authorName || "未知作者"}
              </div>
              <div className="text-[11px] text-[var(--text-color-secondary)] line-clamp-1 opacity-70">
                {item.description || "暂无简介"}
              </div>
              <div className="text-[11px] text-[var(--text-color-secondary)] flex items-center gap-2">
                <span>{item.views} 播放</span>
                {item.date && (
                  <>
                    <span className="w-0.5 h-0.5 rounded-full bg-current opacity-40"></span>
                    <span>{item.date}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

function VideoDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { token } = useUserStore();
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [video, setVideo] = useState<VideoDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [commentText, setCommentText] = useState("");
  const [commentSort, setCommentSort] = useState<"hot" | "new">("hot");
  const [replyingTo, setReplyingTo] = useState<{ id: string; name: string; parentId?: string } | null>(null);

  const checkLogin = () => {
    if (!token) {
      addToast({ title: "请先登录", color: "warning" });
      return false;
    }
    return true;
  };

  const handleLike = async () => {
    if (!checkLogin() || !video) return;
    const newIsLiked = !video.stats.isLiked;
    const newCount = video.stats.likes + (newIsLiked ? 1 : -1);
    
    try { 
      await toggleVideoLike(video.id); 
      // Update UI after success
      setVideo(prev => prev ? { ...prev, stats: { ...prev.stats, isLiked: newIsLiked, likes: newCount } } : null);
      if (newIsLiked) {
        addToast({ title: "点赞成功", color: "success" });
      } else {
        addToast({ title: "取消点赞", color: "warning" });
      }
    } catch (err) { 
      console.error(err);
    }
  };

  const handleFavorite = async () => {
    if (!checkLogin() || !video) return;
    const newIsFavorited = !video.stats.isFavorited;
    const newCount = video.stats.favorites + (newIsFavorited ? 1 : -1);
    
    try { 
      await toggleVideoFavorite(video.id); 
      // Update UI after success
      setVideo(prev => prev ? { ...prev, stats: { ...prev.stats, isFavorited: newIsFavorited, favorites: newCount } } : null);
      if (newIsFavorited) {
        addToast({ title: "收藏成功", color: "success" });
      } else {
        addToast({ title: "取消收藏", color: "warning" });
      }
    } catch (err) { 
      console.error(err);
    }
  };

  const handleCommentLike = async (commentId: string, isReply = false, parentId?: string) => {
    if (!checkLogin()) return;

    let targetComment: CommentItem | undefined;
    if (isReply && parentId) {
      const parent = comments.find(c => c.id === parentId);
      targetComment = parent?.replies?.find(r => r.id === commentId);
    } else {
      targetComment = comments.find(c => c.id === commentId);
    }

    if (!targetComment) return;

    const newIsLiked = !targetComment.isLiked;
    const newLikes = targetComment.likes + (newIsLiked ? 1 : -1);

    const updateComments = (list: CommentItem[]): CommentItem[] => {
      return list.map(c => {
        if (c.id === (isReply ? parentId : commentId)) {
          if (isReply) {
            return {
              ...c,
              replies: c.replies?.map(r => r.id === commentId ? { ...r, isLiked: newIsLiked, likes: newLikes } : r)
            };
          }
          return { ...c, isLiked: newIsLiked, likes: newLikes };
        }
        return c;
      });
    };

    try {
      await toggleCommentLike(commentId);
      // Update UI after success
      setComments(prev => updateComments(prev));
      if (newIsLiked) {
        addToast({ title: "点赞成功", color: "success" });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    addToast({ title: "链接已复制", color: "success" });
  };

  const handleFollow = async () => {
    if (!checkLogin() || !video) return;
    
    const newIsFollowing = !video.author.isFollowing;
    
    try { 
      await toggleFollowUser(video.author.id); 
      // Update UI after success
      setVideo(prev => prev ? { 
        ...prev, 
        author: { ...prev.author, isFollowing: newIsFollowing } 
      } : null);
      if (newIsFollowing) {
        addToast({ title: "关注成功", color: "success" });
      } else {
        addToast({ title: "已取消关注", color: "warning" });
      }
    } catch (err) { 
      console.error(err);
    }
  };

  const handleCommentSubmit = async () => {
    if (!checkLogin()) return;
    
    if (!commentText.trim()) {
      addToast({ title: "评论内容不能为空", color: "warning" });
      return;
    }

    try {
      const data = {
        videoId: id!,
        content: commentText.trim(),
        parentId: replyingTo?.parentId || replyingTo?.id,
        replyToId: replyingTo?.id
      };

      const newComment = await postVideoComment(data);

      if (replyingTo?.parentId) {
        // Reply to a reply or comment
        setComments(comments.map(c => {
          if (c.id === replyingTo.parentId) {
            return {
              ...c,
              replies: [...(c.replies || []), newComment]
            };
          }
          return c;
        }));
      } else if (replyingTo) {
        // Reply to a top-level comment
        setComments(comments.map(c => {
          if (c.id === replyingTo.id) {
            return {
              ...c,
              replies: [...(c.replies || []), newComment]
            };
          }
          return c;
        }));
      } else {
        // Top-level comment
        setComments([newComment, ...comments]);
      }
      
      setCommentText("");
      setReplyingTo(null);
      addToast({ title: "评论发布成功", color: "success" });
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (id) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(true);
      fetchVideoDetail(id)
        .then((res) => {
          // 如果返回 200 但数据为空，或者根据用户要求回退到 mock
          if (!res || !res.id) {
            setVideo(mockVideoData);
          } else {
            setVideo(res);
          }

          // 获取评论列表
          fetchVideoComments(id, { page: 1, pageSize: 20, sort: commentSort })
            .then(commentsRes => {
              if (!commentsRes || !commentsRes.list || commentsRes.list.length === 0) {
                setComments(mockVideoComments);
              } else {
                setComments(commentsRes.list);
              }
            })
            .catch(err => {
              console.error("Fetch video comments failed, using mock:", err);
              setComments(mockVideoComments);
            });
        })
        .catch((err) => {
          console.error("Failed to fetch video detail, using mock:", err);
          setVideo(mockVideoData);
          setComments(mockVideoComments);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [id, commentSort]);

  if (loading) {
    return <Loading height="calc(100vh - 200px)" />;
  }

  if (!video) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-200px)] text-[var(--text-color-secondary)]">
        视频未找到
      </div>
    );
  }

  const handleNavigate = (newId: string) => {
    navigate(routes.videoDetail.replace(":id", newId));
  };

  return (
    <div className="w-full py-4">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Content (Main Video Area) */}
        <div className="flex-1 min-w-0 space-y-4">
          {/* Player Area */}
          <div className="aspect-video bg-black overflow-hidden shadow-sm rounded-xl border border-[var(--border-color)]">
            <VideoPlayer
              url={video.videoUrl}
              poster={video.coverUrl || "/DefaultImage/MyDefaultHomeVodie.png"}
              title={video.title}
              thumbnails="https://files.vidstack.io/sprite-fight/thumbnails.vtt"
              chapters={[
                { time: 0, title: "开场" },
                { time: 120, title: "高潮" },
                { time: 300, title: "结尾" }
              ]}
            />
          </div>

          {/* Title & Author Section */}
          <div className="space-y-4 pt-2">
            <h1 className="text-xl md:text-2xl font-bold leading-tight" title={video.title}>
              {video.title}
            </h1>

            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-4">
              <div className="flex items-center gap-3">
                <Avatar 
                  src={video.author.avatar} 
                  name={video.author.name.charAt(0)}
                  className="cursor-pointer"
                  onClick={() => navigate(`/user/${video.author.id}`)}
                />
                <div>
                  <div className="flex items-center gap-2">
                    <div 
                      className="font-semibold text-sm cursor-pointer hover:text-[var(--primary-color)] transition-colors"
                      onClick={() => navigate(`/user/${video.author.id}`)}
                    >
                      {video.author.name}
                    </div>
                    <Button
                      size="sm"
                      variant={video.author.isFollowing ? "flat" : "solid"}
                      color="primary"
                      className={`h-6 min-w-16 px-2 text-xs ${video.author.isFollowing ? "bg-[var(--bg-elevated)] text-[var(--text-color-secondary)]" : ""}`}
                      startContent={!video.author.isFollowing && <FiUserPlus />}
                      onClick={handleFollow}
                    >
                      {video.author.isFollowing ? "已关注" : "关注"}
                    </Button>
                  </div>
                  <div className="text-xs text-[var(--text-color-secondary)] mt-0.5 flex items-center gap-2">
                    <span>{video.stats.views} 播放</span>
                    <span>·</span>
                    <span>{video.author.fans} 粉丝</span>
                    <span>·</span>
                    <span>{video.stats.date}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-6 items-center">
                <div 
                  className={`flex items-center gap-1.5 cursor-pointer transition-colors ${video.stats.isLiked ? "text-[var(--primary-color)]" : "hover:text-[var(--primary-color)]"}`}
                  onClick={handleLike}
                >
                  <FiThumbsUp className={`text-lg ${video.stats.isLiked ? "fill-current" : ""}`} />
                  <span className="text-sm font-medium">{video.stats.likes}</span>
                </div>
                <div 
                  className={`flex items-center gap-1.5 cursor-pointer transition-colors ${video.stats.isFavorited ? "text-[var(--primary-color)]" : "hover:text-[var(--primary-color)]"}`}
                  onClick={handleFavorite}
                >
                  <FiStar className={`text-lg ${video.stats.isFavorited ? "fill-current" : ""}`} />
                  <span className="text-sm font-medium">{video.stats.favorites}</span>
                </div>
                <div 
                  className="flex items-center gap-1.5 cursor-pointer hover:text-[var(--primary-color)] transition-colors"
                  onClick={handleShare}
                >
                  <FiShare2 className="text-lg" />
                  <span className="text-sm font-medium">分享</span>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="pt-0">
            <div className="relative bg-[var(--bg-elevated)] p-4 rounded-xl">
              <div className={`text-sm text-[var(--text-color)] overflow-hidden transition-all ${isExpanded ? "h-auto" : "h-20"}`}>
                <div className="whitespace-pre-wrap leading-relaxed">{video.description}</div>
              </div>
              <button
                className="text-xs text-[var(--primary-color)] mt-2 hover:underline font-medium"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? "收起" : "展开全文"}
              </button>
            </div>
          </div>

          {/* Mobile Only: Episodes Section */}
          <div className="lg:hidden">
            <EpisodesList 
              episodes={video.episodes} 
              currentId={id} 
              onEpisodeClick={handleNavigate} 
            />
          </div>

          {/* Comments Section */}
          <div className="space-y-6 pt-8 border-t border-[var(--border-color)]">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <FiMessageSquare />
                评论区 <span className="text-sm font-normal text-[var(--text-color-secondary)]">({comments.length})</span>
              </h3>
              <div className="flex gap-4 text-sm text-[var(--text-color-secondary)]">
                <span 
                  className={`cursor-pointer ${commentSort === "hot" ? "text-[var(--primary-color)] font-medium" : "hover:text-[var(--text-color)]"}`}
                  onClick={() => setCommentSort("hot")}
                >
                  最热
                </span>
                <span className="w-px bg-[var(--border-color)] h-4 self-center"></span>
                <span 
                  className={`cursor-pointer ${commentSort === "new" ? "text-[var(--primary-color)] font-medium" : "hover:text-[var(--text-color)]"}`}
                  onClick={() => setCommentSort("new")}
                >
                  最新
                </span>
              </div>
            </div>

            {/* Comment Input */}
            <div className="flex gap-4">
              <Avatar className="w-10 h-10 shrink-0" />
              <div className="flex-1 space-y-2">
                <Textarea
                  placeholder={
                    token 
                      ? (replyingTo ? `回复 @${replyingTo.name}:` : "分享你的见解...") 
                      : "登录后发表评论"
                  }
                  minRows={2}
                  variant="bordered"
                  value={commentText}
                  onValueChange={setCommentText}
                  classNames={{
                    inputWrapper: "bg-[var(--bg-elevated)]"
                  }}
                />
                <div className="flex justify-between items-center">
                  {replyingTo && (
                    <div className="text-xs text-[var(--text-color-secondary)] flex items-center gap-2">
                      <span>正在回复 @{replyingTo.name}</span>
                      <span 
                        className="cursor-pointer hover:text-[var(--primary-color)]"
                        onClick={() => setReplyingTo(null)}
                      >
                        <FiX />
                      </span>
                    </div>
                  )}
                  <div className="flex-1"></div>
                  <Button 
                    size="sm" 
                    color="primary"
                    onClick={handleCommentSubmit}
                  >
                    发布评论
                  </Button>
                </div>
              </div>
            </div>

            {/* Comment List */}
            <div className="space-y-6">
              {comments.map(comment => (
                <div key={comment.id} className="flex gap-4 group">
                  <Avatar src={comment.author.avatar} name={comment.author.name.charAt(0)} className="w-10 h-10 shrink-0" />
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-[var(--text-color-secondary)]">{comment.author.name}</span>
                      <span className="text-xs text-[var(--text-color-secondary)] opacity-60">{comment.createdAt}</span>
                    </div>
                    <div className="text-sm leading-relaxed text-[var(--text-color)]">
                      {comment.content}
                    </div>
                    
                    {/* Comment Actions */}
                    <div className="flex items-center gap-6 text-xs text-[var(--text-color-secondary)] pt-1">
                      <div 
                        className="flex items-center gap-1.5 cursor-pointer hover:text-[var(--primary-color)] transition-colors"
                        onClick={() => handleCommentLike(comment.id)}
                      >
                        <FiThumbsUp className={comment.isLiked ? "text-[var(--primary-color)] fill-current" : ""} />
                        <span>{comment.likes}</span>
                      </div>
                      <div 
                        className="cursor-pointer hover:text-[var(--primary-color)] transition-colors"
                        onClick={() => {
                          if (!checkLogin()) return;
                          setReplyingTo({ id: comment.id, name: comment.author.name });
                          // Optional: focus textarea
                        }}
                      >
                        回复
                      </div>
                    </div>

                    {/* Replies */}
                    {comment.replies && comment.replies.length > 0 && (
                      <div className="mt-3 pl-4 border-l-2 border-[var(--border-color)] space-y-4">
                        {comment.replies.map(reply => (
                          <div key={reply.id} className="flex gap-3">
                            <Avatar src={reply.author.avatar} name={reply.author.name.charAt(0)} className="w-6 h-6 shrink-0" />
                            <div className="flex-1 min-w-0 space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-medium text-[var(--text-color-secondary)]">{reply.author.name}</span>
                                <span className="text-xs text-[var(--text-color-secondary)] opacity-60">{reply.createdAt}</span>
                              </div>
                              <div className="text-sm text-[var(--text-color)]">
                                {reply.replyTo && (
                                  <span className="text-[var(--primary-color)] mr-1">@{reply.replyTo.name}</span>
                                )}
                                {reply.content}
                              </div>
                              <div className="flex items-center gap-4 text-xs text-[var(--text-color-secondary)] pt-0.5">
                                <div 
                                  className="flex items-center gap-1 cursor-pointer hover:text-[var(--primary-color)]"
                                  onClick={() => handleCommentLike(reply.id, true, comment.id)}
                                >
                                  <FiThumbsUp className={reply.isLiked ? "text-[var(--primary-color)] fill-current" : ""} />
                                  <span>{reply.likes}</span>
                                </div>
                                <div 
                                  className="cursor-pointer hover:text-[var(--primary-color)]"
                                  onClick={() => {
                                    if (!checkLogin()) return;
                                    setReplyingTo({ id: reply.id, name: reply.author.name, parentId: comment.id });
                                  }}
                                >
                                  回复
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {comments.length === 0 && (
                <div className="text-center py-12 text-[var(--text-color-secondary)]">
                  <div className="text-4xl mb-3 opacity-20">💬</div>
                  <div className="text-sm">暂无评论，快来抢沙发吧~</div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Only: Recommendations Section */}
          <div className="lg:hidden">
            <RecommendationsList 
              recommendations={video.recommendations} 
              onRecommendationClick={handleNavigate} 
            />
          </div>
        </div>

        {/* Right Sidebar (Episodes & Recommendations) - Desktop Only */}
        <div className="hidden lg:block lg:w-[400px] shrink-0 space-y-6">
          <div className="sticky top-24 space-y-6">
            <EpisodesList 
              episodes={video.episodes} 
              currentId={id} 
              onEpisodeClick={handleNavigate} 
            />
            <RecommendationsList 
              recommendations={video.recommendations} 
              onRecommendationClick={handleNavigate} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default VideoDetail;
