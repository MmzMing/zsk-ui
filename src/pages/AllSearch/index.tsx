// ===== 1. 依赖导入区域 =====
import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Button,
  Tab,
  Pagination,
  Card,
  CardBody,
  Image,
} from "@heroui/react";
import { FiPlay, FiEye, FiUsers, FiFileText, FiMessageSquare } from "react-icons/fi";

import { AdminTabs } from "@/components/Admin/AdminTabs";
import { routes } from "../../router/routes";
import Shuffle from "../../components/Motion/Shuffle";
import TextType from "../../components/Motion/TextType";
import { EmptyState } from "../../components/EmptyState";

import {
  type SearchCategory,
  type SearchSortKey as SortKey,
  type SearchResult,
  searchAll,
} from "../../api/front/search";

// ===== 2. TODO待处理导入区域 =====

// ===== 3. 状态控制逻辑区域 =====
const categories: {
  key: SearchCategory;
  label: string;
}[] = [
  { key: "all", label: "综合" },
  { key: "video", label: "视频" },
  { key: "document", label: "文档" },
  { key: "tool", label: "百宝袋" },
  { key: "user", label: "用户" },
];

const sortOptionsByType: Record<
  SearchCategory,
  {
    key: SortKey;
    label: string;
  }[]
> = {
  all: [
    { key: "hot", label: "综合推荐" },
    { key: "latest", label: "最新发布" },
    { key: "like", label: "点赞优先" },
  ],
  video: [
    { key: "hot", label: "热门" },
    { key: "latest", label: "最新" },
    { key: "like", label: "点赞" },
  ],
  document: [
    { key: "hot", label: "热门" },
    { key: "latest", label: "最新" },
    { key: "like", label: "点赞" },
  ],
  tool: [
    { key: "hot", label: "热门" },
    { key: "usage", label: "使用量" },
    { key: "like", label: "收藏" },
  ],
  user: [
    { key: "relevance", label: "相关度" },
    { key: "fans", label: "粉丝量" },
    { key: "active", label: "活跃度" },
  ],
};

const durationFilters = [
  { value: "lt10", label: "10 分钟以下" },
  { value: "10_30", label: "10 - 30 分钟" },
  { value: "30_60", label: "30 - 60 分钟" },
  { value: "gt60", label: "60 分钟以上" },
];

const videoCategoryFilters = ["代码", "前端", "React", "算法", "其他"];

const documentCategoryFilters = ["设计稿", "需求文档", "使用手册", "随笔", "其他"];

const toolboxCategoryFilters = ["实用工具", "模板素材", "学习资料", "插件应用"];

const userTypeFilters = ["普通用户", "创作者", "官方账号", "机构账号"];

const timeRangeOptions = [
  { value: "7d", label: "一周内" },
  { value: "1m", label: "一月内" },
  { value: "1y", label: "一年内" },
];

// ===== 4. 通用工具函数区域 =====

// ===== 5. 注释代码函数区 =====

// ===== 6. 错误处理函数区域 =====

// ===== 7. 数据处理函数区域 =====

// ===== 8. UI渲染逻辑区域 =====

