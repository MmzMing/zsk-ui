// ===== 1. 依赖导入区域 =====
import type { ApiResponse } from "../types";
import { mockResumeModules } from "../mock/front/resume";

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
 * 简历基础信息定义
 */
export type BasicInfo = {
  name?: string;
  jobIntention?: string;
  age?: string;
  gender?: string;
  city?: string;
  phone?: string;
  email?: string;
  github?: string;
  summary?: string;
  avatar?: string; // Base64 or URL
  experience?: string;
  salary?: string;
  politics?: string;
  status?: string;
};

/**
 * 简历模块数据类型定义
 */
export type ResumeModule = {
  id: string;
  type: "basic" | "content";
  title: string;
  icon: string;
  isDeletable: boolean;
  isVisible: boolean;
  /** 基础信息数据 (仅 type='basic' 时存在) */
  data?: BasicInfo;
  /** 富文本内容 (仅 type='content' 时存在) */
  content?: string;
};

/**
 * 获取简历详情
 */
export const fetchResumeDetail = () => {
  // 暂时使用 Mock 数据
  return new Promise<ApiResponse<ResumeModule[]>>((resolve) => {
    setTimeout(() => {
      resolve({
        code: 200,
        msg: "success",
        data: mockResumeModules as ResumeModule[],
      });
    }, 500);
  });
};

/**
 * 保存简历
 */
export const saveResume = (modules: ResumeModule[]) => {
  return new Promise<ApiResponse<null>>((resolve) => {
    setTimeout(() => {
      console.log("Resume Saved:", modules);
      resolve({
        code: 200,
        msg: "success",
        data: null,
      });
    }, 500);
  });
};
