# front/resume.ts（简历）前后端接口对接文档

> 文档创建时间：2026-02-15  
> 对接策略：后端新建接口，前端修改路径

---

## 一、模块总览

| 子模块 | 前端接口数 | 后端状态 | 对接方案 |
|-------|----------|---------|---------|
| 简历详情 | 1个 | ✅ 已完成 | 前端修改路径 |
| 保存简历 | 1个 | ✅ 已完成 | 前端修改路径 |

---

## 二、接口映射表

| 前端接口 | HTTP | 前端路径 | 后端路径 | 状态 |
|---------|------|---------|---------|------|
| fetchResumeDetail | GET | `/system/resume/detail` | `/resume/detail` | ✅ |
| saveResume | POST | `/system/resume/save` | `/resume/save` | ✅ |

---

## 三、字段映射表

### 3.1 ResumeModule 字段映射

| 前端字段 | 后端字段 | 类型 | 说明 |
|---------|---------|------|------|
| id | id | String | 模块ID |
| type | type | String | 模块类型（basic/content） |
| title | title | String | 模块标题 |
| icon | icon | String | 图标 |
| isDeletable | isDeletable | Boolean | 是否可删除 |
| isVisible | isVisible | Boolean | 是否可见 |
| data | data | BasicInfo | 基础信息数据 |
| content | content | String | 富文本内容 |

### 3.2 BasicInfo 字段映射

| 前端字段 | 后端字段 | 类型 | 说明 |
|---------|---------|------|------|
| name | name | String | 姓名 |
| jobIntention | jobIntention | String | 求职意向 |
| age | age | String | 年龄 |
| gender | gender | String | 性别 |
| city | city | String | 城市 |
| phone | phone | String | 电话 |
| email | email | String | 邮箱 |
| github | github | String | GitHub |
| summary | summary | String | 个人简介 |
| avatar | avatar | String | 头像 |
| experience | experience | String | 工作经验 |
| salary | salary | String | 期望薪资 |
| politics | politics | String | 政治面貌 |
| status | status | String | 求职状态 |

---

## 四、后端新增文件清单

| 文件路径 | 说明 |
|---------|------|
| `ResumeProperties.java` | 简历配置属性类 |
| `ResumeController.java` | 简历控制器 |
| `ResumeModuleVo.java` | 简历模块视图对象 |
| `BasicInfoVo.java` | 基础信息视图对象 |

---

## 五、前端修改清单

### 5.1 添加依赖导入

```typescript
// ===== 修改文件：zsk-ui/src/api/front/resume.ts =====
import { request, handleRequest } from "../axios";
```

### 5.2 修改接口实现

```typescript
/**
 * 获取简历详情
 */
export const fetchResumeDetail = async () => {
  const { data } = await handleRequest({
    requestFn: () =>
      request.instance
        .get<ApiResponse<ResumeModule[]>>("/system/resume/detail")
        .then((r) => r.data),
    mockData: mockResumeModules as ResumeModule[],
    apiName: "fetchResumeDetail",
  });
  return { code: 200, msg: "success", data };
};

/**
 * 保存简历
 */
export const saveResume = async (modules: ResumeModule[]) => {
  const { data } = await handleRequest({
    requestFn: () =>
      request.instance
        .post<ApiResponse<null>>("/system/resume/save", modules)
        .then((r) => r.data),
    mockData: null,
    apiName: "saveResume",
  });
  return { code: 200, msg: "success", data };
};
```

**修改说明：**
- 从 Mock Promise 改为调用后端接口
- 添加 `request` 和 `handleRequest` 导入
- 接口路径：`/system/resume/detail` 和 `/system/resume/save`

---

## 六、Nacos配置示例

需要在Nacos配置中心添加以下配置（`zsk-module-system-dev.yml`）：

```yaml
resume:
  modules:
    - id: basic
      type: basic
      title: 基本信息
      icon: user
      isDeletable: false
      isVisible: true
      data:
        name: 张三
        jobIntention: Java开发工程师
        age: 28
        gender: 男
        city: 北京
        phone: 138****8888
        email: zhangsan@example.com
        github: https://github.com/zhangsan
        summary: 5年Java开发经验，熟悉Spring Cloud微服务架构
        avatar: /avatar/default.jpg
        experience: 5年
        salary: 20-30K
        politics: 群众
        status: 随时入职
    - id: experience
      type: content
      title: 工作经历
      icon: briefcase
      isDeletable: true
      isVisible: true
      content: <h3>某科技公司</h3><p>2020.06 - 至今</p><p>负责核心业务系统开发...</p>
    - id: education
      type: content
      title: 教育背景
      icon: graduation-cap
      isDeletable: true
      isVisible: true
      content: <h3>某大学</h3><p>2016.09 - 2020.06</p><p>计算机科学与技术专业</p>
```

---

## 七、对接检查清单

### 7.1 后端新增清单

- [x] 新建 `ResumeProperties.java` 配置属性类
- [x] 新建 `ResumeController.java` 控制器
- [x] 新建 `ResumeModuleVo.java` 视图对象
- [x] 新建 `BasicInfoVo.java` 视图对象

### 7.2 前端修改清单

- [x] 添加 `request` 和 `handleRequest` 导入
- [x] 修改 `fetchResumeDetail` 接口实现
- [x] 修改 `saveResume` 接口实现

---

## 八、注意事项

1. **数据来源**：简历数据从Nacos配置中心获取，支持动态刷新
2. **保存功能**：目前保存接口只返回成功，后续可实现持久化到数据库
3. **配置路径**：配置前缀为 `resume`，需要在 `zsk-module-system-dev.yml` 中添加
4. **富文本内容**：content字段支持HTML格式的富文本内容
