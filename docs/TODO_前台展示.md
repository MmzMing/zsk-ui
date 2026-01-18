# 前台展示与互动模块接口 TODO 清单

> 本文档用于记录「前台展示与互动」相关页面预计对接的接口信息，便于后续与后端对齐实现方案。所有接口返回格式统一为 `{ code, msg, data }`。

## 一、首页内容聚合（/home/*）

- 接口名称：获取首页视频推荐列表  
- 接口地址：`GET /api/home/videos`  
- 请求参数：无（后续如需分页或分区可新增 `page`、`pageSize`、`section` 等参数）  
- 返回数据结构（data）：
  - 类型：`HomeVideo[]`
  - 字段说明：
    - `id`: string，视频 ID  
    - `title`: string，视频标题  
    - `views`: string，播放量（字符串形式，已格式化）  
    - `date`: string，上线日期，格式待与后端确认（如 `YYYY-MM-DD`）  
- 测试用例要点：
  - 首页正常返回推荐列表且不为空  
  - 当无推荐数据时返回空数组而非错误  
  - `views` 字段与前端展示一致（是否需要服务端直接返回格式化文案）  
- 精简待办：
  - 与后端确认是否需要支持分页 / 分区（如「正在热播」「最新上架」）  
  - 确认日期格式与时区约定  

- 接口名称：获取首页文章推荐列表  
- 接口地址：`GET /api/home/articles`  
- 请求参数：无  
- 返回数据结构（data）：
  - 类型：`HomeArticle[]`
  - 字段说明：
    - `id`: string，文章 ID  
    - `category`: string，文章分类  
    - `title`: string，文章标题  
    - `date`: string，发布日期  
    - `summary`: string，摘要内容  
    - `views`: string，阅读量（字符串形式）  
    - `author`: string，可选，作者名称  
- 测试用例要点：
  - 不同分类的文章能正常展示在首页推荐区  
  - 缺失 `author` 字段时前端展示回退策略（如显示「匿名」）  
- 精简待办：
  - 是否需要增加按分类过滤或更多文章来源标签  

- 接口名称：获取首页用户评价 / 使用反馈列表  
- 接口地址：`GET /api/home/reviews`  
- 请求参数：无  
- 返回数据结构（data）：
  - 类型：`HomeReview[]`
  - 字段说明：
    - `id`: string，评价 ID  
    - `name`: string，用户昵称  
    - `role`: string，用户角色或身份标签（如「前端工程师」「个人开发者」）  
    - `source`: string，评价来源（如「B 站弹幕」「评论区」「内部同事」）  
    - `date`: string，评价时间  
    - `content`: string，评价内容文案  
    - `tone`: string，评价语气标签（如 `positive` / `neutral` / `negative`）  
- 测试用例要点：
  - 首页评价区轮播 / 列表展示数据正常  
  - `tone` 字段为空或异常时前端样式回退策略  
- 精简待办：
  - 与后端确认 `tone` 枚举值与含义  
  - 确认是否支持根据来源 / 角色进行筛选或分区展示  

## 二、全站搜索（/search/all）

- 接口名称：全站统一搜索  
- 接口地址：`GET /api/search/all`  
- 请求参数（Query）：
  - `keyword?`: string，搜索关键词  
  - `category?`: `"all" | "video" | "document" | "tool" | "user"`，搜索类别  
  - `sort?`: `"hot" | "latest" | "like" | "usage" | "relevance" | "fans" | "active"`，排序规则  
  - `duration?`: string，可选，时长过滤（如 `"0-10"`、`"10-30"` 分钟）  
  - `timeRange?`: string，可选，时间范围（如 `"7d"`、`"30d"`、`"all"`）  
  - `tag?`: string，可选，标签过滤  
- 请求参数处理约定（前端已在封装层实现）：
  - `keyword`、`duration`、`timeRange`、`tag` 为空字符串或 `null` 时不传给后端  
  - `category="all"` 时不传 `category`，由后端默认返回全部类型  
- 返回数据结构（data）：
  - 类型：`SearchAllApiData`
  - 可能形式：
    - 纯列表：`SearchResult[]`  
    - 带分页信息：`{ list: SearchResult[]; total?: number }`  
  - `SearchResult` 字段说明（部分）：
    - `id`: string，结果唯一 ID  
    - `type`: `"video" | "document | "tool" | "user"`，结果类型  
    - `title`: string，标题  
    - `description`: string，摘要 / 描述  
    - `tags`: string[]，标签列表  
    - `stats?`: string，可选，综合统计文案  
    - `thumbnail?`: string，视频 / 文档封面图  
    - `avatar?`: string，用户头像  
    - 统计类字段（按 type 有选择地返回）：
      - `duration?`: string，视频时长  
      - `playCount?`: number，播放量  
      - `commentCount?`: number，评论数  
      - `readCount?`: number，阅读量  
      - `favoriteCount?`: number，收藏量  
      - `usageCount?`: number，工具使用次数  
      - `followers?`: number，粉丝数  
      - `works?`: number，作品数  
      - `isLive?`: boolean，是否直播中  
      - `levelTag?`: string，等级 / 身份标识  
    - `timeRange?`: string，可选，与搜索条件 / 结果时间区间相关的标记  
    - `url?`: string，可选，直接跳转地址  
