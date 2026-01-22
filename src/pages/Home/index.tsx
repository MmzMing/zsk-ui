import React, { useCallback, useEffect, useMemo, useState, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { Spinner } from "@heroui/react";
import {
  fetchHomeArticles,
  fetchHomeReviews,
  fetchHomeVideos,
  type HomeArticle,
  type HomeReview,
  type HomeVideo
} from "../../api/front/home";
import { routes } from "../../router/routes";
import HomeBanner from "./components/HomeBanner";
import HsrIntroAnimation from "../../components/Motion/HsrIntroAnimation";
import { LazyLoadWrapper } from "../../components/LazyLoadWrapper";

const VideoRecommend = React.lazy(() => import("./components/VideoRecommend"));
const HomeFeatures = React.lazy(() => import("./components/HomeFeatures"));
const ArticleRecommendSection = React.lazy(() =>
  import("./components/ArticleRecommendSection")
);
const ReviewSection = React.lazy(() => import("./components/ReviewSection"));

const LoadingFallback = ({ height }: { height: string }) => (
  <div
    className="flex w-full items-center justify-center"
    style={{ height }}
  >
    <Spinner size="lg" color="primary" label="加载中..." />
  </div>
);

function HomePage() {
  const navigate = useNavigate();
  const [videos, setVideos] = useState<HomeVideo[]>(() => [
    {
      id: "1",
      title: "从 0 搭建个人知识库前端",
      views: "1.2k",
      date: "2026-01-05"
    },
    {
      id: "2",
      title: "用 Three.js 打造首页 3D Banner",
      views: "856",
      date: "2026-01-08"
    },
    {
      id: "3",
      title: "一文吃透 React Router 7 新特性",
      views: "2.1k",
      date: "2026-01-10"
    },
    {
      id: "4",
      title: "前端工程化下的内容管理最佳实践",
      views: "964",
      date: "2026-01-12"
    }
  ]);

  const [articles, setArticles] = useState<HomeArticle[]>(() => [
    {
      id: "a1",
      category: "功能介绍",
      title: "轻量化知识库管理：用一个入口收纳所有碎片内容",
      date: "2026-01-02",
      summary:
        "统一收纳代码片段、学习笔记、视频链接与灵感草稿，用结构化的方式管理零散知识，不再到处翻找。支持标签与多维度筛选，为日常开发提供高效的知识底座。",
      views: "1.5k"
    },
    {
      id: "a2",
      category: "使用技巧",
      title: "从一篇文档开始，搭建属于自己的知识体系",
      date: "2026-01-06",
      summary:
        "从最常用的几类文档入手，逐步完善目录结构与标签体系。结合搜索与收藏功能，把临时记录慢慢沉淀为可复用的个人知识库。",
      views: "980"
    },
    {
      id: "a3",
      category: "案例",
      title: "如何把视频课程拆解成高效可检索的学习笔记",
      date: "2026-01-09",
      summary:
        "针对一门视频课程，拆分章节、提炼关键点、记录问题与思考，再结合时间轴和标签，让后续复习与知识回顾更加轻松高效。",
      views: "2.3k"
    },
    {
      id: "a4",
      category: "前端工程化",
      title: "在前端项目中集成知识库小破站的最佳实践",
      date: "2026-01-12",
      summary:
        "将知识库作为前端工程的一部分，通过统一的鉴权、主题系统与接口约定，让知识管理和项目本身形成良性闭环。",
      views: "1.1k"
    },
    {
      id: "a5",
      category: "效率提升",
      title: "标签、搜索与多维过滤：三步提升检索效率",
      date: "2026-01-15",
      summary:
        "合理设计标签、分类与搜索关键字，配合多维过滤与排序，让知识库从“堆文档”变成真正可用的检索工具。",
      views: "1.9k"
    },
    {
      id: "a6",
      category: "成长记录",
      title: "用时间轴视角回顾自己的学习与项目历程",
      date: "2026-01-18",
      summary:
        "通过时间维度串联学习记录与项目实践，帮助自己回顾成长轨迹，也方便面试或写总结时快速检索关键节点。",
      views: "1.2k"
    },
    {
      id: "a7",
      category: "简历",
      title: "和在线简历编辑联动，一键生成简历素材库",
      date: "2026-01-20",
      summary:
        "把项目经历、技术栈与成果拆分为可复用的结构化条目，和简历在线编辑器联动，实现多版本简历快速拼装。",
      views: "1.4k"
    },
    {
      id: "a8",
      category: "社区",
      title: "和其他开发者一起共建知识库模板与组件",
      date: "2026-01-22",
      summary:
        "通过分享模板、组件与最佳实践，一起探索更适合开发者的知识管理方式，让小破站在社区的帮助下持续进化。",
      views: "860"
    },
    {
      id: "a9",
      category: "进阶玩法",
      title: "结合三方服务实现知识库自动化更新",
      date: "2026-01-24",
      summary:
        "通过接入 RSS、GitHub、视频平台等第三方服务，将高价值内容自动同步到知识库中，实现半自动化的内容收集流程。",
      views: "620"
    },
    {
      id: "a10",
      category: "规划",
      title: "未来规划：从个人小站走向协作知识空间",
      date: "2026-01-26",
      summary:
        "展望未来在团队协作、权限管理、多终端同步等方向的演进计划，让小破站逐步从个人学习工具成长为协作平台。",
      views: "3.1k"
    }
  ]);

  const [reviews, setReviews] = useState<HomeReview[]>(() => [
    {
      id: "r1",
      name: "Alex",
      role: "前端开发工程师",
      source: "掘金评论",
      date: "2026-01-06",
      content:
        "平时零散记的代码片段、环境配置笔记太多了，小破站这种更贴近开发者的知识库形态非常对胃口，比传统笔记软件更有结构感。",
      tone: "positive"
    },
    {
      id: "r2",
      name: "木子",
      role: "独立开发者",
      source: "Twitter DM",
      date: "2026-01-09",
      content:
        "很喜欢首页这一系列动效，不是那种为了炫技的特效，而是恰到好处地表达了产品气质，看得出在交互节奏上做了不少打磨。",
      tone: "positive"
    },
    {
      id: "r3",
      name: "Yuan",
      role: "全栈工程师",
      source: "GitHub Issues",
      date: "2026-01-12",
      content:
        "把知识库和简历编辑、项目成长记录放在一个站里挺有意思的，能完整串起“学→做→输出”的闭环，期待后续和后台管理打通。",
      tone: "positive"
    },
    {
      id: "r4",
      name: "Echo",
      role: "前端新人",
      source: "站内私信",
      date: "2026-01-15",
      content:
        "对新手来说最友好的是推荐内容的引导，从视频到文章都有比较清晰的路径，感觉不会一上来就被大量功能劝退。",
      tone: "positive"
    },
    {
      id: "r5",
      name: "Leo",
      role: "技术负责人",
      source: "微信群",
      date: "2026-01-18",
      content:
        "如果后面能把团队协作、权限和监控这些后台能力一起串起来，这个小破站会变成一个很适合团队知识管理与沉淀的“轻平台”。",
      tone: "positive"
    }
  ]);

  const [activeArticleId, setActiveArticleId] = useState(
    () => articles[0]?.id
  );

  const activeArticle = useMemo(
    () => articles.find(item => item.id === activeArticleId) ?? articles[0],
    [articles, activeArticleId]
  );

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "auto"
    });
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadHomeData() {
      try {
        const [remoteVideos, remoteArticles, remoteReviews] =
          await Promise.all([
            fetchHomeVideos(),
            fetchHomeArticles(),
            fetchHomeReviews()
          ]);

        if (cancelled) {
          return;
        }

        if (remoteVideos && remoteVideos.length > 0) {
          setVideos(remoteVideos);
        }
        if (remoteArticles && remoteArticles.length > 0) {
          setArticles(remoteArticles);
          if (!activeArticleId) {
            setActiveArticleId(remoteArticles[0]?.id);
          }
        }
        if (remoteReviews && remoteReviews.length > 0) {
          setReviews(remoteReviews);
        }
      } catch (error) {
        console.error("加载首页推荐数据失败", error);
      }
    }

    loadHomeData();

    return () => {
      cancelled = true;
    };
  }, [activeArticleId]);

  const handleArticleClick = useCallback(
    (id: string) => {
      navigate(routes.docDetail.replace(":id", id));
    },
    [navigate]
  );

  const handleArticleChange = useCallback((id: string) => {
    setActiveArticleId(id);
  }, []);

  const handleArticleNavigate = useCallback(
    (id: string) => {
      handleArticleClick(id);
    },
    [handleArticleClick]
  );

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <HsrIntroAnimation />
      <HomeBanner />

      <LazyLoadWrapper minHeight="400px" rootMargin="800px">
        <Suspense fallback={<LoadingFallback height="400px" />}>
          <VideoRecommend items={videos} />
        </Suspense>
      </LazyLoadWrapper>

      <LazyLoadWrapper minHeight="500px" rootMargin="800px">
        <Suspense fallback={<LoadingFallback height="500px" />}>
          <HomeFeatures />
        </Suspense>
      </LazyLoadWrapper>

      <LazyLoadWrapper minHeight="600px" rootMargin="800px">
        <Suspense fallback={<LoadingFallback height="600px" />}>
          <ArticleRecommendSection
            articles={articles}
            activeArticle={activeArticle}
            onArticleChange={handleArticleChange}
            onArticleNavigate={handleArticleNavigate}
          />
        </Suspense>
      </LazyLoadWrapper>

      <LazyLoadWrapper minHeight="400px" rootMargin="800px">
        <Suspense fallback={<LoadingFallback height="400px" />}>
          <ReviewSection reviews={reviews} />
        </Suspense>
      </LazyLoadWrapper>
    </div>
  );
}

export default HomePage;
