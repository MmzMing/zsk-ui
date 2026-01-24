import { ToolboxDetail } from "../../front/toolbox";

const DOC_DEFAULT = "/DefaultImage/MyDefaultImage.jpg";

export const MOCK_TOOLBOX_DATA: Record<string, ToolboxDetail> = {
  "501": {
    id: "501",
    title: "Notion",
    description: "Notion 是一款集笔记、任务管理、数据库、看板于一体的协作工具。它打破了传统文档的界限，通过模块化的设计，让用户可以自由构建属于自己的工作流。无论是个人知识库、团队项目管理，还是公司内部 Wiki，Notion 都能轻松胜任。",
    logo: "https://upload.wikimedia.org/wikipedia/commons/4/45/Notion_app_logo.png",
    tags: ["生产力", "笔记", "团队协作", "文档"],
    url: "https://www.notion.so",
    images: [
      "https://images.unsplash.com/photo-1680795456504-377e02e3aba1",
      "https://images.unsplash.com/photo-1661956602116-aa6865609028",
      "https://images.unsplash.com/photo-1664575602554-208c7a696ee1"
    ],
    features: [
      "模块化编辑：像搭积木一样构建页面",
      "多维数据库：支持表格、看板、日历等多种视图",
      "AI 辅助写作：内置 Notion AI，提升创作效率",
      "实时协作：团队成员同时编辑，评论互动",
      "丰富的模板库：开箱即用的各类场景模板"
    ],
    relatedTools: [
      { id: "502", type: "tool", title: "Obsidian", description: "双向链接笔记工具", tags: ["笔记", "知识库"], thumbnail: DOC_DEFAULT },
      { id: "503", type: "tool", title: "我来 wolai", description: "中文版 Notion 替代品", tags: ["笔记", "文档"], thumbnail: DOC_DEFAULT }
    ],
    stats: {
      views: 12500,
      likes: 3400,
      usage: 8900
    },
    author: {
      name: "Notion Labs",
      avatar: "https://upload.wikimedia.org/wikipedia/commons/4/45/Notion_app_logo.png"
    },
    createAt: "2024-01-01"
  }
};

export function getMockToolboxDetail(id: string): ToolboxDetail {
  return MOCK_TOOLBOX_DATA[id] || {
    id,
    title: `${id} (Mock数据)`,
    description: "这是一段 Mock 兜底描述。当后端 API 接口尚未实现或请求失败时，您会看到此内容。Notion 是一款集笔记、任务管理、数据库、看板于一体的协作工具。",
    logo: "",
    tags: ["Mock", "调试"],
    url: "https://example.com",
    images: [
      "https://images.unsplash.com/photo-1680795456504-377e02e3aba1",
      "https://images.unsplash.com/photo-1661956602116-aa6865609028"
    ],
    features: [
      "Mock 功能点 A：演示数据展示",
      "Mock 功能点 B：前端 UI 调试",
      "Mock 功能点 C：API 异常处理验证"
    ],
    relatedTools: [],
    stats: {
      views: Math.floor(Math.random() * 1000),
      likes: Math.floor(Math.random() * 500),
      usage: Math.floor(Math.random() * 800)
    },
    author: {
      name: "测试助手",
      avatar: "https://i.pravatar.cc/150?u=mock"
    },
    createAt: new Date().toISOString()
  };
}
