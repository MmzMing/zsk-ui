/**
 * 简历状态管理
 * 管理简历模块的数据、排版设置和编辑操作
 *
 * @module store/resumeStore
 * @author wuhuaming
 * @date 2026-02-18
 * @version 1.0
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ResumeModule, fetchResumeDetail, saveResume, BasicInfo } from "@/api/front/resume";
import { handleDebugOutput } from "@/utils";

/**
 * 生成唯一ID
 * @returns 随机生成的ID字符串
 */
const generateId = () => Math.random().toString(36).substring(2, 9);

/**
 * 简历状态接口
 * 定义简历编辑器的所有状态属性和操作方法
 */
interface ResumeState {
  /** 简历模块列表 */
  modules: ResumeModule[];
  /** 当前激活的模块ID */
  activeModuleId: string | null;
  /** 是否正在加载 */
  isLoading: boolean;
  /** 是否正在保存 */
  isSaving: boolean;
  /** 上次保存时间 */
  lastSavedAt: Date | null;
  /** 缩放级别 */
  zoomLevel: number;

  /** 字体名称 */
  fontFamily: string;
  /** 字体大小 */
  fontSize: number;
  /** 行高 */
  lineHeight: number;
  /** 段落间距 */
  paragraphSpacing: number;
  /** 页面内边距 */
  pagePadding: number;
  /** 简历主题风格 */
  theme: "minimal" | "standard" | "creative" | "custom";

  /** 获取简历数据 */
  fetchResume: () => Promise<void>;
  /** 保存简历数据 */
  saveResume: () => Promise<void>;
  /** 设置缩放级别 */
  setZoomLevel: (level: number) => void;
  /** 设置排版样式 */
  setTypography: (updates: Partial<Pick<ResumeState, "fontFamily" | "fontSize" | "lineHeight" | "paragraphSpacing" | "pagePadding" | "theme">>) => void;
  /** 设置激活模块 */
  setActiveModule: (id: string | null) => void;
  /** 更新模块内容 */
  updateModule: (id: string, updates: Partial<ResumeModule>) => void;
  /** 添加新模块 */
  addModule: (module: Omit<ResumeModule, "id">) => void;
  /** 删除模块 */
  removeModule: (id: string) => void;
  /** 移动模块位置 */
  moveModule: (id: string, direction: "up" | "down") => void;
  /** 重新排序模块 */
  reorderModules: (newModules: ResumeModule[]) => void;
  /** 切换模块可见性 */
  toggleModuleVisibility: (id: string) => void;
  /** 从Word导入内容 */
  importFromWord: (content: string) => void;
}

/**
 * 简历状态 Store
 * 使用 Zustand 管理简历编辑器的状态，支持本地存储持久化
 *
 * 功能包括：
 * - 简历模块的增删改查
 * - 排版样式设置
 * - 数据加载和保存
 * - Word导入
 *
 * @example
 * const { modules, activeModuleId, fetchResume, addModule } = useResumeStore();
 * fetchResume();
 */
export const useResumeStore = create<ResumeState>()(
  persist(
    (set, get) => ({
      modules: [],
      activeModuleId: null,
      isLoading: false,
      isSaving: false,
      lastSavedAt: null,
      zoomLevel: 1,
      fontFamily: "microsoft-yahei",
      fontSize: 14,
      lineHeight: 1.6,
      paragraphSpacing: 10,
      pagePadding: 20,
      theme: "minimal",

      /**
       * 获取简历数据
       * 从服务器加载简历模块列表
       */
      fetchResume: async () => {
        set({ isLoading: true });
        try {
          const res = await fetchResumeDetail();
          if (res.code === 200) {
            set({ modules: res.data });
          }
        } catch (error) {
          handleDebugOutput({
            debugLevel: "error",
            debugMessage: "Failed to fetch resume:",
            debugDetail: error,
          });
        } finally {
          set({ isLoading: false });
        }
      },

      /**
       * 保存简历数据
       * 将当前模块列表保存到服务器
       */
      saveResume: async () => {
        const { modules } = get();
        set({ isSaving: true });
        try {
          await saveResume(modules);
          set({ lastSavedAt: new Date() });
        } catch (error) {
          handleDebugOutput({
            debugLevel: "error",
            debugMessage: "Failed to save resume:",
            debugDetail: error,
          });
        } finally {
          set({ isSaving: false });
        }
      },

      /** 设置缩放级别 */
      setZoomLevel: (level) => set({ zoomLevel: level }),

      /** 设置排版样式 */
      setTypography: (updates) => set((state) => ({ ...state, ...updates })),

      /** 设置激活模块 */
      setActiveModule: (id) => set({ activeModuleId: id }),

      /**
       * 更新模块内容
       * @param id 模块ID
       * @param updates 更新内容
       */
      updateModule: (id, updates) =>
        set((state) => ({
          modules: state.modules.map((m) =>
            m.id === id ? { ...m, ...updates } : m
          ),
        })),

      /**
       * 添加新模块
       * 自动生成唯一ID
       */
      addModule: (module) =>
        set((state) => ({
          modules: [
            ...state.modules,
            { ...module, id: generateId() } as ResumeModule,
          ],
        })),

      /**
       * 删除模块
       * 如果删除的是当前激活模块，则清空激活状态
       */
      removeModule: (id) =>
        set((state) => ({
          modules: state.modules.filter((m) => m.id !== id),
          activeModuleId: state.activeModuleId === id ? null : state.activeModuleId,
        })),

      /**
       * 移动模块位置
       * @param id 模块ID
       * @param direction 移动方向（up-上移, down-下移）
       */
      moveModule: (id, direction) =>
        set((state) => {
          const index = state.modules.findIndex((m) => m.id === id);
          if (index === -1) return state;

          const newModules = [...state.modules];
          if (direction === "up" && index > 0) {
            [newModules[index], newModules[index - 1]] = [
              newModules[index - 1],
              newModules[index],
            ];
          } else if (direction === "down" && index < newModules.length - 1) {
            [newModules[index], newModules[index + 1]] = [
              newModules[index + 1],
              newModules[index],
            ];
          }
          return { modules: newModules };
        }),

      /** 重新排序模块 */
      reorderModules: (newModules) => set({ modules: newModules }),

      /** 切换模块可见性 */
      toggleModuleVisibility: (id) =>
        set((state) => ({
          modules: state.modules.map((m) =>
            m.id === id ? { ...m, isVisible: !m.isVisible } : m
          ),
        })),

      /**
       * 从Word导入内容
       * 简单实现：按双换行分割内容，尝试提取基本信息
       *
       * @param content Word文档内容
       */
      importFromWord: (content) => {
        const lines = content.split('\n').filter(l => l.trim());
        const newModules: ResumeModule[] = [];

        const basicInfo: BasicInfo = {};
        if (lines.length > 0) basicInfo.name = lines[0].trim();

        newModules.push({
          id: generateId(),
          type: "basic",
          title: "基本信息",
          isVisible: true,
          isDeletable: false,
          data: basicInfo,
          icon: "User"
        });

        newModules.push({
          id: generateId(),
          type: "content",
          title: "导入内容",
          isVisible: true,
          isDeletable: true,
          content: content.replace(/\n/g, '<br/>'),
          icon: "FileText"
        });

        set({ modules: newModules });
      }
    }),
    {
      name: "resume-storage",
      partialize: (state) => ({ modules: state.modules }),
    }
  )
);
