/**
 * 关于页面
 * @module pages/About
 * @description 网站关于页面，展示技术栈、FAQ等信息
 */

import React, { useEffect, useState, useCallback } from "react";
import { 
  Accordion, 
  AccordionItem, 
  Button, 
  Avatar
} from "@heroui/react";
import { CardContainer, CardBody, CardItem } from "@/components/Aceternity/ThreeDCard";
import { 
  FiMail, 
  FiPhone, 
  FiMapPin, 
  FiGithub, 
  FiTwitter 
} from "react-icons/fi";
import { 
  FaJava, 
  FaReact, 
  FaDocker, 
  FaQq, 
  FaDiscord 
} from "react-icons/fa6";
import { 
  SiSpring, 
  SiTypescript, 
  SiMysql, 
  SiRedis, 
  SiApacherocketmq 
} from "react-icons/si";
import LogoLoop from "@/components/Motion/LogoLoop";
import Loading from "@/components/Loading";
import { 
  fetchTechStack, 
  fetchFAQ, 
  type TechStackItem, 
  type FAQCategory 
} from "@/api/front/about";

// ===== 2. TODO待处理导入区域 =====

// ===== 3. 状态控制逻辑区域 =====
/**
 * 关于页面组件
 */
function AboutPage() {
  /** 技术栈列表 */
  const [techStack, setTechStack] = useState<TechStackItem[]>([]);
  /** FAQ 列表 */
  const [faqList, setFaqList] = useState<FAQCategory[]>([]);
  /** 页面加载状态 */
  const [isLoading, setIsLoading] = useState(true);

  // ===== 4. 通用工具函数区域 =====

  /**
   * 获取技术栈图标
   * @param id 技术栈ID
   * @returns 图标组件
   */
  const getTechIcon = (id: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      java: <FaJava className="text-[#5382a1]" />,
      mysql: <SiMysql className="text-[#4479a1]" />,
      redis: <SiRedis className="text-[#dc382d]" />,
      spring: <SiSpring className="text-[#6db33f]" />,
      docker: <FaDocker className="text-[#2496ed]" />,
      rocketmq: <SiApacherocketmq className="text-[#d42029]" />,
      react: <FaReact className="text-[#61dafb]" />,
      ts: <SiTypescript className="text-[#3178c6]" />
    };
    return iconMap[id] || null;
  };

  // ===== 5. 注释代码函数区 =====

  // ===== 6. 错误处理函数区域 =====

  // ===== 7. 数据处理函数区域 =====
  /**
   * 获取页面初始化数据
   */
  const handleFetchInitData = useCallback(async (getIgnore: () => boolean) => {
    try {
      const [techRes, faqRes] = await Promise.all([
        fetchTechStack(),
        fetchFAQ()
      ]);
      if (getIgnore()) return;
      setTechStack(techRes);
      setFaqList(faqRes);
    } finally {
      if (!getIgnore()) setIsLoading(false);
    }
  }, []);

  // ===== 8. UI渲染逻辑区域 =====
  /**
   * 渲染技术栈区域
   */
  const renderTechStack = () => {
    const itemsWithIcons = techStack.map(item => ({
      ...item,
      icon: getTechIcon(item.id)
    }));

    return (
      <section className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight border-b pb-2 border-[var(--border-color)]">
          技术栈一览
        </h2>
        <div className="py-4 min-h-[100px] flex items-center justify-center">
          {isLoading ? (
            <Loading />
          ) : techStack.length > 0 ? (
            <LogoLoop items={itemsWithIcons} />
          ) : (
            <div className="text-sm text-[var(--text-color-secondary)]">暂无技术栈信息</div>
          )}
        </div>
      </section>
    );
  };

  /**
   * 渲染 FAQ 区域
   */
  const renderFAQ = () => {
    return (
      <section className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight border-b pb-2 border-[var(--border-color)]">
          常见问题
        </h2>
        <div className="min-h-[200px] flex items-center justify-center">
          {isLoading ? (
            <Loading />
          ) : faqList.length > 0 ? (
            <div className="w-full space-y-6">
              {faqList.map((category, index) => (
                <div key={index} className="w-full">
                  <h3 className="text-sm font-semibold text-[var(--primary-color)] mb-3 uppercase tracking-wider">
                    {category.title}
                  </h3>
                  <Accordion variant="splitted">
                    {category.items.map(faq => (
                      <AccordionItem 
                        key={faq.id} 
                        aria-label={faq.question} 
                        title={faq.question}
                      >
                        {faq.answer}
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-[var(--text-color-secondary)]">暂无常见问题</div>
          )}
        </div>
      </section>
    );
  };

  // ===== 9. 页面初始化与事件绑定 =====
  useEffect(() => {
    let ignore = false;
    const timer = setTimeout(() => {
      setIsLoading(true);
      handleFetchInitData(() => ignore);
    }, 0);
    return () => {
      ignore = true;
      clearTimeout(timer);
    };
  }, [handleFetchInitData]);

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 overflow-x-hidden">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* 左侧内容 */}
        <div className="lg:flex-1 min-w-0 space-y-12 order-2 lg:order-1">
          {/* 产品介绍 */}
          <section className="space-y-6">
            <h2 className="text-2xl font-bold tracking-tight border-b pb-2 border-[var(--border-color)]">
              关于知识库小破站
            </h2>
            <div className="prose prose-sm dark:prose-invert max-w-none space-y-4 text-[var(--text-color-secondary)]">
              <h3 className="text-lg font-semibold text-[var(--text-color)] pt-2">关于</h3>
              <p>
                知识库小破站是一个专为开发者打造的轻量化知识管理与分享平台。在这里，你可以将碎片化的代码片段、
                学习笔记、视频教程以及灵感想法进行结构化整理，构建属于自己的知识体系。
              </p>
              <p>
                项目起源于作者在日常开发中遇到的痛点：知识点散落在各个笔记软件、浏览器书签和本地文件中，
                难以统一检索和复用。于是，一个集文档管理、视频教程、工具导航于一体的个人知识库应运而生。
              </p>
              <p>目前小破站只开发了前台页面、后台管理、登录注册功能，后端接口仍在完善中。后端接口较大，站长能力有限展示页面只有mock数据，暂未部署。</p>
              <p>想看后台的可以在登录界面，账号密码没限制，输入验证码"123456"，即可登录后台管理系统。</p>

              <h3 className="text-lg font-semibold text-[var(--text-color)] pt-2">已部署QQ机器人</h3>
                <ul className="list-disc pl-5 space-y-2">
                <li>
                  <span className="font-medium text-[var(--text-color)]">识库查询</span>：用户可以通过QQ机器人查询知识库中的内容，包括文档、视频教程、工具导航等。
                </li>
                <li>
                  <span className="font-medium text-[var(--text-color)]">知识库管理</span>：用户可以通过QQ机器人管理知识库，包括添加、删除、修改知识库中的内容。
                </li>
                <li>
                  <span className="font-medium text-[var(--text-color)]">知识库分享</span>：用户可以通过QQ机器人分享知识库中的内容，包括文档、视频教程、工具导航等。
                </li>
                <li>
                  <span className="font-medium text-[var(--text-color)]">更多功能</span>：对接多个mcp，200+API接口
                </li>
              </ul>
              <p>想了解更多可以联系站长。</p>
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

          {/* 技术栈 */}
          {renderTechStack()}

          {/* FAQ */}
          {renderFAQ()}
        </div>

        {/* 右侧信息 */}
        <div className="w-full lg:w-[320px] lg:flex-none order-1 lg:order-2">
          <div className="sticky top-24 space-y-6">
            <CardContainer className="inter-var">
              <CardBody className="p-6 space-y-6 bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded-large shadow-medium h-auto w-full group/card">
                <CardItem translateZ="50" className="flex flex-col items-center text-center space-y-3 w-full">
                  <Avatar 
                    src="/Avatar/MyAvatar.jpg"
                    name="博"
                    className="w-20 h-20 text-3xl"
                    classNames={{
                      base: "bg-[var(--primary-color)]",
                      name: "font-bold text-white"
                    }}
                  />
                  <div>
                    <h3 className="text-xl font-bold">知库小站长</h3>
                    <p className="text-sm text-[var(--text-color-secondary)]">Full Stack Developer</p>
                  </div>
                  <CardItem translateZ="60" as="p" className="text-sm text-[var(--text-color-secondary)] leading-relaxed">
                    一位不知名的JAVA后端开发者，热爱技术，喜欢折腾AI-BOT。致力于探索更高效的知识管理方式，分享开发经验与技术见解。
                  </CardItem>
                </CardItem>

                <CardItem translateZ="40" className="space-y-4 pt-4 border-t border-[var(--border-color)] w-full">
                  <div className="flex items-center gap-3 text-sm text-[var(--text-color-secondary)]">
                    <FiMail className="text-lg" />
                    <span>784774835@qq.com</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-[var(--text-color-secondary)]">
                    <FiPhone className="text-lg" />
                    <span>+86 xxx-xxxx-xxxx</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-[var(--text-color-secondary)]">
                    <FiMapPin className="text-lg" />
                    <span>China, GuangZhou</span>
                  </div>
                </CardItem>

                <CardItem translateZ="100" className="flex justify-center gap-4 pt-2 w-full">
                  <Button
                    isIconOnly
                    variant="light"
                    radius="full"
                    className="text-xl"
                    as="a"
                    href="https://github.com/MmzMing/zsk-ui"
                    target="_blank"
                  >
                    <FiGithub />
                  </Button>
                  <Button
                    isIconOnly
                    variant="light"
                    radius="full"
                    className="text-xl"
                  >
                    <FiTwitter />
                  </Button>
                  <Button
                    isIconOnly
                    variant="light"
                    radius="full"
                    className="text-xl"
                  >
                    <FaQq />
                  </Button>
                  <Button
                    isIconOnly
                    variant="light"
                    radius="full"
                    className="text-xl"
                  >
                    <FaDiscord />
                  </Button>
                </CardItem>
              </CardBody>
            </CardContainer>
            
            <div className="p-4 rounded-xl bg-[color-mix(in_srgb,var(--primary-color)_10%,transparent)] border border-[color-mix(in_srgb,var(--primary-color)_20%,transparent)]">
              <h4 className="font-semibold text-[var(--primary-color)] mb-2">项目开源</h4>
              <p className="text-xs text-[var(--text-color-secondary)] mb-3">
                本项目代码已在 GitHub 开源，欢迎 Star 和 Fork。
              </p>
              <Button 
                size="sm" 
                color="primary" 
                className="w-full"
                as="a"
                href="https://github.com/MmzMing/zsk-ui"
                target="_blank"
              >
                前往 GitHub
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ===== 10. TODO任务管理区域 =====

// ===== 11. 导出区域 =====
export default AboutPage;
