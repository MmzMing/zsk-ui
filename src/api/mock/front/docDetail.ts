import { DocDetail, CommentItem } from "../../front/document";

// Helper to generate large mock content
export const generateMockContent = () => {
  let content = `
    <h1 id="title-0">HeroUI 组件库完全指南</h1>
    <p>HeroUI 是一个现代化的 React UI 组件库，基于 Tailwind CSS 构建。本文将详细介绍如何使用它。</p>
    <p>CSDN 风格的目录通常支持多级标题，并且有平滑的滚动定位效果。</p>
  `;

  const sections = [
    "快速开始", "基础组件", "布局系统", "主题定制", "高级用法", 
    "最佳实践", "性能优化", "服务端渲染", "常见问题", "版本日志"
  ];

  sections.forEach((section, i) => {
    content += `<h2 id="heading-${i + 1}">${i + 1}. ${section}</h2>`;
    content += `<p>这是关于 ${section} 的详细介绍。HeroUI 提供了丰富的组件和灵活的 API。</p>`;
    content += `<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>`;
    
    // Level 3
    for (let j = 1; j <= 3; j++) {
      content += `<h3 id="heading-${i + 1}-${j}">${i + 1}.${j} 子章节详情</h3>`;
      content += `<p>深入探讨 ${section} 的第 ${j} 个方面。</p>`;
      content += `<p>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>`;
      
      // Level 4
      if (j === 1) {
        content += `<h4 id="heading-${i + 1}-${j}-1">${i + 1}.${j}.1 核心概念</h4>`;
        content += `<p>这里是核心概念的解释。</p>`;
        
        // Level 5
        content += `<h5 id="heading-${i + 1}-${j}-1-1">${i + 1}.${j}.1.1 实现细节</h5>`;
        content += `<p>非常底层的实现细节，通常只有高级用户需要了解。</p>`;
        content += `<pre>const hero = "ui";\nconsole.log(hero);</pre>`;
      }
    }
  });

  return content;
};

export const mockDocComments: CommentItem[] = [
  {
    id: "601",
    content: "这篇文章写得太好了，受益匪浅！",
    author: { id: "402", name: "前端爱好者", avatar: "" },
    createdAt: "2026-01-24 10:00",
    likes: 12,
    isLiked: false,
    replies: [
      {
        id: "60101",
        content: "同感，尤其是关于组件设计的部分。",
        author: { id: "403", name: "路人乙", avatar: "" },
        createdAt: "2026-01-24 10:05",
        likes: 2,
        isLiked: false
      }
    ]
  },
  {
    id: "602",
    content: "期待下一篇关于性能优化的文章。",
    author: { id: "404", name: "架构师老王", avatar: "" },
    createdAt: "2026-01-24 14:20",
    likes: 8,
    isLiked: true
  }
];

// Mock data for DEV environment
export const mockDocData: DocDetail = {
  id: "201",
  title: "HeroUI 组件库完全指南 - CSDN 风格重构版",
  content: generateMockContent(),
  category: "前端开发",
  date: "2026-01-23",
  coverUrl: "",
  author: {
    id: "401",
    name: "技术写作专家",
    avatar: "",
    fans: "5.6k",
    isFollowing: true
  },
  stats: {
    views: "10.5k",
    likes: 520,
    favorites: 230,
    date: "2026-01-23",
    isLiked: true,
    isFavorited: false
  },
  recommendations: [
    { id: "202", title: "TypeScript 高级进阶", views: "3.2k" },
    { id: "203", title: "Next.js 实战教程", views: "8.9k" },
    { id: "204", title: "React 19 新特性解析", views: "5.1k" },
    { id: "205", title: "Tailwind CSS 最佳实践", views: "4.2k" }
  ]
};
