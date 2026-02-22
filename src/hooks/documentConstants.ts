/**
 * 文档管理模块常量定义
 * @module hooks/documentConstants
 * @description 定义文档管理相关的常量、枚举映射等
 */

import { PAGINATION } from "@/constants";

/** 文档状态类型 */
export type DocumentStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'offline' | 'scheduled' | 'published' | string;

/** 文档状态数字映射 */
export const DOCUMENT_STATUS_NUMBER_MAP: Record<number, { label: string; color: 'default' | 'warning' | 'success' | 'danger' | 'secondary' | 'primary' }> = {
  1: { label: '已发布', color: 'success' },
  2: { label: '已下架', color: 'secondary' },
  3: { label: '草稿', color: 'default' }
};

/** 审核状态类型 */
export type ReviewStatus = 'pending' | 'approved' | 'rejected';

/** 风险等级类型 */
export type RiskLevel = 'low' | 'medium' | 'high';

/** 上传状态类型 */
export type UploadStatus = 'waiting' | 'uploading' | 'success' | 'error';

/** 权限类型 */
export type PermissionType = 'public' | 'private' | 'password';

/** 每页显示条数 */
export const PAGE_SIZE = PAGINATION.DEFAULT_PAGE_SIZE;

/** 上传任务每页显示条数 */
export const UPLOAD_PAGE_SIZE = 5;

/** 文档分类选项 */
export const DOCUMENT_CATEGORIES = ['前端基础', '工程实践', '效率方法', '个人成长', '系统设计'] as const;

/** 文档状态映射 */
export const DOCUMENT_STATUS_MAP: Record<DocumentStatus, { label: string; color: 'default' | 'warning' | 'success' | 'danger' | 'secondary' | 'primary' }> = {
  draft: { label: '草稿', color: 'default' },
  pending: { label: '待审核', color: 'warning' },
  approved: { label: '已通过', color: 'success' },
  rejected: { label: '已驳回', color: 'danger' },
  offline: { label: '已下架', color: 'secondary' },
  scheduled: { label: '定时发布', color: 'primary' },
  published: { label: '已发布', color: 'primary' }
};

/** 审核状态映射 */
export const REVIEW_STATUS_MAP: Record<ReviewStatus, { label: string; color: 'warning' | 'success' | 'danger' }> = {
  pending: { label: '待审核', color: 'warning' },
  approved: { label: '已通过', color: 'success' },
  rejected: { label: '已驳回', color: 'danger' }
};

/** 风险等级映射 */
export const RISK_LEVEL_MAP: Record<RiskLevel, { label: string; color: 'default' | 'warning' | 'danger' }> = {
  low: { label: '低', color: 'default' },
  medium: { label: '中', color: 'warning' },
  high: { label: '高', color: 'danger' }
};

/** 上传状态映射 */
export const UPLOAD_STATUS_MAP: Record<UploadStatus, { label: string; color: 'default' | 'primary' | 'success' | 'danger' }> = {
  waiting: { label: '待上传', color: 'default' },
  uploading: { label: '上传中', color: 'primary' },
  success: { label: '已完成', color: 'success' },
  error: { label: '失败', color: 'danger' }
};

/** 允许上传的文件扩展名 */
export const ALLOWED_FILE_EXTENSIONS = ['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.md'] as const;

/** 最大文件大小（字节） */
export const MAX_FILE_SIZE = 100 * 1024 * 1024;

/** 默认封面图片路径 */
export const DEFAULT_COVER = '/DefaultImage/MyDefaultImage.jpg';

/**
 * 获取文档状态标签
 * @param status 文档状态
 * @returns 状态标签文本
 */
export function getDocumentStatusLabel(status: DocumentStatus | number): string {
  if (typeof status === 'number') {
    return DOCUMENT_STATUS_NUMBER_MAP[status]?.label ?? String(status);
  }
  return DOCUMENT_STATUS_MAP[status as Exclude<DocumentStatus, number>]?.label ?? status;
}

/**
 * 获取文档状态颜色
 * @param status 文档状态
 * @returns 状态颜色
 */
export function getDocumentStatusColor(status: DocumentStatus | number): 'default' | 'warning' | 'success' | 'danger' | 'secondary' | 'primary' {
  if (typeof status === 'number') {
    return DOCUMENT_STATUS_NUMBER_MAP[status]?.color ?? 'default';
  }
  return DOCUMENT_STATUS_MAP[status as Exclude<DocumentStatus, number>]?.color ?? 'default';
}

/**
 * 获取审核状态标签
 * @param status 审核状态
 * @returns 状态标签文本
 */
export function getReviewStatusLabel(status: ReviewStatus): string {
  return REVIEW_STATUS_MAP[status]?.label ?? '未知';
}

/**
 * 获取风险等级标签
 * @param level 风险等级
 * @returns 风险等级标签
 */
export function getRiskLevelLabel(level: RiskLevel): string {
  return RISK_LEVEL_MAP[level]?.label ?? '未知';
}

/**
 * 获取风险等级颜色
 * @param level 风险等级
 * @returns 风险等级颜色
 */
export function getRiskLevelColor(level: RiskLevel): 'default' | 'warning' | 'danger' {
  return RISK_LEVEL_MAP[level]?.color ?? 'default';
}

/**
 * 获取上传状态标签
 * @param status 上传状态
 * @returns 状态标签文本
 */
export function getUploadStatusLabel(status: UploadStatus): string {
  return UPLOAD_STATUS_MAP[status]?.label ?? '未知';
}

/**
 * 获取上传状态颜色
 * @param status 上传状态
 * @returns 状态颜色
 */
export function getUploadStatusColor(status: UploadStatus): 'default' | 'primary' | 'success' | 'danger' {
  return UPLOAD_STATUS_MAP[status]?.color ?? 'default';
}
