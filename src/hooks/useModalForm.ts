/**
 * 表单弹窗管理 Hook
 * @module hooks/useModalForm
 * @description 提供表单弹窗状态管理，支持新增、编辑模式切换，表单状态管理等功能
 */

import { useState, useCallback } from "react";

/**
 * 表单模式类型
 */
type FormMode = "create" | "edit";

/**
 * 表单弹窗配置参数
 */
interface UseModalFormOptions<T> {
  /** 创建空表单的工厂函数 */
  createEmptyForm: () => T;
  /** 表单提交回调 */
  onSubmit?: (data: T, mode: FormMode) => Promise<void> | void;
}

/**
 * 表单弹窗返回值
 */
interface UseModalFormReturn<T> {
  /** 弹窗是否可见 */
  visible: boolean;
  /** 设置弹窗可见性 */
  setVisible: (visible: boolean) => void;
  /** 表单数据 */
  formData: T | null;
  /** 设置表单数据 */
  setFormData: (data: T | null) => void;
  /** 当前表单模式 */
  mode: FormMode;
  /** 是否为编辑模式 */
  isEditMode: boolean;
  /** 表单错误信息 */
  formError: string;
  /** 设置表单错误信息 */
  setFormError: (error: string) => void;
  /** 是否正在提交 */
  submitting: boolean;
  /** 打开新增弹窗 */
  openCreate: () => void;
  /** 打开编辑弹窗 */
  openEdit: (data: T) => void;
  /** 关闭弹窗 */
  close: () => void;
  /** 更新表单字段 */
  updateField: <K extends keyof T>(key: K, value: T[K]) => void;
  /** 批量更新表单字段 */
  updateFields: (patch: Partial<T>) => void;
  /** 提交表单 */
  submit: () => Promise<void>;
}

/**
 * 表单弹窗管理 Hook
 * @param options 表单弹窗配置参数
 * @returns 表单弹窗状态与操作方法
 * @example
 * ```tsx
 * type UserForm = { id?: string; name: string; email: string };
 * 
 * const { visible, formData, mode, openCreate, openEdit, close, updateField, submit } = useModalForm<UserForm>({
 *   createEmptyForm: () => ({ name: '', email: '' }),
 *   onSubmit: async (data, mode) => {
 *     if (mode === 'create') {
 *       await createUser(data);
 *     } else {
 *       await updateUser(data);
 *     }
 *   }
 * });
 * ```
 */
function useModalForm<T extends Record<string, unknown>>(
  options: UseModalFormOptions<T>
): UseModalFormReturn<T> {
  const { createEmptyForm, onSubmit } = options;

  const [visible, setVisible] = useState(false);
  const [formData, setFormData] = useState<T | null>(null);
  const [mode, setMode] = useState<FormMode>("create");
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const isEditMode = mode === "edit";

  const openCreate = useCallback(() => {
    setFormData(createEmptyForm());
    setMode("create");
    setFormError("");
    setVisible(true);
  }, [createEmptyForm]);

  const openEdit = useCallback((data: T) => {
    setFormData(data);
    setMode("edit");
    setFormError("");
    setVisible(true);
  }, []);

  const close = useCallback(() => {
    setVisible(false);
    setFormData(null);
    setFormError("");
  }, []);

  const updateField = useCallback(<K extends keyof T>(key: K, value: T[K]) => {
    setFormData((prev) => (prev ? { ...prev, [key]: value } : null));
  }, []);

  const updateFields = useCallback((patch: Partial<T>) => {
    setFormData((prev) => (prev ? { ...prev, ...patch } : null));
  }, []);

  const submit = useCallback(async () => {
    if (!formData || !onSubmit) return;

    setSubmitting(true);
    try {
      await onSubmit(formData, mode);
      close();
    } catch (error) {
      if (error instanceof Error) {
        setFormError(error.message);
      }
    } finally {
      setSubmitting(false);
    }
  }, [formData, mode, onSubmit, close]);

  return {
    visible,
    setVisible,
    formData,
    setFormData,
    mode,
    isEditMode,
    formError,
    setFormError,
    submitting,
    openCreate,
    openEdit,
    close,
    updateField,
    updateFields,
    submit,
  };
}

export default useModalForm;
export type { UseModalFormOptions, UseModalFormReturn, FormMode };
