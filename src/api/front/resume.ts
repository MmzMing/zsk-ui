/**
 * 简历相关 API
 * @module api/front/resume
 */

import { request } from "../request";

export type BasicInfo = {
  name?: string;
  jobIntention?: string;
  age?: string;
  gender?: string;
  city?: string;
  phone?: string;
  email?: string;
  github?: string;
  summary?: string;
  avatar?: string;
  experience?: string;
  salary?: string;
  politics?: string;
  status?: string;
};

export type ResumeModule = {
  id: string;
  type: "basic" | "content";
  title: string;
  icon: string;
  isDeletable: boolean;
  isVisible: boolean;
  data?: BasicInfo;
  content?: string;
};

export const fetchResumeDetail = async (): Promise<{
  code: number;
  msg: string;
  data: ResumeModule[];
}> => {
  const data = await request.get<ResumeModule[]>("/system/resume/detail");
  return { code: 200, msg: "success", data };
};

export const saveResume = async (
  modules: ResumeModule[]
): Promise<{ code: number; msg: string; data: null }> => {
  await request.post<null>("/system/resume/save", modules);
  return { code: 200, msg: "success", data: null };
};
