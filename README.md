# 知识库小破站 · 前端 UI 项目说明

## 1. 项目概览（关键信息整合）

- 项目定位：知识库内容展示 + 后台管理的前端 UI 项目，包含前台站点、认证模块和后台管理系统。
- 技术栈：
  - 前端框架：React 19 + Vite 7 + TypeScript 5
  - UI 组件：@heroui/react（表单、卡片、表格、分页等）
  - 动效与多媒体：framer-motion、React Bits、Magic UI、react-player、@vidstack/react
  - 路由与适配：React Router v7、amfe-flexible + postcss-pxtorem
  - 状态管理：Zustand
  - 数据可视化：@ant-design/plots
  - 工具与基础库：axios、dayjs、lodash、js-cookie 等
- 统一接口返回格式约定为：

```json
{
  "code": 0,
  "msg": "ok",
  "data": {}
}
```

所有文档与界面文案统一使用中文，前端 UI 组件优先使用 @heroui/react，图标统一使用 react-icons，图表统一使用 @ant-design/plots。

## 2. 目录结构与代码组织

- `src/api/`：统一的接口请求层（基于 axios 实例 `axios.ts` + 类型定义 `types.ts`）
  - `axios.ts`：axios 实例配置（拦截器、请求头、超时等），导出 `request` 对象统一发起请求。
  - `types.ts`：接口返回值类型定义（`ApiResponse<T>`、分页结构等）。
  - 业务接口文件按前台 / 后台模块拆分，如：
    - `front/home.ts`：首页内容、推荐区相关接口
    - `front/search.ts`：全站搜索接口
    - `auth/index.ts`：登录 / 注册 / 验证码等认证接口
    - `admin/video.ts`：后台视频上传、列表、审核等
    - `admin/document.ts`：后台文档上传、列表、审核等
    - `admin/dashboard.ts`：仪表盘统计与分析接口
    - `admin/ops.ts`：系统运维相关接口（接口文档中心、缓存、系统日志、行为审计）
    - `admin/personnel.ts`：用户、角色、菜单等权限管理接口
    - `admin/system.ts`：系统参数、字典、令牌等配置接口
- `src/components/`
  - `VideoPlayer/`：全局视频播放器封装（支持章节、倍速、弹幕开关、全屏等功能）
  - `Motion/`：动效组件集合（ScrollStack、ScrollFloat、AnimatedContent、Masonry 等）
- `src/pages/`
  - `Home/`：首页推荐区、文章/视频推荐、用户评价等前台展示页面
  - `AllSearch/`：全站搜索结果页，接入 `/search/all` 接口
  - `Auth/`：登录 / 注册 / 忘记密码页，统一使用滑块验证码接口
  - `Admin/`：后台管理入口与子模块
    - `Video/`：视频上传、列表管理、审核队列
    - `Document/`：文档上传、列表管理、审核队列
    - `Ops/`：接口文档中心、系统监控、缓存监控、系统日志、用户行为
    - `Personnel/`：用户、角色、菜单等权限相关页面
    - `System/`：系统参数、字典、令牌等配置页面

## 3. 接口约定与 API 总结

### 3.1 统一约定

- 所有真实 HTTP 调用统一封装在 `src/api` 下，通过共享的 `request` 实例发送请求（内部基于 `axios.ts` 中的 axios 实例和拦截器）。
- 页面组件仅通过已封装的函数进行调用，不直接拼接 URL 或调用 axios。
- 统一使用 `ApiResponse<T>` 类型处理 `{ code, msg, data }` 响应结构，在请求封装层解包后，页面侧直接拿到业务数据 `T`。
- 接口基础路径支持通过环境变量 `VITE_API_BASE_URL` 配置，默认值为 `/api`。

### 3.2 接口返回结构

- 通用响应：

```ts
interface ApiResponse<T = unknown> {
  code: number;
  msg: string;
  data: T;
}
```

- 通用分页结构：
  - 请求参数：`{ page: number; pageSize: number; ... }`
  - 返回数据：`{ list: T[]; total: number }`

### 3.3 已实现接口分组与示例（按模块汇总）

