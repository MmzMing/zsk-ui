import React, { useCallback, useEffect, useMemo, useState, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchHomeArticles,
  fetchHomeReviews,
  fetchHomeVideos,
  type HomeArticle,
  type HomeReview,
  type HomeVideo
} from "../../api/front/home";
import { mockHomeVideos, mockHomeArticles, mockHomeReviews } from "../../api/mock/front/home";
import { routes } from "../../router/routes";
import HomeBanner from "./components/HomeBanner";
import { LazyLoadWrapper } from "../../components/LazyLoadWrapper";
import { Loading } from "../../components/Loading";

const VideoRecommend = React.lazy(() => import("./components/VideoRecommend"));
const HomeFeatures = React.lazy(() => import("./components/HomeFeatures"));
const ArticleRecommendSection = React.lazy(() =>
  import("./components/ArticleRecommendSection")
);
const ReviewSection = React.lazy(() => import("./components/ReviewSection"));

function HomePage() {
  const navigate = useNavigate();
  const [videos, setVideos] = useState<HomeVideo[]>(() => mockHomeVideos);

  const [articles, setArticles] = useState<HomeArticle[]>(() => mockHomeArticles);

  const [reviews, setReviews] = useState<HomeReview[]>(() => mockHomeReviews);

  const [activeArticleId, setActiveArticleId] = useState(
    () => articles[0]?.id
  );

  const activeArticle = useMemo(
    () => articles.find(item => item.id === activeArticleId) ?? articles[0],
    [articles, activeArticleId]
  );

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "auto"
    });
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadHomeData() {
      try {
        const [remoteVideos, remoteArticles, remoteReviews] =
          await Promise.all([
            fetchHomeVideos(),
            fetchHomeArticles(),
            fetchHomeReviews()
          ]);

        if (cancelled) {
          return;
        }

        if (remoteVideos && remoteVideos.length > 0) {
          setVideos(remoteVideos);
        } else {
          // If empty, keep mock data (initial state already has mock)
          console.log("Videos empty, using mock");
        }
        if (remoteArticles && remoteArticles.length > 0) {
          setArticles(remoteArticles);
          if (!activeArticleId) {
            setActiveArticleId(remoteArticles[0]?.id);
          }
        } else {
          console.log("Articles empty, using mock");
        }
        if (remoteReviews && remoteReviews.length > 0) {
          setReviews(remoteReviews);
        } else {
          console.log("Reviews empty, using mock");
        }
      } catch (error) {
        console.error("加载首页推荐数据失败", error);
      }
    }

    loadHomeData();

    return () => {
      cancelled = true;
    };
  }, [activeArticleId]);

  const handleArticleClick = useCallback(
    (id: string) => {
      navigate(routes.docDetail.replace(":id", id));
    },
    [navigate]
  );

  const handleArticleChange = useCallback((id: string) => {
    setActiveArticleId(id);
  }, []);

  const handleArticleNavigate = useCallback(
    (id: string) => {
      handleArticleClick(id);
    },
    [handleArticleClick]
  );

  return (
    <div className="min-h-screen relative">
      <div className="relative z-10">
        <HomeBanner />

        {/* Opaque Content Block with Stepped Transitions */}
        <div 
          className="relative bg-[var(--bg-elevated)] pt-40 pb-40 mt-12 md:mt-24"
          style={{
          clipPath: `polygon(
            0% 0%,
            calc(55% - 80px) 0%,
            calc(55% - 80px) 80px,
            calc(75% - 40px) 80px,
            calc(75% - 40px) 120px,
            75% 120px,
            75% 160px,
            100% 160px,
            100% 100%,
            calc(45% + 80px) 100%, 
            calc(45% + 80px) calc(100% - 80px), 
            calc(25% + 40px) calc(100% - 80px), 
            calc(25% + 40px) calc(100% - 120px), 
            25% calc(100% - 120px), 
            25% calc(100% - 160px), 
            0% calc(100% - 160px)
          )`
        }}
        >
          
          <LazyLoadWrapper minHeight="400px" rootMargin="800px" className="relative">
            <Suspense fallback={<Loading height="400px" />}>
              <VideoRecommend items={videos} />
            </Suspense>
          </LazyLoadWrapper>

          <LazyLoadWrapper minHeight="500px" rootMargin="800px" className="relative">
            <Suspense fallback={<Loading height="500px" />}>
              <HomeFeatures />
            </Suspense>
          </LazyLoadWrapper>

          <LazyLoadWrapper minHeight="600px" rootMargin="800px" className="relative">
            <Suspense fallback={<Loading height="600px" />}>
              <ArticleRecommendSection
                articles={articles}
                activeArticle={activeArticle}
                onArticleChange={handleArticleChange}
                onArticleNavigate={handleArticleNavigate}
              />
            </Suspense>
          </LazyLoadWrapper>
        </div>

        <LazyLoadWrapper minHeight="400px" rootMargin="800px" className="relative">
          <Suspense fallback={<Loading height="400px" />}>
            <ReviewSection reviews={reviews} />
          </Suspense>
        </LazyLoadWrapper>
      </div>
    </div>
  );
}

export default HomePage;
