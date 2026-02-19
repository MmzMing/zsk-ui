/**
 * 文档上传页面
 * @module pages/Admin/Document/Upload
 * @description 提供文档上传、表单填写、任务管理、草稿保存等功能
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Button,
  Card,
  Chip,
  Input,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Textarea,
  Tab,
  Tooltip,
  SelectItem,
  Listbox,
  ListboxItem,
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@heroui/react';
import {
  FiFileText,
  FiInfo,
  FiRefreshCw,
  FiRotateCcw,
  FiTrash2,
  FiUpload,
  FiUploadCloud,
  FiX,
  FiClock,
  FiChevronRight,
  FiTag,
  FiImage
} from 'react-icons/fi';
import { AdminSearchInput } from '@/components/Admin/AdminSearchInput';
import { AdminTabs } from '@/components/Admin/AdminTabs';
import { AdminSelect } from '@/components/Admin/AdminSelect';
import { Loading } from '@/components/Loading';
import { usePageState, useDocumentUpload } from '@/hooks';
import {
  UPLOAD_PAGE_SIZE,
  DEFAULT_COVER,
  getUploadStatusLabel,
  getUploadStatusColor,
  type PermissionType,
  type UploadStatus
} from '@/hooks/documentConstants';

/**
 * 文档上传页面组件
 * @returns 页面 JSX 元素
 */
