import { SearchResult } from "../../front/search";

const VIDEO_DEFAULT = "/DefaultImage/MyDefaultHomeVodie.png";
const DOC_DEFAULT = "/DefaultImage/MyDefaultImage.jpg";

export const mockSearchResults: SearchResult[] = [
  {
    id: "101",
    type: "video",
    title: "React 19 新特性深度解析",
    description: "全面讲解 React 19 的新特性，包括 Compiler、Actions 等核心概念。",
    thumbnail: VIDEO_DEFAULT,
    author: "TechMaster",
    authorId: "401",
    authorAvatar: "https://i.pravatar.cc/150?u=1",
    timeRange: "2024-01-15",
    duration: "45:20",
    playCount: 12000,
    commentCount: 850,
    category: "React",
    tags: ["前端", "React", "代码"]
  },
  {
    id: "201",
    type: "document",
    title: "TypeScript 高级进阶指南",
    description: "深入理解 TypeScript 类型系统，掌握高级泛型和装饰器用法。",
    thumbnail: DOC_DEFAULT,
    author: "CodeWizard",
    authorId: "401",
    authorAvatar: "https://i.pravatar.cc/150?u=2",
    timeRange: "2024-01-10",
    readCount: 5600,
    favoriteCount: 420,
    category: "设计稿",
    tags: ["前端", "TypeScript"]
  },
  {
    id: "102",
    type: "video",
    title: "Tailwind CSS 实战教程",
    description: "从零开始构建一个美观的响应式管理后台界面。",
    thumbnail: VIDEO_DEFAULT,
    author: "CSSNinja",
    authorId: "401",
    authorAvatar: "https://i.pravatar.cc/150?u=3",
    timeRange: "2024-01-05",
    duration: "32:15",
    playCount: 8500,
    commentCount: 320,
    category: "前端",
    tags: ["前端", "CSS", "UI"]
  },
  {
    id: "202",
    type: "document",
    title: "Node.js 性能优化实践",
    description: "探讨 Node.js 在高并发场景下的性能瓶颈与优化方案。",
    thumbnail: DOC_DEFAULT,
    author: "BackendPro",
    authorId: "401",
    authorAvatar: "https://i.pravatar.cc/150?u=4",
    timeRange: "2023-12-28",
    readCount: 3200,
    favoriteCount: 180,
    category: "随笔",
    tags: ["后端", "Node.js"]
  },
  {
    id: "301",
    type: "tool",
    title: "Vite 5.0 插件开发工具箱",
    description: "一套用于快速开发 Vite 插件的脚手架 and 工具集。",
    thumbnail: DOC_DEFAULT,
    author: "ViteTeam",
    authorId: "401",
    authorAvatar: "https://i.pravatar.cc/150?u=5",
    timeRange: "2023-12-20",
    usageCount: 1500,
    category: "实用工具",
    tags: ["工具", "Vite"]
  },
  {
    id: "401",
    type: "user",
    title: "知库小站长",
    description: "专注于 React 生态 and 前端架构，分享多年开发经验。",
    avatar: "public/Avatar/MyAvatar.jpg",
    followers: 12000,
    works: 45,
    category: "创作者",
    tags: ["专家", "React"]
  }
];
