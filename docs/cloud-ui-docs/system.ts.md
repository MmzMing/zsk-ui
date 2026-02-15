# system.ts（系统配置）前后端接口对接文档

> 文档创建时间：2026-02-15  
> 对接策略：混合方案（前端修改路径适配后端，后端补充缺失接口）

---

## 一、模块总览

| 子模块 | 前端接口数 | 后端状态 | 对接方案 |
|-------|----------|---------|---------|
| 字典管理 | 5个 | ✅ 已有 | 前端修改路径和字段映射 |
| 参数管理 | 4个 | ✅ 已有 | 前端修改路径和字段映射 |
| 令牌管理 | 6个 | ❌ 缺失 | 后端新建接口 |
| 权限管理 | 1个 | ❌ 缺失 | 后端新建接口 |
| 机器人配置 | 2个 | ❌ 缺失 | 暂不处理 |

---

## 二、字典管理

### 2.1 接口映射表

| 前端接口 | HTTP | 后端接口 | 对接方案 |
|---------|------|---------|---------|
| `/admin/system/dict/list` | GET | `/system/dict/data/list` + `/system/dict/type/list` | 前端合并两个接口数据 |
| `/admin/system/dict/save` | POST | `/system/dict/data` (新增) / `/system/dict/data` PUT (修改) | 前端根据id区分 |
| `/admin/system/dict/toggleStatus` | POST | ❌ 缺失 | 后端新增 |
| `/admin/system/dict/batchToggleStatus` | POST | ❌ 缺失 | 后端新增 |
| `/admin/system/dict/batchDelete` | POST | `/system/dict/data/{ids}` DELETE | 前端改用DELETE方法 |

### 2.2 字段映射表

#### 字典数据（sys_dict_data）

| 前端字段 | 后端字段 | 类型 | 说明 |
|---------|---------|------|------|
| id | id | Long | 主键（雪花算法） |
| code | dictType | String | **需映射**：前端code → 后端dictType |
| name | dictLabel | String | **需映射**：前端name → 后端dictLabel |
| category | - | String | 后端缺失，暂不使用 |
| description | remark | String | **需映射**：前端description → 后端remark |
| itemCount | - | Integer | 前端计算，不传后端 |
| status | status | String | 状态（0正常 1停用） |
| updatedAt | updateTime | DateTime | **需映射**：前端updatedAt → 后端updateTime |

#### 字典类型（sys_dict_type）

| 前端字段 | 后端字段 | 类型 | 说明 |
|---------|---------|------|------|
| id | id | Long | 主键（雪花算法） |
| code | dictType | String | **需映射** |
| name | dictName | String | **需映射**：前端name → 后端dictName |
| status | status | String | 状态 |

### 2.3 前端修改清单

```typescript
// ===== 修改文件：zsk-ui/src/api/admin/system.ts =====

/**
 * 获取字典列表
 * @param params 查询参数
 * @param setLoading 加载状态回调
 * @returns 字典列表响应
 */
export async function fetchDictList(
  params: DictListParams,
  setLoading?: (loading: boolean) => void
): Promise<ApiResponse<DictListResponse>> {
  /** 字典数据响应 */
  const [dataRes, typeRes] = await Promise.all([
    handleRequest({
      requestFn: () =>
        request.instance
          .get<ApiResponse<SysDictData[]>>("/system/dict/data/list", { params })
          .then((r) => r.data),
      mockData: [],
      apiName: "fetchDictDataList",
      setLoading,
    }),
    handleRequest({
      requestFn: () =>
        request.instance
          .get<ApiResponse<SysDictType[]>>("/system/dict/type/list")
          .then((r) => r.data),
      mockData: [],
      apiName: "fetchDictTypeList",
    }),
  ]);
  
  /** 合并数据并映射字段 */
  const mergedList = mergeDictData(dataRes.data || [], typeRes.data || []);
  return { code: 200, msg: "ok", data: { list: mergedList, total: mergedList.length } };
}

/**
 * 字典数据后端转前端字段映射
 * @param backendData 后端字典数据
 * @returns 前端字典数据
 */
function mapDictDataToFrontend(backendData: SysDictData): DictItem {
  return {
    id: String(backendData.id),
    code: backendData.dictType,
    name: backendData.dictLabel,
    description: backendData.remark || "",
    status: backendData.status === "0" ? "enabled" : "disabled",
    updatedAt: backendData.updateTime || "",
    category: "",
    itemCount: 0,
  };
}

/**
 * 字典数据前端转后端字段映射
 * @param frontendData 前端字典数据
 * @returns 后端字典数据
 */
function mapDictDataToBackend(frontendData: Partial<DictItem>): Partial<SysDictData> {
  return {
    id: frontendData.id ? Number(frontendData.id) : undefined,
    dictType: frontendData.code,
    dictLabel: frontendData.name,
    remark: frontendData.description,
    status: frontendData.status === "enabled" ? "0" : "1",
  };
}
```

