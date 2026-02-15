# front/user.ts（前台用户）前后端接口对接文档

> 文档创建时间：2026-02-15  
> 对接策略：后端新建接口

---

## 一、模块总览

| 子模块 | 前端接口数 | 后端状态 | 对接方案 |
|-------|----------|---------|---------|
| 用户资料 | 2个 | ✅ 已完成 | 无需修改 |
| 用户关注 | 1个 | ✅ 已完成 | 无需修改 |
| 用户作品 | 1个 | ⚠️ 部分完成 | 后端待完善 |
| 用户收藏 | 1个 | ⚠️ 部分完成 | 后端待完善 |

---

## 二、接口映射表

| 前端接口 | HTTP | 前端路径 | 后端路径 | 状态 |
|---------|------|---------|---------|------|
| fetchUserProfile | GET | `/user/profile/{id}` | `/user/profile/{id}` | ✅ |
| updateUserProfile | POST | `/user/profile/update` | `/user/profile/update` | ✅ |
| toggleFollowUser | POST | `/user/follow/{id}` | `/user/follow/{id}` | ✅ |
| fetchUserWorks | GET | `/user/works/{id}` | `/user/works/{id}` | ⚠️ |
| fetchUserFavorites | GET | `/user/favorites/{id}` | `/user/favorites/{id}` | ⚠️ |

---

## 三、字段映射表

### 3.1 UserProfile 字段映射

| 前端字段 | 后端字段 | 类型 | 说明 |
|---------|---------|------|------|
| id | id | String | 用户ID |
| username | userName | String | 用户名 |
| name | nickName | String | 昵称 |
| avatar | avatar | String | 头像URL |
| banner | - | String | 背景图URL（需新增） |
| level | - | Integer | 等级（需新增） |
| tags | - | String[] | 标签（需新增） |
| bio | remark | String | 个人简介 |
| location | - | String | 所在地（需新增） |
| website | - | String | 个人网站（需新增） |
| stats.followers | - | Integer | 粉丝数（需统计交互表） |
| stats.following | - | Integer | 关注数（需统计交互表） |
| stats.works | - | Integer | 作品数（需统计文档/视频表） |
| stats.likes | - | Integer | 点赞数（需统计交互表） |
| isFollowing | - | Boolean | 是否已关注 |

---

## 四、后端新增文件清单

| 文件路径 | 说明 |
|---------|------|
| `SysUserFrontController.java` | 前台用户控制器 |
| `SysUserProfileVo.java` | 用户资料视图对象 |
| `SysUserWorkVo.java` | 用户作品视图对象 |

---

## 五、后端核心代码

### 5.1 前台用户控制器

```java
// ===== 文件：SysUserFrontController.java =====
@Tag(name = "前台用户")
@RestController
@RequestMapping("/user")
@RequiredArgsConstructor
public class SysUserFrontController {

    private final ISysUserService userService;

    @Operation(summary = "获取用户资料详情")
    @GetMapping("/profile/{id}")
    public R<SysUserProfileVo> getProfile(@PathVariable("id") Long id) {
        // 获取用户信息、统计数据、检查关注状态
    }

    @Operation(summary = "更新用户资料")
    @PostMapping("/profile/update")
    public R<SysUserProfileVo> updateProfile(@RequestBody Map<String, Object> data) {
        // 更新用户资料
    }

    @Operation(summary = "切换用户关注状态")
    @PostMapping("/follow/{id}")
    public R<Map<String, Object>> toggleFollow(@PathVariable("id") Long id) {
        // 切换关注状态
    }

    @Operation(summary = "获取用户作品列表")
    @GetMapping("/works/{id}")
    public R<Map<String, Object>> getWorks(@PathVariable("id") Long id, ...) {
        // 获取用户作品列表
    }

    @Operation(summary = "获取用户收藏列表")
    @GetMapping("/favorites/{id}")
    public R<Map<String, Object>> getFavorites(@PathVariable("id") Long id, ...) {
        // 获取用户收藏列表
    }
}
```

---

## 六、对接检查清单

### 6.1 后端新增清单

- [x] 新建 `SysUserFrontController.java` 控制器
- [x] 新建 `SysUserProfileVo.java` 视图对象
- [x] 新建 `SysUserWorkVo.java` 视图对象
- [ ] 完善用户作品列表接口（需调用document服务）
- [ ] 完善用户收藏列表接口（需调用document服务）
- [ ] 完善关注功能（需调用交互服务）

### 6.2 前端修改清单

- [x] 无需修改（路径已正确）

---

## 七、注意事项

1. **用户资料**：目前使用 SysUser 表已有字段，部分字段（banner、level、tags等）需后续扩展
2. **统计数据**：粉丝数、关注数、作品数、点赞数需要统计交互表和文档表
3. **关注功能**：复用 `doc_user_interaction` 表，targetType=3 表示用户
4. **作品列表**：需要调用 document 服务获取用户的文档和视频
5. **收藏列表**：需要调用 document 服务获取用户收藏的内容
