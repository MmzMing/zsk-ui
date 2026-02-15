// ===== 1. 依赖导入区域 =====
import React, { useEffect, useState } from "react";
import { useResumeStore } from "@/store/resumeStore";
import ResumeToolbar from "./components/ResumeToolbar";
import ResumeEditor from "./components/ResumeEditor";
import ResumePreview from "./components/ResumePreview";
import { Tabs, Tab } from "@heroui/react";
import { Edit3, Eye } from "lucide-react";

// ===== 2. TODO待处理导入区域 =====

// ===== 3. 状态控制逻辑区域 =====

// ===== 4. 通用工具函数区域 =====

// ===== 5. 注释代码函数区 =====

// ===== 6. 错误处理函数区域 =====

// ===== 7. 数据处理函数区域 =====

// ===== 8. UI渲染逻辑区域 =====

// ===== 9. 页面初始化与事件绑定 =====
/**
 * 简历页面组件
 * 采用响应式布局：
 * - 桌面端：左侧编辑、右侧预览
 * - 移动端：标签页切换编辑和预览
 */
const ResumePage: React.FC = () => {
  const { fetchResume, modules } = useResumeStore();
  const [viewMode, setViewMode] = useState<string>("edit");

  useEffect(() => {
    // 如果没有模块数据，则请求初始数据 (Mock)
    if (modules.length === 0) {
      fetchResume();
    }
  }, [fetchResume, modules.length]);

  return (
    <div className="flex flex-col h-screen w-full bg-background text-foreground overflow-hidden print:h-auto print:overflow-visible print:bg-white print:block print:w-full print-container">
      {/* 顶部工具栏 */}
      <div className="print:hidden">
        <ResumeToolbar />
      </div>

      {/* 移动端视图切换 */}
      <div className="lg:hidden flex justify-center p-2 bg-content1 border-b border-default-200 print:hidden">
        <Tabs 
          aria-label="View Mode" 
          selectedKey={viewMode} 
          onSelectionChange={(key) => setViewMode(key as string)}
          variant="bordered"
          size="sm"
          color="primary"
          classNames={{
            tabList: "gap-6",
          }}
        >
          <Tab
            key="edit"
            title={
              <div className="flex items-center space-x-2">
                <Edit3 size={16} />
                <span>编辑内容</span>
              </div>
            }
          />
          <Tab
            key="preview"
            title={
              <div className="flex items-center space-x-2">
                <Eye size={16} />
                <span>预览简历</span>
              </div>
            }
          />
        </Tabs>
      </div>

      {/* 主体内容区 */}
      <div className="flex flex-1 overflow-hidden relative print:block print:static print:overflow-visible print:w-full print:m-0 print:p-0">
        {/* 左侧：编辑区 (移动端根据 viewMode 显示) */}
        <div className={`
          flex-none h-full border-r border-default-200 bg-content2/50
          transition-all duration-300 ease-in-out
          ${viewMode === "edit" ? "w-full lg:w-[40%]" : "w-0 lg:w-[40%] overflow-hidden lg:overflow-visible"}
          lg:block print:hidden
        `}>
          <ResumeEditor />
        </div>

        {/* 右侧：预览区 (移动端根据 viewMode 显示) */}
        <div className={`
          flex-1 h-full bg-default-100/50
          transition-all duration-300 ease-in-out
          ${viewMode === "preview" ? "block" : "hidden lg:block"}
          print:block print:static print:w-full print:h-auto print:bg-white print:m-0 print:p-0
        `}>
          <ResumePreview />
        </div>
      </div>
    </div>
  );
};

// ===== 10. TODO任务管理区域 =====

// ===== 11. 导出区域 =====
export default ResumePage;
