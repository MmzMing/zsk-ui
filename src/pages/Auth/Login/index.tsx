/**
 * 登录页面
 * @module pages/Auth/Login
 * @description 用户登录页面，支持账号/邮箱登录、滑块验证码、第三方登录等功能
 */

import React from "react";
import { useNavigate } from "react-router-dom";
import SliderCaptcha, { type VerifyParam, type ActionType } from "rc-slider-captcha";
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
import { verifySliderCaptcha, preCheckAndGetCaptcha, login, getPublicKey, getThirdPartyAuthUrl } from "@/api/auth";
import { rsaEncrypt } from "@/utils";
import Shuffle from "@/components/Motion/Shuffle";
import TextType from "@/components/Motion/TextType";
import { RiHome4Line } from "react-icons/ri";
import { FaEye, FaEyeSlash, FaQq, FaWeixin, FaGithub } from "react-icons/fa6";
import { useBgCarousel, useCountdown, useAuthForm } from "@/hooks";

/** 登录失败次数存储键 */
const LOGIN_FAIL_KEY = "auth_login_fail_count";

/** 登录失败次数阈值，超过此值需要验证码 */
const LOGIN_FAIL_THRESHOLD = 5;

/**
 * 登录页面组件
 * @returns 登录页面JSX元素
 */