- 测试用例要点：
  - 在不同 `category`、`sort` 组合下返回结果正常，排序符合预期  
  - 当仅返回列表（无 `total`）时，前端能正确处理不展示分页  
  - 关键字段缺失时前端展示回退逻辑（封面 / 头像 / 标签等）  
- 精简待办：
  - 与后端确认 SearchResult 字段在不同 type 下必填与可选的差异  
  - 确定是否需要分模块返回（例如按类型分组：视频区、文档区、用户区）  

## 三、用户主页与关注关系（/user/*）

- 接口名称：获取用户主页信息  
- 接口地址：`GET /api/user/profile/{id}`  
- 请求参数：
  - Path 参数：
    - `id`: string，用户 ID  
- 返回数据结构（data）：
  - 类型：`UserProfile`
  - 字段说明：
    - `id`: string，用户 ID  
    - `username`: string，登录名 / 用户名  
    - `name`: string，展示名称  
    - `avatar`: string，头像链接  
    - `bio`: string，个人简介  
    - `location?`: string，可选，所在城市 / 地区  
    - `website?`: string，可选，个人网站  
    - `stats`: object，统计信息：
      - `followers`: number，粉丝数  
      - `following`: number，关注数  
      - `works`: number，作品数  
      - `likes`: number，获赞数  
    - `isFollowing`: boolean，当前登录用户是否已关注该用户  
- 测试用例要点：
  - 已登录与未登录情况下 `isFollowing` 字段表现一致且合理  
  - 不存在的用户 ID 返回的错误码与文案  
- 精简待办：
  - 与认证模块确认未登录访问时 `isFollowing` 的默认值与响应结构  

- 接口名称：更新用户主页信息  
- 接口地址：`POST /api/user/profile/update`  
- 请求参数（Body，JSON）：
  - 类型：`Partial<UserProfile>`，实际允许字段需与后端约定（一般不允许直接修改统计字段）  
- 返回数据结构（data）：
  - 类型：`UserProfile`，返回更新后的最新用户信息  
- 测试用例要点：
  - 仅修改部分字段时，其余字段保持不变  
  - 禁止修改字段（如 `id`、统计字段）的处理方式  
- 精简待办：
  - 与后端确认可修改字段白名单  
  - 确认是否需要对 `bio`、`name` 等字段做敏感词过滤  

- 接口名称：关注 / 取消关注用户  
- 接口地址：`POST /api/user/follow/{id}`  
- 请求参数：
  - Path 参数：
    - `id`: string，被关注用户 ID  
- 返回数据结构（data）：
  - 类型：`{ isFollowing: boolean }`  
- 测试用例要点：
  - 同一接口实现关注与取消关注的幂等性（多次点击结果一致）  
  - 不能关注自己时的错误提示  
- 精简待办：
  - 与后端确认是否需要防止频繁关注 / 取关的限流策略  

- 接口名称：获取用户作品列表  
- 接口地址：`GET /api/user/works/{id}`  
- 请求参数：
  - Path 参数：
    - `id`: string，用户 ID  
  - Query 参数：
    - `page`: number，页码，从 1 开始  
    - `pageSize`: number，每页数量  
    - `type?`: string，可选，`"video"` | `"article"` 等  
- 返回数据结构（data）：
  - 类型：`{ list: UserWorkItem[]; total: number }`  
  - `UserWorkItem` 字段：
    - `id`: string，作品 ID  
    - `type`: `"video" | "article"`，作品类型  
    - `title`: string，标题  
    - `coverUrl`: string，封面图  
    - `views`: number，浏览量  
    - `createdAt`: string，创建时间  
- 测试用例要点：
  - 不同 `type` 过滤下列表数据正确  
  - 无作品时返回空列表与 `total=0`  
- 精简待办：
  - 确认是否需要按公开/私密作品进行过滤  

## 四、视频详情与互动（/content/video/*）

- 接口名称：获取视频详情  
- 接口地址：`GET /api/content/video/detail/{id}`  
- 请求参数：
  - Path 参数：
    - `id`: string，视频 ID  
