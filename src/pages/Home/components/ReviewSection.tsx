import React from "react";
import ScrollFloat from "../../../components/Motion/ScrollFloat";
import { Marquee } from "../../../components/ui/marquee";
import { cn } from "../../../lib/utils";
import type { HomeReview } from "../../../api/front/home";
import { FaStar } from "react-icons/fa";

type Props = {
  reviews: HomeReview[];
};

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
        // 随机高度模拟不规则感 (通过内容长度自然形成)
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

export default function ReviewSection({ reviews }: Props) {
  const firstRow = reviews.slice(0, Math.ceil(reviews.length / 2));
  const secondRow = reviews.slice(Math.ceil(reviews.length / 2));

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
        <Marquee pauseOnHover className="[--duration:20s] [--gap:1.5rem]" repeat={4}>
          {firstRow.map((review) => (
            <ReviewCard
              key={review.id}
              name={review.name}
              date={review.date}
              body={review.content}
              source={review.source}
            />
          ))}
        </Marquee>
        <Marquee reverse pauseOnHover className="[--duration:25s] [--gap:1.5rem]" repeat={4}>
          {secondRow.map((review) => (
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