function LoginPage() {
  const navigate = useNavigate();
  const { setToken, setUserId, setAvatar } = useUserStore();
  const { setIsLoading } = useAppStore();

  /** 背景图片轮播 */
  const { currentIndex: currentBgIndex, currentImage } = useBgCarousel({
    preload: true,
    autoPlay: true
  });

  /** 验证码倒计时 */
  const { countdown: captchaCountdown, start: startCountdown, isCounting: isCountingDown } = useCountdown({
    duration: 60
  });

  /** 表单状态管理 */
  const { state, errors, slider, ui, form, handlers } = useAuthForm({ mode: "login" });

  /** 滑块验证码 ref */
  const sliderCaptchaRef = React.useRef<ActionType>(undefined);

  /**
   * 记录登录失败次数
   */
  const recordLoginFail = React.useCallback(() => {
    try {
      const failRaw = window.localStorage.getItem(LOGIN_FAIL_KEY);
      const current = failRaw ? Number.parseInt(failRaw, 10) || 0 : 0;
      const next = current + 1;
      window.localStorage.setItem(LOGIN_FAIL_KEY, String(next));
      if (next >= LOGIN_FAIL_THRESHOLD) ui.setRequireCaptcha(true);
    } catch {
      // ignore
    }
  }, [ui]);

  /**
   * 重置登录失败次数
   */
  const resetLoginFail = React.useCallback(() => {
    ui.setRequireCaptcha(false);
    try {
      window.localStorage.removeItem(LOGIN_FAIL_KEY);
    } catch {
      // ignore
    }
  }, [ui]);

  /**
   * 初始化检查登录失败次数
   */
  React.useEffect(() => {
    let ignore = false;
    const timer = setTimeout(() => {
      if (!ignore) {
        try {
          const failRaw = window.localStorage.getItem(LOGIN_FAIL_KEY);
          const fail = failRaw ? Number.parseInt(failRaw, 10) || 0 : 0;
          if (fail >= LOGIN_FAIL_THRESHOLD) {
            ui.setRequireCaptcha(true);
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
  }, [ui]);

  /**
   * 发送验证码
   */
  const handleSendCaptcha = React.useCallback(() => {
    if (isCountingDown) return;

    if (!form.validateLogin()) {
      errors.set("form", "请先输入正确的账号和密码，再发送验证码");
      return;
    }

    errors.set("form", "");
    slider.show();
    slider.setVerified(false);
    slider.setInfo(null);
    slider.setError("");
  }, [isCountingDown, form, errors, slider]);

  /**
   * 请求滑块验证码
   */
  const requestSliderCaptcha = React.useCallback(async () => {
    try {
      const data = await preCheckAndGetCaptcha();
      slider.setInfo(data);
      if (data.y) {
        slider.setPuzzleTop(data.y);
      }
      return { 
        bgUrl: data.bgUrl, 
        puzzleUrl: data.puzzleUrl,
        y: data.y 
      };
    } catch (error) {
      slider.setError("滑块验证码加载失败，请稍后重试");
      throw error;
    }
  }, [slider]);

  /**
   * 处理滑块验证
   */
  const handleSliderVerify = React.useCallback(async (data: VerifyParam) => {
    if (!state.slider.info) {
      slider.setError("验证码已失效，请刷新重试");
      return Promise.reject();
    }
    try {
      slider.setError("");
      
      const verifyRes = await verifySliderCaptcha({
        scene: "login_email",
        uuid: state.slider.info.uuid,
        x: data.x,
        account: state.fields.account
      });

      if (!verifyRes.passed) {
        slider.setError("验证失败，请重新尝试");
        sliderCaptchaRef.current?.refresh();
        return Promise.reject();
      }

      slider.setVerified(true);
      slider.hide();
      ui.setCodeSent(true);
      startCountdown();
      return Promise.resolve();
    } catch (error) {
      slider.setError(error instanceof Error ? error.message : "网络异常，验证失败，请稍后重试");
      return Promise.reject(error);
    }
  }, [state.slider.info, state.fields.account, slider, ui, startCountdown]);

  /**
   * 第三方登录
   */
  const handleThirdPartyLogin = React.useCallback(async (type: string) => {
    try {
      const url = await getThirdPartyAuthUrl(type);
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      errors.set("form", error instanceof Error ? error.message : "获取授权链接失败，请稍后重试");
    }
  }, [errors]);

  /**
   * 提交登录表单
   */
  const handleSubmit = React.useCallback(async (event: React.FormEvent) => {
    event.preventDefault();
    if (state.ui.submitting) return;

    if (!form.validateLogin()) {
      errors.set("form", "请先修正表单中的错误后再尝试登录");
      recordLoginFail();
      return;
    }

    if (!state.ui.codeSent || !state.slider.verified) {
      errors.set("captcha", "请先获取并输入邮箱验证码");
      errors.set("form", "请先完成滑块验证并获取验证码");
      recordLoginFail();
      return;
    }

    if (!state.fields.agree) {
      errors.set("form", "请阅读并同意用户协议和隐私政策");
      return;
    }

    errors.set("form", "");
    ui.setSubmitting(true);

    try {
      const publicKeyData = await getPublicKey();
      const encryptedPassword = await rsaEncrypt(state.fields.password, publicKeyData.publicKey);

      const isEmail = state.fields.account.includes("@");
      const res = await login({
        type: isEmail ? "email" : "account",
        username: !isEmail ? state.fields.account : undefined,
        email: isEmail ? state.fields.account : undefined,
        password: encryptedPassword,
        code: state.fields.captcha,
        uuid: state.slider.info?.uuid,
      });

      setToken(res.token);
      setUserId(res.user.id);
      setAvatar(res.user.avatar);
      resetLoginFail();

      setIsLoading(true);
      navigate(routes.admin, { state: { fromAuth: true } });
    } catch (error) {
      errors.set("form", error instanceof Error ? error.message : "网络异常，请稍后再试");
      recordLoginFail();
    } finally {
      ui.setSubmitting(false);
    }
  }, [state, form, errors, ui, recordLoginFail, resetLoginFail, setToken, setUserId, setAvatar, setIsLoading, navigate]);

  return (
    <div className="min-h-screen flex bg-[var(--bg-color)] text-[var(--text-color)]">
      <div className="hidden lg:flex lg:basis-2/3 relative overflow-hidden bg-slate-950">
        <AnimatePresence>
          <motion.img
            key={currentBgIndex}
            src={currentImage}
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
                value={state.fields.account}
                onChange={handlers.handleAccountChange}
                description={
                  state.fields.account && !state.errors.account ? (
                    <span className="text-emerald-400">账号格式正确</span>
                  ) : (
                    "请输入邮箱或用户名"
                  )
                }
                size="sm"
                variant="flat"
                className="text-xs"
                isInvalid={!!state.errors.account}
                errorMessage={state.errors.account}
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
                type={state.ui.passwordVisible ? "text" : "password"}
                value={state.fields.password}
                onChange={handlers.handlePasswordChange}
                description="请输入登录密码"
                size="sm"
                variant="flat"
                className="text-xs"
                isInvalid={!!state.errors.password}
                errorMessage={state.errors.password}
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
                    onPress={ui.togglePasswordVisible}
                    aria-label="toggle password visibility"
                  >
                    {state.ui.passwordVisible ? (
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
                    value={state.fields.captcha}
                    onValueChange={handlers.handleCaptchaChange}
                    size="sm"
                    variant="flat"
                    radius="md"
                    isDisabled={!state.ui.codeSent}
                    isInvalid={!!state.errors.captcha}
                    errorMessage={state.errors.captcha}
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
                    isDisabled={isCountingDown}
                    className="h-9 w-[8.5rem] justify-center text-[11px] font-medium bg-[color-mix(in_srgb,var(--primary-color)_14%,transparent)] text-[var(--primary-color)] hover:bg-[color-mix(in_srgb,var(--primary-color)_20%,transparent)] disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isCountingDown ? `${captchaCountdown}s 后可重发` : "发送邮箱验证码"}
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              {state.errors.form ? (
                <div className="rounded-[var(--radius-base)] border border-red-500/60 bg-red-500/5 px-3 py-2 text-[11px] text-red-300">
                  {state.errors.form}
                </div>
              ) : null}
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-2 text-xs text-[var(--text-color-secondary)]">
                  <Checkbox
                    isSelected={state.fields.agree}
                    onValueChange={handlers.handleAgreeChange}
                    name="agreement"
                  />
                  <span className="inline-flex items-center gap-1">
                    <span>我已阅读并同意</span>
                    <HeroLink
                      href="#"
                      underline="hover"
                      className="text-[11px] text-[var(--primary-color)]"
                      onPress={ui.showUserAgreement}
                    >
                      用户协议
                    </HeroLink>
                    <span>和</span>
                    <HeroLink
                      href="#"
                      underline="hover"
                      className="text-[11px] text-[var(--primary-color)]"
                      onPress={ui.showPrivacyPolicy}
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
                  state.ui.submitting ||
                  !state.fields.agree ||
                  !state.fields.account ||
                  !state.fields.password ||
                  Boolean(state.errors.account) ||
                  Boolean(state.errors.password) ||
                  state.fields.captcha.length !== 6 ||
                  Boolean(state.errors.captcha)
                }
                className="w-full"
              >
                {state.ui.submitting ? "登录中..." : "立即登录"}
              </InteractiveHoverButton>

              <div className="flex items-center gap-3 my-6">
                <div className="flex-1 border-t border-[var(--border-color)]" />
                <span className="text-xs uppercase text-[var(--text-color-secondary)] whitespace-nowrap">
                  或通过以下方式继续
                </span>
                <div className="flex-1 border-t border-[var(--border-color)]" />
              </div>

              <div className="flex justify-center gap-6">
                 <Button isIconOnly variant="flat" radius="full" className="bg-[var(--bg-elevated)] text-[var(--text-color-secondary)] hover:text-[var(--primary-color)] hover:bg-[var(--primary-color)]/10" aria-label="Github Login" onPress={() => handleThirdPartyLogin("github")}>
                  <FaGithub className="text-xl" />
                </Button>
                <Button isIconOnly variant="flat" radius="full" className="bg-[var(--bg-elevated)] text-[var(--text-color-secondary)] hover:text-[#12B7F5] hover:bg-[#12B7F5]/10" aria-label="QQ Login" onPress={() => handleThirdPartyLogin("qq")}>
                  <FaQq className="text-xl" />
                </Button>
                <Button isIconOnly variant="flat" radius="full" className="bg-[var(--bg-elevated)] text-[var(--text-color-secondary)] hover:text-[#07C160] hover:bg-[#07C160]/10" aria-label="WeChat Login" onPress={() => handleThirdPartyLogin("wechat")}>
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
        isOpen={state.slider.visible}
        onOpenChange={(open) => {
          if (open) {
            slider.show();
          } else {
            slider.hide();
            slider.setInfo(null);
            slider.setError("");
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
                      actionRef={sliderCaptchaRef}
                      request={requestSliderCaptcha}
                      onVerify={handleSliderVerify}
                      bgSize={{ width: 300, height: 150 }}
                      puzzleSize={{ width: 50, height: 50, top: state.slider.puzzleTop }}
                    />
                  </div>
                  {state.slider.error ? (
                    <div className="text-[11px] text-red-400 w-full text-center">
                      {state.slider.error}
                    </div>
                  ) : null}
                </div>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>

      <UserAgreementModal
        isOpen={state.ui.showUserAgreement}
        onOpenChange={(open) => open ? ui.showUserAgreement() : ui.hideUserAgreement()}
      />
      <PrivacyPolicyModal
        isOpen={state.ui.showPrivacyPolicy}
        onOpenChange={(open) => open ? ui.showPrivacyPolicy() : ui.hidePrivacyPolicy()}
      />
    </div>
  );
}

export default LoginPage;