- 返回数据结构（data）：
  - 类型：`VideoDetail`
  - 核心字段说明：
    - `id`: string，视频 ID  
    - `title`: string，标题  
    - `description`: string，描述  
    - `videoUrl`: string，视频播放地址（如 m3u8）  
    - `coverUrl`: string，封面图片地址  
    - `author`: object，作者信息：
      - `id`: string  
      - `name`: string  
      - `avatar`: string  
      - `fans`: string，粉丝数（字符串形式）  
      - `isFollowing`: boolean，当前用户是否关注作者  
    - `stats`: object，统计信息：
      - `views`: string，播放量（字符串形式）  
      - `likes`: number，点赞数  
      - `favorites`: number，收藏数  
      - `date`: string，上线日期  
      - `isLiked`: boolean，当前用户是否已点赞  
      - `isFavorited`: boolean，当前用户是否已收藏  
    - `tags`: string[]，标签列表  
    - `recommendations`: 推荐视频列表：
      - `id`: string  
      - `title`: string  
      - `coverUrl`: string  
      - `duration`: string，时长  
      - `views`: string，播放量  
- 测试用例要点：
  - 未登录与已登录用户在 `isLiked`、`isFavorited`、`author.isFollowing` 的差异  
  - 不存在的视频 ID 返回正确的错误码与文案  
- 精简待办：
  - 确认推荐视频数量与排序规则  
  - 确定是否需要返回弹幕、章节等扩展字段  

- 接口名称：点赞 / 取消点赞视频  
- 接口地址：`POST /api/content/video/like/{id}`  
- 请求参数：
  - Path 参数：
    - `id`: string，视频 ID  
- 返回数据结构（data）：
  - 类型：`{ isLiked: boolean; count: number }`  
- 测试用例要点：
  - 同一用户多次点击点赞按钮的幂等行为（点赞 / 取消点赞切换）  
  - 未登录用户请求时的错误码与前端拦截策略  

- 接口名称：收藏 / 取消收藏视频  
- 接口地址：`POST /api/content/video/favorite/{id}`  
- 请求参数：
  - Path 参数：
    - `id`: string，视频 ID  
- 返回数据结构（data）：
  - 类型：`{ isFavorited: boolean; count: number }`  
- 测试用例要点：
  - 与个人收藏夹数据的一致性（刷新页面后收藏状态正确）  
  - 并发场景下收藏数 `count` 的正确性  

- 接口名称：获取视频评论列表  
- 接口地址：`GET /api/content/video/comments/{id}`  
- 请求参数：
  - Path 参数：
    - `id`: string，视频 ID  
  - Query 参数：
    - `page`: number，页码，从 1 开始  
    - `pageSize`: number，每页数量  
- 返回数据结构（data）：
  - 类型：`{ list: CommentItem[]; total: number }`  
  - `CommentItem` 字段：
    - `id`: string，评论 ID  
    - `content`: string，评论内容  
    - `author`: object，评论作者信息：
      - `id`: string  
      - `name`: string  
      - `avatar`: string  
    - `createdAt`: string，创建时间  
    - `likes`: number，点赞数  
    - `isLiked`: boolean，当前用户是否已点赞该评论  
    - `replies?`: `CommentItem[]`，可选，子回复列表  
- 测试用例要点：
  - 评论树结构多层嵌套时的返回格式与前端渲染  
  - 无评论时返回空列表与 `total=0`  

- 接口名称：发表 / 回复评论  
- 接口地址：`POST /api/content/video/comment`  
- 请求参数（Body，JSON）：
  - `videoId`: string，视频 ID  
  - `content`: string，评论内容  
  - `parentId?`: string，可选，被回复评论 ID  
- 返回数据结构（data）：
  - 类型：`CommentItem`，返回新创建的评论对象  
- 测试用例要点：
  - 评论内容长度限制与敏感词过滤策略  
  - 回复评论时 `parentId` 合法性校验  
- 精简待办：
  - 与后端确认评论审核机制（是否需要预审核 / 延迟展示）  

## 附录：接口测试用例模板与后端对接 Checklist（前台展示模块）

> 本附录为「前台展示与互动」模块下所有接口提供统一的记录格式和测试用例模板，前后端在补充 / 新增接口时可以直接复制使用，保证文档、联调与测试的一致性。

### A. 单接口记录与测试要点模板

1. 基础信息
   - 接口名称：  
   - 接口地址：`[METHOD] /api/...`（如 `/api/home/videos`、`/api/search/all` 等）  
   - HTTP 方法：GET / POST / PUT / DELETE  
   - 所属模块：前台展示与互动  
   - 前端入口：页面名称 + 功能按钮说明（例如「首页 · 视频推荐区加载」）  
   - 是否需要登录：是 / 否  
   - 所需权限点：如 `user:follow`、`video:comment` 等（如有）  

