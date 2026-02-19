/**
 * 首页相关 API
 * @module api/front/home
 */

import { request } from "../request";

export const DEFAULT_ARTICLE_COVER = "/DefaultImage/MyDefaultImage.jpg";

export type VideoSource = {
  src: string;
  type: string;
};

export type Subtitle = {
  src: string;
  label: string;
  lang: string;
  default?: boolean;
};

export type HomeVideo = {
  id: string;
  category: string;
  duration: string;
  title: string;
  description?: string;
  views: string;
  likes?: number;
  comments?: number;
  date: string;
  cover?: string;
  sources?: string | VideoSource[];
  subtitles?: Subtitle[];
};

export type HomeArticle = {
  id: string;
  category: string;
  title: string;
  date: string;
  summary: string;
  views: string;
  author?: string;
  cover?: string;
};

export type HomeReview = {
  id: string;
  name: string;
  role: string;
  source: string;
  date: string;
  content: string;
  tone: string;
};

export type FeatureCard = {
  title: string;
  description: string;
  tag: string;
};

export type HomeSlide = {
  id: string;
  tag: string;
  title: string;
  description: string;
  features: FeatureCard[];
  featureList: FeatureCard[];
  previewType: "kanban" | "list" | "profile";
};

export async function fetchHomeVideos(): Promise<HomeVideo[]> {
  return request.get<HomeVideo[]>("/home/videos");
}

export async function fetchHomeArticles(): Promise<HomeArticle[]> {
  return request.get<HomeArticle[]>("/home/articles");
}

export async function fetchHomeReviews(): Promise<HomeReview[]> {
  return request.get<HomeReview[]>("/home/reviews");
}

export async function fetchHomeSlides(): Promise<HomeSlide[]> {
  return request.get<HomeSlide[]>("/home/slides");
}

export async function fetchHomeData(): Promise<{
  videos: HomeVideo[];
  articles: HomeArticle[];
  reviews: HomeReview[];
  slides: HomeSlide[];
}> {
  return request.get("/home/data");
}
