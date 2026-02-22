/**
 * 文档上传管理 Hook
 * @module hooks/useDocumentUpload
 * @description 提供文档上传的状态管理、文件验证、任务管理等功能
 */

import { useState, useCallback, useRef } from 'react';
import { addToast } from '@heroui/react';
import {
  initDocumentUpload,
  finishDocumentUpload,
  removeDocumentUploadTask,
  batchRemoveDocumentUploadTasks,
  retryDocumentUploadTask,
  fetchDocumentCategories,
  fetchTagOptions,
  fetchDocumentUploadTaskList,
  fetchDraftList,
  createDocument,
  type DocumentUploadTaskItem,
  type DocCategory,
  type DocTag,
  type DocNote
} from '@/api/admin/document';
import { formatFileSize } from '@/utils/formatUtils';

/** 允许上传的文件扩展名 */
const ALLOWED_FILE_EXTENSIONS = ['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.md'] as const;

/** 最大文件大小（字节） */
const MAX_FILE_SIZE = 100 * 1024 * 1024;

/** 默认封面图片路径 */
const DEFAULT_COVER = '/DefaultImage/MyDefaultImage.jpg';

/** useDocumentUpload 配置参数 */
interface UseDocumentUploadOptions {
  /** 上传成功回调 */
  onSuccess?: () => void;
}

/** useDocumentUpload 返回值 */
interface UseDocumentUploadReturn {
  /** 加载状态 */
  isLoading: boolean;
  /** 分类数据 */
  categoryData: DocCategory[];
  /** 标签选项 */
  tagOptions: DocTag[];
  /** 任务列表 */
  tasks: DocumentUploadTaskItem[];
  /** 草稿列表 */
  drafts: DocNote[];
  /** 消息提示 */
  message: string;
  /** 上传中状态 */
  isUploading: boolean;
  /** 选中的文件名 */
  selectedFileName: string;
  /** 选中的文件大小 */
  selectedFileSize: number;
  /** 文件输入引用 */
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  /** 封面输入引用 */
  coverInputRef: React.RefObject<HTMLInputElement | null>;
  /** 封面图片 */
  coverImage: string;
  /** 加载初始数据 */
  loadInitialData: () => Promise<void>;
  /** 处理文件选择 */
  handleSelectFile: () => void;
  /** 处理文件变更 */
  handleFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  /** 创建上传任务 */
  handleCreateTask: (params: {
    title: string;
    category: string;
    tags: string[];
    description: string;
    isPublic: boolean;
  }) => Promise<boolean>;
  /** 删除上传任务 */
  handleRemoveTask: (id: string) => Promise<boolean>;
  /** 批量删除上传任务 */
  handleBatchRemoveTasks: (ids: string[]) => Promise<boolean>;
  /** 重试上传任务 */
  handleRetryTask: (id: string) => Promise<boolean>;
  /** 保存草稿 */
  handleSaveDraft: (params: {
    title: string;
    category: string;
    description: string;
    tags: string[];
    cover: string;
  }) => Promise<boolean>;
  /** 加载草稿 */
  handleLoadDraft: (draft: DocNote, callbacks: {
    setTitle: (title: string) => void;
    setCategory: (category: string) => void;
    setDescription: (desc: string) => void;
  }) => void;
  /** 选择封面 */
  handleSelectCover: () => void;
  /** 处理封面变更 */
  handleCoverChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  /** 设置封面图片 */
  setCoverImage: (url: string) => void;
  /** 设置消息 */
  setMessage: (msg: string) => void;
  /** 清空选中文件 */
  clearSelectedFile: () => void;
  /** 格式化文件大小 */
  formatSize: (size: number) => string;
}

/**
 * 文档上传管理 Hook
 * @param options 配置参数
 * @returns 上传状态与操作方法
 * @example
 * ```tsx
 * const { handleFileChange, handleCreateTask, tasks } = useDocumentUpload();
 * ```
 */
