# front/home.ts（首页）前后端接口对接文档

> 文档创建时间：2026-02-15  
> 对接策略：后端新建接口

---

## 一、模块总览

| 子模块 | 前端接口数 | 后端状态 | 对接方案 |
|-------|----------|---------|---------|
| 首页视频 | 1个 | ✅ 已完成 | 无需修改 |
| 首页文章 | 1个 | ✅ 已完成 | 无需修改 |
| 首页评论 | 1个 | ⚠️ 待完善 | 后端待完善 |
| 首页幻灯片 | 1个 | ⚠️ 待完善 | 后端待完善 |

---

## 二、接口映射表

| 前端接口 | HTTP | 前端路径 | 后端路径 | 状态 |
|---------|------|---------|---------|------|
| fetchHomeVideos | GET | `/home/videos` | `/home/videos` | ✅ |
| fetchHomeArticles | GET | `/home/articles` | `/home/articles` | ✅ |
| fetchHomeReviews | GET | `/home/reviews` | `/home/reviews` | ⚠️ |
| fetchHomeSlides | GET | `/home/slides` | `/home/slides` | ⚠️ |

---

## 三、字段映射表

### 3.1 HomeVideo 字段映射

| 前端字段 | 后端字段 | 类型 | 说明 |
|---------|---------|------|------|
| id | id | String | 视频ID |
| category | broadCode | String | 视频分类 |
| duration | - | String | 视频时长（暂无） |
| title | videoTitle | String | 视频标题 |
| description | fileContent | String | 视频描述 |
| views | viewCount | String | 播放量 |
| likes | likeCount | Integer | 点赞数 |
| comments | commentCount | Integer | 评论数 |
| date | createTime | String | 发布日期 |
| cover | coverUrl | String | 封面图URL |
| sources | videoUrl | String | 视频源地址 |

### 3.2 HomeArticle 字段映射

| 前端字段 | 后端字段 | 类型 | 说明 |
|---------|---------|------|------|
| id | id | String | 文章ID |
| category | broadCode | String | 文章分类 |
| title | noteName | String | 文章标题 |
| date | createTime | String | 发布日期 |
| summary | - | String | 文章摘要（暂无） |
| views | viewCount | String | 浏览量 |
| author | userId | String | 作者 |
| cover | cover | String | 封面图URL |

---

## 四、后端新增文件清单

| 文件路径 | 说明 |
|---------|------|
| `HomeController.java` | 首页控制器 |
| `HomeVideoVo.java` | 首页视频项视图对象 |
| `HomeArticleVo.java` | 首页文章项视图对象 |
| `HomeReviewVo.java` | 首页评论项视图对象 |
| `HomeSlideVo.java` | 首页幻灯片视图对象 |

---

## 五、后端核心代码

### 5.1 首页控制器

```java
// ===== 文件：HomeController.java =====
@Tag(name = "首页")
@RestController
@RequestMapping("/home")
@RequiredArgsConstructor
public class HomeController {

    private final IDocVideoDetailService videoService;
    private final IDocNoteService noteService;

    @Operation(summary = "获取首页视频列表")
    @GetMapping("/videos")
    public R<List<HomeVideoVo>> getVideos() {
        // 按浏览量倒序获取前10条视频
    }

    @Operation(summary = "获取首页文章列表")
    @GetMapping("/articles")
    public R<List<HomeArticleVo>> getArticles() {
        // 按浏览量倒序获取前10条文章
    }

    @Operation(summary = "获取首页评论列表")
    @GetMapping("/reviews")
    public R<List<HomeReviewVo>> getReviews() {
        // 暂时返回空列表
    }

    @Operation(summary = "获取首页幻灯片列表")
    @GetMapping("/slides")
    public R<List<HomeSlideVo>> getSlides() {
        // 暂时返回空列表
    }
}
```

---

## 六、对接检查清单

### 6.1 后端新增清单

- [x] 新建 `HomeController.java` 控制器
- [x] 新建 `HomeVideoVo.java` 视图对象
- [x] 新建 `HomeArticleVo.java` 视图对象
- [x] 新建 `HomeReviewVo.java` 视图对象
- [x] 新建 `HomeSlideVo.java` 视图对象
- [ ] 完善评论列表接口（可从配置获取）
- [ ] 完善幻灯片列表接口（可从配置获取）

### 6.2 前端修改清单

- [x] 无需修改（路径已正确）

---

## 七、注意事项

1. **视频列表**：按浏览量倒序获取前10条视频
2. **文章列表**：按浏览量倒序获取前10条文章
3. **评论列表**：暂时返回空列表，后续可从Nacos配置获取
4. **幻灯片列表**：暂时返回空列表，后续可从Nacos配置获取
5. **视频时长**：DocVideoDetail 表暂无 duration 字段，返回默认值 "00:00"
6. **文章摘要**：DocNote 表暂无 summary 字段，返回空字符串
