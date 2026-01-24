import { HomeVideo, HomeArticle, HomeReview, FeatureCard, HomeSlide } from "../../front/home";

export const mockFeatureCards: FeatureCard[] = [
  {
    title: "轻量化知识库管理工具",
    description:
      "为开发者打造高效创作、知识沉淀与协作的一站式平台，支持双模式编辑与版本回溯。",
    tag: "主要用处"
  },
  {
    title: "多形式教程指南",
    description:
      "配套视频教程 + 图文文档，从基础操作到高阶定制全覆盖，新手也能快速上手。",
    tag: "视频文档"
  },
  {
    title: "随时随地高效访问",
    description:
      "全终端响应式设计，移动端支持手势滑动和触屏优化，通勤出差也能高效整理内容。",
    tag: "移动端适配"
  },
  {
    title: "简历在线编写",
    description:
      "在线编写与管理简历，支持多套模板随时切换，一键导出，无水印限制。",
    tag: "简历在线编写"
  },
  {
    title: "共建开源技术社区",
    description:
      "欢迎开发者提交功能建议与代码贡献，一起完善工具生态，拓展技术交流圈。",
    tag: "加入我们"
  }
];

export const mockHomeSlides: HomeSlide[] = [
  {
    id: "301",
    tag: "核心能力",
    title: "轻量化知识库管理",
    description:
      "为开发者打造的一站式知识沉淀平台，支持双模式编辑、版本回溯与多维标签管理。",
    features: [mockFeatureCards[0], mockFeatureCards[2]],
    featureList: mockFeatureCards.slice(0, 3),
    previewType: "kanban"
  },
  {
    id: "302",
    tag: "学习资源",
    title: "多形式教程指南",
    description:
      "配套视频教程与图文文档，从基础操作到高阶定制全覆盖，新手也能快速上手。",
    features: [mockFeatureCards[1], mockFeatureCards[2]],
    featureList: mockFeatureCards.slice(1, 4),
    previewType: "list"
  },
  {
    id: "303",
    tag: "成长连接",
    title: "简历与开源社区",
    description:
      "在线编写简历，一键导出无水印。加入开源社区，与开发者共同完善工具生态。",
    features: [mockFeatureCards[3], mockFeatureCards[4]],
    featureList: mockFeatureCards.slice(2, 5),
    previewType: "profile"
  }
];

export const mockHomeVideos: HomeVideo[] = [
  {
    id: "101",
    title: "从 0 搭建个人知识库前端",
    description: "本视频将带你从零开始，使用 React + Tailwind CSS 搭建一个现代化的个人知识库前端界面。涵盖响应式布局、动态路由与交互动效设计。",
    views: "1.2k",
    date: "2026-01-05",
    cover: "/DefaultImage/MyDefaultHomeVodie.png",
    sources: "/videoTest/【鸣潮_千咲】_Luna - Unveil feat.ねんね.mp4"
  },
  {
    id: "107",
    title: "用 Three.js 打造首页 3D Banner",
    description: "探索 Three.js 的奥秘，学习如何为你的网站首页添加引人入胜的 3D 视觉效果。我们将实现一个粒子背景和简单的几何体交互。",
    views: "856",
    date: "2026-01-08",
    cover: "/DefaultImage/MyDefaultHomeVodie.png",
    sources: "/videoTest/【鸣潮_千咲】_Luna - Unveil feat.ねんね.mp4"
  },
  {
    id: "108",
    title: "一文吃透 React Router 7 新特性",
    description: "React Router 7 带来了许多激动人心的新功能，包括数据加载优化、简化的 API 以及更好的类型支持。本视频将一一为你拆解。",
    views: "2.1k",
    date: "2026-01-10",
    cover: "/DefaultImage/MyDefaultHomeVodie.png",
    sources: "/videoTest/【鸣潮_千咲】_Luna - Unveil feat.ねんね.mp4"
  },
  {
    id: "109",
    title: "前端工程化下的内容管理最佳实践",
    description: "在大型前端项目中，如何高效地管理内容与元数据？我们将探讨内容模型设计、自动化发布流程以及与 Headless CMS 的集成。",
    views: "964",
    date: "2026-01-12",
    cover: "/DefaultImage/MyDefaultHomeVodie.png",
    sources: "/videoTest/【鸣潮_千咲】_Luna - Unveil feat.ねんね.mp4"
  }
];

