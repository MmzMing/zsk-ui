import React from "react";
import {
  Tab,
  Card,
  Button,
  Input,
  Chip
} from "@heroui/react";
import { AdminTabs } from "@/components/Admin/AdminTabs";
import {
  FiExternalLink,
  FiSearch,
  FiHeart,
  FiTrendingUp,
  FiStar
} from "react-icons/fi";

type ToolboxCategory = "tool" | "learning" | "resource" | "ai";

type ToolboxSite = {
  id: string;
  name: string;
  url: string;
  description: string;
  coreFeatures: string;
  category: ToolboxCategory;
  tags: string[];
  hotScore: number;
  recommendScore: number;
};

const toolboxSites: ToolboxSite[] = [
  {
    id: "notion",
    name: "Notion",
    url: "https://www.notion.so",
    description: "集文档、数据库、看板于一体的知识管理与协作平台。",
    coreFeatures: "多维视图、协作编辑、模板市场",
    category: "tool",
    tags: ["团队协作", "笔记"],
    hotScore: 96,
    recommendScore: 95
  },
  {
    id: "excalidraw",
    name: "Excalidraw",
    url: "https://excalidraw.com",
    description: "手绘风在线白板，适合流程图、架构草图与产品讨论。",
    coreFeatures: "多人协作、手绘风、无限画布",
    category: "tool",
    tags: ["白板", "原型"],
    hotScore: 88,
    recommendScore: 90
  },
  {
    id: "raycast",
    name: "Raycast Extensions",
    url: "https://www.raycast.com",
    description: "效率启动器扩展中心，集合大量开发者常用的小工具。",
    coreFeatures: "命令面板、插件生态、快捷操作",
    category: "tool",
    tags: ["效率", "插件"],
    hotScore: 84,
    recommendScore: 87
  },
  {
    id: "leetcode",
    name: "LeetCode",
    url: "https://leetcode.com",
    description: "经典算法刷题网站，支持多语言在线提交与讨论。",
    coreFeatures: "算法题库、在线评测、讨论区",
    category: "learning",
    tags: ["算法", "刷题"],
    hotScore: 98,
    recommendScore: 93
  },
  {
    id: "csdn",
    name: "CSDN",
    url: "https://www.csdn.net",
    description: "国内老牌技术社区，涵盖博客、课程与下载资源。",
    coreFeatures: "技术博客、问答、课程",
    category: "learning",
    tags: ["社区", "博客"],
    hotScore: 92,
    recommendScore: 80
  },
  {
    id: "bilibili-tech",
    name: "B站技术区",
    url: "https://www.bilibili.com/v/technology",
    description: "大量前端、后端与计算机基础视频教程聚集地。",
    coreFeatures: "视频学习、弹幕互动、合集收藏",
    category: "learning",
    tags: ["视频", "教程"],
    hotScore: 94,
    recommendScore: 89
  },
  {
    id: "unDraw",
    name: "unDraw 插画库",
    url: "https://undraw.co/illustrations",
    description: "开源插画库，支持根据品牌色即时重新上色。",
    coreFeatures: "SVG 插画、商业可用、主题色适配",
    category: "resource",
    tags: ["插画", "设计"],
    hotScore: 83,
    recommendScore: 88
  },
  {
    id: "figma-community",
    name: "Figma 社区",
    url: "https://www.figma.com/community",
    description: "涵盖设计系统、组件库与原型模板的设计资源集合。",
    coreFeatures: "设计系统、组件模板、社区分享",
    category: "resource",
    tags: ["设计", "组件库"],
    hotScore: 90,
    recommendScore: 92
  },
  {
    id: "fonts-google",
    name: "Google Fonts",
    url: "https://fonts.google.com",
    description: "免费字体资源平台，支持多语言与在线预览。",
    coreFeatures: "可商用字体、多语言、在线预览",
    category: "resource",
    tags: ["字体", "前端"],
    hotScore: 86,
    recommendScore: 84
  },
  {
    id: "chatgpt",
    name: "ChatGPT",
    url: "https://chat.openai.com",
    description: "自然语言对话助手，支持代码生成、文案润色与学习辅导。",
    coreFeatures: "对话、代码建议、内容创作",
    category: "ai",
    tags: ["AI 助手", "编程"],
    hotScore: 99,
    recommendScore: 98
  },
  {
    id: "claude",
    name: "Claude",
    url: "https://claude.ai",
    description: "擅长长文档理解与知识整理的 AI 助手。",
    coreFeatures: "长文本分析、总结归纳、知识管理",
    category: "ai",
    tags: ["AI 助手", "知识库"],
    hotScore: 93,
    recommendScore: 95
  },
  {
    id: "cursor",
    name: "Cursor",
    url: "https://www.cursor.com",
    description: "面向开发者的 AI 编辑器，提供代码补全与重构能力。",
    coreFeatures: "代码补全、重构建议、项目理解",
    category: "ai",
    tags: ["AI 编程", "IDE"],
    hotScore: 91,
    recommendScore: 94
  },
  {
    id: "midjourney",
    name: "Midjourney",
    url: "https://www.midjourney.com",
    description: "高质量 AI 作图工具，适合封面、插画与灵感草图。",
    coreFeatures: "文生图、高质量插画、风格多样",
    category: "ai",
    tags: ["AI 绘画", "设计"],
    hotScore: 89,
    recommendScore: 90
  }
];

