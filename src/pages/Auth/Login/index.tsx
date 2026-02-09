// ===== 1. 依赖导入区域 =====
import React from "react";
import { useNavigate } from "react-router-dom";
import SliderCaptcha, { type VerifyParam } from "rc-slider-captcha";
import { AnimatePresence, motion } from "framer-motion";
import {
  Button,
  Card,
  Checkbox,
  Input,
  InputOtp,
  Link as HeroLink,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader
} from "@heroui/react";
import { routes } from "@/router/routes";
import InteractiveHoverButton from "@/components/Motion/InteractiveHoverButton";
import { useUserStore } from "@/store/modules/userStore";
import { useAppStore } from "@/store";
import { UserAgreementModal, PrivacyPolicyModal } from "@/components/AgreementModals";
import { verifySliderCaptcha, preCheckAndGetCaptcha, login, type SliderCaptchaData } from "@/api/auth";
import Shuffle from "@/components/Motion/Shuffle";
import TextType from "@/components/Motion/TextType";
import { RiHome4Line } from "react-icons/ri";
import { FaEye, FaEyeSlash, FaQq, FaWeixin, FaGithub } from "react-icons/fa6";

// ===== 2. TODO待处理导入区域 =====

// ===== 3. 状态控制逻辑区域 =====
/**
 * 背景图片列表
 */
