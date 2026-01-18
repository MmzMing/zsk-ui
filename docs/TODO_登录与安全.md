# 登录与安全模块接口 TODO 清单

> 本文档用于记录「登录与安全」相关接口信息，覆盖滑块验证码、登录 / 注册、令牌管理与找回密码等场景，便于与后端对齐实现与安全约束。所有接口返回格式统一为 `{ code, msg, data }`。

## 一、滑块验证码（/auth/captcha/slider）

- 接口名称：获取滑块验证码  
- 接口地址：`GET /api/auth/captcha/slider`  
- 请求参数（Query）：
  - `scene`: `"login_email" | "forgot_email" | "register_email"`，验证码使用场景  
- 返回数据结构（data）：
  - 类型：`SliderCaptchaData`
  - 字段说明：
    - `uuid`: string，本次验证码会话 ID  
    - `bgUrl`: string，背景图地址  
    - `puzzleUrl`: string，滑块拼图图地址  
- 测试用例要点：
  - 不同 `scene` 下均能成功返回图片地址与 uuid  
  - uuid 具有时效性，过期后校验失败  
- 精简待办：
  - 与后端确认 uuid 过期时间与最大尝试次数  
  - 确认是否支持多语言或多尺寸图片  

- 接口名称：校验滑块验证码  
- 接口地址：`POST /api/auth/captcha/slider/verify`  
- 请求参数（Body，JSON）：
  - `scene`: SliderScene，与获取验证码时一致  
  - `uuid`: string，本次验证码会话 ID  
  - `account?`: string，可选，账号（如用户名 / 手机号）  
  - `email?`: string，可选，邮箱  
  - 其他扩展字段：`[key: string]: unknown`，用于后续扩展（如轨迹参数）  
- 返回数据结构（data）：
  - 类型：`SliderVerifyResult`  
  - 字段说明：
    - `passed`: boolean，本次校验是否通过  
- 测试用例要点：
  - uuid 过期 / 不存在时返回失败并给出明确错误码  
  - 多次连续失败后的防刷策略（如短时间内锁定）  
- 精简待办：
  - 与后端确认是否需要在通过后将 uuid 标记为一次性使用  

## 二、登录与令牌管理（/auth/login、/auth/logout、/auth/refresh-token）

- 接口名称：统一登录接口  
- 接口地址：`POST /api/auth/login`  
- 请求参数（Body，JSON，类型 `LoginRequest`）：
  - 通用字段：
    - `type`: `"account" | "email" | "phone"`，登录方式  
    - `code?`: string，可选，验证码（邮箱 / 手机登录时）  
  - 当 `type="account"` 时：
    - `username`: string，账号  
    - `password`: string，密码  
  - 当 `type="email"` 时：
    - `email`: string，邮箱  
    - `password?`: string，可选，密码登录或验证码登录  
  - 当 `type="phone"` 时（预留，可与后端进一步对齐）：
    - 一般需要 `phone` + `code` 字段  
- 返回数据结构（data）：
  - 类型：`LoginResponse`
  - 字段说明：
    - `token`: string，访问令牌（Access Token）  
    - `refreshToken`: string，刷新令牌  
    - `expiresIn`: number，访问令牌有效期（秒）  
    - `user`: object，当前登录用户信息：
      - `id`: string，用户 ID  
      - `username`: string，用户名  
      - `avatar`: string，头像地址  
      - `roles`: string[]，角色列表（如 `["admin", "editor"]`）  
- 测试用例要点：
  - 不同登录方式下必填字段校验与错误提示  
  - 登录成功后，前端正确保存 token / refreshToken，并刷新用户信息  
  - 账号密码错误、多次尝试失败等场景的错误码与文案  
- 精简待办：
  - 与后端确认密码加密方式（传输与存储）  
  - 确认是否需要绑定滑块验证码通过结果（如必须先通过滑块）  

- 接口名称：刷新访问令牌  
- 接口地址：`POST /api/auth/refresh-token`  
- 请求参数（Body，JSON）：
  - `token`: string，当前 refreshToken 或旧 token（具体由后端定义）  
