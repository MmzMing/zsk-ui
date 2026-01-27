import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Slider,
} from "@heroui/react";
import { FiUpload, FiImage, FiAlertCircle, FiMinus, FiPlus } from "react-icons/fi";

interface CoverEditorProps {
  isOpen: boolean;
  onClose: () => void;
  videoFile: File | null;
  initialCoverUrl?: string;
  onConfirm: (coverUrl: string, coverBlob: Blob | null) => void;
}

export const CoverEditor: React.FC<CoverEditorProps> = ({
  isOpen,
  onClose,
  videoFile,
  initialCoverUrl,
  onConfirm,
}) => {
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [duration, setDuration] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  // const [isGenerating, setIsGenerating] = useState(false);
  const isGeneratingRef = useRef(false);
  const [customFile, setCustomFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 缩放与位移状态
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 错误提示处理
  const showError = (msg: string) => {
    setError(msg);
    setTimeout(() => setError(null), 3000);
  };

  // 初始化
  useEffect(() => {
    if (isOpen) {
      setPreviewUrl(initialCoverUrl || "");
      setCustomFile(null);
      setCurrentTime(0);
      setScale(1);
      setPosition({ x: 0, y: 0 });
      
      if (videoFile) {
        const url = URL.createObjectURL(videoFile);
        if (videoRef.current) {
          videoRef.current.src = url;
        }
        return () => URL.revokeObjectURL(url);
      }
    }
  }, [isOpen, videoFile, initialCoverUrl]);

  // 生成缩略图条带
  const generateThumbnails = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || isGeneratingRef.current) return;
    
    // setIsGenerating(true);
    isGeneratingRef.current = true;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    
    if (!ctx) return;

    try {
      // 等待元数据加载
      if (video.readyState < 1) {
        await new Promise((resolve) => {
          video.onloadedmetadata = resolve;
        });
      }
      
      setDuration(video.duration);
      
      // 生成 8 张缩略图
      const count = 8;
      const step = video.duration / count;
      const thumbs: string[] = [];

      canvas.width = 160; // 缩略图宽
      canvas.height = 90; // 缩略图高

      for (let i = 0; i < count; i++) {
        video.currentTime = i * step;
        await new Promise((resolve) => {
          const onSeeked = () => {
            video.removeEventListener("seeked", onSeeked);
            resolve(null);
          };
          video.addEventListener("seeked", onSeeked);
        });
        
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        thumbs.push(canvas.toDataURL("image/jpeg", 0.5));
      }
      
      setThumbnails(thumbs);
      
      // 重置回 0
      video.currentTime = 0;
    } finally {
      // setIsGenerating(false);
      isGeneratingRef.current = false;
    }
  }, []);

  // 监听视频加载以生成缩略图
  useEffect(() => {
    if (videoFile && isOpen) {
        // 稍微延迟确保 ref 挂载
        setTimeout(() => {
            generateThumbnails();
        }, 100);
    }
  }, [videoFile, isOpen, generateThumbnails]);

  // 滑块变化处理
  const handleSliderChange = (value: number | number[]) => {
    const time = Array.isArray(value) ? value[0] : value;
    setCurrentTime(time);
    
    if (videoRef.current) {
      // 必须设置 currentTime 触发 seek 操作
      videoRef.current.currentTime = time;
    }
  };

  const handleVideoSeeked = () => {
    // 如果正在生成缩略图，则不更新预览图
    if (isGeneratingRef.current) return;

    if (videoRef.current && canvasRef.current) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        
        // 确保视频尺寸有效
        const width = video.videoWidth || 1280;
        const height = video.videoHeight || 720;
        
        if (ctx) {
            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
                setPreviewUrl(dataUrl);
                setCustomFile(null); // 滑动进度条时，覆盖自定义上传的文件
        }
    }
  };

  // 处理本地图片上传
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // 限制类型：禁止 gif
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
      if (!allowedTypes.includes(file.type)) {
        showError("仅支持 JPG、JPEG、PNG 格式，不支持 GIF");
        return;
      }

      // 限制大小：5MB
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        showError("图片大小不能超过 5MB");
        return;
      }

      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setCustomFile(file);
      setScale(1);
      setPosition({ x: 0, y: 0 });
      
      // 重置 input value，允许重复上传同一张图片
      e.target.value = "";
    }
  };

  // 拖拽平移逻辑
  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale <= 1) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // 确认保存
  const handleConfirm = () => {
    if (canvasRef.current) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // 统一输出为 16:9
        canvas.width = 1280;
        canvas.height = 720;
        
        const drawImage = (imgElement: HTMLImageElement | HTMLVideoElement) => {
            ctx.fillStyle = "#000";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // 计算缩放后的尺寸和位置
            const targetRatio = 16 / 9;
            let sourceWidth, sourceHeight;
            
            if (imgElement instanceof HTMLVideoElement) {
                sourceWidth = imgElement.videoWidth;
                sourceHeight = imgElement.videoHeight;
            } else {
                sourceWidth = imgElement.naturalWidth;
                sourceHeight = imgElement.naturalHeight;
            }
            
            const sourceRatio = sourceWidth / sourceHeight;
            
            let drawWidth, drawHeight;
            if (sourceRatio > targetRatio) {
                drawHeight = canvas.height;
                drawWidth = canvas.height * sourceRatio;
            } else {
                drawWidth = canvas.width;
                drawHeight = canvas.width / sourceRatio;
            }

            // 应用用户的手动缩放和位移
            const finalWidth = drawWidth * scale;
            const finalHeight = drawHeight * scale;
            
            // 居中起始点 + 用户位移
            // 注意：position.x/y 是相对于预览区域像素的，需要转换到 canvas 像素
            const containerWidth = containerRef.current?.clientWidth || 1;
            const ratio = canvas.width / containerWidth;
            
            const x = (canvas.width - finalWidth) / 2 + position.x * ratio;
            const y = (canvas.height - finalHeight) / 2 + position.y * ratio;

            ctx.drawImage(imgElement, x, y, finalWidth, finalHeight);
            
            canvas.toBlob((blob) => {
                onConfirm(canvas.toDataURL("image/jpeg", 0.9), blob);
                onClose();
            }, "image/jpeg", 0.9);
        };

        if (customFile || initialCoverUrl) {
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.onload = () => drawImage(img);
            img.src = previewUrl;
        } else if (videoRef.current) {
            drawImage(videoRef.current);
        }
    }
  };

  return (
    <Modal 
        isOpen={isOpen} 
        onClose={onClose} 
        size="4xl"
        classNames={{
            base: "bg-[var(--bg-elevated)] text-[var(--text-color)]",
            header: "border-b border-[var(--border-color)]",
            footer: "border-t border-[var(--border-color)]"
        }}
        aria-labelledby="modal-title"
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1" id="modal-title">封面设置</ModalHeader>
        <ModalBody className="py-6">
          <div className="flex flex-col gap-4">
            {/* 顶部调节工具栏 */}
            <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-medium bg-[var(--bg-content)] px-3 py-1.5 rounded-md border border-[var(--border-color)]">
                        首页推荐封面 (16:9)
                    </span>
                </div>
                
                <div className="flex items-center gap-4 bg-[var(--bg-content)] px-4 py-1 rounded-md border border-[var(--border-color)]">
                    <div className="flex items-center gap-3 min-w-[200px]">
                        <Button 
                            isIconOnly
                            variant="light"
                            size="sm"
                            className="text-[var(--text-color-secondary)] hover:text-[var(--primary-color)] min-w-unit-8 w-8 h-8"
                            onClick={() => setScale(Math.max(1, scale - 0.1))}
                            aria-label="缩小封面"
                        >
                            <FiMinus />
                        </Button>
                        <Slider 
                            aria-label="缩放进度"
                            size="sm"
                            step={0.01} 
                            maxValue={3} 
                            minValue={1} 
                            value={scale} 
                            onChange={(v) => setScale(Array.isArray(v) ? v[0] : v)}
                            className="flex-1"
                            classNames={{
                                track: "h-1",
                                thumb: "w-3 h-3 bg-[var(--primary-color)]"
                            }}
                        />
                        <Button 
                            isIconOnly
                            variant="light"
                            size="sm"
                            className="text-[var(--text-color-secondary)] hover:text-[var(--primary-color)] min-w-unit-8 w-8 h-8"
                            onClick={() => setScale(Math.min(3, scale + 0.1))}
                            aria-label="放大封面"
                        >
                            <FiPlus />
                        </Button>
                    </div>
                </div>
            </div>

            {/* 隐藏的 Video 和 Canvas 用于处理 */}
            <video 
                ref={videoRef} 
                style={{ position: 'fixed', left: '-10000px', top: '-10000px', width: '1px', height: '1px' }}
                muted 
                playsInline
                crossOrigin="anonymous"
                onSeeked={handleVideoSeeked}
            />
            <canvas ref={canvasRef} className="hidden" />
            
            {/* 预览区域 (16:9) */}
            <div 
                ref={containerRef}
                className="w-full aspect-video bg-black rounded-lg overflow-hidden flex items-center justify-center border border-[var(--border-color)] relative group cursor-move select-none"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            >
                {previewUrl ? (
                    <img 
                        src={previewUrl} 
                        alt="Cover Preview" 
                        className="max-w-none transition-transform duration-75 pointer-events-none"
                        style={{
                            transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                        }}
                    />
                ) : (
                    <div className="text-default-400 flex flex-col items-center">
                        <FiImage size={48} />
                        <p className="mt-2">暂无预览</p>
                    </div>
                )}
                
                {/* 错误提示浮层 */}
                {error && (
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-danger/90 text-white px-4 py-2 rounded-full text-sm shadow-lg backdrop-blur-sm z-50 flex items-center gap-2">
                        <FiAlertCircle />
                        {error}
                    </div>
                )}
            </div>

            {/* 控制区域 */}
            <div className="flex items-center gap-4 h-20">
                {/* 左侧上传按钮 */}
                <div 
                    className="flex flex-col items-center justify-center w-24 h-full border border-dashed border-[var(--border-color)] rounded-lg cursor-pointer hover:bg-[var(--bg-content)] transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                    role="button"
                    tabIndex={0}
                    aria-label="Upload custom cover"
                    onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
                >
                    <FiUpload className="text-xl mb-1 text-[var(--text-color-secondary)]" />
                    <span className="text-xs text-[var(--text-color-secondary)]">上传封面</span>
                    <input 
                        ref={fileInputRef} 
                        type="file" 
                        accept=".jpg,.jpeg,.png" 
                        className="hidden" 
                        onChange={handleFileUpload}
                        aria-label="Hidden file input"
                    />
                </div>

                {/* 右侧视频进度条 */}
                <div className="flex-1 h-full bg-[var(--bg-content)] rounded-lg p-2 flex flex-col justify-center relative overflow-hidden">
                    {/* 缩略图背景条 */}
                    <div className="absolute inset-x-2 top-2 bottom-2 flex opacity-50 pointer-events-none overflow-hidden rounded">
                        {thumbnails.map((thumb, idx) => (
                            <img 
                                key={idx} 
                                src={thumb} 
                                className="h-full object-cover flex-1" 
                                alt={`thumb-${idx}`} 
                            />
                        ))}
                    </div>
                    
                    {/* 滑块 */}
                    <Slider 
                        aria-label="Video Timeline"
                        step={0.1} 
                        maxValue={Math.max(0.1, duration)} 
                        minValue={0} 
                        value={currentTime} 
                        onChange={handleSliderChange}
                        className="z-10"
                        classNames={{
                            track: "bg-transparent",
                            filler: "bg-transparent", // 隐藏填充条，只显示滑块
                            thumb: "w-4 h-8 rounded bg-white shadow-md border border-gray-200 after:bg-primary"
                        }}
                        renderThumb={(props) => (
                            <div
                              {...props}
                              aria-label="视频进度滑块"
                              className="group p-1 top-1/2 bg-white border border-gray-200 shadow-medium rounded-md cursor-grab data-[dragging=true]:cursor-grabbing"
                            >
                              <span className="transition-transform bg-[var(--primary-color)] shadow-small rounded-full w-1 h-6 block group-data-[dragging=true]:scale-80" />
                              {/* 时间提示 */}
                              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                {formatTime(currentTime)}
                              </div>
                            </div>
                        )}
                    />
                </div>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="light" onPress={onClose}>
            取消
          </Button>
          <Button color="primary" onPress={handleConfirm}>
            确定
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

// 辅助函数：格式化时间
function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}
