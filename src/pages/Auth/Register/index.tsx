/**
 * 注册页面
 * @module pages/Auth/Register
 * @description 用户注册页面，支持邮箱验证、滑块验证码、密码强度检测等功能
 */

import React from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import SliderCaptcha, { type VerifyParam } from "rc-slider-captcha";
import { FaEye, FaEyeSlash } from "react-icons/fa6";
import { RiHome4Line } from "react-icons/ri";
import {
  Button,
  Checkbox,
  Input,
  InputOtp,
  Link as HeroLink,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  addToast
} from "@heroui/react";
import { routes } from "@/router/routes";
import { Shuffle } from "@/components/Motion/Shuffle";
import { TextType } from "@/components/Motion/TextType";
import InteractiveHoverButton from "@/components/Motion/InteractiveHoverButton";
import { UserAgreementModal, PrivacyPolicyModal } from "@/components/AgreementModals";
import { verifySliderCaptcha, preCheckAndGetCaptcha, register, getPublicKey, type BackendCaptchaResponse } from "@/api/auth";
import { rsaEncrypt, validateEmail, validateUsername, validatePassword, validateConfirmPassword, validateCaptcha, evaluatePasswordStrength, getPasswordStrengthColor } from "@/utils";
import { useBgCarousel, useCountdown } from "@/hooks";

/**
 * 注册页面组件
 * @returns 注册页面JSX元素
 */