### 2.4 后端新增接口清单

#### 2.4.1 字典状态切换接口

```java
// ===== 文件：SysDictDataController.java =====
package com.zsk.system.controller;

/**
 * 字典数据 控制器
 *
 * @author wuhuaming
 * @date 2026-02-15
 * @version 1.0
 */
@Tag(name = "字典数据")
@RestController
@RequestMapping("/dict/data")
@RequiredArgsConstructor
public class SysDictDataController {

    private final ISysDictDataService dictDataService;

    /**
     * 切换字典状态
     *
     * @param id 字典ID
     * @param status 状态（0正常 1停用）
     * @return 是否成功
     */
    @Operation(summary = "切换字典状态")
    @PutMapping("/toggleStatus")
    public R<Void> toggleStatus(@RequestParam Long id, @RequestParam String status) {
        return dictDataService.toggleStatus(id, status) ? R.ok() : R.fail();
    }

    /**
     * 批量切换字典状态
     *
     * @param ids 字典ID列表
     * @param status 状态（0正常 1停用）
     * @return 是否成功
     */
    @Operation(summary = "批量切换字典状态")
    @PutMapping("/batchToggleStatus")
    public R<Void> batchToggleStatus(@RequestBody List<Long> ids, @RequestParam String status) {
        return dictDataService.batchToggleStatus(ids, status) ? R.ok() : R.fail();
    }
}
```

---

## 三、参数管理

### 3.1 接口映射表

| 前端接口 | HTTP | 后端接口 | 对接方案 |
|---------|------|---------|---------|
| `/admin/system/param/list` | GET | `/system/config/list` | 前端修改路径 |
| `/admin/system/param/save` | POST | `/system/config` POST (新增) / `/system/config` PUT (修改) | 前端根据id区分 |
| `/admin/system/param/delete` | POST | `/system/config/{id}` DELETE | 前端改用DELETE方法 |
| `/admin/system/param/batchDelete` | POST | `/system/config/{ids}` DELETE | 前端改用DELETE方法 |

### 3.2 字段映射表

| 前端字段 | 后端字段 | 类型 | 说明 |
|---------|---------|------|------|
| id | id | Long | 主键（雪花算法） |
| key | configKey | String | **需映射**：前端key → 后端configKey |
| name | configName | String | **需映射**：前端name → 后端configName |
| value | configValue | String | **需映射**：前端value → 后端configValue |
| scope | - | String | 后端缺失，暂不使用 |
| description | remark | String | **需映射** |
| sensitive | - | Boolean | 后端缺失，暂不使用 |
| updatedAt | updateTime | DateTime | **需映射** |

### 3.3 前端修改清单

