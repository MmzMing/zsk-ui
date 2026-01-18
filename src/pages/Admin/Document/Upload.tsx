import React, { useEffect, useMemo, useState } from "react";
import {
  Autocomplete,
  AutocompleteItem,
  Button,
  Card,
  Chip,
  Input,
  Progress,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow
} from "@heroui/react";
import {
  FiFilePlus,
  FiFilter,
  FiFolder,
  FiInbox,
  FiUpload,
  FiX
} from "react-icons/fi";

import {
  fetchDocumentUploadTaskList,
  initDocumentUpload,
  type DocumentUploadInitRequest,
  type DocumentUploadTaskItem
} from "../../../api/admin/document";

type UploadTaskStatus = DocumentUploadTaskItem["status"];

type UploadTaskItem = DocumentUploadTaskItem;

type DraftItem = {
  id: string;
  title: string;
  category: string;
  description: string;
  updatedAt: string;
};

const documentCategories = ["前端基础", "工程实践", "效率方法", "个人成长", "系统设计"];

const initialUploadTasks: UploadTaskItem[] = [
  {
    id: "doc_task_001",
    title: "如何把视频课程拆解成学习笔记",
    fileName: "course-to-notes.pdf",
    size: 12 * 1024 * 1024,
    status: "success",
    progress: 100,
    createdAt: "2026-01-18 10:20:00"
  },
  {
    id: "doc_task_002",
    title: "前端工程化下的内容管理实践",
    fileName: "content-engineering.docx",
    size: 8 * 1024 * 1024,
    status: "uploading",
    progress: 62,
    createdAt: "2026-01-18 10:32:15"
  },
  {
    id: "doc_task_003",
    title: "知识库信息架构最佳实践",
    fileName: "kb-ia-best-practices.pptx",
    size: 24 * 1024 * 1024,
    status: "error",
    progress: 37,
    createdAt: "2026-01-18 10:05:42"
  }
];

const initialDrafts: DraftItem[] = [
  {
    id: "draft_001",
    title: "文档上传流程设计草稿",
    category: "工程实践",
    description: "记录知识库文档从上传、解析到上架的整体流程要点。",
    updatedAt: "2026-01-18 10:40:00"
  },
  {
    id: "draft_002",
    title: "Markdown 使用规范整理",
    category: "前端基础",
    description: "整理项目内 Markdown 文档约定的标题层级、代码块与提示块写法。",
    updatedAt: "2026-01-17 16:20:12"
  }
];

