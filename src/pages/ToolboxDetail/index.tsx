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
  FiArrowLeft,
  FiBox
} from "react-icons/fi";
import { getToolboxDetail, type ToolboxDetail } from "../../api/front/toolbox";
import { routes } from "../../router/routes";
import { useTitle } from "react-use";

export default function ToolboxDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<ToolboxDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!id) return;
      setLoading(true);
      try {
        const res = await getToolboxDetail(id);
        setData(res);
      } catch (error) {
        console.error("Failed to fetch toolbox detail:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  useTitle(data ? `${data.title} - 百宝袋` : "加载中...");

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-10 space-y-8">
        <Skeleton className="h-12 w-1/3 rounded-lg" />
        <div className="flex gap-8">
          <Skeleton className="h-96 w-2/3 rounded-lg" />
          <Skeleton className="h-96 w-1/3 rounded-lg" />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <h2 className="text-2xl font-bold">未找到该工具</h2>
        <Button onPress={() => navigate(routes.allSearch)}>返回搜索</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      {/* Back Button */}
      <div className="sticky top-20 z-10 px-6 py-4 bg-[var(--bg-color)]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto">
          <Button 
            variant="light" 
            startContent={<FiArrowLeft />}
            onPress={() => navigate(-1)}
          >
            返回
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 space-y-10">
        {/* Header Section */}
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
              <div className="flex items-center gap-3">
                <h1 className="text-3xl md:text-4xl font-bold">{data.title}</h1>
                {import.meta.env.DEV && data.title.includes("(Mock数据)") && (
                  <Chip color="warning" variant="flat" size="sm">DEV Mock</Chip>
                )}
              </div>
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
          {/* Left Column: Content */}
          <div className="lg:col-span-2 space-y-10">
            {/* Features */}
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

            {/* Screenshots */}
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

          {/* Right Column: Sidebar */}
          <div className="space-y-8">
            {/* Author/Source Info */}
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

            {/* Related Tools */}
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
                            {/* Placeholder for tool icon if not available in search result */}
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
