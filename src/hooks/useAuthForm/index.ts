/**
 * Auth 表单状态管理 Hook
 * @module hooks/useAuthForm
 * @description 提供认证表单的统一状态管理，支持登录、注册、找回密码模式
 */

import { useReducer, useMemo } from "react";
import { authFormReducer, createInitialState } from "./reducer";
import {
  setField,
  setFields,
  setError,
  setErrors,
  clearErrors,
  setSliderVisible,
  setSliderVerified,
  setSliderInfo,
  setSliderError,
  setPuzzleTop,
  resetSlider,
  setSubmitting,
  setPasswordVisible,
  setConfirmPasswordVisible,
  setShowUserAgreement,
  setShowPrivacyPolicy,
  setCodeSent,
  setRequireCaptcha,
  setStepIndex,
  setPasswordStrength,
  setVerifyToken,
  resetForm,
  resetFields,
} from "./actions";
import type { AuthFormMode, AuthFormState, AuthFormInitOptions, AuthFormFields, AuthFormErrors } from "./types";
import {
  validateAccount,
  validateEmail,
  validateUsername,
  validatePassword,
  validateConfirmPassword,
  validateCaptcha,
  evaluatePasswordStrength,
} from "@/utils/authValidators";

/**
 * useAuthForm 返回类型
 */
export interface UseAuthFormReturn {
  /** 表单状态 */
  state: AuthFormState;
  
  /** 字段操作 */
  fields: {
    /** 设置单个字段 */
    set: (field: keyof AuthFormFields, value: string | boolean) => void;
    /** 设置多个字段 */
    setMany: (fields: Partial<AuthFormFields>) => void;
    /** 重置所有字段 */
    reset: () => void;
  };
  
  /** 错误操作 */
  errors: {
    /** 设置单个错误 */
    set: (field: keyof AuthFormErrors, value: string) => void;
    /** 设置多个错误 */
    setMany: (errors: Partial<AuthFormErrors>) => void;
    /** 清除所有错误 */
    clear: () => void;
    /** 验证并设置错误 */
    validate: (field: keyof AuthFormFields, value: string | boolean) => string;
  };
  
  /** 滑块验证码操作 */
  slider: {
    /** 显示滑块 */
    show: () => void;
    /** 隐藏滑块 */
    hide: () => void;
    /** 设置验证状态 */
    setVerified: (verified: boolean) => void;
    /** 设置验证码信息 */
    setInfo: (info: AuthFormState["slider"]["info"]) => void;
    /** 设置错误 */
    setError: (error: string) => void;
    /** 设置拼图位置 */
    setPuzzleTop: (top: number) => void;
    /** 重置滑块 */
    reset: () => void;
  };
  
  /** UI 操作 */
  ui: {
    /** 设置提交状态 */
    setSubmitting: (submitting: boolean) => void;
    /** 切换密码可见性 */
    togglePasswordVisible: () => void;
    /** 切换确认密码可见性 */
    toggleConfirmPasswordVisible: () => void;
    /** 显示用户协议 */
    showUserAgreement: () => void;
    /** 隐藏用户协议 */
    hideUserAgreement: () => void;
    /** 显示隐私政策 */
    showPrivacyPolicy: () => void;
    /** 隐藏隐私政策 */
    hidePrivacyPolicy: () => void;
    /** 设置验证码已发送 */
    setCodeSent: (sent: boolean) => void;
    /** 设置需要验证码 */
    setRequireCaptcha: (require: boolean) => void;
    /** 设置步骤 */
    setStep: (step: number) => void;
    /** 下一步 */
    nextStep: () => void;
    /** 上一步 */
    prevStep: () => void;
    /** 设置密码强度 */
    setPasswordStrength: (strength: string) => void;
    /** 设置验证令牌 */
    setVerifyToken: (token: string) => void;
  };
  
  /** 表单操作 */
  form: {
    /** 重置表单 */
    reset: () => void;
    /** 验证登录表单 */
    validateLogin: () => boolean;
    /** 验证注册表单 */
    validateRegister: () => boolean;
    /** 验证找回密码表单（第一步） */
    validateForgotPasswordStep1: () => boolean;
    /** 验证找回密码表单（第二步） */
    validateForgotPasswordStep2: () => boolean;
    /** 验证找回密码表单（第三步） */
    validateForgotPasswordStep3: () => boolean;
  };
  