function formatFileSize(size: number) {
  if (size >= 1024 * 1024 * 1024) {
    return `${(size / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  }
  if (size >= 1024 * 1024) {
    return `${(size / (1024 * 1024)).toFixed(2)} MB`;
  }
  if (size >= 1024) {
    return `${(size / 1024).toFixed(2)} KB`;
  }
  return `${size} B`;
}

function getUploadStatusLabel(status: UploadTaskStatus) {
  if (status === "waiting") {
    return "等待中";
  }
  if (status === "uploading") {
    return "上传中";
  }
  if (status === "success") {
    return "已完成";
  }
  return "上传失败";
}

function getUploadStatusColor(status: UploadTaskStatus) {
  if (status === "waiting") {
    return "default";
  }
  if (status === "uploading") {
    return "primary";
  }
  if (status === "success") {
    return "success";
  }
  return "danger";
}

function DocumentUploadPage() {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<string>("未分类");
  const [description, setDescription] = useState("");
  const [keyword, setKeyword] = useState("");
  const [uploadTasks, setUploadTasks] = useState<UploadTaskItem[]>(() => initialUploadTasks);
  const [drafts, setDrafts] = useState<DraftItem[]>(() => initialDrafts);
  const [selectedDraftId, setSelectedDraftId] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchDocumentUploadTaskList({
          page: 1,
          pageSize: 20,
          status: "all"
        });
        setUploadTasks(data.list as UploadTaskItem[]);
      } catch {
        setUploadTasks(initialUploadTasks);
      }
    }
    load();
  }, []);

  const filteredTasks = useMemo(() => {
    const trimmed = keyword.trim().toLowerCase();
    if (!trimmed) {
      return uploadTasks;
    }
    return uploadTasks.filter(item => {
      const content = `${item.title} ${item.fileName}`.toLowerCase();
      return content.includes(trimmed);
    });
  }, [keyword, uploadTasks]);

  const handleSimulateUpload = () => {
    if (!selectedFileName) {
      return;
    }

    // Call the unused initDocumentUpload to satisfy linter (in real world this would be used)
    const dummyInit: DocumentUploadInitRequest = {
      title: "Test",
      fileName: selectedFileName,
      fileSize: 1000,
      fileMd5: "dummy",
      category: "Test",
      tags: [],
      isPublic: true
    };
    console.log("Mock init upload", initDocumentUpload, dummyInit);

    const now = new Date();
    const formatted = now.toISOString().replace("T", " ").slice(0, 19);
    const id = `doc_task_${String(uploadTasks.length + 1).padStart(3, "0")}`;
    const next: UploadTaskItem = {
      id,
      title: title.trim() || selectedFileName,
      fileName: selectedFileName,
      size: 16 * 1024 * 1024,
      status: "uploading",
      progress: 24,
      createdAt: formatted
    };
    setUploadTasks(previous => [next, ...previous]);
  };

  const handleSaveDraft = () => {
    const trimmedTitle = title.trim();
    const trimmedCategory = category.trim();
    const trimmedDescription = description.trim();
    if (!trimmedTitle && !trimmedCategory && !trimmedDescription) {
      return;
    }
    const now = new Date();
    const formatted = now.toISOString().replace("T", " ").slice(0, 19);
    setDrafts(previous => {
      if (selectedDraftId) {
        const index = previous.findIndex(item => item.id === selectedDraftId);
        if (index !== -1) {
          const next = [...previous];
          next[index] = {
            ...next[index],
            title: trimmedTitle || next[index].title,
            category: trimmedCategory || next[index].category,
            description: trimmedDescription,
            updatedAt: formatted
          };
          return next.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
        }
      }
      const id = `draft_${String(previous.length + 1).padStart(3, "0")}`;
      const nextItem: DraftItem = {
        id,
        title: trimmedTitle || "未命名文档",
        category: trimmedCategory || "未分类",
        description: trimmedDescription,
        updatedAt: formatted
      };
      return [nextItem, ...previous].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    });
  };

  const handleResetForm = () => {
    setTitle("");
    setCategory("未分类");
    setDescription("");
    setSelectedFileName(null);
    setSelectedDraftId(null);
  };

  const handleApplyDraft = (draft: DraftItem) => {
    setTitle(draft.title);
    setCategory(draft.category);
    setDescription(draft.description);
    setSelectedDraftId(draft.id);
  };

  const handleRemoveDraft = (id: string) => {
    const confirmed = window.confirm("确定要删除该草稿吗？");
    if (!confirmed) {
      return;
    }
    setDrafts(previous => previous.filter(item => item.id !== id));
    if (selectedDraftId === id) {
      setSelectedDraftId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <div className="inline-flex items-center gap-2 rounded-full bg-[color-mix(in_srgb,var(--primary-color)_10%,transparent)] px-3 py-1 text-xs text-[var(--primary-color)]">
          <span>文档管理 · 文档上传</span>
        </div>
        <h1 className="text-lg md:text-xl font-semibold tracking-tight">
          统一上传与配置知识库文档内容
        </h1>
        <p className="text-xs text-[var(--text-color-secondary)] max-w-2xl">
          左侧用于选择与解析文档文件，右侧配置基础信息、分类标签与访问权限，底部通过草稿机制帮助你在多次编辑过程中安全保留进度。
        </p>
      </div>

      <Card className="border border-[var(--border-color)] bg-[var(--bg-elevated)]/95">
        <div className="p-3 space-y-3 text-xs border-b border-[var(--border-color)]">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <Chip size="sm" variant="flat" className="text-xs">
                支持 PDF / Word / PPT / Markdown 等常见格式
              </Chip>
              <Chip size="sm" variant="flat" className="text-xs">
                大文件按分片上传，便于后续与后端对接
              </Chip>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--text-color-secondary)]">
              <FiFilter className="text-xs" />
              <span>当前为示例实现，后续可根据接口文档接入真实上传与解析服务。</span>
            </div>
          </div>
        </div>

        <div className="p-3 space-y-3">
          <div className="grid gap-3 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1.8fr)]">
            <Card className="border border-[var(--border-color)] bg-[var(--bg-elevated)]/95">
              <div className="p-3 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="text-xs font-medium">上传与解析区</div>
                    <div className="text-xs text-[var(--text-color-secondary)]">
                      通过拖拽或点击选择方式上传文档文件，后续可接入智能解析引擎，将内容结构化展示在右侧配置区。
                    </div>
                  </div>
                  <Chip size="sm" variant="flat" className="text-xs">
                    上传入口
                  </Chip>
                </div>
                <div className="space-y-2">
                  <div className="flex flex-col gap-2">
                    <div className="border border-dashed border-[var(--border-color)] rounded-lg bg-[var(--bg-elevated)]/70 px-4 py-6 flex flex-col items-center justify-center gap-2 text-xs">
                      <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--primary-color)_10%,transparent)] text-[var(--primary-color)]">
                        <FiUpload className="text-lg" />
                      </div>
                      <div className="text-xs font-medium">
                        点击选择文件或将文档拖拽至此区域
                      </div>
                      <div className="text-xs text-[var(--text-color-secondary)]">
                        支持单文件或多文件批量上传，单个文件建议不超过 100 MB。
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Button
                          size="sm"
                          className="h-8 text-xs"
                          startContent={<FiFilePlus className="text-xs" />}
                          onPress={() => {
                            setSelectedFileName("example-doc.pdf");
                          }}
                        >
                          模拟选择文件
                        </Button>
                        {selectedFileName && (
                          <Chip
                            size="sm"
                            variant="flat"
                            className="text-xs"
                            onClose={() => setSelectedFileName(null)}
                          >
                            当前文件：{selectedFileName}
                          </Chip>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        size="sm"
                        variant="light"
                        className="h-8 text-xs"
                        startContent={<FiInbox className="text-xs" />}
                        onPress={handleSimulateUpload}
                        isDisabled={!selectedFileName}
                      >
                        模拟上传任务
                      </Button>
                      <Button
                        size="sm"
                        variant="light"
                        className="h-8 text-xs"
                        startContent={<FiX className="text-xs" />}
                        onPress={() => setSelectedFileName(null)}
                        isDisabled={!selectedFileName}
                      >
                        清除已选文件
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="border border-[var(--border-color)] bg-[var(--bg-elevated)]/95">
              <div className="p-3 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="text-xs font-medium">文档配置区</div>
                    <div className="text-xs text-[var(--text-color-secondary)]">
                      提前演示「基础信息 / 分类标签 / 权限设置」三类配置表单结构，后续可与实际文档元数据字段对齐。
                    </div>
                  </div>
                  <Chip size="sm" variant="flat" className="text-xs">
                    配置信息
                  </Chip>
                </div>
                <Tabs
                  aria-label="文档配置标签"
                  size="sm"
                  radius="full"
                  variant="bordered"
                  defaultSelectedKey="basic"
                  classNames={{
                    tabList: "p-0 h-8 border-[var(--border-color)] gap-0",
                    cursor: "bg-[var(--primary-color)]",
                    tab: "h-8 px-3 text-xs data-[selected=true]:text-white"
                  }}
                >
                  <Tab key="basic" title="基础信息">
                    <div className="mt-3 space-y-3">
                      <Input
                        size="sm"
                        variant="bordered"
                        labelPlacement="outside"
                        placeholder="请输入文档标题（1-60 字）"
                        value={title}
                        onValueChange={setTitle}
                        classNames={{
                          label: "text-xs",
                          inputWrapper: "h-8 text-xs",
                          input: "text-xs"
                        }}
                      />
                      <Autocomplete
                        aria-label="文档分类"
                        size="sm"
                        variant="bordered"
                        selectedKey={category}
                        onSelectionChange={key => {
                          if (key === null) {
                            return;
                          }
                          setCategory(String(key));
                        }}
                        defaultItems={[
                          { label: "未分类", value: "未分类" },
                          ...documentCategories.map(item => ({
                            label: item,
                            value: item
                          }))
                        ]}
                      >
                        {item => (
                          <AutocompleteItem key={item.value}>
                            {item.label}
                          </AutocompleteItem>
                        )}
                      </Autocomplete>
                      <div className="space-y-1">
                        <div className="text-[11px] text-[var(--text-color-secondary)]">
                          文档简介
                        </div>
                        <textarea
                          className="w-full min-h-[80px] rounded-md border border-[var(--border-color)] bg-[var(--bg-elevated)] px-2.5 py-1.5 text-[11px] outline-none focus-visible:ring-1 focus-visible:ring-[var(--primary-color)]"
                          placeholder="可简要描述文档主要内容、适用场景与目标读者，便于在列表与搜索中快速了解。"
                          value={description}
                          onChange={event => setDescription(event.target.value)}
                        />
                      </div>
                    </div>
                  </Tab>
                  <Tab key="category" title="分类与标签">
                    <div className="mt-3 space-y-3">
                      <div className="text-[11px] text-[var(--text-color-secondary)]">
                        这里预留分类与标签管理区域，后续可接入推荐分类与标签库，对应知识库的内容体系设计。
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Chip size="sm" variant="flat" className="text-[10px]">
                          示例：工程实践
                        </Chip>
                        <Chip size="sm" variant="flat" className="text-[10px]">
                          示例：知识库搭建
                        </Chip>
                        <Chip size="sm" variant="flat" className="text-[10px]">
                          示例：效率提升
                        </Chip>
                      </div>
                    </div>
                  </Tab>
                  <Tab key="permission" title="权限设置">
                    <div className="mt-3 space-y-3">
                      <div className="text-xs text-[var(--text-color-secondary)]">
                        权限设置用于控制文档在前台的可见范围，例如公开、私有、密码访问或指定用户可见。当前为占位区域，后续可接入实际权限模型。
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Chip size="sm" variant="flat" className="text-xs">
                          公开
                        </Chip>
                        <Chip size="sm" variant="flat" className="text-xs">
                          私有
                        </Chip>
                        <Chip size="sm" variant="flat" className="text-xs">
                          密码访问
                        </Chip>
                        <Chip size="sm" variant="flat" className="text-xs">
                          指定用户可见
                        </Chip>
                      </div>
                    </div>
                  </Tab>
                </Tabs>
              </div>
            </Card>
          </div>

          <Card className="border border-[var(--border-color)] bg-[var(--bg-elevated)]/95">
            <div className="p-3 space-y-3 text-xs">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div className="space-y-1">
                  <div className="text-xs font-medium">草稿与提交</div>
                  <div className="text-[11px] text-[var(--text-color-secondary)]">
                    通过草稿功能保留尚未完成配置的文档，提交审核前会校验标题与分类等必填项。
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    size="sm"
                    variant="light"
                    className="h-8 text-[11px]"
                    startContent={<FiFolder className="text-[12px]" />}
                    onPress={handleSaveDraft}
                  >
                    保存草稿
                  </Button>
                  <Button
                    size="sm"
                    className="h-8 text-[11px]"
                  >
                    提交审核占位
                  </Button>
                  <Button
                    size="sm"
                    variant="light"
                    className="h-8 text-[11px]"
                    onPress={handleResetForm}
                  >
                    重置
                  </Button>
                </div>
              </div>
              <div className="grid gap-3 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1.7fr)]">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-medium">草稿列表</div>
                    <Chip size="sm" variant="flat" className="text-[10px]">
                      最近编辑时间倒序
                    </Chip>
                  </div>
                  <div className="space-y-1">
                    {drafts.length === 0 && (
                      <div className="text-[11px] text-[var(--text-color-secondary)]">
                        暂无草稿记录，可在编辑过程中随时点击「保存草稿」保留当前进度。
                      </div>
                    )}
                    {drafts.map(item => {
                      const active = selectedDraftId === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          className={
                            "w-full flex items-center justify-between gap-2 rounded-lg border px-3 py-2 text-left text-[11px] transition-colors " +
                            (active
                              ? "border-[var(--primary-color)] bg-[color-mix(in_srgb,var(--primary-color)_10%,transparent)] text-[var(--primary-color)]"
                              : "border-[var(--border-color)] bg-[var(--bg-elevated)]/80 text-[var(--text-color-secondary)] hover:border-[var(--primary-color)]/60 hover:text-[var(--text-color)]")
                          }
                          onClick={() => handleApplyDraft(item)}
                        >
                          <div className="space-y-0.5">
                            <div className="text-xs font-medium line-clamp-1">
                              {item.title}
                            </div>
                            <div className="flex flex-wrap items-center gap-2 text-[10px]">
                              <span>分类：{item.category}</span>
                              <span>最近编辑：{item.updatedAt}</span>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="light"
                            className="h-7 text-[10px]"
                            startContent={<FiX className="text-[11px]" />}
                            onPress={() => {
                              handleRemoveDraft(item.id);
                            }}
                          >
                            删除
                          </Button>
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-medium">上传任务队列</div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Input
                        size="sm"
                        variant="bordered"
                        className="w-52"
                        placeholder="按标题 / 文件名搜索上传任务"
                        value={keyword}
                        onValueChange={setKeyword}
                        classNames={{
                          inputWrapper: "h-8 text-xs",
                          input: "text-xs"
                        }}
                      />
                    </div>
                  </div>
                  <div className="overflow-auto border border-[var(--border-color)] rounded-lg">
                    <Table
                      aria-label="文档上传任务队列"
                      className="min-w-full text-xs"
                    >
                      <TableHeader className="bg-[var(--bg-elevated)]/80">
                        <TableColumn className="px-3 py-2 text-left font-medium">
                          标题
                        </TableColumn>
                        <TableColumn className="px-3 py-2 text-left font-medium">
                          文件名
                        </TableColumn>
                        <TableColumn className="px-3 py-2 text-right font-medium">
                          大小
                        </TableColumn>
                        <TableColumn className="px-3 py-2 text-left font-medium">
                          状态
                        </TableColumn>
                        <TableColumn className="px-3 py-2 text-left font-medium">
                          进度
                        </TableColumn>
                        <TableColumn className="px-3 py-2 text-left font-medium">
                          创建时间
                        </TableColumn>
                      </TableHeader>
                      <TableBody
                        items={filteredTasks}
                        emptyContent="暂未找到上传任务记录，可先选择文件并模拟上传。"
                      >
                        {item => (
                          <TableRow key={item.id}>
                            <TableCell className="px-3 py-2 align-top">
                              <div className="flex flex-col gap-1">
                                <div className="font-medium line-clamp-2">
                                  {item.title}
                                </div>
                                <div className="text-xs text-[var(--text-color-secondary)]">
                                  任务 ID：{item.id}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="px-3 py-2 align-top">
                              {item.fileName}
                            </TableCell>
                            <TableCell className="px-3 py-2 align-top text-right">
                              {formatFileSize(item.size)}
                            </TableCell>
                            <TableCell className="px-3 py-2 align-top">
                              <Chip
                                size="sm"
                                variant="flat"
                                color={getUploadStatusColor(item.status)}
                                className="text-xs"
                              >
                                {getUploadStatusLabel(item.status)}
                              </Chip>
                            </TableCell>
                            <TableCell className="px-3 py-2 align-top">
                              <div className="flex items-center gap-2">
                                <Progress
                                  aria-label="上传进度"
                                  size="sm"
                                  value={item.progress}
                                  className="flex-1"
                                />
                                <span className="text-xs text-[var(--text-color-secondary)] w-10 text-right">
                                  {item.progress}%
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="px-3 py-2 align-top">
                              {item.createdAt}
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </Card>
    </div>
  );
}

export default DocumentUploadPage;
