import React from "react";
import ReactPlayer from "react-player";
import { useNavigate, useParams } from "react-router-dom";
import { Button, Avatar, Textarea, Accordion, AccordionItem } from "@heroui/react";
import { FiThumbsUp, FiStar, FiShare2, FiMessageSquare, FiUserPlus } from "react-icons/fi";
import { routes } from "../../router/routes";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ReactPlayerAny = ReactPlayer as any;

function VideoDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isExpanded, setIsExpanded] = React.useState(false);

  // Mock data
  const video = {
    title: "从 0 搭建个人知识库前端",
    description: `
# 课程介绍

本课程将带你从零开始搭建一个功能完备的个人知识库前端系统。

## 涉及技术栈
- React 19
- Vite
- TypeScript
- TailwindCSS
- HeroUI

## 课程大纲
1. 项目初始化
2. 路由配置
3. 状态管理
4. 组件封装
    `,
    author: {
      name: "知库小站长",
      avatar: "",
      fans: "1.2k"
    },
    stats: {
      views: "1.2k",
      likes: 342,
      favorites: 120,
      date: "2026-01-05"
    }
  };

  const recommendations = [
    { id: "2", title: "用 Three.js 打造首页 3D Banner", views: "856", duration: "12:30" },
    { id: "3", title: "一文吃透 React Router 7 新特性", views: "2.1k", duration: "08:45" },
    { id: "4", title: "前端工程化下的内容管理最佳实践", views: "964", duration: "15:20" }
  ];

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Content (70%) */}
        <div className="lg:basis-7/10 space-y-6">
          {/* Player */}
          <div className="aspect-video bg-black rounded-xl overflow-hidden shadow-lg">
            <ReactPlayerAny
              url="https://www.youtube.com/watch?v=ysz5S6P_8NY"
              width="100%"
              height="100%"
              controls
              light
            />
          </div>

          {/* Info Panel */}
          <div className="space-y-4">
            <div className="flex justify-between items-start gap-4">
              <h1 className="text-xl md:text-2xl font-bold leading-tight">{video.title}</h1>
              <Button isIconOnly variant="light" radius="full">
                <FiShare2 className="text-lg" />
              </Button>
            </div>

            <div className="flex items-center gap-4 text-xs text-[var(--text-color-secondary)]">
              <span>{video.stats.views} 播放</span>
              <span>{video.stats.date}</span>
              {id && <span>视频 ID: {id}</span>}
            </div>

            {/* Author Card */}
            <div className="flex items-center justify-between py-3 border-y border-[var(--border-color)]">
              <div className="flex items-center gap-3">
                <Avatar src={video.author.avatar} name={video.author.name.charAt(0)} />
                <div>
                  <div className="font-semibold text-sm">{video.author.name}</div>
                  <div className="text-xs text-[var(--text-color-secondary)]">{video.author.fans} 粉丝</div>
                </div>
              </div>
              <Button color="primary" size="sm" radius="full" startContent={<FiUserPlus />}>
                关注
              </Button>
            </div>

            {/* Description (Collapsible) */}
            <div className="relative">
              <div className={`text-sm text-[var(--text-color-secondary)] overflow-hidden transition-all ${isExpanded ? "h-auto" : "h-20"}`}>
                <div className="whitespace-pre-wrap">{video.description}</div>
              </div>
              <button
                className="text-xs text-[var(--primary-color)] mt-2 hover:underline"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? "收起" : "展开全文"}
              </button>
            </div>

            {/* Stats Actions */}
            <div className="flex gap-6 pt-2">
              <div className="flex items-center gap-2 cursor-pointer hover:text-[var(--primary-color)] transition-colors">
                <FiThumbsUp className="text-lg" />
                <span className="text-sm">{video.stats.likes}</span>
              </div>
              <div className="flex items-center gap-2 cursor-pointer hover:text-[var(--primary-color)] transition-colors">
                <FiStar className="text-lg" />
                <span className="text-sm">{video.stats.favorites}</span>
              </div>
            </div>
          </div>

          {/* Comments */}
          <div className="space-y-6 pt-6 border-t border-[var(--border-color)]">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <FiMessageSquare />
              评论区
            </h3>
            {/* Comment Input */}
            <div className="flex gap-4">
              <Avatar className="w-8 h-8" />
              <div className="flex-1 space-y-2">
                <Textarea
                  placeholder="发一条友善的评论"
                  minRows={2}
                  variant="bordered"
                />
                <div className="flex justify-end">
                  <Button size="sm" color="primary">发布评论</Button>
                </div>
              </div>
            </div>
            
            {/* Comment List (Placeholder) */}
            <div className="text-center py-8 text-[var(--text-color-secondary)] text-sm">
              暂无评论，快来抢沙发吧~
            </div>
          </div>
        </div>

        {/* Right Sidebar (30%) */}
        <div className="lg:basis-3/10">
          <div className="sticky top-24 space-y-6">
            <Accordion variant="splitted" defaultExpandedKeys={["1"]}>
              <AccordionItem key="1" aria-label="视频选集" title="视频选集">
                <div className="space-y-1 max-h-60 overflow-y-auto">
                  <div className="p-2 rounded bg-[var(--primary-color)]/10 text-[var(--primary-color)] text-sm cursor-pointer">
                    P1. {video.title}
                  </div>
                  <div className="p-2 rounded hover:bg-[var(--bg-elevated)] text-sm cursor-pointer transition-colors">
                    P2. 待更新...
                  </div>
                </div>
              </AccordionItem>
            </Accordion>

            <div>
              <h3 className="text-base font-bold mb-4">相关推荐</h3>
              <div className="space-y-4">
                {recommendations.map(item => (
                  <div
                    key={item.id}
                    className="flex gap-3 group cursor-pointer"
                    onClick={() =>
                      navigate(routes.videoDetail.replace(":id", item.id))
                    }
                  >
                    <div className="relative w-32 h-20 bg-slate-800 rounded-lg overflow-hidden shrink-0">
                      <div className="absolute bottom-1 right-1 bg-black/60 text-white text-[10px] px-1 rounded">
                        {item.duration}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium line-clamp-2 group-hover:text-[var(--primary-color)] transition-colors">
                        {item.title}
                      </div>
                      <div className="mt-1 text-xs text-[var(--text-color-secondary)]">
                        {item.views} 播放
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VideoDetail;
