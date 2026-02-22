/**
 * Auth 表单 Action 类型定义
 * @module hooks/useAuthForm/actions
 * @description 定义状态更新操作的 Action 类型和创建函数
 */

import type { BackendCaptchaResponse } from "@/api/auth";
import type { AuthFormFields, AuthFormErrors } from "./types";

/**
 * Action 类型枚举
 * @description 所有可执行的状态更新操作
 */
export enum AuthFormActionType {
  // 字段更新
  SET_FIELD = "SET_FIELD",
  SET_FIELDS = "SET_FIELDS",
  
  // 错误更新
  SET_ERROR = "SET_ERROR",
  SET_ERRORS = "SET_ERRORS",
  CLEAR_ERRORS = "CLEAR_ERRORS",
  
  // 滑块验证码
  SET_SLIDER_VISIBLE = "SET_SLIDER_VISIBLE",
  SET_SLIDER_VERIFIED = "SET_SLIDER_VERIFIED",
  SET_SLIDER_INFO = "SET_SLIDER_INFO",
  SET_SLIDER_ERROR = "SET_SLIDER_ERROR",
  SET_PUZZLE_TOP = "SET_PUZZLE_TOP",
  RESET_SLIDER = "RESET_SLIDER",
  
  // UI 状态
  SET_SUBMITTING = "SET_SUBMITTING",
  SET_PASSWORD_VISIBLE = "SET_PASSWORD_VISIBLE",
  SET_CONFIRM_PASSWORD_VISIBLE = "SET_CONFIRM_PASSWORD_VISIBLE",
  SET_SHOW_USER_AGREEMENT = "SET_SHOW_USER_AGREEMENT",
  SET_SHOW_PRIVACY_POLICY = "SET_SHOW_PRIVACY_POLICY",
  SET_CODE_SENT = "SET_CODE_SENT",
  SET_REQUIRE_CAPTCHA = "SET_REQUIRE_CAPTCHA",
  SET_STEP_INDEX = "SET_STEP_INDEX",
  SET_PASSWORD_STRENGTH = "SET_PASSWORD_STRENGTH",
  SET_VERIFY_TOKEN = "SET_VERIFY_TOKEN",
  
  // 重置
  RESET_FORM = "RESET_FORM",
  RESET_FIELDS = "RESET_FIELDS",
}

/**
 * 字段更新 Action
 */
interface SetFieldAction {
  type: AuthFormActionType.SET_FIELD;
  payload: { field: keyof AuthFormFields; value: string | boolean };
}

interface SetFieldsAction {
  type: AuthFormActionType.SET_FIELDS;
  payload: Partial<AuthFormFields>;
}

/**
 * 错误更新 Action
 */
interface SetErrorAction {
  type: AuthFormActionType.SET_ERROR;
  payload: { field: keyof AuthFormErrors; value: string };
}

interface SetErrorsAction {
  type: AuthFormActionType.SET_ERRORS;
  payload: Partial<AuthFormErrors>;
}

interface ClearErrorsAction {
  type: AuthFormActionType.CLEAR_ERRORS;
}

/**
 * 滑块验证码 Action
 */
interface SetSliderVisibleAction {
  type: AuthFormActionType.SET_SLIDER_VISIBLE;
  payload: boolean;
}

interface SetSliderVerifiedAction {
  type: AuthFormActionType.SET_SLIDER_VERIFIED;
  payload: boolean;
}

interface SetSliderInfoAction {
  type: AuthFormActionType.SET_SLIDER_INFO;
  payload: BackendCaptchaResponse | null;
}

interface SetSliderErrorAction {
  type: AuthFormActionType.SET_SLIDER_ERROR;
  payload: string;
}

interface SetPuzzleTopAction {
  type: AuthFormActionType.SET_PUZZLE_TOP;
  payload: number;
}

interface ResetSliderAction {
  type: AuthFormActionType.RESET_SLIDER;
}

/**
 * UI 状态 Action
 */
interface SetSubmittingAction {
  type: AuthFormActionType.SET_SUBMITTING;
  payload: boolean;
}

interface SetPasswordVisibleAction {
  type: AuthFormActionType.SET_PASSWORD_VISIBLE;
  payload: boolean;
}

interface SetConfirmPasswordVisibleAction {
  type: AuthFormActionType.SET_CONFIRM_PASSWORD_VISIBLE;
  payload: boolean;
}

interface SetShowUserAgreementAction {
  type: AuthFormActionType.SET_SHOW_USER_AGREEMENT;
  payload: boolean;
}

interface SetShowPrivacyPolicyAction {
  type: AuthFormActionType.SET_SHOW_PRIVACY_POLICY;
  payload: boolean;
}

interface SetCodeSentAction {
  type: AuthFormActionType.SET_CODE_SENT;
  payload: boolean;
}

interface SetRequireCaptchaAction {
  type: AuthFormActionType.SET_REQUIRE_CAPTCHA;
  payload: boolean;
}

interface SetStepIndexAction {
  type: AuthFormActionType.SET_STEP_INDEX;
  payload: number;
}

interface SetPasswordStrengthAction {
  type: AuthFormActionType.SET_PASSWORD_STRENGTH;
  payload: string;
}

interface SetVerifyTokenAction {
  type: AuthFormActionType.SET_VERIFY_TOKEN;
  payload: string;
}

/**
 * 重置 Action
 */
interface ResetFormAction {
  type: AuthFormActionType.RESET_FORM;
}

interface ResetFieldsAction {
  type: AuthFormActionType.RESET_FIELDS;
}

