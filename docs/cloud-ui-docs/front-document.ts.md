# front/document.ts（前台文档详情）前后端接口对接文档

> 文档创建时间：2026-02-15  
> 对接策略：后端新建接口，前端修改路径

---

## 一、模块总览

| 子模块 | 前端接口数 | 后端状态 | 对接方案 |
|-------|----------|---------|---------|
| 文档详情 | 1个 | ✅ 已完成 | 前端修改路径 |
| 文档点赞 | 1个 | ✅ 已完成 | 前端修改路径 |
| 文档收藏 | 1个 | ✅ 已完成 | 前端修改路径 |
| 文档评论 | 3个 | ✅ 已完成 | 前端修改路径 |

---

## 二、接口映射表

| 前端接口 | HTTP | 前端路径 | 后端路径 | 状态 |
|---------|------|---------|---------|------|
| fetchDocDetail | GET | `/content/doc/detail/{id}` | `/content/doc/detail/{id}` | ✅ |
| toggleDocLike | POST | `/content/doc/like/{id}` | `/content/doc/like/{id}` | ✅ |
| toggleDocFavorite | POST | `/content/doc/favorite/{id}` | `/content/doc/favorite/{id}` | ✅ |
| fetchDocComments | GET | `/content/doc/comments/{id}` | `/content/doc/comments/{id}` | ✅ |
| postDocComment | POST | `/content/doc/comment` | `/content/doc/comment` | ✅ |
| toggleDocCommentLike | POST | `/content/doc/comment/like/{commentId}` | `/content/doc/comment/like/{commentId}` | ✅ |

---

## 三、字段映射表

### 3.1 DocDetail 字段映射

| 前端字段 | 后端字段 | 类型 | 说明 |
|---------|---------|------|------|
| id | id | String | 文档ID |
| title | noteName | String | 标题 |
| content | content | String | 内容 |
| category | broadCode | String | 分类 |
| date | createTime | String | 日期 |
| coverUrl | cover | String | 封面图地址 |
| author.id | userId | String | 作者ID |
| author.name | - | String | 作者名称（需关联用户表） |
| author.avatar | - | String | 头像（需关联用户表） |
| author.fans | - | String | 粉丝数（需统计关注表） |
| author.isFollowing | - | Boolean | 是否已关注 |
| stats.views | viewCount | String | 阅读数 |
| stats.likes | likeCount | Integer | 点赞数 |
| stats.favorites | - | Integer | 收藏数（需统计交互表） |
| stats.isLiked | - | Boolean | 是否已点赞 |
| stats.isFavorited | - | Boolean | 是否已收藏 |

### 3.2 CommentItem 字段映射

| 前端字段 | 后端字段 | 类型 | 说明 |
|---------|---------|------|------|
| id | id | String | 评论ID |
| content | commentContent | String | 评论内容 |
| author.id | commentUserId | String | 作者ID |
| author.name | - | String | 名称（需关联用户表） |
| author.avatar | - | String | 头像（需关联用户表） |
| createdAt | createTime | String | 创建时间 |
| likes | likeCount | Integer | 点赞数 |
| isLiked | - | Boolean | 是否已点赞 |
| replies | - | List | 回复列表（parentId关联） |

---

## 四、后端新增文件清单

### 4.1 用户交互关系

| 文件路径 | 说明 |
|---------|------|
| `DocUserInteraction.java` | 用户交互关系实体 |
| `DocUserInteractionMapper.java` | Mapper接口 |
| `IDocUserInteractionService.java` | 服务接口 |
| `DocUserInteractionServiceImpl.java` | 服务实现 |

### 4.2 前台文档详情

| 文件路径 | 说明 |
|---------|------|
| `DocContentController.java` | 前台文档详情控制器 |
| `DocNoteDetailVo.java` | 文档详情视图对象 |
| `DocCommentVo.java` | 评论视图对象 |

---

## 五、后端核心代码

### 5.1 用户交互关系实体

```java
// ===== 文件：DocUserInteraction.java =====
@Data
@TableName("doc_user_interaction")
public class DocUserInteraction extends BaseEntity {

    /** 用户ID */
    private Long userId;

    /** 目标类型（1-文档 2-视频 3-用户 4-评论） */
    private Integer targetType;

    /** 目标ID */
    private Long targetId;

    /** 交互类型（1-点赞 2-收藏 3-关注） */
    private Integer interactionType;

    /** 状态（0-取消 1-有效） */
    private Integer status;
}
```

### 5.2 前台文档详情控制器