```typescript
// ===== 修改文件：zsk-ui/src/api/admin/system.ts =====

/**
 * 获取参数列表
 * @param setLoading 加载状态回调
 * @returns 参数列表响应
 */
export async function fetchParamList(
  setLoading?: (loading: boolean) => void
): Promise<ApiResponse<ParamItem[]>> {
  const { data } = await handleRequest({
    requestFn: () =>
      request.instance
        .get<ApiResponse<SysConfig[]>>("/system/config/list")
        .then((r) => r.data),
    mockData: [],
    apiName: "fetchParamList",
    setLoading,
  });
  
  /** 映射字段 */
  return { 
    code: 200, 
    msg: "ok", 
    data: (data || []).map(mapConfigToFrontend) 
  };
}

/**
 * 保存参数（新增或修改）
 * @param data 参数数据
 * @param setLoading 加载状态回调
 * @returns 是否保存成功
 */
export async function saveParam(
  data: Partial<ParamItem>,
  setLoading?: (loading: boolean) => void
): Promise<ApiResponse<boolean>> {
  /** 后端参数数据 */
  const backendData = mapConfigToBackend(data);
  
  /** 根据是否有id区分新增和修改 */
  const requestFn = data.id
    ? () => request.instance.put<ApiResponse<boolean>>("/system/config", backendData).then((r) => r.data)
    : () => request.instance.post<ApiResponse<boolean>>("/system/config", backendData).then((r) => r.data);
  
  return handleRequest({
    requestFn,
    mockData: true,
    apiName: "saveParam",
    setLoading,
  });
}

/**
 * 参数配置后端转前端字段映射
 * @param backendData 后端参数数据
 * @returns 前端参数数据
 */
function mapConfigToFrontend(backendData: SysConfig): ParamItem {
  return {
    id: String(backendData.id),
    key: backendData.configKey,
    name: backendData.configName,
    value: backendData.configValue,
    description: backendData.remark || "",
    scope: "global",
    sensitive: false,
    updatedAt: backendData.updateTime || "",
  };
}

/**
 * 参数配置前端转后端字段映射
 * @param frontendData 前端参数数据
 * @returns 后端参数数据
 */
function mapConfigToBackend(frontendData: Partial<ParamItem>): Partial<SysConfig> {
  return {
    id: frontendData.id ? Number(frontendData.id) : undefined,
    configKey: frontendData.key,
    configName: frontendData.name,
    configValue: frontendData.value,
    remark: frontendData.description,
  };
}
```

---

## 四、令牌管理（后端需新增）

### 4.1 数据库表设计

```sql
-- ===== 令牌管理表 =====
-- 注意：id使用雪花算法生成，不使用自增
CREATE TABLE `sys_token` (
  `id` BIGINT(20) NOT NULL COMMENT '主键ID（雪花算法）',
  `token_name` VARCHAR(100) NOT NULL COMMENT '令牌名称',
  `token_value` VARCHAR(500) NOT NULL COMMENT '令牌值',
  `token_type` VARCHAR(20) NOT NULL DEFAULT 'api' COMMENT '令牌类型（api-接口令牌 personal-个人令牌 internal-内部令牌）',
  `bound_user_id` BIGINT(20) DEFAULT NULL COMMENT '绑定用户ID',
  `bound_user_name` VARCHAR(50) DEFAULT NULL COMMENT '绑定用户名',
  `expire_time` DATETIME DEFAULT NULL COMMENT '过期时间',
  `last_used_time` DATETIME DEFAULT NULL COMMENT '最后使用时间',
  `status` VARCHAR(20) NOT NULL DEFAULT 'active' COMMENT '状态（active-有效 expired-已过期 revoked-已吊销）',
  `remark` VARCHAR(500) DEFAULT NULL COMMENT '备注',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `create_name` VARCHAR(50) DEFAULT NULL COMMENT '创建人',
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `update_name` VARCHAR(50) DEFAULT NULL COMMENT '更新人',
  `deleted` TINYINT(1) DEFAULT 0 COMMENT '删除标记（0-未删除 1-已删除）',
  PRIMARY KEY (`id`),
  INDEX `idx_token_value` (`token_value`(100)),
  INDEX `idx_bound_user` (`bound_user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='系统令牌表';
