import React from "react";
import { 
  Button, 
  Input, 
  Select, 
  SelectItem, 
  Dropdown, 
  DropdownTrigger, 
  DropdownMenu, 
  DropdownItem,
  DropdownSection,
  Popover,
  PopoverTrigger,
  PopoverContent,
  Slider,
  Divider,
  addToast
} from "@heroui/react";
import { useNavigate } from "react-router-dom";
import { 
  Save, 
  Printer, 
  Download, 
  FileText, 
  ZoomIn, 
  ZoomOut, 
  Settings2, 
  Layout, 
  Plus, 
  Eye, 
  EyeOff, 
  ArrowUp, 
  ArrowDown, 
  Trash2,
  Palette
} from "lucide-react";
import { useResumeStore } from "@/store/resumeStore";
import { useUserStore } from "@/store/modules/userStore";

const availableModules = [
  { type: "content", title: "工作经历", icon: "Briefcase" },
  { type: "content", title: "项目经历", icon: "FolderGit2" },
  { type: "content", title: "教育经历", icon: "GraduationCap" },
  { type: "content", title: "专业技能", icon: "Code" },
  { type: "content", title: "自定义模块", icon: "Settings" },
];

/**
 * 简历工具栏组件
 */
const ResumeToolbar: React.FC = () => {
  const navigate = useNavigate();
  const { token } = useUserStore();
  const { 
    isSaving, 
    saveResume, 
    zoomLevel, 
    setZoomLevel,
    modules, 
    addModule, 
    removeModule, 
    moveModule,
    toggleModuleVisibility,
    fontFamily,
    fontSize,
    lineHeight,
    paragraphSpacing,
    pagePadding,
    theme,
    setTypography,
  } = useResumeStore();

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const checkAuth = () => {
    if (!token) {
      addToast({
        title: "请先登录",
        description: "登录后即可下载或打印您的简历",
        color: "warning"
      });
      navigate("/login");
      return false;
    }
    return true;
  };

  const handleExportPDF = () => {
    if (checkAuth()) {
      window.print();
    }
  };

  const handleExportImage = () => {
    if (checkAuth()) {
      alert("图片导出功能正在开发中...");
    }
  };

  const handleAddModule = (title: string, icon: string) => {
    addModule({
      type: "content",
      title,
      icon,
      isDeletable: true,
      isVisible: true,
      content: "<h3>新模块</h3><ul><li>点击此处编辑内容...</li></ul>"
    });
  };

  const handleFontFamilyChange = (keys: unknown) => {
    const selected = Array.from(keys as Set<string>)[0];
    setTypography({ fontFamily: selected });
  };

  const handleThemeChange = (keys: unknown) => {
    const selected = Array.from(keys as Set<string>)[0] as "minimal" | "standard" | "creative" | "custom";
    if (selected === "custom") {
      fileInputRef.current?.click();
    } else {
      setTypography({ theme: selected });
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // NOTE: Word 导入功能需要 mammoth 依赖
    alert("Word 导入功能需要安装 mammoth 依赖，请在本地运行 npm install mammoth 后使用。");
    
    // 重置 input 以允许再次选择同一文件
    e.target.value = "";
  };

  return (
    <div className="h-16 border-b border-default-200 bg-content1 px-4 flex items-center justify-between gap-4 shrink-0 z-50 relative overflow-x-auto no-scrollbar">
      {/* 隐藏的文件上传 input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileUpload} 
        accept=".doc,.docx" 
        className="hidden" 
      />
      {/* Left: Document Info */}
      <div className="flex items-center gap-4 min-w-[200px]">
        <div className="flex flex-col">
          <Input 
            variant="underlined" 
            placeholder="简历标题" 
            defaultValue="资深Java软件开发工程师" 
            classNames={{
              input: "font-bold text-base md:text-lg",
              inputWrapper: "h-8 border-none"
            }}
          />
          <span className="text-[10px] md:text-xs text-default-400">
            {isSaving ? "保存中..." : "已保存 刚刚"}
          </span>
        </div>
      </div>

      {/* Center: Formatting Tools */}
      <div className="hidden lg:flex items-center gap-2 flex-1 justify-center">
        <Button variant="light" size="sm" startContent={<FileText size={16} />} className="hidden xl:flex">
          智能一页
        </Button>
        
        <Divider orientation="vertical" className="h-4 mx-1 hidden xl:block" />

        <Select 
          size="sm" 
          className="w-32" 
          selectedKeys={[fontFamily]}
          onSelectionChange={handleFontFamilyChange}
          aria-label="字体选择"
        >
          <SelectItem key="microsoft-yahei">微软雅黑</SelectItem>
          <SelectItem key="simsun">宋体</SelectItem>
          <SelectItem key="simhei">黑体</SelectItem>
        </Select>

        <Popover placement="bottom">
          <PopoverTrigger>
            <Button isIconOnly size="sm" variant="light" aria-label="排版设置">
              <Settings2 size={16} />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-4">
            <div className="flex flex-col gap-4 w-full">
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span>字号</span>
                  <span>{fontSize}px</span>
                </div>
                <Slider 
                  size="sm" step={1} minValue={12} maxValue={24} 
                  value={fontSize} 
                  onChange={(v) => setTypography({ fontSize: v as number })}
                  aria-label="字号调整"
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span>行高</span>
                  <span>{lineHeight}</span>
                </div>
                <Slider 
                  size="sm" step={0.1} minValue={1} maxValue={2.5} 
                  value={lineHeight} 
                  onChange={(v) => setTypography({ lineHeight: v as number })}
                  aria-label="行高调整"
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span>段落间距</span>
                  <span>{paragraphSpacing}px</span>
                </div>
                <Slider 
                  size="sm" step={1} minValue={0} maxValue={30} 
                  value={paragraphSpacing} 
                  onChange={(v) => setTypography({ paragraphSpacing: v as number })}
                  aria-label="段落间距调整"
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span>页边距</span>
                  <span>{pagePadding}mm</span>
                </div>
                <Slider 
                  size="sm" step={1} minValue={5} maxValue={40} 
                  value={pagePadding} 
                  onChange={(v) => setTypography({ pagePadding: v as number })}
                  aria-label="页边距调整"
                />
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <Divider orientation="vertical" className="h-4 mx-1" />

        {/* Theme Picker */}
        <Dropdown>
          <DropdownTrigger>
            <Button size="sm" variant="light" startContent={<Palette size={16} />}>
              模板样式
            </Button>
          </DropdownTrigger>
          <DropdownMenu 
            aria-label="Theme selection" 
            selectedKeys={[theme]} 
            onSelectionChange={handleThemeChange}
            selectionMode="single"
          >
            <DropdownItem key="standard">标准简历</DropdownItem>
            <DropdownItem key="minimal">简约风格</DropdownItem>
            <DropdownItem key="creative">创意风格</DropdownItem>
            <DropdownItem key="custom" description="上传 Word 简历自动填充内容">自定义导入</DropdownItem>
          </DropdownMenu>
        </Dropdown>

        {/* Module Management Dropdown */}
        <Dropdown closeOnSelect={false}>
          <DropdownTrigger>
            <Button size="sm" color="primary" variant="flat" startContent={<Layout size={16} />}>
              模块管理
            </Button>
          </DropdownTrigger>
          <DropdownMenu aria-label="Module management" className="w-72">
            <DropdownSection title="已有模块">
              {modules.map((module, index) => (
                <DropdownItem key={module.id} className="py-1" textValue={module.title}>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm truncate flex-1">{module.title}</span>
                    <div className="flex items-center gap-1">
                      <Button isIconOnly size="sm" variant="light" className="h-6 w-6" onPress={() => toggleModuleVisibility(module.id)} aria-label={module.isVisible ? "隐藏模块" : "显示模块"}>
                        {module.isVisible ? <Eye size={14} /> : <EyeOff size={14} />}
                      </Button>
                      <div className="flex flex-col">
                        <Button isIconOnly size="sm" variant="light" className="h-3 w-6 min-w-0" isDisabled={index === 0} onPress={() => moveModule(module.id, "up")} aria-label="上移模块">
                          <ArrowUp size={10} />
                        </Button>
                        <Button isIconOnly size="sm" variant="light" className="h-3 w-6 min-w-0" isDisabled={index === modules.length - 1} onPress={() => moveModule(module.id, "down")} aria-label="下移模块">
                          <ArrowDown size={10} />
                        </Button>
                      </div>
                      {module.isDeletable && (
                        <Button isIconOnly size="sm" variant="light" color="danger" className="h-6 w-6" onPress={() => removeModule(module.id)} aria-label="删除模块">
                          <Trash2 size={14} />
                        </Button>
                      )}
                    </div>
                  </div>
                </DropdownItem>
              ))}
            </DropdownSection>
            <DropdownSection title="添加模块">
              {availableModules.map((item) => (
                <DropdownItem key={item.title} startContent={<Plus size={14} />} onPress={() => handleAddModule(item.title, item.icon)}>
                  {item.title}
                </DropdownItem>
              ))}
            </DropdownSection>
          </DropdownMenu>
        </Dropdown>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 md:gap-3 min-w-[120px] justify-end">
        <div className="hidden sm:flex items-center bg-default-100 rounded-lg p-1 mr-2">
          <Button isIconOnly size="sm" variant="light" onPress={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.1))} aria-label="缩小">
            <ZoomOut size={16} />
          </Button>
          <span className="text-[10px] px-1 w-10 text-center">{Math.round(zoomLevel * 100)}%</span>
          <Button isIconOnly size="sm" variant="light" onPress={() => setZoomLevel(Math.min(2, zoomLevel + 0.1))} aria-label="放大">
            <ZoomIn size={16} />
          </Button>
        </div>

        <Button 
          color="primary" 
          variant="flat" 
          size="sm"
          startContent={<Save size={18} />}
          onPress={() => saveResume()}
          isLoading={isSaving}
          className="hidden md:flex"
        >
          保存
        </Button>
        <Dropdown>
          <DropdownTrigger>
            <Button color="success" size="sm" startContent={<Download size={18} />}>
              <span className="hidden sm:inline">下载 / 打印</span>
              <span className="sm:hidden">导出</span>
            </Button>
          </DropdownTrigger>
          <DropdownMenu aria-label="Download Actions">
            <DropdownItem key="pdf" startContent={<Printer size={16} />} onPress={handleExportPDF}>
              导出 PDF (打印)
            </DropdownItem>
            <DropdownItem key="image" startContent={<Download size={16} />} onPress={handleExportImage}>
              导出图片
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>
    </div>
  );
};

export default ResumeToolbar;