export function useDocumentUpload(options: UseDocumentUploadOptions = {}): UseDocumentUploadReturn {
  const { onSuccess } = options;

  const [isLoading, setIsLoading] = useState(false);
  const [categoryData, setCategoryData] = useState<DocCategory[]>([]);
  const [tagOptions, setTagOptions] = useState<DocTag[]>([]);
  const [tasks, setTasks] = useState<DocumentUploadTaskItem[]>([]);
  const [drafts, setDrafts] = useState<DocNote[]>([]);
  const [message, setMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState('');
  const [selectedFileSize, setSelectedFileSize] = useState(0);
  const [coverImage, setCoverImage] = useState(DEFAULT_COVER);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const coverInputRef = useRef<HTMLInputElement | null>(null);

  /** 加载初始数据 */
  const loadInitialData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [catsRes, tagsRes, taskListRes, draftListRes] = await Promise.all([
        fetchDocumentCategories(),
        fetchTagOptions(),
        fetchDocumentUploadTaskList({ page: 1, pageSize: 10 }),
        fetchDraftList({ page: 1, pageSize: 10 })
      ]);

      if (catsRes && catsRes.code === 200) setCategoryData(catsRes.data);
      if (tagsRes && tagsRes.code === 200) setTagOptions(tagsRes.data);
      if (taskListRes && taskListRes.code === 200) setTasks(taskListRes.data);
      if (draftListRes && draftListRes.code === 200) setDrafts(draftListRes.data.rows);
    } catch {
      addToast({
        title: '数据加载失败',
        description: '页面初始数据加载异常，请刷新重试。',
        color: 'danger'
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  /** 处理文件选择 */
  const handleSelectFile = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  /** 处理文件变更 */
  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setSelectedFileName('');
      setSelectedFileSize(0);
      return;
    }

    const fileName = file.name;
    const extension = fileName.substring(fileName.lastIndexOf('.')).toLowerCase();

    if (!ALLOWED_FILE_EXTENSIONS.includes(extension as typeof ALLOWED_FILE_EXTENSIONS[number])) {
      setMessage('仅支持 PDF、Word、PPT、Markdown 格式的文档上传');
      setSelectedFileName('');
      setSelectedFileSize(0);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setMessage('文件大小不能超过 100MB');
      setSelectedFileName('');
      setSelectedFileSize(0);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setMessage('');
    setSelectedFileName(file.name);
    setSelectedFileSize(file.size);
  }, []);

  /** 创建上传任务 */
  const handleCreateTask = useCallback(async (params: {
    title: string;
    category: string;
    tags: string[];
    description: string;
    isPublic: boolean;
  }): Promise<boolean> => {
    const trimmedTitle = params.title.trim();
    if (!trimmedTitle) {
      setMessage('请填写文档标题');
      return false;
    }
    if (!selectedFileName) {
      setMessage('请选择要上传的文档文件');
      return false;
    }

    setIsUploading(true);
    try {
      const initRes = await initDocumentUpload({
        title: trimmedTitle,
        fileName: selectedFileName,
        fileSize: selectedFileSize,
        fileMd5: 'mock_md5',
        category: params.category,
        tags: params.tags,
        description: params.description,
        isPublic: params.isPublic,
        price: 0
      });

      if (initRes && initRes.code === 200) {
        const { uploadId } = initRes.data;
        setMessage('正在上传文件...');

        const now = new Date();
        const newTask: DocumentUploadTaskItem = {
          id: uploadId,
          title: trimmedTitle,
          fileName: selectedFileName,
          size: selectedFileSize,
          status: 'uploading',
          progress: 0,
          createdAt: now.toISOString().replace('T', ' ').slice(0, 19)
        };
        setTasks(prev => [newTask, ...prev]);

        await new Promise(resolve => setTimeout(resolve, 1000));
        setTasks(prev => prev.map(t => t.id === uploadId ? { ...t, progress: 50 } : t));

        await new Promise(resolve => setTimeout(resolve, 1000));

        const finishRes = await finishDocumentUpload({
          uploadId,
          status: 'success'
        });

        if (finishRes && finishRes.code === 200) {
          setTasks(prev => prev.map(t =>
            t.id === uploadId ? { ...t, progress: 100, status: 'success' } : t
          ));
          setMessage('文档上传成功');
          addToast({
            title: '上传成功',
            description: `文档 ${trimmedTitle} 已上传并发布。`,
            color: 'success'
          });

          setSelectedFileName('');
          setSelectedFileSize(0);
          if (fileInputRef.current) fileInputRef.current.value = '';

          onSuccess?.();
          return true;
        }
      }
    } catch {
      setMessage('上传失败，请重试');
      addToast({
        title: '上传失败',
        description: '文件上传过程中发生错误。',
        color: 'danger'
      });
    } finally {
      setIsUploading(false);
    }

    return false;
  }, [selectedFileName, selectedFileSize, onSuccess]);

  /** 删除上传任务 */
  const handleRemoveTask = useCallback(async (id: string): Promise<boolean> => {
    const confirmed = window.confirm('确定要删除该上传任务吗？');
    if (!confirmed) return false;

    const res = await removeDocumentUploadTask(id);
    if (res && res.code === 200) {
      setTasks(prev => prev.filter(t => t.id !== id));
      addToast({
        title: '删除成功',
        description: '上传任务已移除。',
        color: 'success'
      });
      return true;
    }

    return false;
  }, []);

  /** 批量删除上传任务 */
  const handleBatchRemoveTasks = useCallback(async (ids: string[]): Promise<boolean> => {
    if (ids.length === 0) return false;

    const confirmed = window.confirm(`确定要删除选中的 ${ids.length} 个任务吗？`);
    if (!confirmed) return false;

    const res = await batchRemoveDocumentUploadTasks(ids);
    if (res && res.code === 200) {
      setTasks(prev => prev.filter(t => !ids.includes(t.id)));
      addToast({
        title: '批量删除成功',
        description: `已移除 ${ids.length} 个上传任务。`,
        color: 'success'
      });
      return true;
    }

    return false;
  }, []);

  /** 重试上传任务 */
  const handleRetryTask = useCallback(async (id: string): Promise<boolean> => {
    const res = await retryDocumentUploadTask(id);
    if (res && res.code === 200) {
      setTasks(prev => prev.map(t =>
        t.id === id ? { ...t, status: 'uploading', progress: 0 } : t
      ));
      addToast({
        title: '重试中',
        description: '任务已重新开始上传。',
        color: 'primary'
      });
      return true;
    }

    return false;
  }, []);

  /** 保存草稿 */
  const handleSaveDraft = useCallback(async (params: {
    title: string;
    category: string;
    description: string;
    tags: string[];
    cover: string;
  }): Promise<boolean> => {
    const trimmedTitle = params.title.trim();
    if (!trimmedTitle && !selectedFileName) {
      setMessage('没有内容可保存');
      return false;
    }

    const res = await createDocument({
      noteName: trimmedTitle || '未命名文档',
      broadCode: params.category,
      content: params.description,
      status: 3,
      noteTags: params.tags.join(','),
      cover: params.cover
    });

    if (res && res.code === 200) {
      setMessage('草稿已保存');
      addToast({
        title: '草稿保存成功',
        description: '文档已保存至草稿箱。',
        color: 'success'
      });

      const draftRes = await fetchDraftList({ page: 1, pageSize: 10 });
      if (draftRes && draftRes.code === 200) {
        setDrafts(draftRes.data.rows);
      }

      return true;
    }

    return false;
  }, [selectedFileName]);

  /** 加载草稿 */
  const handleLoadDraft = useCallback((draft: DocNote, callbacks: {
    setTitle: (title: string) => void;
    setCategory: (category: string) => void;
    setDescription: (desc: string) => void;
  }) => {
    callbacks.setTitle(draft.noteName || '');
    callbacks.setCategory(draft.broadCode || '');
    callbacks.setDescription(draft.content || '');
    setMessage('已加载草稿');
  }, []);

  /** 选择封面 */
  const handleSelectCover = useCallback(() => {
    coverInputRef.current?.click();
  }, []);

  /** 处理封面变更 */
  const handleCoverChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setCoverImage(url);
    }
  }, []);

  /** 清空选中文件 */
  const clearSelectedFile = useCallback(() => {
    setSelectedFileName('');
    setSelectedFileSize(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  /** 格式化文件大小 */
  const formatSize = useCallback((size: number): string => {
    return formatFileSize(size);
  }, []);

  return {
    isLoading,
    categoryData,
    tagOptions,
    tasks,
    drafts,
    message,
    isUploading,
    selectedFileName,
    selectedFileSize,
    fileInputRef,
    coverInputRef,
    coverImage,
    loadInitialData,
    handleSelectFile,
    handleFileChange,
    handleCreateTask,
    handleRemoveTask,
    handleBatchRemoveTasks,
    handleRetryTask,
    handleSaveDraft,
    handleLoadDraft,
    handleSelectCover,
    handleCoverChange,
    setCoverImage,
    setMessage,
    clearSelectedFile,
    formatSize
  };
}

export default useDocumentUpload;