2. 请求参数设计
   - 参数位置：Query / Body(JSON) / Path / Header  
   - 参数列表（建议使用表格补充）：

     | 字段名   | 类型   | 必填 | 示例值          | 说明                     |
     | -------- | ------ | ---- | --------------- | ------------------------ |
     | keyword  | string | 否   | 知识库          | 搜索关键词               |
     | category | string | 否   | video           | 搜索类别                 |
     | page     | number | 否   | 1               | 页码，从 1 开始          |
     | pageSize | number | 否   | 20              | 每页数量                 |
     | ...      | ...    | ...  | ...             | ...                      |

3. 响应数据结构
   - 成功响应示例（复用全局 `{ code, msg, data }` 结构）  
   - `data` 字段详细说明（建议使用表格）：

     | 字段名          | 类型     | 示例值                         | 说明                 |
     | --------------- | -------- | ------------------------------ | -------------------- |
     | list            | object[] |                                | 列表数据             |
     | total           | number   | 32                             | 总条数               |
     | list[].id       | string   | v_001                          | 主键 ID              |
     | list[].title    | string   | 从 0 搭建个人知识库前端        | 标题                 |
     | list[].views    | string   | 1.2w                           | 浏览 / 播放量展示文案 |
     | ...             | ...      | ...                            | ...                  |

4. 错误码与异常场景
   - 系统类错误：如 401 未登录、403 无权限、500 服务器异常等  
   - 业务类错误示例：
     - 目标用户不存在
     - 视频不存在或已下线
     - 搜索条件非法（如分页参数越界）  
   - 每个错误码至少给出 1 条测试用例（输入参数 + 预期错误信息）。  

5. 业务规则与边界条件
   - 未登录用户能访问的页面与接口范围（如首页、搜索）  
   - 登录用户在同一接口下的额外字段（如关注状态、点赞状态）  
   - 分页边界：最后一页、超出页码时的返回行为等。  

6. 权限与安全要求
   - 需要登录的接口（如关注、点赞、评论）必须校验登录态  
   - 是否需要在操作日志 / 行为审计中记录（例如关注某人、点赞某视频等）。  

7. 性能与限流要求
   - 首页、搜索等高频接口的推荐分页大小（例如 pageSize <= 50）  
   - 是否需要对点赞 / 评论等写操作做限流与防刷处理。  

8. 日志与监控
   - 关键行为是否需要打点统计（如首页加载时间、搜索成功率）  
   - 是否有关键指标需要在监控大盘中展示（搜索 QPS、失败率等）。  

9. 兼容性与变更记录
   - 字段新增 / 删除的向前兼容策略  
   - 对旧前端版本的影响评估。  

### B. 接口测试用例条目模板

> 建议每个接口至少覆盖「正常」「必填缺失」「非法输入」「无权限」「边界值」等场景。

- 用例编号：FRONT-API-001  
- 用例名称：首页视频推荐列表加载成功  
- 前置条件：
  - 前台站点可访问  
- 步骤：
  1. 打开首页  
  2. 触发首页视频推荐区数据加载（或直接调用 `GET /api/home/videos`）  
- 输入数据：
  - 无  
- 预期结果：
  - 返回 `code=0`，`data` 为非空数组  
  - 页面正常展示推荐视频列表，无报错  
- 备注：无  

可以在此模板基础上复制多条用例，编号建议包含模块前缀（如 `FRONT-`）。  

### C. 后端对接 Checklist（模块级）

1. 设计阶段
   - [ ] 所有计划对接的前台展示与互动接口已在本文件登记  
   - [ ] 与后端确认了请求参数、返回结构、错误码、登录态差异等  
   - [ ] 确认首页与搜索接口的缓存策略与刷新机制  

2. 开发阶段
   - [ ] 后端已在测试环境提供稳定接口（或 Mock 服务）  
   - [ ] 前端已完成 `src/api/front/*.ts` 封装，并在对应页面中使用  
   - [ ] 字段命名与 TODO 文档保持一致  

3. 联调阶段
   - [ ] 针对每个接口至少执行 1 轮全量测试用例  
   - [ ] 对搜索、点赞、评论等关键操作进行异常场景验证（网络中断、参数异常等）  
   - [ ] 日志、监控中可看到对应行为记录  

4. 上线前
   - [ ] 与后端确认生产环境网关路径、超时时间、缓存与限流策略  
   - [ ] 已根据测试结果更新本文件中的「测试用例要点」与「精简待办」  

5. 上线后
   - [ ] 监控首页访问成功率、搜索成功率、互动行为成功率等指标  
   - [ ] 若发现高频异常或性能问题，及时在本文件补充问题与跟进记录。  

