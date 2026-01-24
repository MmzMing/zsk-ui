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
    duration: "45:20",
    playCount: 12000,
    commentCount: 850,
    tags: ["前端", "React", "代码"]
  },
  {
    id: "201",
    type: "document",
    title: "TypeScript 高级进阶指南",
    description: "深入理解 TypeScript 类型系统，掌握高级泛型和装饰器用法。",
    thumbnail: DOC_DEFAULT,
    readCount: 5600,
    favoriteCount: 420,
    tags: ["前端", "TypeScript"]
  },
  {
    id: "102",
    type: "video",
    title: "Tailwind CSS 实战教程",
    description: "从零开始构建一个美观的响应式管理后台界面。",
    thumbnail: VIDEO_DEFAULT,
    duration: "32:15",
    playCount: 8500,
    commentCount: 320,
    tags: ["前端", "CSS", "UI"]
  },
  {
    id: "202",
    type: "document",
    title: "Node.js 性能优化实践",
    description: "探讨 Node.js 在高并发场景下的性能瓶颈与优化方案。",
    thumbnail: DOC_DEFAULT,
    readCount: 3200,
    favoriteCount: 180,
    tags: ["后端", "Node.js"]
  },
  {
    id: "301",
    type: "tool",
    title: "Vite 5.0 插件开发工具箱",
    description: "一套用于快速开发 Vite 插件的脚手架和工具集。",
    thumbnail: DOC_DEFAULT,
    usageCount: 1500,
    tags: ["工具", "Vite"]
  },
  {
    id: "401",
    type: "user",
    title: "前端技术专家 - 阿强",
    description: "专注于 React 生态和前端架构，分享多年开发经验。",
    avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704d",
    followers: 12000,
    works: 45,
    tags: ["专家", "React"]
  }
];
