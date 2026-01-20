import { request } from "../axios";

export type HomeVideo = {
  id: string;
  title: string;
  views: string;
  date: string;
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

export function fetchHomeVideos() {
  return request.get<HomeVideo[]>("/home/videos");
}

export function fetchHomeArticles() {
  return request.get<HomeArticle[]>("/home/articles");
}

export function fetchHomeReviews() {
  return request.get<HomeReview[]>("/home/reviews");
}
