import {
  DocTag,
  DocumentDetail,
  DocumentItem,
  DocumentReviewItem,
  DocumentReviewLogItem,
  DocumentUploadTaskItem
} from "../../admin/document";

export const mockTagOptions: DocTag[] = [
  { label: "React", value: "react" },
  { label: "Vue", value: "vue" },
  { label: "TypeScript", value: "typescript" },
  { label: "Next.js", value: "nextjs" },
  { label: "Tailwind", value: "tailwind" },
  { label: "Node.js", value: "nodejs" },
  { label: "Docker", value: "docker" },
  { label: "Figma", value: "figma" }
];

export const mockDocumentUploadTasks: DocumentUploadTaskItem[] = [
  {
    id: "3101",
    title: "如何把视频课程拆解成学习笔记",
    fileName: "course-to-notes.pdf",
    size: 12 * 1024 * 1024,
    status: "success",
    progress: 100,
    createdAt: "2026-01-18 10:20:00"
  },
  {
    id: "3102",
    title: "前端工程化下的内容管理实践",
    fileName: "content-engineering.docx",
    size: 8 * 1024 * 1024,
    status: "uploading",
    progress: 62,
    createdAt: "2026-01-18 10:32:15"
  },
  {
    id: "3103",
    title: "知识库信息架构最佳实践",
    fileName: "kb-ia-best-practices.pptx",
    size: 24 * 1024 * 1024,
    status: "error",
    progress: 37,
    createdAt: "2026-01-18 10:05:42"
  }
];

export const mockDocumentComments = [
  {
    id: "dc1",
    docId: "3001",
    username: "文档控",
    avatar: "https://i.pravatar.cc/150?u=dc1",
    content: "这篇文章总结得太到位了，对我的学习效率提升很大！",
    createdAt: "2026-01-12 10:30:00"
  },
  {
    id: "dc2",
    docId: "3001",
    username: "笔记达人",
    avatar: "https://i.pravatar.cc/150?u=dc2",
    content: "很有启发，期待作者分享更多的拆解方法。",
    createdAt: "2026-01-13 14:20:00"
  },
  {
    id: "dc3",
    docId: "3002",
    username: "架构学徒",
    avatar: "https://i.pravatar.cc/150?u=dc3",
    content: "知识库的前端实现确实有很多细节，这篇文章讲得很透彻。",
    createdAt: "2026-01-14 09:15:00"
  }
];

export const mockDocumentCategories = [
  {
    id: "1",
    name: "技术开发",
    children: [
      { id: "101", name: "前端开发" },
      { id: "102", name: "后端开发" },
      { id: "103", name: "移动端开发" },
      { id: "104", name: "运维部署" }
    ]
  },
  {
    id: "2",
    name: "设计美工",
    children: [
      { id: "201", name: "UI/UX设计" },
      { id: "202", name: "平面设计" },
      { id: "203", name: "动效设计" }
    ]
  },
  {
    id: "3",
    name: "产品管理",
    children: [
      { id: "301", name: "市场调研" },
      { id: "302", name: "产品规划" },
      { id: "303", name: "原型设计" }
    ]
  }
];

export const mockAdminDocument: DocumentDetail = {
  id: "2001",
  title: "示例现有文档",
  content: "<h1>Hello World</h1><p>This is a mock document content.</p>",
  seo: { title: "示例", description: "这是一个示例", keywords: ["test"] },
  category: "前端基础",
  tags: ["test"],
  status: "published"
};

export const mockAdminDocumentError: DocumentDetail = {
    id: "2002",
    title: "示例现有文档 (Mock)",
    content: "<h1>Hello World</h1><p>This is a mock document content loaded on error.</p>",
    seo: { title: "示例", description: "这是一个示例", keywords: ["test"] },
    category: "前端基础",
    tags: ["test"],
    status: "published"
};

