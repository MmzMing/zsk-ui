import type { ReviewQueueItem, ReviewLogItem, UploadTaskItem, VideoItem } from "../../admin/video";

export const mockVideoUploadTasks: UploadTaskItem[] = [
  {
    id: "4101",
    title: "从 0 搭建个人知识库前端",
    fileName: "kb-front-bootcamp-01.mp4",
    category: "前端基础",
    size: 512 * 1024 * 1024,
    status: "success",
    progress: 100,
    isAiChecked: true,
    aiRiskLevel: "low",
    createdAt: "2026-01-18 10:20:00"
  },
  {
    id: "4102",
    title: "如何把零散笔记整理成知识库",
    fileName: "kb-note-organize-02.mp4",
    category: "效率方法",
    size: 384 * 1024 * 1024,
    status: "uploading",
    progress: 62,
    isAiChecked: false,
    createdAt: "2026-01-18 10:32:15"
  },
  {
    id: "4103",
    title: "前端工程化下的内容管理实践",
    fileName: "kb-content-engineering-03.mp4",
    category: "工程实践",
    size: 728 * 1024 * 1024,
    status: "error",
    progress: 37,
    isAiChecked: false,
    createdAt: "2026-01-18 10:05:42"
  }
];

export const mockVideoDrafts = [
  {
    id: "4201",
    title: "TypeScript 高级进阶技巧",
    category: "前端开发",
    description: "深入探讨 TypeScript 中的高级类型、装饰器以及元编程技巧。",
    createdAt: "2026-01-15 09:00:00",
    updatedAt: "2026-01-16 14:30:00"
  },
  {
    id: "4202",
    title: "Node.js 微服务架构实战",
    category: "后端开发",
    description: "从零开始构建一个基于 Node.js 的微服务系统，涵盖服务注册、网关与链路追踪。",
    createdAt: "2026-01-17 11:20:00",
    updatedAt: "2026-01-17 11:20:00"
  }
];

export const mockVideoCategories = [
  {
    id: "1",
    name: "前端开发",
    children: [
      { id: "101", name: "React" },
      { id: "102", name: "Vue" },
      { id: "103", name: "Angular" },
      { id: "104", name: "HTML / CSS" },
      { id: "105", name: "工程化" }
    ]
  },
  {
    id: "2",
    name: "后端开发",
    children: [
      { id: "201", name: "Java" },
      { id: "202", name: "Python" },
      { id: "203", name: "Go" },
      { id: "204", name: "Node.js" },
      { id: "205", name: "微服务" }
    ]
  },
  {
    id: "3",
    name: "计算机基础",
    children: [
      { id: "301", name: "计算机网络" },
      { id: "302", name: "操作系统" },
      { id: "303", name: "数据结构与算法" }
    ]
  },
  {
    id: "4",
    name: "人工智能",
    children: [
      { id: "401", name: "机器学习" },
      { id: "402", name: "深度学习" },
      { id: "403", name: "计算机视觉" },
      { id: "404", name: "自然语言处理" }
    ]
  },
  {
    id: "5",
    name: "其他",
    children: [
      { id: "501", name: "生活" },
      { id: "502", name: "游戏" },
      { id: "503", name: "音乐" }
    ]
  }
];

export const mockTagOptions = [
  { id: "1", name: "教程" },
  { id: "2", name: "Vlog" },
  { id: "3", name: "测评" },
  { id: "4", name: "游戏" },
  { id: "5", name: "音乐" },
  { id: "6", name: "科技" },
  { id: "7", name: "编程" },
  { id: "8", name: "职场" },
  { id: "9", name: "生活" }
];

export const mockInitialAiQueueItems: ReviewQueueItem[] = [
  {
    id: "4003",
    title: "敏感词检测示例视频 01",
    uploader: "editor",
    category: "内容管理",
    status: "pending",
    riskLevel: "high",
    isAiChecked: true,
    createdAt: "2026-01-18 10:20:01"
  },
  {
    id: "4004",
    title: "评论区易引发争议的案例",
    uploader: "editor",
    category: "运营案例",
    status: "pending",
    riskLevel: "medium",
    isAiChecked: true,
    createdAt: "2026-01-18 10:18:32"
  }
];