export const mockHomeArticles: HomeArticle[] = [
  {
    id: "211",
    category: "功能介绍",
    title: "轻量化知识库管理：用一个入口收纳所有碎片内容",
    date: "2026-01-02",
    summary:
      "统一收纳代码片段、学习笔记、视频链接与灵感草稿，用结构化的方式管理零散知识，不再到处翻找。支持标签与多维度筛选，为日常开发提供高效的知识底座。",
    views: "1.5k"
  },
  {
    id: "212",
    category: "使用技巧",
    title: "从一篇文档开始，搭建属于自己的知识体系",
    date: "2026-01-06",
    summary:
      "从最常用的几类文档入手，逐步完善目录结构与标签体系。结合搜索与收藏功能，把临时记录慢慢沉淀为可复用的个人知识库。",
    views: "980"
  },
  {
    id: "213",
    category: "案例",
    title: "如何把视频课程拆解成高效可检索的学习笔记",
    date: "2026-01-09",
    summary:
      "针对一门视频课程，拆分章节、提炼关键点、记录问题与思考，再结合时间轴和标签，让后续复习与知识回顾更加轻松高效。",
    views: "2.3k"
  },
  {
    id: "214",
    category: "前端工程化",
    title: "在前端项目中集成知识库小破站的最佳实践",
    date: "2026-01-12",
    summary:
      "将知识库作为前端工程的一部分，通过统一的鉴权、主题系统与接口约定，让知识管理和项目本身形成良性闭环。",
    views: "1.1k"
  },
  {
    id: "215",
    category: "效率提升",
    title: "标签、搜索与多维过滤：三步提升检索效率",
    date: "2026-01-15",
    summary:
      "合理设计标签、分类与搜索关键字，配合多维过滤与排序，让知识库从“堆文档”变成真正可用的检索工具。",
    views: "1.9k"
  },
  {
    id: "216",
    category: "成长记录",
    title: "用时间轴视角回顾自己的学习与项目历程",
    date: "2026-01-18",
    summary:
      "通过时间维度串联学习记录与项目实践，帮助自己回顾成长轨迹，也方便面试或写总结时快速检索关键节点。",
    views: "1.2k"
  },
  {
    id: "217",
    category: "简历",
    title: "和在线简历编辑联动，一键生成简历素材库",
    date: "2026-01-20",
    summary:
      "把项目经历、技术栈与成果拆分为可复用的结构化条目，和简历在线编辑器联动，实现多版本简历快速拼装。",
    views: "1.4k"
  },
  {
    id: "218",
    category: "社区",
    title: "和其他开发者一起共建知识库模板与组件",
    date: "2026-01-22",
    summary:
      "通过分享模板、组件与最佳实践，一起探索更适合开发者的知识管理方式，让小破站在社区的帮助下持续进化。",
    views: "860"
  },
  {
    id: "219",
    category: "进阶玩法",
    title: "结合三方服务实现知识库自动化更新",
    date: "2026-01-24",
    summary:
      "通过接入 RSS、GitHub、视频平台等第三方服务，将高价值内容自动同步到知识库中，实现半自动化的内容收集流程。",
    views: "620"
  },
  {
    id: "220",
    category: "规划",
    title: "未来规划：从个人小站走向协作知识空间",
    date: "2026-01-26",
    summary:
      "展望未来在团队协作、权限管理、多终端同步等方向的演进计划，让小破站逐步从个人学习工具成长为协作平台。",
    views: "3.1k"
  }
];

export const mockHomeReviews: HomeReview[] = [
  {
    id: "801",
    name: "Alex",
    role: "前端开发工程师",
    source: "掘金评论",
    date: "2026-01-06",
    content:
      "平时零散记的代码片段、环境配置笔记太多了，小破站这种更贴近开发者的知识库形态非常对胃口，比传统笔记软件更有结构感。",
    tone: "positive"
  },
  {
    id: "802",
    name: "木子",
    role: "独立开发者",
    source: "Twitter DM",
    date: "2026-01-09",
    content:
      "很喜欢首页这一系列动效，不是那种为了炫技的特效，而是恰到好处地表达了产品气质，看得出在交互节奏上做了不少打磨。",
    tone: "positive"
  },
  {
    id: "803",
    name: "Yuan",
    role: "全栈工程师",
    source: "GitHub Issues",
    date: "2026-01-12",
    content:
      "把知识库和简历编辑、项目成长记录放在一个站里挺有意思的，能完整串起“学→做→输出”的闭环，期待后续和后台管理打通。",
    tone: "positive"
  },
  {
    id: "804",
    name: "Echo",
    role: "前端新人",
    source: "站内私信",
    date: "2026-01-15",
    content:
      "对新手来说最友好的是推荐内容的引导，从视频到文章都有比较清晰的路径，感觉不会一上来就被大量功能劝退。",
    tone: "positive"
  },
  {
    id: "805",
    name: "Leo",
    role: "技术负责人",
    source: "微信群",
    date: "2026-01-18",
    content:
      "如果后面能把团队协作、权限和监控这些后台能力一起串起来，这个小破站会变成一个很适合团队知识管理与沉淀的“轻平台”。",
    tone: "positive"
  }
];