export const mockDocumentList: DocumentItem[] = [
  {
    id: "3001",
    title: "如何把视频课程拆解成学习笔记",
    category: "效率方法",
    status: "approved",
    readCount: 4210,
    likeCount: 532,
    commentCount: 84,
    createdAt: "2026-01-10 09:20:11",
    updatedAt: "2026-01-12 14:32:45",
    pinned: true,
    recommended: true,
    cover: "https://images.unsplash.com/photo-1456324504439-367cee13d652?w=800&auto=format&fit=crop&q=60",
    tags: ["学习方法", "笔记技巧"]
  },
  {
    id: "3002",
    title: "从 0 搭建个人知识库前端",
    category: "工程实践",
    status: "approved",
    readCount: 3289,
    likeCount: 421,
    commentCount: 63,
    createdAt: "2026-01-11 10:05:00",
    updatedAt: "2026-01-13 10:18:22",
    recommended: true,
    cover: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=60",
    tags: ["React", "知识库", "前端架构"]
  },
  {
    id: "3003",
    title: "Next.js 14 服务端组件实战",
    category: "前端基础",
    status: "published",
    readCount: 1540,
    likeCount: 230,
    commentCount: 45,
    createdAt: "2026-01-14 16:40:00",
    updatedAt: "2026-01-14 16:40:00",
    cover: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&auto=format&fit=crop&q=60",
    tags: ["Next.js", "React"]
  },
  {
    id: "3004",
    title: "2025 年前端技术趋势展望",
    category: "个人成长",
    status: "draft",
    readCount: 0,
    likeCount: 0,
    commentCount: 0,
    createdAt: "2026-01-18 09:15:30",
    updatedAt: "2026-01-18 09:15:30",
    tags: ["职业发展", "趋势"]
  },
  {
    id: "3005",
    title: "系统高可用架构设计原则",
    category: "系统设计",
    status: "pending",
    readCount: 0,
    likeCount: 0,
    commentCount: 0,
    createdAt: "2026-01-19 11:20:00",
    updatedAt: "2026-01-19 11:20:00",
    tags: ["架构", "高可用"]
  }
];

export const mockDraftList: DocumentItem[] = [
  {
    id: "3051",
    title: "草稿：React 性能优化指南",
    category: "前端开发",
    description: "这是一篇关于 React 性能优化的草稿，正在整理中...",
    status: "draft",
    readCount: 0,
    likeCount: 0,
    commentCount: 0,
    createdAt: "2026-01-20 10:00:00",
    updatedAt: "2026-01-20 10:00:00"
  },
  {
    id: "3052",
    title: "草稿：Node.js 部署最佳实践",
    category: "运维部署",
    description: "记录 Node.js 生产环境部署的一些坑点和经验。",
    status: "draft",
    readCount: 0,
    likeCount: 0,
    commentCount: 0,
    createdAt: "2026-01-21 11:30:00",
    updatedAt: "2026-01-21 11:30:00"
  }
];

export const mockDocumentReviewLogs: DocumentReviewLogItem[] = [
  {
    id: "5101",
    docId: "3001",
    title: "如何把视频课程拆解成学习笔记",
    reviewer: "auditor",
    reviewedAt: "2026-01-18 10:30:12",
    result: "approved",
    remark: "内容结构清晰，示例贴近实际使用场景，适合推荐给新用户。"
  },
  {
    id: "5102",
    docId: "3003",
    title: "知识库信息架构最佳实践",
    reviewer: "auditor",
    reviewedAt: "2026-01-18 10:12:45",
    result: "rejected",
    remark: "部分章节概念过于抽象，建议补充更具体的案例与图示。"
  },
  {
    id: "5103",
    docId: "3005",
    title: "用知识库管理你的职业成长",
    reviewer: "auditor",
    reviewedAt: "2026-01-17 17:05:21",
    result: "approved",
    remark: "切入点很好，对职场新人有很大启发。"
  }
];

export const mockReviewQueueItems: DocumentReviewItem[] = [
  {
    id: "5001",
    title: "如何把视频课程拆解成学习笔记",
    uploader: "editor",
    category: "效率方法",
    status: "pending",
    riskLevel: "medium",
    isAiChecked: true,
    createdAt: "2026-01-18 10:20:01"
  },
  {
    id: "5002",
    title: "知识库信息架构最佳实践",
    uploader: "admin",
    category: "系统设计",
    status: "pending",
    riskLevel: "high",
    isAiChecked: false,
    createdAt: "2026-01-18 10:18:32"
  },
  {
    id: "5003",
    title: "Markdown 使用规范整理",
    uploader: "editor",
    category: "前端基础",
    status: "approved",
    riskLevel: "low",
    isAiChecked: true,
    createdAt: "2026-01-17 16:21:07"
  }
];
