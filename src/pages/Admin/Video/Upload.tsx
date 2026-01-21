import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Button,
  Card,
  Chip,
  Input,
  Pagination,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Textarea,
  Tab,
  Slider
} from "@heroui/react";
import { AdminTabs } from "@/components/Admin/AdminTabs";
import {
  FiAlertCircle,
  FiCheckCircle,
  FiInfo,
  FiSearch,
  FiTrash2,
  FiUpload,
  FiVideo
} from "react-icons/fi";

type UploadStatus = "waiting" | "uploading" | "success" | "error";

type UploadTask = {
  id: string;
  title: string;
  fileName: string;
  category: string;
  size: number;
  status: UploadStatus;
  progress: number;
  isAiChecked: boolean;
  aiRiskLevel?: "low" | "medium" | "high";
  createdAt: string;
};

type StatusFilter = "all" | UploadStatus;

type ChapterItem = {
  id: string;
  title: string;
  timeInSeconds: number;
};

type SubtitleTrack = {
  id: string;
  language: string;
  fileName: string;
};

type DraftItem = {
  id: string;
  title: string;
  category: string;
  description: string;
  createdAt: string;
  updatedAt: string;
};

type PermissionType = "public" | "private" | "password";

type ConfigTabKey = "advanced" | "permission";

type WatermarkType = "text" | "image";

type WatermarkPosition =
  | "top-left"
  | "top-center"
  | "top-right"
  | "center-left"
  | "center"
  | "center-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";

const initialTasks: UploadTask[] = [
  {
    id: "task_001",
    title: "从 0 搭建个人知识库前端",
    fileName: "kb-front-bootcamp-01.mp4",
    category: "前端基础",
    size: 512 * 1024 * 1024,
    status: "success",
    progress: 100,
    isAiChecked: true,
    aiRiskLevel: "low",
    createdAt: "2026-01-18 10:20:00"
  },
  {
    id: "task_002",
    title: "如何把零散笔记整理成知识库",
    fileName: "kb-note-organize-02.mp4",
    category: "效率方法",
    size: 384 * 1024 * 1024,
    status: "uploading",
    progress: 62,
    isAiChecked: false,
    createdAt: "2026-01-18 10:32:15"
  },
  {
    id: "task_003",
    title: "前端工程化下的内容管理实践",
    fileName: "kb-content-engineering-03.mp4",
    category: "工程实践",
    size: 728 * 1024 * 1024,
    status: "error",
    progress: 37,
    isAiChecked: false,
    createdAt: "2026-01-18 10:05:42"
  }
];

function formatSize(size: number) {
  if (size <= 0) {
    return "-";
  }
  const gb = 1024 * 1024 * 1024;
  const mb = 1024 * 1024;
  if (size >= gb) {
    return `${(size / gb).toFixed(2)} GB`;
  }
  return `${(size / mb).toFixed(2)} MB`;
}

function getStatusLabel(status: UploadStatus) {
  if (status === "waiting") {
    return "待上传";
  }
  if (status === "uploading") {
    return "上传中";
  }
  if (status === "success") {
    return "已完成";
  }
  return "失败";
}

function getRiskLabel(level?: "low" | "medium" | "high") {
  if (!level) {
    return "未分析";
  }
  if (level === "low") {
    return "低风险";
  }
  if (level === "medium") {
    return "中风险";
  }
  return "高风险";
}

function getRiskChipColor(level?: "low" | "medium" | "high") {
  if (!level) {
    return "default";
  }
  if (level === "low") {
    return "success";
  }
  if (level === "medium") {
    return "warning";
  }
  return "danger";
}

