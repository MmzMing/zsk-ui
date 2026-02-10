import React from "react";
import { Accordion, AccordionItem, Tooltip } from "@heroui/react";
import { useResumeStore } from "@/store/resumeStore";
import BasicInfoForm from "./BasicInfoForm";
import TiptapEditor from "./TiptapEditor";
import { User, Code, Briefcase, FolderGit2, GraduationCap, GripVertical, Trash2, Edit3, Settings } from "lucide-react";
import { ResumeModule } from "@/api/front/resume";
import { Reorder, useDragControls } from "framer-motion";

const iconMap: Record<string, React.FC<{ size?: number; className?: string }>> = {
  User,
  Code,
  Briefcase,
  FolderGit2,
  GraduationCap,
};

interface SortableItemProps {
  module: ResumeModule;
  activeModuleId: string | null;
  setActiveModule: (id: string | null) => void;
  renderContent: (module: ResumeModule) => React.ReactNode;
  removeModule: (id: string) => void;
}

const SortableAccordionItem: React.FC<SortableItemProps> = ({
  module,
  activeModuleId,
  setActiveModule,
  renderContent,
  removeModule,
}) => {
  const controls = useDragControls();
  const Icon = iconMap[module.icon] || Settings;

  return (
    <Reorder.Item
      value={module}
      id={module.id}
      dragListener={false}
      dragControls={controls}
      className="mb-2 list-none"
    >
      <Accordion 
        selectionMode="single" 
        selectedKeys={activeModuleId === module.id ? new Set([module.id]) : new Set()}
        onSelectionChange={(keys) => {
          const isSelected = Array.from(keys as Set<string>).length > 0;
          setActiveModule(isSelected ? module.id : null);
        }}
        variant="splitted"
        className="px-0"
      >
        <AccordionItem
          key={module.id}
          aria-label={module.title}
          startContent={
            <div className="flex items-center gap-3 text-default-500">
              <div 
                onPointerDown={(e) => controls.start(e)}
                className="cursor-grab active:cursor-grabbing p-1 hover:text-foreground transition-colors touch-none"
              >
                <GripVertical size={16} />
              </div>
              <div className={`p-2 rounded-full ${activeModuleId === module.id ? "bg-primary/20 text-primary" : "bg-default-100"}`}>
                <Icon size={18} />
              </div>
            </div>
          }
          title={
            <div className="flex items-center justify-between w-full pr-2">
              <span className="font-medium">{module.title}</span>
              {module.isDeletable && (
                <Tooltip content="删除模块">
                  <span 
                    className="p-1 rounded-md hover:bg-danger-50 text-danger opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeModule(module.id);
                    }}
                    role="button"
                    aria-label={`删除${module.title}`}
                  >
                    <Trash2 size={16} />
                  </span>
                </Tooltip>
              )}
            </div>
          }
          classNames={{
            base: "group !shadow-sm border border-default-200 bg-content1 !m-0",
            trigger: "py-3",
            content: "pb-4 pt-0"
          }}
        >
          {renderContent(module)}
        </AccordionItem>
      </Accordion>
    </Reorder.Item>
  );
};

const ResumeEditor: React.FC = () => {
  const { modules, activeModuleId, setActiveModule, updateModule, removeModule, reorderModules } = useResumeStore();

  const renderContent = (module: ResumeModule) => {
    if (module.type === "basic") {
      return (
        <BasicInfoForm
          data={module.data || {}}
          onChange={(newData) => updateModule(module.id, { data: newData })}
        />
      );
    }
    return (
      <TiptapEditor
        content={module.content || ""}
        onChange={(newContent) => updateModule(module.id, { content: newContent })}
      />
    );
  };

  const visibleModules = modules.filter(m => m.isVisible);

  const handleReorder = (newOrder: ResumeModule[]) => {
    // We need to merge the new order of visible modules back into the full modules list
    // to preserve invisible modules' positions if any (though usually they are at the end)
    const newModules = [...modules];
    let visibleIdx = 0;
    
    for (let i = 0; i < newModules.length; i++) {
      if (newModules[i].isVisible) {
        newModules[i] = newOrder[visibleIdx++];
      }
    }
    
    reorderModules(newModules);
  };

  return (
    <div className="flex flex-col h-full w-full overflow-hidden">
      <div className="p-4 border-b border-default-200 font-bold text-lg flex items-center gap-2">
        <Edit3 size={20} />
        内容编辑
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        <Reorder.Group 
          axis="y" 
          values={visibleModules} 
          onReorder={handleReorder}
          className="flex flex-col"
        >
          {visibleModules.map((module) => (
            <SortableAccordionItem
              key={module.id}
              module={module}
              activeModuleId={activeModuleId}
              setActiveModule={setActiveModule}
              renderContent={renderContent}
              removeModule={removeModule}
            />
          ))}
        </Reorder.Group>
      </div>
    </div>
  );
};

export default ResumeEditor;
