/**
 * 文档编辑器 Hook
 * @module hooks/useDocumentEditor
 * @description 提供 Quill 富文本编辑器的初始化、内容同步等功能
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import Quill from 'quill';

/** 标题项类型 */
export interface HeadingItem {
  level: number;
  text: string;
  id: string;
}

/** 富文本编辑器工具栏配置 */
const TOOLBAR_OPTIONS = [
  [{ header: [1, 2, 3, false] }, { font: [] }, { size: ['small', false, 'large', 'huge'] }],
  ['bold', 'italic', 'underline', 'strike', 'blockquote', 'code-block'],
  [{ script: 'sub' }, { script: 'super' }],
  [{ color: [] }, { background: [] }],
  [{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }],
  [{ align: [] }],
  ['link', 'image'],
  ['clean']
];

/** 工具栏中文映射 */
const TOOLBAR_I18N_MAPPINGS: Record<string, string> = {
  '.ql-bold': '加粗',
  '.ql-italic': '斜体',
  '.ql-underline': '下划线',
  '.ql-strike': '删除线',
  '.ql-blockquote': '引用',
  '.ql-code-block': '代码块',
  '.ql-script[value="sub"]': '下标',
  '.ql-script[value="super"]': '上标',
  '.ql-list[value="ordered"]': '有序列表',
  '.ql-list[value="bullet"]': '无序列表',
  '.ql-indent[value="-1"]': '减少缩进',
  '.ql-indent[value="+1"]': '增加缩进',
  '.ql-color': '文字颜色',
  '.ql-background': '背景颜色',
  '.ql-align': '对齐方式',
  '.ql-link': '插入链接',
  '.ql-image': '插入图片',
  '.ql-clean': '清除格式'
};

/** 下拉菜单汉化配置 */
const PICKER_I18N_CONFIG = [
  {
    selector: '.ql-header',
    defaultText: '正文',
    labels: { '1': '标题1', '2': '标题2', '3': '标题3' }
  },
  {
    selector: '.ql-font',
    defaultText: '字体',
    labels: { '': '默认字体', 'serif': '衬线字体', 'monospace': '等宽字体' }
  },
  {
    selector: '.ql-size',
    defaultText: '字号',
    labels: { 'small': '小号', '': '默认', 'large': '大号', 'huge': '特大' }
  }
];

/**
 * 从 HTML 中提取标题大纲
 * @param html HTML 字符串
 * @returns 标题列表
 */
export function extractHeadingsFromHtml(html: string): HeadingItem[] {
  if (!html) return [];

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const nodes = doc.querySelectorAll('h1,h2,h3,h4,h5,h6');

  const result: HeadingItem[] = [];
  nodes.forEach((element, index) => {
    const level = Number(element.tagName.substring(1));
    const text = element.textContent?.trim() ?? '';
    if (text) {
      result.push({ level, text, id: `heading-${index}` });
    }
  });

  return result;
}

/** useDocumentEditor 配置参数 */
interface UseDocumentEditorOptions {
  /** 初始内容 */
  initialContent?: string;
  /** 内容变更回调 */
  onContentChange?: (content: string) => void;
  /** 编辑器最小高度 */
  minHeight?: string;
}

/** useDocumentEditor 返回值 */
interface UseDocumentEditorReturn {
  /** 编辑器容器 DOM 引用 */
  editorRef: React.RefObject<HTMLDivElement | null>;
  /** Quill 实例引用 */
  quillRef: React.MutableRefObject<Quill | null>;
  /** 当前内容 */
  content: string;
  /** 设置内容 */
  setContent: (content: string) => void;
  /** 文档大纲 */
  headings: HeadingItem[];
  /** 是否已初始化 */
  isReady: boolean;
  /** 聚焦编辑器 */
  focus: () => void;
}

/**
 * 文档编辑器 Hook
 * @param options 配置参数
 * @returns 编辑器状态与操作方法
 * @example
 * ```tsx
 * const { editorRef, headings, content, isReady } = useDocumentEditor({
 *   onContentChange: (html) => console.log(html)
 * });
 *
 * return <div ref={editorRef} />;
 * ```
 */
export function useDocumentEditor(options: UseDocumentEditorOptions = {}): UseDocumentEditorReturn {
  const { initialContent = '', onContentChange, minHeight = '480px' } = options;

  const editorRef = useRef<HTMLDivElement | null>(null);
  const quillRef = useRef<Quill | null>(null);
  const [content, setContent] = useState(initialContent);
  const [isReady, setIsReady] = useState(false);

  /** 更新下拉菜单标签 */
  const updatePickerLabels = useCallback((toolbar: HTMLElement, config: typeof PICKER_I18N_CONFIG[0]) => {
    const label = toolbar.querySelector(`${config.selector} .ql-picker-label`) as HTMLElement | null;
    if (label) {
      label.dataset.label = config.defaultText;
      label.innerText = config.defaultText;
    }

    toolbar.querySelectorAll(`${config.selector} .ql-picker-item`).forEach(item => {
      const el = item as HTMLElement;
      const val = el.dataset.value || '';
      const labels = config.labels as unknown as Record<string, string>;
      if (labels[val]) {
        el.dataset.label = labels[val];
        el.innerText = labels[val];
      }
    });
  }, []);

  /** 初始化编辑器 */
  const initEditor = useCallback(() => {
    if (!editorRef.current || quillRef.current) return;

    const editorElement = editorRef.current;
    editorElement.innerHTML = '';

    const parentElement = editorElement.parentElement;
    if (parentElement) {
      parentElement.querySelectorAll('.ql-toolbar').forEach(el => el.remove());
    }

    const instance = new Quill(editorElement, {
      theme: 'snow',
      modules: { toolbar: TOOLBAR_OPTIONS }
    });

    const toolbar = editorElement.parentElement?.querySelector('.ql-toolbar') as HTMLElement | null;
    if (toolbar) {
      Object.entries(TOOLBAR_I18N_MAPPINGS).forEach(([selector, title]) => {
        const el = toolbar.querySelector(selector) as HTMLElement | null;
        if (el) el.title = title;
      });

      PICKER_I18N_CONFIG.forEach(config => updatePickerLabels(toolbar, config));
    }

    const editorArea = editorElement.querySelector('.ql-editor') as HTMLElement | null;
    if (editorArea) {
      editorArea.style.minHeight = minHeight;
    }

    instance.on('text-change', () => {
      const html = instance.root.innerHTML;
      setContent(html);
      onContentChange?.(html);
    });

    quillRef.current = instance;
    setIsReady(true);
  }, [minHeight, onContentChange, updatePickerLabels]);

  /** 同步外部内容到编辑器 */
  useEffect(() => {
    if (quillRef.current && content && content !== quillRef.current.root.innerHTML) {
      quillRef.current.root.innerHTML = content;
    }
  }, [content]);

  /** 初始化编辑器 */
  useEffect(() => {
    // 初始化时设置 isReady 是合理的，禁用警告
    // eslint-disable-next-line react-hooks/set-state-in-effect
    initEditor();

    return () => {
      if (quillRef.current) {
        quillRef.current.off('text-change');
        quillRef.current = null;
      }
      setIsReady(false);
    };
  }, [initEditor]);

  /** 提取文档大纲 */
  const headings = extractHeadingsFromHtml(content);

  /** 聚焦编辑器 */
  const focus = useCallback(() => {
    quillRef.current?.focus();
  }, []);

  return {
    editorRef,
    quillRef,
    content,
    setContent,
    headings,
    isReady,
    focus
  };
}

export default useDocumentEditor;
