import { VideoDetail, CommentItem } from "../../front/video";

export const mockVideoComments: CommentItem[] = [
  {
    id: "701",
    content: "这个教程太棒了！期待更新！",
    author: { id: "405", name: "前端小菜鸡", avatar: "" },
    createdAt: "2026-01-10 10:00",
    likes: 12,
    isLiked: false,
    replies: [
      {
        id: "70101",
        content: "确实，讲得很清晰",
        author: { id: "406", name: "路人甲", avatar: "" },
        createdAt: "2026-01-10 10:05",
        likes: 2,
        isLiked: false
      }
    ]
  },
  {
    id: "702",
    content: "HeroUI 的组件确实好用，设计感很强。",
    author: { id: "407", name: "UI设计师", avatar: "" },
    createdAt: "2026-01-11 14:20",
    likes: 8,
    isLiked: true
  }
];

export const mockVideoData: VideoDetail = {
  id: "101",
  title: "从 0 搭建个人知识库前端",
  description: "本系列教程将带你从零开始搭建一个现代化的个人知识库前端项目。涵盖技术选型、架构设计、组件开发等全方位内容。\n\n第一集：项目初始化与基础配置\n第二集：路由系统设计与实现\n第三集：布局组件开发与HeroUI集成",
  videoUrl: "/videoTest/【鸣潮_千咲】_Luna - Unveil feat.ねんね.mp4",
  coverUrl: "",
  author: {
    id: "401",
    name: "知库小站长",
    avatar: "",
    fans: "1.2k",
    isFollowing: false
  },
  stats: {
    views: "1.2k",
    likes: 342,
    favorites: 120,
    date: "2026-01-05",
    isLiked: false,
    isFavorited: false
  },
  tags: ["React", "Vite", "HeroUI"],
  recommendations: [
    {
      id: "102",
      title: "HeroUI 组件库深度解析",
      description: "深入了解 HeroUI 组件库的核心原理与最佳实践。",
      authorName: "知库小站长",
      coverUrl: "",
      duration: "12:30",
      views: "800",
      date: "2026-01-10"
    },
    {
      id: "103",
      title: "React 性能优化实战",
      description: "分享 React 项目中常见的性能优化技巧与实战案例。",
      authorName: "知库小站长",
      coverUrl: "",
      duration: "18:45",
      views: "2.3k",
      date: "2026-01-15"
    }
  ],
  episodes: [
    { id: "101", title: "项目初始化", duration: "10:00" },
    { id: "102", title: "路由配置", duration: "15:00" },
    { id: "103", title: "布局组件开发", duration: "20:00" },
    { id: "104", title: "API 封装与拦截器", duration: "12:00" }
  ]
};
