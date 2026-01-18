import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button, DateRangePicker } from "@heroui/react";
import { routes } from "../../router/routes";
import { getLocalTimeZone } from "@internationalized/date";
import { FiPlay, FiMessageSquare, FiEye, FiHeart, FiUsers } from "react-icons/fi";
import {
  type SearchCategory,
  type SearchSortKey as SortKey,
  type SearchResult,
  searchAll
} from "../../api/front/search";

type ResultType = SearchResult["type"];

const DEFAULT_THUMBNAIL = "/DefaultImage/MyDefaultImage.jpg";

const categories: {
  key: SearchCategory;
  label: string;
}[] = [
  { key: "all", label: "全部" },
  { key: "video", label: "视频" },
  { key: "document", label: "文档" },
  { key: "tool", label: "百宝袋" },
  { key: "user", label: "用户" }
];

const categoryToResultType: Partial<Record<SearchCategory, ResultType>> = {
  video: "video",
  document: "document",
  tool: "tool",
  user: "user"
};

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

const mockResults: SearchResult[] = [
  {
    id: "v1",
    type: "video",
    title: "从 0 搭建个人知识库前端：架构与页面规划",
    description: "完整拆解知识库小破站的前台系统设计，从路由到动效一站式讲解。",
    tags: ["视频", "前端", "架构"],
    thumbnail: "",
    duration: "24:18",
    playCount: 1200,
    commentCount: 86,
    timeRange: "1w"
  },
  {
    id: "d1",
    type: "document",
    title: "知识库小破站 · 需求与设计说明文档",
    description: "详细记录项目背景、功能模块、交互设计与技术栈约定，便于长期维护。",
    tags: ["文档", "设计稿"],
    thumbnail: "",
    readCount: 986,
    favoriteCount: 120,
    timeRange: "1m"
  },
  {
    id: "t1",
    type: "tool",
    title: "Markdown 一键排版助手",
    description: "支持标题规范化、代码块高亮、目录生成的 Markdown 清理与排版小工具。",
    tags: ["百宝袋", "实用工具"],
    avatar: "",
    usageCount: 2100,
    favoriteCount: 312
  },
  {
    id: "u1",
    type: "user",
    title: "知库小站长",
    description: "个人知识库长期建设实践者，专注前端工程化与知识管理。",
    tags: ["创作者", "前端"],
    avatar: "",
    followers: 3400,
    works: 128,
    levelTag: "前端架构"
  },
  {
    id: "v2",
    type: "video",
    title: "React Bits 动效组件在知识库项目中的落地实践",
    description: "基于 Scroll Stack、Animated Content 等组件重构首页推荐与搜索体验。",
    tags: ["视频", "React Bits"],
    thumbnail: "",
    duration: "16:02",
    playCount: 824,
    commentCount: 32,
    timeRange: "1m"
  }
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
  const [total, setTotal] = React.useState<number | null>(null);
  const [visibleCount, setVisibleCount] = React.useState(8);
  const [isLoadingMore, setIsLoadingMore] = React.useState(false);
  const [isInitialLoading, setIsInitialLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const PAGE_SIZE = 8;

  React.useEffect(() => {
    let cancelled = false;

    async function fetchResults() {
      setIsInitialLoading(true);
      setError(null);
      try {
        const data = await searchAll({
          keyword: appliedKeyword || undefined,
          category: activeCategory,
          sort: activeSort,
          duration,
          timeRange,
          tag: activeTag
        });
        if (cancelled) {
          return;
        }
        let list: SearchResult[] = [];
        let totalCount: number | null = null;

        if (Array.isArray(data)) {
          list = data;
          totalCount = data.length;
        } else if (data && Array.isArray(data.list)) {
          list = data.list;
          totalCount =
            typeof data.total === "number" ? data.total : data.list.length;
        } else {
          list = [];
        }

        if (!list.length) {
          setResults(mockResults);
          setTotal(mockResults.length);
        } else {
          setResults(list);
          setTotal(totalCount);
        }
        setVisibleCount(PAGE_SIZE);
      } catch {
        if (cancelled) {
          return;
        }
        setError("搜索接口暂不可用，当前展示示例数据");
        setResults(mockResults);
        setTotal(mockResults.length);
        setVisibleCount(PAGE_SIZE);
      } finally {
        if (!cancelled) {
          setIsInitialLoading(false);
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
    activeTag
  ]);

  const filteredResults = React.useMemo(() => {
    if (activeCategory === "all") {
      return results;
    }
    const targetType = categoryToResultType[activeCategory];
    if (!targetType) {
      return results;
    }
    return results.filter(item => item.type === targetType);
  }, [results, activeCategory]);

  React.useEffect(() => {
    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } =
        document.documentElement;
      if (
        scrollHeight - (scrollTop + clientHeight) < 200 &&
        !isLoadingMore &&
        visibleCount < filteredResults.length
      ) {
        setIsLoadingMore(true);
        window.setTimeout(() => {
          setVisibleCount(current =>
            Math.min(current + PAGE_SIZE, filteredResults.length)
          );
          setIsLoadingMore(false);
        }, 600);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isLoadingMore, visibleCount, filteredResults.length]);

  const visibleResults = React.useMemo(
    () => filteredResults.slice(0, visibleCount),
    [filteredResults, visibleCount]
  );

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
    if (item.type === "tool" && item.url) {
      window.open(item.url, "_blank", "noopener,noreferrer");
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

  const displayTotal =
    activeCategory === "all"
      ? total ?? results.length
      : filteredResults.length;

  return (
    <div className="space-y-6">
      <header className="space-y-3">
        <div className="flex items-center gap-2 text-xs text-[var(--text-color-secondary)]">
          <span>首页</span>
          <span>/</span>
          <span>知识库</span>
        </div>
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <h1 className="text-xl md:text-2xl font-semibold tracking-tight">
              全站知识检索
            </h1>
            <p className="text-xs md:text-sm text-[var(--text-color-secondary)]">
              支持视频、文档、百宝袋工具与用户维度的综合搜索，排序交给后端，
              前端专注于清晰地展示结果。
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-[10px] md:text-xs text-[var(--text-color-secondary)]">
            <span>排序规则由后端统一控制</span>
            <span>·</span>
            <span>单一接口返回多类型结果</span>
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
              className="w-full rounded-[var(--radius-base)] border border-[var(--border-color)] bg-[var(--bg-elevated)] px-3 py-2 text-sm outline-none focus-visible:border-[var(--primary-color)]"
            />
          </div>
          <Button
            type="button"
            className="inline-flex items-center justify-center rounded-[var(--radius-base)] bg-[var(--primary-color)] px-4 py-2 text-xs md:text-sm font-medium text-[var(--bg-elevated)] shadow-sm hover:bg-[color-mix(in_srgb,var(--primary-color)_88%,black_12%)]"
            color="primary"
            onPress={() => setAppliedKeyword(keyword.trim())}
          >
            综合搜索
          </Button>
        </div>
        <div className="flex flex-wrap gap-4 border-b border-[var(--border-color)] text-xs md:text-sm">
          {categories.map(item => {
            const isActive = item.key === activeCategory;
            return (
              <Button
                key={item.key}
                type="button"
                className={
                  "relative pb-2 pt-1 transition-colors bg-transparent shadow-none hover:shadow-none " +
                  (isActive
                    ? "text-[var(--primary-color)] font-medium"
                    : "text-[var(--text-color-secondary)] hover:text-[var(--text-color)]")
                }
                variant="light"
                onPress={() => {
                  setActiveCategory(item.key);
                  const next = new URLSearchParams(searchParams);
                  if (item.key === "all") {
                    next.delete("category");
                  } else {
                    next.set("category", item.key);
                  }
                  setSearchParams(next);
                }}
              >
                <span className="inline-flex min-h-[32px] items-center">
                  {item.label}
                </span>
                {isActive ? (
                  <motion.span
                    layoutId="allsearch-tab-underline"
                    transition={{
                      type: "spring",
                      stiffness: 380,
                      damping: 30
                    }}
                    className="pointer-events-none absolute inset-x-0 bottom-0 h-[2px] rounded-full bg-[var(--primary-color)]"
                  />
                ) : null}
              </Button>
            );
          })}
        </div>
      </section>

      <section className="space-y-4 pb-10">
        <div className="space-y-3">
          <div className="flex flex-col gap-3 text-xs md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">综合排序</span>
                <span className="hidden text-[var(--text-color-secondary)] md:inline">
                  由后端统一排序，当前仅展示入参结构
                </span>
              </div>
              <div className="flex flex-wrap gap-4">
                {currentSortOptions.map(option => {
                  const isActive = option.key === activeSort;
                  return (
                    <motion.button
                      key={option.key}
                      type="button"
                      className={
                        "rounded-full border px-3 py-1.5 transition-colors " +
                        (isActive
                          ? "border-[var(--primary-color)] bg-[color-mix(in_srgb,var(--primary-color)_12%,transparent)] text-[var(--primary-color)]"
                          : "border-[var(--border-color)] text-[var(--text-color-secondary)] hover:border-[color-mix(in_srgb,var(--primary-color)_40%,transparent)]")
                      }
                      onClick={() => setActiveSort(option.key)}
                      whileHover={{ y: -1 }}
                      whileTap={{ scale: 0.96 }}
                      transition={{
                        type: "spring",
                        stiffness: 420,
                        damping: 28
                      }}
                    >
                      {option.label}
                    </motion.button>
                  );
                })}
              </div>
            </div>
            <motion.button
              type="button"
              className="inline-flex min-h-[34px] items-center justify-center rounded-[var(--radius-base)] border border-[var(--border-color)] bg-[var(--bg-elevated)] px-3 py-2 text-xs text-[var(--text-color)] md:px-4"
              onClick={() => setAdvancedOpen(open => !open)}
              whileTap={{ scale: 0.96 }}
              transition={{
                type: "spring",
                stiffness: 420,
                damping: 30
              }}
            >
              <span className="mr-1 font-medium">
                {advancedOpen ? "更多筛选" : "更多筛选"}
              </span>
              <span className="flex items-center gap-1 text-[var(--text-color-secondary)]">
                <span className="hidden md:inline">
                  {advancedOpen ? "收起" : "更多条件"}
                </span>
                <motion.span
                  animate={{ rotate: advancedOpen ? 180 : 0 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
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
                initial={{ opacity: 0, y: -4, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, y: -4, height: 0 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                style={{ overflow: "hidden" }}
                className="space-y-3 rounded-[var(--radius-base)] border border-[var(--border-color)] bg-[var(--bg-elevated)] px-3 py-3 text-[11px] text-[var(--text-color-secondary)]"
              >
                {(activeCategory === "all" || activeCategory === "video") && (
                  <motion.div
                    layout
                    transition={{ type: "spring", stiffness: 320, damping: 26 }}
                    className="space-y-2"
                  >
                    <div className="font-medium text-[var(--text-color)]">
                      视频时长
                    </div>
                    <div className="flex flex-wrap gap-2">
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
                                : "border-[var(--border-color)] hover:border-[color-mix(in_srgb,var(--primary-color)_40%,transparent)]")
                            }
                            size="sm"
                            variant={isActive ? "solid" : "bordered"}
                            onPress={() =>
                              setDuration(current =>
                                current === item.value ? null : item.value
                              )
                            }
                          >
                            {item.label}
                          </Button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {(activeCategory === "all" ||
                  activeCategory === "video" ||
                  activeCategory === "document") && (
                  <motion.div
                    layout
                    transition={{ type: "spring", stiffness: 320, damping: 26 }}
                    className="space-y-2"
                  >
                    <div className="font-medium text-[var(--text-color)]">
                      创建时间范围
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <DateRangePicker
                        aria-label="创建时间范围筛选"
                        size="sm"
                        variant="bordered"
                        className="w-64 text-[11px]"
                        onChange={value => {
                          if (!value || !value.start || !value.end) {
                            setTimeRange(null);
                            return;
                          }
                          try {
                            const timeZone = getLocalTimeZone();
                            const startDate = value.start.toDate(timeZone);
                            const endDate = value.end.toDate(timeZone);
                            const diffMs = endDate.getTime() - startDate.getTime();
                            const diffDays =
                              Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;
                            if (diffDays <= 7) {
                              setTimeRange("7d");
                            } else if (diffDays <= 31) {
                              setTimeRange("1m");
                            } else if (diffDays <= 365) {
                              setTimeRange("1y");
                            } else {
                              setTimeRange("all");
                            }
                          } catch {
                            setTimeRange(null);
                          }
                        }}
                      />
                    </div>
                  </motion.div>
                )}

                {currentTagFilters.length > 0 && (
                  <motion.div
                    layout
                    transition={{ type: "spring", stiffness: 320, damping: 26 }}
                    className="space-y-2"
                  >
                    <div className="font-medium text-[var(--text-color)]">
                      分类 / 标签
                    </div>
                    <div className="flex flex-wrap gap-2">
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
                                : "border-[var(--border-color)] hover:border-[color-mix(in_srgb,var(--primary-color)_40%,transparent)]")
                            }
                            size="sm"
                            variant={isActive ? "solid" : "bordered"}
                            onPress={() =>
                              setActiveTag(current =>
                                current === tag ? null : tag
                              )
                            }
                          >
                            {tag}
                          </Button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    className="rounded-[var(--radius-base)] border border-[var(--border-color)] px-3 py-1 text-[11px] bg-transparent shadow-none hover:shadow-none"
                    size="sm"
                    variant="bordered"
                    onPress={() => {
                      setDuration(null);
                      setTimeRange(null);
                      setActiveTag(null);
                    }}
                  >
                    重置条件
                  </Button>
                  <div className="text-[var(--text-color-secondary)]">
                    当前所有条件将作为查询参数传递给后端接口。
                  </div>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between text-xs">
          <div className="text-[var(--text-color-secondary)]">
            {error
              ? error
              : isInitialLoading && !results.length
              ? "正在请求搜索结果..."
              : `已接入搜索接口，当前共 ${
                  displayTotal
                } 条结果，前端仅负责展示。`}
          </div>
          <span className="hidden md:inline text-[var(--text-color-secondary)]">
            接口：GET /api/search/all
          </span>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4"
        >
          {visibleResults.map(item => {
            const isVideo = item.type === "video";
            const isDocument = item.type === "document";
            const isTool = item.type === "tool";

            if (isVideo) {
              const thumbnail = item.thumbnail || DEFAULT_THUMBNAIL;
              return (
                <motion.article
                  key={item.id}
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
                      loading="lazy"
                      onError={event => {
                        event.currentTarget.src = DEFAULT_THUMBNAIL;
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
              const thumbnail = item.thumbnail || DEFAULT_THUMBNAIL;
              return (
                <motion.article
                  key={item.id}
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
                      loading="lazy"
                      onError={event => {
                        event.currentTarget.src = DEFAULT_THUMBNAIL;
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
                  key={item.id}
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
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[var(--primary-color)]/80 via-purple-500/70 to-emerald-400/70 text-sm font-semibold text-white">
                    {item.title.slice(0, 2)}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-xs md:text-sm font-semibold line-clamp-1">
                        {item.title}
                      </h3>
                      <Button
                        size="sm"
                        radius="full"
                        className="h-7 px-3 bg-[var(--primary-color)] text-black text-[11px] shadow-[0_10px_24px_rgba(56,189,248,0.55)]"
                      >
                        立即跳转
                      </Button>
                    </div>
                    <p className="text-[11px] text-[var(--text-color-secondary)] line-clamp-2">
                      {item.description}
                    </p>
                  </div>
                </motion.article>
              );
            }

            // user
            return (
              <motion.article
                key={item.id}
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
          {isLoadingMore &&
            Array.from({ length: 4 }).map((_, index) => (
              <div
                key={`skeleton-${index}`}
                className="flex flex-col gap-2 animate-pulse"
              >
                <div className="aspect-video rounded-[var(--radius-base)] bg-[color-mix(in_srgb,var(--bg-elevated)_80%,black_20%)]" />
                <div className="h-3 rounded bg-[color-mix(in_srgb,var(--bg-elevated)_80%,black_20%)]" />
                <div className="h-3 w-2/3 rounded bg-[color-mix(in_srgb,var(--bg-elevated)_80%,black_20%)]" />
              </div>
            ))}
        </motion.div>
      </section>
    </div>
  );
}

export default AllSearchPage;
