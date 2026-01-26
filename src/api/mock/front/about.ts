// ===== 1. 依赖导入区域 =====

// ===== 2. TODO待处理导入区域 =====

// ===== 3. 状态控制逻辑区域 =====

// ===== 4. 通用工具函数区域 =====

// ===== 5. 注释代码函数区 =====

// ===== 6. 错误处理函数区域 =====

// ===== 7. 数据处理函数区域 =====

// ===== 8. UI渲染逻辑区域 =====

// ===== 9. 页面初始化与事件绑定 =====

// ===== 10. TODO任务管理区域 =====

// ===== 11. 导出区域 =====

/**
 * 技术栈项定义
 */
export interface TechStackItem {
  /** 唯一标识 */
  id: string;
  /** 名称 */
  name: string;
  /** 描述 */
  description: string;
}

/**
 * FAQ 项定义
 */
export interface FAQItem {
  /** 唯一标识 */
  id: string;
  /** 问题 */
  question: string;
  /** 回答 */
  answer: string;
}

/**
 * FAQ 分类定义
 */
export interface FAQCategory {
  /** 分类名称 */
  title: string;
  /** 该分类下的 FAQ 列表 */
  items: FAQItem[];
}

/**
 * 技术栈 Mock 数据
 */
export const mockTechStack: TechStackItem[] = [
  {
    id: "java",
    name: "JAVA",
    description: "后端核心开发语言"
  },
  {
    id: "mysql",
    name: "MYSQL",
    description: "关系型数据库管理系统"
  },
  {
    id: "redis",
    name: "REDIS",
    description: "高性能键值对数据库"
  },
  {
    id: "spring",
    name: "SPRING",
    description: "企业级应用开发框架"
  },
  {
    id: "docker",
    name: "DOCKER",
    description: "容器化部署与管理"
  },
  {
    id: "rocketmq",
    name: "ROCKETMQ",
    description: "分布式消息中间件"
  },
  {
    id: "react",
    name: "REACT",
    description: "构建用户界面的前端库"
  },
  {
    id: "ts",
    name: "TS",
    description: "JavaScript 的超集"
  }
];

/**
 * FAQ Mock 数据
 */
export const mockFAQ: FAQCategory[] = [
  {
    title: "使用操作类",
    items: [
      {
        id: "1",
        question: "如何导入本地 Markdown 文件？",
        answer: "在文档编辑器页面，直接将本地 .md 文件拖拽至编辑区域即可自动解析并导入内容。目前支持标准 Markdown 语法及部分扩展语法。"
      },
      {
        id: "2",
        question: "支持哪些视频格式上传？",
        answer: "目前支持 MP4、WebM、MOV 等主流视频格式。上传后系统会自动进行转码处理，以适配不同终端的播放需求。"
      }
    ]
  },
  {
    title: "功能适配类",
    items: [
      {
        id: "3",
        question: "移动端可以使用编辑器吗？",
        answer: "可以。移动端编辑器针对触屏操作进行了优化，支持快捷工具栏和手势操作，但在复杂排版场景下，建议优先使用桌面端。"
      },
      {
        id: "4",
        question: "如何开启深色模式？",
        answer: "点击右上角的系统设置图标，在“主题风格”中选择“深色”或“跟随系统”。系统会自动记住您的偏好设置。"
      }
    ]
  }
];