> 以下为当前项目已实现或已约定的主要接口分组，详细字段、示例与测试用例请参考 `docs/` 目录下的对应 TODO 文档。

#### 3.3.1 通用与前台模块

- 认证与安全（详见 `docs/TODO_登录与安全.md`）
  - 滑块验证码获取：`/auth/captcha/slider`
  - 滑块验证码校验：`/auth/captcha/slider/verify`
- 搜索与首页内容（详见 `docs/TODO_前台展示.md`）
  - 全站搜索：`/search/all`
  - 首页视频推荐：`/home/videos`
  - 首页文章推荐：`/home/articles`
  - 用户评价与评价区内容：`/home/reviews`
 
#### 3.3.2 后台内容管理模块

- 视频管理（对应 `src/pages/Admin/Video`）
  - 视频分片上传及合并：`/admin/content/video/upload/*`
  - 视频列表查询：`/admin/content/video/list`
  - 视频状态批量更新：`/admin/content/video/status/batch`
  - 视频审核相关接口：`/admin/content/video/review/*`
- 文档管理（对应 `src/pages/Admin/Document`）
  - 文档上传（含分片上传预留）：`/admin/content/document/upload/*`
  - 文档列表查询：`/admin/content/document/list`
  - 文档审核相关接口：`/admin/content/document/review/*`

#### 3.3.3 仪表盘与分析模块

- 菜单与仪表盘总览
  - 后台菜单树：`/admin/menu/tree`
  - 仪表盘总览数据：`/admin/dashboard/overview`
  - 访问流量统计：`/admin/dashboard/traffic`
  - 趋势数据：`/admin/dashboard/trend`
- 分析大屏
  - 指标统计：`/admin/dashboard/analysis/metrics`
  - 时间分布：`/admin/dashboard/analysis/time-distribution`
  - 大屏展示配置：`/admin/dashboard/analysis/display-config`

#### 3.3.4 系统运维模块

- 接口文档中心：`/admin/ops/api-doc/*`
- 系统监控：`/admin/ops/monitor/*`
- 缓存监控与缓存键管理：`/admin/ops/cache/*`
- 系统日志查询与导出：`/admin/ops/logs`、`/admin/ops/logs/export`
- 用户行为审计：`/admin/ops/behavior/*`

#### 3.3.5 权限与系统配置模块

（具体接口在 TODO 文档中约定，代码中通过 `admin/personnel.ts`、`admin/system.ts` 等封装）

- 用户管理：用户基本信息、状态、绑定关系等
- 角色管理：角色列表、角色权限配置、角色与用户关联
- 菜单管理：菜单树结构配置、前后端路由映射
- 系统参数：系统配置项、开关类配置
- 字典管理：数据字典分组与项管理
- 令牌与安全：令牌配置、刷新策略、黑名单等

更多接口详情请参考：

- `docs/TODO_视频管理.md`：视频管理后台页面接口设计与测试要点
- `docs/TODO_文档管理.md`：文档管理后台页面接口设计与测试要点
- `docs/TODO_前台展示.md`：前台首页、搜索、用户主页与视频详情等接口
- `docs/TODO_登录与安全.md`：登录 / 注册 / 令牌与找回密码相关接口
- `docs/TODO_仪表盘分析页.md`：仪表盘分析大屏相关统计接口
- `docs/TODO_系统运维.md`：系统运维（接口文档中心、系统监控、缓存、系统日志等）
- `docs/TODO_Admin.md`：后台菜单、仪表盘概览、最近操作日志等
- `docs/TODO_权限管理.md`：后台用户、角色、菜单等权限相关接口
- `docs/TODO_系统配置.md`：系统配置与数据字典、Bot 配置相关接口
- `docs/Analysis.md`：项目疑问与问题清单
- `docs/知识库小破站.md`：整体规划文档与技术栈约定

在对接新模块时，应同步补充对应的 `docs/TODO_[模块名].md` 文档，记录接口地址、请求参数、返回结构与测试要点。

### 3.4 接口测试用例模板与后端对接 Checklist

