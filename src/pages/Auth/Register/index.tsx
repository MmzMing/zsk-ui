import React from "react";
import { useNavigate } from "react-router-dom";
import SliderCaptcha, { VerifyParam } from "rc-slider-captcha";
import { FaEye, FaEyeSlash } from "react-icons/fa6";
import {
  Button,
  Checkbox,
  Input,
  InputOtp,
  Link as HeroLink,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader
} from "@heroui/react";
import { routes } from "../../../router/routes";
import InteractiveHoverButton from "../../../components/Motion/InteractiveHoverButton";
import { UserAgreementModal, PrivacyPolicyModal } from "../../../components/AgreementModals";
import { fetchSliderCaptcha, verifySliderCaptcha } from "../../../api/auth";

function RegisterPage() {
  const navigate = useNavigate();
  const [email, setEmail] = React.useState("");
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [captcha, setCaptcha] = React.useState("");
  const [agree, setAgree] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [passwordVisible, setPasswordVisible] = React.useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = React.useState(false);
  const [emailError, setEmailError] = React.useState("");
  const [usernameError, setUsernameError] = React.useState("");
  const [passwordError, setPasswordError] = React.useState("");
  const [confirmPasswordError, setConfirmPasswordError] = React.useState("");
  const [captchaError, setCaptchaError] = React.useState("");
  const [formError, setFormError] = React.useState("");
  const [passwordStrength, setPasswordStrength] = React.useState("");
  const [sliderVisible, setSliderVisible] = React.useState(false);
  const [sliderVerified, setSliderVerified] = React.useState(false);
  const [sliderCaptchaInfo, setSliderCaptchaInfo] = React.useState<{
    uuid: string;
    bgUrl: string;
    puzzleUrl: string;
  } | null>(null);
  const [sliderError, setSliderError] = React.useState("");
  const [captchaCountdown, setCaptchaCountdown] = React.useState(0);
  const [showUserAgreement, setShowUserAgreement] = React.useState(false);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = React.useState(false);

  React.useEffect(() => {
    if (!captchaCountdown) return;
    const timer = window.setInterval(() => {
      setCaptchaCountdown(previous => {
        if (previous <= 1) {
          window.clearInterval(timer);
          return 0;
        }
        return previous - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [captchaCountdown]);

  function validateEmail(value: string) {
    const trimmed = value.trim();
    if (!trimmed) return "请输入邮箱地址";
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(trimmed)) return "邮箱格式不正确";
    return "";
  }

  function validateUsername(value: string) {
    const trimmed = value.trim();
    if (!trimmed) return "请输入用户名";
    const usernamePattern = /^[a-zA-Z0-9_.-]{3,20}$/;
    if (!usernamePattern.test(trimmed)) return "用户名需为 3-20 位字母、数字或符号 ._-";
    return "";
  }

  function evaluatePasswordStrength(value: string) {
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
  }

  function validatePassword(value: string) {
    if (!value) return "请输入登录密码";
    if (value.length < 8) return "密码长度至少 8 位";
    return "";
  }

  function validateConfirmPassword(currentPassword: string, value: string) {
    if (!value) return "请再次输入密码";
    if (value !== currentPassword) return "两次输入的密码不一致";
    return "";
  }

  function validateCaptcha(value: string, required: boolean) {
    if (!value) {
      return required ? "请输入验证码" : "";
    }
    if (!/^\d{6}$/.test(value)) {
      return "验证码需为 6 位数字";
    }
    return "";
  }

  function handleEmailChange(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;
    setEmail(value);
    if (!value) {
      setEmailError("");
    } else {
      setEmailError(validateEmail(value));
    }
  }

  function handleUsernameChange(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;
    setUsername(value);
    if (!value) {
      setUsernameError("");
    } else {
      setUsernameError(validateUsername(value));
    }
  }

  function handlePasswordChange(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;
    setPassword(value);
    if (!value) {
      setPasswordError("");
      setPasswordStrength("");
    } else {
      setPasswordError(validatePassword(value));
      setPasswordStrength(evaluatePasswordStrength(value));
    }
    if (confirmPassword) {
      setConfirmPasswordError(validateConfirmPassword(value, confirmPassword));
    }
  }

  function handleConfirmPasswordChange(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;
    setConfirmPassword(value);
    if (!value) {
      setConfirmPasswordError("");
    } else {
      setConfirmPasswordError(validateConfirmPassword(password, value));
    }
  }

  function handleCaptchaChange(value: string) {
    const digits = value.replace(/\D/g, "");
    setCaptcha(digits);
    setCaptchaError(validateCaptcha(digits, sliderVerified));
  }

  function handleSendCaptcha() {
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
  }

  async function requestSliderCaptcha() {
    try {
      const data = await fetchSliderCaptcha("register_email");
      setSliderCaptchaInfo(data);
      return {
        bgUrl: data.bgUrl,
        puzzleUrl: data.puzzleUrl
      };
    } catch {
      setSliderError("滑块验证码加载失败，请稍后重试");
      throw new Error("request slider captcha failed");
    }
  }

  async function handleSliderVerify(data: VerifyParam) {
    if (!sliderCaptchaInfo) {
      setSliderError("验证码已失效，请刷新重试");
      return Promise.reject();
    }
    try {
      setSliderError("");
      const result = await verifySliderCaptcha({
        scene: "register_email",
        uuid: sliderCaptchaInfo.uuid,
        email: email.trim(),
        ...data
      });
      if (!result.passed) {
        setSliderError("验证失败，请重新尝试");
        return Promise.reject();
      }
      setSliderVerified(true);
      setSliderVisible(false);
      setCaptchaCountdown(60);
      return Promise.resolve();
    } catch {
      setSliderError("网络异常，验证失败，请稍后重试");
      return Promise.reject();
    }
  }

  async function hashPassword(value: string) {
    if (!window.crypto || !window.crypto.subtle) return value;
    const encoder = new TextEncoder();
    const data = encoder.encode(value);
    const digest = await window.crypto.subtle.digest("SHA-256", data);
    const bytes = Array.from(new Uint8Array(digest));
    return bytes.map(byte => byte.toString(16).padStart(2, "0")).join("");
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (submitting) return;

    const emailMessage = validateEmail(email);
    const usernameMessage = validateUsername(username);
    const passwordMessage = validatePassword(password);
    const confirmPasswordMessage = validateConfirmPassword(password, confirmPassword);
    const captchaMessage = validateCaptcha(captcha, sliderVerified);

    setEmailError(emailMessage);
    setUsernameError(usernameMessage);
    setPasswordError(passwordMessage);
    setConfirmPasswordError(confirmPasswordMessage);
    setCaptchaError(captchaMessage);

    if (emailMessage || usernameMessage || passwordMessage || confirmPasswordMessage || captchaMessage) {
      setFormError("请先修正表单中的错误后再尝试注册");
      return;
    }

    if (!sliderVerified) {
      setFormError("请先完成滑块验证并获取验证码");
      return;
    }

    if (!agree) {
      setFormError("请阅读并同意用户协议和隐私政策");
      return;
    }

    setFormError("");
    setSubmitting(true);

    try {
      await hashPassword(password);
      await new Promise(resolve => {
        window.setTimeout(resolve, 800);
      });
      navigate(routes.login);
    } catch {
      setFormError("网络异常，请稍后再试");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex bg-[var(--bg-color)] text-[var(--text-color)]">
      <div className="hidden lg:flex lg:basis-2/3 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-950 to-black" />
        <div className="absolute inset-0 opacity-80 bg-[radial-gradient(circle_at_0%_0%,rgba(244,114,182,0.35),transparent_55%),radial-gradient(circle_at_100%_100%,rgba(52,211,153,0.35),transparent_55%)]" />
        <div className="relative z-10 flex flex-col justify-between p-10 xl:p-14 w-full">
          <div className="flex items-center justify-between text-xs text-slate-200/80">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-[var(--primary-color)] flex items-center justify-center text-[var(--bg-elevated)] text-sm font-semibold">
                知
              </div>
              <div className="space-y-0.5">
                <div className="text-sm font-semibold">知识库小破站</div>
                <div className="text-[10px] text-slate-200/70">
                  从今天开始搭建你的知识档案
                </div>
              </div>
            </div>
            <Button
              size="sm"
              radius="full"
              variant="bordered"
              className="inline-flex items-center gap-1 bg-black/30 border-white/20 px-3 py-1 text-[10px] text-slate-100 hover:bg-black/50"
              onPress={() => navigate(routes.home)}
            >
              返回前台
            </Button>
          </div>
          <div className="space-y-5 text-slate-100">
            <h2 className="text-2xl font-semibold tracking-tight">
              为你的创作与学习准备一份「长期有效」的空间
            </h2>
            <p className="text-xs text-slate-200/80 leading-relaxed max-w-md">
              注册账号后，你可以集中管理文档、视频与各种灵感碎片，让知识沉淀下来，而不是沉在聊天记录里。
            </p>
          </div>
          <div className="text-[11px] text-slate-400/80">
            注册即表示你同意本站的使用约定与隐私说明。
          </div>
        </div>
      </div>

      <div className="flex-1 lg:basis-1/3 flex items-center justify-center px-4 py-10 sm:px-6 lg:px-10">
        <div className="w-full max-w-sm space-y-8">
          <div className="space-y-2 text-center">
            <div className="inline-flex items-center justify-center rounded-2xl bg-[color-mix(in_srgb,var(--primary-color)_8%,transparent)] px-3 py-1 text-[11px] text-[var(--primary-color)]">
              <span className="mr-1 h-1.5 w-1.5 rounded-full bg-[var(--primary-color)]" />
              <span>注册新账号</span>
            </div>
            <h1 className="text-xl font-semibold tracking-tight">
              创建你的知识库小破站身份
            </h1>
            <p className="text-[11px] text-[var(--text-color-secondary)]">
              建议使用常用邮箱，以便后续找回密码与接收通知。
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5 text-xs">
              <Input
                label="邮箱"
                labelPlacement="inside"
                isRequired
                value={email}
                onChange={handleEmailChange}
                description="请输入常用邮箱地址"
                size="sm"
                variant="flat"
                className="text-xs"
                isInvalid={!!emailError}
                errorMessage={emailError}
                classNames={{
                  helperWrapper: "min-h-0 p-0 mt-1",
                  errorMessage: "text-[11px] font-normal leading-none"
                }}
              />
              <div className="text-[11px] h-[1.25rem]">
                {email && !emailError ? (
                  <span className="text-emerald-400">邮箱格式正确</span>
                ) : null}
              </div>
            </div>

            <div className="space-y-1.5 text-xs">
              <Input
                label="用户名"
                labelPlacement="inside"
                isRequired
                value={username}
                onChange={handleUsernameChange}
                description="用于展示的昵称，可后续修改"
                size="sm"
                variant="flat"
                className="text-xs"
                isInvalid={!!usernameError}
                errorMessage={usernameError}
                classNames={{
                  helperWrapper: "min-h-0 p-0 mt-1",
                  errorMessage: "text-[11px] font-normal leading-none"
                }}
              />
              <div className="text-[11px] h-[1.25rem]">
                {username && !usernameError ? (
                  <span className="text-emerald-400">用户名格式正确</span>
                ) : null}
              </div>
            </div>

            <div className="space-y-1.5 text-xs">
              <Input
                label="密码"
                labelPlacement="inside"
                isRequired
                type={passwordVisible ? "text" : "password"}
                value={password}
                onChange={handlePasswordChange}
                description="建议至少 8 位，包含数字与字母"
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
                  <button
                    className="focus:outline-none"
                    type="button"
                    onClick={() => setPasswordVisible(previous => !previous)}
                    aria-label="toggle password visibility"
                  >
                    {passwordVisible ? (
                      <FaEyeSlash className="text-2xl text-default-400 pointer-events-none" />
                    ) : (
                      <FaEye className="text-2xl text-default-400 pointer-events-none" />
                    )}
                  </button>
                }
              />
              <div className="flex items-center justify-between text-[11px]">
                {passwordStrength ? (
                  <span
                    className={
                      passwordStrength === "弱"
                        ? "text-red-400"
                        : passwordStrength === "中"
                          ? "text-amber-300"
                          : "text-emerald-400"
                    }
                  >
                    密码强度：{passwordStrength}
                  </span>
                ) : null}
              </div>
            </div>

            <div className="space-y-1.5 text-xs">
              <Input
                label="确认密码"
                labelPlacement="inside"
                isRequired
                type={confirmPasswordVisible ? "text" : "password"}
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
                description="再次输入密码"
                size="sm"
                variant="flat"
                className="text-xs"
                isInvalid={!!confirmPasswordError}
                errorMessage={confirmPasswordError}
                classNames={{
                  helperWrapper: "min-h-0 p-0 mt-1",
                  errorMessage: "text-[11px] font-normal leading-none"
                }}
                endContent={
                  <button
                    className="focus:outline-none"
                    type="button"
                    onClick={() =>
                      setConfirmPasswordVisible(previous => !previous)
                    }
                    aria-label="toggle password visibility"
                  >
                    {confirmPasswordVisible ? (
                      <FaEyeSlash className="text-2xl text-default-400 pointer-events-none" />
                    ) : (
                      <FaEye className="text-2xl text-default-400 pointer-events-none" />
                    )}
                  </button>
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
                      : "发送验证码"}
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
              <Checkbox
                isSelected={agree}
                onValueChange={setAgree}
                name="agreement"
                className="inline-flex items-center gap-2 text-[var(--text-color-secondary)]"
                >
              </Checkbox>
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
              <InteractiveHoverButton
                type="submit"
                disabled={submitting || !agree}
                className="w-full"
              >
                {submitting ? "注册中..." : "注册"}
              </InteractiveHoverButton>
            </div>
          </form>

          <div className="flex items-center justify-center gap-2 text-[11px] text-[var(--text-color-secondary)]">
            <span>已经有账号？</span>
            <HeroLink
              href="#"
              underline="hover"
              className="text-[var(--primary-color)]"
              onPress={() => navigate(routes.login)}
            >
              立即登录
            </HeroLink>
          </div>
        </div>

        <Modal
          isOpen={sliderVisible}
          onOpenChange={isOpen => {
            setSliderVisible(isOpen);
            if (!isOpen) {
              setSliderCaptchaInfo(null);
              setSliderError("");
            }
          }}
          size="lg"
          backdrop="blur"
          placement="center"
          classNames={{
            base: "bg-[var(--bg-elevated)] text-[var(--text-color)]",
            header: "border-b border-[var(--border-color)]",
            body: "text-xs text-[var(--text-color-secondary)]"
          }}
        >
          <ModalContent>
            {() => (
              <>
                <ModalHeader className="text-sm font-semibold">
                  安全验证
                </ModalHeader>
                <ModalBody>
                  <div className="space-y-3">
                    <SliderCaptcha
                      request={requestSliderCaptcha}
                      onVerify={handleSliderVerify}
                      bgSize={{ width: 380, height: 200 }}
                    />
                    {sliderError ? (
                      <div className="text-[11px] text-red-400">
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
    </div>
  );
}

export default RegisterPage;
