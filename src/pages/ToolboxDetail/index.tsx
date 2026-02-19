/**
 * 工具详情页面
 * @module pages/ToolboxDetail
 * @description 百宝袋工具详情页，展示工具介绍和使用说明
 */

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  Button, 
  Chip, 
  Card, 
  CardBody, 
  CardHeader, 
  Divider,
  Image,
  Skeleton,
  Avatar
} from "@heroui/react";
import { 
  FiExternalLink, 
  FiShare2, 
  FiHeart, 
  FiEye, 
  FiBarChart2,
  FiBox
} from "react-icons/fi";
import { getToolboxDetail, type ToolboxDetail } from "@/api/front/toolbox";
import { routes } from "@/router/routes";
import { useTitle } from "react-use";
import { useCallback } from "react";

// ===== 2. TODO待处理导入区域 =====

// ===== 3. 状态控制逻辑区域 =====
/**
 * 工具详情页面组件
 */
export default function ToolboxDetailPage() {
  /** 路由参数ID */
  const { id } = useParams<{ id: string }>();
  /** 路由导航 */
  const navigate = useNavigate();
  
  /** 工具详情数据 */
  const [data, setData] = useState<ToolboxDetail | null>(null);
  /** 页面加载状态 */
  const [isLoading, setIsLoading] = useState(true);

  // ===== 4. 通用工具函数区域 =====

  // ===== 5. 注释代码函数区 =====

  // ===== 6. 错误处理函数区域 =====

  // ===== 7. 数据处理函数区域 =====
  /**
   * 获取工具详情数据
   */
  const handleFetchData = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const res = await getToolboxDetail(id);
      setData(res);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  // ===== 8. UI渲染逻辑区域 =====
  // 设置页面标题
  useTitle(data ? `${data.title} - 百宝袋` : "加载中...");

  /**
   * 渲染加载骨架屏
   */
  const renderSkeleton = () => (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-8">
      <Skeleton className="h-12 w-1/3 rounded-lg" />
      <div className="flex gap-8">
        <Skeleton className="h-96 w-2/3 rounded-lg" />
        <Skeleton className="h-96 w-1/3 rounded-lg" />
      </div>
    </div>
  );

  /**
   * 渲染未找到状态
   */
  const renderNotFound = () => (
    <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
      <h2 className="text-2xl font-bold">未找到该工具</h2>
      <Button onPress={() => navigate(routes.allSearch)}>返回搜索</Button>
    </div>
  );

  // ===== 9. 页面初始化与事件绑定 =====// 初始化
  useEffect(() => {
    let ignore = false;
    setIsLoading(true);
    const timer = setTimeout(() => {
      if (!ignore) handleFetchData();
    }, 0);
    return () => {
      ignore = true;
      clearTimeout(timer);
    };
  }, [handleFetchData]);

  if (isLoading) {
    return renderSkeleton();
  }

  if (!data) {
    return renderNotFound();
  }

  return (
    <div className="min-h-screen pb-20">
      <div className="max-w-7xl mx-auto px-6 space-y-10">
        {/* 头部区域 */}
        <div className="flex flex-col md:flex-row gap-8 items-start">
          <div className="w-32 h-32 shrink-0 bg-white dark:bg-zinc-800 rounded-2xl p-4 shadow-sm border border-[var(--border-color)]">
            <Image
              src={data.logo || "/placeholder-logo.png"}
              alt={data.title}
              className="w-full h-full object-contain"
              removeWrapper
            />
          </div>
          
          <div className="flex-1 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex gap-2">
                <Button 
                  color="primary" 
                  endContent={<FiExternalLink />}
                  as="a"
                  href={data.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold"
                >
                  访问官网
                </Button>
                <Button isIconOnly variant="flat" aria-label="Like">
                  <FiHeart />
                </Button>
                <Button isIconOnly variant="flat" aria-label="Share">
                  <FiShare2 />
                </Button>
              </div>
            </div>
            
            <p className="text-lg text-[var(--text-color-secondary)] leading-relaxed max-w-4xl">
              {data.description}
            </p>
            
            <div className="flex flex-wrap gap-2">
              {data.tags.map(tag => (
                <Chip key={tag} variant="flat" color="secondary" size="sm">
                  #{tag}
                </Chip>
              ))}
            </div>

            <div className="flex gap-6 text-sm text-[var(--text-color-secondary)] pt-2">
              <div className="flex items-center gap-2">
                <FiEye className="w-4 h-4" />
                <span>{data.stats.views.toLocaleString()} 次查看</span>
              </div>
              <div className="flex items-center gap-2">
                <FiHeart className="w-4 h-4" />
                <span>{data.stats.likes.toLocaleString()} 人喜欢</span>
              </div>
              <div className="flex items-center gap-2">
                <FiBarChart2 className="w-4 h-4" />
                <span>{data.stats.usage.toLocaleString()} 次使用</span>
              </div>
            </div>
          </div>
        </div>

        <Divider />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左侧：内容 */}
          <div className="lg:col-span-2 space-y-10">
            {/* 核心功能 */}
            {data.features.length > 0 && (
              <section className="space-y-4">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <span className="w-1 h-6 bg-[var(--primary-color)] rounded-full"/>
                  核心功能
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {data.features.map((feature, index) => (
                    <Card key={index} shadow="sm" className="bg-[var(--bg-elevated)]">
                      <CardBody>
                        <div className="flex items-start gap-3">
                          <div className="mt-1.5 w-2 h-2 rounded-full bg-[var(--primary-color)] shrink-0" />
                          <span>{feature}</span>
                        </div>
                      </CardBody>
                    </Card>
                  ))}
                </div>
              </section>
            )}

            {/* 应用截图 */}
            {data.images.length > 0 && (
              <section className="space-y-4">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <span className="w-1 h-6 bg-[var(--primary-color)] rounded-full"/>
                  应用截图
                </h2>
                <div className="space-y-6">
                  {data.images.map((img, index) => (
                    <div key={index} className="rounded-xl overflow-hidden border border-[var(--border-color)] shadow-sm">
                      <Image
                        src={img}
                        alt={`${data.title} screenshot ${index + 1}`}
                        className="w-full h-auto"
                        removeWrapper
                      />
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* 右侧：侧边栏 */}
          <div className="space-y-8">
            {/* 作者/来源信息 */}
            {data.author && (
              <Card className="bg-[var(--bg-elevated)]">
                <CardHeader className="font-bold text-lg">关于开发者</CardHeader>
                <CardBody className="flex flex-row items-center gap-4 pt-0">
                  <Avatar src={data.author.avatar} size="lg" />
                  <div>
                    <div className="font-semibold">{data.author.name}</div>
                    <div className="text-xs text-[var(--text-color-secondary)]">
                      收录于 {new Date(data.createAt).toLocaleDateString()}
                    </div>
                  </div>
                </CardBody>
              </Card>
            )}

            {/* 相关工具 */}
            {data.relatedTools && data.relatedTools.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-xl font-bold">相关推荐</h3>
                <div className="grid grid-cols-1 gap-4">
                  {data.relatedTools.map(tool => (
                    <Card 
                      key={tool.id} 
                      isPressable 
                      onPress={() => navigate(routes.toolboxDetail.replace(":id", tool.id))}
                      className="hover:scale-[1.02] transition-transform"
                    >
                      <CardBody className="p-4">
                        <div className="flex gap-3">
                          <div className="w-12 h-12 bg-gray-100 dark:bg-zinc-800 rounded-lg flex items-center justify-center shrink-0">
                            <FiBox className="w-6 h-6 text-gray-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold truncate">{tool.title}</h4>
                            <p className="text-xs text-[var(--text-color-secondary)] line-clamp-2 mt-1">
                              {tool.description}
                            </p>
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ===== 10. TODO任务管理区域 =====

// ===== 11. 导出区域 =====