- 返回数据结构（data）：
  - 类型：`{ token: string }`  
- 测试用例要点：
  - refreshToken 即将过期 / 已过期情况下的行为  
  - 被加入黑名单的 token 刷新时的错误码  

- 接口名称：退出登录  
- 接口地址：`POST /api/auth/logout`  
- 请求参数：无（如需，可附带当前 token 以便后端作审计）  
- 返回数据结构（data）：
  - 类型：`boolean`，true 表示退出成功  
- 测试用例要点：
  - 前端清理本地存储的 token / 用户信息  
  - 多端登录 / 多 token 场景下的登出策略（仅当前端 / 全部端）  

## 三、注册与找回密码（/auth/register、/auth/forgot-password）

- 接口名称：用户注册  
- 接口地址：`POST /api/auth/register`  
- 请求参数（Body，JSON，类型 `RegisterRequest`）：
  - `username`: string，用户名  
  - `email`: string，邮箱  
  - `password?`: string，可选，密码（如采用邮箱验证码设置密码流程，可为空）  
  - `code?`: string，可选，邮箱验证码  
- 返回数据结构（data）：
  - 类型：`boolean`，true 表示注册操作成功（不代表已登录）  
- 测试用例要点：
  - 用户名 / 邮箱重复时的错误码与提示文案  
  - 密码复杂度校验与错误提示  
- 精简待办：
  - 与后端确认注册是否同时完成登录（自动下发 token）  
  - 确认是否需要邮件激活流程  

- 接口名称：忘记密码 / 重置密码  
- 接口地址：`POST /api/auth/forgot-password`  
- 请求参数（Body，JSON，类型 `ForgotPasswordRequest`）：
  - `email`: string，邮箱  
  - `code`: string，验证码  
  - `newPassword?`: string，可选，新密码（如为两步流程，可只用于校验验证码）  
- 返回数据结构（data）：
  - 类型：`boolean`，true 表示操作成功  
- 测试用例要点：
  - 验证码错误或过期时的错误码与提示  
  - 新密码与旧密码相同或不满足复杂度要求时的处理  
- 精简待办：
  - 与后端确认找回密码是否拆成「发送验证码」与「提交新密码」两个接口  

## 附录：接口测试用例模板与后端对接 Checklist（登录与安全模块）

> 本附录为「登录与安全」模块下所有接口提供统一的记录格式和测试用例模板，前后端在补充 / 新增接口时可以直接复制使用，保证文档、联调与测试的一致性。

### A. 单接口记录与测试要点模板

1. 基础信息
   - 接口名称：  
   - 接口地址：`[METHOD] /api/auth/...`  
   - HTTP 方法：GET / POST / PUT / DELETE  
   - 所属模块：登录与安全  
   - 前端入口：页面名称 + 功能按钮说明（例如「登录页 · 提交登录表单」）  
   - 是否需要登录：是 / 否（登录接口本身通常不需要登录）  
   - 所需权限点：如 `auth:refresh` 等（通常仅用于后台管理）  

2. 请求参数设计
   - 参数位置：Query / Body(JSON) / Path / Header  
   - 参数列表（建议使用表格补充）：

     | 字段名   | 类型   | 必填 | 示例值           | 说明                       |
     | -------- | ------ | ---- | ---------------- | -------------------------- |
     | username | string | 否   | admin            | 账号登录用户名             |
     | email    | string | 否   | user@example.com | 邮箱                       |
     | password | string | 否   | ******           | 密码                       |
     | code     | string | 否   | 123456           | 验证码                     |
     | scene    | string | 否   | login_email      | 验证码场景                 |
     | ...      | ...    | ...  | ...              | ...                        |

3. 响应数据结构
   - 成功响应示例（复用全局 `{ code, msg, data }` 结构）  
   - `data` 字段详细说明（建议使用表格）：

     | 字段名             | 类型     | 示例值                           | 说明               |
     | ------------------ | -------- | -------------------------------- | ------------------ |
     | token              | string   | eyJhbGciOi...                    | 访问令牌           |
     | refreshToken       | string   | eyJhbGciOi...                    | 刷新令牌           |
     | expiresIn          | number   | 7200                             | 过期时间（秒）     |
     | user.id            | string   | u_001                            | 用户 ID            |
     | user.username      | string   | admin                            | 用户名             |
     | user.avatar        | string   | https://example.com/avatar.png   | 头像地址           |
     | user.roles         | string[] | ["admin"]                        | 角色列表           |
     | ...                | ...      | ...                              | ...                |

