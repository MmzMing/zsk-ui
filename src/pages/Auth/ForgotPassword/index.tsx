// ===== 1. 依赖导入区域 =====
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { routes } from "@/router/routes";
import { useNavigate } from "react-router-dom";
import SliderCaptcha, { type VerifyParam } from "rc-slider-captcha";
import InteractiveHoverButton from "@/components/Motion/InteractiveHoverButton";
import Stepper from "@/components/Motion/Stepper";
import { Shuffle } from "@/components/Motion/Shuffle";
import { TextType } from "@/components/Motion/TextType";
import { RiHome4Line } from "react-icons/ri";
import {
  Button,
  Input,
  InputOtp,
  Link as HeroLink,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
} from "@heroui/react";
import {
  verifySliderCaptcha,
  preCheckAndGetCaptcha,
  sendPasswordResetCode,
  verifyResetCode,
  resetPassword,
  getPublicKey,
  type SliderCaptchaData,
} from "@/api/auth";
import { rsaEncrypt } from "@/lib/rsaEncrypt";

// ===== 2. TODO待处理导入区域 =====

// ===== 3. 状态控制逻辑区域 =====
/**
 * 背景图片列表
 */
const BG_IMAGES = [
  "/auth/auth-Polling-1.png",
  "/auth/auth-Polling-2.png",
  "/auth/auth-Polling-3.png",
];

// ===== 4. 通用工具函数区域 =====
/**
 * 校验账号格式
 * @param value 账号值
 * @returns 错误信息，无错误返回空字符串
 */
const validateAccount = (value: string): string => {
  const trimmed = value.trim();
  if (!trimmed) return "请输入账号";
  if (trimmed.includes("@")) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(trimmed)) {
      return "邮箱格式不正确";
    }
    return "";
  }
  const usernamePattern = /^[a-zA-Z0-9_.-]{3,20}$/;
  if (!usernamePattern.test(trimmed)) {
    return "用户名需为 3-20 位字母、数字或符号 ._-";
  }
  return "";
};

/**
 * 校验邮箱格式
 * @param value 邮箱值
 * @returns 错误信息，无错误返回空字符串
 */
const validateEmail = (value: string): string => {
  const trimmed = value.trim();
  if (!trimmed) return "请输入邮箱地址";
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(trimmed)) return "邮箱格式不正确";
  return "";
};

/**
 * 校验验证码格式
 * @param value 验证码值
 * @param required 是否必填
 * @returns 错误信息，无错误返回空字符串
 */
const validateCaptcha = (value: string, required: boolean): string => {
  if (!value) {
    return required ? "请输入验证码" : "";
  }
  if (!/^\d{6}$/.test(value)) {
    return "验证码需为 6 位数字";
  }
  return "";
};

/**
 * 校验密码格式
 * @param value 密码值
 * @returns 错误信息，无错误返回空字符串
 */
