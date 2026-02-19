/**
 * 模块管理面板组件
 * @module pages/Resume/components/ModulePanel
 * @description 简历模块管理面板，支持添加、排序、显示/隐藏、删除模块
 */

import React from "react";
import { Button, Card, CardBody, ScrollShadow } from "@heroui/react";
import { useResumeStore } from "@/store/resumeStore";
import { Plus, ArrowUp, ArrowDown, Eye, EyeOff, Trash2 } from "lucide-react";

interface ModuleTemplate {
  type: "content" | "basic";
  title: string;
  icon: string;
}

const availableModules: ModuleTemplate[] = [
  { type: "content", title: "工作经历", icon: "Briefcase" },
  { type: "content", title: "项目经历", icon: "FolderGit2" },
  { type: "content", title: "教育经历", icon: "GraduationCap" },
  { type: "content", title: "专业技能", icon: "Code" },
  { type: "content", title: "自定义模块", icon: "Settings" },
];

const ModulePanel: React.FC = () => {
  const { modules, addModule, moveModule, toggleModuleVisibility, removeModule } = useResumeStore();

  const handleAdd = (template: ModuleTemplate) => {
    addModule({
      type: template.type as "content",
      title: template.title,
      icon: template.icon,
      isDeletable: true,
      isVisible: true,
      content: "<p>请输入内容...</p>",
    });
  };

  return (
    <div className="w-[300px] border-l border-default-200 bg-content1 flex flex-col shrink-0 h-full">
      <div className="p-4 border-b border-default-200 font-bold text-lg">
        模块管理
      </div>

      <ScrollShadow className="flex-1 p-4 flex flex-col gap-6">
        {/* Active Modules List */}
        <div>
          <h3 className="text-sm font-semibold text-default-500 mb-3 uppercase tracking-wider">已有模块</h3>
          <div className="flex flex-col gap-2">
            {modules.map((module, index) => (
              <Card key={module.id} shadow="sm" className="bg-content2">
                <CardBody className="p-3 flex flex-row items-center justify-between gap-2">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <span className="truncate font-medium text-sm">{module.title}</span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Button 
                      isIconOnly size="sm" variant="light" 
                      onPress={() => toggleModuleVisibility(module.id)}
                      className="text-default-400 hover:text-default-600"
                    >
                      {module.isVisible ? <Eye size={14} /> : <EyeOff size={14} />}
                    </Button>
                    
                    <div className="flex flex-col">
                      <Button 
                        isIconOnly size="sm" variant="light" className="h-4 min-w-4 w-6"
                        isDisabled={index === 0}
                        onPress={() => moveModule(module.id, "up")}
                      >
                        <ArrowUp size={12} />
                      </Button>
                      <Button 
                        isIconOnly size="sm" variant="light" className="h-4 min-w-4 w-6"
                        isDisabled={index === modules.length - 1}
                        onPress={() => moveModule(module.id, "down")}
                      >
                        <ArrowDown size={12} />
                      </Button>
                    </div>

                    {module.isDeletable && (
                        <Button
                            isIconOnly size="sm" variant="light" color="danger"
                            onPress={() => removeModule(module.id)}
                        >
                            <Trash2 size={14} />
                        </Button>
                    )}
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>

        {/* Add Modules List */}
        <div>
          <h3 className="text-sm font-semibold text-default-500 mb-3 uppercase tracking-wider">添加模块</h3>
          <div className="grid grid-cols-1 gap-2">
            {availableModules.map((item, idx) => (
              <Button
                key={idx}
                variant="flat"
                color="default"
                className="justify-start bg-default-100 hover:bg-default-200"
                startContent={<Plus size={16} />}
                onPress={() => handleAdd(item)}
              >
                {item.title}
              </Button>
            ))}
          </div>
        </div>
      </ScrollShadow>
    </div>
  );
};

export default ModulePanel;