export const mockInitialManualQueueItems: ReviewQueueItem[] = [
  {
    id: "4001",
    title: "从 0 搭建个人知识库前端",
    uploader: "admin",
    category: "工程实践",
    status: "pending",
    riskLevel: "low",
    isAiChecked: true,
    createdAt: "2026-01-18 10:05:00"
  },
  {
    id: "4002",
    title: "Next.js 14 新特性演示",
    uploader: "user_007",
    category: "技术分享",
    status: "pending",
    riskLevel: "low",
    isAiChecked: false,
    createdAt: "2026-01-18 09:45:12"
  }
];

// Combine existing items and add more to reach 13 items
export const mockReviewQueueItems: ReviewQueueItem[] = [
  {
    id: "4005",
    title: "Vue 3 源码解析 - 响应式原理",
    uploader: "tech_guru",
    category: "前端开发",
    status: "pending",
    riskLevel: "low",
    isAiChecked: true,
    createdAt: "2026-01-18 09:30:00"
  },
  {
    id: "4006",
    title: "Rust 语言入门指南",
    uploader: "rust_fan",
    category: "后端开发",
    status: "pending",
    riskLevel: "low",
    isAiChecked: true,
    createdAt: "2026-01-18 09:15:00"
  },
  {
    id: "4007",
    title: "Kubernetes 集群部署实战",
    uploader: "devops_expert",
    category: "运维部署",
    status: "pending",
    riskLevel: "medium",
    isAiChecked: true,
    createdAt: "2026-01-18 09:00:00"
  },
  {
    id: "4008",
    title: "Figma 插件开发教程",
    uploader: "design_pro",
    category: "设计美工",
    status: "pending",
    riskLevel: "low",
    isAiChecked: true,
    createdAt: "2026-01-18 08:45:00"
  },
  {
    id: "4009",
    title: "Midjourney 提示词工程",
    uploader: "ai_artist",
    category: "人工智能",
    status: "pending",
    riskLevel: "high",
    isAiChecked: true,
    createdAt: "2026-01-18 08:30:00"
  },
  {
    id: "4010",
    title: "Python 数据分析实战",
    uploader: "data_scientist",
    category: "数据分析",
    status: "pending",
    riskLevel: "low",
    isAiChecked: true,
    createdAt: "2026-01-18 08:15:00"
  },
  {
    id: "4011",
    title: "Go 语言高并发编程",
    uploader: "go_master",
    category: "后端开发",
    status: "pending",
    riskLevel: "low",
    isAiChecked: true,
    createdAt: "2026-01-18 08:00:00"
  },
  {
    id: "4012",
    title: "Unity 游戏开发入门",
    uploader: "game_dev",
    category: "游戏开发",
    status: "pending",
    riskLevel: "low",
    isAiChecked: true,
    createdAt: "2026-01-18 07:45:00"
  },
  {
    id: "4013",
    title: "Docker 容器化部署",
    uploader: "docker_user",
    category: "运维部署",
    status: "pending",
    riskLevel: "low",
    isAiChecked: true,
    createdAt: "2026-01-18 07:30:00"
  }
];

export const mockReviewLogs: ReviewLogItem[] = [
  {
    id: "5001",
    videoId: "4001",
    title: "从 0 搭建个人知识库前端",
    reviewer: "auditor",
    reviewedAt: "2026-01-18 10:30:12",
    result: "approved",
    remark: "内容健康，适合公开播放。"
  },
  {
    id: "5002",
    videoId: "4003",
    title: "敏感词检测示例视频 01",
    reviewer: "auditor",
    reviewedAt: "2026-01-18 10:12:45",
    result: "rejected",
    remark: "涉及高风险敏感词，建议重新剪辑后再提交。"
  },
  {
    id: "5003",
    videoId: "4002",
    title: "如何把零散笔记整理成知识库",
    reviewer: "auditor",
    reviewedAt: "2026-01-17 15:20:00",
    result: "approved",
    remark: "干货满满，推荐通过。"
  },
  {
    id: "5004",
    videoId: "4005",
    title: "未命名视频_20260117",
    reviewer: "system",
    reviewedAt: "2026-01-17 09:00:00",
    result: "rejected",
    remark: "AI 检测发现大量违规画面（置信度 98%）。"
  }
];

