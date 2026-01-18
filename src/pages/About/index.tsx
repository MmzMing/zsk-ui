import React from "react";
import { Accordion, AccordionItem, Card, Button } from "@heroui/react";
import { FiMail, FiPhone, FiMapPin, FiGithub, FiTwitter } from "react-icons/fi";
import { FaJava, FaReact, FaQq, FaDiscord } from "react-icons/fa6";
import { SiSpringboot, SiTypescript, SiApacheecharts, SiApache } from "react-icons/si";
import LogoLoop from "../../components/Motion/LogoLoop";

function AboutPage() {
  const techStack = [
    {
      id: "java",
      name: "Java",
      description: "后端核心开发语言",
      icon: <FaJava className="text-[#5382a1]" />
    },
    {
      id: "react",
      name: "React",
      description: "构建用户界面的 JavaScript 库",
      icon: <FaReact className="text-[#61dafb]" />
    },
    {
      id: "spring",
      name: "Spring Boot",
      description: "企业级应用开发框架",
      icon: <SiSpringboot className="text-[#6db33f]" />
    },
    {
      id: "ts",
      name: "TypeScript",
      description: "JavaScript 的超集",
      icon: <SiTypescript className="text-[#3178c6]" />
    },
    {
      id: "echarts",
      name: "ECharts",
      description: "数据可视化图表库",
      icon: <SiApacheecharts className="text-[#e4393c]" />
    },
    {
      id: "rocketmq",
      name: "RocketMQ",
      description: "分布式消息中间件",
      icon: <SiApache className="text-[#c71585]" />
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 overflow-x-hidden">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Content */}
        <div className="lg:flex-1 min-w-0 space-y-12 order-2 lg:order-1">
          {/* Product Intro */}
          <section className="space-y-6">
            <h2 className="text-2xl font-bold tracking-tight border-b pb-2 border-[var(--border-color)]">
              关于知识库小破站
            </h2>
            <div className="prose prose-sm dark:prose-invert max-w-none space-y-4 text-[var(--text-color-secondary)]">
              <p>
                知识库小破站是一个专为开发者打造的轻量化知识管理与分享平台。在这里，你可以将碎片化的代码片段、
                学习笔记、视频教程以及灵感想法进行结构化整理，构建属于自己的知识体系。
              </p>
              <p>
                项目起源于作者在日常开发中遇到的痛点：知识点散落在各个笔记软件、浏览器书签和本地文件中，
                难以统一检索和复用。于是，一个集文档管理、视频教程、工具导航于一体的个人知识库应运而生。
              </p>
              <h3 className="text-lg font-semibold text-[var(--text-color)] pt-2">核心亮点</h3>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <span className="font-medium text-[var(--text-color)]">双模式编辑</span>：支持富文本与 Markdown 无缝切换，满足不同场景的创作需求。
                </li>
                <li>
                  <span className="font-medium text-[var(--text-color)]">沉浸式阅读</span>：精心打磨的阅读体验，支持深色模式、目录导航与代码高亮。
                </li>
                <li>
                  <span className="font-medium text-[var(--text-color)]">全终端适配</span>：无论是桌面大屏还是移动端，都能获得流畅的访问体验。
                </li>
              </ul>
            </div>
          </section>

          {/* Tech Stack */}
          <section className="space-y-6">
            <h2 className="text-2xl font-bold tracking-tight border-b pb-2 border-[var(--border-color)]">
              技术栈一览
            </h2>
            <div className="py-4">
              <LogoLoop items={techStack} />
            </div>
          </section>

          {/* FAQ */}
          <section className="space-y-6">
            <h2 className="text-2xl font-bold tracking-tight border-b pb-2 border-[var(--border-color)]">
              常见问题
            </h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-[var(--primary-color)] mb-3 uppercase tracking-wider">
                  使用操作类
                </h3>
                <Accordion variant="splitted">
                  <AccordionItem key="1" aria-label="如何导入本地 Markdown 文件？" title="如何导入本地 Markdown 文件？">
                    在文档编辑器页面，直接将本地 .md 文件拖拽至编辑区域即可自动解析并导入内容。目前支持标准 Markdown 语法及部分扩展语法。
                  </AccordionItem>
                  <AccordionItem key="2" aria-label="支持哪些视频格式上传？" title="支持哪些视频格式上传？">
                    目前支持 MP4、WebM、MOV 等主流视频格式。上传后系统会自动进行转码处理，以适配不同终端的播放需求。
                  </AccordionItem>
                </Accordion>
              </div>
              
              <div>
                <h3 className="text-sm font-semibold text-[var(--primary-color)] mb-3 uppercase tracking-wider">
                  功能适配类
                </h3>
                <Accordion variant="splitted">
                  <AccordionItem key="3" aria-label="移动端可以使用编辑器吗？" title="移动端可以使用编辑器吗？">
                    可以。移动端编辑器针对触屏操作进行了优化，支持快捷工具栏和手势操作，但在复杂排版场景下，建议优先使用桌面端。
                  </AccordionItem>
                  <AccordionItem key="4" aria-label="如何开启深色模式？" title="如何开启深色模式？">
                    点击右上角的系统设置图标，在“主题风格”中选择“深色”或“跟随系统”。系统会自动记住您的偏好设置。
                  </AccordionItem>
                </Accordion>
              </div>
            </div>
          </section>
        </div>

        {/* Right Info */}
        <div className="w-full lg:w-[320px] lg:flex-none order-1 lg:order-2">
          <div className="sticky top-24 space-y-6">
            <Card className="p-6 space-y-6 bg-[var(--bg-elevated)] border border-[var(--border-color)]">
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="w-20 h-20 rounded-full bg-[var(--primary-color)] flex items-center justify-center text-3xl text-white font-bold">
                  博
                </div>
                <div>
                  <h3 className="text-xl font-bold">知库小站长</h3>
                  <p className="text-sm text-[var(--text-color-secondary)]">Full Stack Developer</p>
                </div>
                <p className="text-sm text-[var(--text-color-secondary)] leading-relaxed">
                  热爱技术，喜欢折腾。致力于探索更高效的知识管理方式，分享开发经验与技术见解。
                </p>
              </div>

              <div className="space-y-4 pt-4 border-t border-[var(--border-color)]">
                <div className="flex items-center gap-3 text-sm text-[var(--text-color-secondary)]">
                  <FiMail className="text-lg" />
                  <span>contact@example.com</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-[var(--text-color-secondary)]">
                  <FiPhone className="text-lg" />
                  <span>+86 123 4567 8901</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-[var(--text-color-secondary)]">
                  <FiMapPin className="text-lg" />
                  <span>China, Shenzhen</span>
                </div>
              </div>

              <div className="flex justify-center gap-4 pt-2">
                <Button isIconOnly variant="light" radius="full">
                  <FiGithub className="text-xl" />
                </Button>
                <Button isIconOnly variant="light" radius="full">
                  <FiTwitter className="text-xl" />
                </Button>
                <Button isIconOnly variant="light" radius="full">
                  <FaQq className="text-xl" />
                </Button>
                <Button isIconOnly variant="light" radius="full">
                  <FaDiscord className="text-xl" />
                </Button>
              </div>
            </Card>
            
            <div className="p-4 rounded-xl bg-[color-mix(in_srgb,var(--primary-color)_10%,transparent)] border border-[color-mix(in_srgb,var(--primary-color)_20%,transparent)]">
              <h4 className="font-semibold text-[var(--primary-color)] mb-2">项目开源</h4>
              <p className="text-xs text-[var(--text-color-secondary)] mb-3">
                本项目代码已在 GitHub 开源，欢迎 Star 和 Fork。
              </p>
              <Button size="sm" color="primary" className="w-full">
                前往 GitHub
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AboutPage;
