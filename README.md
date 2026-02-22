# 知识库小破站 · 前端 UI 项目

## 💩经过慎重考虑

本项目是当初学AI编程时的一个小项目，主要是学习skill、mcp、规则
目前只对接了后台登录接口，最近没空。。。估计后面都不会更新了，这个项目就当是一个学习项目吧。

使用AI编程软件：[trae](https://trae.ai/)
- AI开发项目耗时：3天（一定要接入MCP和skill，不然项目肉眼可见是AI生成）
- 新增功能：3天
- 修改对接后端接口：15天（一定要限制规则，别用trae，用CC！不是说不好，后者代码改动量少很多）

## 📖 项目概述

本项目是“知识库小破站”的前端 UI 部分，集成了前台知识展示与后台管理系统。项目基于现代前端技术栈构建，旨在提供高性能、易维护的用户界面。

- **前台站点**：视频推荐、文章展示、全站搜索、用户评价。
- **后台管理**：视频/文档内容管理、数据仪表盘、系统运维、权限控制。
- **认证模块**：登录注册、滑块验证码、安全令牌管理。

## 🛠️ 技术栈

- **核心框架**：[React 19](https://react.dev/) + [Vite 7](https://vitejs.dev/) + [TypeScript 5](https://www.typescriptlang.org/)
- **UI 组件库**：[@heroui/react](https://heroui.com/) (主要组件), [react-icons](https://react-icons.github.io/react-icons/) (图标)
- **状态管理**：[Zustand](https://github.com/pmndrs/zustand)
- **路由管理**：[React Router v7](https://reactrouter.com/)
- **数据请求**：[Axios](https://axios-http.com/)
- **数据可视化**：[@ant-design/plots](https://ant-design-charts.antgroup.com/)
- **多媒体与动效**：framer-motion, React Bits, Magic UI, react-player, @vidstack/react
- **工具库**：dayjs, lodash, js-cookie

## 🚀 快速开始

### 前置条件
- **Node.js**：建议 v18+ 或 v20+
- **npm**：建议 v9+

### 本地开发

1. **安装依赖**
   ```bash
   npm install
   ```

2. **启动开发服务器**
   ```bash
   npm run dev
   ```
   默认运行在 `http://localhost:5173` (具体端口视 Vite 配置而定)。

3. **构建生产版本**
   ```bash
   npm run build
   ```

4. **预览构建产物**
   ```bash
   npm run preview
   ```

5. **代码检查**
   ```bash
   npm run lint
   ```

## 📂 目录结构

```text
src/
├── api/                # API 接口层 (基于 Axios 封装)
│   ├── admin/          # 后台管理相关接口 (视频、文档、运维、权限等)
│   ├── auth/           # 认证相关接口 (登录、注册、验证码)
│   ├── front/          # 前台业务接口 (首页、搜索)
│   ├── axios.ts        # Axios 实例配置 (拦截器、全局配置)
│   └── types.ts        # 全局接口类型定义 (ApiResponse)
├── components/         # 公共组件
│   ├── VideoPlayer/    # 全局视频播放器封装
│   └── Motion/         # 动效组件集合
├── pages/              # 页面视图
│   ├── Admin/          # 后台管理子系统 (视频、文档、运维、权限)
│   ├── Auth/           # 认证页面 (登录、注册)
│   ├── Home/           # 前台首页
│   └── AllSearch/      # 全站搜索页
└── ...
```

## 🔌 接口开发约定

### 响应结构
所有接口统一返回 `ApiResponse<T>` 格式：
```typescript
interface ApiResponse<T = unknown> {
  code: number; // 0 表示成功
  msg: string;  // 提示信息
  data: T;      // 业务数据
}
```

### 开发规范
1. **接口封装**：所有 HTTP 请求必须在 `src/api` 目录下封装，禁止在页面组件中直接调用 `axios`。
2. **路径配置**：接口基础路径支持通过环境变量 `VITE_API_BASE_URL` 配置，默认为 `/api`。
3. **文档同步**：新增模块时，请在 `docs/` 目录下创建或更新对应的 `API_[模块名].md` 文档。

## 🐳 Docker 部署

项目支持 Docker 容器化部署，使用 Nginx 托管静态资源。

### 构建镜像
```bash
# 默认构建
docker build -t knowledge-ui .

# 指定后端 API 地址
docker build -t knowledge-ui --build-arg VITE_API_BASE_URL=https://api.example.com .
```

### 运行容器
```bash
docker run -d --name knowledge-ui -p 8080:80 knowledge-ui
```
访问 `http://localhost:8080` 即可查看部署效果。

## 📚 文档索引

详细的设计文档和接口说明请参考 `docs/` 目录：
- [前台展示接口](docs/TODO_前台展示.md)
- [登录与安全](docs/TODO_登录与安全.md)
- [视频管理](docs/TODO_视频管理.md)
- [文档管理](docs/TODO_文档管理.md)
- [系统运维](docs/TODO_系统运维.md)
- [权限管理](docs/TODO_权限管理.md)
- [仪表盘分析](docs/TODO_仪表盘分析页.md)

---
> **注意**：本项目遵循中文文档规范，UI 组件优先使用 `@heroui/react`。
