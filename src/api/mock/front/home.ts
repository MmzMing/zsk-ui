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
  },
  {
    id: "304",
    tag: "社区共建",
    title: "开源生态",
    description: "汇聚全球开发者智慧，共同打造开放、透明、持续进化的技术生态系统。",
    features: [mockFeatureCards[4]],
    featureList: mockFeatureCards.slice(3, 5),
    previewType: "list"
  },
  {
    id: "305",
    tag: "多端协作",
    title: "云端同步",
    description: "笔记与代码片段实时同步至云端，无论在何处，都能无缝延续你的灵感与工作进度。",
    features: [mockFeatureCards[2]],
    featureList: mockFeatureCards.slice(1, 4),
    previewType: "kanban"
  },
  {
    id: "306",
    tag: "AI赋能",
    title: "智能检索",
    description: "深度融合 AI 语义理解，支持自然语言提问与关联内容推荐，让海量知识触手可及。",
    features: [mockFeatureCards[0], mockFeatureCards[1]],
    featureList: mockFeatureCards.slice(0, 3),
    previewType: "list"
  }
];

export const mockHomeVideos: HomeVideo[] = [
  {
    id: "101",
    category: "Tutorial",
    duration: "45:20",
    title: "从 0 搭建个人知识库前端",
    description: "本视频将带你从零开始，使用 React + Tailwind CSS 搭建一个现代化的个人知识库前端界面。涵盖响应式布局、动态路由与交互动效设计。",
    views: "1.2k",
    date: "2026-01-05",
    cover: "/DefaultImage/MyDefaultHomeVodie.png",
    sources: "/videoTest/【鸣潮_千咲】_Luna - Unveil feat.ねんね.mp4"
  },
  {
    id: "107",
    category: "Tech Insights",
    duration: "12:45",
    title: "用 Three.js 打造首页 3D Banner",
    description: "探索 Three.js 的奥秘，学习如何为你的网站首页添加引人入胜的 3D 视觉效果。我们将实现一个粒子背景和简单的几何体交互。",
    views: "856",
    date: "2026-01-08",
    cover: "/DefaultImage/MyDefaultHomeVodie.png",
    sources: "/videoTest/【鸣潮_千咲】_Luna - Unveil feat.ねんね.mp4"
  },
  {
    id: "108",
    category: "React",
    duration: "28:15",
    title: "一文吃透 React Router 7 新特性",
    description: "React Router 7 带来了许多激动人心的新功能，包括数据加载优化、简化的 API 以及更好的类型支持。本视频将一一为你拆解。",
    views: "2.1k",
    date: "2026-01-10",
    cover: "/DefaultImage/MyDefaultHomeVodie.png",
    sources: "/videoTest/【鸣潮_千咲】_Luna - Unveil feat.ねんね.mp4"
  },
  {
    id: "109",
    category: "Best Practice",
    duration: "32:10",
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
    role: "全栈开发者",
    source: "Twitter",
    date: "2026-01-15",
    content: "这个项目的完成度令人惊叹！不仅 UI 设计极具现代感，代码结构也非常清晰。我仔细阅读了源码，发现很多值得借鉴的最佳实践，特别是对于状态管理和组件复用的处理，简直是教科书级别的示例。强烈推荐给所有想要进阶 React 的开发者！",
    tone: "positive"
  },
  {
    id: "802",
    name: "Sarah",
    role: "产品设计师",
    source: "Dribbble",
    date: "2026-01-16",
    content: "暗黑模式的设计太棒了，配色非常舒适。",
    tone: "positive"
  },
  {
    id: "803",
    name: "David",
    role: "技术总监",
    source: "GitHub",
    date: "2026-01-18",
    content: "作为一个在这个行业摸爬滚打十年的老兵，我很少对个人项目感到兴奋。但这个‘知识库小破站’是个例外。它完美地融合了博客、文档和个人作品集的功能，而且交互流畅度极高。特别是那个粒子背景效果，既不喧宾夺主，又增添了科技感。非常期待后续的功能更新！",
    tone: "positive"
  },
  {
    id: "804",
    name: "Lisa",
    role: "前端工程师",
    source: "掘金",
    date: "2026-01-19",
    content: "动画效果很丝滑，性能优化也做得很好。",
    tone: "positive"
  },
  {
    id: "805",
    name: "James",
    role: "CTO",
    source: "LinkedIn",
    date: "2026-01-20",
    content: "这正是我们团队一直在寻找的知识管理解决方案的原型。虽然目前还是个人项目，但我看到了它扩展为团队协作工具的巨大潜力。文档编辑体验非常流畅，Markdown 支持也很完善。如果有私有化部署方案，我会毫不犹豫地在公司内部推广。",
    tone: "positive"
  },
  {
    id: "806",
    name: "Emma",
    role: "UI 工程师",
    source: "Product Hunt",
    date: "2026-01-22",
    content: "简洁，优雅，快速。这就是我理想中的知识库。",
    tone: "positive"
  },
  {
    id: "807",
    name: "Michael",
    role: "后端开发",
    source: "Stack Overflow",
    date: "2026-01-24",
    content: "我是做后端的，对前端花哨的东西向来不太感冒。但这个项目让我改观了。它没有过度设计，每一个交互都有其存在的意义。API 文档的自动生成功能非常实用，帮我省去了大量手动维护的时间。这种实用主义与美学的平衡掌握得非常好。",
    tone: "positive"
  },
  {
    id: "808",
    name: "Sophie",
    role: "自由职业者",
    source: "Upwork",
    date: "2026-01-25",
    content: "在移动端的使用体验也出奇的好！通常这类富交互的网站在手机上都会卡顿或者布局错乱，但这个网站完全没有这些问题。响应式布局处理得很细腻，必须给个大大的赞！",
    tone: "positive"
  }
];
