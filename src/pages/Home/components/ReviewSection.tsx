/**
 * 评价展示组件
 * @module pages/Home/components/ReviewSection
 * @description 首页用户评价展示区域，使用跑马灯效果展示评价内容
 */

import React from "react";
import { FaStar } from "react-icons/fa";
import { fetchHomeReviews, type HomeReview } from "@/api/front/home";
import ScrollFloat from "@/components/Motion/ScrollFloat";
import { Marquee } from "@/components/ui/marquee";
import { cn } from "@/utils";
import { useAsyncList } from "@/hooks";

// ===== 2. TODO待处理导入区域 =====

// ===== 3. 状态控制逻辑区域 =====

// ===== 4. 通用工具函数区域 =====
/**
 * 评价卡片组件
 * @param name 用户名
 * @param date 日期
 * @param body 评价内容
 * @param source 来源
 */
const ReviewCard = ({
  name,
  date,
  body,
  source,
}: {
  name: string;
  date: string;
  body: string;
  source: string;
}) => {
  return (
    <figure
      className={cn(
        "relative w-[340px] cursor-pointer overflow-hidden rounded-xl border p-6 flex flex-col gap-2 transition-all duration-300",
        "border-zinc-800 bg-transparent hover:border-zinc-700",
        "h-fit min-h-[160px]"
      )}
    >
      <div className="flex flex-col gap-1">
        <figcaption className="text-[15px] font-medium text-[var(--primary-color)] leading-tight">
          {name}
        </figcaption>
        <div className="flex items-center gap-1.5 mt-1">
          <div className="flex text-[#f59e0b] text-[10px]">
            {[...Array(5)].map((_, i) => (
              <FaStar key={i} />
            ))}
          </div>
          <span className="text-[11px] text-zinc-500 font-medium">5.00</span>
          <span className="text-[11px] text-zinc-500">{date}</span>
        </div>
      </div>
      <blockquote className="mt-2 text-[13px] leading-relaxed text-zinc-200">
        "{body}"
      </blockquote>
      <div className="mt-auto pt-4">
        <span className="text-[13px] font-bold text-[var(--primary-color)] opacity-90 lowercase">
          {source || "upwork"}
        </span>
      </div>
    </figure>
  );
};

// ===== 5. 注释代码函数区 =====

// ===== 6. 错误处理函数区域 =====

// ===== 7. 数据处理函数区域 =====

// ===== 8. UI渲染逻辑区域 =====

// ===== 9. 页面初始化与事件绑定 =====

// ===== 10. TODO任务管理区域 =====

// ===== 11. 导出区域 =====
/**
 * 评价展示区域组件
 */
export default function ReviewSection() {
  // ===== 使用共享 Hook 加载评价列表 =====
  const { list: reviewList } = useAsyncList(fetchHomeReviews, { delay: 0 });

  // ===== 数据处理 =====
  /** 第一行评价 */
  const firstRow = reviewList.slice(0, Math.ceil(reviewList.length / 2));
  /** 第二行评价 */
  const secondRow = reviewList.slice(Math.ceil(reviewList.length / 2));

  // ===== UI渲染 =====
  return (
    <section className="dark relative flex min-h-[600px] w-full flex-col items-center justify-center overflow-hidden py-24 bg-transparent">
      <div className="mb-16 flex flex-col items-center space-y-3 z-10">
        <ScrollFloat
          containerClassName="text-2xl md:text-3xl font-bold text-white"
          textClassName="tracking-tight"
        >
          以下是各大网友对我的评价
        </ScrollFloat>
      </div>

      <div className="flex flex-col gap-6 w-full [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
        <Marquee
          pauseOnHover
          className="[--duration:20s] [--gap:1.5rem]"
          repeat={4}
        >
          {firstRow.map((review: HomeReview) => (
            <ReviewCard
              key={review.id}
              name={review.name}
              date={review.date}
              body={review.content}
              source={review.source}
            />
          ))}
        </Marquee>
        <Marquee
          reverse
          pauseOnHover
          className="[--duration:25s] [--gap:1.5rem]"
          repeat={4}
        >
          {secondRow.map((review: HomeReview) => (
            <ReviewCard
              key={review.id}
              name={review.name}
              date={review.date}
              body={review.content}
              source={review.source}
            />
          ))}
        </Marquee>
      </div>
    </section>
  );
}
