import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Button,
  Tab,
  Pagination,
  Card,
  CardBody,
  Image
} from "@heroui/react";
import { Loading } from "../../components/Loading";
import { AdminTabs } from "@/components/Admin/AdminTabs";
import { routes } from "../../router/routes";
import Shuffle from "../../components/Motion/Shuffle";
import TextType from "../../components/Motion/TextType";
import { EmptyState } from "../../components/EmptyState";
import { FiPlay, FiMessageSquare, FiEye, FiHeart, FiUsers } from "react-icons/fi";
import {
  type SearchCategory,
  type SearchSortKey as SortKey,
  type SearchResult,
  searchAll
} from "../../api/front/search";
import { mockSearchResults } from "../../api/mock/front/search";

type ResultType = SearchResult["type"];

const categoryToResultType: Partial<Record<SearchCategory, ResultType>> = {
  video: "video",
  document: "document",
  tool: "tool",
  user: "user"
};

const VIDEO_DEFAULT = "/DefaultImage/MyDefaultHomeVodie.png";
const DOC_DEFAULT = "/DefaultImage/MyDefaultImage.jpg";



const categories: {
  key: SearchCategory;
  label: string;
}[] = [
  { key: "all", label: "综合" },
  { key: "video", label: "视频" },
  { key: "document", label: "文档" },
  { key: "tool", label: "百宝袋" },
  { key: "user", label: "用户" }
];

const sortOptionsByCategory: Record<
  SearchCategory,
  {
    key: SortKey;
    label: string;
  }[]
> = {
  all: [
    { key: "hot", label: "综合推荐" },
    { key: "latest", label: "最新发布" },
    { key: "like", label: "点赞优先" }
  ],
  video: [
    { key: "hot", label: "热门" },
    { key: "latest", label: "最新" },
    { key: "like", label: "点赞" }
  ],
  document: [
    { key: "hot", label: "热门" },
    { key: "latest", label: "最新" },
    { key: "like", label: "点赞" }
  ],
  tool: [
    { key: "hot", label: "热门" },
    { key: "usage", label: "使用量" },
    { key: "like", label: "收藏" }
  ],
  user: [
    { key: "relevance", label: "相关度" },
    { key: "fans", label: "粉丝量" },
    { key: "active", label: "活跃度" }
  ]
};

const durationFilters = [
  { value: "lt10", label: "10 分钟以下" },
  { value: "10_30", label: "10 - 30 分钟" },
  { value: "30_60", label: "30 - 60 分钟" },
  { value: "gt60", label: "60 分钟以上" }
];

const videoTagFilters = ["代码", "前端", "React", "算法", "其他"];

const documentTagFilters = ["设计稿", "需求文档", "使用手册", "随笔", "其他"];

const toolboxTagFilters = ["实用工具", "模板素材", "学习资料", "插件应用"];

const userTypeFilters = ["普通用户", "创作者", "官方账号", "机构账号"];

const timeRangeOptions = [
  { value: "7d", label: "一周内" },
  { value: "1m", label: "一月内" },
  { value: "1y", label: "一年内" }
];

function AllSearchPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [keyword, setKeyword] = React.useState("");
  const [appliedKeyword, setAppliedKeyword] = React.useState("");
  const [activeCategory, setActiveCategory] =
    React.useState<SearchCategory>("all");
  const [activeSort, setActiveSort] = React.useState<SortKey>("hot");
  const [duration, setDuration] = React.useState<string | null>(null);
  const [timeRange, setTimeRange] = React.useState<string | null>(null);
  const [activeTag, setActiveTag] = React.useState<string | null>(null);
  const [advancedOpen, setAdvancedOpen] = React.useState(true);
  
  const [results, setResults] = React.useState<SearchResult[]>([]);
  const [page, setPage] = React.useState(1);
  const [total, setTotal] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(false);

  const PAGE_SIZE = 16;

  React.useEffect(() => {
    let cancelled = false;

    async function fetchResults() {
      setIsLoading(true);
      const searchParams = {
        keyword: appliedKeyword || undefined,
        category: activeCategory,
        sort: activeSort,
        duration,
        timeRange,
        tag: activeTag,
        page,
        pageSize: PAGE_SIZE
      };

      // 使用公共 axios 实例的请求日志风格
      console.log("► GET", "/search/all", searchParams);

      try {
        // 1. 调用公共 API 方法 (内部使用 src/api/axios.ts)
        const data = await searchAll(searchParams);
        
        if (cancelled) return;
        
        let list: SearchResult[] = [];
        let totalCount = 0;
        
        if (Array.isArray(data)) {
          list = data;
          totalCount = data.length;
        } else if (data && Array.isArray(data.list)) {
          list = data.list;
          totalCount = data.total || 0;
        }

        // 如果后端返回空列表，主动触发 Mock 回退
        if (list.length === 0) {
          console.log("No data from server, falling back to mock");
          // 此处不再 throw，而是直接在下方处理，或者保留 throw 让 catch 处理
          throw new Error("EMPTY_DATA");
        }

        setResults(list);
        setTotal(totalCount);
      } catch (err: unknown) {
        if (cancelled) return;
        
        const error = err as Error;
        // 关键：由于接入了公共 axios.ts 的全局提示，此处只需处理日志和回退
        console.error("✖ Request Error:", error.message);

        // Fallback to mock data (不再区分 DEV 环境，按需回退)
        console.log("Using mock data fallback");
        
        let filtered = [...mockSearchResults];
          
          // Category filter
          if (activeCategory === "all") {
            // 综合查询：只查询视频和文档
            filtered = filtered.filter(item => item.type === "video" || item.type === "document");
          } else {
            const targetType = categoryToResultType[activeCategory];
            if (targetType) {
              filtered = filtered.filter(item => item.type === targetType);
            }
          }

          // Keyword filter - 只有当关键词不为空时才过滤
          if (appliedKeyword && appliedKeyword.trim() !== "") {
            const k = appliedKeyword.toLowerCase().trim();
            filtered = filtered.filter(item => 
              item.title.toLowerCase().includes(k) || 
              item.description.toLowerCase().includes(k)
            );
          }
          
          // Tag filter
          if (activeTag) {
             filtered = filtered.filter(item => item.tags?.includes(activeTag));
          }

          // Pagination logic for mock data
          const start = (page - 1) * PAGE_SIZE;
          const end = start + PAGE_SIZE;
          const paginatedList = filtered.slice(start, end);

          setResults(paginatedList);
          setTotal(filtered.length);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    fetchResults();

    return () => {
      cancelled = true;
    };
  }, [
    appliedKeyword,
    activeCategory,
    activeSort,
    duration,
    timeRange,
    activeTag,
    page
  ]);

  // Reset page when filters change
  React.useEffect(() => {
    setPage(1);
  }, [
    appliedKeyword,
    activeCategory,
    activeSort,
    duration,
    timeRange,
    activeTag
  ]);

  React.useEffect(() => {
    const category = searchParams.get("category");
    if (
      category === "all" ||
      category === "video" ||
      category === "document" ||
      category === "tool" ||
      category === "user"
    ) {
      setActiveCategory(category);
    }
  }, [searchParams]);

  function handleResultClick(item: SearchResult) {
    if (item.type === "video") {
      navigate(routes.videoDetail.replace(":id", item.id));
      return;
    }
    if (item.type === "document") {
      navigate(routes.docDetail.replace(":id", item.id));
      return;
    }
    if (item.type === "tool") {
      navigate(routes.toolboxDetail.replace(":id", item.id));
      return;
    }
    if (item.type === "user") {
      navigate(routes.userDetail.replace(":id", item.id));
      return;
    }
  }

  const currentSortOptions = sortOptionsByCategory[activeCategory];

  const currentTagFilters = React.useMemo(() => {
    if (activeCategory === "video" || activeCategory === "all") {
      return videoTagFilters;
    }
    if (activeCategory === "document") {
      return documentTagFilters;
    }
    if (activeCategory === "tool") {
      return toolboxTagFilters;
    }
    if (activeCategory === "user") {
      return userTypeFilters;
    }
    return [];
  }, [activeCategory]);


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
              onChange={event => setKeyword(event.target.value)}
              onKeyDown={event => {
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
            selectedKey={activeCategory}
            onSelectionChange={key => {
              const category = key as SearchCategory;
              setActiveCategory(category);

              // 重置筛选和排序条件为默认（第一个）
              const categorySortOptions = sortOptionsByCategory[category];
              if (categorySortOptions && categorySortOptions.length > 0) {
                setActiveSort(categorySortOptions[0].key);
              }
              setDuration(null);
              setTimeRange(null);
              setActiveTag(null);

              const next = new URLSearchParams(searchParams);
              if (category === "all") {
                next.delete("category");
              } else {
                next.set("category", category);
              }
              setSearchParams(next);
            }}
            classNames={{
              tabList: "p-0 gap-10 border-none",
              tab: "h-11 px-0 min-w-0 text-lg",
              cursor: "h-[2px] w-full bg-[var(--primary-color)]",
              tabContent: "group-data-[selected=true]:text-[var(--primary-color)] font-medium"
            }}
          >
            {categories.map(item => (
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
                {currentSortOptions.map(option => {
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
              onClick={() => setAdvancedOpen(open => !open)}
              whileHover={{ 
                scale: 1.02,
                borderColor: "var(--primary-color)",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
              }}
              whileTap={{ scale: 0.95 }}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 25
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
                    y: advancedOpen ? -1 : 1
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
                  {(activeCategory === "all" || activeCategory === "video") && (
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
                        {durationFilters.map(item => {
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

                  {(activeCategory === "all" ||
                    activeCategory === "video" ||
                    activeCategory === "document") && (
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
                        {timeRangeOptions.map(item => {
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

                  {currentTagFilters.length > 0 && (
                    <div className="flex flex-col md:flex-row md:items-start gap-2 md:gap-4 py-2">
                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          className={
                            "rounded-full border px-2.5 py-1 text-xs bg-transparent shadow-none hover:shadow-none " +
                            (!activeTag
                              ? "border-[var(--primary-color)] bg-[color-mix(in_srgb,var(--primary-color)_12%,transparent)] text-[var(--primary-color)]"
                              : "border-transparent text-[var(--text-color-secondary)] hover:text-[var(--primary-color)]")
                          }
                          size="sm"
                          variant={!activeTag ? "solid" : "bordered"}
                          onPress={() => setActiveTag(null)}
                        >
                          全部分区
                        </Button>
                        {currentTagFilters.map(tag => {
                          const isActive = activeTag === tag;
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
                              onPress={() => setActiveTag(tag)}
                            >
                              {tag}
                            </Button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2 py-2 items-center">
                    <Button
                      type="button"
                      size="sm"
                      variant="flat"
                      radius="full"
                      className="h-7 px-4 text-[11px] font-medium border border-danger/50 bg-danger/15 text-danger hover:bg-danger hover:text-white transition-all duration-200"
                      onPress={() => {
                        setDuration(null);
                        setTimeRange(null);
                        setActiveTag(null);
                      }}
                    >
                      重置条件
                    </Button>
                  </div>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </section>

      <section className="space-y-4">
        {isLoading ? (
          <Loading className="py-20" height="auto" />
        ) : results.length === 0 ? (
          <EmptyState />
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4"
          >
            {results.map(item => {
              const isVideo = item.type === "video";
              const isDocument = item.type === "document";
              const isTool = item.type === "tool";
              if (isVideo) {
                const thumbnail = item.thumbnail || VIDEO_DEFAULT;
                return (
                  <motion.article
                    key={`${item.type}-${item.id}`}
                    className="group flex flex-col gap-2 cursor-pointer"
                    onClick={() => handleResultClick(item)}
                    whileHover={{ y: -4, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{
                      type: "spring",
                      stiffness: 420,
                      damping: 32
                    }}
                  >
                    <div className="relative aspect-video overflow-hidden rounded-[var(--radius-base)] bg-black/40">
                      <img
                        src={thumbnail}
                        alt={item.title}
                        className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.04]"
                        onError={event => {
                          event.currentTarget.src = VIDEO_DEFAULT;
                        }}
                      />
                      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between px-2.5 pb-1.5 text-[10px] text-white">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-0.5 bg-black/60 px-1.5 py-0.5 rounded">
                            <FiPlay className="w-3 h-3" />
                            <span>{item.playCount ?? 0}</span>
                          </span>
                          <span className="inline-flex items-center gap-0.5 bg-black/60 px-1.5 py-0.5 rounded">
                            <FiMessageSquare className="w-3 h-3" />
                            <span>{item.commentCount ?? 0}</span>
                          </span>
                        </div>
                        {item.duration && (
                          <span className="rounded bg-black/80 px-1.5 py-0.5">
                            {item.duration}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <h3 className="line-clamp-2 text-xs font-semibold md:text-sm">
                        {item.title}
                      </h3>
                      <p className="line-clamp-2 text-[11px] text-[var(--text-color-secondary)]">
                        {item.description}
                      </p>
                    </div>
                  </motion.article>
                );
              }

              if (isDocument) {
                const thumbnail = item.thumbnail || DOC_DEFAULT;
                return (
                  <motion.article
                    key={`${item.type}-${item.id}`}
                    className="group flex flex-col gap-2 cursor-pointer"
                    onClick={() => handleResultClick(item)}
                    whileHover={{ y: -4, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{
                      type: "spring",
                      stiffness: 420,
                      damping: 32
                    }}
                  >
                    <div className="relative aspect-video overflow-hidden rounded-[var(--radius-base)] bg-black/40">
                      <img
                        src={thumbnail}
                        alt={item.title}
                        className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.04]"
                        onError={event => {
                          event.currentTarget.src = DOC_DEFAULT;
                        }}
                      />
                      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between px-2.5 pb-1.5 text-[10px] text-white">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-0.5 bg-black/60 px-1.5 py-0.5 rounded">
                            <FiEye className="w-3 h-3" />
                            <span>{item.readCount ?? 0}</span>
                          </span>
                          <span className="inline-flex items-center gap-0.5 bg-black/60 px-1.5 py-0.5 rounded">
                            <FiHeart className="w-3 h-3" />
                            <span>{item.favoriteCount ?? 0}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <h3 className="line-clamp-2 text-xs font-semibold md:text-sm">
                        {item.title}
                      </h3>
                      <p className="line-clamp-2 text-[11px] text-[var(--text-color-secondary)]">
                        {item.description}
                      </p>
                    </div>
                  </motion.article>
                );
              }

              if (isTool) {
                return (
                  <motion.article
                    key={`${item.type}-${item.id}`}
                    className="group relative h-full cursor-pointer"
                    onClick={() => handleResultClick(item)}
                    whileHover={{ y: -4 }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  >
                    <Card className="h-full border border-[var(--border-color)] bg-[var(--bg-elevated)] shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                      <CardBody className="p-5 flex flex-col items-center text-center gap-3 relative z-0">
                        <div className="w-14 h-14 rounded-2xl bg-gray-50 dark:bg-zinc-800/50 flex items-center justify-center text-2xl shadow-inner mb-1">
                          {item.thumbnail ? (
                            <Image src={item.thumbnail} alt={item.title} className="w-8 h-8 object-contain" removeWrapper />
                          ) : (
                            <span className="font-bold text-[var(--primary-color)]">{item.title.charAt(0)}</span>
                          )}
                        </div>
                        <div className="w-full">
                          <h3 className="font-bold text-base mb-1.5 truncate w-full">{item.title}</h3>
                          <p className="text-xs text-[var(--text-color-secondary)] line-clamp-2 h-8 leading-4 group-hover:opacity-0 transition-opacity">
                            {item.description}
                          </p>
                        </div>
                        
                        {/* Hover Overlay for more info */}
                        <div className="absolute inset-0 bg-[var(--bg-elevated)]/95 backdrop-blur-sm p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-center items-center text-center gap-3 z-10">
                          <p className="text-xs text-[var(--text-color)] line-clamp-3 leading-relaxed">
                            {item.description}
                          </p>
                          <div className="flex flex-wrap gap-1.5 justify-center">
                             {item.tags?.slice(0, 3).map(tag => (
                               <span key={tag} className="text-[10px] px-2 py-0.5 bg-[var(--primary-color)]/10 text-[var(--primary-color)] rounded-full border border-[var(--primary-color)]/20">
                                 {tag}
                               </span>
                             ))}
                          </div>
                          <Button 
                            size="sm" 
                            color="primary" 
                            variant="flat" 
                            radius="full"
                            className="mt-1 h-7 min-w-0 px-4 text-xs font-medium"
                            onPress={() => handleResultClick(item)}
                          >
                            查看详情
                          </Button>
                        </div>
                      </CardBody>
                    </Card>
                  </motion.article>
                );
              }

              // user
              return (
                <motion.article
                  key={`${item.type}-${item.id}`}
                  className="flex items-center gap-3 cursor-pointer"
                  onClick={() => handleResultClick(item)}
                  whileHover={{ y: -3, scale: 1.01 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{
                    type: "spring",
                    stiffness: 420,
                    damping: 32
                  }}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#ff4da6] via-[#ff7ac2] to-[#ffb3d9] text-sm font-semibold text-black">
                    {item.title.slice(0, 2)}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs md:text-sm font-semibold line-clamp-1">
                        {item.title}
                      </h3>
                      {item.levelTag && (
                        <span className="inline-flex items-center rounded-full bg-[color-mix(in_srgb,var(--primary-color)_12%,transparent)] px-2 py-0.5 text-[10px] text-[var(--primary-color)]">
                          {item.levelTag}
                        </span>
                      )}
                      {item.isLive && (
                        <span className="inline-flex items-center rounded-full bg-rose-600 px-1.5 py-0.5 text-[9px] text-white">
                          LIVE
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-[var(--text-color-secondary)]">
                      <span className="inline-flex items-center gap-0.5">
                        <FiUsers className="w-3 h-3" />
                        <span>{item.followers ?? 0} 粉丝</span>
                      </span>
                      {typeof item.works === "number" && (
                        <span>{item.works} 个作品</span>
                      )}
                    </div>
                    <p className="text-[11px] text-[var(--text-color-secondary)] line-clamp-2">
                      {item.description}
                    </p>
                  </div>
                </motion.article>
              );
            })}
          </motion.div>
        )}

        {/* Pagination */}
        {!isLoading && total > 0 && (
          <div className="flex justify-center py-6">
            <Pagination
              total={Math.ceil(total / PAGE_SIZE)}
              page={page}
              onChange={setPage}
              showControls
              color="primary"
              variant="light"
            />
          </div>
        )}
      </section>
    </div>
  );
}

export default AllSearchPage;
