import React, { useEffect, useState, useMemo, useRef } from "react";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Input,
  Progress,
  Textarea,
  Divider
} from "@heroui/react";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import {
  FiSave,
  FiSend,
  FiSettings,
  FiList
} from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";
import { getDocumentDetail, createDocument, updateDocument, type DocumentDetail } from "../../../api/admin/document";

type HeadingItem = { level: number; text: string; id: string };

function extractHeadingsFromHtml(html: string): HeadingItem[] {
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
}

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

const SEOPanel = ({ data, onChange }: { data: NonNullable<DocumentDetail['seo']>, onChange: (seo: NonNullable<DocumentDetail['seo']>) => void }) => {
  const scores = useMemo(() => {
    const titleScore = data.title.length > 5 ? 100 : 40;
    const descScore = data.description.length > 20 ? 100 : 50;
    const total = (titleScore + descScore) / 2;
    return { title: titleScore, description: descScore, total };
  }, [data]);

  return (
    <Card className="h-full">
      <CardHeader className="font-bold text-lg">SEO 优化 (Mock)</CardHeader>
      <CardBody className="gap-4">
        <div className="flex items-center gap-4">
            <div className="text-4xl font-bold text-primary">{scores.total}</div>
            <div className="text-sm text-default-500">总分 / 100</div>
        </div>
        <Progress 
            value={scores.total} 
            color={scores.total < 60 ? "danger" : "success"} 
            label="SEO 总评分"
            showValueLabel
        />
        
        <Divider />
        
        <Input 
            label="标题关键词" 
            value={data.title} 
            onChange={(e) => onChange({ ...data, title: e.target.value })}
            description={scores.title < 60 ? "建议增加标题长度" : "标题长度适中"}
            color={scores.title < 60 ? "danger" : "success"}
            variant="bordered"
            classNames={{
                inputWrapper: [
                    "bg-transparent",
                    "border border-[var(--border-color)]",
                    "dark:border-white/20",
                    "hover:border-[var(--primary-color)]/80!",
                    "group-data-[focus=true]:border-[var(--primary-color)]!",
                    "transition-colors",
                    "shadow-none"
                ].join(" "),
                input: "text-xs",
                label: "text-xs font-medium"
            }}
        />
        
        <Textarea 
            label="页面描述" 
            value={data.description} 
            onChange={(e) => onChange({ ...data, description: e.target.value })}
             description={scores.description < 60 ? "描述过短，建议补充" : "描述完善"}
             color={scores.description < 60 ? "danger" : "success"}
             variant="bordered"
             classNames={{
                 inputWrapper: [
                     "bg-transparent",
                     "border border-[var(--border-color)]",
                     "dark:border-white/20",
                     "hover:border-[var(--primary-color)]/80!",
                     "group-data-[focus=true]:border-[var(--primary-color)]!",
                     "transition-colors",
                     "shadow-none"
                 ].join(" "),
                 input: "text-xs",
                 label: "text-xs font-medium"
             }}
        />
        
        <Input 
            label="关键词 (逗号分隔)" 
            value={data.keywords.join(",")} 
            onChange={(e) => onChange({ ...data, keywords: e.target.value.split(",") })}
            variant="bordered"
            classNames={{
                inputWrapper: [
                    "bg-transparent",
                    "border border-[var(--border-color)]",
                    "dark:border-white/20",
                    "hover:border-[var(--primary-color)]/80!",
                    "group-data-[focus=true]:border-[var(--primary-color)]!",
                    "transition-colors",
                    "shadow-none"
                ].join(" "),
                input: "text-xs",
                label: "text-xs font-medium"
            }}
        />
      </CardBody>
    </Card>
  );
};

