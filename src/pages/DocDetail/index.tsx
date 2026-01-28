// ===== 1. 依赖导入区域 =====
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
  type DocDetail as DocDetailType,
  type CommentItem,
  type TocItem
} from "../../api/front/document";
import { toggleFollowUser } from "../../api/front/user";
// ===== 2. TODO待处理导入区域 =====

// ===== 3. 状态控制逻辑区域 =====

// ===== 4. 通用工具函数区域 =====

// ===== 5. 注释代码函数区 =====

// ===== 6. 错误处理函数区域 =====


// ===== 7. 数据处理函数区域 =====
/**
 * 递归构建目录树
 * @param headers 标题元素数组
 * @returns 目录树结构
 */
const getTocTree = (headers: NodeListOf<Element>): TocItem[] => {
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

  return root;
};

// ===== 8. UI渲染逻辑区域 =====
/**
 * 递归目录项组件
 */
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
          if (isActive || hasChildren) {
            onToggle(item.id);
          }
        }}
      >
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

// ===== 9. 页面初始化与事件绑定 =====
/**
 * 文档详情页面组件
 */
function DocDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { token } = useUserStore();
  
  // 状态变量
  const [doc, setDoc] = useState<DocDetailType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [commentText, setCommentText] = useState("");
  const [commentSort, setCommentSort] = useState<"hot" | "new">("hot");
  const [replyingTo, setReplyingTo] = useState<{ id: string; name: string; parentId?: string } | null>(null);
  const [tocList, setTocList] = useState<TocItem[]>([]);
  const [activeTocId, setActiveTocId] = useState<string>("");
  const [expandedTocKeys, setExpandedTocKeys] = useState<Set<string>>(new Set());
  
  // 引用变量
  const contentRef = useRef<HTMLDivElement>(null);
  const sidebarScrollRef = useRef<HTMLDivElement>(null);
  const isManualScrolling = useRef(false);
  const targetScrollPos = useRef<number | null>(null);

  /**
   * 检查登录状态
   * @returns 是否已登录
   */
  const handleCheckLogin = useCallback(() => {
    if (!token) {
      addToast({ title: "请先登录", color: "warning" });
      return false;
    }
    return true;
  }, [token]);

  /**
   * 处理关注
   */
  const handleFollow = useCallback(async () => {
    if (!handleCheckLogin() || !doc) return;
    const isFollowing = !doc.author.isFollowing;
    
    await toggleFollowUser(doc.author.id);

    setDoc(prev => prev ? { 
      ...prev, 
      author: { ...prev.author, isFollowing } 
    } : null);

    addToast({ 
      title: isFollowing ? "关注成功" : "已取消关注", 
      color: isFollowing ? "success" : "warning" 
    });
  }, [doc, handleCheckLogin]);

  /**
   * 处理点赞
   */
  const handleLike = useCallback(async () => {
    if (!handleCheckLogin() || !doc) return;
    const isLiked = !doc.stats.isLiked;
    const likesCount = doc.stats.likes + (isLiked ? 1 : -1);
    
    await toggleDocLike(doc.id);

    setDoc(prev => prev ? { ...prev, stats: { ...prev.stats, isLiked, likes: likesCount } } : null);
    addToast({ 
      title: isLiked ? "点赞成功" : "取消点赞", 
      color: isLiked ? "success" : "warning" 
    });
  }, [doc, handleCheckLogin]);

  /**
   * 处理收藏
   */
  const handleFavorite = useCallback(async () => {
    if (!handleCheckLogin() || !doc) return;
    const isFavorited = !doc.stats.isFavorited;
    const favoritesCount = doc.stats.favorites + (isFavorited ? 1 : -1);
    
    await toggleDocFavorite(doc.id);

    setDoc(prev => prev ? { ...prev, stats: { ...prev.stats, isFavorited, favorites: favoritesCount } } : null);
    addToast({ 
      title: isFavorited ? "收藏成功" : "取消收藏", 
      color: isFavorited ? "success" : "warning" 
    });
  }, [doc, handleCheckLogin]);

  /**
   * 处理评论点赞
   * @param commentId 评论ID
   * @param isReply 是否为回复
   * @param parentId 父级评论ID
   */
  const handleCommentLike = useCallback(async (commentId: string, isReply = false, parentId?: string) => {
    if (!handleCheckLogin()) return;

    await toggleDocCommentLike(commentId);

    setComments(prev => prev.map(c => {
      if (c.id === (isReply ? parentId : commentId)) {
        if (isReply) {
          return {
            ...c,
            replies: c.replies?.map(r => {
              if (r.id === commentId) {
                const isLiked = !r.isLiked;
                return { ...r, isLiked, likes: r.likes + (isLiked ? 1 : -1) };
              }
              return r;
            })
          };
        }
        const isLiked = !c.isLiked;
        return { ...c, isLiked, likes: c.likes + (isLiked ? 1 : -1) };
      }
      return c;
    }));
    
    addToast({ title: "点赞成功", color: "success" });
  }, [handleCheckLogin]);

  /**
   * 处理分享
   */
  const handleShare = useCallback(() => {
    navigator.clipboard.writeText(window.location.href);
    addToast({ title: "链接已复制", color: "success" });
  }, []);

  /**
   * 处理评论提交
   */
  const handleCommentSubmit = useCallback(async () => {
    if (!handleCheckLogin()) return;
    if (!commentText.trim()) {
      addToast({ title: "评论内容不能为空", color: "warning" });
      return;
    }

    const result = await postDocComment({
      docId: id!,
      content: commentText.trim(),
      parentId: replyingTo?.parentId || replyingTo?.id,
      replyToId: replyingTo?.id
    });

    if (result) {
      if (replyingTo?.parentId) {
        setComments(prev => prev.map(c => c.id === replyingTo.parentId ? { ...c, replies: [...(c.replies || []), result] } : c));
      } else if (replyingTo) {
        setComments(prev => prev.map(c => c.id === replyingTo.id ? { ...c, replies: [...(c.replies || []), result] } : c));
      } else {
        setComments(prev => [result, ...prev]);
      }
      
      setCommentText("");
      setReplyingTo(null);
      addToast({ title: "评论发布成功", color: "success" });
    }
  }, [id, commentText, replyingTo, handleCheckLogin]);

  /**
   * 滚动到指定锚点
   * @param id 锚点ID
   */
  const handleScrollToHeading = useCallback((id: string) => {
    const element = document.getElementById(id);
    if (!element) return;

    isManualScrolling.current = true;
    setActiveTocId(id);

    const headerOffset = 100;
    const elementPosition = element.getBoundingClientRect().top + window.scrollY;
    const offsetPosition = Math.max(0, elementPosition - headerOffset);
    
    targetScrollPos.current = offsetPosition;

    window.scrollTo({
      top: offsetPosition,
      behavior: "smooth"
    });

    setTimeout(() => {
      if (isManualScrolling.current && targetScrollPos.current === offsetPosition) {
        isManualScrolling.current = false;
        targetScrollPos.current = null;
      }
    }, 3000);
  }, []);

  // 数据映射
  const parentMap = useMemo(() => {
    const map = new Map<string, string>();
    const traverse = (items: TocItem[], pId: string | null) => {
      items.forEach(item => {
        if (pId) map.set(item.id, pId);
        traverse(item.children, item.id);
      });
    };
    traverse(tocList, null);
    return map;
  }, [tocList]);

  /**
   * 切换目录展开状态
   * @param tocId 目录ID
   */
  const handleToggleExpand = useCallback((tocId: string) => {
    setExpandedTocKeys(prev => {
      const newSet = new Set(prev);
      if (newSet.has(tocId)) {
        newSet.delete(tocId);
      } else {
        newSet.add(tocId);
        let current = parentMap.get(tocId);
        while (current) {
          newSet.add(current);
          current = parentMap.get(current);
        }
      }
      return newSet;
    });
  }, [parentMap]);

  // 获取文档详情及评论
  const handleFetchInitData = useCallback(async (getIgnore: () => boolean) => {
    if (!id) return;
      const docResult = await fetchDocDetail(id, setIsLoading);
      if (getIgnore()) return;
      if (docResult) setDoc(docResult);

      const commentsResult = await fetchDocComments(id, { page: 1, pageSize: 20 });
      if (getIgnore()) return;
      if (commentsResult?.list) setComments(commentsResult.list);
  }, [id]);

  useEffect(() => {
    let ignore = false;
    const timer = setTimeout(() => {
      setIsLoading(true);
      handleFetchInitData(() => ignore);
    }, 0);
    return () => {
      ignore = true;
      clearTimeout(timer);
    };
  }, [handleFetchInitData]);

  // 生成目录树
  useEffect(() => {
    if (!doc || !contentRef.current) return;

    const headers = contentRef.current.querySelectorAll("h1, h2, h3, h4, h5");
    const root = getTocTree(headers);

    const timer = setTimeout(() => {
      setTocList(root);
      const initialExpanded = new Set<string>();
      root.forEach(item => initialExpanded.add(item.id));
      setExpandedTocKeys(initialExpanded);
      if (root.length > 0) {
        setActiveTocId(prev => prev || root[0].id);
      }
    }, 0);

    return () => clearTimeout(timer);
  }, [doc]);

  // 滚动监听处理
  const handleScroll = useCallback(() => {
    if (isManualScrolling.current) {
      if (targetScrollPos.current !== null) {
        const diff = Math.abs(window.scrollY - targetScrollPos.current);
        if (diff > 10) return;
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
    
    let currentId = activeTocId;

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

    if (currentId !== activeTocId) {
      setActiveTocId(currentId);
      const newExpanded = new Set(expandedTocKeys);
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
      setExpandedTocKeys(newExpanded);
    }
  }, [activeTocId, expandedTocKeys, parentMap]);

  // 绑定滚动事件
  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // 侧边栏同步滚动
  useEffect(() => {
    if (!activeTocId || !sidebarScrollRef.current) return;

    const handleSidebarSync = () => {
      const activeItem = sidebarScrollRef.current?.querySelector(`[data-toc-id="${activeTocId}"]`);
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

    const timer = setTimeout(handleSidebarSync, 150);
    return () => clearTimeout(timer);
  }, [activeTocId]);

  // 渲染逻辑
  if (isLoading) {
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
        {/* 左侧内容区 (80%) */}
        <div className="lg:w-4/5 min-w-0" style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
          <div className="bg-[var(--bg-elevated)]/50 backdrop-blur-sm rounded-xl p-6 md:p-10 space-y-8">
            {/* 文档头部 */}
            <div className="space-y-6 border-b border-[var(--border-color)] pb-8">
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

            <div className="flex items-center justify-between pt-2 overflow-x-auto scrollbar-hide">
              <div 
                className="flex items-center gap-3 cursor-pointer group shrink-0"
                onClick={() => window.open(routes.userDetail.replace(":id", doc.author.id), "_blank")}
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
              <div className="flex gap-6 items-center shrink-0 ml-4">
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

          {/* 正文内容 */}
          <div 
            ref={contentRef}
            className="prose prose-sm md:prose-base dark:prose-invert max-w-none text-[var(--text-color)] leading-loose tracking-wide"
            dangerouslySetInnerHTML={{ __html: doc.content }}
          />

          {/* 评论区 */}
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

            {/* 评论输入框 */}
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

            {/* 评论列表 */}
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
                    
                    {/* 评论操作 */}
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
                          if (!handleCheckLogin()) return;
                          setReplyingTo({ id: comment.id, name: comment.author.name });
                        }}
                      >
                        回复
                      </div>
                    </div>

                    {/* 回复列表 */}
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
                                    if (!handleCheckLogin()) return;
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
        </div>

        {/* 右侧侧边栏 (20%) */}
        <div className="hidden lg:block lg:w-1/5 relative">
          <div className="sticky top-24 space-y-6">
            {/* 目录 */}
            <div className="bg-[var(--bg-elevated)]/50 backdrop-blur-sm rounded-xl p-2">
              <div className="flex items-center gap-2 mb-2 font-bold text-sm px-2 py-2 border-b border-[var(--border-color)]/50">
                <FiBookOpen /> 目录
              </div>
              
              <div 
                ref={sidebarScrollRef}
                className="relative max-h-[calc(100vh-200px)] overflow-y-auto pr-2 custom-scrollbar"
              >
                {tocList.length > 0 ? (
                  <div className="flex flex-col">
                    {tocList.map((item) => (
                      <TocNode 
                        key={item.id} 
                        item={item} 
                        activeId={activeTocId} 
                        expandedKeys={expandedTocKeys}
                        onToggle={handleToggleExpand}
                        onScrollTo={handleScrollToHeading}
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

            {/* 相关推荐 */}
            <div className="bg-[var(--bg-elevated)] rounded-xl border border-[var(--border-color)] p-4 space-y-4">
              <div className="flex items-center gap-2 font-bold text-sm px-1">
                相关阅读
              </div>
              <div className="space-y-2">
                {doc.recommendations.map(item => (
                  <div
                    key={item.id}
                    className="group cursor-pointer p-2 rounded-lg hover:bg-[var(--bg-color)] transition-colors"
                    onClick={() =>
                      window.open(routes.docDetail.replace(":id", item.id), "_blank")
                    }
                  >
                    <div className="text-sm font-medium line-clamp-2 group-hover:text-[var(--primary-color)] transition-colors">
                      {item.title}
                    </div>
                    <div className="mt-1 text-xs text-[var(--text-color-secondary)] opacity-60">
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

// ===== 10. TODO任务管理区域 =====

// ===== 11. 导出区域 =====
export default DocDetail;