```

### 4.2 后端实体类

```java
// ===== 文件：SysToken.java =====
package com.zsk.system.domain;

/**
 * 系统令牌实体类
 *
 * @author wuhuaming
 * @date 2026-02-15
 * @version 1.0
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("sys_token")
@Schema(description = "系统令牌对象")
public class SysToken extends BaseEntity {

    @Serial
    private static final long serialVersionUID = 1L;

    /** 令牌名称 */
    @Schema(description = "令牌名称")
    private String tokenName;

    /** 令牌值 */
    @Schema(description = "令牌值")
    private String tokenValue;

    /** 令牌类型（api-接口令牌 personal-个人令牌 internal-内部令牌） */
    @Schema(description = "令牌类型（api-接口令牌 personal-个人令牌 internal-内部令牌）")
    private String tokenType;

    /** 绑定用户ID */
    @Schema(description = "绑定用户ID")
    private Long boundUserId;

    /** 绑定用户名 */
    @Schema(description = "绑定用户名")
    private String boundUserName;

    /** 过期时间 */
    @Schema(description = "过期时间")
    private LocalDateTime expireTime;

    /** 最后使用时间 */
    @Schema(description = "最后使用时间")
    private LocalDateTime lastUsedTime;

    /** 状态（active-有效 expired-已过期 revoked-已吊销） */
    @Schema(description = "状态（active-有效 expired-已过期 revoked-已吊销）")
    private String status;
}
```

### 4.3 后端服务接口

```java
// ===== 文件：ISysTokenService.java =====
package com.zsk.system.service;

/**
 * 系统令牌 服务接口
 *
 * @author wuhuaming
 * @date 2026-02-15
 * @version 1.0
 */
public interface ISysTokenService extends IService<SysToken> {

    /**
     * 创建令牌
     *
     * @param token 令牌信息
     * @return 生成的令牌值
     */
    String createToken(SysToken token);

    /**
     * 吊销令牌
     *
     * @param id 令牌ID
     * @return 是否成功
     */
    boolean revokeToken(Long id);

    /**
     * 批量吊销令牌
     *
     * @param ids 令牌ID列表
     * @return 是否成功
     */
    boolean batchRevokeToken(List<Long> ids);
}
```

### 4.4 后端控制器

```java
// ===== 文件：SysTokenController.java =====
package com.zsk.system.controller;

/**
 * 令牌管理 控制器
 *
 * @author wuhuaming
 * @date 2026-02-15
 * @version 1.0
 */
@Tag(name = "令牌管理")
@RestController
@RequestMapping("/token")
@RequiredArgsConstructor
public class SysTokenController {

    private final ISysTokenService tokenService;

    /**
     * 查询令牌列表
     *
     * @return 令牌列表
     */
    @Operation(summary = "查询令牌列表")
    @GetMapping("/list")
    public R<List<SysToken>> list() {
        return R.ok(tokenService.list());
    }

    /**
     * 获取令牌详细信息
     *
     * @param id 令牌ID
     * @return 令牌详情
     */
    @Operation(summary = "获取令牌详细信息")
    @GetMapping("/{id}")
    public R<SysToken> getInfo(@PathVariable Long id) {
        return R.ok(tokenService.getById(id));
    }

    /**
     * 新增令牌
     *
     * @param token 令牌信息
     * @return 生成的令牌值
     */
    @Operation(summary = "新增令牌")
    @PostMapping
    public R<String> add(@RequestBody SysToken token) {
        String tokenValue = tokenService.createToken(token);
        return R.ok(tokenValue);
    }