function RegisterPage() {
  const navigate = useNavigate();

  /** 背景图片轮播 */
  const { currentIndex: currentBgIndex, currentImage } = useBgCarousel({
    preload: true,
    autoPlay: true
  });

  /** 验证码倒计时 */
  const { countdown: captchaCountdown, start: startCountdown, isCounting: isCountingDown } = useCountdown({
    duration: 60
  });

  /** 表单字段状态 */
  const [email, setEmail] = React.useState("");
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [captcha, setCaptcha] = React.useState("");
  const [agree, setAgree] = React.useState(false);

  /** UI状态 */
  const [submitting, setSubmitting] = React.useState(false);
  const [passwordVisible, setPasswordVisible] = React.useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = React.useState(false);
  const [showUserAgreement, setShowUserAgreement] = React.useState(false);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = React.useState(false);

  /** 验证错误状态 */
  const [emailError, setEmailError] = React.useState("");
  const [usernameError, setUsernameError] = React.useState("");
  const [passwordError, setPasswordError] = React.useState("");
  const [confirmPasswordError, setConfirmPasswordError] = React.useState("");
  const [captchaError, setCaptchaError] = React.useState("");
  const [formError, setFormError] = React.useState("");
  const [passwordStrength, setPasswordStrength] = React.useState("");

  /** 滑块验证码状态 */
  const [sliderVisible, setSliderVisible] = React.useState(false);
  const [sliderVerified, setSliderVerified] = React.useState(false);
  const [sliderCaptchaInfo, setSliderCaptchaInfo] = React.useState<BackendCaptchaResponse | null>(null);
  const [sliderError, setSliderError] = React.useState("");
  const [codeSent, setCodeSent] = React.useState(false);
  const [puzzleTop, setPuzzleTop] = React.useState(0);

  /**
   * 处理邮箱输入变更
   */
  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setEmail(value);
    setEmailError(value ? validateEmail(value) : "");
  };

  /**
   * 处理用户名输入变更
   */
  const handleUsernameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setUsername(value);
    setUsernameError(value ? validateUsername(value) : "");
  };

  /**
   * 处理密码输入变更
   */
  const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
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
  };

  /**
   * 处理确认密码输入变更
   */
  const handleConfirmPasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setConfirmPassword(value);
    setConfirmPasswordError(value ? validateConfirmPassword(password, value) : "");
  };

  /**
   * 处理验证码输入变更
   */
  const handleCaptchaChange = (value: string) => {
    const digits = value.replace(/\D/g, "");
    setCaptcha(digits);
    setCaptchaError(validateCaptcha(digits, sliderVerified));
  };

  /**
   * 发送验证码前置检查
   */
  const handleSendCaptcha = () => {
    if (isCountingDown) return;

    const emailMessage = validateEmail(email);
    const usernameMessage = validateUsername(username);
    const passwordMessage = validatePassword(password);
    const confirmPasswordMessage = validateConfirmPassword(password, confirmPassword);

    setEmailError(emailMessage);
    setUsernameError(usernameMessage);
    setPasswordError(passwordMessage);
    setConfirmPasswordError(confirmPasswordMessage);

    if (emailMessage || usernameMessage || passwordMessage || confirmPasswordMessage) {
      return;
    }

    setFormError("");
    setSliderVisible(true);
    setSliderVerified(false);
    setSliderCaptchaInfo(null);
    setSliderError("");
  };

  /**
   * 请求滑块验证码
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
    } catch {
      setSliderError("滑块验证码加载失败，请稍后重试");
      throw new Error("request slider captcha failed");
    }
  };

  /**
   * 处理滑块验证结果
   */
  const handleSliderVerify = async (data: VerifyParam) => {
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
      setCodeSent(true);
      startCountdown();
      return Promise.resolve();
    } catch {
      setSliderError("网络异常，验证失败，请稍后重试");
      return Promise.reject();
    }
  };

  /**
   * 提交注册表单
   */
  const handleSubmit = async (event: React.FormEvent) => {
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
      const publicKeyData = await getPublicKey();
      const encryptedPassword = await rsaEncrypt(password, publicKeyData.publicKey);
      const encryptedConfirmPassword = await rsaEncrypt(confirmPassword, publicKeyData.publicKey);

      await register({
        username,
        email,
        password: encryptedPassword,
        confirmPassword: encryptedConfirmPassword,
        code: captcha,
        uuid: sliderCaptchaInfo?.uuid,
      });

      addToast({
        title: "注册成功",
        description: "请使用注册的账号登录",
        color: "success"
      });
      navigate(routes.login);
    } catch {
      // 错误已由全局拦截器处理，此处仅停止加载状态
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[var(--bg-color)] text-[var(--text-color)]">
      <div className="hidden lg:flex lg:basis-2/3 relative overflow-hidden bg-slate-950">
        <AnimatePresence mode="wait">
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
        <div className="relative z-10 flex h-full flex-col justify-between p-10 xl:p-14 w-full">
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
                  从今天开始搭建你的知识档案
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
              text="为你的创作与学习准备一份「长期有效」的空间"
              tag="h2"
              className="text-2xl font-semibold tracking-tight"
              triggerOnHover={false}
              loop={true}
              loopDelay={5000}
            />
            <TextType
              text="注册账号后，你可以集中管理文档、视频与各种灵感碎片，让知识沉淀下来，而不是沉在聊天记录里。"
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

          <form onSubmit={handleSubmit} className="space-y-2">
            <div className="space-y-1.5 text-xs">
              <Input
                label="邮箱"
                labelPlacement="inside"
                isRequired
                value={email}
                onChange={handleEmailChange}
                description={
                  email && !emailError ? (
                    <span className="text-emerald-400">邮箱格式正确</span>
                  ) : (
                    "请输入常用邮箱地址"
                  )
                }
                size="sm"
                variant="flat"
                className="text-xs"
                isInvalid={!!emailError}
                errorMessage={emailError}
                classNames={{
                  helperWrapper: "min-h-0 p-0 mt-1",
                  description: "text-[11px] font-normal leading-none",
                  errorMessage: "text-[11px] font-normal leading-none"
                }}
              />
            </div>

            <div className="space-y-1.5 text-xs">
              <Input
                label="用户名"
                labelPlacement="inside"
                isRequired
                value={username}
                onChange={handleUsernameChange}
                description={
                  username && !usernameError ? (
                    <span className="text-emerald-400">用户名格式正确</span>
                  ) : (
                    "用于展示的昵称，可后续修改"
                  )
                }
                size="sm"
                variant="flat"
                className="text-xs"
                isInvalid={!!usernameError}
                errorMessage={usernameError}
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
                  <span className={getPasswordStrengthColor(passwordStrength)}>
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
                    isDisabled={isCountingDown}
                    className="h-9 w-[8.5rem] justify-center text-[11px] font-medium bg-[color-mix(in_srgb,var(--primary-color)_14%,transparent)] text-[var(--primary-color)] hover:bg-[color-mix(in_srgb,var(--primary-color)_20%,transparent)] disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isCountingDown ? `${captchaCountdown}s 后可重发` : "发送邮箱验证码"}
                  </Button>
                </div>
                <div className="text-[10px] text-[var(--text-color-secondary)] pl-1">
                  验证码将发送至您的邮箱，请查收。
                </div>
              </div>
            </div>

            <div className="flex items-start gap-2 pt-1">
              <Checkbox
                size="sm"
                isSelected={agree}
                onValueChange={setAgree}
                classNames={{
                  label: "text-[11px] text-[var(--text-color-secondary)]"
                }}
              >
                我已阅读并同意
              </Checkbox>
              <div className="text-[11px] pt-[2px] -ml-1">
                <span
                  className="cursor-pointer text-[var(--primary-color)] hover:underline"
                  onClick={() => setShowUserAgreement(true)}
                >
                  《用户协议》
                </span>
                <span className="mx-1 text-[var(--text-color-secondary)]">和</span>
                <span
                  className="cursor-pointer text-[var(--primary-color)] hover:underline"
                  onClick={() => setShowPrivacyPolicy(true)}
                >
                  《隐私政策》
                </span>
              </div>
            </div>

            {formError ? (
              <div className="rounded-[var(--radius-base)] border border-red-500/60 bg-red-500/5 px-3 py-2 text-[11px] text-red-300">
                {formError}
              </div>
            ) : null}

            <InteractiveHoverButton
              type="submit"
              disabled={
                submitting ||
                !agree ||
                !email ||
                !username ||
                !password ||
                !confirmPassword ||
                Boolean(emailError) ||
                Boolean(usernameError) ||
                Boolean(passwordError) ||
                Boolean(confirmPasswordError) ||
                captcha.length !== 6 ||
                Boolean(captchaError)
              }
              className="w-full"
            >
              {submitting ? "注册中..." : "立即注册"}
            </InteractiveHoverButton>

            <div className="text-center text-xs text-[var(--text-color-secondary)] mt-4">
              已有账号？{" "}
              <HeroLink
                href={routes.login}
                underline="hover"
                className="text-xs font-medium text-[var(--primary-color)]"
              >
                直接登录
              </HeroLink>
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

export default RegisterPage;
