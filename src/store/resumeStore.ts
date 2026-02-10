import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ResumeModule, fetchResumeDetail, saveResume, BasicInfo } from "@/api/front/resume";

const generateId = () => Math.random().toString(36).substring(2, 9);

interface ResumeState {
  modules: ResumeModule[];
  activeModuleId: string | null;
  isLoading: boolean;
  isSaving: boolean;
  lastSavedAt: Date | null;
  zoomLevel: number;
  
  // Typography & Layout
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
  paragraphSpacing: number;
  pagePadding: number;
  theme: "minimal" | "standard" | "creative" | "custom";

  // Actions
  fetchResume: () => Promise<void>;
  saveResume: () => Promise<void>;
  setZoomLevel: (level: number) => void;
  setTypography: (updates: Partial<Pick<ResumeState, "fontFamily" | "fontSize" | "lineHeight" | "paragraphSpacing" | "pagePadding" | "theme">>) => void;
  setActiveModule: (id: string | null) => void;
  updateModule: (id: string, updates: Partial<ResumeModule>) => void;
  addModule: (module: Omit<ResumeModule, "id">) => void;
  removeModule: (id: string) => void;
  moveModule: (id: string, direction: "up" | "down") => void;
  reorderModules: (newModules: ResumeModule[]) => void;
  toggleModuleVisibility: (id: string) => void;
  importFromWord: (content: string) => void;
}

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

      fetchResume: async () => {
        set({ isLoading: true });
        try {
          const res = await fetchResumeDetail();
          if (res.code === 200) {
            set({ modules: res.data });
          }
        } catch (error) {
          console.error("Failed to fetch resume:", error);
        } finally {
          set({ isLoading: false });
        }
      },

      saveResume: async () => {
        const { modules } = get();
        set({ isSaving: true });
        try {
          await saveResume(modules);
          set({ lastSavedAt: new Date() });
        } catch (error) {
          console.error("Failed to save resume:", error);
        } finally {
          set({ isSaving: false });
        }
      },

      setZoomLevel: (level) => set({ zoomLevel: level }),

      setTypography: (updates) => set((state) => ({ ...state, ...updates })),

      setActiveModule: (id) => set({ activeModuleId: id }),

      updateModule: (id, updates) =>
        set((state) => ({
          modules: state.modules.map((m) =>
            m.id === id ? { ...m, ...updates } : m
          ),
        })),

      addModule: (module) =>
        set((state) => ({
          modules: [
            ...state.modules,
            { ...module, id: generateId() } as ResumeModule,
          ],
        })),

      removeModule: (id) =>
        set((state) => ({
          modules: state.modules.filter((m) => m.id !== id),
          activeModuleId: state.activeModuleId === id ? null : state.activeModuleId,
        })),

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

      reorderModules: (newModules) => set({ modules: newModules }),

      toggleModuleVisibility: (id) =>
        set((state) => ({
          modules: state.modules.map((m) =>
            m.id === id ? { ...m, isVisible: !m.isVisible } : m
          ),
        })),

      importFromWord: (content) => {
        // Simple implementation: split by double newlines to guess modules
        const lines = content.split('\n').filter(l => l.trim());
        const newModules: ResumeModule[] = [];
        
        // Try to extract basic info from first few lines
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

        // Add the rest as a single content module for now
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
      partialize: (state) => ({ modules: state.modules }), // Only persist modules
    }
  )
);