const BG_IMAGES = [
  "/auth/auth-Polling-1.png",
  "/auth/auth-Polling-2.png",
  "/auth/auth-Polling-3.png"
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

// ===== 5. 注释代码函数区 =====

// ===== 6. 错误处理函数区域 =====

// ===== 7. 数据处理函数区域 =====

// ===== 8. UI渲染逻辑区域 =====
/**
 * 登录页面组件
 */
function LoginPage() {
  const navigate = useNavigate();
  const { setToken, setUserId, setAvatar } = useUserStore();
  const { setIsLoading } = useAppStore();

  // --- 状态定义 ---
  const [account, setAccount] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [captcha, setCaptcha] = React.useState("");
  const [agree, setAgree] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [passwordVisible, setPasswordVisible] = React.useState(false);
  const [accountError, setAccountError] = React.useState("");
  const [passwordError, setPasswordError] = React.useState("");
  const [captchaError, setCaptchaError] = React.useState("");
  const [formError, setFormError] = React.useState("");
  const [requireCaptcha, setRequireCaptcha] = React.useState(false);
  const [captchaCountdown, setCaptchaCountdown] = React.useState(0);
  const [sliderVisible, setSliderVisible] = React.useState(false);
  const [sliderVerified, setSliderVerified] = React.useState(false);
  const [sliderCaptchaInfo, setSliderCaptchaInfo] = React.useState<SliderCaptchaData | null>(null);
  const [sliderError, setSliderError] = React.useState("");
  const [showUserAgreement, setShowUserAgreement] = React.useState(false);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = React.useState(false);
  const [codeSent, setCodeSent] = React.useState(false);
  const [currentBgIndex, setCurrentBgIndex] = React.useState(0);

  // ===== 9. 页面初始化与事件绑定 =====
  React.useEffect(() => {
    let ignore = false;
    const timer = setTimeout(() => {
      if (!ignore) {
        // 登录失败计数检查
        try {
          const failRaw = window.localStorage.getItem("auth_login_fail_count");
          const fail = failRaw ? Number.parseInt(failRaw, 10) || 0 : 0;
          if (fail >= 5) {
            setRequireCaptcha(true);
          }
        } catch {
          // ignore
        }
      }
    }, 0);
    return () => {
      ignore = true;
      clearTimeout(timer);
    };
  }, []);

  // --- 页面副作用 ---
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

  // --- 辅助函数 ---
  const recordLoginFail = () => {
    try {
      const failRaw = window.localStorage.getItem("auth_login_fail_count");
      const current = failRaw ? Number.parseInt(failRaw, 10) || 0 : 0;
      const next = current + 1;
      window.localStorage.setItem("auth_login_fail_count", String(next));
      if (next >= 5) setRequireCaptcha(true);
    } catch {
      // ignore
    }
  };

  const resetLoginFail = () => {
    setRequireCaptcha(false);
    try {
      window.localStorage.removeItem("auth_login_fail_count");
    } catch {
      // ignore
    }
  };

  // --- 事件处理函数 ---
  const handleAccountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setAccount(value);
    if (!value) {
      setAccountError("");
    } else {
      setAccountError(validateAccount(value));
    }
  };

  const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setPassword(value);
    if (!value) {
      setPasswordError("");
    } else {
      setPasswordError(validatePassword(value));
    }
  };

  const handleCaptchaChange = (value: string) => {
    const digits = value.replace(/\D/g, "");
    setCaptcha(digits);
    setCaptchaError(validateCaptcha(digits, requireCaptcha || sliderVerified));
  };

  const handleSendCaptcha = () => {
    if (captchaCountdown > 0) return;

    const accountMessage = validateAccount(account);
    const passwordMessage = validatePassword(password);

    setAccountError(accountMessage);
    setPasswordError(passwordMessage);

    if (accountMessage || passwordMessage) {
      setFormError("请先输入正确的账号和密码，再发送验证码");
      return;
    }

    setFormError("");
    setSliderVisible(true);
    setSliderVerified(false);
    setSliderCaptchaInfo(null);
    setSliderError("");
  };

  const requestSliderCaptcha = async () => {
    try {
      const data = await preCheckAndGetCaptcha({
        account: account.trim(),
        password: password,
        scene: "login_email"
      });
      setSliderCaptchaInfo(data);
      return {
        bgUrl: data.bgUrl,
        puzzleUrl: data.puzzleUrl
      };
    } catch (error) {
      setSliderError("滑块验证码加载失败，请稍后重试");
      throw error;
    }
  };

  const handleSliderVerify = async (data: VerifyParam) => {
    if (!sliderCaptchaInfo) {
      setSliderError("验证码已失效，请刷新重试");
      return Promise.reject();
    }
    try {
      setSliderError("");
      const result = await verifySliderCaptcha({
        scene: "login_email",
        uuid: sliderCaptchaInfo.uuid,
        account: account.trim(),
        ...data
      });
      if (!result.passed) {
        setSliderError("验证失败，请重新尝试");
        return Promise.reject();
      }
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

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (submitting) return;

    const accountMessage = validateAccount(account);
    const passwordMessage = validatePassword(password);
    const captchaMessage = validateCaptcha(captcha, true);

    setAccountError(accountMessage);
    setPasswordError(passwordMessage);
    setCaptchaError(captchaMessage);

    if (accountMessage || passwordMessage || captchaMessage) {
      setFormError("请先修正表单中的错误后再尝试登录");
      recordLoginFail();
      return;
    }

    if (!codeSent || !sliderVerified) {
      setCaptchaError("请先获取并输入邮箱验证码");
      setFormError("请先完成滑块验证并获取验证码");
      recordLoginFail();
      return;
    }

    if (!agree) {
      setFormError("请阅读并同意用户协议和隐私政策");
      return;
    }

    setFormError("");
    setSubmitting(true);

    try {
      const isEmail = account.includes("@");
      const res = await login({
        type: isEmail ? "email" : "account",
        username: !isEmail ? account : undefined,
        email: isEmail ? account : undefined,
        password: password,
        code: captcha
      });

      setToken(res.token);
      setUserId(res.user.id);
      setAvatar(res.user.avatar);
      resetLoginFail();

      setIsLoading(true);
      navigate(routes.admin, { state: { fromAuth: true } });
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "网络异常，请稍后再试");
      recordLoginFail();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[var(--bg-color)] text-[var(--text-color)]">
      <div className="hidden lg:flex lg:basis-2/3 relative overflow-hidden bg-slate-950">
        <AnimatePresence>
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
        <div className="relative z-10 flex flex-col p-10 xl:p-14 w-full h-full">
          <div className="flex items-center justify-between text-xs text-slate-200/80">
            <div className="flex items-center gap-2">
              <img
                src="/logo/MyLogoSvg.svg"
                alt="Logo"
                className="w-8 h-8 rounded-lg object-contain"
              />
              <div className="space-y-0.5">
                <div className="text-sm font-semibold">知识库小破站</div>
                <div className="text-[10px] text-slate-200/70">
                  Personal Knowledge Hub
                </div>
              </div>
            </div>
            <Button
              isIconOnly
              variant="light"
              className="group text-white/70 transition-all hover:bg-transparent data-[hover=true]:bg-transparent"
              aria-label="返回前台"
              onPress={() => {
                setIsLoading(true);
                navigate(routes.home, { state: { fromAuth: true } });
              }}
            >
              <RiHome4Line className="h-6 w-6 transition-all duration-500 group-hover:rotate-[360deg] group-hover:text-[var(--primary-color)]" />
            </Button>
          </div>
          <div className="mt-auto space-y-6 text-slate-100">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full bg-black/30 px-3 py-1 text-[11px]">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                <span>专注个人知识管理与创作的轻量级小站</span>
              </div>
              <Shuffle
                text="将零散灵感收纳进一座有序的知识库"
                tag="h2"
                className="text-2xl font-semibold tracking-tight"
                triggerOnHover={false}
                loop={true}
                loopDelay={5000}
              />
              <TextType
                text="支持文档、视频、工具百宝袋等多种内容形态，帮助你搭建一套长期可维护的知识体系。"
                asElement="p"
                className="text-xs text-slate-200/80 leading-relaxed max-w-md"
                typingSpeed={50}
                showCursor={true}
                loop={false}
                hideCursorOnComplete={true}
                initialDelay={500}
              />
            </div>
            <div className="grid grid-cols-3 gap-3 text-[11px]">
              <Card className="rounded-2xl border border-white/10 bg-black/20 backdrop-blur-md px-3 py-2.5 shadow-sm">
                <div className="font-medium mb-0.5">知识空间</div>
                <div className="text-[10px] text-slate-300/90">
                  结构化管理你的文档与代码片段。
                </div>
              </Card>
              <Card className="rounded-2xl border border-white/10 bg-black/20 backdrop-blur-md px-3 py-2.5 shadow-sm">
                <div className="font-medium mb-0.5">创作中台</div>
                <div className="text-[10px] text-slate-300/90">
                  富文本与 Markdown 双模式写作。
                </div>
              </Card>
              <Card className="rounded-2xl border border-white/10 bg-black/20 backdrop-blur-md px-3 py-2.5 shadow-sm">
                <div className="font-medium mb-0.5">前台展示</div>
                <div className="text-[10px] text-slate-300/90">
                  把作品以知识库小站的形式呈现。
                </div>
              </Card>
            </div>
          </div>
          <div className="mt-8 text-[10px] text-slate-400/80">
            © {new Date().getFullYear()} 知识库小破站 · Frontend Playground
          </div>
        </div>
      </div>

      <div className="flex-1 lg:basis-1/3 flex items-center justify-center px-4 py-10 sm:px-6 lg:px-10">
        <div className="w-full max-w-sm space-y-8">
          <div className="space-y-2 text-center">
            <div className="inline-flex items-center justify-center rounded-2xl bg-[color-mix(in_srgb,var(--primary-color)_8%,transparent)] px-3 py-1 text-[10px] text-[var(--primary-color)]">
              <span className="mr-1 h-1.5 w-1.5 rounded-full bg-[var(--primary-color)]" />
              <span>欢迎回到知识库小破站</span>
            </div>
            <h1 className="text-xl font-semibold tracking-tight">
              登录并继续你的知识旅程
            </h1>
            <p className="text-[11px] text-[var(--text-color-secondary)]">
              支持邮箱或用户名登录，已启用基础安全保护。
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-2">
            <div className="space-y-1.5 text-xs">
              <Input
                label="账号"
                labelPlacement="inside"
                isRequired
                value={account}
                onChange={handleAccountChange}
                description={
                  account && !accountError ? (
                    <span className="text-emerald-400">账号格式正确</span>
                  ) : (
                    "请输入邮箱或用户名"
                  )
                }
                size="sm"
                variant="flat"
                className="text-xs"
                isInvalid={!!accountError}
                errorMessage={accountError}
                classNames={{
                  helperWrapper: "min-h-0 p-0 mt-1",
                  description: "text-[11px] font-normal leading-none",
                  errorMessage: "text-[11px] font-normal leading-none"
                }}
              />
            </div>

            <div className="space-y-1.5 text-xs">
              <Input
                label="密码"
                labelPlacement="inside"
                isRequired
                type={passwordVisible ? "text" : "password"}
                value={password}
                onChange={handlePasswordChange}
                description="请输入登录密码"
                size="sm"
                variant="flat"
                className="text-xs"
                isInvalid={!!passwordError}
                errorMessage={passwordError}
                classNames={{
                  helperWrapper: "min-h-0 p-0 mt-1",
                  errorMessage: "text-[11px] font-normal leading-none"
                }}
                endContent={
                  <Button
                    isIconOnly
                    variant="light"
                    radius="full"
                    size="sm"
                    className="min-w-0 h-auto"
                    onPress={() => setPasswordVisible(previous => !previous)}
                    aria-label="toggle password visibility"
                  >
                    {passwordVisible ? (
                      <FaEyeSlash className="text-2xl text-default-400 pointer-events-none" />
                    ) : (
                      <FaEye className="text-2xl text-default-400 pointer-events-none" />
                    )}
                  </Button>
                }
              />
            </div>

            <div className="space-y-1.5 text-xs">
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
                      helperWrapper: "min-h-[1.25rem]"
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
                      : "发送邮箱验证码"}
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              {formError ? (
                <div className="rounded-[var(--radius-base)] border border-red-500/60 bg-red-500/5 px-3 py-2 text-[11px] text-red-300">
                  {formError}
                </div>
              ) : null}
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-2 text-xs text-[var(--text-color-secondary)]">
                  <Checkbox
                    isSelected={agree}
                    onValueChange={setAgree}
                    name="agreement"
                  />
                  <span className="inline-flex items-center gap-1">
                    <span>我已阅读并同意</span>
                    <HeroLink
                      href="#"
                      underline="hover"
                      className="text-[11px] text-[var(--primary-color)]"
                      onPress={() => {
                        setShowUserAgreement(true);
                      }}
                    >
                      用户协议
                    </HeroLink>
                    <span>和</span>
                    <HeroLink
                      href="#"
                      underline="hover"
                      className="text-[11px] text-[var(--primary-color)]"
                      onPress={() => {
                        setShowPrivacyPolicy(true);
                      }}
                    >
                      隐私政策
                    </HeroLink>
                  </span>
                </div>
                <HeroLink
                  href={routes.forgotPassword}
                  underline="hover"
                  className="text-[11px] text-[var(--text-color-secondary)] hover:text-[var(--primary-color)]"
                >
                  忘记密码？
                </HeroLink>
              </div>

              <InteractiveHoverButton
                type="submit"
                disabled={
                  submitting ||
                  !agree ||
                  !account ||
                  !password ||
                  Boolean(accountError) ||
                  Boolean(passwordError) ||
                  captcha.length !== 6 ||
                  Boolean(captchaError)
                }
                className="w-full"
              >
                {submitting ? "登录中..." : "立即登录"}
              </InteractiveHoverButton>

              <div className="flex items-center gap-3 my-6">
                <div className="flex-1 border-t border-[var(--border-color)]" />
                <span className="text-xs uppercase text-[var(--text-color-secondary)] whitespace-nowrap">
                  或通过以下方式继续
                </span>
                <div className="flex-1 border-t border-[var(--border-color)]" />
              </div>

              <div className="flex justify-center gap-6">
                {/* 社交登录按钮暂未实现功能，仅展示 UI */}
                 <Button isIconOnly variant="flat" radius="full" className="bg-[var(--bg-elevated)] text-[var(--text-color-secondary)] hover:text-[var(--primary-color)] hover:bg-[var(--primary-color)]/10" aria-label="Github Login">
                  <FaGithub className="text-xl" />
                </Button>
                <Button isIconOnly variant="flat" radius="full" className="bg-[var(--bg-elevated)] text-[var(--text-color-secondary)] hover:text-[#12B7F5] hover:bg-[#12B7F5]/10" aria-label="QQ Login">
                  <FaQq className="text-xl" />
                </Button>
                <Button isIconOnly variant="flat" radius="full" className="bg-[var(--bg-elevated)] text-[var(--text-color-secondary)] hover:text-[#07C160] hover:bg-[#07C160]/10" aria-label="WeChat Login">
                  <FaWeixin className="text-xl" />
                </Button>
              </div>

              <div className="text-center text-xs text-[var(--text-color-secondary)] mt-4">
                还没有账号？{" "}
                <HeroLink
                  href={routes.register}
                  underline="hover"
                  className="text-xs font-medium text-[var(--primary-color)]"
                >
                  立即注册
                </HeroLink>
              </div>
            </div>
          </form>
        </div>
      </div>

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
        backdrop="blur"
        placement="center"
        classNames={{
          base: "bg-[var(--bg-elevated)] text-[var(--text-color)] max-w-[420px]",
          header: "border-b border-[var(--border-color)] py-3 px-4",
          body: "p-4"
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
                      bgSize={{ width: 380, height: 200 }}
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

      <UserAgreementModal
        isOpen={showUserAgreement}
        onOpenChange={setShowUserAgreement}
      />
      <PrivacyPolicyModal
        isOpen={showPrivacyPolicy}
        onOpenChange={setShowPrivacyPolicy}
      />
    </div>
  );
}

// ===== 10. TODO任务管理区域 =====

// ===== 11. 导出区域 =====
export default LoginPage;
