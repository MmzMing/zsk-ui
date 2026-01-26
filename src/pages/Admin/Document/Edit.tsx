// ===== 1. 依赖导入区域 =====
import React, { useEffect, useState, useMemo, useRef, useCallback } from "react";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Input,
  Progress,
  Textarea,
  Divider,
  addToast
} from "@heroui/react";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import { Loading } from "@/components/Loading";
import {
  FiSave,
  FiSend,
  FiSettings,
  FiList,
  FiChevronLeft
} from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";
import { getDocumentDetail, createDocument, updateDocument, type DocumentDetail } from "../../../api/admin/document";
import { handleApiCall } from "@/api/axios";
import type { ApiResponse } from "@/api/types";

// ===== 2. TODO待处理导入区域 =====

// ===== 4. 通用工具函数区域 =====
/**
 * 从 HTML 中提取标题大纲
 * @param html HTML 字符串
 * @returns 标题列表
 */
const extractHeadingsFromHtml = (html: string): HeadingItem[] => {
  if (!html) {
    return [];
  }
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const nodes = doc.querySelectorAll("h1,h2,h3,h4,h5,h6");
  const result: HeadingItem[] = [];
  nodes.forEach((element, index) => {
    const level = Number(element.tagName.substring(1));
    const text = element.textContent?.trim() ?? "";
    if (text) {
      result.push({
        level,
        text,
        id: `heading-${index}`
      });
    }
  });
  return result;
};

/**
 * 标题项类型定义
 */
type HeadingItem = { level: number; text: string; id: string };

/**
 * 富文本编辑器工具栏配置
 */
const TOOLBAR_OPTIONS = [
  [{ header: [1, 2, 3, false] }, { font: [] }, { size: ["small", false, "large", "huge"] }],
  ["bold", "italic", "underline", "strike", "blockquote", "code-block"],
  [{ script: "sub" }, { script: "super" }],
  [{ color: [] }, { background: [] }],
  [{ list: "ordered" }, { list: "bullet" }, { indent: "-1" }, { indent: "+1" }],
  [{ align: [] }],
  ["link", "image"],
  ["clean"]
];

// ===== 8. UI渲染逻辑区域 =====
/**
 * SEO 优化面板组件
 */
const SEOPanel = ({ data, onChange }: { data: NonNullable<DocumentDetail['seo']>, onChange: (seo: NonNullable<DocumentDetail['seo']>) => void }) => {
  /**
   * 计算 SEO 评分
   */
  const scores = useMemo(() => {
    const titleScore = data.title.length > 5 ? 100 : 40;
    const descScore = data.description.length > 20 ? 100 : 50;
    const total = (titleScore + descScore) / 2;
    return { title: titleScore, description: descScore, total };
  }, [data]);

  return (
    <Card className="h-full border-none shadow-none bg-transparent">
      <CardHeader className="font-bold text-lg px-0 pb-2">SEO 优化建议</CardHeader>
      <CardBody className="gap-6 px-0">
        <div className="flex items-center gap-4">
            <div className="text-4xl font-bold text-primary">{scores.total}</div>
            <div className="text-sm text-default-500">总评分 / 100</div>
        </div>
        <Progress 
            value={scores.total} 
            color={scores.total < 60 ? "danger" : "success"} 
            className="max-w-md"
            label="SEO 指标"
            showValueLabel
        />
        
        <Divider />
        
        <div className="space-y-4">
          <Input 
              label="标题关键词" 
              placeholder="请输入 SEO 标题"
              value={data.title} 
              onChange={(e) => onChange({ ...data, title: e.target.value })}
              description={scores.title < 60 ? "建议增加标题长度以提高权重" : "标题长度符合规范"}
              color={scores.title < 60 ? "danger" : "success"}
              variant="bordered"
              classNames={{
                  inputWrapper: "border-default-200 focus-within:border-primary",
                  label: "text-xs font-medium"
              }}
          />
          
          <Textarea 
              label="页面描述 (Description)" 
              placeholder="请输入页面描述"
              value={data.description} 
              onChange={(e) => onChange({ ...data, description: e.target.value })}
              description={scores.description < 60 ? "描述过短，不利于搜索结果展示" : "描述信息完善"}
              color={scores.description < 60 ? "danger" : "success"}
              variant="bordered"
              classNames={{
                  inputWrapper: "border-default-200 focus-within:border-primary",
                  label: "text-xs font-medium"
              }}
          />
          
          <Input 
              label="关键词 (Keywords)" 
              placeholder="多个关键词请用逗号隔开"
              value={data.keywords.join(",")}
              onChange={(e) => onChange({ ...data, keywords: e.target.value.split(",") })}
              variant="bordered"
              classNames={{
                  inputWrapper: "border-default-200 focus-within:border-primary",
                  label: "text-xs font-medium"
              }}
          />
        </div>
      </CardBody>
    </Card>
  );
};