// ===== 9. 页面初始化与事件绑定 =====
function AllSearchPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [keyword, setKeyword] = React.useState("");
  const [appliedKeyword, setAppliedKeyword] = React.useState("");
  const [activeType, setActiveType] =
    React.useState<SearchCategory>("all");
  const [activeSort, setActiveSort] = React.useState<SortKey>("hot");
  const [duration, setDuration] = React.useState<string | null>(null);
  const [timeRange, setTimeRange] = React.useState<string | null>(null);
  const [activeCategory, setActiveCategory] = React.useState<string | null>(null);
  const [advancedOpen, setAdvancedOpen] = React.useState(true);

  const [results, setResults] = React.useState<SearchResult[]>([]);
  const [page, setPage] = React.useState(1);
  const [total, setTotal] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(false);

  const PAGE_SIZE = 16;

  /**
   * 加载搜索结果数据
   * @param signal 用于判断请求是否已被忽略
   */
  const loadResults = React.useCallback(async (checkIgnore: () => boolean) => {
    const currentSearchParams = {
      keyword: appliedKeyword || undefined,
      type: activeType,
      sort: activeSort,
      duration,
      timeRange,
      category: activeCategory,
      page,
      pageSize: PAGE_SIZE,
    };

    // 确保在请求真正开始前设为 loading
    setIsLoading(true);

    try {
      // 不直接传递 setIsLoading 给 searchAll，避免它在 handleApiCall 的 finally 中过早关闭 loading
      const data = await searchAll(currentSearchParams);
      
      // 如果请求已被忽略，则不更新状态
      if (checkIgnore()) return;

      let list: SearchResult[] = [];
      let totalCount = 0;

      if (Array.isArray(data)) {
        list = data;
        totalCount = data.length;
      } else if (data && Array.isArray(data.list)) {
        list = data.list;
        totalCount = data.total || 0;
      }

      setResults(list);
      setTotal(totalCount);
    } catch {
      if (checkIgnore()) return;
      setResults([]);
      setTotal(0);
    } finally {
      // 只有在非忽略的情况下才关闭 loading
      if (!checkIgnore()) {
        setIsLoading(false);
      }
    }
  }, [
    appliedKeyword,
    activeType,
    activeSort,
    duration,
    timeRange,
    activeCategory,
    page,
  ]);

  // 初始化与参数变化加载
  React.useEffect(() => {
    let ignore = false;
    
    // 切换分类或搜索词时，立即进入加载状态并清空当前结果，避免展示过时数据（类似B站体验）
    setIsLoading(true);
    setResults([]);
    
    const timer = setTimeout(() => {
      loadResults(() => ignore);
    }, 0);

    return () => {
      ignore = true;
      clearTimeout(timer);
    };
  }, [loadResults]);

  // Reset page when filters change
  React.useEffect(() => {
    setPage(1);
  }, [
    appliedKeyword,
    activeType,
    activeSort,
    duration,
    timeRange,
    activeCategory,
  ]);

  React.useEffect(() => {
    const type = searchParams.get("type");
    if (
      type === "all" ||
      type === "video" ||
      type === "document" ||
      type === "tool" ||
      type === "user"
    ) {
      setActiveType(type);
    }
  }, [searchParams]);

  function handleResultClick(item: SearchResult) {
    if (item.type === "video") {
      window.open(routes.videoDetail.replace(":id", item.id), "_blank");
      return;
    }
    if (item.type === "document") {
      window.open(routes.docDetail.replace(":id", item.id), "_blank");
      return;
    }
    if (item.type === "tool") {
      window.open(routes.toolboxDetail.replace(":id", item.id), "_blank");
      return;
    }
    if (item.type === "user") {
      window.open(routes.userDetail.replace(":id", item.id), "_blank");
      return;
    }
  }

  const currentSortOptions = sortOptionsByType[activeType];

  const currentCategoryFilters = React.useMemo(() => {
    if (activeType === "all") {
      // 综合搜索：合并视频和文档的分类并去重，确保“其他”在最后
      const combined = [...videoCategoryFilters, ...documentCategoryFilters];
      const unique = Array.from(new Set(combined));
      const others = unique.filter((item) => item === "其他");
      const withoutOthers = unique.filter((item) => item !== "其他");
      return [...withoutOthers, ...others];
    }
    if (activeType === "video") {
      return videoCategoryFilters;
    }
    if (activeType === "document") {
      return documentCategoryFilters;
    }
    if (activeType === "tool") {
      return toolboxCategoryFilters;
    }
    if (activeType === "user") {
      return userTypeFilters;
    }
    return [];
  }, [activeType]);

  return (
    <div className="space-y-6 min-h-screen">
      <header className="space-y-3">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <Shuffle
              text="全站知识检索"
              tag="h1"
              className="text-xl md:text-2xl font-semibold tracking-tight"
              triggerOnHover={false}
              loop={true}
              loopDelay={4000}
            />
            <TextType
              text="支持视频与文档内容的综合搜索，排序交给后端， 前端专注于清晰地展示结果。"
              asElement="p"
              className="text-xs md:text-sm text-[var(--text-color-secondary)]"
              typingSpeed={100}
              showCursor={true}
              loop={false}
              hideCursorOnComplete={true}
            />
          </div>
        </div>
      </header>

      <section className="space-y-3">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <div className="relative flex-1">
            <input
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  setAppliedKeyword(keyword.trim());
                }
              }}
              placeholder="输入关键词，按下回车开始搜索"
              className="w-full rounded-full border border-[var(--border-color)] bg-[var(--bg-elevated)] px-4 py-2 text-sm outline-none focus-visible:border-[var(--primary-color)]"
            />
          </div>
          <Button
            type="button"
            className="inline-flex items-center justify-center rounded-full border border-[var(--border-color)] bg-[var(--bg-elevated)] px-8 py-2 text-xs md:text-sm font-medium text-[var(--text-color)] hover:border-[var(--primary-color)] hover:text-[var(--primary-color)] transition-all shadow-sm"
            onPress={() => setAppliedKeyword(keyword.trim())}
          >
            综合搜索
          </Button>
        </div>
        <div className="border-b border-[var(--border-color)]">
          <AdminTabs
            aria-label="搜索分类"
            variant="underlined"
            radius="none"
            selectedKey={activeType}
            onSelectionChange={(key) => {
              const type = key as SearchCategory;
              setActiveType(type);

              // 重置筛选和排序条件为默认（第一个）
              const categorySortOptions = sortOptionsByType[type];
              if (categorySortOptions && categorySortOptions.length > 0) {
                setActiveSort(categorySortOptions[0].key);
              }
              setDuration(null);
              setTimeRange(null);
              setActiveCategory(null);

              const next = new URLSearchParams(searchParams);
              if (type === "all") {
                next.delete("type");
              } else {
                next.set("type", type);
              }
              setSearchParams(next);
            }}
            classNames={{
              tabList: "p-0 gap-10 border-none",
              tab: "h-11 px-0 min-w-0 text-lg",
              cursor: "h-[2px] w-full bg-[var(--primary-color)]",
              tabContent:
                "group-data-[selected=true]:text-[var(--primary-color)] font-medium",
            }}
          >
            {categories.map((item) => (
              <Tab key={item.key} title={item.label} />
            ))}
          </AdminTabs>
        </div>
      </section>

      <section className="space-y-4 pb-3">
        <div className="flex flex-col">
          <div className="flex flex-col gap-3 text-xs md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex flex-wrap gap-2">
                {currentSortOptions.map((option) => {
                  const isActive = option.key === activeSort;
                  return (
                    <Button
                      key={option.key}
                      type="button"
                      className={
                        "rounded-full border px-3 py-1 text-xs bg-transparent shadow-none hover:shadow-none " +
                        (isActive
                          ? "border-[var(--primary-color)] bg-[color-mix(in_srgb,var(--primary-color)_12%,transparent)] text-[var(--primary-color)]"
                          : "border-transparent text-[var(--text-color-secondary)] hover:text-[var(--primary-color)]")
                      }
                      size="sm"
                      variant={isActive ? "solid" : "bordered"}
                      onPress={() => setActiveSort(option.key)}
                    >
                      {option.label}
                    </Button>
                  );
                })}
              </div>
            </div>
            <motion.button
              type="button"
              className="inline-flex min-h-[34px] items-center justify-center rounded-full border border-[var(--border-color)] bg-[var(--bg-elevated)] px-3 py-2 text-xs text-[var(--text-color)] md:px-4 shadow-sm group"
              onClick={() => setAdvancedOpen((open) => !open)}
              whileHover={{
                scale: 1.02,
                borderColor: "var(--primary-color)",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
              }}
              whileTap={{ scale: 0.95 }}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 25,
              }}
            >
              <span className="mr-1 font-medium group-hover:text-[var(--primary-color)] transition-colors">
                更多筛选
              </span>
              <span className="flex items-center gap-1 text-[var(--text-color-secondary)] group-hover:text-[var(--primary-color)] transition-colors">
                <span className="hidden md:inline">
                  {advancedOpen ? "收起" : "更多条件"}
                </span>
                <motion.span
                  animate={{
                    rotate: advancedOpen ? 180 : 0,
                    y: advancedOpen ? -1 : 1,
                  }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                  className="text-[10px]"
                >
                  ▼
                </motion.span>
              </span>
            </motion.button>
          </div>
          <AnimatePresence initial={false}>
            {advancedOpen ? (
              <motion.div
                key="advanced-panel"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                style={{ overflow: "hidden" }}
                className="text-xs text-[var(--text-color-secondary)]"
              >
                <div className="pt-3">
                  {(activeType === "all" || activeType === "video") && (
                    <div className="flex flex-col md:flex-row md:items-start gap-2 md:gap-4 py-2">
                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          className={
                            "rounded-full border px-2.5 py-1 text-xs bg-transparent shadow-none hover:shadow-none " +
                            (!duration
                              ? "border-[var(--primary-color)] bg-[color-mix(in_srgb,var(--primary-color)_12%,transparent)] text-[var(--primary-color)]"
                              : "border-transparent text-[var(--text-color-secondary)] hover:text-[var(--primary-color)]")
                          }
                          size="sm"
                          variant={!duration ? "solid" : "bordered"}
                          onPress={() => setDuration(null)}
                        >
                          全部时长
                        </Button>
                        {durationFilters.map((item) => {
                          const isActive = duration === item.value;
                          return (
                            <Button
                              key={item.value}
                              type="button"
                              className={
                                "rounded-full border px-2.5 py-1 text-xs bg-transparent shadow-none hover:shadow-none " +
                                (isActive
                                  ? "border-[var(--primary-color)] bg-[color-mix(in_srgb,var(--primary-color)_12%,transparent)] text-[var(--primary-color)]"
                                  : "border-transparent text-[var(--text-color-secondary)] hover:text-[var(--primary-color)]")
                              }
                              size="sm"
                              variant={isActive ? "solid" : "bordered"}
                              onPress={() => setDuration(item.value)}
                            >
                              {item.label}
                            </Button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {(activeType === "all" ||
                    activeType === "video" ||
                    activeType === "document") && (
                    <div className="flex flex-col md:flex-row md:items-start gap-2 md:gap-4 py-2">
                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          className={
                            "rounded-full border px-2.5 py-1 text-xs bg-transparent shadow-none hover:shadow-none " +
                            (!timeRange
                              ? "border-[var(--primary-color)] bg-[color-mix(in_srgb,var(--primary-color)_12%,transparent)] text-[var(--primary-color)]"
                              : "border-transparent text-[var(--text-color-secondary)] hover:text-[var(--primary-color)]")
                          }
                          size="sm"
                          variant={!timeRange ? "solid" : "bordered"}
                          onPress={() => setTimeRange(null)}
                        >
                          全部时间
                        </Button>
                        {timeRangeOptions.map((item) => {
                          const isActive = timeRange === item.value;
                          return (
                            <Button
                              key={item.value}
                              type="button"
                              className={
                                "rounded-full border px-2.5 py-1 text-xs bg-transparent shadow-none hover:shadow-none " +
                                (isActive
                                  ? "border-[var(--primary-color)] bg-[color-mix(in_srgb,var(--primary-color)_12%,transparent)] text-[var(--primary-color)]"
                                  : "border-transparent text-[var(--text-color-secondary)] hover:text-[var(--primary-color)]")
                              }
                              size="sm"
                              variant={isActive ? "solid" : "bordered"}
                              onPress={() => setTimeRange(item.value)}
                            >
                              {item.label}
                            </Button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {currentCategoryFilters.length > 0 && (
                    <div className="flex flex-col md:flex-row md:items-start gap-2 md:gap-4 py-2">
                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          className={
                            "rounded-full border px-2.5 py-1 text-xs bg-transparent shadow-none hover:shadow-none " +
                            (!activeCategory
                              ? "border-[var(--primary-color)] bg-[color-mix(in_srgb,var(--primary-color)_12%,transparent)] text-[var(--primary-color)]"
                              : "border-transparent text-[var(--text-color-secondary)] hover:text-[var(--primary-color)]")
                          }
                          size="sm"
                          variant={!activeCategory ? "solid" : "bordered"}
                          onPress={() => setActiveCategory(null)}
                        >
                          全部分类
                        </Button>
                        {currentCategoryFilters.map((tag) => {
                          const isActive = activeCategory === tag;
                          return (
                            <Button
                              key={tag}
                              type="button"
                              className={
                                "rounded-full border px-2.5 py-1 text-xs bg-transparent shadow-none hover:shadow-none " +
                                (isActive
                                  ? "border-[var(--primary-color)] bg-[color-mix(in_srgb,var(--primary-color)_12%,transparent)] text-[var(--primary-color)]"
                                  : "border-transparent text-[var(--text-color-secondary)] hover:text-[var(--primary-color)]")
                              }
                              size="sm"
                              variant={isActive ? "solid" : "bordered"}
                              onPress={() => setActiveCategory(tag)}
                            >
                              {tag}
                            </Button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </section>

      {/* Results Section */}
      <section className="min-h-[400px]">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="aspect-video bg-white/5 animate-pulse rounded-lg" />
                <div className="space-y-2 px-1">
                  <div className="h-4 bg-white/5 animate-pulse rounded w-3/4" />
                  <div className="flex justify-between">
                    <div className="h-3 bg-white/5 animate-pulse rounded w-1/4" />
                    <div className="h-3 bg-white/5 animate-pulse rounded w-1/4" />
                  </div>
                  <div className="h-5 bg-white/5 animate-pulse rounded w-1/4 mt-2" />
                </div>
              </div>
            ))}
          </div>
        ) : results.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {results.map((item) => (
                <Card
                  key={item.id}
                  isPressable
                  onPress={() => handleResultClick(item)}
                  className="bg-transparent border-none shadow-none hover:shadow-lg transition-all duration-300 group rounded-lg overflow-visible"
                >
                  <CardBody className="p-0 overflow-visible bg-transparent">
                    {/* Thumbnail Section */}
                    <div className="aspect-video relative overflow-hidden bg-[var(--bg-ground)] rounded-lg">
                      {item.thumbnail || item.avatar ? (
                        <Image
                          src={item.thumbnail || item.avatar}
                          alt={item.title}
                          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                          classNames={{
                            wrapper: "w-full h-full !max-w-none",
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[var(--text-color-secondary)] bg-[var(--bg-ground)] group-hover:scale-105 transition-transform duration-500">
                          {item.type === "user" ? (
                            <FiUsers size={32} />
                          ) : item.type === "document" ? (
                            <FiFileText size={32} />
                          ) : (
                            <FiPlay size={32} />
                          )}
                        </div>
                      )}

                      {/* Top Left Type Badge */}
                      <div className="absolute top-2 left-2 z-20">
                        <span className="px-1.5 py-0.5 rounded bg-black/60 text-white text-[10px] backdrop-blur-sm border border-white/10">
                          {item.type === "video"
                            ? "视频"
                            : item.type === "document"
                            ? "文档"
                            : item.type === "tool"
                            ? "资源"
                            : "用户"}
                        </span>
                      </div>

                      {/* Bottom Gradient Overlay */}
                      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent z-10 pointer-events-none" />

                      {/* Bottom Left Stats */}
                      <div className="absolute bottom-2 left-2 flex items-center gap-3 text-white/90 text-[10px] z-20 font-medium">
                        {item.type === "video" ? (
                          <>
                            <span className="flex items-center gap-1">
                              <FiPlay size={12} />
                              {item.playCount}
                            </span>
                            <span className="flex items-center gap-1">
                              <FiMessageSquare size={12} />
                              {item.commentCount || 0}
                            </span>
                          </>
                        ) : item.type === "document" ? (
                          <>
                            <span className="flex items-center gap-1">
                              <FiEye size={12} />
                              {item.readCount}
                            </span>
                            <span className="flex items-center gap-1">
                              <FiMessageSquare size={12} />
                              {item.commentCount || 0}
                            </span>
                          </>
                        ) : item.type === "user" ? (
                          <span className="flex items-center gap-1">
                            <FiUsers size={12} />
                            {item.followers}
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <FiUsers size={12} />
                            {item.usageCount}
                          </span>
                        )}
                      </div>

                      {/* Bottom Right Duration */}
                      <div className="absolute bottom-2 right-2 z-20">
                        {item.type === "video" && item.duration && (
                          <span className="px-1 py-0.5 rounded bg-black/60 text-white text-[10px] font-mono backdrop-blur-sm border border-white/10">
                            {item.duration}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Content Section (Transparent Background) */}
                    <div className="pt-2 pb-1 px-1 space-y-1">
                      {/* Layer 1: Title */}
                      <h3 className="text-[14px] leading-snug font-medium line-clamp-1 text-[var(--text-color)] group-hover:text-[var(--primary-color)] transition-colors">
                        {item.title}
                      </h3>

                      {/* Layer 2: Author + Time */}
                      <div className="flex items-center justify-between text-[12px] text-[var(--text-color-secondary)]">
                        <div
                          className="flex items-center gap-1.5 overflow-hidden hover:text-[var(--primary-color)] transition-colors cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            const targetId = item.authorId || item.id;
                            navigate(routes.userDetail.replace(":id", targetId));
                          }}
                        >
                          {item.type === "user" ? (
                            <span className="truncate">
                              {item.levelTag || "UP主"}
                            </span>
                          ) : (
                            <>
                              <FiUsers size={12} className="shrink-0" />
                              <span className="truncate max-w-[100px]">
                                {item.author || item.tags?.[0] || "User"}
                              </span>
                            </>
                          )}
                        </div>
                        {item.timeRange && (
                          <span className="shrink-0 opacity-80 scale-90 origin-right">
                            {item.timeRange.includes("-")
                              ? item.timeRange.split("-")[0]
                              : item.timeRange}
                          </span>
                        )}
                      </div>

                      {/* Layer 3: Category */}
                      <div className="flex items-center gap-2 pt-0.5">
                        <span className="text-[10px] text-[var(--text-color-secondary)] border border-[var(--border-color)] px-1.5 py-0.5 rounded-sm bg-transparent">
                          {item.category ||
                            (item.type === "video"
                              ? "视频"
                              : item.type === "document"
                              ? "文档"
                              : "其他")}
                        </span>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>

            {total > PAGE_SIZE && (
              <div className="flex justify-center mt-8 pb-8">
                <Pagination
                  total={Math.ceil(total / PAGE_SIZE)}
                  page={page}
                  onChange={setPage}
                  showControls
                  color="primary"
                  variant="flat"
                />
              </div>
            )}
          </>
        ) : (
          <div className="py-20 flex flex-col items-center gap-4">
            <EmptyState
              title="未找到相关内容"
              description="尝试切换关键词或筛选条件"
            />
            <Button
              size="sm"
              variant="flat"
              onPress={() => {
                setKeyword("");
                setAppliedKeyword("");
                setDuration(null);
                setTimeRange(null);
                setActiveCategory(null);
                setActiveType("all");
              }}
            >
              清除所有筛选
            </Button>
          </div>
        )}
      </section>
    </div>
  );
}

// ===== 10. TODO任务管理区域 =====

// ===== 11. 导出区域 =====
export default AllSearchPage;