  /** 事件处理器 */
  handlers: {
    /** 账号输入变更 */
    handleAccountChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    /** 邮箱输入变更 */
    handleEmailChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    /** 用户名输入变更 */
    handleUsernameChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    /** 密码输入变更 */
    handlePasswordChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    /** 确认密码输入变更 */
    handleConfirmPasswordChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    /** 新密码输入变更 */
    handleNewPasswordChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    /** 验证码输入变更 */
    handleCaptchaChange: (value: string) => void;
    /** 同意协议变更 */
    handleAgreeChange: (agree: boolean) => void;
  };
}

/**
 * Auth 表单状态管理 Hook
 * @param options 初始化配置
 * @returns 表单状态和操作方法
 */
export function useAuthForm(options: AuthFormInitOptions): UseAuthFormReturn {
  const [state, dispatch] = useReducer(authFormReducer, options, createInitialState);

  // ===== 字段操作 =====
  const fieldsHandlers = useMemo(
    () => ({
      set: (field: keyof AuthFormFields, value: string | boolean) => {
        dispatch(setField(field, value));
      },
      setMany: (fields: Partial<AuthFormFields>) => {
        dispatch(setFields(fields));
      },
      reset: () => {
        dispatch(resetFields());
      },
    }),
    []
  );

  // ===== 错误操作 =====
  const errorsHandlers = useMemo(
    () => ({
      set: (field: keyof AuthFormErrors, value: string) => {
        dispatch(setError(field, value));
      },
      setMany: (errors: Partial<AuthFormErrors>) => {
        dispatch(setErrors(errors));
      },
      clear: () => {
        dispatch(clearErrors());
      },
      validate: (field: keyof AuthFormFields, value: string | boolean): string => {
        const strValue = typeof value === "string" ? value : "";
        switch (field) {
          case "account":
            return validateAccount(strValue);
          case "email":
            return validateEmail(strValue);
          case "username":
            return validateUsername(strValue);
          case "password":
          case "newPassword":
            return validatePassword(strValue);
          case "confirmPassword":
            return validateConfirmPassword(state.fields.password, strValue);
          case "captcha":
            return validateCaptcha(strValue, state.ui.requireCaptcha || state.slider.verified);
          default:
            return "";
        }
      },
    }),
    [state.fields.password, state.ui.requireCaptcha, state.slider.verified]
  );

  // ===== 滑块验证码操作 =====
  const sliderHandlers = useMemo(
    () => ({
      show: () => {
        dispatch(setSliderVisible(true));
      },
      hide: () => {
        dispatch(setSliderVisible(false));
      },
      setVerified: (verified: boolean) => {
        dispatch(setSliderVerified(verified));
      },
      setInfo: (info: AuthFormState["slider"]["info"]) => {
        dispatch(setSliderInfo(info));
      },
      setError: (error: string) => {
        dispatch(setSliderError(error));
      },
      setPuzzleTop: (top: number) => {
        dispatch(setPuzzleTop(top));
      },
      reset: () => {
        dispatch(resetSlider());
      },
    }),
    []
  );

  // ===== UI 操作 =====
  const uiHandlers = useMemo(
    () => ({
      setSubmitting: (submitting: boolean) => {
        dispatch(setSubmitting(submitting));
      },
      togglePasswordVisible: () => {
        dispatch(setPasswordVisible(!state.ui.passwordVisible));
      },
      toggleConfirmPasswordVisible: () => {
        dispatch(setConfirmPasswordVisible(!state.ui.confirmPasswordVisible));
      },
      showUserAgreement: () => {
        dispatch(setShowUserAgreement(true));
      },
      hideUserAgreement: () => {
        dispatch(setShowUserAgreement(false));
      },
      showPrivacyPolicy: () => {
        dispatch(setShowPrivacyPolicy(true));
      },
      hidePrivacyPolicy: () => {
        dispatch(setShowPrivacyPolicy(false));
      },
      setCodeSent: (sent: boolean) => {
        dispatch(setCodeSent(sent));
      },
      setRequireCaptcha: (require: boolean) => {
        dispatch(setRequireCaptcha(require));
      },
      setStep: (step: number) => {
        dispatch(setStepIndex(step));
      },
      nextStep: () => {
        dispatch(setStepIndex(state.ui.stepIndex + 1));
      },
      prevStep: () => {
        dispatch(setStepIndex(Math.max(0, state.ui.stepIndex - 1)));
      },
      setPasswordStrength: (strength: string) => {
        dispatch(setPasswordStrength(strength));
      },
      setVerifyToken: (token: string) => {
        dispatch(setVerifyToken(token));
      },
    }),
    [state.ui.passwordVisible, state.ui.confirmPasswordVisible, state.ui.stepIndex]
  );

  // ===== 表单验证 =====
  const formHandlers = useMemo(
    () => ({
      reset: () => {
        dispatch(resetForm());
      },
      validateLogin: () => {
        const accountError = validateAccount(state.fields.account);
        const passwordError = validatePassword(state.fields.password);
        dispatch(setErrors({ account: accountError, password: passwordError, form: "" }));
        return !accountError && !passwordError;
      },
      validateRegister: () => {
        const emailError = validateEmail(state.fields.email);
        const usernameError = validateUsername(state.fields.username);
        const passwordError = validatePassword(state.fields.password);
        const confirmPasswordError = validateConfirmPassword(state.fields.password, state.fields.confirmPassword);
        dispatch(
          setErrors({
            email: emailError,
            username: usernameError,
            password: passwordError,
            confirmPassword: confirmPasswordError,
            form: "",
          })
        );
        return !emailError && !usernameError && !passwordError && !confirmPasswordError;
      },
      validateForgotPasswordStep1: () => {
        const accountError = validateAccount(state.fields.account);
        const emailError = validateEmail(state.fields.email);
        dispatch(setErrors({ account: accountError, email: emailError, form: "" }));
        return !accountError && !emailError;
      },
      validateForgotPasswordStep2: () => {
        const captchaError = validateCaptcha(state.fields.captcha, true);
        dispatch(setErrors({ captcha: captchaError, form: "" }));
        return !captchaError;
      },
      validateForgotPasswordStep3: () => {
        const newPasswordError = validatePassword(state.fields.newPassword);
        const confirmPasswordError = validateConfirmPassword(state.fields.newPassword, state.fields.confirmPassword);
        dispatch(setErrors({ newPassword: newPasswordError, confirmPassword: confirmPasswordError, form: "" }));
        return !newPasswordError && !confirmPasswordError;
      },
    }),
    [state.fields]
  );

  // ===== 事件处理器 =====
  const eventHandlers = useMemo(
    () => ({
      handleAccountChange: (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        dispatch(setField("account", value));
        dispatch(setError("account", value ? validateAccount(value) : ""));
      },
      handleEmailChange: (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        dispatch(setField("email", value));
        dispatch(setError("email", value ? validateEmail(value) : ""));
      },
      handleUsernameChange: (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        dispatch(setField("username", value));
        dispatch(setError("username", value ? validateUsername(value) : ""));
      },
      handlePasswordChange: (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        dispatch(setField("password", value));
        dispatch(setError("password", value ? validatePassword(value) : ""));
        dispatch(setPasswordStrength(evaluatePasswordStrength(value)));
        if (state.fields.confirmPassword) {
          dispatch(setError("confirmPassword", validateConfirmPassword(value, state.fields.confirmPassword)));
        }
      },
      handleConfirmPasswordChange: (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        dispatch(setField("confirmPassword", value));
        dispatch(setError("confirmPassword", value ? validateConfirmPassword(state.fields.password, value) : ""));
      },
      handleNewPasswordChange: (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        dispatch(setField("newPassword", value));
        dispatch(setError("newPassword", value ? validatePassword(value) : ""));
        dispatch(setPasswordStrength(evaluatePasswordStrength(value)));
        if (state.fields.confirmPassword) {
          dispatch(setError("confirmPassword", validateConfirmPassword(value, state.fields.confirmPassword)));
        }
      },
      handleCaptchaChange: (value: string) => {
        const digits = value.replace(/\D/g, "");
        dispatch(setField("captcha", digits));
        dispatch(setError("captcha", validateCaptcha(digits, state.ui.requireCaptcha || state.slider.verified)));
      },
      handleAgreeChange: (agree: boolean) => {
        dispatch(setField("agree", agree));
      },
    }),
    [state.fields.confirmPassword, state.fields.password, state.ui.requireCaptcha, state.slider.verified]
  );

  return {
    state,
    fields: fieldsHandlers,
    errors: errorsHandlers,
    slider: sliderHandlers,
    ui: uiHandlers,
    form: formHandlers,
    handlers: eventHandlers,
  };
}

// 导出类型
export type { AuthFormMode, AuthFormState, AuthFormInitOptions, AuthFormFields, AuthFormErrors };
