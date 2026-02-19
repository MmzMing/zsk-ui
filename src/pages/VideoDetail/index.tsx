/**
 * 视频详情页面
 * @module pages/VideoDetail
 * @description 视频播放详情页，支持点赞、收藏、评论等功能
 */

import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button, Avatar, Textarea, Accordion, AccordionItem, addToast } from "@heroui/react";
import { FiThumbsUp, FiStar, FiShare2, FiMessageSquare, FiUserPlus, FiX } from "react-icons/fi";
import { routes } from "@/router/routes";
import { useUserStore } from "@/store";
import { Loading } from "@/components/Loading";
import { 
  fetchVideoDetail, 
  toggleVideoLike, 
  toggleVideoFavorite, 
  toggleVideoCommentLike,
  fetchVideoComments,
  postVideoComment,
  type VideoDetail, 
  type CommentItem 
} from "@/api/front/video";
import { toggleFollow } from "@/api/front/user";
import VideoPlayer from "@/components/VideoPlayer";
import { useCallback } from "react";
// ===== 2. TODO待处理导入区域 =====

// ===== 3. 状态控制逻辑区域 =====
function VideoDetail() {
  /** 导航钩子 */
  const navigate = useNavigate();
  /** 路径参数 */
  const { id } = useParams();
  /** 用户信息 */
  const { token, avatar } = useUserStore();
  /** 简介展开状态 */
  const [isExpanded, setIsExpanded] = useState(false);
  /** 视频详情数据 */
  const [video, setVideo] = useState<VideoDetail | null>(null);
  /** 加载状态 */
  const [loading, setLoading] = useState(true);
  /** 评论列表 */
  const [comments, setComments] = useState<CommentItem[]>([]);
  /** 评论输入内容 */
  const [commentText, setCommentText] = useState("");
  /** 评论排序方式 */
  const [commentSort, setCommentSort] = useState<"hot" | "new">("hot");
  /** 正在回复的对象 */
  const [replyingTo, setReplyingTo] = useState<{ id: string; name: string; parentId?: string } | null>(null);

  // ===== 4. 通用工具函数区域 =====


  /**
   * 检查登录状态
   */
  const handleCheckLogin = useCallback(() => {
    if (!token) {
      addToast({ title: "请先登录", color: "warning" });
      return false;
    }
    return true;
  }, [token]);

  // ===== 5. 注释代码函数区 =====

  // ===== 6. 错误处理函数区域 =====

  // ===== 7. 数据处理函数区域 =====
  /**
   * 处理点赞
   */
  const handleLike = useCallback(async () => {
    if (!handleCheckLogin() || !video) return;
    const newIsLiked = !video.stats.isLiked;
    const newCount = video.stats.likes + (newIsLiked ? 1 : -1);
    
    await toggleVideoLike(video.id);
    
    setVideo(prev => prev ? { 
      ...prev, 
      stats: { ...prev.stats, isLiked: newIsLiked, likes: newCount } 
    } : null);
    
    addToast({ 
      title: newIsLiked ? "点赞成功" : "取消点赞", 
      color: newIsLiked ? "success" : "warning" 
    });
  }, [video, handleCheckLogin]);

  /**
   * 处理收藏
   */
  const handleFavorite = useCallback(async () => {
    if (!handleCheckLogin() || !video) return;
    const newIsFavorited = !video.stats.isFavorited;
    const newCount = video.stats.favorites + (newIsFavorited ? 1 : -1);
    
    await toggleVideoFavorite(video.id);
    
    setVideo(prev => prev ? { 
      ...prev, 
      stats: { ...prev.stats, isFavorited: newIsFavorited, favorites: newCount } 
    } : null);
    
    addToast({ 
      title: newIsFavorited ? "收藏成功" : "取消收藏", 
      color: newIsFavorited ? "success" : "warning" 
    });
  }, [video, handleCheckLogin]);

  /**
   * 处理评论点赞
   */
  const handleCommentLike = useCallback(async (commentId: string, isReply = false, parentId?: string) => {
    if (!handleCheckLogin()) return;

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

    await toggleVideoCommentLike(commentId);
    setComments(prev => updateComments(prev));
    if (newIsLiked) {
      addToast({ title: "点赞成功", color: "success" });
    }
  }, [comments, handleCheckLogin]);

  /**
   * 处理分享
   */
  const handleShare = useCallback(() => {
    navigator.clipboard.writeText(window.location.href);
    addToast({ title: "链接已复制", color: "success" });
  }, []);

  /**
   * 处理关注
   */
  const handleFollow = useCallback(async () => {
    if (!handleCheckLogin() || !video) return;
    const newIsFollowing = !video.author.isFollowing;
    
    await toggleFollow(video.author.id);
    
    setVideo(prev => prev ? { 
      ...prev, 
      author: { ...prev.author, isFollowing: newIsFollowing } 
    } : null);
    
    addToast({ 
      title: newIsFollowing ? "关注成功" : "已取消关注", 
      color: newIsFollowing ? "success" : "warning" 
    });
  }, [video, handleCheckLogin]);

  /**
   * 处理评论提交
   */
  const handleCommentSubmit = useCallback(async () => {
    if (!handleCheckLogin()) return;
    
    if (!commentText.trim()) {
      addToast({ title: "评论内容不能为空", color: "warning" });
      return;
    }

    const res = await postVideoComment({
      videoId: id!,
      content: commentText.trim(),
      parentId: replyingTo?.parentId || replyingTo?.id,
      replyToId: replyingTo?.id
    });

    if (res) {
      const newComment = res;
      addToast({ title: "评论成功", color: "success" });
      setCommentText("");
      setReplyingTo(null);

      if (replyingTo) {
        setComments(prev => prev.map(c => {
          if (c.id === replyingTo.parentId) {
            return {
              ...c,
              replies: [...(c.replies || []), newComment]
            };
          }
          if (c.id === replyingTo.id) {
             return {
              ...c,
              replies: [...(c.replies || []), newComment]
            };
          }
          return c;
        }));
      } else {
        setComments(prev => [newComment, ...prev]);
      }
    }
  }, [id, commentText, replyingTo, handleCheckLogin]);

  /**
   * 处理路由跳转
   */
  const handleNavigate = useCallback((newId: string) => {
    window.open(routes.videoDetail.replace(":id", newId), "_blank");
  }, []);

  // ===== 8. UI渲染逻辑区域 =====
  /**
   * 选集列表组件
   */
  const renderEpisodesList = () => (
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
          {video?.episodes && video.episodes.length > 0 ? (
            video.episodes.map((ep, index) => (
              <div 
                key={ep.id}
                className={`flex items-center justify-between p-2.5 rounded-lg text-sm cursor-pointer transition-all ${
                  ep.id === id 
                    ? "bg-[var(--primary-color)]/20 text-[var(--primary-color)] shadow-sm font-medium" 
                    : "hover:bg-[var(--bg-color)] text-[var(--text-color-secondary)] hover:text-[var(--text-color)]"
                }`}
                onClick={() => handleNavigate(ep.id)}
              >
                <span className="truncate pr-2">P{index + 1}. {ep.title}</span>
                <span className={`text-xs shrink-0 ${ep.id === id ? "opacity-100" : "opacity-60"}`}>
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

  /**
   * 推荐列表组件
   */
  const renderRecommendationsList = () => (
    <div className="bg-[var(--bg-elevated)] rounded-xl border border-[var(--border-color)] p-4 space-y-4">
      <h3 className="text-base font-bold px-1">相关推荐</h3>
      <div className="space-y-4">
        {video?.recommendations.map(item => (
          <div
            key={item.id}
            className="flex gap-3 group cursor-pointer"
            onClick={() => handleNavigate(item.id)}
          >
            <div className="relative w-32 h-20 bg-slate-800 rounded-lg overflow-hidden shrink-0 shadow-sm group-hover:shadow-md transition-shadow">
              <img 
                src={item.coverUrl || "/DefaultImage/MyDefaultHomeVodie.png"} 
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/DefaultImage/MyDefaultHomeVodie.png";
                }}
              />
              <div className="absolute bottom-1 right-1 bg-black/70 text-white text-[9px] px-1 py-0.5 rounded font-medium">
                {item.duration}
              </div>
            </div>
            <div className="flex-1 min-w-0 flex flex-col gap-0.5 py-0.5">
              <div className="text-sm font-medium line-clamp-2 group-hover:text-[var(--primary-color)] transition-colors leading-snug">
                {item.title}
              </div>
              <div className="space-y-0.5">
                <div className="text-[11px] text-[var(--text-color-secondary)] truncate">
                  {item.authorName || "未知作者"}
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

  // ===== 9. 页面初始化与事件绑定 =====
  const handleFetchInitData = useCallback(async (getIgnore: () => boolean) => {
    if (!id) return;

      const res = await fetchVideoDetail(id, setLoading);
      if (getIgnore()) return;
      if (res) setVideo(res);

      const commentsRes = await fetchVideoComments(id, { page: 1, pageSize: 20, sort: commentSort });
      if (getIgnore()) return;
      if (commentsRes?.list) setComments(commentsRes.list);
  }, [id, commentSort]);

  useEffect(() => {
    let ignore = false;
    const timer = setTimeout(() => {
      setLoading(true);
      handleFetchInitData(() => ignore);
    }, 0);
    return () => {
      ignore = true;
      clearTimeout(timer);
    };
  }, [handleFetchInitData]);

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

            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-4 overflow-x-auto scrollbar-hide whitespace-nowrap">
              <div className="flex items-center gap-3 shrink-0">
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

              <div className="flex gap-6 items-center shrink-0 ml-6">
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
            {renderEpisodesList()}
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
              <Avatar 
                src={avatar || undefined} 
                className="w-10 h-10 shrink-0" 
                showFallback
              />
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
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm">{comment.author.name}</span>
                        <span className="text-xs text-[var(--text-color-secondary)]">{comment.createdAt}</span>
                      </div>
                    </div>
                    <p className="text-sm leading-relaxed">{comment.content}</p>
                    <div className="flex items-center gap-6">
                      <div 
                        className={`flex items-center gap-1.5 cursor-pointer text-xs transition-colors ${comment.isLiked ? "text-[var(--primary-color)]" : "text-[var(--text-color-secondary)] hover:text-[var(--primary-color)]"}`}
                        onClick={() => handleCommentLike(comment.id)}
                      >
                        <FiThumbsUp className={comment.isLiked ? "fill-current" : ""} />
                        <span>{comment.likes}</span>
                      </div>
                      <span 
                        className="text-xs text-[var(--text-color-secondary)] cursor-pointer hover:text-[var(--primary-color)]"
                        onClick={() => setReplyingTo({ id: comment.id, name: comment.author.name })}
                      >
                        回复
                      </span>
                    </div>

                    {/* Replies */}
                    {comment.replies && comment.replies.length > 0 && (
                      <div className="mt-4 space-y-4 bg-[var(--bg-color)]/50 p-3 rounded-lg">
                        {comment.replies.map(reply => (
                          <div key={reply.id} className="flex gap-3">
                            <Avatar src={reply.author.avatar} name={reply.author.name.charAt(0)} className="w-6 h-6 shrink-0" />
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-xs">{reply.author.name}</span>
                                {reply.replyTo && (
                                  <span className="text-xs text-[var(--text-color-secondary)]">
                                    回复 <span className="text-[var(--primary-color)]">@{reply.replyTo.name}</span>
                                  </span>
                                )}
                                <span className="text-[10px] text-[var(--text-color-secondary)]">{reply.createdAt}</span>
                              </div>
                              <p className="text-xs leading-relaxed">{reply.content}</p>
                              <div className="flex items-center gap-4">
                                <div 
                                  className={`flex items-center gap-1 cursor-pointer text-[10px] transition-colors ${reply.isLiked ? "text-[var(--primary-color)]" : "text-[var(--text-color-secondary)] hover:text-[var(--primary-color)]"}`}
                                  onClick={() => handleCommentLike(reply.id, true, comment.id)}
                                >
                                  <FiThumbsUp className={reply.isLiked ? "fill-current" : ""} />
                                  <span>{reply.likes}</span>
                                </div>
                                <span 
                                  className="text-[10px] text-[var(--text-color-secondary)] cursor-pointer hover:text-[var(--primary-color)]"
                                  onClick={() => setReplyingTo({ id: reply.id, name: reply.author.name, parentId: comment.id })}
                                >
                                  回复
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-full lg:w-80 space-y-6">
          <div className="lg:sticky lg:top-4 space-y-6">
            {/* Desktop Only: Episodes Section */}
            <div className="hidden lg:block">
              {renderEpisodesList()}
            </div>

            {/* Recommendations Section */}
            {renderRecommendationsList()}
          </div>
        </div>
      </div>
    </div>
  );
}

// ===== 10. TODO任务管理区域 =====
/**
 * 待处理任务清单
 * 1. 优化视频播放器加载体验
 * 2. 增加评论分页加载功能
 * 3. 完善举报及黑名单功能
 */

// ===== 11. 导出区域 =====
export default VideoDetail;
