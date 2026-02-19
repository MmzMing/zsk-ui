/**
 * Auth 表单验证工具函数
 * @module utils/authValidators
 * @description 提供登录、注册、找回密码等页面的表单验证功能
 */

/** 邮箱正则表达式 */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** 用户名正则表达式（3-20位字母、数字或符号 ._-） */
const USERNAME_PATTERN = /^[a-zA-Z0-9_.-]{3,20}$/;

/**
 * 校验账号格式（支持邮箱或用户名）
 * @param value 账号值
 * @returns 错误信息，无错误返回空字符串
 */
export const validateAccount = (value: string): string => {
  const trimmed = value.trim();
  if (!trimmed) return "请输入账号";
  if (trimmed.includes("@")) {
    if (!EMAIL_PATTERN.test(trimmed)) {
      return "邮箱格式不正确";
    }
    return "";
  }
  if (!USERNAME_PATTERN.test(trimmed)) {
    return "用户名需为 3-20 位字母、数字或符号 ._-";
  }
  return "";
};

/**
 * 校验邮箱格式
 * @param value 邮箱值
 * @returns 错误信息，无错误返回空字符串
 */
export const validateEmail = (value: string): string => {
  const trimmed = value.trim();
  if (!trimmed) return "请输入邮箱地址";
  if (!EMAIL_PATTERN.test(trimmed)) return "邮箱格式不正确";
  return "";
};

/**
 * 校验用户名格式
 * @param value 用户名值
 * @returns 错误信息，无错误返回空字符串
 */
export const validateUsername = (value: string): string => {
  const trimmed = value.trim();
  if (!trimmed) return "请输入用户名";
  if (!USERNAME_PATTERN.test(trimmed)) return "用户名需为 3-20 位字母、数字或符号 ._-";
  return "";
};

/**
 * 校验密码格式
 * @param value 密码值
 * @returns 错误信息，无错误返回空字符串
 */
export const validatePassword = (value: string): string => {
  if (!value) return "请输入登录密码";
  if (value.length < 8) return "密码长度至少 8 位";
  return "";
};

/**
 * 校验确认密码是否一致
 * @param currentPassword 当前密码
 * @param value 确认密码值
 * @returns 错误信息，无错误返回空字符串
 */
export const validateConfirmPassword = (currentPassword: string, value: string): string => {
  if (!value) return "请再次输入密码";
  if (value !== currentPassword) return "两次输入的密码不一致";
  return "";
};

/**
 * 校验验证码格式
 * @param value 验证码值
 * @param required 是否必填
 * @returns 错误信息，无错误返回空字符串
 */
export const validateCaptcha = (value: string, required: boolean): string => {
  if (!value) {
    return required ? "请输入验证码" : "";
  }
  if (!/^\d{6}$/.test(value)) {
    return "验证码需为 6 位数字";
  }
  return "";
};

/**
 * 评估密码强度
 * @param value 密码值
 * @returns 密码强度等级（弱/中/强）
 */
export const evaluatePasswordStrength = (value: string): string => {
  if (!value) return "";
  let score = 0;
  if (value.length >= 8) score += 1;
  if (/[A-Z]/.test(value)) score += 1;
  if (/[a-z]/.test(value)) score += 1;
  if (/\d/.test(value)) score += 1;
  if (/[^A-Za-z0-9]/.test(value)) score += 1;
  if (score <= 2) return "弱";
  if (score === 3 || score === 4) return "中";
  return "强";
};

/**
 * 获取密码强度对应的颜色类名
 * @param strength 密码强度
 * @returns Tailwind 颜色类名
 */
export const getPasswordStrengthColor = (strength: string): string => {
  switch (strength) {
    case "弱":
      return "text-red-400";
    case "中":
      return "text-amber-300";
    case "强":
      return "text-emerald-400";
    default:
      return "";
  }
};

export default {
  validateAccount,
  validateEmail,
  validateUsername,
  validatePassword,
  validateConfirmPassword,
  validateCaptcha,
  evaluatePasswordStrength,
  getPasswordStrengthColor,
};
