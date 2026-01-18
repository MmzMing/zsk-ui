import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button, Avatar, Card, Textarea, Chip } from "@heroui/react";
import { FiThumbsUp, FiStar, FiShare2, FiMessageSquare, FiBookOpen } from "react-icons/fi";
import { routes } from "../../router/routes";

function DocDetail() {
  const navigate = useNavigate();
  const { id } = useParams();

  // Mock data
  const doc = {
    title: "如何把视频课程拆解成高效可检索的学习笔记",
    category: "案例",
    date: "2026-01-09",
    author: {
      name: "知库小站长",
      avatar: "",
      fans: "1.2k"
    },
    stats: {
      views: "2.3k",
      likes: 128,
      favorites: 56
    }
  };

  const recommendations = [
    { id: "1", title: "轻量化知识库管理：用一个入口收纳所有碎片内容", views: "1.5k" },
    { id: "2", title: "从一篇文档开始，搭建属于自己的知识体系", views: "980" }
  ];

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Content (70%) */}
        <div className="lg:basis-7/10 space-y-8">
          {/* Header */}
          <div className="space-y-4 border-b border-[var(--border-color)] pb-6">
            <div className="flex items-center gap-2 mb-2">
              <Chip size="sm" color="primary" variant="flat">
                {doc.category}
              </Chip>
              <span className="text-xs text-[var(--text-color-secondary)]">
                {doc.date}
              </span>
              {id && (
                <span className="text-xs text-[var(--text-color-secondary)]">
                  文档 ID: {id}
                </span>
              )}
            </div>
            <h1 className="text-2xl md:text-3xl font-bold leading-tight">
              {doc.title}
            </h1>

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-3">
                <Avatar
                  src={doc.author.avatar}
                  name={doc.author.name.charAt(0)}
                />
                <div>
                  <div className="font-semibold text-sm">{doc.author.name}</div>
                  <div className="text-xs text-[var(--text-color-secondary)]">
                    阅读 {doc.stats.views} · 粉丝 {doc.author.fans}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button isIconOnly variant="light" radius="full">
                  <FiShare2 className="text-lg" />
                </Button>
                <Button isIconOnly variant="light" radius="full">
                  <FiStar className="text-lg" />
                </Button>
              </div>
            </div>
          </div>

          {/* Content (Prose) */}
          <div className="prose prose-sm dark:prose-invert max-w-none text-[var(--text-color)]">
            <p className="lead">
              针对一门视频课程，拆分章节、提炼关键点、记录问题与思考，再结合时间轴和标签，
              让后续复习与知识回顾更加轻松高效。
            </p>
            <h3>1. 为什么要做拆解？</h3>
            <p>
              视频课程通常时间较长，难以快速检索。通过拆解，我们可以将线性的视频流转化为结构化的知识点，
              方便后续的快速查找和复习。
            </p>
            <h3>2. 拆解的三个步骤</h3>
            <ul>
              <li>
                <strong>第一步：粗看目录</strong> - 了解课程整体结构，建立初步的知识框架。
              </li>
              <li>
                <strong>第二步：倍速播放</strong> - 快速浏览内容，标记关键时间点和重要概念。
              </li>
              <li>
                <strong>第三步：精细整理</strong> - 回到标记点，详细记录笔记，并关联相关代码或文档。
              </li>
            </ul>
            <h3>3. 工具推荐</h3>
            <p>
              工欲善其事，必先利其器。推荐结合使用 Markdown 编辑器和思维导图软件，
              前者用于记录详细内容，后者用于梳理知识脉络。
            </p>
            <blockquote>
              <p>
                “知识不仅仅是信息的堆砌，更是结构的重组。” —— 某位知识管理专家
              </p>
            </blockquote>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-center gap-8 py-8">
            <div className="flex flex-col items-center gap-1 cursor-pointer group">
              <div className="w-12 h-12 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-color)] flex items-center justify-center group-hover:bg-[var(--primary-color)] group-hover:text-white transition-colors">
                <FiThumbsUp className="text-xl" />
              </div>
              <span className="text-xs text-[var(--text-color-secondary)]">
                {doc.stats.likes} 点赞
              </span>
            </div>
            <div className="flex flex-col items-center gap-1 cursor-pointer group">
              <div className="w-12 h-12 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-color)] flex items-center justify-center group-hover:bg-yellow-400 group-hover:text-white transition-colors">
                <FiStar className="text-xl" />
              </div>
              <span className="text-xs text-[var(--text-color-secondary)]">
                {doc.stats.favorites} 收藏
              </span>
            </div>
          </div>

          {/* Comments */}
          <div className="space-y-6 pt-6 border-t border-[var(--border-color)]">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <FiMessageSquare />
              评论区
            </h3>
            <div className="flex gap-4">
              <Avatar className="w-8 h-8" />
              <div className="flex-1 space-y-2">
                <Textarea
                  placeholder="分享你的见解..."
                  minRows={2}
                  variant="bordered"
                />
                <div className="flex justify-end">
                  <Button size="sm" color="primary">
                    发布评论
                  </Button>
                </div>
              </div>
            </div>
            <div className="text-center py-8 text-[var(--text-color-secondary)] text-sm">
              暂无评论，快来抢沙发吧~
            </div>
          </div>
        </div>

        {/* Right Sidebar (30%) */}
        <div className="lg:basis-3/10">
          <div className="sticky top-24 space-y-6">
            {/* TOC */}
            <Card className="p-4 bg-[var(--bg-elevated)] border border-[var(--border-color)]">
              <h3 className="font-bold mb-3 flex items-center gap-2 text-sm">
                <FiBookOpen /> 目录
              </h3>
              <ul className="space-y-2 text-xs text-[var(--text-color-secondary)]">
                <li className="pl-3 border-l-2 border-[var(--primary-color)] text-[var(--primary-color)] font-medium cursor-pointer">
                  1. 为什么要做拆解？
                </li>
                <li className="pl-3 border-l-2 border-transparent hover:border-[var(--border-color)] cursor-pointer transition-colors">
                  2. 拆解的三个步骤
                </li>
                <li className="pl-3 border-l-2 border-transparent hover:border-[var(--border-color)] cursor-pointer transition-colors">
                  3. 工具推荐
                </li>
              </ul>
            </Card>

            {/* Recommendations */}
            <div>
              <h3 className="text-base font-bold mb-4">相关阅读</h3>
              <div className="space-y-4">
                {recommendations.map(item => (
                  <div
                    key={item.id}
                    className="group cursor-pointer p-3 rounded-lg hover:bg-[var(--bg-elevated)] transition-colors border border-transparent hover:border-[var(--border-color)]"
                    onClick={() =>
                      navigate(routes.docDetail.replace(":id", item.id))
                    }
                  >
                    <div className="text-sm font-medium line-clamp-2 group-hover:text-[var(--primary-color)] transition-colors">
                      {item.title}
                    </div>
                    <div className="mt-1 text-xs text-[var(--text-color-secondary)]">
                      {item.views} 阅读
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

export default DocDetail;