function VideoUploadPage() {
  const [tasks, setTasks] = useState<UploadTask[]>(() => initialTasks);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [aiCheckEnabled, setAiCheckEnabled] = useState(true);
  const [selectedFileName, setSelectedFileName] = useState("");
  const [selectedFileSize, setSelectedFileSize] = useState(0);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1);
  const [message, setMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const subtitleFileInputRef = useRef<HTMLInputElement | null>(null);
  const watermarkImageInputRef = useRef<HTMLInputElement | null>(null);

  const [chapters, setChapters] = useState<ChapterItem[]>([]);
  const [chapterTitle, setChapterTitle] = useState("");
  const [chapterTime, setChapterTime] = useState("");

  const [subtitleTracks, setSubtitleTracks] = useState<SubtitleTrack[]>([]);
  const [activeSubtitleId, setActiveSubtitleId] = useState<string | null>(null);
  const [subtitleLanguage, setSubtitleLanguage] = useState("");
  const [subtitleContent, setSubtitleContent] = useState("");

  const [permissionType, setPermissionType] = useState<PermissionType>("public");
  const [visibleUsers, setVisibleUsers] = useState<string[]>([]);
  const [visibleUserInput, setVisibleUserInput] = useState("");
  const [accessPassword, setAccessPassword] = useState("");
  const [accessPasswordConfirm, setAccessPasswordConfirm] = useState("");

  const [drafts, setDrafts] = useState<DraftItem[]>([]);
  const [configTab, setConfigTab] = useState<ConfigTabKey>("advanced");

  const [watermarkType, setWatermarkType] = useState<WatermarkType>("text");
  const [watermarkText, setWatermarkText] = useState("");
  const [watermarkFontSize, setWatermarkFontSize] = useState(18);
  const [watermarkOpacity, setWatermarkOpacity] = useState(60);
  const [watermarkPosition, setWatermarkPosition] =
    useState<WatermarkPosition>("top-right");
  const [watermarkImageName, setWatermarkImageName] = useState("");
  const [watermarkScale, setWatermarkScale] = useState(40);
  const [watermarkAutoFit, setWatermarkAutoFit] = useState(true);

  const handleConfigTabChange = (key: React.Key) => {
    const value = key as ConfigTabKey;
    setConfigTab(value);
  };

  const handlePermissionTypeChange = (key: React.Key) => {
    const value = key as PermissionType;
    setPermissionType(value);
  };

  const pageSize = 6;

  const filteredTasks = useMemo(() => {
    const trimmed = keyword.trim().toLowerCase();
    return tasks.filter(item => {
      if (statusFilter !== "all" && item.status !== statusFilter) {
        return false;
      }
      if (trimmed) {
        const content = `${item.title} ${item.fileName} ${item.category}`.toLowerCase();
        if (!content.includes(trimmed)) {
          return false;
        }
      }
      return true;
    });
  }, [tasks, statusFilter, keyword]);

  const total = filteredTasks.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const pageItems = filteredTasks.slice(startIndex, endIndex);

  const handlePageChange = (next: number) => {
    if (next < 1 || next > totalPages) {
      return;
    }
    setPage(next);
  };

  const handleSelectFile = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange: React.ChangeEventHandler<HTMLInputElement> = event => {
    const file = event.target.files?.[0];
    if (!file) {
      setSelectedFileName("");
      setSelectedFileSize(0);
      return;
    }
    setSelectedFileName(file.name);
    setSelectedFileSize(file.size);
  };

  const handleCreateTask = () => {
    const trimmedTitle = title.trim();
    const trimmedCategory = category.trim();
    if (!trimmedTitle) {
      setMessage("请先填写视频标题，标题为必填项。");
      return;
    }
    if (!trimmedCategory) {
      setMessage("请先选择视频分类，分类为必填项。");
      return;
    }
    if (!selectedFileName) {
      setMessage("请先选择要上传的视频文件。");
      return;
    }
    const now = new Date();
    const id = `task_${now.getTime()}`;
    const nextTask: UploadTask = {
      id,
      title: trimmedTitle,
      fileName: selectedFileName,
      category: trimmedCategory || "未分类",
      size: selectedFileSize,
      status: "success",
      progress: 100,
      isAiChecked: aiCheckEnabled,
      aiRiskLevel: aiCheckEnabled ? "low" : undefined,
      createdAt: now.toISOString().replace("T", " ").slice(0, 19)
    };
    setTasks(previous => [nextTask, ...previous]);
    setTitle("");
    setCategory("");
    setDescription("");
    setSelectedFileName("");
    setSelectedFileSize(0);
    setMessage("已提交审核并创建上传记录，后续可与实际上传与分片接口对接。");
  };

  const handleRemoveTask = (id: string) => {
    setTasks(previous => previous.filter(item => item.id !== id));
  };

  const handleRetryTask = (id: string) => {
    setTasks(previous =>
      previous.map(item => {
        if (item.id !== id) {
          return item;
        }
        return {
          ...item,
          status: "uploading",
          progress: item.progress < 50 ? 50 : item.progress
        };
      })
    );
  };

  const handleResetFilter = () => {
    setStatusFilter("all");
    setKeyword("");
    setPage(1);
  };

  const handleAddChapter = () => {
    const trimmedTitle = chapterTitle.trim();
    const trimmedTime = chapterTime.trim();
    if (!trimmedTitle || !trimmedTime) {
      setMessage("请填写章节标题并设置时间点（秒）。");
      return;
    }
    const seconds = Number(trimmedTime);
    if (!Number.isFinite(seconds) || seconds < 0) {
      setMessage("章节时间点格式不正确，请输入大于等于 0 的秒数。");
      return;
    }
    const now = Date.now();
    const id = `chapter_${now}`;
    const next: ChapterItem = {
      id,
      title: trimmedTitle,
      timeInSeconds: Math.floor(seconds)
    };
    setChapters(previous =>
      [...previous, next].sort((a, b) => a.timeInSeconds - b.timeInSeconds)
    );
    setChapterTitle("");
    setChapterTime("");
    setMessage("已添加章节节点，可通过章节列表快速预览对应时间点。");
  };

  const handleMoveChapter = (id: string, direction: "up" | "down") => {
    setChapters(previous => {
      const index = previous.findIndex(item => item.id === id);
      if (index === -1) {
        return previous;
      }
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= previous.length) {
        return previous;
      }
      const next = [...previous];
      const temp = next[index];
      next[index] = next[targetIndex];
      next[targetIndex] = temp;
      return next;
    });
  };

  const handleRemoveChapter = (id: string) => {
    const target = chapters.find(item => item.id === id);
    const confirmText = target ? `确认删除章节「${target.title}」吗？` : "确认删除该章节吗？";
    if (!window.confirm(confirmText)) {
      return;
    }
    setChapters(previous => previous.filter(item => item.id !== id));
  };

  const handleSelectSubtitleFile = () => {
    if (subtitleFileInputRef.current) {
      subtitleFileInputRef.current.click();
    }
  };

  const handleSubtitleFileChange: React.ChangeEventHandler<HTMLInputElement> = event => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    const id = `subtitle_${Date.now()}`;
    const language = subtitleLanguage.trim() || "未设置语言";
    file
      .text()
      .then(text => {
        setSubtitleTracks(previous => [
          {
            id,
            language,
            fileName: file.name
          },
          ...previous
        ]);
        setActiveSubtitleId(id);
        setSubtitleContent(text);
        setMessage("字幕文件已上传，可在下方区域进行在线编辑。");
      })
      .catch(() => {
        setMessage("读取字幕文件内容失败，请稍后重试。");
      })
      .finally(() => {
        event.target.value = "";
      });
  };

  const handleSwitchSubtitle = (id: string) => {
    setActiveSubtitleId(id);
    setSubtitleContent("");
  };

  const handleAddVisibleUser = () => {
    const trimmed = visibleUserInput.trim();
    if (!trimmed) {
      return;
    }
    setVisibleUsers(previous => {
      if (previous.includes(trimmed)) {
        return previous;
      }
      return [...previous, trimmed];
    });
    setVisibleUserInput("");
  };

  const handleRemoveVisibleUser = (user: string) => {
    setVisibleUsers(previous => previous.filter(item => item !== user));
  };

  const handleSelectWatermarkImage = () => {
    if (watermarkImageInputRef.current) {
      watermarkImageInputRef.current.click();
    }
  };

  const handleWatermarkImageChange: React.ChangeEventHandler<HTMLInputElement> =
    event => {
      const file = event.target.files?.[0];
      if (!file) {
        setWatermarkImageName("");
        return;
      }
      setWatermarkImageName(file.name);
      event.target.value = "";
    };

  const handleSaveDraft = () => {
    const trimmedTitle = title.trim();
    const trimmedCategory = category.trim();
    const trimmedDescription = description.trim();
    if (!trimmedTitle && !trimmedCategory && !trimmedDescription && !selectedFileName) {
      setMessage("当前表单为空，暂不需要保存草稿。");
      return;
    }
    const now = new Date();
    const formatted = now.toISOString().replace("T", " ").slice(0, 19);
    const id = `draft_${now.getTime()}`;
    const next: DraftItem = {
      id,
      title: trimmedTitle || "未命名视频",
      category: trimmedCategory || "未分类",
      description: trimmedDescription,
      createdAt: formatted,
      updatedAt: formatted
    };
    setDrafts(previous =>
      [next, ...previous].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    );
    setMessage("草稿已保存，可在下方草稿列表中恢复编辑。");
  };

  const handleLoadDraft = (draft: DraftItem) => {
    setTitle(draft.title);
    setCategory(draft.category);
    setDescription(draft.description);
    setMessage("已加载草稿内容，可继续编辑后重新保存或提交。");
  };

  const handleDeleteDraft = (id: string) => {
    const target = drafts.find(item => item.id === id);
    const confirmText = target ? `确认删除草稿「${target.title}」吗？` : "确认删除该草稿吗？";
    if (!window.confirm(confirmText)) {
      return;
    }
    setDrafts(previous => previous.filter(item => item.id !== id));
  };

  useEffect(() => {
    const timer = window.setInterval(() => {
      const trimmedTitle = title.trim();
      const trimmedCategory = category.trim();
      const trimmedDescription = description.trim();
      if (!trimmedTitle && !trimmedCategory && !trimmedDescription && !selectedFileName) {
        return;
      }
      const now = new Date();
      const formatted = now.toISOString().replace("T", " ").slice(0, 19);
      setDrafts(previous => {
        const existingIndex = previous.findIndex(item => item.id === "auto_draft");
        if (existingIndex === -1) {
          const next: DraftItem = {
            id: "auto_draft",
            title: trimmedTitle || "未命名视频",
            category: trimmedCategory || "未分类",
            description: trimmedDescription,
            createdAt: formatted,
            updatedAt: formatted
          };
          return [next, ...previous].sort((a, b) =>
            b.updatedAt.localeCompare(a.updatedAt)
          );
        }
        const next = [...previous];
        next[existingIndex] = {
          ...next[existingIndex],
          title: trimmedTitle || "未命名视频",
          category: trimmedCategory || "未分类",
          description: trimmedDescription,
          updatedAt: formatted
        };
        return next.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
      });
    }, 30000);
    return () => {
      window.clearInterval(timer);
    };
  }, [title, category, description, selectedFileName]);

  const latestManualDraft =
    drafts.find(item => item.id !== "auto_draft") ?? drafts[0] ?? null;

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <div className="inline-flex items-center gap-2 rounded-full bg-[color-mix(in_srgb,var(--primary-color)_10%,transparent)] px-3 py-1 text-xs text-[var(--primary-color)]">
          <span>视频管理 · 视频上传</span>
        </div>
        <h1 className="text-lg md:text-xl font-semibold tracking-tight">
          通过分片上传管理视频内容入库
        </h1>
        <p className="text-xs text-[var(--text-color-secondary)] max-w-2xl">
          支持为视频补充标题、分类与描述信息，并记录上传任务状态，后续与后端的秒传与分片合并接口对接。
        </p>
        {latestManualDraft && (
          <div className="mt-2 flex items-center justify-between gap-2 rounded-md border border-[var(--border-color)] bg-[var(--bg-elevated)]/80 px-3 py-2 text-xs">
            <div className="flex flex-col">
              <span className="text-[var(--text-color-secondary)]">
                检测到已保存的草稿：
              </span>
              <span className="font-medium">
                {latestManualDraft.title}（最近编辑时间：{latestManualDraft.updatedAt}）
              </span>
            </div>
            <Button
              size="sm"
              variant="light"
              className="h-7 text-xs"
              onPress={() => handleLoadDraft(latestManualDraft)}
            >
              恢复草稿
            </Button>
          </div>
        )}
      </div>

      <Card className="border border-[var(--border-color)] bg-[var(--bg-elevated)]/95">
        <div className="p-3 space-y-3 text-xs border-b border-[var(--border-color)]">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-[color-mix(in_srgb,var(--primary-color)_18%,transparent)] flex items-center justify-center text-[var(--primary-color)]">
                <FiVideo className="text-base" />
              </div>
              <div className="space-y-0.5">
                <div className="text-sm font-medium">新建上传任务</div>
                <div className="text-xs text-[var(--text-color-secondary)]">
                  实际环境中将与上传初始化、分片上传与合并接口联动。
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--text-color-secondary)]">
              <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-[var(--bg-elevated)]/80">
                <FiInfo className="text-xs" />
                <span>建议单个文件不超过 2GB，分辨率控制在 1080P 内。</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-3 space-y-3 text-xs">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-3">
              <Input
                size="sm"
                variant="bordered"
                labelPlacement="outside"
                label="视频标题"
                placeholder="请输入视频标题，例如：从 0 搭建个人知识库前端"
                value={title}
                onValueChange={setTitle}
                classNames={{
                  label: "text-xs text-[var(--text-color-secondary)] mb-1",
                  inputWrapper: "h-8 text-xs",
                  input: "text-xs"
                }}
              />
              <Input
                size="sm"
                variant="bordered"
                labelPlacement="outside"
                label="视频分类"
                placeholder="例如：前端基础 / 工程实践 / 效率方法"
                value={category}
                onValueChange={setCategory}
                classNames={{
                  label: "text-xs text-[var(--text-color-secondary)] mb-1",
                  inputWrapper: "h-8 text-xs",
                  input: "text-xs"
                }}
              />
              <Textarea
                size="sm"
                variant="bordered"
                labelPlacement="outside"
                label="简介说明"
                placeholder="简要描述视频内容亮点与适用人群，便于后续检索与推荐。"
                value={description}
                onValueChange={setDescription}
                minRows={3}
                classNames={{
                  label: "text-xs text-[var(--text-color-secondary)] mb-1",
                  inputWrapper:
                    "text-xs bg-[var(--bg-elevated)]/80 border-[var(--border-color)]",
                  input: "text-xs"
                }}
              />
            </div>
            <div className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-xs">上传文件</div>
                  <div className="text-xs text-[var(--text-color-secondary)]">
                    支持 mp4、mov 等常见格式
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="video/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <Button
                    size="sm"
                    className="h-8 text-xs"
                    startContent={<FiUpload className="text-xs" />}
                    onPress={handleSelectFile}
                  >
                    选择文件
                  </Button>
                  {selectedFileName ? (
                    <div className="flex flex-col gap-0.5 text-xs text-[var(--text-color-secondary)]">
                      <span className="break-all">
                        已选择：{selectedFileName}
                      </span>
                      <span>大小：{formatSize(selectedFileSize)}</span>
                    </div>
                  ) : (
                    <span className="text-xs text-[var(--text-color-secondary)]">
                      暂未选择文件
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Switch
                    aria-label="开启 AI 预审核"
                    size="sm"
                    isSelected={aiCheckEnabled}
                    onValueChange={setAiCheckEnabled}
                  />
                  <div className="space-y-0.5">
                    <div className="text-xs">开启 AI 预审核</div>
                    <div className="text-xs text-[var(--text-color-secondary)]">
                      预留 is_ai_checked 字段，用于标记需重点复核内容。
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--text-color-secondary)]">
                  <span>提交审核前将校验必填项，确保标题与分类已填写。</span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    size="sm"
                    className="h-8 text-xs"
                    startContent={<FiCheckCircle className="text-xs" />}
                    onPress={handleCreateTask}
                  >
                    提交审核
                  </Button>
                  <Button
                    size="sm"
                    variant="flat"
                    className="h-8 text-xs"
                    onPress={handleSaveDraft}
                  >
                    保存草稿
                  </Button>
                  <Button
                    size="sm"
                    variant="light"
                    className="h-8 text-xs"
                    onPress={() => {
                      setTitle("");
                      setCategory("");
                      setDescription("");
                      setSelectedFileName("");
                      setSelectedFileSize(0);
                      setAiCheckEnabled(true);
                      setMessage("");
                    }}
                  >
                    重置表单
                  </Button>
                </div>
              </div>
              {message && (
                <div className="mt-1 flex items-center gap-2 rounded-md bg-[color-mix(in_srgb,var(--primary-color)_10%,transparent)] px-3 py-2 text-xs text-[var(--primary-color)]">
                  <FiInfo className="text-xs" />
                  <span>{message}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

      <Card className="border border-[var(--border-color)] bg-[var(--bg-elevated)]/95">
        <div className="p-3 space-y-3 text-xs">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
              <div className="text-sm font-medium">高级配置与权限设置</div>
              <div className="text-[11px] text-[var(--text-color-secondary)]">
                在这里配置章节标记、字幕管理与访问权限，便于后续在前台播放器中精准控制观看体验。
              </div>
            </div>
          </div>
          <AdminTabs
            aria-label="视频配置标签页"
            size="sm"
            selectedKey={configTab}
            onSelectionChange={handleConfigTabChange}
            classNames={{
              tabList: "p-0 h-8 gap-0",
              tab: "h-8 px-4 text-[10px]"
            }}
          >
            <Tab key="advanced" title="高级功能" />
            <Tab key="permission" title="权限设置" />
          </AdminTabs>

          <div className={configTab === "advanced" ? "grid gap-3 md:grid-cols-2" : "hidden"}>
              <div className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-xs">水印添加</div>
                    <div className="text-xs text-[var(--text-color-secondary)]">
                      在预览区域叠加文字或图片水印，用于保护视频版权。
                    </div>
                  </div>
                  <div className="space-y-2">
                    <AdminTabs
                      aria-label="水印类型选择"
                      size="sm"
                      selectedKey={watermarkType}
                      onSelectionChange={key => {
                        const value = key as WatermarkType;
                        setWatermarkType(value);
                      }}
                      classNames={{
                        tabList: "p-0 h-8 gap-0",
                        tab: "h-8 px-4 text-xs"
                      }}
                    >
                      <Tab key="text" title="文字水印" />
                      <Tab key="image" title="图片水印" />
                    </AdminTabs>
                    {watermarkType === "text" && (
                      <div className="space-y-2">
                        <Input
                          size="sm"
                          variant="bordered"
                          labelPlacement="outside"
                          label="水印文字内容"
                          placeholder="例如：知识库小破站 · 仅供学习使用"
                          value={watermarkText}
                          onValueChange={setWatermarkText}
                          classNames={{
                            label: "text-xs text-[var(--text-color-secondary)] mb-1",
                            inputWrapper: "h-8 text-xs",
                            input: "text-xs"
                          }}
                        />
                        <div className="grid gap-2 md:grid-cols-2">
                          <Input
                            size="sm"
                            variant="bordered"
                            labelPlacement="outside"
                            label="字号"
                            type="number"
                            value={String(watermarkFontSize)}
                            onValueChange={value => {
                              const next = Number(value);
                              if (Number.isFinite(next) && next > 0 && next <= 72) {
                                setWatermarkFontSize(next);
                              }
                            }}
                            classNames={{
                              label: "text-xs text-[var(--text-color-secondary)] mb-1",
                              inputWrapper: "h-8 text-xs",
                              input: "text-xs"
                            }}
                          />
                          <div className="space-y-1">
                            <div className="text-xs text-[var(--text-color-secondary)]">
                              透明度（{watermarkOpacity}%）
                            </div>
                            <Slider
                              aria-label="水印透明度"
                              size="sm"
                              minValue={0}
                              maxValue={100}
                              value={watermarkOpacity}
                              onChange={value => {
                                if (typeof value === "number") {
                                  setWatermarkOpacity(value);
                                }
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                    {watermarkType === "image" && (
                      <div className="space-y-2">
                        <div className="flex flex-col gap-2 md:flex-row md:items-center">
                          <input
                            ref={watermarkImageInputRef}
                            type="file"
                            accept=".png,.jpg,.jpeg"
                            className="hidden"
                            onChange={handleWatermarkImageChange}
                          />
                          <Button
                            size="sm"
                            className="h-8 text-xs"
                            onPress={handleSelectWatermarkImage}
                          >
                            选择水印图片
                          </Button>
                          <div className="text-xs text-[var(--text-color-secondary)]">
                            支持 PNG/JPG，建议文件大小不超过 2MB。
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-xs text-[var(--text-color-secondary)]">
                            缩放比例（{watermarkScale}%）
                          </div>
                          <Slider
                            aria-label="水印缩放比例"
                            size="sm"
                            minValue={10}
                            maxValue={100}
                            value={watermarkScale}
                            onChange={value => {
                              if (typeof value === "number") {
                                setWatermarkScale(value);
                              }
                            }}
                          />
                        </div>
                        <div className="flex items-center gap-2 text-xs text-[var(--text-color-secondary)]">
                          <Switch
                            aria-label="自适应视频尺寸"
                            size="sm"
                            isSelected={watermarkAutoFit}
                            onValueChange={setWatermarkAutoFit}
                          />
                          <span>自适应视频尺寸</span>
                        </div>
                        {watermarkImageName && (
                          <div className="text-xs text-[var(--text-color-secondary)] break-all">
                            已选择图片：{watermarkImageName}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-[var(--text-color-secondary)]">
                      水印位置
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                      {[
                        "top-left",
                        "top-center",
                        "top-right",
                        "center-left",
                        "center",
                        "center-right",
                        "bottom-left",
                        "bottom-center",
                        "bottom-right"
                      ].map(item => (
                        <Button
                          key={item}
                          size="sm"
                          variant={watermarkPosition === item ? "flat" : "light"}
                          className="h-7 text-xs"
                          onPress={() =>
                            setWatermarkPosition(item as WatermarkPosition)
                          }
                        >
                          {item
                            .split("-")
                            .map(part =>
                              part === "top"
                                ? "上"
                                : part === "bottom"
                                  ? "下"
                                  : part === "left"
                                    ? "左"
                                    : part === "right"
                                      ? "右"
                                      : "中"
                            )
                            .join(" / ")}
                        </Button>
                      ))}
                    </div>
                    <div className="mt-2 border border-dashed border-[var(--border-color)] rounded-md h-32 flex items-center justify-center text-xs text-[var(--text-color-secondary)]">
                      预览区域占位，接入实际播放器后可实时预览水印效果。
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-xs">章节标记</div>
                  <div className="text-xs text-[var(--text-color-secondary)]">
                    为视频关键内容添加时间节点，方便学习者按章节跳转。
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex flex-col gap-2 md:flex-row md:items-center">
                    <Input
                      size="sm"
                      variant="bordered"
                      labelPlacement="outside"
                      label="章节标题"
                      placeholder="例如：第 1 章 · 项目背景与目标"
                      value={chapterTitle}
                      onValueChange={setChapterTitle}
                      classNames={{
                        label: "text-xs text-[var(--text-color-secondary)] mb-1",
                        inputWrapper: "h-8 text-xs",
                        input: "text-xs"
                      }}
                    />
                    <Input
                      size="sm"
                      variant="bordered"
                      labelPlacement="outside"
                      label="时间点（秒）"
                      placeholder="例如：60"
                      value={chapterTime}
                      onValueChange={setChapterTime}
                      className="md:w-40"
                      classNames={{
                        label: "text-xs text-[var(--text-color-secondary)] mb-1",
                        inputWrapper: "h-8 text-xs",
                        input: "text-xs"
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Button
                      size="sm"
                      className="h-8 text-[11px]"
                      onPress={handleAddChapter}
                    >
                      添加章节
                    </Button>
                    <div className="text-[11px] text-[var(--text-color-secondary)]">
                      实际接入播放器后可根据时间点直接跳转预览。
                    </div>
                  </div>
                </div>
                <div className="border border-dashed border-[var(--border-color)] rounded-md max-h-40 overflow-auto">
                  <ul className="divide-y divide-[var(--border-color)]">
                    {chapters.length === 0 && (
                      <li className="px-3 py-2 text-[11px] text-[var(--text-color-secondary)]">
                        暂未添加章节节点，建议为长视频配置 3-8 个章节，便于按节学习。
                      </li>
                    )}
                    {chapters.map((item, index) => (
                      <li
                        key={item.id}
                        className="px-3 py-2 flex items-center justify-between gap-2 text-[11px]"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-[var(--text-color-secondary)]">
                            {String(index + 1).padStart(2, "0")}
                          </span>
                          <div className="flex flex-col">
                            <span>{item.title}</span>
                            <span className="text-[10px] text-[var(--text-color-secondary)]">
                              时间点：{item.timeInSeconds}s
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Button
                            size="sm"
                            variant="light"
                            className="h-7 text-[10px]"
                            isDisabled={index === 0}
                            onPress={() => handleMoveChapter(item.id, "up")}
                          >
                            上移
                          </Button>
                          <Button
                            size="sm"
                            variant="light"
                            className="h-7 text-[10px]"
                            isDisabled={index === chapters.length - 1}
                            onPress={() => handleMoveChapter(item.id, "down")}
                          >
                            下移
                          </Button>
                          <Button
                            size="sm"
                            variant="light"
                            color="danger"
                            className="h-7 text-[10px]"
                            onPress={() => handleRemoveChapter(item.id)}
                          >
                            删除
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-xs">字幕管理</div>
                  <div className="text-[11px] text-[var(--text-color-secondary)]">
                    上传并维护多语言字幕文件，支持在线修改与预览。
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex flex-col gap-2 md:flex-row md:items-center">
                    <Input
                      size="sm"
                      variant="bordered"
                      labelPlacement="outside"
                      label="字幕语言"
                      placeholder="例如：简体中文 / 英文"
                      value={subtitleLanguage}
                      onValueChange={setSubtitleLanguage}
                      classNames={{
                        label: "text-xs text-[var(--text-color-secondary)] mb-1",
                        inputWrapper: "h-8 text-xs",
                        input: "text-xs"
                      }}
                    />
                    <div className="flex items-center gap-2">
                      <input
                        ref={subtitleFileInputRef}
                        type="file"
                        accept=".srt,.vtt"
                        className="hidden"
                        onChange={handleSubtitleFileChange}
                      />
                      <Button
                        size="sm"
                        className="h-8 text-[11px]"
                        onPress={handleSelectSubtitleFile}
                      >
                        上传字幕文件
                      </Button>
                    </div>
                  </div>
                  <div className="text-[11px] text-[var(--text-color-secondary)]">
                    当前示例支持 SRT/VTT 文件，实际项目中可根据解析结果还原逐行时间轴编辑能力。
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-[11px] text-[var(--text-color-secondary)]">
                    字幕列表
                  </div>
                  <div className="border border-[var(--border-color)] rounded-md max-h-32 overflow-auto">
                    <ul className="divide-y divide-[var(--border-color)] text-[11px]">
                      {subtitleTracks.length === 0 && (
                        <li className="px-3 py-2 text-[var(--text-color-secondary)]">
                          暂未上传字幕文件，建议先为主语言配置基础字幕文件。
                        </li>
                      )}
                      {subtitleTracks.map(item => (
                        <li
                          key={item.id}
                          className={
                            "px-3 py-2 flex items-center justify-between gap-2 cursor-pointer " +
                            (item.id === activeSubtitleId
                              ? "bg-[color-mix(in_srgb,var(--primary-color)_10%,transparent)]"
                              : "hover:bg-[var(--bg-elevated)]/60")
                          }
                          onClick={() => handleSwitchSubtitle(item.id)}
                        >
                          <div className="flex flex-col">
                            <span>{item.fileName}</span>
                            <span className="text-[10px] text-[var(--text-color-secondary)]">
                              语言：{item.language}
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-[11px] text-[var(--text-color-secondary)]">
                    字幕内容预览 / 编辑
                  </div>
                  <Textarea
                    size="sm"
                    variant="bordered"
                    placeholder="选择字幕文件后，可在此粘贴或编辑字幕内容，后续可接入行级时间轴编辑能力。"
                    value={subtitleContent}
                    onValueChange={setSubtitleContent}
                    minRows={4}
                    classNames={{
                      inputWrapper:
                        "text-xs bg-[var(--bg-elevated)]/80 border-[var(--border-color)]",
                      input: "text-xs"
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {configTab === "permission" && (
            <div className="space-y-3">
              <div className="space-y-1">
                <div className="text-xs">访问权限类型</div>
                <div className="text-[11px] text-[var(--text-color-secondary)]">
                  可按「公开 / 私有 / 密码访问」控制视频的可见范围。
                </div>
              </div>
              <AdminTabs
                aria-label="权限类型选择"
                size="sm"
                selectedKey={permissionType}
                onSelectionChange={handlePermissionTypeChange}
                classNames={{
                  tabList: "p-0 h-8 gap-0",
                  tab: "h-8 px-4 text-[10px]"
                }}
              >
                <Tab key="public" title="公开" />
                <Tab key="private" title="私有" />
                <Tab key="password" title="密码访问" />
              </AdminTabs>

              {permissionType === "public" && (
                <div className="text-[11px] text-[var(--text-color-secondary)]">
                  当前视频对所有已登录用户开放，后续可在前台根据登录态与角色控制实际可见范围。
                </div>
              )}

              {permissionType === "private" && (
                <div className="space-y-2">
                  <div className="text-[11px] text-[var(--text-color-secondary)]">
                    仅对指定用户可见，可通过用户 ID 或用户名添加可见列表。
                  </div>
                  <div className="flex flex-col gap-2 md:flex-row md:items-center">
                    <Input
                      size="sm"
                      variant="bordered"
                      className="md:flex-1"
                      placeholder="输入用户 ID 或用户名，按回车或点击右侧按钮添加"
                      value={visibleUserInput}
                      onValueChange={setVisibleUserInput}
                      onKeyDown={event => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          handleAddVisibleUser();
                        }
                      }}
                      classNames={{
                        inputWrapper: "h-8 text-xs",
                        input: "text-xs"
                      }}
                    />
                    <Button
                      size="sm"
                      className="h-8 text-[11px]"
                      onPress={handleAddVisibleUser}
                    >
                      添加可见用户
                    </Button>
                  </div>
                  <div className="border border-[var(--border-color)] rounded-md max-h-32 overflow-auto">
                    <ul className="divide-y divide-[var(--border-color)] text-[11px]">
                      {visibleUsers.length === 0 && (
                        <li className="px-3 py-2 text-[var(--text-color-secondary)]">
                          暂未添加可见用户，默认仅上传者自己可见。
                        </li>
                      )}
                      {visibleUsers.map(user => (
                        <li
                          key={user}
                          className="px-3 py-2 flex items-center justify-between gap-2"
                        >
                          <span>{user}</span>
                          <Button
                            size="sm"
                            variant="light"
                            className="h-7 text-[10px]"
                            onPress={() => handleRemoveVisibleUser(user)}
                          >
                            移除
                          </Button>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {permissionType === "password" && (
                <div className="space-y-2">
                  <div className="text-[11px] text-[var(--text-color-secondary)]">
                    访问视频时需输入访问密码，适用于小范围分享或内测场景。
                  </div>
                  <div className="grid gap-2 md:grid-cols-2">
                    <Input
                      size="sm"
                      variant="bordered"
                      labelPlacement="outside"
                      label="访问密码"
                      placeholder="请输入 6-12 位访问密码"
                      type="password"
                      value={accessPassword}
                      onValueChange={setAccessPassword}
                      classNames={{
                        label: "text-xs text-[var(--text-color-secondary)] mb-1",
                        inputWrapper: "h-8 text-xs",
                        input: "text-xs"
                      }}
                    />
                    <Input
                      size="sm"
                      variant="bordered"
                      labelPlacement="outside"
                      label="确认密码"
                      placeholder="请再次输入访问密码"
                      type="password"
                      value={accessPasswordConfirm}
                      onValueChange={setAccessPasswordConfirm}
                      classNames={{
                        label: "text-xs text-[var(--text-color-secondary)] mb-1",
                        inputWrapper: "h-8 text-xs",
                        input: "text-xs"
                      }}
                    />
                  </div>
                  {accessPassword &&
                    accessPasswordConfirm &&
                    accessPassword !== accessPasswordConfirm && (
                      <div className="text-[11px] text-red-500">
                        两次输入的密码不一致，请检查后重新输入。
                      </div>
                    )}
                </div>
              )}
            </div>
          )}
        </div>
      </Card>

      <Card className="border border-[var(--border-color)] bg-[var(--bg-elevated)]/95">
        <div className="p-3 space-y-3 text-xs border-b border-[var(--border-color)]">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
              <div className="text-sm font-medium">上传任务列表</div>
              <div className="text-[11px] text-[var(--text-color-secondary)]">
                展示最近的视频上传记录，后续可与任务查询接口联动，支持查看进度与失败原因。
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Input
                size="sm"
                variant="bordered"
                className="w-56"
                placeholder="按标题 / 文件名搜索"
                startContent={
                  <FiSearch className="text-[12px] text-[var(--text-color-secondary)]" />
                }
                value={keyword}
                onValueChange={value => {
                  setKeyword(value);
                  setPage(1);
                }}
                classNames={{
                  inputWrapper: "h-8 text-xs",
                  input: "text-xs"
                }}
              />
              <AdminTabs
                aria-label="上传状态筛选"
                size="sm"
                selectedKey={statusFilter}
                onSelectionChange={key => {
                  const value = key as StatusFilter;
                  setStatusFilter(value);
                  setPage(1);
                }}
                classNames={{
                  tabList: "p-0 h-8 gap-0",
                  tab: "h-8 px-3 text-[10px]"
                }}
              >
                <Tab key="all" title="全部状态" />
                <Tab key="waiting" title="待上传" />
                <Tab key="uploading" title="上传中" />
                <Tab key="success" title="已完成" />
                <Tab key="error" title="失败" />
              </AdminTabs>
              <Button
                size="sm"
                variant="light"
                className="h-8 text-[11px]"
                onPress={handleResetFilter}
              >
                重置筛选
              </Button>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-[11px] text-[var(--text-color-secondary)]">
            <span>当前列表为前端示例数据，后续接入 /api/admin/content/video/upload 相关接口。</span>
            {statusFilter !== "all" && (
              <Chip size="sm" variant="flat" className="text-[10px]">
                状态筛选：{getStatusLabel(statusFilter as UploadStatus)}
              </Chip>
            )}
          </div>
        </div>

        <div className="p-3">
          <div className="overflow-auto border border-[var(--border-color)] rounded-lg">
            <Table
              aria-label="视频上传任务列表"
              className="min-w-full text-xs"
            >
              <TableHeader className="bg-[var(--bg-elevated)]/80">
                <TableColumn className="px-3 py-2 text-left font-medium">
                  标题
                </TableColumn>
                <TableColumn className="px-3 py-2 text-left font-medium">
                  文件名
                </TableColumn>
                <TableColumn className="px-3 py-2 text-left font-medium">
                  分类
                </TableColumn>
                <TableColumn className="px-3 py-2 text-left font-medium">
                  状态
                </TableColumn>
                <TableColumn className="px-3 py-2 text-left font-medium">
                  进度
                </TableColumn>
                <TableColumn className="px-3 py-2 text-left font-medium">
                  AI 预审核
                </TableColumn>
                <TableColumn className="px-3 py-2 text-left font-medium">
                  文件大小
                </TableColumn>
                <TableColumn className="px-3 py-2 text-left font-medium">
                  创建时间
                </TableColumn>
                <TableColumn className="px-3 py-2 text-left font-medium">
                  操作
                </TableColumn>
              </TableHeader>
              <TableBody
                items={pageItems}
                emptyContent="暂未找到上传任务记录，可在上方创建新的上传记录。"
              >
                {item => (
                  <TableRow key={item.id}>
                    <TableCell className="px-3 py-2 align-top">
                      <div className="flex flex-col gap-1">
                        <div className="font-medium">{item.title}</div>
                        <div className="text-[11px] text-[var(--text-color-secondary)]">
                          任务编号：{item.id}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-3 py-2 align-top">
                      <div className="flex flex-col gap-0.5">
                        <div className="break-all">{item.fileName}</div>
                      </div>
                    </TableCell>
                    <TableCell className="px-3 py-2 align-top">
                      <Chip size="sm" variant="flat" className="text-[10px]">
                        {item.category}
                      </Chip>
                    </TableCell>
                    <TableCell className="px-3 py-2 align-top">
                      <div className="inline-flex items-center gap-1">
                        {item.status === "success" && (
                          <FiCheckCircle className="text-[13px] text-emerald-500" />
                        )}
                        {item.status === "error" && (
                          <FiAlertCircle className="text-[13px] text-red-500" />
                        )}
                        <span>{getStatusLabel(item.status)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="px-3 py-2 align-top">
                      <div className="flex flex-col gap-1">
                        <div className="h-1.5 w-24 rounded-full bg-[var(--bg-elevated)] overflow-hidden">
                          <div
                            className={
                              "h-full rounded-full bg-[var(--primary-color)] transition-all duration-300"
                            }
                            style={{ width: `${item.progress}%` }}
                          />
                        </div>
                        <div className="text-[11px] text-[var(--text-color-secondary)]">
                          {item.progress}%
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-3 py-2 align-top">
                      <div className="flex flex-col gap-1">
                        <Chip
                          size="sm"
                          variant={item.isAiChecked ? "flat" : "bordered"}
                          color={item.isAiChecked ? getRiskChipColor(item.aiRiskLevel) : "default"}
                          className="text-[10px]"
                        >
                          {item.isAiChecked ? getRiskLabel(item.aiRiskLevel) : "未开启"}
                        </Chip>
                        {item.isAiChecked && (
                          <span className="text-[11px] text-[var(--text-color-secondary)]">
                            后端可根据实际风险等级返回对应标签。
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="px-3 py-2 align-top">
                      {formatSize(item.size)}
                    </TableCell>
                    <TableCell className="px-3 py-2 align-top">
                      {item.createdAt}
                    </TableCell>
                    <TableCell className="px-3 py-2 align-top">
                      <div className="flex flex-col gap-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <Button
                            size="sm"
                            variant="light"
                            className="h-7 text-[10px]"
                            isDisabled={item.status === "uploading"}
                            onPress={() => handleRetryTask(item.id)}
                          >
                            重新上传
                          </Button>
                          <Button
                            size="sm"
                            variant="light"
                            color="danger"
                            className="h-7 text-[10px]"
                            startContent={<FiTrash2 className="text-[11px]" />}
                            onPress={() => handleRemoveTask(item.id)}
                          >
                            删除
                          </Button>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="mt-3 flex flex-col gap-2 text-[11px] md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2">
              <span>
                共 {total} 条记录，当前第 {currentPage} / {totalPages} 页
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Pagination
                size="sm"
                total={totalPages}
                page={currentPage}
                onChange={handlePageChange}
                showControls
              />
            </div>
          </div>
        </div>
      </Card>

      <Card className="border border-[var(--border-color)] bg-[var(--bg-elevated)]/95">
        <div className="p-3 space-y-3 text-xs">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
              <div className="text-sm font-medium">草稿列表</div>
              <div className="text-[11px] text-[var(--text-color-secondary)]">
                系统会每 30 秒自动保存一次当前配置，也支持手动保存，便于中断后继续编辑。
              </div>
            </div>
          </div>
          <div className="border border-[var(--border-color)] rounded-lg overflow-hidden">
            <Table
              aria-label="视频上传草稿列表"
              className="min-w-full text-xs"
            >
              <TableHeader className="bg-[var(--bg-elevated)]/80">
                <TableColumn className="px-3 py-2 text-left font-medium">
                  标题
                </TableColumn>
                <TableColumn className="px-3 py-2 text-left font-medium">
                  分类
                </TableColumn>
                <TableColumn className="px-3 py-2 text-left font-medium">
                  创建时间
                </TableColumn>
                <TableColumn className="px-3 py-2 text-left font-medium">
                  最近编辑时间
                </TableColumn>
                <TableColumn className="px-3 py-2 text-left font-medium">
                  状态
                </TableColumn>
                <TableColumn className="px-3 py-2 text-left font-medium">
                  操作
                </TableColumn>
              </TableHeader>
              <TableBody
                items={drafts}
                emptyContent="暂未产生草稿记录，当你填写表单内容后系统会定期自动保存。"
              >
                {item => (
                  <TableRow key={item.id}>
                    <TableCell className="px-3 py-2 align-top">
                      <div className="flex flex-col gap-1">
                        <div className="font-medium">{item.title}</div>
                        <div className="text-[11px] text-[var(--text-color-secondary)]">
                          草稿 ID：{item.id}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-3 py-2 align-top">
                      <Chip size="sm" variant="flat" className="text-[10px]">
                        {item.category}
                      </Chip>
                    </TableCell>
                    <TableCell className="px-3 py-2 align-top">
                      {item.createdAt}
                    </TableCell>
                    <TableCell className="px-3 py-2 align-top">
                      {item.updatedAt}
                    </TableCell>
                    <TableCell className="px-3 py-2 align-top">
                      <Chip size="sm" variant="flat" className="text-[10px]">
                        未完成
                      </Chip>
                    </TableCell>
                    <TableCell className="px-3 py-2 align-top">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <Button
                          size="sm"
                          variant="light"
                          className="h-7 text-[10px]"
                          onPress={() => handleLoadDraft(item)}
                        >
                          恢复编辑
                        </Button>
                        <Button
                          size="sm"
                          variant="light"
                          color="danger"
                          className="h-7 text-[10px]"
                          onPress={() => handleDeleteDraft(item.id)}
                        >
                          删除
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </Card>

      <Card className="border border-[var(--border-color)] bg-[var(--bg-elevated)]/95">
        <div className="p-3 flex flex-col gap-2 text-[11px] md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <FiAlertCircle className="text-[14px] text-[var(--text-color-secondary)]" />
            <span className="text-[var(--text-color-secondary)]">
              生产环境中建议将上传初始化、分片上传与断点续传能力统一封装为 Hook，避免页面内重复实现上传逻辑。
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              variant="light"
              className="h-8 text-[11px]"
              startContent={<FiUpload className="text-[12px]" />}
            >
              查看上传配置文档占位
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default VideoUploadPage;