4. 错误码与异常场景
   - 系统类错误：如 500 服务器异常等  
   - 业务类错误示例：
     - 用户不存在或密码错误  
     - 账号被锁定 / 冻结  
     - 验证码错误或过期  
     - token 过期或被加入黑名单  
   - 每个错误码至少给出 1 条测试用例（输入参数 + 预期错误信息）。  

5. 业务规则与边界条件
   - 登录失败次数限制与锁定策略  
   - token 与 refreshToken 的有效期与续期策略  
   - 单点登录 / 多端登录策略（是否允许同账号多端在线）。  

6. 权限与安全要求
   - 所有敏感接口需启用 HTTPS 访问  
   - 密码传输是否需要额外加密（如前端公钥加密）  
   - 是否需要 CSRF 防护与 SameSite Cookie 配置（如采用 Cookie 方案）。  

7. 性能与限流要求
   - 登录、注册、找回密码接口的限流策略（防止暴力破解和短信 / 邮件轰炸）  
   - 滑块验证码获取与校验接口的 QPS 预估与限流配置。  

8. 日志与监控
   - 登录成功 / 失败、登出、密码重置等关键操作需要记录安全审计日志  
   - 是否在监控大盘中展示登录成功率、验证码通过率等指标。  

9. 兼容性与变更记录
   - token 结构或签名方式变更时的兼容策略  
   - 登录方式新增 / 调整时对前后端的影响评估。  

### B. 接口测试用例条目模板

> 建议每个接口至少覆盖「正常」「必填缺失」「非法输入」「频率限制」「安全相关」等场景。

- 用例编号：AUTH-API-001  
- 用例名称：账号密码登录成功  
- 前置条件：
  - 目标账号已存在且未被锁定  
- 步骤：
  1. 打开登录页  
  2. 输入正确的用户名与密码  
  3. （可选）完成人机验证或滑块校验  
  4. 点击登录按钮，触发 `POST /api/auth/login`  
- 输入数据：
  - `type="account"`  
  - `username="admin"`  
  - `password="******"`  
- 预期结果：
  - 返回 `code=0`，`data.token` 与 `data.refreshToken` 非空  
  - 页面跳转到首页或后台管理首页  
  - 前端本地存储中写入必要的登录信息  
- 备注：无  

可以在此模板基础上复制多条用例，编号建议包含模块前缀（如 `AUTH-`）。  

### C. 后端对接 Checklist（模块级）

1. 设计阶段
   - [ ] 所有计划对接的登录与安全相关接口已在本文件登记  
   - [ ] 与后端确认密码、token、验证码等敏感信息的安全策略  
   - [ ] 对登录失败策略、锁定策略、风控策略达成一致  

2. 开发阶段
   - [ ] 后端已在测试环境提供稳定接口（或 Mock 服务）  
   - [ ] 前端已完成 `src/api/auth/index.ts` 封装，并在登录 / 注册 / 找回密码页面中使用  
   - [ ] 字段命名与 TODO 文档保持一致  

3. 联调阶段
   - [ ] 针对每个接口至少执行 1 轮全量测试用例  
   - [ ] 对登录失败、token 过期、验证码错误等异常场景进行重点验证  
   - [ ] 日志、监控中可看到对应行为记录  

4. 上线前
   - [ ] 与后端确认生产环境网关路径、HTTPS 配置、安全相关中间件（如 WAF）  
   - [ ] 已根据测试结果更新本文件中的「测试用例要点」与「精简待办」  

5. 上线后
   - [ ] 监控登录成功率、失败原因分布、暴力破解尝试等安全指标  
   - [ ] 若发现异常行为，及时在本文件补充问题与跟进记录。  

