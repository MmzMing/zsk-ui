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
 * 简历基础信息 Mock 数据
 */
export const mockResumeBasicInfo = {
  name: "张三",
  age: 26,
  gender: "男",
  avatar: "",
  jobIntention: "Java后端开发工程师",
  city: "珠海",
  phone: "13800138000",
  email: "example@email.com",
  github: "https://github.com/MmzMing",
  linkedin: "",
  summary: "强Owner意识，主动深化系统拓展。工作认真负责，有独立思考和解决问题能力。善于问题拆解，技术方案落地，乐于专研技术原理与学习新知识。经常参与技术论坛阅读。性格温和，积极参与团队交流和部门活动，能明确指出业务上不足之处，参与部门小组技术分享",
};

/**
 * 简历模块列表 Mock 数据
 */
export const mockResumeModules = [
  {
    id: "basic",
    type: "basic",
    title: "基本信息",
    icon: "User",
    isDeletable: false,
    isVisible: true,
    data: mockResumeBasicInfo,
  },
  {
    id: "skills",
    type: "content",
    title: "专业技能",
    icon: "Code",
    isDeletable: true,
    isVisible: true,
    content: `
      <ul>
        <li><strong>后端技术：</strong>熟练掌握 Java 基础，熟练使用 SpringBoot, SpringCloud, Redis, MySQL 等技术栈。</li>
        <li><strong>数据库：</strong>熟悉 MySQL 索引优化、事务处理。</li>
        <li><strong>中间件：</strong>熟悉 RabbitMQ, Kafka 消息队列的使用。</li>
      </ul>
    `,
  },
  {
    id: "work-experience",
    type: "content",
    title: "工作经历",
    icon: "Briefcase",
    isDeletable: true,
    isVisible: true,
    content: `
      <p><strong>某某科技公司 | Java开发工程师</strong> <span style="float: right">2021.07 - 至今</span></p>
      <ul>
        <li>负责公司核心业务系统的后端开发与维护。</li>
        <li>参与系统架构升级，提升系统并发处理能力。</li>
      </ul>
    `,
  },
  {
    id: "project-experience",
    type: "content",
    title: "项目经历",
    icon: "FolderGit2",
    isDeletable: true,
    isVisible: true,
    content: `
      <p><strong>WMS物流管理系统</strong></p>
      <ul>
        <li>负责模块：对接外部系统、定时调度任务、回调。</li>
        <li>数据导入与数据库设计：负责上游物料信息的数据接入与数据清洗，完成分库分表策略优化。</li>
        <li>大数据导入功能开发：使用EasyExcel大数据导入，分批多线程写入，避免OOM。</li>
      </ul>
    `,
  },
  {
    id: "education",
    type: "content",
    title: "教育经历",
    icon: "GraduationCap",
    isDeletable: true,
    isVisible: true,
    content: `
      <p></p>
    `,
  },
];
