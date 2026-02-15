# auth（登录认证）前后端接口对接文档

> 文档创建时间：2026-02-15  
> 对接策略：混合方案（前端修改路径适配后端，后端补充缺失接口）

---

## 一、模块总览

| 子模块 | 前端接口数 | 后端状态 | 对接方案 |
|-------|----------|---------|---------|
| 用户登录 | 1个 | ✅ 已有 | 前端修改路径和字段映射 |
| 用户注册 | 1个 | ✅ 已有 | 前端修改路径和字段映射 |
| 用户登出 | 1个 | ✅ 已有 | 前端修改路径 |
| 刷新令牌 | 1个 | ✅ 已有 | 前端修改路径 |
| 获取公钥 | 1个 | ✅ 已有 | 前端修改路径 |
| 滑块验证码 | 3个 | ⚠️ 部分缺失 | 后端补充验证接口 |
| 邮箱验证码 | 0个 | ✅ 已有 | 前端新增调用 |
| 忘记密码 | 1个 | ❌ 缺失 | 后端新增 |
| 第三方登录 | 0个 | ✅ 已有 | 前端新增调用 |

---

## 二、接口映射表

### 2.1 登录相关接口

| 前端接口 | HTTP | 后端接口 | 对接方案 |
|---------|------|---------|---------|
| `POST /auth/login` | POST | `POST /login` | 前端修改路径、字段映射 |
| `POST /auth/register` | POST | `POST /register` | 前端修改路径、字段映射 |
| `POST /auth/logout` | POST | `POST /logout` | 前端修改路径 |
| `POST /auth/refresh-token` | POST | `POST /refresh` | 前端修改路径、参数调整 |
| `GET /auth/public-key` | GET | `GET /public-key` | 前端修改路径 |

### 2.2 验证码相关接口

| 前端接口 | HTTP | 后端接口 | 对接方案 |
|---------|------|---------|---------|
| `GET /auth/captcha/slider` | GET | `GET /captcha` | 前端修改路径 |
| `POST /auth/pre-check` | POST | ❌ 缺失 | 后端新增或前端移除 |
| `POST /auth/captcha/slider/verify` | POST | ❌ 缺失 | 后端新增验证接口 |
| - | - | `POST /email/code` | 前端新增调用 |

### 2.3 其他接口

| 前端接口 | HTTP | 后端接口 | 对接方案 |
|---------|------|---------|---------|
| `POST /auth/forgot-password` | POST | ❌ 缺失 | 后端新增 |
| - | - | `GET /third-party/url` | 前端新增调用 |
| - | - | `POST /third-party/callback` | 前端新增调用 |

---

## 三、字段映射表

### 3.1 登录请求字段映射

| 前端字段 | 后端字段 | 类型 | 说明 |
|---------|---------|------|------|
| username | username | String | 用户名 |
| email | email | String | 邮箱地址 |
| password | password | String | 密码（RSA加密后） |
| code | emailCode | String | **需映射**：前端code → 后端emailCode |
| type | loginType | String | **需映射**：前端type → 后端loginType |
| - | uuid | String | 后端特有：验证码UUID |
| - | authCode | String | 后端特有：第三方授权码 |
| - | state | String | 后端特有：第三方状态值 |

**登录类型映射：**

| 前端 type | 后端 loginType | 说明 |
|----------|---------------|------|
| account | password | 账号密码登录 |
| email | email | 邮箱验证码登录 |
| phone | phone | 手机号登录（暂未实现） |

### 3.2 登录响应字段映射

| 前端字段 | 后端字段 | 类型 | 说明 |
|---------|---------|------|------|
| token | accessToken | String | **需映射**：后端accessToken → 前端token |
| refreshToken | refreshToken | String | 刷新令牌 |
| expiresIn | expiresIn | Long | 过期时间（秒） |
| user.id | userId | Long | **需映射**：后端userId → 前端user.id |
| user.username | username | String | 用户名 |
| user.avatar | avatar | String | 头像URL |
| user.roles | - | String[] | 前端特有：角色列表（需从其他接口获取） |
| - | tokenType | String | 后端特有：令牌类型（Bearer） |
| - | nickname | String | 后端特有：昵称 |

### 3.3 注册请求字段映射

| 前端字段 | 后端字段 | 类型 | 说明 |
|---------|---------|------|------|
| username | userName | String | **需映射**：后端用userName |
| email | email | String | 邮箱地址 |
| password | password | String | 密码（RSA加密后） |
| code | code | String | 邮箱验证码 |

---

## 四、前端修改清单

### 4.1 修改接口路径

