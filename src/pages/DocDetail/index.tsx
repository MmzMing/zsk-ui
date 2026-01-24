import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button, Avatar, Chip, Textarea, addToast } from "@heroui/react";
import { FiThumbsUp, FiStar, FiShare2, FiMessageSquare, FiBookOpen, FiChevronDown, FiUserPlus, FiX } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { routes } from "../../router/routes";
import { useUserStore } from "../../store";
import { Loading } from "../../components/Loading";
import { 
  fetchDocDetail, 
  toggleDocLike, 
  toggleDocFavorite,
  toggleDocCommentLike,
  fetchDocComments,
  postDocComment,
  type DocDetail,
  type CommentItem
} from "../../api/front/document";
import { toggleFollowUser } from "../../api/front/user";
import { mockDocData, mockDocComments } from "../../api/mock/front/docDetail";

interface TocItem {
  id: string;
  text: string;
  level: number;
  children: TocItem[];
}

// Recursive TOC Item Component
const TocNode = ({ 
  item, 
  activeId, 
  expandedKeys, 
  onToggle, 
  onScrollTo 
}: { 
  item: TocItem; 
  activeId: string; 
  expandedKeys: Set<string>; 
  onToggle: (id: string) => void; 
  onScrollTo: (id: string) => void;
}) => {
  const isExpanded = expandedKeys.has(item.id);
  const isActive = activeId === item.id;
  const hasChildren = item.children.length > 0;

  return (
    <div className="relative" data-toc-id={item.id}>
      <div
        className={`group flex items-center gap-2 py-1.5 px-3 rounded-md transition-all cursor-pointer relative ${
          isActive
            ? "text-[var(--primary-color)] bg-[var(--primary-color)]/[0.08] font-medium"
            : "text-[var(--text-color-secondary)] hover:text-[var(--text-color)] hover:bg-[var(--hover-bg)]"
        }`}
        style={{ paddingLeft: `${(item.level - 1) * 12 + 12}px` }}
        onClick={(e) => {
          e.stopPropagation();
          onScrollTo(item.id);
          
          // If clicking the already active item, or if it has children, toggle it
          if (isActive || hasChildren) {
            onToggle(item.id);
          }
        }}
      >
        {/* Active Indicator Line */}
        {isActive && (
          <motion.div
            layoutId="active-toc-indicator"
            className="absolute left-0 top-0 bottom-0 w-0.5 bg-[var(--primary-color)] rounded-r-sm z-10"
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 35
            }}
          />
        )}

        {/* Expand/Collapse Icon */}
        {hasChildren && (
          <div 
            className="absolute right-2 p-1 rounded-sm hover:bg-[var(--bg-color-hover)] transition-colors z-20"
            onClick={(e) => {
              e.stopPropagation();
              onToggle(item.id);
            }}
          >
            <motion.div
              animate={{ rotate: isExpanded ? 0 : -90 }}
              transition={{ duration: 0.2 }}
            >
              <FiChevronDown className="w-3.5 h-3.5 opacity-60" />
            </motion.div>
          </div>
        )}

        <span className="truncate pr-4">{item.text}</span>
      </div>

      <AnimatePresence>
        {isExpanded && hasChildren && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            {item.children.map(child => (
              <TocNode 
                key={child.id} 
                item={child} 
                activeId={activeId} 
                expandedKeys={expandedKeys}
                onToggle={onToggle}
                onScrollTo={onScrollTo}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

function DocDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { token } = useUserStore();
  const [doc, setDoc] = useState<DocDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [commentText, setCommentText] = useState("");
  const [commentSort, setCommentSort] = useState<"hot" | "new">("hot");
  const [replyingTo, setReplyingTo] = useState<{ id: string; name: string; parentId?: string } | null>(null);
  const [toc, setToc] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set());
  const contentRef = useRef<HTMLDivElement>(null);
  const sidebarScrollRef = useRef<HTMLDivElement>(null);
  const isManualScrolling = useRef(false);

  const checkLogin = () => {
    if (!token) {
      addToast({ title: "请先登录", color: "warning" });
      return false;
    }
    return true;
  };

  const handleLike = async () => {
    if (!checkLogin() || !doc) return;
    const newIsLiked = !doc.stats.isLiked;
    const newCount = doc.stats.likes + (newIsLiked ? 1 : -1);
    
    try { 
      await toggleDocLike(doc.id); 
      // Update UI after success
      setDoc(prev => prev ? { ...prev, stats: { ...prev.stats, isLiked: newIsLiked, likes: newCount } } : null);
      
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
    if (!checkLogin() || !doc) return;
    const newIsFavorited = !doc.stats.isFavorited;
    const newCount = doc.stats.favorites + (newIsFavorited ? 1 : -1);
    
    try { 
      await toggleDocFavorite(doc.id); 
      // Update UI after success
      setDoc(prev => prev ? { ...prev, stats: { ...prev.stats, isFavorited: newIsFavorited, favorites: newCount } } : null);
      
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
      await toggleDocCommentLike(commentId);
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
    if (!checkLogin() || !doc) return;
    
    const newIsFollowing = !doc.author.isFollowing;
    
    try { 
      await toggleFollowUser(doc.author.id); 
      // Update UI after success
      setDoc(prev => prev ? { 
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
        docId: id!,
        content: commentText.trim(),
        parentId: replyingTo?.parentId || replyingTo?.id,
        replyToId: replyingTo?.id
      };

      const newComment = await postDocComment(data);

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
      fetchDocDetail(id)
        .then((res) => {
          // 如果返回 200 但数据为空，或者根据用户要求回退到 mock
          if (!res || !res.id) {
            setDoc(mockDocData);
          } else {
            setDoc(res);
          }

          // 获取评论列表
          fetchDocComments(id, { page: 1, pageSize: 20 })
            .then(commentsRes => {
              if (!commentsRes || !commentsRes.list || commentsRes.list.length === 0) {
                setComments(mockDocComments);
              } else {
                setComments(commentsRes.list);
              }
            })
            .catch(err => {
              console.error("Fetch doc comments failed, using mock:", err);
              setComments(mockDocComments);
            });
        })
        .catch((err) => {
          console.error("Failed to fetch doc detail, using mock:", err);
          setDoc(mockDocData);
          setComments(mockDocComments);
        })
        .finally(() => setLoading(false));
    }
  }, [id]);

  // Generate Tree TOC
  useEffect(() => {
    if (!doc || !contentRef.current) return;

    const headers = contentRef.current.querySelectorAll("h1, h2, h3, h4, h5");
    const root: TocItem[] = [];
    const stack: TocItem[] = [];

    headers.forEach((header, index) => {
      if (!header.id) {
        header.id = `heading-${index}`;
      }
      header.classList.add("scroll-mt-24");

      const newItem: TocItem = {
        id: header.id,
        text: header.textContent || "",
        level: parseInt(header.tagName.substring(1)),
        children: []
      };

      while (stack.length > 0 && stack[stack.length - 1].level >= newItem.level) {
        stack.pop();
      }

      if (stack.length === 0) {
        root.push(newItem);
      } else {
        stack[stack.length - 1].children.push(newItem);
      }
      stack.push(newItem);
    });

    const timer = setTimeout(() => {
      setToc(root);
      
      const initialExpanded = new Set<string>();
      root.forEach(item => initialExpanded.add(item.id));
      setExpandedKeys(initialExpanded);
  
      if (root.length > 0) {
        setActiveId(prev => prev || root[0].id);
      }
    }, 0);

    return () => clearTimeout(timer);
  }, [doc]);

  // Build a map of id -> parentId for quick lookup
  const parentMap = useMemo(() => {
    const map = new Map<string, string>();
    const traverse = (items: TocItem[], parentId: string | null) => {
      items.forEach(item => {
        if (parentId) map.set(item.id, parentId);
        traverse(item.children, item.id);
      });
    };
    traverse(toc, null);
    return map;
  }, [toc]);

  const targetScrollPos = useRef<number | null>(null);

  // Handle manual scroll flag cleanup
  useEffect(() => {
    const handleScrollCheck = () => {
      if (isManualScrolling.current && targetScrollPos.current !== null) {
        const currentScroll = window.scrollY;
        // If we are within 5px of target, or if we stopped scrolling
        if (Math.abs(currentScroll - targetScrollPos.current) < 5) {
          isManualScrolling.current = false;
          targetScrollPos.current = null;
        }
      }
    };

    const handleScrollEnd = () => {
      if (isManualScrolling.current) {
        isManualScrolling.current = false;
        targetScrollPos.current = null;
      }
    };

    window.addEventListener('scroll', handleScrollCheck, { passive: true });
    window.addEventListener('scrollend', handleScrollEnd);
    return () => {
      window.removeEventListener('scroll', handleScrollCheck);
      window.removeEventListener('scrollend', handleScrollEnd);
    };
  }, []);

  const handleScroll = useCallback(() => {
    // If we are manually scrolling, or very close to target, don't update anything
    if (isManualScrolling.current) {
      if (targetScrollPos.current !== null) {
        const diff = Math.abs(window.scrollY - targetScrollPos.current);
        if (diff > 10) return; // Still scrolling to target
      } else {
        return;
      }
    }

    if (!contentRef.current) return;

    const headers = Array.from(contentRef.current.querySelectorAll("h1, h2, h3, h4, h5"));
    if (headers.length === 0) return;

    const scrollY = window.scrollY;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    
    let currentId = activeId;

    if (scrollY < 100) {
      currentId = headers[0].id;
    } else if (scrollY + windowHeight >= documentHeight - 100) {
      currentId = headers[headers.length - 1].id;
    } else {
      for (let i = headers.length - 1; i >= 0; i--) {
        const header = headers[i];
        const element = document.getElementById(header.id);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 120) {
            currentId = header.id;
            break;
          }
        }
      }
    }

    if (currentId !== activeId) {
      setActiveId(currentId);
      const newExpanded = new Set(expandedKeys);
      let tempId = currentId;
      while (parentMap.has(tempId)) {
        const parentId = parentMap.get(tempId)!;
        newExpanded.add(parentId);
        tempId = parentId;
      }
      newExpanded.add(currentId);
      
      const ancestors = new Set<string>();
      let curr = currentId;
      while (parentMap.has(curr)) {
        const parentId = parentMap.get(curr)!;
        ancestors.add(parentId);
        curr = parentId;
      }
      
      newExpanded.forEach(k => {
        if (!ancestors.has(k) && k !== currentId && parentMap.has(k)) {
          newExpanded.delete(k);
        }
      });
      setExpandedKeys(newExpanded);
    }
  }, [activeId, expandedKeys, parentMap]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // Sync Sidebar Scroll with Active Item
  useEffect(() => {
    if (!activeId || !sidebarScrollRef.current) return;

    const scrollSidebar = () => {
      const activeItem = sidebarScrollRef.current?.querySelector(`[data-toc-id="${activeId}"]`);
      if (activeItem) {
        const container = sidebarScrollRef.current!;
        const containerRect = container.getBoundingClientRect();
        const itemRect = activeItem.getBoundingClientRect();
        
        const isVisible = (
          itemRect.top >= containerRect.top + 40 && 
          itemRect.bottom <= containerRect.bottom - 40
        );

        if (!isVisible) {
          const itemOffsetTop = (activeItem as HTMLElement).offsetTop;
          const containerHeight = container.clientHeight;
          
          container.scrollTo({
            top: itemOffsetTop - containerHeight / 2,
            behavior: "smooth"
          });
        }
      }
    };

    const timer = setTimeout(scrollSidebar, 150);
    return () => clearTimeout(timer);
  }, [activeId]);

  const toggleExpand = (id: string) => {
    setExpandedKeys(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
        // Also ensure parents are expanded
        let current = parentMap.get(id);
        while (current) {
          newSet.add(current);
          current = parentMap.get(current);
        }
      }
      return newSet;
    });
  };

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (!element) return;

    isManualScrolling.current = true;
    setActiveId(id);

    const headerOffset = 100;
    const elementPosition = element.getBoundingClientRect().top + window.scrollY;
    const offsetPosition = Math.max(0, elementPosition - headerOffset);
    
    targetScrollPos.current = offsetPosition;

    window.scrollTo({
      top: offsetPosition,
      behavior: "smooth"
    });

    // Fallback: reset manual scroll flag after a delay if scrollend/scroll events fail
    setTimeout(() => {
      if (isManualScrolling.current && targetScrollPos.current === offsetPosition) {
        isManualScrolling.current = false;
        targetScrollPos.current = null;
      }
    }, 3000);
  };

  if (loading) {
    return <Loading height="calc(100vh - 200px)" />;
  }

  if (!doc) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-200px)] text-[var(--text-color-secondary)]">
        文档未找到
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col lg:flex-row gap-8 relative">
        {/* Left Content (75%) */}
        <div className="lg:w-3/4 space-y-8 min-w-0">
          {/* Header */}
          <div className="space-y-4 border-b border-[var(--border-color)] pb-6">
            <div className="flex items-center gap-2 mb-2">
              <Chip size="sm" color="primary" variant="flat">
                {doc.category}
              </Chip>
              <span className="text-xs text-[var(--text-color-secondary)]">
                {doc.date}
              </span>
            </div>
            <h1 className="text-2xl md:text-4xl font-bold leading-tight">
              {doc.title}
            </h1>

            <div className="flex items-center justify-between pt-2">
              <div 
                className="flex items-center gap-3 cursor-pointer group"
                onClick={() => navigate(routes.userDetail.replace(":id", doc.author.id))}
              >
                <Avatar
                  src={doc.author.avatar}
                  name={doc.author.name.charAt(0)}
                  className="transition-transform group-hover:scale-105"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <div className="font-semibold text-sm group-hover:text-[var(--primary-color)] transition-colors">{doc.author.name}</div>
                    <Button
                      size="sm"
                      variant={doc.author.isFollowing ? "flat" : "solid"}
                      color="primary"
                      className={`h-6 min-w-16 px-2 text-xs ${doc.author.isFollowing ? "bg-[var(--bg-elevated)] text-[var(--text-color-secondary)]" : ""}`}
                      startContent={!doc.author.isFollowing && <FiUserPlus />}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFollow();
                      }}
                    >
                      {doc.author.isFollowing ? "已关注" : "关注"}
                    </Button>
                  </div>
                  <div className="text-xs text-[var(--text-color-secondary)] mt-0.5">
                    阅读 {doc.stats.views} · 粉丝 {doc.author.fans}
                  </div>
                </div>
              </div>
              <div className="flex gap-6 items-center">
                <div 
                  className={`flex items-center gap-1.5 cursor-pointer transition-colors ${doc.stats.isLiked ? "text-[var(--primary-color)]" : "hover:text-[var(--primary-color)]"}`}
                  onClick={handleLike}
                >
                  <FiThumbsUp className={`text-lg ${doc.stats.isLiked ? "fill-current" : ""}`} />
                  <span className="text-sm font-medium">{doc.stats.likes}</span>
                </div>
                <div 
                  className={`flex items-center gap-1.5 cursor-pointer transition-colors ${doc.stats.isFavorited ? "text-[var(--primary-color)]" : "hover:text-[var(--primary-color)]"}`}
                  onClick={handleFavorite}
                >
                  <FiStar className={`text-lg ${doc.stats.isFavorited ? "fill-current" : ""}`} />
                  <span className="text-sm font-medium">{doc.stats.favorites}</span>
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

          {/* Content (Prose) */}
          <div 
            ref={contentRef}
            className="prose prose-sm md:prose-base dark:prose-invert max-w-none text-[var(--text-color)]"
            dangerouslySetInnerHTML={{ __html: doc.content }}
          />

          {/* Actions - Removed as moved to header */}

          {/* Comments */}
          <div className="space-y-6 pt-6 border-t border-[var(--border-color)]">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <FiMessageSquare />
                评论区 ({comments.length})
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
        </div>

        {/* Right Sidebar (25%) */}
        <div className="hidden lg:block lg:w-1/4 relative">
          <div className="sticky top-24 space-y-6">
            {/* CSDN Style TOC with Accordion */}
            <div className="bg-[var(--bg-elevated)]/50 backdrop-blur-sm rounded-xl p-2">
              <div className="flex items-center gap-2 mb-2 font-bold text-sm px-2 py-2 border-b border-[var(--border-color)]/50">
                <FiBookOpen /> 目录
              </div>
              
              <div 
                ref={sidebarScrollRef}
                className="relative max-h-[calc(100vh-200px)] overflow-y-auto pr-2 custom-scrollbar"
              >
                {toc.length > 0 ? (
                  <div className="flex flex-col">
                    {toc.map((item) => (
                      <TocNode 
                        key={item.id} 
                        item={item} 
                        activeId={activeId} 
                        expandedKeys={expandedKeys}
                        onToggle={toggleExpand}
                        onScrollTo={scrollToHeading}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-[var(--text-color-secondary)] p-4 text-center">
                    暂无目录
                  </div>
                )}
              </div>
            </div>

            {/* Recommendations */}
            <div className="pl-2">
              <h3 className="text-base font-bold mb-4 px-2">相关阅读</h3>
              <div className="space-y-2">
                {doc.recommendations.map(item => (
                  <div
                    key={item.id}
                    className="group cursor-pointer p-2 rounded-lg hover:bg-[var(--bg-elevated)] transition-colors"
                    onClick={() =>
                      navigate(routes.docDetail.replace(":id", item.id))
                    }
                  >
                    <div className="text-sm font-medium line-clamp-2 group-hover:text-[#7E0DF5] transition-colors">
                      {item.title}
                    </div>
                    <div className="mt-1 text-xs text-[var(--text-color-secondary)]">
                      {item.views} 阅读
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DocDetail;
