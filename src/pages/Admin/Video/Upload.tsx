// ===== 1. 依赖导入区域 =====
import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Button,
  Card,
  Input,
  Textarea,
  Progress,
  Chip,
  SelectItem,
  Divider,
  Image as HeroImage
} from "@heroui/react";
import {
  FiUploadCloud,
  FiFile,
  FiCheckCircle,
  FiTrash2,
  FiPlus,
  FiClock,
  FiAlertCircle,
  FiSave,
  FiImage
} from "react-icons/fi";
import { AdminSelect } from "@/components/Admin/AdminSelect";
import { CategoryCascader } from "@/components/Admin/CategoryCascader";
import { CoverEditor } from "@/components/Admin/CoverEditor";
import { captureVideoFrame } from "@/lib/videoUtils";
import {
  uploadVideo,
  fetchVideoCategories,
  fetchTagOptions,
  fetchDraftList,
  saveDraft,
  deleteDraft,
  updateVideo,
  uploadCover,
  type VideoCategory,
  type VideoTag,
  type DraftItem,
  type ChapterItem,
  type PermissionType
} from "@/api/admin/video";

// ===== 2. TODO待处理导入区域 =====

// ===== 3. 状态控制逻辑区域 =====
/**
 * 上传状态枚举
 */
type UploadStatus = "idle" | "uploading" | "merging" | "success" | "error";