- 在以下文档的末尾，已为各模块补充统一的「接口测试用例模板」与「后端对接 Checklist」：
  - `docs/TODO_视频管理.md`：视频上传 / 列表 / 审核相关接口  
  - `docs/TODO_前台展示.md`：前台展示与互动接口（首页、搜索、用户主页、视频详情）  
  - `docs/TODO_登录与安全.md`：登录与安全接口（验证码、登录、注册、令牌、找回密码）  
  - `docs/TODO_仪表盘分析页.md`：分析大屏指标与时间分布相关接口  
  - `docs/TODO_系统运维.md`：接口文档中心、系统监控、缓存、日志、用户行为等运维接口  
  - `docs/TODO_Admin.md`：后台菜单、仪表盘总览、最近操作日志等  
- 新增接口或新模块时，建议直接复制对应模块的模板段落：
  - 使用「单接口记录与测试要点模板」补充字段和业务规则  
  - 基于「接口测试用例条目模板」设计正常 / 异常 / 边界用例  
  - 按「后端对接 Checklist」检查设计、开发、联调、上线前后各阶段是否完成必要工作。  

## 4. 本地开发流程

### 4.1 环境要求

- Node.js：建议 18+ 或 20+ 版本
- npm：建议 9+ 版本
- 推荐使用现代浏览器进行开发调试（Chrome / Edge 等）

### 4.2 安装依赖

```bash
npm install
```

### 4.3 本地开发

```bash
npm run dev
```

默认使用 Vite 开发服务器，支持 HMR 热更新。

### 4.4 代码检查与构建

代码检查（提交前建议必跑）：

```bash
npm run lint
```

构建生产包：

```bash
npm run build
```

构建完成后产物位于 `dist/` 目录，可使用任意静态资源服务器托管（如 nginx）。

预览本地打包结果：

```bash
npm run preview
```

## 5. Docker 部署流程（部署文档）

项目根目录已提供 `Dockerfile`，可用于一键构建前端静态资源并通过 nginx 托管。

### 5.1 构建镜像

在项目根目录执行：

```bash
docker build -t knowledge-ui .
```

如需自定义后端接口网关地址，可在构建阶段通过 `VITE_API_BASE_URL` 传入（默认为 `/api`）：

```bash
docker build -t knowledge-ui --build-arg VITE_API_BASE_URL=https://api.example.com .
```

### 5.2 运行容器

使用本地 8080 端口映射容器 80 端口运行：

```bash
docker run -d --name knowledge-ui -p 8080:80 knowledge-ui
```

然后即可通过浏览器访问：

```text
http://localhost:8080
```

### 5.3 部署到服务器的典型流程

1. 在 CI/CD 或服务器上拉取前端代码仓库。
2. 根据需要调整 `.env` / 构建参数中的 `VITE_API_BASE_URL`，指向后端网关地址。
3. 执行 `docker build` 构建前端镜像。
4. 在服务器上通过 `docker run` 或编排工具（如 Docker Compose / K8s）启动容器，并配置反向代理与 HTTPS。
5. 部署完成后，验证：
   - 前台首页、搜索页能正常访问。
   - 登录 / 注册流程与滑块验证码接口正常。
   - 后台管理各模块（视频、文档、仪表盘、系统运维、权限等）页面无报错，接口请求可正常返回。

## 6. 开发和对接约定

- 文案与文档：
  - 所有文档与界面文案统一使用中文。
  - 新增模块时应同步补充 `docs/TODO_[模块名].md` 文档。
- UI 与可视化：
  - 前端 UI 组件优先使用 @heroui/react，图标统一使用 react-icons。
  - 数据可视化统一使用 @ant-design/plots。
- 接口封装：
  - 新增接口时先在 `src/api` 下封装，通过 `request` 对象调用。
  - 页面仅依赖封装好的函数，不直接调用 axios 或硬编码 URL。
  - 接口返回统一按 `{ code, msg, data }` 约定处理，异常由 axios 拦截器统一处理。
- 质量保障：
  - 新功能开发完成后，需至少执行一次 `npm run lint` 与 `npm run build`。
  - 对于关键模块，建议补充对应的集成测试或页面级手工测试用例，并记录在 `docs/TODO_[模块名].md` 中。