    /**
     * 修改令牌
     *
     * @param token 令牌信息
     * @return 是否成功
     */
    @Operation(summary = "修改令牌")
    @PutMapping
    public R<Void> edit(@RequestBody SysToken token) {
        return tokenService.updateById(token) ? R.ok() : R.fail();
    }

    /**
     * 吊销令牌
     *
     * @param id 令牌ID
     * @return 是否成功
     */
    @Operation(summary = "吊销令牌")
    @PutMapping("/revoke/{id}")
    public R<Void> revoke(@PathVariable Long id) {
        return tokenService.revokeToken(id) ? R.ok() : R.fail();
    }

    /**
     * 批量吊销令牌
     *
     * @param ids 令牌ID列表
     * @return 是否成功
     */
    @Operation(summary = "批量吊销令牌")
    @PutMapping("/revokeBatch")
    public R<Void> revokeBatch(@RequestBody List<Long> ids) {
        return tokenService.batchRevokeToken(ids) ? R.ok() : R.fail();
    }

    /**
     * 删除令牌
     *
     * @param ids 令牌ID列表
     * @return 是否成功
     */
    @Operation(summary = "删除令牌")
    @DeleteMapping("/{ids}")
    public R<Void> remove(@PathVariable List<Long> ids) {
        return tokenService.removeByIds(ids) ? R.ok() : R.fail();
    }
}
```

### 4.5 前端接口修改

```typescript
// ===== 修改文件：zsk-ui/src/api/admin/system.ts =====

/**
 * 获取令牌列表
 * @param setLoading 加载状态回调
 * @returns 令牌列表响应
 */
export async function fetchTokenList(
  setLoading?: (loading: boolean) => void
): Promise<ApiResponse<TokenItem[]>> {
  const { data } = await handleRequest({
    requestFn: () =>
      request.instance
        .get<ApiResponse<SysToken[]>>("/system/token/list")
        .then((r) => r.data),
    mockData: [],
    apiName: "fetchTokenList",
    setLoading,
  });
  
  return { 
    code: 200, 
    msg: "ok", 
    data: (data || []).map(mapTokenToFrontend) 
  };
}

/**
 * 保存令牌（新增或修改）
 * @param data 令牌数据
 * @param setLoading 加载状态回调
 * @returns 是否保存成功
 */
export async function saveToken(
  data: Partial<TokenItem>,
  setLoading?: (loading: boolean) => void
): Promise<ApiResponse<boolean>> {
  /** 后端令牌数据 */
  const backendData = mapTokenToBackend(data);
  
  /** 根据是否有id区分新增和修改 */
  const requestFn = data.id
    ? () => request.instance.put<ApiResponse<boolean>>("/system/token", backendData).then((r) => r.data)
    : () => request.instance.post<ApiResponse<boolean>>("/system/token", backendData).then((r) => r.data);
  
  return handleRequest({
    requestFn,
    mockData: true,
    apiName: "saveToken",
    setLoading,
  });
}

/**
 * 吊销令牌
 * @param id 令牌ID
 * @param setLoading 加载状态回调
 * @returns 是否吊销成功
 */
export async function revokeToken(
  id: string,
  setLoading?: (loading: boolean) => void
): Promise<ApiResponse<boolean>> {
  return handleRequest({
    requestFn: () =>
      request.instance
        .put<ApiResponse<boolean>>(`/system/token/revoke/${id}`)
        .then((r) => r.data),
    mockData: true,
    apiName: "revokeToken",
    setLoading,
  });
}

/**
 * 批量吊销令牌
 * @param ids 令牌ID列表
 * @param setLoading 加载状态回调
 * @returns 是否吊销成功
 */
export async function batchRevokeTokens(
  ids: string[],
  setLoading?: (loading: boolean) => void
): Promise<ApiResponse<boolean>> {
  return handleRequest({
    requestFn: () =>
      request.instance
        .put<ApiResponse<boolean>>("/system/token/revokeBatch", ids.map(Number))
        .then((r) => r.data),
    mockData: true,
    apiName: "batchRevokeTokens",
    setLoading,
  });
}

