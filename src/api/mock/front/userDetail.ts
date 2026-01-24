import { UserProfile, UserWorkItem } from "../../front/user";

export const mockUserProfile: UserProfile = {
  id: "401",
  username: "zhiku_master",
  name: "知库小站长",
  avatar: "",
  banner: "https://i0.hdslb.com/bfs/space/cb1c3ef50e22b6096fde67febe863494caefebad.png", // Bilibili style banner
  bio: "个人知识库长期建设实践者，专注前端工程化与知识管理。分享技术，记录生活。",
  level: 6,
  tags: ["前端架构", "全栈开发", "知识管理"],
  location: "上海",
  website: "https://trae.ai",
  stats: {
    followers: 3452,
    following: 128,
    works: 86,
    likes: 12500
  },
  isFollowing: false
};

export const mockUserWorks: UserWorkItem[] = [
  {
    id: "101",
    type: "video",
    title: "从 0 搭建个人知识库前端：架构与页面规划",
    coverUrl: "",
    views: 1200,
    createdAt: "2026-01-20"
  },
  {
    id: "201",
    type: "document",
    title: "知识库小破站 · 需求与设计说明文档",
    coverUrl: "",
    views: 986,
    createdAt: "2026-01-18"
  },
  {
    id: "105",
    type: "video",
    title: "React Bits 动效组件在知识库项目中的落地实践",
    coverUrl: "",
    views: 824,
    createdAt: "2026-01-15"
  },
  {
    id: "206",
    type: "article", // Mapping 'article' to document/article
    title: "如何高效管理个人知识体系",
    coverUrl: "",
    views: 2300,
    createdAt: "2026-01-10"
  },
  {
    id: "106",
    type: "video",
    title: "Next.js 15 新特性前瞻",
    coverUrl: "",
    views: 4500,
    createdAt: "2026-01-05"
  }
];

export const mockUserFavorites: UserWorkItem[] = [
  {
    id: "301",
    type: "video",
    title: "2026年前端趋势展望",
    coverUrl: "",
    views: 5600,
    createdAt: "2026-01-22"
  },
  {
    id: "302",
    type: "document",
    title: "现代 CSS 布局完全指南",
    coverUrl: "",
    views: 3400,
    createdAt: "2026-01-15"
  }
];
