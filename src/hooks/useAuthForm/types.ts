/**
 * Auth 表单状态类型定义
 * @module hooks/useAuthForm/types
 * @description 定义认证表单的状态、操作和返回类型
 */

import type { SliderCaptchaData } from "@/api/auth";

/**
 * 表单模式类型
 * - login: 登录模式
 * - register: 注册模式
 * - forgotPassword: 找回密码模式
 */
export type AuthFormMode = "login" | "register" | "forgotPassword";

/**
 * 表单字段状态
 * @description 所有表单输入字段的值
 */
export interface AuthFormFields {
  /** 账号（用户名或邮箱） */
  account: string;
  /** 邮箱地址 */
  email: string;
  /** 用户名 */
  username: string;
  /** 密码 */
  password: string;
  /** 确认密码 */
  confirmPassword: string;
  /** 验证码 */
  captcha: string;
  /** 新密码（找回密码时使用） */
  newPassword: string;
  /** 是否同意协议 */
  agree: boolean;
}

/**
 * 表单错误状态
 * @description 所有表单字段的错误信息
 */
export interface AuthFormErrors {
  /** 账号错误 */
  account: string;
  /** 邮箱错误 */
  email: string;
  /** 用户名错误 */
  username: string;
  /** 密码错误 */
  password: string;
  /** 确认密码错误 */
  confirmPassword: string;
  /** 验证码错误 */
  captcha: string;
  /** 新密码错误 */
  newPassword: string;
  /** 表单全局错误 */
  form: string;
}

/**
 * 滑块验证码状态
 * @description 滑块验证码组件的状态
 */
export interface SliderCaptchaState {
  /** 是否可见 */
  visible: boolean;
  /** 是否已验证 */
  verified: boolean;
  /** 验证码数据 */
  info: SliderCaptchaData | null;
  /** 错误信息 */
  error: string;
  /** 拼图顶部位置 */
  puzzleTop: number;
}

/**
 * UI 状态
 * @description 界面交互状态
 */
export interface AuthFormUIState {
  /** 是否提交中 */
  submitting: boolean;
  /** 密码是否可见 */
  passwordVisible: boolean;
  /** 确认密码是否可见 */
  confirmPasswordVisible: boolean;
  /** 是否显示用户协议 */
  showUserAgreement: boolean;
  /** 是否显示隐私政策 */
  showPrivacyPolicy: boolean;
  /** 验证码是否已发送 */
  codeSent: boolean;
  /** 是否需要验证码（登录失败多次后） */
  requireCaptcha: boolean;
  /** 当前步骤（找回密码时使用） */
  stepIndex: number;
  /** 密码强度 */
  passwordStrength: string;
  /** 验证令牌（找回密码时使用） */
  verifyToken: string;
}

/**
 * 完整的表单状态
 * @description 包含所有状态的总状态对象
 */
export interface AuthFormState {
  /** 表单模式 */
  mode: AuthFormMode;
  /** 表单字段 */
  fields: AuthFormFields;
  /** 错误信息 */
  errors: AuthFormErrors;
  /** 滑块验证码状态 */
  slider: SliderCaptchaState;
  /** UI 状态 */
  ui: AuthFormUIState;
}

/**
 * 初始化状态参数
 * @description 创建初始状态时的配置参数
 */
export interface AuthFormInitOptions {
  /** 表单模式 */
  mode: AuthFormMode;
  /** 是否需要验证码 */
  requireCaptcha?: boolean;
  /** 初始步骤索引 */
  stepIndex?: number;
}
