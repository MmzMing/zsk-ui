# front/video.ts（前台视频详情）前后端接口对接文档

> 文档创建时间：2026-02-15  
> 对接策略：后端新建接口，前端修改路径

---

## 一、模块总览

| 子模块 | 前端接口数 | 后端状态 | 对接方案 |
|-------|----------|---------|---------|
| 视频详情 | 1个 | ✅ 已完成 | 前端修改路径 |
| 视频点赞 | 1个 | ✅ 已完成 | 前端修改路径 |
| 视频收藏 | 1个 | ✅ 已完成 | 前端修改路径 |
| 视频评论 | 3个 | ✅ 已完成 | 前端修改路径 |

---

## 二、接口映射表

| 前端接口 | HTTP | 前端路径 | 后端路径 | 状态 |
|---------|------|---------|---------|------|
| fetchVideoDetail | GET | `/content/video/detail/{id}` | `/content/video/detail/{id}` | ✅ |
| toggleVideoLike | POST | `/content/video/like/{id}` | `/content/video/like/{id}` | ✅ |
| toggleVideoFavorite | POST | `/content/video/favorite/{id}` | `/content/video/favorite/{id}` | ✅ |
| fetchVideoComments | GET | `/content/video/comments/{id}` | `/content/video/comments/{id}` | ✅ |
| postVideoComment | POST | `/content/video/comment` | `/content/video/comment` | ✅ |
| toggleCommentLike | POST | `/content/video/comment/like/{commentId}` | `/content/video/comment/like/{commentId}` | ✅ |

---

## 三、字段映射表

### 3.1 VideoDetail 字段映射

| 前端字段 | 后端字段 | 类型 | 说明 |
|---------|---------|------|------|
| id | id | String | 视频ID |
| title | videoTitle | String | 视频标题 |
| description | fileContent | String | 视频描述 |
| videoUrl | videoUrl | String | 视频播放地址 |
| coverUrl | coverUrl | String | 封面图URL |
| tags | tags | String[] | 标签列表（逗号分隔） |
| author.id | userId | String | 作者ID |
| author.name | - | String | 作者名称（需关联用户表） |
| author.avatar | - | String | 头像（需关联用户表） |
| author.fans | - | String | 粉丝数（需统计关注表） |
| author.isFollowing | - | Boolean | 是否已关注 |
| stats.views | viewCount | String | 播放量 |
| stats.likes | likeCount | Integer | 点赞数 |
| stats.favorites | collectCount | Integer | 收藏数 |
| stats.date | createTime | String | 发布日期 |
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
| replies | - | List | 子评论列表（parentCommentId关联） |

---

## 四、后端新增文件清单

| 文件路径 | 说明 |
|---------|------|
| `DocVideoContentController.java` | 前台视频详情控制器 |
| `DocVideoDetailVo.java` | 视频详情视图对象 |
| `DocVideoCommentVo.java` | 视频评论视图对象 |

---

## 五、后端核心代码

### 5.1 前台视频详情控制器

```java
// ===== 文件：DocVideoContentController.java =====
@Tag(name = "前台视频详情")
@RestController
@RequestMapping("/content/video")
@RequiredArgsConstructor
public class DocVideoContentController {

    private final IDocVideoDetailService videoService;
    private final IDocVideoCommentService commentService;
    private final IDocUserInteractionService interactionService;

    @Operation(summary = "获取视频详情")
    @GetMapping("/detail/{id}")
    public R<DocVideoDetailVo> getDetail(@PathVariable("id") Long id) {
        // 增加浏览量、检查点赞/收藏/关注状态、获取推荐视频
    }

    @Operation(summary = "切换视频点赞状态")
    @PostMapping("/like/{id}")
    public R<Map<String, Object>> toggleLike(@PathVariable("id") Long id) {
        // 切换点赞状态、更新点赞数
    }

    @Operation(summary = "切换视频收藏状态")
    @PostMapping("/favorite/{id}")
    public R<Map<String, Object>> toggleFavorite(@PathVariable("id") Long id) {
        // 切换收藏状态
    }

    @Operation(summary = "获取视频评论列表")
    @GetMapping("/comments/{id}")
    public R<Map<String, Object>> getComments(@PathVariable("id") String id, ...) {
        // 获取评论列表、检查点赞状态、获取回复
    }

    @Operation(summary = "发表视频评论")
    @PostMapping("/comment")
    public R<DocVideoCommentVo> postComment(@RequestBody Map<String, Object> params) {
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

## 六、前端修改清单

### 6.1 修改评论点赞接口路径

```typescript
// ===== 修改文件：zsk-ui/src/api/front/video.ts =====

/**
 * 切换评论点赞状态
 * @param commentId 评论ID
 */
export async function toggleCommentLike(commentId: string) {
  return handleRequest({
    requestFn: () => request.instance.post<ApiResponse<{ isLiked: boolean; likes: number }>>(`/content/video/comment/like/${commentId}`).then(r => r.data),
    mockData: { isLiked: true, likes: 99 },
    apiName: "toggleCommentLike"
  });
}
```

**修改说明：**
- 路径从 `/content/comment/like/{commentId}` 改为 `/content/video/comment/like/{commentId}`
- 移除了 `params: { type: "video" }` 参数

---

## 七、对接检查清单

### 7.1 后端新增清单

- [x] 新建 `DocVideoContentController.java` 控制器
- [x] 新建 `DocVideoDetailVo.java` 视图对象
- [x] 新建 `DocVideoCommentVo.java` 视图对象

### 7.2 前端修改清单

- [x] 修改 `toggleCommentLike` 接口路径

---

## 八、注意事项

1. **用户交互关系表**：复用 `doc_user_interaction` 表，targetType=2 表示视频
2. **登录状态**：点赞、收藏、评论需要登录，未登录时返回 `isLiked: false`
3. **推荐视频**：根据 `isRecommended = 1` 和 `viewCount` 排序获取
4. **评论回复**：通过 `parentCommentId` 关联父评论
5. **作者信息**：目前使用占位数据，后续需关联用户表获取真实信息
6. **分集信息**：目前返回空列表，后续可根据需求扩展