/**
 * 所有 Action 类型的联合类型
 */
export type AuthFormAction =
  | SetFieldAction
  | SetFieldsAction
  | SetErrorAction
  | SetErrorsAction
  | ClearErrorsAction
  | SetSliderVisibleAction
  | SetSliderVerifiedAction
  | SetSliderInfoAction
  | SetSliderErrorAction
  | SetPuzzleTopAction
  | ResetSliderAction
  | SetSubmittingAction
  | SetPasswordVisibleAction
  | SetConfirmPasswordVisibleAction
  | SetShowUserAgreementAction
  | SetShowPrivacyPolicyAction
  | SetCodeSentAction
  | SetRequireCaptchaAction
  | SetStepIndexAction
  | SetPasswordStrengthAction
  | SetVerifyTokenAction
  | ResetFormAction
  | ResetFieldsAction;

// ===== Action Creators =====

/** 设置单个字段值 */
export const setField = (field: keyof AuthFormFields, value: string | boolean): SetFieldAction => ({
  type: AuthFormActionType.SET_FIELD,
  payload: { field, value },
});

/** 设置多个字段值 */
export const setFields = (fields: Partial<AuthFormFields>): SetFieldsAction => ({
  type: AuthFormActionType.SET_FIELDS,
  payload: fields,
});

/** 设置单个错误 */
export const setError = (field: keyof AuthFormErrors, value: string): SetErrorAction => ({
  type: AuthFormActionType.SET_ERROR,
  payload: { field, value },
});

/** 设置多个错误 */
export const setErrors = (errors: Partial<AuthFormErrors>): SetErrorsAction => ({
  type: AuthFormActionType.SET_ERRORS,
  payload: errors,
});

/** 清除所有错误 */
export const clearErrors = (): ClearErrorsAction => ({
  type: AuthFormActionType.CLEAR_ERRORS,
});

/** 设置滑块可见性 */
export const setSliderVisible = (visible: boolean): SetSliderVisibleAction => ({
  type: AuthFormActionType.SET_SLIDER_VISIBLE,
  payload: visible,
});

/** 设置滑块验证状态 */
export const setSliderVerified = (verified: boolean): SetSliderVerifiedAction => ({
  type: AuthFormActionType.SET_SLIDER_VERIFIED,
  payload: verified,
});

/** 设置滑块验证码信息 */
export const setSliderInfo = (info: BackendCaptchaResponse | null): SetSliderInfoAction => ({
  type: AuthFormActionType.SET_SLIDER_INFO,
  payload: info,
});

/** 设置滑块错误 */
export const setSliderError = (error: string): SetSliderErrorAction => ({
  type: AuthFormActionType.SET_SLIDER_ERROR,
  payload: error,
});

/** 设置拼图顶部位置 */
export const setPuzzleTop = (top: number): SetPuzzleTopAction => ({
  type: AuthFormActionType.SET_PUZZLE_TOP,
  payload: top,
});

/** 重置滑块状态 */
export const resetSlider = (): ResetSliderAction => ({
  type: AuthFormActionType.RESET_SLIDER,
});

/** 设置提交状态 */
export const setSubmitting = (submitting: boolean): SetSubmittingAction => ({
  type: AuthFormActionType.SET_SUBMITTING,
  payload: submitting,
});

/** 设置密码可见性 */
export const setPasswordVisible = (visible: boolean): SetPasswordVisibleAction => ({
  type: AuthFormActionType.SET_PASSWORD_VISIBLE,
  payload: visible,
});

/** 设置确认密码可见性 */
export const setConfirmPasswordVisible = (visible: boolean): SetConfirmPasswordVisibleAction => ({
  type: AuthFormActionType.SET_CONFIRM_PASSWORD_VISIBLE,
  payload: visible,
});

/** 设置用户协议弹窗 */
export const setShowUserAgreement = (show: boolean): SetShowUserAgreementAction => ({
  type: AuthFormActionType.SET_SHOW_USER_AGREEMENT,
  payload: show,
});

/** 设置隐私政策弹窗 */
export const setShowPrivacyPolicy = (show: boolean): SetShowPrivacyPolicyAction => ({
  type: AuthFormActionType.SET_SHOW_PRIVACY_POLICY,
  payload: show,
});

/** 设置验证码已发送 */
export const setCodeSent = (sent: boolean): SetCodeSentAction => ({
  type: AuthFormActionType.SET_CODE_SENT,
  payload: sent,
});

/** 设置需要验证码 */
export const setRequireCaptcha = (require: boolean): SetRequireCaptchaAction => ({
  type: AuthFormActionType.SET_REQUIRE_CAPTCHA,
  payload: require,
});

/** 设置步骤索引 */
export const setStepIndex = (index: number): SetStepIndexAction => ({
  type: AuthFormActionType.SET_STEP_INDEX,
  payload: index,
});

/** 设置密码强度 */
export const setPasswordStrength = (strength: string): SetPasswordStrengthAction => ({
  type: AuthFormActionType.SET_PASSWORD_STRENGTH,
  payload: strength,
});

/** 设置验证令牌 */
export const setVerifyToken = (token: string): SetVerifyTokenAction => ({
  type: AuthFormActionType.SET_VERIFY_TOKEN,
  payload: token,
});

/** 重置表单 */
export const resetForm = (): ResetFormAction => ({
  type: AuthFormActionType.RESET_FORM,
});

/** 重置字段 */
export const resetFields = (): ResetFieldsAction => ({
  type: AuthFormActionType.RESET_FIELDS,
});
