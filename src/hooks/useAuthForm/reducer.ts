/**
 * Auth 表单 Reducer
 * @module hooks/useAuthForm/reducer
 * @description 处理表单状态更新的纯函数
 */

import { AuthFormActionType, type AuthFormAction } from "./actions";
import type { AuthFormState, AuthFormInitOptions } from "./types";

/**
 * 创建初始字段状态
 * @returns 初始字段状态
 */
const createInitialFields = () => ({
  account: "",
  email: "",
  username: "",
  password: "",
  confirmPassword: "",
  captcha: "",
  newPassword: "",
  agree: false,
});

/**
 * 创建初始错误状态
 * @returns 初始错误状态
 */
const createInitialErrors = () => ({
  account: "",
  email: "",
  username: "",
  password: "",
  confirmPassword: "",
  captcha: "",
  newPassword: "",
  form: "",
});

/**
 * 创建初始滑块状态
 * @returns 初始滑块状态
 */
const createInitialSlider = () => ({
  visible: false,
  verified: false,
  info: null,
  error: "",
  puzzleTop: 0,
});

/**
 * 创建初始 UI 状态
 * @returns 初始 UI 状态
 */
const createInitialUI = () => ({
  submitting: false,
  passwordVisible: false,
  confirmPasswordVisible: false,
  showUserAgreement: false,
  showPrivacyPolicy: false,
  codeSent: false,
  requireCaptcha: false,
  stepIndex: 0,
  passwordStrength: "",
  verifyToken: "",
});

/**
 * 创建初始状态
 * @param options 初始化配置
 * @returns 完整的初始状态
 */
export const createInitialState = (options: AuthFormInitOptions): AuthFormState => ({
  mode: options.mode,
  fields: createInitialFields(),
  errors: createInitialErrors(),
  slider: createInitialSlider(),
  ui: {
    ...createInitialUI(),
    requireCaptcha: options.requireCaptcha ?? false,
    stepIndex: options.stepIndex ?? 0,
  },
});

/**
 * Auth 表单 Reducer
 * @param state 当前状态
 * @param action 操作
 * @returns 新状态
 */
export const authFormReducer = (state: AuthFormState, action: AuthFormAction): AuthFormState => {
  switch (action.type) {
    // ===== 字段更新 =====
    case AuthFormActionType.SET_FIELD:
      return {
        ...state,
        fields: {
          ...state.fields,
          [action.payload.field]: action.payload.value,
        },
      };

    case AuthFormActionType.SET_FIELDS:
      return {
        ...state,
        fields: {
          ...state.fields,
          ...action.payload,
        },
      };

    // ===== 错误更新 =====
    case AuthFormActionType.SET_ERROR:
      return {
        ...state,
        errors: {
          ...state.errors,
          [action.payload.field]: action.payload.value,
        },
      };

    case AuthFormActionType.SET_ERRORS:
      return {
        ...state,
        errors: {
          ...state.errors,
          ...action.payload,
        },
      };

    case AuthFormActionType.CLEAR_ERRORS:
      return {
        ...state,
        errors: createInitialErrors(),
      };

    // ===== 滑块验证码 =====
    case AuthFormActionType.SET_SLIDER_VISIBLE:
      return {
        ...state,
        slider: {
          ...state.slider,
          visible: action.payload,
        },
      };

    case AuthFormActionType.SET_SLIDER_VERIFIED:
      return {
        ...state,
        slider: {
          ...state.slider,
          verified: action.payload,
        },
      };

    case AuthFormActionType.SET_SLIDER_INFO:
      return {
        ...state,
        slider: {
          ...state.slider,
          info: action.payload,
        },
      };

    case AuthFormActionType.SET_SLIDER_ERROR:
      return {
        ...state,
        slider: {
          ...state.slider,
          error: action.payload,
        },
      };

    case AuthFormActionType.SET_PUZZLE_TOP:
      return {
        ...state,
        slider: {
          ...state.slider,
          puzzleTop: action.payload,
        },
      };

    case AuthFormActionType.RESET_SLIDER:
      return {
        ...state,
        slider: createInitialSlider(),
      };

    // ===== UI 状态 =====
    case AuthFormActionType.SET_SUBMITTING:
      return {
        ...state,
        ui: {
          ...state.ui,
          submitting: action.payload,
        },
      };

    case AuthFormActionType.SET_PASSWORD_VISIBLE:
      return {
        ...state,
        ui: {
          ...state.ui,
          passwordVisible: action.payload,
        },
      };

    case AuthFormActionType.SET_CONFIRM_PASSWORD_VISIBLE:
      return {
        ...state,
        ui: {
          ...state.ui,
          confirmPasswordVisible: action.payload,
        },
      };

    case AuthFormActionType.SET_SHOW_USER_AGREEMENT:
      return {
        ...state,
        ui: {
          ...state.ui,
          showUserAgreement: action.payload,
        },
      };

    case AuthFormActionType.SET_SHOW_PRIVACY_POLICY:
      return {
        ...state,
        ui: {
          ...state.ui,
          showPrivacyPolicy: action.payload,
        },
      };

    case AuthFormActionType.SET_CODE_SENT:
      return {
        ...state,
        ui: {
          ...state.ui,
          codeSent: action.payload,
        },
      };

    case AuthFormActionType.SET_REQUIRE_CAPTCHA:
      return {
        ...state,
        ui: {
          ...state.ui,
          requireCaptcha: action.payload,
        },
      };

    case AuthFormActionType.SET_STEP_INDEX:
      return {
        ...state,
        ui: {
          ...state.ui,
          stepIndex: action.payload,
        },
      };

    case AuthFormActionType.SET_PASSWORD_STRENGTH:
      return {
        ...state,
        ui: {
          ...state.ui,
          passwordStrength: action.payload,
        },
      };

    case AuthFormActionType.SET_VERIFY_TOKEN:
      return {
        ...state,
        ui: {
          ...state.ui,
          verifyToken: action.payload,
        },
      };

    // ===== 重置 =====
    case AuthFormActionType.RESET_FORM:
      return createInitialState({ mode: state.mode });

    case AuthFormActionType.RESET_FIELDS:
      return {
        ...state,
        fields: createInitialFields(),
      };

    default:
      return state;
  }
};
