# about.ts（About页面）前后端接口对接文档

> 文档创建时间：2026-02-15  
> 对接策略：后端新建接口，前端修改路径

---

## 一、模块总览

| 子模块 | 前端接口数 | 后端状态 | 对接方案 |
|-------|----------|---------|---------|
| 技术栈列表 | 1个 | ✅ 已完成 | 前端修改路径 |
| FAQ列表 | 1个 | ✅ 已完成 | 前端修改路径 |

---

## 二、技术栈列表（fetchTechStack）

### 2.1 接口映射表

| 前端接口 | HTTP | 后端接口 | 对接方案 |
|---------|------|---------|---------|
| `/about/skill` | GET | `/system/about/skill` | 前端修改路径 |

### 2.2 字段映射表

| 前端字段 | 后端字段 | 类型 | 说明 |
|---------|---------|------|------|
| id | id | String | 唯一标识 |
| name | name | String | 名称 |
| description | description | String | 描述 |

### 2.3 前端修改清单

```typescript
// ===== 修改文件：zsk-ui/src/api/front/about.ts =====

/**
 * 获取技术栈列表
 * @returns 技术栈列表数据
 */
export async function fetchTechStack(): Promise<TechStackItem[]> {
  const { data } = await handleRequest({
    requestFn: () => request.instance.get<ApiResponse<TechStackItem[]>>("/system/about/skill").then(r => r.data),
    mockData: mockTechStack,
    apiName: "fetchTechStack"
  });
  return data;
}
```

**修改说明：**
- 路径从 `/about/skill` 改为 `/system/about/skill`

### 2.4 后端新增文件清单

| 文件路径 | 说明 |
|---------|------|
| `AboutProperties.java` | Nacos配置属性类 |
| `TechStackVo.java` | 技术栈视图对象 |
| `IAboutService.java` | 服务接口 |
| `AboutServiceImpl.java` | 服务实现 |
| `AboutController.java` | 控制器 |

### 2.5 后端核心代码

#### 2.5.1 配置属性类

```java
// ===== 文件：AboutProperties.java =====
package com.zsk.system.config;

@Data
@Component
@ConfigurationProperties(prefix = "about")
public class AboutProperties {

    /** 技术栈列表 */
    private List<TechStackItem> techStack = new ArrayList<>();

    /** FAQ分类列表 */
    private List<FaqCategory> faq = new ArrayList<>();

    @Data
    public static class TechStackItem {
        private String id;
        private String name;
        private String description;
    }
}
```

#### 2.5.2 控制器

```java
// ===== 文件：AboutController.java =====
package com.zsk.system.controller;

@Tag(name = "About页面")
@RestController
@RequestMapping("/about")
@RequiredArgsConstructor
public class AboutController {

    private final IAboutService aboutService;

    @Operation(summary = "获取技术栈列表")
    @GetMapping("/skill")
    public R<List<TechStackVo>> getTechStack() {
        return R.ok(aboutService.getTechStack());
    }
}
```

### 2.6 Nacos配置示例

需要在Nacos配置中心添加以下配置（`zsk-module-system-dev.yml`）：

```yaml
about:
  tech-stack:
    - id: java
      name: JAVA
      description: 后端核心开发语言
    - id: mysql
      name: MYSQL
      description: 关系型数据库管理系统
    - id: redis
      name: REDIS
      description: 高性能键值对数据库
    - id: spring
      name: SPRING
      description: 企业级应用开发框架
    - id: docker
      name: DOCKER
      description: 容器化部署与管理
    - id: rocketmq
      name: ROCKETMQ
      description: 分布式消息中间件
    - id: react
      name: REACT
      description: 构建用户界面的前端库
    - id: ts
      name: TS
      description: JavaScript 的超集
```

---

## 三、FAQ列表（fetchFAQ）

### 3.1 接口映射表

| 前端接口 | HTTP | 后端接口 | 对接方案 |
|---------|------|---------|---------|
| `/about/faq` | GET | `/system/about/faq` | 前端修改路径 |

### 3.2 字段映射表

**FAQCategory：**

| 前端字段 | 后端字段 | 类型 | 说明 |
|---------|---------|------|------|
| title | title | String | 分类名称 |
| items | items | List | FAQ列表 |

**FAQItem：**

| 前端字段 | 后端字段 | 类型 | 说明 |
|---------|---------|------|------|
| id | id | String | 唯一标识 |
| question | question | String | 问题 |
| answer | answer | String | 回答 |

### 3.3 前端修改清单

```typescript
// ===== 修改文件：zsk-ui/src/api/front/about.ts =====

/**
 * 获取 FAQ 列表
 * @returns FAQ 列表数据
 */
export async function fetchFAQ(): Promise<FAQCategory[]> {
  const { data } = await handleRequest({
    requestFn: () => request.instance.get<ApiResponse<FAQCategory[]>>("/system/about/faq").then(r => r.data),
    mockData: mockFAQ,
    apiName: "fetchFAQ"
  });
  return data;
}
```

**修改说明：**
- 路径从 `/about/faq` 改为 `/system/about/faq`

### 3.4 后端新增文件清单

| 文件路径 | 说明 |
|---------|------|
| `FaqCategoryVo.java` | FAQ分类视图对象 |
| `FaqItemVo.java` | FAQ项视图对象 |

### 3.5 Nacos配置示例

```yaml
about:
  faq:
    - title: 使用操作类
      items:
        - id: "1"
          question: 如何导入本地 Markdown 文件？
          answer: 在文档编辑器页面，直接将本地 .md 文件拖拽至编辑区域即可自动解析并导入内容。
        - id: "2"
          question: 支持哪些视频格式上传？
          answer: 目前支持 MP4、WebM、MOV 等主流视频格式。
    - title: 功能适配类
      items:
        - id: "3"
          question: 移动端可以使用编辑器吗？
          answer: 可以。移动端编辑器针对触屏操作进行了优化。
        - id: "4"
          question: 如何开启深色模式？
          answer: 点击右上角的系统设置图标，在"主题风格"中选择"深色"或"跟随系统"。
```

---

## 四、对接检查清单

### 4.1 前端修改清单

- [x] 修改 `fetchTechStack` 接口路径
- [x] 修改 `fetchFAQ` 接口路径

### 4.2 后端新增清单

- [x] 新建 `AboutProperties.java` 配置属性类
- [x] 新建 `TechStackVo.java` 视图对象
- [x] 新建 `FaqCategoryVo.java` 视图对象
- [x] 新建 `FaqItemVo.java` 视图对象
- [x] 新建 `IAboutService.java` 服务接口
- [x] 新建 `AboutServiceImpl.java` 服务实现
- [x] 新建 `AboutController.java` 控制器

### 4.3 Nacos配置清单

- [ ] 在Nacos配置中心添加 `about.tech-stack` 配置
- [ ] 在Nacos配置中心添加 `about.faq` 配置

---

## 五、注意事项

1. **数据来源**：技术栈和FAQ数据从Nacos配置中心获取，支持动态刷新
2. **配置路径**：配置前缀为 `about`，需要在 `zsk-module-system-dev.yml` 中添加
3. **刷新机制**：配置 `refresh-enabled: true` 已启用，修改配置后自动刷新
4. **字段映射**：前端字段名与后端字段名保持一致，无需额外转换
