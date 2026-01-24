import { request } from "../axios";

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

export function fetchHomeVideos() {
  return request.get<HomeVideo[]>("/home/videos");
}

export function fetchHomeArticles() {
  return request.get<HomeArticle[]>("/home/articles");
}

export function fetchHomeReviews() {
  return request.get<HomeReview[]>("/home/reviews");
}

export function fetchHomeSlides() {
  return request.get<HomeSlide[]>("/home/slides");
}