```typescript
// ===== 修改文件：zsk-ui/src/api/auth/index.ts =====

/**
 * 用户登录
 * @param data 登录请求数据
 * @returns 登录响应
 */
export async function login(data: LoginRequest) {
  /** 映射后的后端请求数据 */
  const backendData = mapLoginRequestToBackend(data);

  const res = await handleRequest({
    requestFn: () =>
      request.instance
        .post<ApiResponse<BackendLoginResponse>>("/login", backendData)
        .then((r) => r.data),
    mockData: {
      ...MOCK_LOGIN_RESPONSE,
      user: {
        ...MOCK_LOGIN_RESPONSE.user,
        username: data.username || data.email?.split("@")[0] || "MockUser",
      },
    },
    apiName: "login"
  });

  /** 映射响应数据 */
  return mapLoginResponseToFrontend(res.data);
}

/**
 * 用户注册
 * @param data 注册请求数据
 * @returns 是否注册成功
 */
export async function register(data: RegisterRequest) {
  /** 映射后的后端请求数据 */
  const backendData = {
    userName: data.username,
    email: data.email,
    password: data.password,
    code: data.code,
  };

  const res = await handleRequest({
    requestFn: () =>
      request.instance
        .post<ApiResponse<boolean>>("/register", backendData)
        .then((r) => r.data),
    mockData: true,
    apiName: "register"
  });

  return res.data;
}

/**
 * 用户登出
 * @returns 是否登出成功
 */
export async function logout() {
  const res = await handleRequest({
    requestFn: () =>
      request.instance
        .post<ApiResponse<boolean>>("/logout")
        .then((r) => r.data),
    mockData: true,
    apiName: "logout"
  });
  return res.data;
}

/**
 * 刷新令牌
 * @param refreshToken 刷新令牌
 * @returns 新的访问令牌
 */
export async function refreshToken(refreshToken: string) {
  const res = await handleRequest({
    requestFn: () =>
      request.instance
        .post<ApiResponse<{ accessToken: string; expiresIn: number }>>(
          "/refresh",
          {},
          { headers: { Authorization: refreshToken } }
        )
        .then((r) => r.data),
    mockData: { accessToken: "mock-new-token", expiresIn: 7200 },
    apiName: "refreshToken"
  });
  return res.data;
}

/**
 * 获取 RSA 公钥
 * @returns 公钥响应对象
 */
export async function getPublicKey() {
  const res = await handleRequest({
    requestFn: () =>
      request.instance
        .get<ApiResponse<PublicKeyResponse>>("/public-key")
        .then((r) => r.data),
    mockData: {
      publicKey: "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA2Z3qX2BTLS4e7g7vXPKP",
      keyExpire: 3600,
      keyVersion: "v1_" + new Date().toISOString().slice(0, 10).replace(/-/g, ""),
    },
    apiName: "getPublicKey"
  });
  return res.data;
}

/**
 * 获取滑块验证码
 * @returns 验证码数据
 */
export async function fetchSliderCaptcha() {
  const res = await handleRequest({
    requestFn: () =>
      request.instance
        .get<ApiResponse<CaptchaResponse>>("/captcha")
        .then((r) => r.data),
    mockData: MOCK_CAPTCHA_DATA,
    apiName: "fetchSliderCaptcha"
  });
  return mapCaptchaToFrontend(res.data);
}

/**
 * 发送邮箱验证码
 * @param email 邮箱地址
 * @returns 是否发送成功
 */
export async function sendEmailCode(email: string) {
  const res = await handleRequest({
    requestFn: () =>
      request.instance
        .post<ApiResponse<boolean>>("/email/code", null, {
          params: { email },
        })
        .then((r) => r.data),
    mockData: true,
    apiName: "sendEmailCode"
  });
  return res.data;
}
```

### 4.2 新增字段映射函数