/**
 * 令牌后端转前端字段映射
 * @param backendData 后端令牌数据
 * @returns 前端令牌数据
 */
function mapTokenToFrontend(backendData: SysToken): TokenItem {
  return {
    id: String(backendData.id),
    name: backendData.tokenName || "",
    token: backendData.tokenValue || "",
    type: (backendData.tokenType || "api") as "api" | "personal" | "internal",
    boundUser: backendData.boundUserName || "",
    createdAt: backendData.createTime || "",
    expiredAt: backendData.expireTime || "",
    lastUsedAt: backendData.lastUsedTime || null,
    status: (backendData.status || "active") as "active" | "expired" | "revoked",
    remark: backendData.remark || "",
  };
}

/**
 * 令牌前端转后端字段映射
 * @param frontendData 前端令牌数据
 * @returns 后端令牌数据
 */
function mapTokenToBackend(frontendData: Partial<TokenItem>): Partial<SysToken> {
  return {
    id: frontendData.id ? Number(frontendData.id) : undefined,
    tokenName: frontendData.name,
    tokenValue: frontendData.token,
    tokenType: frontendData.type,
    boundUserName: frontendData.boundUser,
    expireTime: frontendData.expiredAt,
    status: frontendData.status,
    remark: frontendData.remark,
  };
}
```

---

## 五、权限管理（后端需新增）

### 5.1 后端控制器

```java
// ===== 文件：SysPermissionController.java =====
package com.zsk.system.controller;

/**
 * 权限管理 控制器
 *
 * @author wuhuaming
 * @date 2026-02-15
 * @version 1.0
 */
@Tag(name = "权限管理")
@RestController
@RequestMapping("/permission")
@RequiredArgsConstructor
public class SysPermissionController {

    private final ISysMenuService menuService;

    /**
     * 获取权限列表（按模块分组）
     *
     * @return 权限分组列表
     */
    @Operation(summary = "获取权限列表")
    @GetMapping("/list")
    public R<List<PermissionGroup>> list() {
        return R.ok(menuService.selectPermissionGroups());
    }
}
```

### 5.2 前端接口修改

```typescript
// ===== 修改文件：zsk-ui/src/api/admin/system.ts =====

/**
 * 获取权限列表
 * @param setLoading 加载状态回调
 * @returns 权限分组列表响应
 */
export async function fetchPermissionList(
  setLoading?: (loading: boolean) => void
): Promise<ApiResponse<PermissionGroup[]>> {
  return handleRequest({
    requestFn: () =>
      request.instance
        .get<ApiResponse<PermissionGroup[]>>("/system/permission/list")
        .then((r) => r.data),
    mockData: [],
    apiName: "fetchPermissionList",
    setLoading,
  });
}
```

---

## 六、类型定义

### 6.1 后端类型定义（前端需要新增）

```typescript
// ===== 文件：zsk-ui/src/api/admin/system.ts =====

/** 后端字典数据类型 */
export type SysDictData = {
  /** 主键ID（雪花算法） */
  id?: number;
  /** 字典排序 */
  dictSort?: number;
  /** 字典标签 */
  dictLabel?: string;
  /** 字典键值 */
  dictValue?: string;
  /** 字典类型 */
  dictType?: string;
  /** 样式属性 */
  cssClass?: string;
  /** 表格回显样式 */
  listClass?: string;
  /** 是否默认（Y是 N否） */
  isDefault?: string;
  /** 状态（0正常 1停用） */
  status?: string;
  /** 备注 */
  remark?: string;
  /** 创建时间 */
  createTime?: string;
  /** 更新时间 */
  updateTime?: string;
};