```java
// ===== 文件：DocContentController.java =====
@Tag(name = "前台文档详情")
@RestController
@RequestMapping("/content/doc")
@RequiredArgsConstructor
public class DocContentController {

    private final IDocNoteService noteService;
    private final IDocNoteCommentService commentService;
    private final IDocUserInteractionService interactionService;

    @Operation(summary = "获取文档详情")
    @GetMapping("/detail/{id}")
    public R<DocNoteDetailVo> getDetail(@PathVariable("id") Long id) {
        // 增加浏览量、检查点赞/收藏/关注状态、获取推荐文档
    }

    @Operation(summary = "切换文档点赞状态")
    @PostMapping("/like/{id}")
    public R<Map<String, Object>> toggleLike(@PathVariable("id") Long id) {
        // 切换点赞状态、更新点赞数
    }

    @Operation(summary = "切换文档收藏状态")
    @PostMapping("/favorite/{id}")
    public R<Map<String, Object>> toggleFavorite(@PathVariable("id") Long id) {
        // 切换收藏状态
    }

    @Operation(summary = "获取文档评论列表")
    @GetMapping("/comments/{id}")
    public R<Map<String, Object>> getComments(@PathVariable("id") Long id, ...) {
        // 获取评论列表、检查点赞状态、获取回复
    }

    @Operation(summary = "发表文档评论")
    @PostMapping("/comment")
    public R<DocCommentVo> postComment(@RequestBody Map<String, Object> params) {
        // 发表评论、更新评论数
    }

    @Operation(summary = "切换评论点赞状态")
    @PostMapping("/comment/like/{commentId}")
    public R<Map<String, Object>> toggleCommentLike(@PathVariable("commentId") Long commentId) {
        // 切换评论点赞状态
    }
}
```

---

## 六、数据库修改

### 6.1 新增用户交互关系表

```sql
CREATE TABLE `doc_user_interaction` (
  `id` BIGINT(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `user_id` BIGINT(20) NOT NULL COMMENT '用户ID',
  `target_type` INT(4) NOT NULL COMMENT '目标类型（1-文档 2-视频 3-用户 4-评论）',
  `target_id` BIGINT(20) NOT NULL COMMENT '目标ID',
  `interaction_type` INT(4) NOT NULL COMMENT '交互类型（1-点赞 2-收藏 3-关注）',
  `status` INT(4) DEFAULT 1 COMMENT '状态（0-取消 1-有效）',
  `create_name` VARCHAR(64) DEFAULT '' COMMENT '创建人',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_name` VARCHAR(64) DEFAULT '' COMMENT '更新人',
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted` INT(4) DEFAULT 0 COMMENT '删除标记',
  PRIMARY KEY (`id`),
  KEY `idx_user_target` (`user_id`, `target_type`, `target_id`, `interaction_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户交互关系表';
```

---

## 七、前端修改清单

### 7.1 修改评论点赞接口路径

```typescript
// ===== 修改文件：zsk-ui/src/api/front/document.ts =====

/**
 * 切换文档评论点赞状态
 * @param commentId 评论ID
 */
export async function toggleDocCommentLike(commentId: string) {
  const { data } = await handleRequest({
    requestFn: () =>
      request.instance
        .post<ApiResponse<{ isLiked: boolean; likes: number }>>(
          `/content/doc/comment/like/${commentId}`
        )
        .then((r) => r.data),
    mockData: { isLiked: true, likes: 10 },
    apiName: "toggleDocCommentLike",
  });
  return data;
}
```

**修改说明：**
- 路径从 `/content/comment/like/{commentId}` 改为 `/content/doc/comment/like/{commentId}`
- 移除了 `params: { type: "doc" }` 参数

---

## 八、对接检查清单

### 8.1 后端新增清单

- [x] 新建 `DocUserInteraction.java` 实体类
- [x] 新建 `DocUserInteractionMapper.java` Mapper接口
- [x] 新建 `IDocUserInteractionService.java` 服务接口
- [x] 新建 `DocUserInteractionServiceImpl.java` 服务实现
- [x] 新建 `DocContentController.java` 控制器
- [x] 新建 `DocNoteDetailVo.java` 视图对象
- [x] 新建 `DocCommentVo.java` 视图对象
- [ ] 数据库新增 `doc_user_interaction` 表

### 8.2 前端修改清单

- [x] 修改 `toggleDocCommentLike` 接口路径

---

## 九、注意事项

1. **用户交互关系表**：统一管理点赞、收藏、关注关系，支持文档、视频、用户、评论四种目标类型
2. **登录状态**：点赞、收藏、评论需要登录，未登录时返回 `isLiked: false`
3. **推荐文档**：根据 `isRecommended = 1` 和 `viewCount` 排序获取
4. **评论回复**：通过 `parentCommentId` 关联父评论
5. **作者信息**：目前使用占位数据，后续需关联用户表获取真实信息