```typescript
// ===== 新增类型定义 =====

/** 后端登录响应类型 */
export type BackendLoginResponse = {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  userId: number;
  username: string;
  nickname: string;
  avatar: string;
};

/** 后端验证码响应类型 */
export type CaptchaResponse = {
  uuid: string;
  backgroundImage: string;
  sliderImage: string;
  x: number;
};

// ===== 字段映射函数 =====

/**
 * 登录请求前端转后端字段映射
 * @param frontendData 前端登录请求
 * @returns 后端登录请求
 */
function mapLoginRequestToBackend(frontendData: LoginRequest): Record<string, unknown> {
  /** 登录类型映射 */
  const loginTypeMap: Record<string, string> = {
    account: "password",
    email: "email",
    phone: "phone",
  };

  return {
    username: frontendData.username,
    email: frontendData.email,
    password: frontendData.password,
    emailCode: frontendData.code,
    loginType: loginTypeMap[frontendData.type] || frontendData.type,
  };
}

/**
 * 登录响应后端转前端字段映射
 * @param backendData 后端登录响应
 * @returns 前端登录响应
 */
function mapLoginResponseToFrontend(backendData: BackendLoginResponse): LoginResponse {
  return {
    token: backendData.accessToken,
    refreshToken: backendData.refreshToken,
    expiresIn: backendData.expiresIn,
    user: {
      id: String(backendData.userId),
      username: backendData.username || backendData.nickname,
      avatar: backendData.avatar || "",
      roles: [],
    },
  };
}

/**
 * 验证码响应后端转前端字段映射
 * @param backendData 后端验证码响应
 * @returns 前端验证码数据
 */
function mapCaptchaToFrontend(backendData: CaptchaResponse): SliderCaptchaData {
  return {
    uuid: backendData.uuid,
    bgUrl: backendData.backgroundImage,
    puzzleUrl: backendData.sliderImage,
  };
}
```

---

## 五、后端新增接口清单

### 5.1 滑块验证码验证接口

```java
// ===== 文件：AuthController.java =====

/**
 * 验证滑块验证码
 *
 * @param uuid 验证码UUID
 * @param x 滑块X坐标
 * @return 是否验证通过
 */
@Operation(summary = "验证滑块验证码")
@PostMapping("/captcha/verify")
public R<Boolean> verifyCaptcha(
    @RequestParam String uuid,
    @RequestParam Integer x) {
    boolean passed = captchaService.verifySlideCaptcha(uuid, x);
    return R.ok(passed);
}
```

### 5.2 忘记密码接口

```java
// ===== 文件：AuthController.java =====

/**
 * 忘记密码
 *
 * @param email 邮箱地址
 * @param code 验证码
 * @param newPassword 新密码
 * @return 是否成功
 */
@Operation(summary = "忘记密码")
@PostMapping("/forgot-password")
public R<Void> forgotPassword(
    @RequestParam String email,
    @RequestParam String code,
    @RequestParam String newPassword) {
    authService.resetPassword(email, code, newPassword);
    return R.ok();
}
```

### 5.3 预检查接口（可选）

```java
// ===== 文件：AuthController.java =====

/**
 * 预检查凭证并获取滑块验证码
 *
 * @param request 预检查请求
 * @return 验证码响应
 */
@Operation(summary = "预检查凭证并获取滑块验证码")
@PostMapping("/pre-check")
public R<CaptchaResponse> preCheckAndGetCaptcha(@RequestBody PreCheckRequest request) {
    // 验证账号密码格式
    // 返回滑块验证码
    return R.ok(captchaService.generateSlideCaptcha());
}
```

---

## 六、对接检查清单

### 6.1 前端修改清单

- [ ] 修改 `login` 接口路径（`/auth/login` → `/login`）
- [ ] 修改 `login` 请求字段映射（code → emailCode, type → loginType）
- [ ] 修改 `login` 响应字段映射（accessToken → token, userId → user.id）
- [ ] 修改 `register` 接口路径（`/auth/register` → `/register`）
- [ ] 修改 `register` 请求字段映射（username → userName）
- [ ] 修改 `logout` 接口路径（`/auth/logout` → `/logout`）
- [ ] 修改 `refreshToken` 接口路径（`/auth/refresh-token` → `/refresh`）
- [ ] 修改 `getPublicKey` 接口路径（`/auth/public-key` → `/public-key`）
- [ ] 修改 `fetchSliderCaptcha` 接口路径（`/auth/captcha/slider` → `/captcha`）
- [ ] 新增 `sendEmailCode` 接口调用
- [ ] 新增字段映射函数

### 6.2 后端新增清单

- [ ] 新增滑块验证码验证接口 `POST /captcha/verify`
- [ ] 新增忘记密码接口 `POST /forgot-password`
- [ ] 新增预检查接口 `POST /pre-check`（可选）

---

## 七、注意事项

1. **接口路径**：前端所有接口需要移除 `/auth` 前缀
2. **登录类型**：前端 `type` 字段需要映射为后端 `loginType` 字段
3. **验证码字段**：前端 `code` 字段需要映射为后端 `emailCode` 字段
4. **Token字段**：后端 `accessToken` 需要映射为前端 `token`
5. **用户ID**：后端 `userId` 是 Long 类型，前端需要转为 String
6. **角色列表**：后端登录响应不包含角色列表，前端需要单独获取
7. **密码加密**：密码传输前需要使用 RSA 加密
8. **Authorization头**：刷新令牌接口需要在 Header 中传递 refreshToken
