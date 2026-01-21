import React, { useMemo } from "react";
import ScrollFloat from "../../../components/Motion/ScrollFloat";
import Masonry from "../../../components/Motion/Masonry";
import type { HomeReview } from "../../../api/front/home";

type Props = {
  reviews: HomeReview[];
};

export default function ReviewSection({ reviews }: Props) {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const displayReviews = useMemo(() => {
    if (isMobile) {
      return reviews.slice(0, 3);
    }
    return reviews;
  }, [reviews, isMobile]);

  const masonryItems = useMemo(
    () =>
      displayReviews.map(item => ({
        id: item.id,
        height: isMobile ? 320 : 260,
        content: (
          <div
            className="relative rounded-[var(--radius-base)] border border-[color-mix(in_srgb,var(--border-color)_90%,transparent)] bg-[color-mix(in_srgb,var(--bg-elevated)_97%,black_3%)] px-4 py-3 md:px-5 md:py-4 shadow-[0_10px_25px_rgba(15,23,42,0.45)]/40 overflow-hidden transition-transform duration-150 hover:-translate-y-0.5 h-full flex flex-col"
          >
            <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-emerald-400/0 via-emerald-400/60 to-sky-400/0" />
            <div className="flex items-start gap-3 flex-1 min-h-0">
              <div className="mt-0.5 h-8 w-8 rounded-full bg-[color-mix(in_srgb,var(--primary-color)_16%,black_84%)] flex items-center justify-center text-xs font-medium text-[var(--primary-color)] shrink-0">
                {item.name.slice(0, 1)}
              </div>
              <div className="flex-1 min-w-0 flex flex-col h-full">
                <div className="flex items-center justify-between gap-2 shrink-0">
                  <div className="min-w-0">
                    <div className="text-xs font-medium truncate">
                      {item.name}
                    </div>
                    <div className="text-[10px] text-[var(--text-color-secondary)] truncate">
                      {item.role}
                    </div>
                  </div>
                  <div className="text-right text-[10px] text-[var(--text-color-secondary)] shrink-0">
                    <div className="truncate">{item.source}</div>
                    <div>{item.date}</div>
                  </div>
                </div>
                <p className={`mt-2 text-xs leading-relaxed text-[var(--text-color-secondary)] ${isMobile ? "" : "line-clamp-3"}`}>
                  {item.content}
                </p>
              </div>
            </div>
          </div>
        )
      })),
    [displayReviews, isMobile]
  );

  return (
    <section className={`${isMobile ? "py-10" : "min-h-screen"} flex flex-col justify-center space-y-10 px-[var(--content-padding)] overflow-hidden`}>
      <div className="max-w-6xl mx-auto w-full flex flex-col items-center space-y-3">
        <ScrollFloat
          containerClassName="text-lg md:text-xl font-semibold"
          textClassName="tracking-tight"
        >
          以下是各大网友对我的评价
        </ScrollFloat>
      </div>
      <div className="mt-6 md:mt-8 max-w-6xl mx-auto w-full">
        {isMobile ? (
          <div className="flex flex-col gap-4">
            {masonryItems.map(item => (
              <div key={item.id} className="w-full">
                {item.content}
              </div>
            ))}
          </div>
        ) : (
          <Masonry items={masonryItems} />
        )}
      </div>
    </section>
  );
}
