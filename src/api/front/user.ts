import { request } from "../axios";

export type UserProfile = {
  id: string;
  username: string;
  name: string;
  avatar: string;
  bio: string;
  location?: string;
  website?: string;
  stats: {
    followers: number;
    following: number;
    works: number;
    likes: number;
  };
  isFollowing: boolean;
};

export async function fetchUserProfile(id: string) {
  return request.get<UserProfile>(`/user/profile/${id}`);
}

export async function updateUserProfile(data: Partial<UserProfile>) {
  return request.post<UserProfile>("/user/profile/update", data);
}

export async function toggleFollowUser(id: string) {
  return request.post<{ isFollowing: boolean }>(`/user/follow/${id}`);
}

export type UserWorkItem = {
  id: string;
  type: "video" | "article";
  title: string;
  coverUrl: string;
  views: number;
  createdAt: string;
};

export async function fetchUserWorks(
  id: string,
  params: { page: number; pageSize: number; type?: string }
) {
  return request.get<{ list: UserWorkItem[]; total: number }>(
    `/user/works/${id}`,
    { params }
  );
}