const validatePassword = (value: string): string => {
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
const validateConfirmPassword = (
  currentPassword: string,
  value: string
): string => {
  if (!value) return "请再次输入密码";
  if (value !== currentPassword) return "两次输入的密码不一致";
  return "";
};

// ===== 5. 注释代码函数区 =====

// ===== 6. 错误处理函数区域 =====

// ===== 7. 数据处理函数区域 =====

// ===== 8. UI渲染逻辑区域 =====
/**
 * 忘记密码页面组件
 */
const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();

  // --- 状态定义 ---
  /** 当前背景索引 */
  const [currentBgIndex, setCurrentBgIndex] = React.useState(0);
  /** 账号 */
  const [account, setAccount] = React.useState("");
  /** 邮箱 */
  const [email, setEmail] = React.useState("");
  /** 验证码 */
  const [captcha, setCaptcha] = React.useState("");
  /** 是否提交中 */
  const [submitting, setSubmitting] = React.useState(false);
  /** 当前步骤索引 */
  const [stepIndex, setStepIndex] = React.useState(0);
  /** 新密码 */
  const [newPassword, setNewPassword] = React.useState("");
  /** 确认密码 */
  const [confirmPassword, setConfirmPassword] = React.useState("");
  /** 账号错误信息 */
  const [accountError, setAccountError] = React.useState("");
  /** 邮箱错误信息 */
  const [emailError, setEmailError] = React.useState("");
  /** 验证码错误信息 */
  const [captchaError, setCaptchaError] = React.useState("");
  /** 密码错误信息 */
  const [passwordError, setPasswordError] = React.useState("");
  /** 确认密码错误信息 */
  const [confirmPasswordError, setConfirmPasswordError] = React.useState("");
  /** 表单全局错误信息 */
  const [formError, setFormError] = React.useState("");
  /** 验证码倒计时 */
  const [captchaCountdown, setCaptchaCountdown] = React.useState(0);
  const [puzzleTop, setPuzzleTop] = React.useState(0);
  /** 滑块弹窗可见性 */
  const [sliderVisible, setSliderVisible] = React.useState(false);
  /** 滑块是否已验证 */
  const [sliderVerified, setSliderVerified] = React.useState(false);
  /** 滑块验证码信息 */
  const [sliderCaptchaInfo, setSliderCaptchaInfo] =
    React.useState<SliderCaptchaData | null>(null);
  /** 滑块错误信息 */
  const [sliderError, setSliderError] = React.useState("");
  /** 验证码是否已发送 */
  const [codeSent, setCodeSent] = React.useState(false);
  /** 验证令牌（验证码验证通过后获取） */
  const [verifyToken, setVerifyToken] = React.useState<string>("");

  // --- 页面副作用 ---
  // 页面初始化
  React.useEffect(() => {
    let ignore = false;
    const timer = setTimeout(() => {
      if (!ignore) {
        // 页面初始化逻辑
      }
    }, 0);
    return () => {
      ignore = true;
      clearTimeout(timer);
    };
  }, []);

  // 背景轮播
  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBgIndex((prev) => (prev + 1) % BG_IMAGES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // 验证码倒计时
  React.useEffect(() => {
    if (!captchaCountdown) return;
    const timer = window.setInterval(() => {
      setCaptchaCountdown(prev => {
        if (prev <= 1) {
          window.clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [captchaCountdown]);

  // --- 事件处理函数 ---
  /**
   * 处理账号输入变更
   */
  const handleAccountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setAccount(value);
    setAccountError(value ? validateAccount(value) : "");
  };

  /**
   * 处理邮箱输入变更
   */
  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setEmail(value);
    setEmailError(value ? validateEmail(value) : "");
  };

  /**
   * 处理验证码输入变更
   */
  const handleCaptchaChange = (value: string) => {
    const digits = value.replace(/\D/g, "");
    setCaptcha(digits);
    setCaptchaError(validateCaptcha(digits, true));
  };

  /**
   * 处理新密码输入变更
   */
  const handleNewPasswordChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value;
    setNewPassword(value);
    setPasswordError(value ? validatePassword(value) : "");
    if (confirmPassword) {
      setConfirmPasswordError(validateConfirmPassword(value, confirmPassword));
    }
  };

  /**
   * 处理确认密码输入变更
   */
  const handleConfirmPasswordChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value;
    setConfirmPassword(value);
    setConfirmPasswordError(
      value ? validateConfirmPassword(newPassword, value) : ""
    );
  };

  /**
   * 处理发送验证码请求
   */
  const handleSendCaptcha = () => {
    if (captchaCountdown > 0) return;
    const emailMessage = validateEmail(email);
    setEmailError(emailMessage);
    if (emailMessage) {
      setFormError("请先输入有效的邮箱地址，再发送验证码");
      return;
    }
    setFormError("");
    setSliderVisible(true);
    setSliderVerified(false);
    setSliderCaptchaInfo(null);
    setSliderError("");
  };

  /**
   * 请求滑块验证码数据
   */
  const requestSliderCaptcha = async () => {
    try {
      const data = await preCheckAndGetCaptcha();
      setSliderCaptchaInfo(data);
      if (data.y) {
        setPuzzleTop(data.y);
      }
      return {
        bgUrl: data.bgUrl,
        puzzleUrl: data.puzzleUrl,
        y: data.y
      };
    } catch (error) {
      setSliderError("滑块验证码加载失败，请稍后重试");
      throw error;
    }
  };

  /**
   * 处理滑块验证提交
   */
  const handleSliderVerify = async (data: VerifyParam) => {
    if (!sliderCaptchaInfo) {
      setSliderError("验证码已失效，请刷新重试");
      return Promise.reject();
    }

    setSliderError("");
    try {
      const result = await verifySliderCaptcha({
        scene: "forgot_email",
        uuid: sliderCaptchaInfo.uuid,
        ...data,
      });

      if (!result.passed) {
        setSliderError("验证失败，请重新尝试");
        return Promise.reject();
      }

      /** 滑块验证通过后，发送密码重置验证码 */
      await sendPasswordResetCode(email.trim(), result.verifyToken);

      setSliderVerified(true);
      setSliderVisible(false);
      setCodeSent(true);
      setCaptchaCountdown(60);
      return Promise.resolve();
    } catch (error) {
      setSliderError("网络异常，验证失败，请稍后重试");
      return Promise.reject(error);
    }
  };

  /**
   * 处理重置密码表单提交
   */
  const handleResetSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (submitting) return;

    const passwordMessage = validatePassword(newPassword);
    const confirmMessage = validateConfirmPassword(newPassword, confirmPassword);
    setPasswordError(passwordMessage);
    setConfirmPasswordError(confirmMessage);

    if (passwordMessage || confirmMessage) {
      setFormError("请先修正表单中的错误后再尝试重置密码");
      return;
    }

    if (!verifyToken) {
      setFormError("验证令牌已过期，请重新验证");
      return;
    }

    setFormError("");
    setSubmitting(true);

    try {
      const publicKeyData = await getPublicKey();
      const encryptedPassword = await rsaEncrypt(newPassword, publicKeyData.publicKey);
      
      /** 使用新的三步流程重置密码 */
      await resetPassword(email.trim(), verifyToken, encryptedPassword);
      
      window.setTimeout(() => {
        navigate(routes.login);
      }, 800);
    } catch {
      setFormError("密码重置失败，请稍后重试");
    } finally {
      setSubmitting(false);
    }
  };

  // ===== 9. 页面初始化与事件绑定 =====
  // 初始化校验或数据预取（如果有）
  React.useEffect(() => {
    let ignore = false;
    const timer = setTimeout(() => {
      if (!ignore) {
        // 这里可以执行页面进入时的初始化逻辑，如检查账号状态等
        // 目前仅作为重复调用修复模式的占位和参考
      }
    }, 0);
    return () => {
      ignore = true;
      clearTimeout(timer);
    };
  }, []);

  /**
   * 渲染主体 JSX
   */
  return (
    <div className="min-h-screen flex bg-[var(--bg-color)] text-[var(--text-color)]">
      {/* 左侧装饰区 */}
      <div className="hidden lg:flex lg:basis-2/3 relative overflow-hidden bg-slate-950">
        <AnimatePresence mode="wait">
          <motion.img
            key={currentBgIndex}
            src={BG_IMAGES[currentBgIndex]}
            alt="Background"
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/30 via-slate-950/40 to-black/50" />
        <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_0%_0%,rgba(244,114,182,0.2),transparent_60%),radial-gradient(circle_at_100%_100%,rgba(56,189,248,0.2),transparent_60%)]" />
        <div className="relative z-10 flex flex-col justify-between p-10 xl:p-14 w-full">
          <div className="flex items-center justify-between text-xs text-slate-200/80">
            <div className="flex items-center gap-2">
              <img
                src="/logo/MyLogoSvg.svg"
                alt="Logo"
                className="w-8 h-8 rounded-lg object-contain"
              />
              <div className="space-y-0.5">
                <div className="text-sm font-semibold">知识库小破站</div>
                <div className="text-[11px] text-slate-200/70">
                  找回你的登录入口
                </div>
              </div>
            </div>
            <Button
              isIconOnly
              variant="light"
              className="group text-white/70 transition-all hover:bg-transparent data-[hover=true]:bg-transparent"
              aria-label="返回前台"
              onPress={() => navigate(routes.home, { state: { fromAuth: true } })}
            >
              <RiHome4Line className="h-6 w-6 transition-all duration-500 group-hover:rotate-[360deg] group-hover:text-[var(--primary-color)]" />
            </Button>
          </div>
          <div className="mt-auto space-y-5 text-slate-100">
            <Shuffle
              text="密码忘了没关系，把入口发到你的邮箱里"
              tag="h2"
              className="text-2xl font-semibold tracking-tight"
              triggerOnHover={false}
              loop={true}
              loopDelay={5000}
            />
            <TextType
              text="输入绑定邮箱后，我们将发送验证码帮助你重置登录密码。验证码仅在短时间内有效，请注意查收邮件。"
              asElement="p"
              className="text-xs text-slate-200/80 leading-relaxed max-w-md"
              typingSpeed={50}
              showCursor={true}
              loop={false}
              hideCursorOnComplete={true}
              initialDelay={500}
            />
          </div>
          <div className="text-[11px] text-slate-400/80">
            如遇异常无法收取邮件，请稍后重试或联系管理员。
          </div>
        </div>
      </div>

      {/* 右侧表单区 */}
      <div className="flex-1 lg:basis-1/3 flex items-center justify-center px-4 py-10 sm:px-6 lg:px-10">
        <div className="w-full max-w-sm space-y-8">
          <div className="space-y-2 text-center">
            <div className="inline-flex items-center justify-center rounded-2xl bg-[color-mix(in_srgb,var(--primary-color)_8%,transparent)] px-3 py-1 text-[11px] text-[var(--primary-color)]">
              <span className="mr-1 h-1.5 w-1.5 rounded-full bg-[var(--primary-color)]" />
              <span>找回密码</span>
            </div>
            <h1 className="text-xl font-semibold tracking-tight">
              通过三步验证重置登录密码
            </h1>
            <p className="text-[11px] text-[var(--text-color-secondary)]">
              按照步骤完成身份确认、验证码验证与密码重置。
            </p>
          </div>

          <div className="space-y-6">
            <Stepper
              steps={[
                { id: "identity", title: "身份验证", subtitle: "确认账号是否存在" },
                { id: "captcha", title: "验证码验证", subtitle: "校验邮箱验证码" },
                { id: "reset", title: "重置密码", subtitle: "设置新的登录密码" },
              ]}
              currentIndex={stepIndex}
              onChange={(index) => setStepIndex(index)}
            />

            {formError ? (
              <div className="rounded-[var(--radius-base)] border border-red-500/60 bg-red-500/5 px-3 py-2 text-[11px] text-red-300">
                {formError}
              </div>
            ) : null}

            {stepIndex === 0 && (
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  if (!account.trim()) return;
                  setStepIndex(1);
                }}
                className="space-y-5"
              >
                <div className="space-y-1.5 text-xs">
                  <Input
                    label="账号"
                    labelPlacement="inside"
                    isRequired
                    value={account}
                    onChange={handleAccountChange}
                    description="请输入绑定账号"
                    size="sm"
                    variant="flat"
                    className="text-xs"
                    isInvalid={!!accountError}
                    errorMessage={accountError}
                    classNames={{
                      helperWrapper: "min-h-0 p-0 mt-1",
                      errorMessage: "text-[11px] font-normal leading-none",
                    }}
                  />
                  {account && !accountError && (
                    <div className="text-[10px] text-emerald-400">
                      账号格式正确
                    </div>
                  )}
                </div>

                <InteractiveHoverButton
                  type="submit"
                  disabled={Boolean(accountError) || !account.trim()}
                  className="w-full"
                  onClick={(event) => {
                    event.preventDefault();
                    const message = validateAccount(account);
                    setAccountError(message);
                    if (message) {
                      setFormError("请先输入有效的账号，再继续下一步");
                      return;
                    }
                    setFormError("");
                    setStepIndex(1);
                  }}
                >
                  下一步：验证邮箱
                </InteractiveHoverButton>
              </form>
            )}

            {stepIndex === 1 && (
              <form
                onSubmit={async (event) => {
                  event.preventDefault();
                  const emailMessage = validateEmail(email);
                  const captchaMessage = validateCaptcha(captcha, true);
                  setEmailError(emailMessage);
                  setCaptchaError(captchaMessage);
                  if (emailMessage || captchaMessage || !sliderVerified) {
                    setFormError(
                      !sliderVerified
                        ? "请先完成滑块验证并获取验证码"
                        : "请先修正表单中的错误后再继续"
                    );
                    return;
                  }
                  
                  setFormError("");
                  setSubmitting(true);
                  
                  try {
                    /** 验证验证码并获取verifyToken */
                    const token = await verifyResetCode(email.trim(), captcha);
                    setVerifyToken(token);
                    setStepIndex(2);
                  } catch {
                    setFormError("验证码验证失败，请检查验证码是否正确");
                  } finally {
                    setSubmitting(false);
                  }
                }}
                className="space-y-5"
              >
                <div className="space-y-1.5 text-xs">
                  <Input
                    label="邮箱"
                    labelPlacement="inside"
                    isRequired
                    value={email}
                    onChange={handleEmailChange}
                    description="请输入绑定邮箱地址"
                    size="sm"
                    variant="flat"
                    className="text-xs"
                    isInvalid={!!emailError}
                    errorMessage={emailError}
                    classNames={{
                      helperWrapper: "min-h-0 p-0 mt-1",
                      errorMessage: "text-[11px] font-normal leading-none",
                    }}
                  />
                  {email && !emailError && (
                    <div className="text-[10px] text-emerald-400">
                      邮箱格式正确
                    </div>
                  )}
                </div>

                <div className="space-y-1.5 text-xs">
                  <label className="text-xs font-medium text-foreground pb-1.5 inline-block">
                    邮箱验证码
                  </label>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                      <InputOtp
                        length={6}
                        value={captcha}
                        onValueChange={handleCaptchaChange}
                        size="sm"
                        variant="flat"
                        radius="md"
                        isDisabled={!codeSent}
                        isInvalid={!!captchaError}
                        errorMessage={captchaError}
                        classNames={{
                          base: "flex-1",
                          wrapper: "flex-1",
                          segmentWrapper: "w-full justify-between gap-1.5",
                          segment: "w-9 h-9 text-sm",
                          helperWrapper: "min-h-[1.25rem]",
                        }}
                      />
                      <Button
                        size="sm"
                        radius="full"
                        variant="flat"
                        onPress={handleSendCaptcha}
                        isDisabled={captchaCountdown > 0}
                        className="h-9 w-[8.5rem] justify-center text-[11px] font-medium bg-[color-mix(in_srgb,var(--primary-color)_14%,transparent)] text-[var(--primary-color)] hover:bg-[color-mix(in_srgb,var(--primary-color)_20%,transparent)] disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {captchaCountdown > 0
                          ? `${captchaCountdown}s 后可重发`
                          : "发送验证码"}
                      </Button>
                    </div>
                  </div>
                </div>

                <InteractiveHoverButton
                  type="submit"
                  disabled={
                    submitting ||
                    !email ||
                    Boolean(emailError) ||
                    !codeSent ||
                    captcha.length !== 6
                  }
                  className="w-full"
                >
                  {submitting ? "验证中..." : "提交验证并进入重置密码"}
                </InteractiveHoverButton>
              </form>
            )}

            {stepIndex === 2 && (
              <form onSubmit={handleResetSubmit} className="space-y-5">
                <div className="space-y-1.5 text-xs">
                  <Input
                    label="新密码"
                    labelPlacement="inside"
                    isRequired
                    type="password"
                    value={newPassword}
                    onChange={handleNewPasswordChange}
                    description="请输入新的登录密码"
                    size="sm"
                    variant="flat"
                    className="text-xs"
                    isInvalid={!!passwordError}
                    errorMessage={passwordError}
                    classNames={{
                      helperWrapper: "min-h-0 p-0 mt-1",
                      errorMessage: "text-[11px] font-normal leading-none",
                    }}
                  />
                </div>

                <div className="space-y-1.5 text-xs">
                  <Input
                    label="确认新密码"
                    labelPlacement="inside"
                    isRequired
                    type="password"
                    value={confirmPassword}
                    onChange={handleConfirmPasswordChange}
                    description="请再次输入新密码"
                    size="sm"
                    variant="flat"
                    className="text-xs"
                    isInvalid={!!confirmPasswordError}
                    errorMessage={confirmPasswordError}
                    classNames={{
                      helperWrapper: "min-h-0 p-0 mt-1",
                      errorMessage: "text-[11px] font-normal leading-none",
                    }}
                  />
                </div>

                <InteractiveHoverButton
                  type="submit"
                  disabled={
                    submitting ||
                    Boolean(passwordError) ||
                    Boolean(confirmPasswordError) ||
                    !newPassword ||
                    !confirmPassword
                  }
                  className="w-full"
                >
                  {submitting ? "提交中..." : "重置密码"}
                </InteractiveHoverButton>
              </form>
            )}

            <div className="flex items-center justify-center pt-2">
              <HeroLink
                size="sm"
                onPress={() => navigate(routes.login)}
                className="cursor-pointer text-[11px] text-[var(--text-color-secondary)] hover:text-[var(--primary-color)] transition-colors"
              >
                想起密码了？返回登录
              </HeroLink>
            </div>
          </div>
        </div>
      </div>

      {/* 滑块验证模态框 */}
      <Modal
        isOpen={sliderVisible}
        onOpenChange={(open) => {
          setSliderVisible(open);
          if (!open) {
            setSliderCaptchaInfo(null);
            setSliderError("");
          }
        }}
        size="sm"
        placement="center"
        backdrop="blur"
        classNames={{
          base: "bg-[var(--bg-elevated)] text-[var(--text-color)] max-w-[420px]",
          header: "border-b border-[var(--border-color)] py-3 px-4",
          body: "p-4",
        }}
      >
        <ModalContent>
          {() => (
            <>
              <ModalHeader className="text-sm font-semibold">
                安全验证
              </ModalHeader>
              <ModalBody>
                <div className="flex flex-col items-center justify-center space-y-3">
                  <div className="rounded-lg overflow-hidden border border-[var(--border-color)]">
                    <SliderCaptcha
                      request={requestSliderCaptcha}
                      onVerify={handleSliderVerify}
                      bgSize={{ width: 300, height: 150 }}
                      puzzleSize={{ width: 50, height: 50, top: puzzleTop }}
                    />
                  </div>
                  {sliderError ? (
                    <div className="text-[11px] text-red-400 w-full text-center">
                      {sliderError}
                    </div>
                  ) : null}
                </div>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

// ===== 11. 导出区域 =====
export default ForgotPasswordPage;
