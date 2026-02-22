/**
 * 文档表单状态管理 Hook
 * @module hooks/useDocumentForm
 * @description 提供文档表单的状态管理、验证等功能
 */

import { useState, useCallback, useMemo } from 'react';
import type { DocNote } from '@/api/admin/document';

/** 文档表单数据类型 */
export interface DocumentFormData {
  title: string;
  content: string;
  category: string;
  description: string;
  tags: string[];
  cover: string;
  seo: {
    title: string;
    description: string;
    keywords: string[];
  };
  pinned: boolean;
  recommended: boolean;
}

/** 表单验证结果 */
export interface FormValidation {
  isValid: boolean;
  errors: Record<string, string>;
}

/** useDocumentForm 配置参数 */
interface UseDocumentFormOptions {
  /** 初始数据 */
  initialData?: Partial<DocumentFormData>;
  /** 标题最大长度 */
  maxTitleLength?: number;
  /** 描述最大长度 */
  maxDescriptionLength?: number;
}

/** useDocumentForm 返回值 */
interface UseDocumentFormReturn {
  /** 表单数据 */
  formData: DocumentFormData;
  /** 设置表单数据 */
  setFormData: React.Dispatch<React.SetStateAction<DocumentFormData>>;
  /** 更新单个字段 */
  updateField: <K extends keyof DocumentFormData>(key: K, value: DocumentFormData[K]) => void;
  /** 更新 SEO 数据 */
  updateSeo: (seo: Partial<DocumentFormData['seo']>) => void;
  /** 重置表单 */
  resetForm: () => void;
  /** 从文档详情加载数据 */
  loadFromDocument: (doc: DocNote) => void;
  /** 表单验证 */
  validate: () => FormValidation;
  /** 是否已修改 */
  isDirty: boolean;
  /** 标题字数统计 */
  titleLength: number;
  /** 描述字数统计 */
  descriptionLength: number;
}

/** 默认表单数据 */
const DEFAULT_FORM_DATA: DocumentFormData = {
  title: '',
  content: '',
  category: '未分类',
  description: '',
  tags: [],
  cover: '',
  seo: { title: '', description: '', keywords: [] },
  pinned: false,
  recommended: false
};

/**
 * 文档表单状态管理 Hook
 * @param options 配置参数
 * @returns 表单状态与操作方法
 * @example
 * ```tsx
 * const { formData, updateField, validate, isDirty } = useDocumentForm();
 *
 * updateField('title', '新标题');
 * const { isValid, errors } = validate();
 * ```
 */
export function useDocumentForm(options: UseDocumentFormOptions = {}): UseDocumentFormReturn {
  const { initialData, maxTitleLength = 100, maxDescriptionLength = 500 } = options;

  const [formData, setFormData] = useState<DocumentFormData>({
    ...DEFAULT_FORM_DATA,
    ...initialData
  });

  const [originalData] = useState(() => JSON.stringify(formData));

  /** 更新单个字段 */
  const updateField = useCallback(<K extends keyof DocumentFormData>(key: K, value: DocumentFormData[K]) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  }, []);

  /** 更新 SEO 数据 */
  const updateSeo = useCallback((seo: Partial<DocumentFormData['seo']>) => {
    setFormData(prev => ({
      ...prev,
      seo: { ...prev.seo, ...seo }
    }));
  }, []);

  /** 重置表单 */
  const resetForm = useCallback(() => {
    setFormData(DEFAULT_FORM_DATA);
  }, []);

  /** 从文档详情加载数据 */
  const loadFromDocument = useCallback((doc: DocNote) => {
    setFormData({
      title: doc.title || '',
      content: doc.content || '',
      category: doc.category || '未分类',
      description: '',
      tags: doc.tags || [],
      cover: doc.cover || '',
      seo: doc.seo || { title: '', description: '', keywords: [] },
      pinned: false,
      recommended: false
    });
  }, []);

  /** 表单验证 */
  const validate = useCallback((): FormValidation => {
    const errors: Record<string, string> = {};

    if (!formData.title.trim()) {
      errors.title = '请输入文档标题';
    } else if (formData.title.length > maxTitleLength) {
      errors.title = `标题不能超过 ${maxTitleLength} 个字符`;
    }

    if (formData.description.length > maxDescriptionLength) {
      errors.description = `描述不能超过 ${maxDescriptionLength} 个字符`;
    }

    if (formData.category === '未分类' || !formData.category) {
      errors.category = '请选择文档分类';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }, [formData, maxTitleLength, maxDescriptionLength]);

  /** 是否已修改 */
  const isDirty = useMemo(() => {
    return JSON.stringify(formData) !== originalData;
  }, [formData, originalData]);

  /** 标题字数统计 */
  const titleLength = formData.title.length;

  /** 描述字数统计 */
  const descriptionLength = formData.description.length;

  return {
    formData,
    setFormData,
    updateField,
    updateSeo,
    resetForm,
    loadFromDocument,
    validate,
    isDirty,
    titleLength,
    descriptionLength
  };
}

export default useDocumentForm;