export default function DocumentEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const editorRef = useRef<HTMLDivElement | null>(null);
  const quillRef = useRef<Quill | null>(null);
  const [document, setDocument] = useState<Partial<DocumentDetail>>({
    title: "",
    content: "",
    seo: { title: "", description: "", keywords: [] },
    category: "未分类"
  });
  const [showSeo, setShowSeo] = useState(false);

  const headings = useMemo(
    () => extractHeadingsFromHtml(document.content ?? ""),
    [document.content]
  );

  useEffect(() => {
    if (!editorRef.current || quillRef.current) {
      return;
    }
    const editorElement = editorRef.current;
    editorElement.innerHTML = "";
    const parentElement = editorElement.parentElement;
    if (parentElement) {
      const existingToolbars = parentElement.querySelectorAll(".ql-toolbar");
      existingToolbars.forEach(toolbarElement => {
        toolbarElement.remove();
      });
    }
    const instance = new Quill(editorElement, {
      theme: "snow",
      modules: {
        toolbar: TOOLBAR_OPTIONS
      }
    });
    const toolbarSibling = editorElement.previousElementSibling as HTMLElement | null;
    const toolbar =
      toolbarSibling && toolbarSibling.classList.contains("ql-toolbar")
        ? toolbarSibling
        : (editorElement.parentElement?.querySelector(".ql-toolbar") as HTMLElement | null);
    if (toolbar) {
      const mappings: { selector: string; title: string }[] = [
        { selector: ".ql-bold", title: "加粗" },
        { selector: ".ql-italic", title: "斜体" },
        { selector: ".ql-underline", title: "下划线" },
        { selector: ".ql-strike", title: "删除线" },
        { selector: ".ql-blockquote", title: "引用" },
        { selector: ".ql-code-block", title: "代码块" },
        { selector: ".ql-script[value=\"sub\"]", title: "下标" },
        { selector: ".ql-script[value=\"super\"]", title: "上标" },
        { selector: ".ql-list[value=\"ordered\"]", title: "有序列表" },
        { selector: ".ql-list[value=\"bullet\"]", title: "无序列表" },
        { selector: ".ql-indent[value=\"-1\"]", title: "减少缩进" },
        { selector: ".ql-indent[value=\"+1\"]", title: "增加缩进" },
        { selector: ".ql-color", title: "文字颜色" },
        { selector: ".ql-background", title: "背景颜色" },
        { selector: ".ql-align", title: "对齐方式" },
        { selector: ".ql-link", title: "插入链接" },
        { selector: ".ql-image", title: "插入图片" },
        { selector: ".ql-clean", title: "清除格式" }
      ];
      mappings.forEach(({ selector, title }) => {
        const element = toolbar.querySelector(selector) as HTMLElement | null;
        if (element) {
          element.title = title;
        }
      });
      const headerLabel = toolbar.querySelector(".ql-header .ql-picker-label") as HTMLElement | null;
      if (headerLabel) {
        headerLabel.dataset.label = "段落";
        headerLabel.innerText = "段落";
      }
      const headerItems = toolbar.querySelectorAll(".ql-header .ql-picker-item");
      headerItems.forEach(item => {
        const element = item as HTMLElement;
        const value = element.dataset.value;
        if (value === "1") {
          element.dataset.label = "标题1";
          element.innerText = "标题1";
        } else if (value === "2") {
          element.dataset.label = "标题2";
          element.innerText = "标题2";
        } else if (value === "3") {
          element.dataset.label = "标题3";
          element.innerText = "标题3";
        } else if (!value) {
          element.dataset.label = "正文";
          element.innerText = "正文";
        }
      });
      const fontLabel = toolbar.querySelector(".ql-font .ql-picker-label") as HTMLElement | null;
      if (fontLabel) {
        fontLabel.dataset.label = "字体";
        fontLabel.innerText = "字体";
      }
      const fontItems = toolbar.querySelectorAll(".ql-font .ql-picker-item");
      fontItems.forEach(item => {
        const element = item as HTMLElement;
        const value = element.dataset.value;
        if (!value) {
          element.dataset.label = "默认字体";
          element.innerText = "默认字体";
        } else if (value === "serif") {
          element.dataset.label = "衬线字体";
          element.innerText = "衬线字体";
        } else if (value === "monospace") {
          element.dataset.label = "等宽字体";
          element.innerText = "等宽字体";
        }
      });
      const sizeLabel = toolbar.querySelector(".ql-size .ql-picker-label") as HTMLElement | null;
      if (sizeLabel) {
        sizeLabel.dataset.label = "字号";
        sizeLabel.innerText = "字号";
      }
      const sizeItems = toolbar.querySelectorAll(".ql-size .ql-picker-item");
      sizeItems.forEach(item => {
        const element = item as HTMLElement;
        const value = element.dataset.value;
        if (value === "small") {
          element.dataset.label = "小号";
          element.innerText = "小号";
        } else if (!value) {
          element.dataset.label = "默认";
          element.innerText = "默认";
        } else if (value === "large") {
          element.dataset.label = "大号";
          element.innerText = "大号";
        } else if (value === "huge") {
          element.dataset.label = "特大";
          element.innerText = "特大";
        }
      });
    }
    const editorArea = editorElement.querySelector(".ql-editor") as HTMLElement | null;
    if (editorArea) {
      editorArea.style.minHeight = "480px";
    }
    instance.on("text-change", () => {
      const html = instance.root.innerHTML;
      setDocument(previous => {
        if (previous.content === html) {
          return previous;
        }
        return {
          ...previous,
          content: html
        };
      });
    });
    quillRef.current = instance;
    return () => {
      instance.off("text-change");
      quillRef.current = null;
      if (parentElement) {
        const toolbars = parentElement.querySelectorAll(".ql-toolbar");
        toolbars.forEach(toolbarElement => {
          toolbarElement.remove();
        });
      }
      editorElement.innerHTML = "";
    };
  }, []);

  useEffect(() => {
    if (!quillRef.current) {
      return;
    }
    const currentHtml = quillRef.current.root.innerHTML;
    if (document.content && document.content !== currentHtml) {
      quillRef.current.root.innerHTML = document.content;
    }
  }, [document.content]);

  useEffect(() => {
    if (id && id !== "new") {
      getDocumentDetail(id).then((res) => {
          // Mock data if API fails or returns empty (for demo)
          if(!res) {
               setDocument({
                  title: "示例现有文档",
                  content: "<h1>Hello World</h1><p>This is a mock document content.</p>",
                  seo: { title: "示例", description: "这是一个示例", keywords: ["test"] },
                   category: "前端基础"
               });
          } else {
              setDocument(res);
          }
      }).catch(() => {
           // Fallback for demo
           setDocument({
              title: "示例现有文档 (Mock)",
              content: "<h1>Hello World</h1><p>This is a mock document content loaded on error.</p>",
              seo: { title: "示例", description: "这是一个示例", keywords: ["test"] },
               category: "前端基础"
           });
      });
    }
  }, [id]);

  const handleSave = async () => {
    try {
        if (id && id !== "new") {
            await updateDocument(id, document);
        } else {
            await createDocument(document);
        }
        alert("保存成功 (Mock)");
        // In real app: toast.success("Saved!");
    } catch {
        alert("保存失败 (Mock)");
    }
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background">
      {/* Top Bar */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-default-200 bg-content1">
        <div className="flex items-center gap-4 flex-1">
          <Button isIconOnly variant="light" onPress={() => navigate(-1)}>
            ←
          </Button>
          <Input 
            value={document.title} 
            onChange={(e) => setDocument({...document, title: e.target.value})}
            placeholder="输入文档标题..." 
            className="max-w-md font-bold text-lg"
            variant="underlined"
          />
        </div>
        <div className="flex items-center gap-2">
           <Button variant="ghost" onPress={() => setShowSeo(!showSeo)} startContent={<FiSettings />}>
            SEO 优化
          </Button>
          <Button color="primary" variant="flat" startContent={<FiSave />} onPress={handleSave}>
            保存草稿
          </Button>
          <Button color="primary" startContent={<FiSend />} onPress={handleSave}>
            发布
          </Button>
        </div>
      </header>

      {/* Main Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Structure */}
        <div className="w-64 border-r border-default-200 bg-content2 p-4 hidden md:block overflow-y-auto">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <FiList /> 文档大纲
          </h3>
          <ul className="space-y-2">
            {headings.length === 0 && <li className="text-default-400 text-sm">暂无大纲</li>}
            {headings.map((h, i) => (
              <li key={i} className={`pl-${(h.level - 1) * 4} text-sm hover:text-primary cursor-pointer`}>
                {h.text}
              </li>
            ))}
          </ul>
        </div>

        {/* Center: Editor */}
        <div className="flex-1 flex flex-col overflow-hidden bg-background">
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <div className="mb-2 text-sm text-default-500">正文：</div>
            <div
              className="bg-content1 border border-default-200"
              onClick={() => {
                if (quillRef.current) {
                  quillRef.current.focus();
                }
              }}
            >
              <div ref={editorRef} className="min-h-[480px]" />
            </div>
          </div>
        </div>

        {/* Right: SEO Panel */}
        {showSeo && (
            <div className="w-80 border-l border-default-200 bg-content1 p-4 overflow-y-auto transition-all">
                {document.seo && <SEOPanel data={document.seo} onChange={(seo) => setDocument({...document, seo})} />}
            </div>
        )}
      </div>
    </div>
  );
}