type SortKey = "hot" | "recommend";

function ToolsPage() {
  const [activeCategory, setActiveCategory] =
    React.useState<ToolboxCategory>("tool");
  const [search, setSearch] = React.useState("");
  const [sortKey, setSortKey] = React.useState<SortKey>("hot");
  const [favourites, setFavourites] = React.useState<Set<string>>(
    () => new Set()
  );

  const filteredSites = React.useMemo(() => {
    const keyword = search.trim().toLowerCase();
    let list = toolboxSites.filter(
      site => site.category === activeCategory
    );
    if (keyword) {
      list = list.filter(site => {
        const base =
          site.name.toLowerCase() +
          site.description.toLowerCase() +
          site.coreFeatures.toLowerCase() +
          site.tags.join("").toLowerCase();
        return base.includes(keyword);
      });
    }
    const sorted = [...list].sort((a, b) => {
      if (sortKey === "hot") {
        return b.hotScore - a.hotScore;
      }
      return b.recommendScore - a.recommendScore;
    });
    return sorted;
  }, [activeCategory, search, sortKey]);

  const handleToggleFavourite = (id: string) => {
    setFavourites(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleOpenSite = (url: string) => {
    try {
      window.open(url, "_blank", "noopener,noreferrer");
    } catch {
      void 0;
    }
  };

  return (
    <section className="min-h-screen px-[var(--content-padding)] py-10 flex flex-col gap-8">
      <div className="max-w-6xl mx-auto w-full space-y-4">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl md:text-3xl font-semibold">
            百宝袋 · 常用网站与 AI 工具集
          </h1>
          <p className="text-xs md:text-sm text-[var(--text-color-secondary)]">
            按场景分区管理你常用的工具网站，一键跳转、便于收藏与对比。
          </p>
        </div>
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <AdminTabs
            aria-label="Toolbox Categories"
            selectedKey={activeCategory}
            onSelectionChange={key =>
              setActiveCategory(key as ToolboxCategory)
            }
            className="w-full md:w-auto"
            classNames={{
              tab: "text-[1rem] h-10 px-5",
              tabList: "gap-1"
            }}
          >
            <Tab key="tool" title="实用工具" />
            <Tab key="learning" title="学习类" />
            <Tab key="resource" title="资源素材" />
            <Tab key="ai" title="AI 网站" />
          </AdminTabs>
          <div className="flex flex-1 items-center justify-end gap-3 w-full md:w-auto">
            <Input
              className="max-w-xs"
              size="sm"
              radius="full"
              variant="bordered"
              placeholder="搜索网站名称 / 简介 / 功能关键字"
              value={search}
              onValueChange={setSearch}
              startContent={
                <FiSearch className="text-[var(--text-color-secondary)]" />
              }
              isClearable
            />
            <div className="flex items-center gap-2">
              <span className="hidden md:inline text-[11px] text-[var(--text-color-secondary)]">
                排序
              </span>
              <Button
                size="sm"
                radius="full"
                variant={sortKey === "hot" ? "solid" : "light"}
                startContent={<FiTrendingUp className="w-4 h-4" />}
                onPress={() => setSortKey("hot")}
              >
                热度
              </Button>
              <Button
                size="sm"
                radius="full"
                variant={sortKey === "recommend" ? "solid" : "light"}
                startContent={<FiStar className="w-4 h-4" />}
                onPress={() => setSortKey("recommend")}
              >
                推荐
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredSites.map(site => {
            const isFavourite = favourites.has(site.id);
            const initials = site.name
              .split(" ")
              .map(part => part[0])
              .join("")
              .slice(0, 2)
              .toUpperCase();
            return (
              <Card
                key={site.id}
                className="group relative h-full bg-[var(--bg-elevated)] border border-[color-mix(in_srgb,var(--border-color)_90%,transparent)] transition-transform duration-200 hover:-translate-y-1 hover:border-[var(--primary-color)]/70 hover:shadow-[0_18px_45px_rgba(15,23,42,0.75)]"
              >
                <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-sky-400/0 via-sky-400/70 to-emerald-400/0 opacity-70" />
                <div className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-br from-sky-500/70 via-purple-500/70 to-emerald-400/70 flex items-center justify-center text-sm font-semibold text-white">
                        <span>{initials}</span>
                      </div>
                      <div className="space-y-1">
                        <div className="text-sm font-semibold">{site.name}</div>
                        <div className="flex flex-wrap gap-1">
                          {site.tags.map(tag => (
                            <Chip
                              key={tag}
                              size="sm"
                              radius="full"
                              variant="flat"
                              className="h-5 text-[10px] bg-[color-mix(in_srgb,var(--primary-color)_10%,transparent)] text-[var(--primary-color)]"
                            >
                              {tag}
                            </Chip>
                          ))}
                        </div>
                      </div>
                    </div>
                    <Button
                      isIconOnly
                      size="sm"
                      radius="full"
                      variant={isFavourite ? "solid" : "light"}
                      className={
                        isFavourite
                          ? "bg-danger text-white"
                          : "text-[var(--text-color-secondary)]"
                      }
                      onPress={() => handleToggleFavourite(site.id)}
                    >
                      <FiHeart className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-[11px] leading-relaxed text-[var(--text-color-secondary)] line-clamp-3 group-hover:line-clamp-none transition-all duration-200">
                    {site.description}
                  </p>
                  <div className="text-[11px] text-[var(--text-color-secondary)]">
                    <span className="font-medium text-[var(--text-color)]">
                      核心功能：
                    </span>{" "}
                    {site.coreFeatures}
                  </div>
                </div>
                <div className="px-4 pb-4 flex items-center justify-between gap-3">
                  <div className="flex flex-col gap-1 text-[11px] text-[var(--text-color-secondary)]">
                    <span>
                      热度指数：{" "}
                      <span className="text-[var(--primary-color)] font-semibold">
                        {site.hotScore}
                      </span>
                    </span>
                    <span>
                      推荐指数：{" "}
                      <span className="text-emerald-400 font-semibold">
                        {site.recommendScore}
                      </span>
                    </span>
                  </div>
                  <Button
                    size="sm"
                    radius="full"
                    className="bg-[var(--primary-color)] text-black font-medium shadow-[0_12px_32px_rgba(56,189,248,0.55)]"
                    endContent={<FiExternalLink className="w-4 h-4" />}
                    onPress={() => handleOpenSite(site.url)}
                  >
                    访问网站
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
        {filteredSites.length === 0 && (
          <div className="py-16 text-center text-[var(--text-color-secondary)] text-sm">
            未找到匹配的网站，请尝试更换分类或关键字。
          </div>
        )}
      </div>
    </section>
  );
}

export default ToolsPage;