export const mockViolationReasons = [
  { id: "v1", label: "色情低俗" },
  { id: "v2", label: "政治敏感" },
  { id: "v3", label: "暴力血腥" },
  { id: "v4", label: "版权争议" },
  { id: "v5", label: "广告营销" },
  { id: "v6", label: "不实信息" },
  { id: "v7", label: "其他违规" }
];

export const mockComments = [
  {
    id: "c1",
    videoId: "4001",
    username: "前端小白",
    avatar: "https://i.pravatar.cc/150?u=c1",
    content: "非常有用的教程，学到了很多工程化实践！",
    createdAt: "2026-01-15 10:30:00",
  },
  {
    id: "c2",
    videoId: "4001",
    username: "React架构师",
    avatar: "https://i.pravatar.cc/150?u=c2",
    content: "期待下一期关于性能优化的分享。",
    createdAt: "2026-01-16 14:20:00",
  },
  {
    id: "c3",
    videoId: "4002",
    username: "效率达人",
    avatar: "https://i.pravatar.cc/150?u=c3",
    content: "这个笔记整理法真的很赞，已经开始用了。",
    createdAt: "2026-01-17 09:15:00",
  },
];

export const mockVideos: VideoItem[] = [
  {
    id: "4001",
    title: "从 0 搭建个人知识库前端",
    category: "工程实践",
    description: "本课程详细讲解如何从零开始搭建一个属于自己的个人知识库前端系统，涵盖技术选型、架构设计及核心功能实现。",
    status: "published",
    duration: "18:24",
    plays: 3289,
    likes: 421,
    comments: 63,
    createdAt: "2026-01-10 09:20:11",
    updatedAt: "2026-01-12 14:32:45",
    pinned: true,
    recommended: true,
    cover: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&auto=format&fit=crop&q=60",
    tags: ["React", "工程化"],
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4"
  },
  {
    id: "4002",
    title: "如何把零散笔记整理成知识库",
    category: "效率方法",
    description: "分享高效的笔记整理方法论，教你如何将碎片化的信息构建成体系化的知识网络，提升学习与工作效率。",
    status: "published",
    duration: "23:10",
    plays: 2410,
    likes: 356,
    comments: 48,
    createdAt: "2026-01-11 10:05:00",
    updatedAt: "2026-01-13 10:18:22",
    recommended: true,
    cover: "https://images.unsplash.com/photo-1456324504439-367cee13d652?w=800&auto=format&fit=crop&q=60",
    tags: ["笔记", "效率"],
    videoUrl: "https://www.w3schools.com/html/movie.mp4"
  },
  {
    id: "4003",
    title: "React 19 下的前端工程化实践",
    category: "前端基础",
    description: "深入探讨 React 19 新特性在实际工程中的应用，分析其对前端构建工具链及开发模式的影响。",
    status: "draft",
    duration: "31:42",
    plays: 0,
    likes: 0,
    comments: 0,
    createdAt: "2026-01-12 16:08:33",
    updatedAt: "2026-01-12 16:08:33",
    cover: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&auto=format&fit=crop&q=60",
    tags: ["React 19", "前端"],
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4"
  },
  {
    id: "4004",
    title: "用知识库管理你的职业成长",
    category: "个人成长",
    description: "职业发展需要规划与记录，本视频介绍如何利用知识库工具追踪个人成长轨迹，辅助职业决策。",
    status: "offline",
    duration: "19:56",
    plays: 980,
    likes: 112,
    comments: 15,
    createdAt: "2026-01-08 11:22:11",
    updatedAt: "2026-01-15 09:02:47",
    cover: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&auto=format&fit=crop&q=60",
    tags: ["职业成长", "规划"],
    videoUrl: "https://www.w3schools.com/html/movie.mp4"
  },
  {
    id: "4005",
    title: "系统设计入门：从单机到集群",
    category: "系统设计",
    description: "系统设计经典入门教程，通过案例演示如何将一个单机应用逐步演进为高可用、高性能的分布式集群架构。",
    status: "published",
    duration: "45:12",
    plays: 1520,
    likes: 210,
    comments: 32,
    createdAt: "2026-01-15 14:20:00",
    updatedAt: "2026-01-16 10:00:00",
    recommended: true,
    pinned: true,
    cover: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=60",
    tags: ["系统设计", "架构"],
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4"
  }
];
