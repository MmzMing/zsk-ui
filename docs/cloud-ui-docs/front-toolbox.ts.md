# front/toolbox.ts（工具箱）前后端接口对接文档

> 文档创建时间：2026-02-15  
> 对接策略：后端新建接口，数据从Nacos获取

---

## 一、模块总览

| 子模块 | 前端接口数 | 后端状态 | 对接方案 |
|-------|----------|---------|---------|
| 工具详情 | 1个 | ✅ 已完成 | 前端修改路径 |

---

## 二、接口映射表

| 前端接口 | HTTP | 前端路径 | 后端路径 | 状态 |
|---------|------|---------|---------|------|
| getToolboxDetail | GET | `/system/toolbox/{id}` | `/toolbox/{id}` | ✅ |

---

## 三、字段映射表

### 3.1 ToolboxDetail 字段映射

| 前端字段 | 后端字段 | 类型 | 说明 |
|---------|---------|------|------|
| id | id | String | 工具ID |
| title | title | String | 标题 |
| description | description | String | 描述 |
| logo | logo | String | Logo图标URL |
| tags | tags | String[] | 标签列表 |
| url | url | String | 访问链接 |
| images | images | String[] | 预览图列表 |
| features | features | String[] | 特性功能点列表 |
| relatedTools | relatedTools | Object[] | 相关工具列表 |
| stats.views | stats.views | Long | 浏览量 |
| stats.likes | stats.likes | Long | 点赞数 |
| stats.usage | stats.usage | Long | 使用量 |
| author.name | author.name | String | 作者姓名 |
| author.avatar | author.avatar | String | 头像URL |
| createAt | createAt | String | 创建日期 |

---

## 四、后端新增文件清单

| 文件路径 | 说明 |
|---------|------|
| `ToolboxProperties.java` | 工具箱配置属性类 |
| `ToolboxController.java` | 工具箱控制器 |
| `ToolboxDetailVo.java` | 工具箱详情视图对象 |

---

## 五、前端修改清单

### 5.1 修改接口路径

```typescript
// ===== 修改文件：zsk-ui/src/api/front/toolbox.ts =====

/**
 * 获取工具箱详情
 * @param id 工具ID
 * @returns 工具详情数据
 */
export async function getToolboxDetail(id: string): Promise<ToolboxDetail> {
  const { data } = await handleRequest({
    requestFn: () =>
      request.instance
        .get<ApiResponse<ToolboxDetail>>(`/system/toolbox/${id}`)
        .then((r) => r.data),
    mockData: getMockToolboxDetail(id),
    apiName: "getToolboxDetail",
  });
  return data;
}
```

**修改说明：**
- 路径从 `/toolbox/{id}` 改为 `/system/toolbox/{id}`

---

## 六、Nacos配置示例

需要在Nacos配置中心添加以下配置（`zsk-module-system-dev.yml`）：

```yaml
toolbox:
  tools:
    - id: json-formatter
      title: JSON格式化工具
      description: 在线JSON格式化、压缩、校验工具
      logo: /tools/json.png
      tags:
        - JSON
        - 格式化
        - 开发工具
      url: /tools/json-formatter
      images:
        - /images/tools/json-1.png
        - /images/tools/json-2.png
      features:
        - JSON格式化美化
        - JSON压缩
        - JSON校验
        - 语法高亮
      stats:
        views: 10000
        likes: 500
        usage: 8000
      author:
        name: 开发团队
        avatar: /avatar/default.png
      createAt: 2026-01-01
    - id: base64-converter
      title: Base64编解码工具
      description: 在线Base64编码解码转换工具
      logo: /tools/base64.png
      tags:
        - Base64
        - 编码
        - 解码
      url: /tools/base64
      images:
        - /images/tools/base64-1.png
      features:
        - Base64编码
        - Base64解码
        - 支持中文
      stats:
        views: 5000
        likes: 200
        usage: 3000
      author:
        name: 开发团队
        avatar: /avatar/default.png
      createAt: 2026-01-15
```

---

## 七、对接检查清单

### 7.1 后端新增清单

- [x] 新建 `ToolboxProperties.java` 配置属性类
- [x] 新建 `ToolboxController.java` 控制器
- [x] 新建 `ToolboxDetailVo.java` 视图对象

### 7.2 前端修改清单

- [x] 修改 `getToolboxDetail` 接口路径

---

## 八、注意事项

1. **数据来源**：工具数据从Nacos配置中心获取，支持动态刷新
2. **配置路径**：配置前缀为 `toolbox`，需要在 `zsk-module-system-dev.yml` 中添加
3. **工具ID**：前端通过工具ID获取对应的工具详情
4. **相关工具**：目前返回空列表，后续可根据标签匹配实现
5. **扩展性**：可新增工具列表接口 `/toolbox/list` 获取所有工具
