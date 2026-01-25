import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { routes } from "../../../router/routes";
import { useNavigate } from "react-router-dom";
import SliderCaptcha, { VerifyParam } from "rc-slider-captcha";
import InteractiveHoverButton from "../../../components/Motion/InteractiveHoverButton";
import Stepper from "../../../components/Motion/Stepper";
import { Shuffle } from "../../../components/Motion/Shuffle";
import { TextType } from "../../../components/Motion/TextType";
import { RiHome4Line } from "react-icons/ri";
import {
  Button,
  Input,
  InputOtp,
  Link as HeroLink,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader
} from "@heroui/react";
import { verifySliderCaptcha, preCheckAndGetCaptcha, forgotPassword } from "../../../api/auth";

const bgImages = ["/auth/auth-Polling-1.png", "/auth/auth-Polling-2.png" , "/auth/auth-Polling-3.png"];

function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [currentBgIndex, setCurrentBgIndex] = React.useState(0);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBgIndex(prev => (prev + 1) % bgImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const [email, setEmail] = React.useState("");
  const [captcha, setCaptcha] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [stepIndex, setStepIndex] = React.useState(0);
  const [account, setAccount] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [accountError, setAccountError] = React.useState("");
  const [emailError, setEmailError] = React.useState("");
  const [captchaError, setCaptchaError] = React.useState("");
  const [passwordError, setPasswordError] = React.useState("");
  const [confirmPasswordError, setConfirmPasswordError] = React.useState("");
  const [formError, setFormError] = React.useState("");
  const [captchaCountdown, setCaptchaCountdown] = React.useState(0);
  const [sliderVisible, setSliderVisible] = React.useState(false);
  const [sliderVerified, setSliderVerified] = React.useState(false);
  const [sliderCaptchaInfo, setSliderCaptchaInfo] = React.useState<{
    uuid: string;
    bgUrl: string;
    puzzleUrl: string;
  } | null>(null);
  const [sliderError, setSliderError] = React.useState("");
  const [codeSent, setCodeSent] = React.useState(false);

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

  function validateAccount(value: string) {
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
  }

  function validateEmail(value: string) {
    const trimmed = value.trim();
    if (!trimmed) return "请输入邮箱地址";
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(trimmed)) return "邮箱格式不正确";
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

  function handleAccountChange(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;
    setAccount(value);
    if (!value) {
      setAccountError("");
    } else {
      setAccountError(validateAccount(value));
    }
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

  function handleCaptchaChange(value: string) {
    const digits = value.replace(/\D/g, "");
    setCaptcha(digits);
    setCaptchaError(validateCaptcha(digits, true));
  }

  function handleNewPasswordChange(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;
    setNewPassword(value);
    if (!value) {
      setPasswordError("");
    } else {
      setPasswordError(validatePassword(value));
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
      setConfirmPasswordError(validateConfirmPassword(newPassword, value));
    }
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
      const data = await preCheckAndGetCaptcha({
        account: email.trim(),
        scene: "forgot_email"
      });
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
        scene: "forgot_email",
        uuid: sliderCaptchaInfo.uuid,
        email: email.trim(),
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
    } catch {
      setSliderError("网络异常，验证失败，请稍后重试");
      return Promise.reject();
    }
  }

  async function handleResetSubmit(event: React.FormEvent) {
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
    
    if (!codeSent) {
      setFormError("请先获取并输入验证码");
      return;
    }

    setFormError("");
    setSubmitting(true);
    
    try {
      await forgotPassword({
        email: email,
        code: captcha,
        newPassword: newPassword
      });
      
      window.setTimeout(() => {
        setSubmitting(false);
        navigate(routes.login);
      }, 800);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "网络异常，请稍后再试");
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex bg-[var(--bg-color)] text-[var(--text-color)]">
      <div className="hidden lg:flex lg:basis-2/3 relative overflow-hidden bg-slate-950">
        <AnimatePresence mode="wait">
          <motion.img
            key={currentBgIndex}
            src={bgImages[currentBgIndex]}
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
                src="/logo/MyLogo.png"
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
              onChange={index => setStepIndex(index)}
            />

            {formError ? (
              <div className="rounded-[var(--radius-base)] border border-red-500/60 bg-red-500/5 px-3 py-2 text-[11px] text-red-300">
                {formError}
              </div>
            ) : null}

            {stepIndex === 0 && (
              <form
                onSubmit={event => {
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
                      errorMessage: "text-[11px] font-normal leading-none"
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
                  onClick={event => {
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
                onSubmit={event => {
                  event.preventDefault();
                  const emailMessage = validateEmail(email);
                  const captchaMessage = validateCaptcha(captcha, true);
                  setEmailError(emailMessage);
                  setCaptchaError(captchaMessage);
                  if (emailMessage || captchaMessage || !sliderVerified) {
                    setFormError(
                      !sliderVerified
                        ? "请先完成滑块验证并获取验证码"
                        : "请先修正表单中的错误后再继续",
                    );
                    return;
                  }
                  setFormError("");
                  setStepIndex(2);
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
                      errorMessage: "text-[11px] font-normal leading-none"
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

                <InteractiveHoverButton
                  type="submit"
                  disabled={submitting || !codeSent}
                  className="w-full"
                >
                  提交验证并进入重置密码
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
                      errorMessage: "text-[11px] font-normal leading-none"
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
                    description="再次输入新的登录密码"
                    size="sm"
                    variant="flat"
                    className="text-xs"
                    isInvalid={!!confirmPasswordError}
                    errorMessage={confirmPasswordError}
                    classNames={{
                      helperWrapper: "min-h-0 p-0 mt-1",
                      errorMessage: "text-[11px] font-normal leading-none"
                    }}
                  />
                </div>

                <InteractiveHoverButton
                  type="submit"
                  disabled={submitting || !newPassword || newPassword !== confirmPassword}
                  className="w-full"
                >
                  {submitting ? "重置中..." : "完成重置密码"}
                </InteractiveHoverButton>
              </form>
            )}
          </div>

          <div className="flex items-center justify-center gap-2 text-[11px] text-[var(--text-color-secondary)]">
            <HeroLink
              href="#"
              underline="hover"
              className="hover:underline"
              onPress={() => navigate(routes.login)}
            >
              返回登录
            </HeroLink>
            <span>·</span>
            <HeroLink
              href="#"
              underline="hover"
              className="text-[var(--primary-color)] hover:underline"
              onPress={() => navigate(routes.register)}
            >
              还没有账号？立即注册
            </HeroLink>
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
        </div>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
