/**
 * 文档编辑页面
 * @module pages/Admin/Document/Edit
 * @description 提供文档的创建、编辑、SEO 优化等功能
 */

import React, { useEffect, useState, useCallback } from 'react';
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
} from '@heroui/react';
import {
  FiSave,
  FiSend,
  FiSettings,
  FiList,
  FiChevronLeft
} from 'react-icons/fi';
import { useNavigate, useParams } from 'react-router-dom';
import { Loading } from '@/components/Loading';
import { getDocumentDetail, createDocument, updateDocument, type DocNote } from '@/api/admin/document';
import { handleRequest } from '@/api/axios';
import { useDocumentEditor, extractHeadingsFromHtml } from '@/hooks';

interface DocSeoData {
  title: string;
  description: string;
  keywords: string[];
}

interface DocFormData {
  noteName: string;
  content: string;
  seo: DocSeoData;
  broadCode: string;
}

/** SEO 面板组件属性 */
interface SEOPanelProps {
  data: DocSeoData;
  onChange: (seo: DocSeoData) => void;
}

/**
 * SEO 优化面板组件
 * @param props 组件属性
 * @returns SEO 面板 JSX
 */
const SEOPanel: React.FC<SEOPanelProps> = ({ data, onChange }) => {
  const scores = React.useMemo(() => {
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
          color={scores.total < 60 ? 'danger' : 'success'}
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
            description={scores.title < 60 ? '建议增加标题长度以提高权重' : '标题长度符合规范'}
            color={scores.title < 60 ? 'danger' : 'success'}
            variant="bordered"
            classNames={{
              inputWrapper: 'border-default-200 focus-within:border-primary',
              label: 'text-xs font-medium'
            }}
          />

          <Textarea
            label="页面描述 (Description)"
            placeholder="请输入页面描述"
            value={data.description}
            onChange={(e) => onChange({ ...data, description: e.target.value })}
            description={scores.description < 60 ? '描述过短，不利于搜索结果展示' : '描述信息完善'}
            color={scores.description < 60 ? 'danger' : 'success'}
            variant="bordered"
            classNames={{
              inputWrapper: 'border-default-200 focus-within:border-primary',
              label: 'text-xs font-medium'
            }}
          />

          <Input
            label="关键词 (Keywords)"
            placeholder="多个关键词请用逗号隔开"
            value={data.keywords.join(',')}
            onChange={(e) => onChange({ ...data, keywords: e.target.value.split(',') })}
            variant="bordered"
            classNames={{
              inputWrapper: 'border-default-200 focus-within:border-primary',
              label: 'text-xs font-medium'
            }}
          />
        </div>
      </CardBody>
    </Card>
  );
};

/**
 * 文档编辑页面组件
 * @returns 页面 JSX 元素
 */
export default function DocumentEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [docData, setDocData] = useState<DocFormData>({
    noteName: '',
    content: '',
    seo: { title: '', description: '', keywords: [] },
    broadCode: ''
  });
  const [showSeo, setShowSeo] = useState(false);

  const { editorRef, quillRef, content, setContent } = useDocumentEditor({
    initialContent: docData.content,
    onContentChange: (html: string) => {
      setDocData(prev => ({ ...prev, content: html }));
    }
  });

  const headings = extractHeadingsFromHtml(content);

  /** 加载文档详情 */
  const loadDocumentData = useCallback(async () => {
    if (!id || id === 'new') return;

    setLoading(true);
    const res = await handleRequest({
      requestFn: () => getDocumentDetail(id)
    });

    if (res && res.data) {
      const note = res.data as DocNote;
      setDocData({
        noteName: note.noteName || '',
        content: note.content || '',
        broadCode: note.broadCode || '',
        seo: {
          title: note.seoTitle || '',
          description: note.seoDescription || '',
          keywords: note.seoKeywords ? note.seoKeywords.split(',') : []
        }
      });
      setContent(note.content || '');
    }
    setLoading(false);
  }, [id, setContent]);

  /** 保存文档 */
  const handleSave = async () => {
    if (!docData.noteName) {
      addToast({
        title: '保存失败',
        description: '请输入文档标题',
        color: 'danger'
      });
      return;
    }

    setLoading(true);
    const saveData: Partial<DocNote> = {
      noteName: docData.noteName,
      content: docData.content,
      broadCode: docData.broadCode,
      seoTitle: docData.seo.title,
      seoDescription: docData.seo.description,
      seoKeywords: docData.seo.keywords.join(',')
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = await handleRequest<any>({
      requestFn: () => {
        if (id && id !== 'new') {
          return updateDocument(id, saveData);
        }
        return createDocument(saveData);
      }
    });

    if (res && res.code === 200) {
      addToast({
        title: '保存成功',
        description: id && id !== 'new' ? '文档更新成功' : '新文档已创建',
        color: 'success'
      });
      if (!id || id === 'new') {
        navigate('/admin/document/list');
      }
    }
    setLoading(false);
  };

  /** 初始化加载数据 */
  useEffect(() => {
    const timer = setTimeout(() => {
      loadDocumentData();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadDocumentData]);

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background">
      {/* 顶部工具栏 */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-default-200 bg-content1 shadow-sm z-10">
        <div className="flex items-center gap-4 flex-1">
          <Button isIconOnly variant="light" onPress={() => navigate(-1)} radius="full">
            <FiChevronLeft className="text-xl" />
          </Button>
          <Input
            value={docData.noteName}
            onChange={(e) => setDocData({ ...docData, noteName: e.target.value })}
            placeholder="输入文档标题..."
            className="max-w-xl font-bold"
            variant="underlined"
            size="lg"
          />
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant={showSeo ? 'flat' : 'light'}
            color={showSeo ? 'primary' : 'default'}
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
        {loading && !content ? (
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
                    ${h.level === 1 ? 'font-bold' : 'text-default-500'}
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
              <SEOPanel
                data={docData.seo}
                onChange={(seo) => setDocData({ ...docData, seo })}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