function DocumentUploadPage() {
  const {
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
  } = useDocumentUpload();

  const [title, setTitle] = useState('');
  const [isTitleTouched, setIsTitleTouched] = useState(false);
  const [category, setCategory] = useState('前端开发');
  const [activeCategoryLevel1, setActiveCategoryLevel1] = useState('1');
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [description, setDescription] = useState('');
  const [permissionType, setPermissionType] = useState<PermissionType>('public');
  const [visibleUsers, setVisibleUsers] = useState<string[]>([]);
  const [visibleUserInput, setVisibleUserInput] = useState('');
  const [accessPassword, setAccessPassword] = useState('');

  const [taskKeyword, setTaskKeyword] = useState('');
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);

  /** 表单验证 */
  const isFormValid = useMemo(() => {
    return title.trim() !== '' &&
      category !== '' &&
      category !== '未分类' &&
      selectedTags.size > 0 &&
      selectedFileName !== '';
  }, [title, category, selectedTags, selectedFileName]);

  /** 任务筛选 */
  const filteredTasks = useMemo(() => {
    const trimmed = taskKeyword.trim().toLowerCase();
    return tasks.filter(item => {
      if (trimmed) {
        const content = `${item.title} ${item.fileName}`.toLowerCase();
        if (!content.includes(trimmed)) return false;
      }
      return true;
    });
  }, [tasks, taskKeyword]);

  /** 任务分页 */
  const { page, totalPages, handlePageChange, getPaginatedData } = usePageState({ pageSize: UPLOAD_PAGE_SIZE });
  const taskPageItems = getPaginatedData(filteredTasks);

  /** 初始化加载 */
  useEffect(() => {
    const timer = setTimeout(() => {
      loadInitialData();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadInitialData]);

  /** 创建上传任务 */
  const onCreateTask = useCallback(async () => {
    const success = await handleCreateTask({
      title,
      category,
      tags: Array.from(selectedTags),
      description,
      isPublic: permissionType === 'public'
    });
    if (success) {
      setTitle('');
      setDescription('');
      setSelectedTags(new Set());
      setCoverImage(DEFAULT_COVER);
    }
  }, [title, category, selectedTags, description, permissionType, handleCreateTask, setCoverImage]);

  /** 保存草稿 */
  const onSaveDraft = useCallback(async () => {
    await handleSaveDraft({
      title,
      category,
      description,
      tags: Array.from(selectedTags),
      cover: coverImage
    });
  }, [title, category, description, selectedTags, coverImage, handleSaveDraft]);

  /** 重置表单 */
  const handleResetForm = useCallback(() => {
    setTitle('');
    setCategory('未分类');
    setSelectedTags(new Set());
    setDescription('');
    clearSelectedFile();
    setMessage('');
  }, [clearSelectedFile, setMessage]);

  /** 加载草稿 */
  const onLoadDraft = useCallback((draft: typeof drafts[0]) => {
    handleLoadDraft(draft, {
      setTitle,
      setCategory,
      setDescription
    });
  }, [handleLoadDraft]);

  /** 任务表格选择变更 */
  const onTaskSelectionChange = useCallback((keys: 'all' | Set<React.Key>) => {
    if (keys === 'all') {
      setSelectedTaskIds(tasks.map(item => item.id));
      return;
    }
    setSelectedTaskIds(Array.from(keys).map(String));
  }, [tasks]);

  /** 批量删除任务 */
  const onBatchRemoveTasks = useCallback(async () => {
    await handleBatchRemoveTasks(selectedTaskIds);
    setSelectedTaskIds([]);
  }, [selectedTaskIds, handleBatchRemoveTasks]);

  return (
    <div className="space-y-6">
      {/* 顶部 Header */}
      <div className="space-y-1">
        <div className="inline-flex items-center gap-2 rounded-full bg-[color-mix(in_srgb,var(--primary-color)_10%,transparent)] px-3 py-1 text-xs text-[var(--primary-color)]">
          <span>文档管理 · 文档上传</span>
        </div>
        <h1 className="text-lg md:text-xl font-semibold tracking-tight">
          统一上传与配置知识库文档内容
        </h1>
        <p className="text-xs text-[var(--text-color-secondary)] max-w-2xl">
          支持 PDF、Word、PPT、Markdown 格式文档上传，自动解析内容并建立知识索引。
        </p>
        {message && (
          <div className="mt-2 text-xs text-[var(--primary-color)] flex items-center gap-1">
            <FiInfo /> {message}
          </div>
        )}
      </div>

      {/* 核心双栏布局 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* 左侧主内容区：信息录入与高级配置 */}
        <div className="lg:col-span-8 space-y-6">
          {/* 1. 基本信息 */}
          <Card className="border border-[var(--border-color)] bg-[var(--bg-elevated)]/95">
            <div className="p-3 border-b border-[var(--border-color)] flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-full bg-[color-mix(in_srgb,var(--primary-color)_18%,transparent)] flex items-center justify-center text-[var(--primary-color)]">
                  <FiFileText className="text-xs" />
                </div>
                <div className="text-sm font-medium">基本信息</div>
              </div>
            </div>
            <div className="p-5 flex flex-col gap-6">
              {/* 文档标题 */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-medium text-[var(--text-color-secondary)]">文档标题</label>
                  <span className={`text-[10px] ${title.length > 100 ? 'text-danger' : 'text-[var(--text-color-secondary)]'}`}>
                    {title.length}/100
                  </span>
                </div>
                <Input
                  size="sm"
                  variant="bordered"
                  aria-label="文档标题"
                  placeholder="请输入文档标题"
                  value={title}
                  onValueChange={(v) => {
                    setTitle(v);
                    if (!isTitleTouched) setIsTitleTouched(true);
                  }}
                  isInvalid={isTitleTouched && !title.trim()}
                  errorMessage={isTitleTouched && !title.trim() ? '请输入文档标题' : ''}
                  classNames={{
                    inputWrapper: [
                      'h-10',
                      'bg-transparent',
                      'border border-[var(--border-color)]',
                      'dark:border-white/20',
                      'hover:border-[var(--primary-color)]/80!',
                      'group-data-[focus=true]:border-[var(--primary-color)]!',
                      'transition-colors',
                      'shadow-none'
                    ].join(' '),
                    input: 'text-xs'
                  }}
                />
              </div>

              {/* 文档分类 */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-[var(--text-color-secondary)]">文档分类</label>
                <Popover placement="bottom-start" showArrow offset={10}>
                  <PopoverTrigger>
                    <Button
                      variant="bordered"
                      size="sm"
                      aria-label="文档分类"
                      className="w-full justify-between h-10 border-[var(--border-color)] hover:border-[var(--primary-color)] bg-[var(--bg-elevated)]/30 text-xs font-normal px-3"
                      endContent={<FiChevronRight className="text-[var(--text-color-secondary)] rotate-90" />}
                      isLoading={isLoading}
                    >
                      {category && category !== '未分类' ? (
                        <div className="flex items-center gap-1">
                          {(() => {
                            const parent = categoryData.find(c => c.children?.some(sub => sub.name === category));
                            return parent ? (
                              <>
                                <span className="text-[var(--text-color-secondary)]">{parent.name}</span>
                                <span className="text-[var(--text-color-secondary)]/50">/</span>
                              </>
                            ) : null;
                          })()}
                          <span>{category}</span>
                        </div>
                      ) : '选择分类'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="p-0 border border-[var(--border-color)] shadow-xl overflow-hidden bg-[var(--bg-elevated)]">
                    <div className="flex h-[280px] min-w-[320px]">
                      {/* 一级分类 */}
                      <div className="w-1/2 border-r border-[var(--border-color)] bg-[var(--bg-elevated)]/50">
                        <Listbox
                          aria-label="一级分类"
                          variant="flat"
                          disallowEmptySelection
                          selectionMode="single"
                          selectedKeys={[activeCategoryLevel1]}
                          onSelectionChange={(keys) => setActiveCategoryLevel1(Array.from(keys)[0] as string)}
                          className="p-1"
                          itemClasses={{
                            base: 'rounded-md px-3 py-2 gap-3 data-[selected=true]:bg-[var(--primary-color)]/10 data-[selected=true]:text-[var(--primary-color)]',
                            title: 'text-xs font-medium'
                          }}
                        >
                          {categoryData.map(cat => (
                            <ListboxItem key={cat.id} endContent={<FiChevronRight className="text-[10px] opacity-50" />}>
                              {cat.name}
                            </ListboxItem>
                          ))}
                        </Listbox>
                      </div>
                      {/* 二级分类 */}
                      <div className="w-1/2 bg-[var(--bg-elevated)]">
                        <Listbox
                          aria-label="二级分类"
                          variant="flat"
                          disallowEmptySelection
                          selectionMode="single"
                          selectedKeys={[category]}
                          onSelectionChange={(keys) => setCategory(Array.from(keys)[0] as string)}
                          className="p-1"
                          itemClasses={{
                            base: 'rounded-md px-3 py-2 data-[selected=true]:bg-[var(--primary-color)]/10 data-[selected=true]:text-[var(--primary-color)]',
                            title: 'text-xs'
                          }}
                        >
                          {(categoryData.find(c => c.id === activeCategoryLevel1)?.children || []).map(sub => (
                            <ListboxItem key={sub.name}>{sub.name}</ListboxItem>
                          ))}
                        </Listbox>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              {/* 文档简介 */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-medium text-[var(--text-color-secondary)]">文档简介</label>
                  <span className={`text-[10px] ${description.length > 500 ? 'text-danger' : 'text-[var(--text-color-secondary)]'}`}>
                    {description.length}/500
                  </span>
                </div>
                <Textarea
                  size="sm"
                  variant="bordered"
                  aria-label="文档简介"
                  placeholder="简要描述文档内容，帮助他人快速了解文档核心价值..."
                  value={description}
                  onValueChange={setDescription}
                  minRows={4}
                  classNames={{
                    inputWrapper: [
                      'bg-transparent',
                      'border border-[var(--border-color)]',
                      'dark:border-white/20',
                      'hover:border-[var(--primary-color)]/80!',
                      'group-data-[focus=true]:border-[var(--primary-color)]!',
                      'transition-colors',
                      'shadow-none',
                      'p-3'
                    ].join(' '),
                    input: 'text-xs leading-relaxed'
                  }}
                />
              </div>

              {/* 标签设置 */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-[var(--text-color-secondary)]">标签设置</label>
                <AdminSelect
                  aria-label="标签设置"
                  placeholder="为文档添加标签 (多选)"
                  selectionMode="multiple"
                  size="sm"
                  selectedKeys={selectedTags}
                  onSelectionChange={(keys) => setSelectedTags(keys as Set<string>)}
                  startContent={<FiTag className="text-[var(--text-color-secondary)] text-xs" />}
                  isLoading={isLoading}
                  classNames={{
                    trigger: [
                      'h-10',
                      'bg-transparent',
                      'border border-[var(--border-color)]',
                      'dark:border-white/20',
                      'hover:border-[var(--primary-color)]/80!',
                      'group-data-[focus=true]:border-[var(--primary-color)]!',
                      'transition-colors',
                      'shadow-none'
                    ].join(' '),
                    value: 'text-xs'
                  }}
                >
                  {tagOptions.map(tag => (
                    <SelectItem key={tag.value} textValue={tag.label}>{tag.label}</SelectItem>
                  ))}
                </AdminSelect>
              </div>
            </div>
          </Card>

          {/* 2. 权限设置 */}
          <Card className="border border-[var(--border-color)] bg-[var(--bg-elevated)]/95">
            <div className="p-3 border-b border-[var(--border-color)]">
              <div className="text-sm font-medium">权限设置</div>
            </div>

            <div className="p-5">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <span className="text-xs text-[var(--text-color-secondary)] w-20">可见范围</span>
                  <AdminTabs
                    selectedKey={permissionType}
                    onSelectionChange={(k) => setPermissionType(k as PermissionType)}
                    size="sm"
                  >
                    <Tab key="public" title="公开可见" />
                    <Tab key="private" title="私有文档" />
                    <Tab key="password" title="密码访问" />
                  </AdminTabs>
                </div>

                <div className="p-4 border border-[var(--border-color)] rounded-lg bg-[var(--bg-elevated)]/30 min-h-[100px]">
                  {permissionType === 'public' && (
                    <div className="text-xs text-[var(--text-color-secondary)] flex items-center gap-2">
                      <FiInfo className="text-sm" />
                      此文档将对所有拥有访问权限的用户公开。
                    </div>
                  )}
                  {permissionType === 'private' && (
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <Input
                          size="sm"
                          variant="bordered"
                          aria-label="用户名"
                          placeholder="输入用户名添加可见权限"
                          value={visibleUserInput}
                          onValueChange={setVisibleUserInput}
                          className="max-w-xs"
                          classNames={{
                            inputWrapper: [
                              'h-8',
                              'bg-transparent',
                              'border border-[var(--border-color)]',
                              'dark:border-white/20',
                              'hover:border-[var(--primary-color)]/80!',
                              'group-data-[focus=true]:border-[var(--primary-color)]!',
                              'transition-colors',
                              'shadow-none'
                            ].join(' '),
                            input: 'text-xs'
                          }}
                        />
                        <Button
                          size="sm"
                          className="h-8"
                          onPress={() => {
                            if (visibleUserInput.trim()) {
                              setVisibleUsers(prev => [...new Set([...prev, visibleUserInput.trim()])]);
                              setVisibleUserInput('');
                            }
                          }}
                        >
                          添加
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {visibleUsers.map(u => (
                          <Chip
                            key={u}
                            onClose={() => setVisibleUsers(prev => prev.filter(user => user !== u))}
                            size="sm"
                            variant="flat"
                            classNames={{ base: 'bg-[var(--primary-color)]/10 text-[var(--primary-color)] border-none' }}
                          >
                            {u}
                          </Chip>
                        ))}
                        {visibleUsers.length === 0 && (
                          <span className="text-[10px] text-[var(--text-color-secondary)]">暂无指定用户，仅自己可见。</span>
                        )}
                      </div>
                    </div>
                  )}
                  {permissionType === 'password' && (
                    <div className="grid gap-4 max-w-sm">
                      <Input
                        type="password"
                        size="sm"
                        variant="bordered"
                        label="设置访问密码"
                        placeholder="请输入4-6位数字密码"
                        value={accessPassword}
                        onValueChange={setAccessPassword}
                        labelPlacement="outside"
                        classNames={{
                          label: 'text-xs font-medium text-[var(--text-color-secondary)] mb-1',
                          inputWrapper: [
                            'h-9',
                            'bg-transparent',
                            'border border-[var(--border-color)]',
                            'dark:border-white/20',
                            'hover:border-[var(--primary-color)]/80!',
                            'group-data-[focus=true]:border-[var(--primary-color)]!',
                            'transition-colors',
                            'shadow-none'
                          ].join(' '),
                          input: 'text-xs'
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* 右侧辅助区：封面上传与上传区 */}
        <div className="lg:col-span-4 space-y-6 sticky top-4">
          {/* 文档封面 */}
          <Card className="border border-[var(--border-color)] bg-[var(--bg-elevated)]/95">
            <div className="p-3 border-b border-[var(--border-color)]">
              <div className="text-sm font-medium">文档封面</div>
            </div>
            <div className="p-4 space-y-4">
              <div className="aspect-[16/9] w-full rounded-lg border border-[var(--border-color)] overflow-hidden bg-[var(--bg-elevated)]/50 group relative">
                <img src={coverImage} alt="Document Cover" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button size="sm" variant="flat" className="bg-white/20 backdrop-blur-md text-white border border-white/30" onPress={handleSelectCover} startContent={<FiImage />}>
                    更换封面
                  </Button>
                  <Button size="sm" variant="flat" isIconOnly className="bg-danger/20 backdrop-blur-md text-danger border border-danger/30 hover:bg-danger/40" onPress={() => setCoverImage(DEFAULT_COVER)} isDisabled={coverImage === DEFAULT_COVER}>
                    <FiTrash2 />
                  </Button>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <input type="file" ref={coverInputRef} className="hidden" accept="image/*" onChange={handleCoverChange} />
                <Button fullWidth size="sm" variant="flat" className="bg-[var(--primary-color)]/10 text-[var(--primary-color)] font-medium h-9" onPress={handleSelectCover} startContent={<FiUpload className="text-xs" />}>
                  从本地上传图片
                </Button>
                <p className="text-[10px] text-[var(--text-color-secondary)] text-center">
                  建议尺寸 1280x720，支持 jpg/png 格式
                </p>
              </div>
            </div>
          </Card>

          {/* 上传区域 */}
          <Card className="border border-[var(--border-color)] bg-[var(--bg-elevated)]/95">
            <div className="p-3 border-b border-[var(--border-color)] text-sm font-medium">文件上传</div>
            <div className="p-4">
              <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} accept=".pdf,.doc,.docx,.ppt,.pptx,.md" />
              {!selectedFileName ? (
                <div
                  className={`border-2 border-dashed border-[var(--border-color)] rounded-xl h-48 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-[var(--primary-color)] hover:bg-[var(--bg-elevated)]/50 transition-colors ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}
                  onClick={handleSelectFile}
                >
                  <div className="h-10 w-10 rounded-full bg-[var(--bg-elevated)] flex items-center justify-center text-[var(--text-color-secondary)]">
                    <FiUpload className="text-lg" />
                  </div>
                  <div className="text-center">
                    <div className="text-xs font-medium">点击或拖拽上传</div>
                    <div className="text-[10px] text-[var(--text-color-secondary)] mt-1">
                      支持 PDF/Word/PPT/Markdown<br />最大支持 100MB
                    </div>
                  </div>
                </div>
              ) : (
                <div className="border border-[var(--border-color)] rounded-lg p-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded bg-[var(--primary-color)]/10 flex items-center justify-center text-[var(--primary-color)]">
                      <FiFileText className="text-lg" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium truncate" title={selectedFileName}>{selectedFileName}</div>
                      <div className="text-[10px] text-[var(--text-color-secondary)]">{formatSize(selectedFileSize)}</div>
                    </div>
                    <Button isIconOnly size="sm" variant="light" color="danger" onPress={clearSelectedFile}>
                      <FiX />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* 发布操作 */}
          <Card className="border border-[var(--border-color)] bg-[var(--bg-elevated)]/95">
            <div className="p-4 space-y-3">
              <Button
                fullWidth
                color="primary"
                className="font-medium"
                startContent={<FiUploadCloud className="text-lg" />}
                onPress={onCreateTask}
                isLoading={isUploading || isLoading}
                isDisabled={!isFormValid || isUploading || isLoading}
              >
                开始上传并发布
              </Button>
              <div className="grid grid-cols-2 gap-3">
                <Button fullWidth variant="flat" className="text-xs" onPress={onSaveDraft} isDisabled={isLoading}>
                  保存草稿
                </Button>
                <Button fullWidth variant="light" className="text-xs" isDisabled={isLoading} onPress={handleResetForm}>
                  重置
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* 底部：上传任务与草稿列表 */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* 上传任务列表 */}
        <Card className="border border-[var(--border-color)] bg-[var(--bg-elevated)]/95 h-[400px] flex flex-col">
          <div className="p-3 border-b border-[var(--border-color)] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-full bg-[color-mix(in_srgb,var(--primary-color)_10%,transparent)] flex items-center justify-center text-[var(--primary-color)]">
                <FiRefreshCw className="text-xs" />
              </div>
              <div className="text-sm font-medium">上传任务</div>
            </div>
            <div className="flex items-center gap-2">
              {selectedTaskIds.length > 0 && (
                <Button size="sm" color="danger" variant="flat" className="h-8 text-xs" startContent={<FiTrash2 />} onPress={onBatchRemoveTasks}>
                  批量删除 ({selectedTaskIds.length})
                </Button>
              )}
              <AdminSearchInput placeholder="搜索任务..." value={taskKeyword} onValueChange={setTaskKeyword} size="sm" classNames={{ inputWrapper: 'h-8 w-40' }} />
              <Tooltip content="重置筛选">
                <Button isIconOnly size="sm" variant="light" className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-500/10" onPress={() => { setTaskKeyword(''); setSelectedTaskIds([]); }}>
                  <FiRotateCcw className="text-sm" />
                </Button>
              </Tooltip>
            </div>
          </div>
          <div className="flex-1 overflow-auto p-2">
            <Table
              aria-label="Upload Tasks"
              className="min-w-full text-xs"
              selectionMode="multiple"
              selectedKeys={selectedTaskIds.length ? new Set(selectedTaskIds) : new Set()}
              onSelectionChange={onTaskSelectionChange}
            >
              <TableHeader>
                <TableColumn>任务名称</TableColumn>
                <TableColumn width={100}>状态</TableColumn>
                <TableColumn width={100} align="end">操作</TableColumn>
              </TableHeader>
              <TableBody emptyContent="暂无上传任务" isLoading={isLoading} loadingContent={<Loading height={200} text="获取上传任务中..." />}>
                {(isLoading ? [] : taskPageItems).map(item => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium truncate max-w-[180px]" title={item.title}>{item.title}</span>
                        <span className="text-[10px] text-[var(--text-color-secondary)]">{formatSize(item.size)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Chip size="sm" variant="flat" color={getUploadStatusColor(item.status as UploadStatus)} className="h-6 text-[10px]">
                        {getUploadStatusLabel(item.status as UploadStatus)} {item.status === 'uploading' && `${item.progress}%`}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        {item.status === 'error' && (
                          <Tooltip content="重试">
                            <Button isIconOnly size="sm" variant="light" onPress={() => handleRetryTask(item.id)}>
                              <FiRefreshCw className="text-xs" />
                            </Button>
                          </Tooltip>
                        )}
                        <Tooltip content="删除">
                          <Button isIconOnly size="sm" variant="light" color="danger" onPress={() => handleRemoveTask(item.id)}>
                            <FiTrash2 className="text-xs" />
                          </Button>
                        </Tooltip>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="p-2 border-t border-[var(--border-color)] flex justify-end">
            <Pagination size="sm" total={totalPages} page={page} onChange={handlePageChange} showControls className="gap-1" />
          </div>
        </Card>

        {/* 草稿箱 */}
        <Card className="border border-[var(--border-color)] bg-[var(--bg-elevated)]/95 h-[400px] flex flex-col">
          <div className="p-3 border-b border-[var(--border-color)] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-full bg-[color-mix(in_srgb,var(--warning-color)_10%,transparent)] flex items-center justify-center text-[var(--warning-color)]">
                <FiClock className="text-xs" />
              </div>
              <div className="text-sm font-medium">草稿箱</div>
            </div>
            <Button size="sm" variant="light" className="h-7 text-xs" onPress={() => { }}>清空</Button>
          </div>
          <div className="flex-1 overflow-auto p-2">
            <Table aria-label="Drafts" className="min-w-full text-xs">
              <TableHeader>
                <TableColumn>草稿标题</TableColumn>
                <TableColumn width={120}>时间</TableColumn>
                <TableColumn width={100} align="end">操作</TableColumn>
              </TableHeader>
              <TableBody emptyContent="暂无草稿" isLoading={isLoading} loadingContent={<Loading height={200} text="获取草稿中..." />}>
                {(isLoading ? [] : drafts).map(draft => (
                  <TableRow key={draft.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium truncate max-w-[200px]">{draft.title}</span>
                        <span className="text-[10px] text-[var(--text-color-secondary)]">{draft.category}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-[10px] text-[var(--text-color-secondary)]">{draft.updatedAt.split(' ')[0]}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Tooltip content="恢复">
                          <Button isIconOnly size="sm" variant="light" color="primary" onPress={() => onLoadDraft(draft)}>
                            <FiUpload className="text-xs" />
                          </Button>
                        </Tooltip>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default DocumentUploadPage;