// ===== 11. 导出区域 =====
export default function DocumentEditPage() {
  // ===== 3. 状态控制逻辑区域 =====
  /**
   * 路由参数 ID
   */
  const { id } = useParams();
  /**
   * 导航函数
   */
  const navigate = useNavigate();
  /**
   * 编辑器 DOM 引用
   */
  const editorRef = useRef<HTMLDivElement | null>(null);
  /**
   * Quill 实例引用
   */
  const quillRef = useRef<Quill | null>(null);
  /**
   * 加载状态
   */
  const [loading, setLoading] = useState(false);
  /**
   * 文档数据对象
   */
  const [docData, setDocData] = useState<Partial<DocumentDetail>>({
    title: "",
    content: "",
    seo: { title: "", description: "", keywords: [] },
    category: "未分类"
  });
  /**
   * 是否显示 SEO 面板
   */
  const [showSeo, setShowSeo] = useState(false);

  /**
   * 提取文档大纲
   */
  const headings = useMemo(
    () => extractHeadingsFromHtml(docData.content ?? ""),
    [docData.content]
  );

  // ===== 5. 注释代码函数区 =====
  // ===== 6. 错误处理函数区域 =====
  // ===== 7. 数据处理函数区域 =====
  /**
   * 加载文档详情数据
   */
  const loadDocumentData = useCallback(async () => {
    if (!id || id === "new") return;
    
    setLoading(true);
    const res = await handleApiCall({
      requestFn: () => getDocumentDetail(id),
      errorPrefix: "加载文档失败"
    });
    
    if (res && res.data) {
      setDocData(res.data);
    }
    setLoading(false);
  }, [id]);

  /**
   * 保存文档数据
   */
  const handleSave = async () => {
    if (!docData.title) {
      addToast({
        title: "保存失败",
        description: "请输入文档标题",
        color: "danger"
      });
      return;
    }

    setLoading(true);
    const res = await handleApiCall<ApiResponse<string | boolean>>({
      requestFn: () => {
        if (id && id !== "new") {
          return updateDocument(id, docData);
        } else {
          return createDocument(docData);
        }
      },
      errorPrefix: "保存文档失败"
    });

    if (res && res.code === 200) {
      addToast({
        title: "保存成功",
        description: id && id !== "new" ? "文档更新成功" : "新文档已创建",
        color: "success"
      });
      // 如果是新建，跳转到列表页或当前编辑页
      if (!id || id === "new") {
        navigate("/admin/document/list");
      }
    }
    setLoading(false);
  };

  /**
   * 初始化编辑器
   */
  const initEditor = useCallback(() => {
    if (!editorRef.current || quillRef.current) return;

    const editorElement = editorRef.current;
    editorElement.innerHTML = "";
    
    // 清理可能存在的旧工具栏
    const parentElement = editorElement.parentElement;
    if (parentElement) {
      parentElement.querySelectorAll(".ql-toolbar").forEach(el => el.remove());
    }

    // 创建 Quill 实例
    const instance = new Quill(editorElement, {
      theme: "snow",
      modules: {
        toolbar: TOOLBAR_OPTIONS
      }
    });

    // 中文化工具栏提示
    const toolbar = editorElement.parentElement?.querySelector(".ql-toolbar") as HTMLElement | null;
    if (toolbar) {
      const mappings: Record<string, string> = {
        ".ql-bold": "加粗",
        ".ql-italic": "斜体",
        ".ql-underline": "下划线",
        ".ql-strike": "删除线",
        ".ql-blockquote": "引用",
        ".ql-code-block": "代码块",
        ".ql-script[value=\"sub\"]": "下标",
        ".ql-script[value=\"super\"]": "上标",
        ".ql-list[value=\"ordered\"]": "有序列表",
        ".ql-list[value=\"bullet\"]": "无序列表",
        ".ql-indent[value=\"-1\"]": "减少缩进",
        ".ql-indent[value=\"+1\"]": "增加缩进",
        ".ql-color": "文字颜色",
        ".ql-background": "背景颜色",
        ".ql-align": "对齐方式",
        ".ql-link": "插入链接",
        ".ql-image": "插入图片",
        ".ql-clean": "清除格式"
      };
      
      Object.entries(mappings).forEach(([selector, title]) => {
        const el = toolbar.querySelector(selector) as HTMLElement | null;
        if (el) el.title = title;
      });

      // 下拉菜单文本汉化
      const updatePickerLabel = (selector: string, defaultText: string, labels: Record<string, string>) => {
        const label = toolbar.querySelector(`${selector} .ql-picker-label`) as HTMLElement | null;
        if (label) {
          label.dataset.label = defaultText;
          label.innerText = defaultText;
        }
        toolbar.querySelectorAll(`${selector} .ql-picker-item`).forEach(item => {
          const el = item as HTMLElement;
          const val = el.dataset.value || "";
          if (labels[val]) {
            el.dataset.label = labels[val];
            el.innerText = labels[val];
          }
        });
      };

      updatePickerLabel(".ql-header", "正文", { "1": "标题1", "2": "标题2", "3": "标题3" });
      updatePickerLabel(".ql-font", "字体", { "": "默认字体", "serif": "衬线字体", "monospace": "等宽字体" });
      updatePickerLabel(".ql-size", "字号", { "small": "小号", "": "默认", "large": "大号", "huge": "特大" });
    }

    // 设置编辑器样式
    const editorArea = editorElement.querySelector(".ql-editor") as HTMLElement | null;
    if (editorArea) {
      editorArea.style.minHeight = "480px";
    }

    // 绑定内容变更事件
    instance.on("text-change", () => {
      const html = instance.root.innerHTML;
      setDocData(prev => prev.content === html ? prev : { ...prev, content: html });
    });

    quillRef.current = instance;
  }, []);

  // ===== 9. 页面初始化与事件绑定 =====
  /**
   * 初始化加载数据
   */
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadDocumentData();
  }, [loadDocumentData]);

  /**
   * 初始化编辑器
   */
  useEffect(() => {
    initEditor();
    return () => {
      if (quillRef.current) {
        quillRef.current.off("text-change");
        quillRef.current = null;
      }
    };
  }, [initEditor]);

  /**
   * 同步内容到编辑器
   */
  useEffect(() => {
    if (quillRef.current && docData.content && docData.content !== quillRef.current.root.innerHTML) {
      quillRef.current.root.innerHTML = docData.content;
    }
  }, [docData.content]);

  // ===== 10. TODO任务管理区域 =====

  // UI 渲染
  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background">
      {/* 顶部工具栏 */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-default-200 bg-content1 shadow-sm z-10">
        <div className="flex items-center gap-4 flex-1">
          <Button isIconOnly variant="light" onPress={() => navigate(-1)} radius="full">
            <FiChevronLeft className="text-xl" />
          </Button>
          <Input 
            value={docData.title} 
            onChange={(e) => setDocData({...docData, title: e.target.value})}
            placeholder="输入文档标题..." 
            className="max-w-xl font-bold"
            variant="underlined"
            size="lg"
          />
        </div>
        <div className="flex items-center gap-3">
           <Button 
            variant={showSeo ? "flat" : "light"} 
            color={showSeo ? "primary" : "default"}
            onPress={() => setShowSeo(!showSeo)} 
            startContent={<FiSettings />}
           >
            SEO 设置
          </Button>
          <Button color="primary" variant="flat" startContent={<FiSave />} onPress={handleSave} isLoading={loading}>
            保存草稿
          </Button>
          <Button color="primary" startContent={<FiSend />} onPress={handleSave} isLoading={loading}>
            正式发布
          </Button>
        </div>
      </header>

      {/* 主体编辑区域 */}
      <div className="flex flex-1 overflow-hidden relative">
        {loading && !docData.content ? (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/50 backdrop-blur-sm">
            <Loading />
          </div>
        ) : null}

        <div className="flex-1 flex overflow-hidden">
          {/* 左侧：文档大纲 */}
          <div className="w-64 border-r border-default-200 bg-content2/50 p-6 hidden lg:block overflow-y-auto">
            <h3 className="font-bold mb-6 flex items-center gap-2 text-default-700">
              <FiList /> 文档大纲
            </h3>
            <ul className="space-y-4">
              {headings.length === 0 && (
                <li className="text-default-400 text-sm italic">在编辑器中输入标题自动生成大纲</li>
              )}
              {headings.map((h, i) => (
                <li 
                  key={i} 
                  className={`
                    text-sm hover:text-primary cursor-pointer transition-colors
                    ${h.level === 1 ? "font-bold" : "text-default-500"}
                  `}
                  style={{ paddingLeft: `${(h.level - 1) * 12}px` }}
                >
                  {h.text}
                </li>
              ))}
            </ul>
          </div>

          {/* 中间：富文本编辑器 */}
          <div className="flex-1 flex flex-col overflow-hidden bg-background p-6 md:p-8">
            <div className="max-w-5xl w-full mx-auto h-full flex flex-col">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm font-medium text-default-500">文档正文内容</span>
                <span className="text-xs text-default-400">最后保存: 刚刚</span>
              </div>
              <div
                className="flex-1 bg-content1 border border-default-200 rounded-lg overflow-hidden flex flex-col shadow-sm"
                onClick={() => quillRef.current?.focus()}
              >
                <div ref={editorRef} className="flex-1 overflow-y-auto" />
              </div>
            </div>
          </div>

          {/* 右侧：SEO 面板 */}
          {showSeo && (
              <div className="w-80 border-l border-default-200 bg-content1 p-6 overflow-y-auto animate-in slide-in-from-right duration-300">
                  {docData.seo && (
                    <SEOPanel 
                      data={docData.seo} 
                      onChange={(seo) => setDocData({...docData, seo})} 
                    />
                  )}
              </div>
          )}
        </div>
      </div>
    </div>
  );
}