export default function VideoUploadPage() {
  // 基础状态
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);

  // 文件相关
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [videoId, setVideoId] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 封面相关
  const [coverUrl, setCoverUrl] = useState<string>("");
  const [coverBlob, setCoverBlob] = useState<Blob | null>(null);
  const [isCoverEditorOpen, setIsCoverEditorOpen] = useState(false);

  // 表单数据
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [subCategoryId, setSubCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [chapters, setChapters] = useState<ChapterItem[]>([]);
  const [permission, setPermission] = useState<PermissionType>("public");
  const [password, setPassword] = useState("");
  
  // 选项数据
  const [categories, setCategories] = useState<VideoCategory[]>([]);
  // const [subCategories, setSubCategories] = useState<{ id: string; name: string }[]>([]); // 不再需要单独的状态，直接从 categories 推导
  const [tags, setTags] = useState<VideoTag[]>([]);
  const [draft, setDraft] = useState<DraftItem | null>(null);

  // 拖拽状态
  const [isDragOver, setIsDragOver] = useState(false);

  // 章节输入状态
  const [newChapterTitle, setNewChapterTitle] = useState("");
  const [newChapterTime, setNewChapterTime] = useState("");

  // 监听文件变化，自动生成默认封面
  useEffect(() => {
    if (file) {
      captureVideoFrame(file, 0)
        .then((url) => {
          setCoverUrl(url);
          // 转换为 blob 用于上传 (此处仅示例，实际转换需 fetch)
          fetch(url).then(res => res.blob()).then(blob => setCoverBlob(blob));
        });
    }
  }, [file]);

  // ===== 4. 通用工具函数区域 =====
  /**
   * 格式化文件大小
   */
  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  /**
   * 显示消息提示
   */
  const showMessage = useCallback((text: string, type: "success" | "error" | "info" = "info") => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  }, []);

  // ===== 5. 注释代码函数区 =====
  // 暂无需要注释的代码

  // ===== 6. 错误处理函数区域 =====
  // 统一错误处理已移至 API 层

  // ===== 7. 数据处理函数区域 =====
  /**
   * 处理分类变更
   */
  const handleCategoryChange = (val: string) => {
    // val 是选中的 ID (可能是一级或二级)
    // 查找该 ID 属于哪个一级分类
    let foundParentId = "";
    let foundSubId = "";

    for (const cat of categories) {
      if (cat.id === val) {
        foundParentId = cat.id;
        break;
      }
      if (cat.children) {
        const sub = cat.children.find(c => c.id === val);
        if (sub) {
          foundParentId = cat.id;
          foundSubId = sub.id;
          break;
        }
      }
    }

    if (foundParentId) {
      setCategoryId(foundParentId);
      setSubCategoryId(foundSubId);
    } else {
      setCategoryId("");
      setSubCategoryId("");
    }
  };

  /**
   * 加载初始数据（分类、标签、草稿）
   */
  const loadInitialData = useCallback(async () => {
      setLoading(true);
      // 使用 allSettled 或者直接 await，让全局错误处理接管
      // 这里为了简单，如果任何一个失败，不影响其他数据的设置（如果需要）
      // 但通常 Promise.all 更适合并行依赖
      try {
        const [catsRes, tagsRes, draftsRes] = await Promise.all([
          fetchVideoCategories(),
          fetchTagOptions(),
          fetchDraftList({ page: 1, pageSize: 1 })
        ]);

        if (catsRes.data) setCategories(catsRes.data);
        if (tagsRes.data) setTags(tagsRes.data);

        if (draftsRes.data && draftsRes.data.list.length > 0) {
          setDraft(draftsRes.data.list[0]);
        }
      } finally {
        setLoading(false);
      }
  }, []);

  const processFile = (selectedFile: File) => {
    if (!selectedFile.type.startsWith("video/")) {
      showMessage("请选择有效的视频文件", "error");
      return;
    }
    setFile(selectedFile);
    if (!title) {
      const nameWithoutExt = selectedFile.name.replace(/\.[^/.]+$/, "");
      setTitle(nameWithoutExt);
    }
    startUpload(selectedFile);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      processFile(selectedFile);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (status !== "idle") return;
    const selectedFile = e.dataTransfer.files && e.dataTransfer.files[0];
    if (selectedFile) {
      processFile(selectedFile);
    }
  };

  /**
   * 执行分片上传流程
   */
  const startUpload = async (fileToUpload: File) => {
    try {
      setStatus("uploading");
      setUploadProgress(0);

      const uploadId = await uploadVideo(fileToUpload, (percent) => {
        setUploadProgress(percent);
      });

      setVideoId(uploadId);
      setStatus("success");
      setUploadProgress(100);
      showMessage("视频上传并处理完成，请填写详细信息。", "success");
    } catch {
      setStatus("error");
    }
  };

  const handleRestoreDraft = () => {
    if (!draft) return;
    setTitle(draft.title);
    
    // 恢复分类逻辑
    if (draft.category) {
       // draft.category 可能是子分类 ID 或父分类 ID
       handleCategoryChange(draft.category);
    }
    
    if (draft.coverImage) {
      setCoverUrl(draft.coverImage);
    }

    setDescription(draft.description);
    // 假设草稿不包含文件实体，只包含元数据
    // 这里我们将状态置为 "success" (模拟已上传) 以允许编辑，但实际上没有文件
    // 或者我们应该要求用户重新上传视频？
    // 根据需求 "只能存储一个...提示进入该编辑卡片"，假设草稿是元数据草稿
    // 但如果没有视频文件，如何发布？
    // 通常草稿应该关联一个未发布的 videoId。
    showMessage("草稿已恢复，请上传对应视频。", "success");
  };

  const handleDiscardDraft = async () => {
    if (!draft) return;
    setLoading(true);
    try {
      await deleteDraft(draft.id);
      setDraft(null);
      showMessage("草稿已删除", "success");
    } finally {
      setLoading(false);
    }
  };

  /**
   * 保存草稿
   */
  const handleSaveDraft = async () => {
    if (!title) {
      showMessage("标题不能为空", "error");
      return;
    }
    
    setLoading(true);
    try {
      // 如果已有草稿，先删除（保证只有一个）
      if (draft) {
        await deleteDraft(draft.id);
      }

      const res = await saveDraft({
        title,
        category: categoryId || "uncategorized",
        description,
        coverImage: "" // 暂不支持自定义封面上传
      });

      if (res.data) {
        setDraft(res.data);
        showMessage("草稿保存成功", "success");
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * 提交发布
   */
  const handleSubmit = async () => {
    if (!videoId) {
      showMessage("请先等待视频上传完成", "error");
      return;
    }
    if (!title.trim()) {
      showMessage("请输入视频标题", "error");
      return;
    }
    if (!categoryId) {
      showMessage("请选择视频分类", "error");
      return;
    }
    // 检查是否选择了最终分类（在扁平化模式下，categoryId 和 subCategoryId 通常都会被设置，或者只设置 subCategoryId）
    // 为了兼容性，我们主要检查 subCategoryId 是否存在（如果是有子分类的情况）或者 categoryId
    if (!subCategoryId && !categoryId) {
       showMessage("请选择视频分类", "error");
       return;
    }

    if (permission === "password" && !password) {
      showMessage("请设置访问密码", "error");
      return;
    }

    setLoading(true);
    
    // 上传封面
    let finalCoverUrl = coverUrl;
    if (coverBlob) {
          const coverRes = await uploadCover(coverBlob);
          if (coverRes.code === 200 && coverRes.data) {
             finalCoverUrl = coverRes.data;
          }
    }

    try {
      await updateVideo({
        id: videoId,
        title,
        category: subCategoryId || categoryId,
        description,
        cover: finalCoverUrl,
        tags: Array.from(selectedTags),
        password: permission === "password" ? password : "",
        // permission 等其他字段需后端支持，此处暂略
        status: "pending" // 提交审核
      });
      
      // 如果有草稿，提交成功后删除草稿
      if (draft) {
        await deleteDraft(draft.id);
        setDraft(null);
      }

      showMessage("视频已发布，等待审核。", "success");
      // 重置状态
      resetForm();
    } finally {
      setLoading(false);
    }
  };

  /**
   * 重置表单
   */
  const resetForm = () => {
    setStatus("idle");
    setFile(null);
    setUploadProgress(0);
    setVideoId("");
    setTitle("");
    setCoverUrl("");
    setCoverBlob(null);
    setCategoryId("");
    setSubCategoryId("");
    // setSubCategories([]); // 已移除
    setDescription("");
    setSelectedTags(new Set());
    setChapters([]);
    setPermission("public");
    setPassword("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  /**
   * 添加章节
   */
  const handleAddChapter = () => {
    if (!newChapterTitle || !newChapterTime) return;
    const seconds = parseInt(newChapterTime);
    if (isNaN(seconds)) return;

    const newChapter: ChapterItem = {
      id: Date.now().toString(),
      title: newChapterTitle,
      time: newChapterTime,
      timeInSeconds: seconds
    };
    setChapters([...chapters, newChapter].sort((a, b) => a.timeInSeconds - b.timeInSeconds));
    setNewChapterTitle("");
    setNewChapterTime("");
  };

  /**
   * 删除章节
   */
  const handleRemoveChapter = (id: string) => {
    setChapters(chapters.filter(c => c.id !== id));
  };

  // ===== 8. UI渲染逻辑区域 =====
  const renderDraftStatusCard = () => {
    if (!loading && !draft) {
      return null;
    }
    return (
      <Card className="p-4 bg-[var(--bg-content)] border border-[var(--border-color)]">
        {loading ? (
          <p className="text-sm text-[var(--text-color-secondary)]">正在检查草稿状态...</p>
        ) : (
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <FiAlertCircle className="text-primary" size={20} />
              <div>
                <p className="text-sm font-medium">
                  本地存在一个未提交的草稿：{draft?.title || "未命名草稿"}
                </p>
                <p className="text-xs text-[var(--text-color-secondary)]">
                  上次保存时间：{draft?.updatedAt}
                </p>
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              <Button size="sm" variant="light" onPress={handleDiscardDraft}>
                不用了
              </Button>
              <Button size="sm" color="primary" onPress={handleRestoreDraft}>
                继续编辑
              </Button>
            </div>
          </div>
        )}
      </Card>
    );
  };

  const renderUploadCard = () => (
    <Card
      className={`border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center gap-4 cursor-pointer transition-all min-h-[400px] ${
        isDragOver
          ? "border-[var(--primary-color)] bg-[var(--primary-color)]/5"
          : "border-[var(--border-color)] hover:border-[var(--primary-color)] hover:bg-[var(--primary-color)]/5"
      }`}
      onClick={() => {
        // 只有当点击的是 Card 本身或者非 Button 区域时才触发，防止 Button 的 onPress 和 Card 的 onClick 双重触发
        if (fileInputRef.current) {
          fileInputRef.current.click();
        }
      }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        accept="video/*"
        onChange={handleFileSelect}
        aria-label="上传视频文件"
      />
      <div className="w-16 h-16 rounded-full bg-[var(--bg-content)] flex items-center justify-center shadow-sm text-[var(--primary-color)] pointer-events-none">
        <FiUploadCloud size={32} />
      </div>
      <div className="text-center pointer-events-none">
        <h3 className="text-lg font-medium">点击或拖拽视频文件上传</h3>
        <p className="text-sm text-[var(--text-color-secondary)] mt-1">
          支持 MP4, WebM, MKV 等常见格式
        </p>
      </div>
      <Button 
        color="primary" 
        variant="shadow"
        onPress={() => {
          // 阻止事件冒泡到 Card，避免重复触发
          if (fileInputRef.current) {
            fileInputRef.current.click();
          }
        }}
      >
        选择文件
      </Button>
    </Card>
  );

  const renderProgressCard = () => (
    <Card className="p-4 bg-[var(--bg-content)] border border-[var(--border-color)] shadow-sm">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded bg-[var(--primary-color)]/10 flex items-center justify-center text-[var(--primary-color)]">
          <FiFile size={24} />
        </div>
        <div className="flex-1 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium truncate max-w-[300px]">{file?.name}</span>
            <span className="text-[var(--text-color-secondary)]">
              {status === "success" ? "上传完成" : status === "merging" ? "处理中..." : `${uploadProgress}%`}
            </span>
          </div>
          <Progress 
            aria-label="上传进度"
            value={uploadProgress} 
            color={status === "success" ? "success" : "primary"}
            size="sm"
            isIndeterminate={status === "merging"}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-[var(--text-color-secondary)]">
            <span>{file ? formatSize(file.size) : "-"}</span>
            <span>{status === "success" ? "准备就绪" : "正在上传..."}</span>
          </div>
        </div>
        {status === "success" && (
          <div className="text-success">
            <FiCheckCircle size={24} />
          </div>
        )}
      </div>
    </Card>
  );

  const renderEditForm = () => {
    // 上传过程中允许编辑，但仅在上传完成后允许提交
    const isFormEnabled = status !== "idle";

    return (
      <Card className={`p-6 space-y-6 transition-opacity ${!isFormEnabled ? "opacity-60" : ""}`}>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">基本设置</h3>
          <Button
            size="sm"
            variant="flat"
            color="warning"
            startContent={<FiSave />}
            onPress={handleSaveDraft}
            isDisabled={!isFormEnabled}
          >
            保存草稿
          </Button>
        </div>

        {/* 封面 */}
        <div className="space-y-2">
          <label className="text-sm font-medium">封面 <span className="text-danger">*</span></label>
          <div className="flex flex-col gap-2">
             <div 
                className="relative group w-48 h-[108px] bg-black/5 rounded-lg overflow-hidden border border-[var(--border-color)] cursor-pointer"
                onClick={() => setIsCoverEditorOpen(true)}
                role="button"
                tabIndex={0}
                aria-label="点击更换封面"
                onKeyDown={(e) => e.key === 'Enter' && setIsCoverEditorOpen(true)}
             >
                {coverUrl ? (
                    <HeroImage 
                        src={coverUrl} 
                        alt="Cover" 
                        classNames={{ wrapper: "w-full h-full", img: "w-full h-full object-cover" }}
                    />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-[var(--text-color-secondary)]">
                        <FiImage size={24} />
                        <span className="text-xs mt-1">默认封面</span>
                    </div>
                )}
                
                {/* 更改封面悬浮层 */}
                <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <FiImage className="text-white mb-1" size={20} />
                    <span className="text-white text-xs font-medium">更改封面</span>
                </div>
             </div>
             <p className="text-xs text-[var(--text-color-secondary)]">
                系统默认选中第一帧为视频封面，点击图片可进行自定义设置。
             </p>
          </div>
        </div>

        {/* 标题 */}
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="video-title">视频标题 <span className="text-danger">*</span></label>
          <Input 
            id="video-title"
            aria-label="视频标题"
            placeholder="请输入视频标题" 
            value={title} 
            onValueChange={setTitle}
            maxLength={80}
            endContent={<span className="text-xs text-[var(--text-color-secondary)]">{title.length}/80</span>}
          />
        </div>

        {/* 分类 */}
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="video-category">视频分类 <span className="text-danger">*</span></label>
          <div className="w-full">
            <CategoryCascader
              id="video-category"
              aria-label="视频分类"
              placeholder="选择视频分类"
              categories={categories}
              value={subCategoryId || categoryId}
              onChange={handleCategoryChange}
            />
          </div>
        </div>

        {/* 标签 */}
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="video-tags">视频标签</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {Array.from(selectedTags).map(tag => (
              <Chip key={tag} onClose={() => {
                const newTags = new Set(selectedTags);
                newTags.delete(tag);
                setSelectedTags(newTags);
              }} variant="flat" color="primary">
                {tag}
              </Chip>
            ))}
          </div>
          <AdminSelect 
            id="video-tags"
            aria-label="视频标签"
            placeholder="添加标签（最多10个）" 
            selectionMode="multiple"
            selectedKeys={selectedTags}
            onSelectionChange={(keys) => {
              const selectedSet = keys as Set<string>;
              if (selectedSet.size <= 10) {
                setSelectedTags(selectedSet);
              }
            }}
          >
            {tags.map((tag) => (
              <SelectItem key={tag.name} textValue={tag.name}>
                {tag.name}
              </SelectItem>
            ))}
          </AdminSelect>
        </div>

        {/* 简介 */}
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="video-desc">视频简介</label>
          <Textarea 
            id="video-desc"
            aria-label="视频简介"
            placeholder="请输入视频简介" 
            value={description} 
            onValueChange={setDescription}
            minRows={4}
          />
        </div>

        <Divider />

        {/* 章节标记 */}
        <div className="space-y-4">
          <label className="text-sm font-medium" htmlFor="chapter-title">章节标记</label>
          <div className="flex gap-2">
            <Input 
              id="chapter-title"
              aria-label="章节标题"
              placeholder="章节标题" 
              value={newChapterTitle} 
              onValueChange={setNewChapterTitle}
              className="flex-1"
            />
            <Input 
              id="chapter-time"
              aria-label="章节时间"
              placeholder="时间(秒)" 
              value={newChapterTime} 
              onValueChange={setNewChapterTime}
              type="number"
              className="w-32"
            />
            <Button isIconOnly onClick={handleAddChapter} aria-label="添加章节"><FiPlus /></Button>
          </div>
          <div className="space-y-2">
            {chapters.map((chapter) => (
              <div key={chapter.id} className="flex items-center justify-between bg-[var(--bg-content)] p-2 rounded border border-[var(--border-color)]">
                <div className="flex items-center gap-2">
                  <FiClock className="text-[var(--text-color-secondary)]" />
                  <span className="font-medium">{formatTime(chapter.timeInSeconds)}</span>
                  <span>{chapter.title}</span>
                </div>
                <Button 
                  isIconOnly 
                  size="sm" 
                  color="danger" 
                  variant="light" 
                  onPress={() => handleRemoveChapter(chapter.id)}
                  aria-label={`删除章节 ${chapter.title}`}
                >
                  <FiTrash2 />
                </Button>
              </div>
            ))}
            {chapters.length === 0 && <p className="text-xs text-[var(--text-color-secondary)]">暂无章节</p>}
          </div>
        </div>

        {/* 权限控制 */}
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="permission-select">权限控制</label>
          <div className="flex flex-col gap-4">
             <AdminSelect 
                id="permission-select"
                aria-label="权限控制"
                selectedKeys={[permission]}
                onChange={(e) => {
                  const val = e.target.value as PermissionType;
                  setPermission(val);
                  if (val !== "password") setPassword("");
                }}
             >
                <SelectItem key="public">公开</SelectItem>
                <SelectItem key="private">私有</SelectItem>
                <SelectItem key="password">密码访问</SelectItem>
             </AdminSelect>
             
             {permission === "password" && (
               <Input 
                 id="access-password"
                 aria-label="访问密码"
                 type="password"
                 label="访问密码"
                 placeholder="请输入视频访问密码"
                 value={password}
                 onValueChange={setPassword}
                 variant="bordered"
                 className="max-w-xs"
               />
             )}
          </div>
        </div>

        <div className="pt-4 flex justify-end gap-2">
          <Button variant="flat" onPress={resetForm}>取消</Button>
          <Button
            color="primary"
            onPress={handleSubmit}
            isLoading={loading}
            isDisabled={status !== "success"}
          >
            立即投稿
          </Button>
        </div>
      </Card>
    );
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // ===== 9. 页面初始化与事件绑定 =====
  useEffect(() => {
    const timer = setTimeout(() => {
      loadInitialData();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadInitialData]);

  // ===== 10. TODO任务管理区域 =====

  // ===== 11. 导出区域 =====
  return (
    <div className="max-w-5xl mx-auto space-y-6 p-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">视频投稿</h1>
        <p className="text-[var(--text-color-secondary)]">上传精彩视频，分享你的创作</p>
      </div>

      {message && (
        <div className={`p-3 rounded-lg text-sm ${
          message.type === 'error' ? 'bg-danger/10 text-danger' : 
          message.type === 'success' ? 'bg-success/10 text-success' : 
          'bg-primary/10 text-primary'
        }`}>
          {message.text}
        </div>
      )}

      {renderDraftStatusCard()}

      {status === "idle" ? (
        renderUploadCard()
      ) : (
        <div className="space-y-6">
          {renderProgressCard()}
          {renderEditForm()}
        </div>
      )}

      {/* 封面编辑器 */}
      <CoverEditor 
        isOpen={isCoverEditorOpen}
        onClose={() => setIsCoverEditorOpen(false)}
        videoFile={file}
        initialCoverUrl={coverUrl}
        onConfirm={(url, blob) => {
            setCoverUrl(url);
            setCoverBlob(blob);
        }}
      />

    </div>
  );
}