/** 后端字典类型 */
export type SysDictType = {
  /** 主键ID（雪花算法） */
  id?: number;
  /** 字典名称 */
  dictName?: string;
  /** 字典类型 */
  dictType?: string;
  /** 状态（0正常 1停用） */
  status?: string;
  /** 备注 */
  remark?: string;
  /** 创建时间 */
  createTime?: string;
  /** 更新时间 */
  updateTime?: string;
};

/** 后端参数配置类型 */
export type SysConfig = {
  /** 主键ID（雪花算法） */
  id?: number;
  /** 参数名称 */
  configName?: string;
  /** 参数键名 */
  configKey?: string;
  /** 参数键值 */
  configValue?: string;
  /** 系统内置（Y是 N否） */
  configType?: string;
  /** 备注 */
  remark?: string;
  /** 创建时间 */
  createTime?: string;
  /** 更新时间 */
  updateTime?: string;
};

/** 后端令牌类型 */
export type SysToken = {
  /** 主键ID（雪花算法） */
  id?: number;
  /** 令牌名称 */
  tokenName?: string;
  /** 令牌值 */
  tokenValue?: string;
  /** 令牌类型 */
  tokenType?: string;
  /** 绑定用户ID */
  boundUserId?: number;
  /** 绑定用户名 */
  boundUserName?: string;
  /** 过期时间 */
  expireTime?: string;
  /** 最后使用时间 */
  lastUsedTime?: string;
  /** 状态 */
  status?: string;
  /** 备注 */
  remark?: string;
  /** 创建时间 */
  createTime?: string;
  /** 更新时间 */
  updateTime?: string;
};
```

---

## 七、对接检查清单

### 7.1 前端修改清单

- [ ] 修改 `fetchDictList` 接口路径和字段映射
- [ ] 修改 `saveDict` 接口路径和字段映射
- [ ] 修改 `batchDeleteDicts` 接口改用DELETE方法
- [ ] 修改 `fetchParamList` 接口路径和字段映射
- [ ] 修改 `saveParam` 接口路径和字段映射
- [ ] 修改 `deleteParam` 接口改用DELETE方法
- [ ] 修改 `batchDeleteParams` 接口改用DELETE方法
- [ ] 修改 `fetchTokenList` 接口路径和字段映射
- [ ] 修改 `saveToken` 接口路径和字段映射
- [ ] 修改 `revokeToken` 接口路径和字段映射
- [ ] 修改 `batchRevokeTokens` 接口路径和字段映射
- [ ] 修改 `deleteToken` 接口改用DELETE方法
- [ ] 修改 `fetchPermissionList` 接口路径

### 7.2 后端新增清单

- [ ] 新增字典状态切换接口 `PUT /dict/data/toggleStatus`
- [ ] 新增字典批量状态切换接口 `PUT /dict/data/batchToggleStatus`
- [ ] 新建 sys_token 数据库表（id使用雪花算法）
- [ ] 新建 SysToken 实体类
- [ ] 新建 ISysTokenService 服务接口
- [ ] 新建 SysTokenServiceImpl 服务实现
- [ ] 新建 SysTokenMapper 数据层
- [ ] 新建 SysTokenController 控制器
- [ ] 新建权限列表接口 `GET /permission/list`

---

## 八、注意事项

1. **接口命名规范**：后端接口地址使用驼峰命名，不使用中划线（如 `toggleStatus` 而非 `toggle-status`）
2. **主键生成策略**：数据库id使用雪花算法生成，不使用自增id
3. **字段映射**：前端字段名和后端字段名不同，需要在请求前和响应后进行映射转换
4. **HTTP方法**：部分删除接口前端用POST，后端用DELETE，需要统一
5. **状态值**：后端状态用 "0"/"1"，前端用 "enabled"/"disabled"，需要转换
6. **分页参数**：后端使用 PageQuery，前端使用 page/pageSize，字段名需统一
7. **时间格式**：后端使用 LocalDateTime，前端使用 ISO 字符串，格式需统一
8. **注释规范**：前后端代码都需要添加中文注释
