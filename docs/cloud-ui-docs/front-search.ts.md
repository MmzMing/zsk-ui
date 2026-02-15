# front/search.ts（搜索）前后端接口对接文档

> 文档创建时间：2026-02-15  
> 对接策略：后端新建接口

---

## 一、模块总览

| 子模块 | 前端接口数 | 后端状态 | 对接方案 |
|-------|----------|---------|---------|
| 全站搜索 | 1个 | ✅ 已完成 | 无需修改 |

---

## 二、接口映射表

| 前端接口 | HTTP | 前端路径 | 后端路径 | 状态 |
|---------|------|---------|---------|------|
| searchAll | GET | `/content/search/all` | `/content/search/all` | ✅ |

---

## 三、请求参数映射

| 前端参数 | 后端参数 | 类型 | 说明 |
|---------|---------|------|------|
| keyword | keyword | String | 搜索关键字 |
| type | type | String | 类型（all/video/document/tool/user） |
| sort | sort | String | 排序（hot/latest/like/usage/relevance/fans/active） |
| duration | duration | String | 时长筛选 |
| timeRange | timeRange | String | 时间范围 |
| category | category | String | 分类筛选 |
| page | page | Integer | 页码 |
| pageSize | pageSize | Integer | 每页数量 |

---

## 四、字段映射表

### 4.1 SearchResult 字段映射

| 前端字段 | 后端字段 | 类型 | 说明 |
|---------|---------|------|------|
| id | id | String | 资源ID |
| rank | rank | Integer | 排名 |
| type | type | String | 资源类型（video/document/tool/user） |
| title | title | String | 标题 |
| authorId | authorId | String | 作者ID |
| author | author | String | 作者 |
| authorAvatar | authorAvatar | String | 作者头像 |
| description | description | String | 描述 |
| category | category | String | 分类 |
| tags | tags | List | 标签列表 |
| stats | stats | String | 统计信息文本 |
| thumbnail | thumbnail | String | 缩略图URL |
| avatar | avatar | String | 头像URL（用户类型） |
| duration | duration | String | 视频时长 |
| playCount | playCount | Long | 播放量 |
| commentCount | commentCount | Long | 评论数 |
| readCount | readCount | Long | 阅读量 |
| favoriteCount | favoriteCount | Long | 收藏数 |
| usageCount | usageCount | Long | 使用次数 |
| followers | followers | Long | 粉丝数 |
| works | works | Long | 作品数 |

---

## 五、后端新增文件清单

| 文件路径 | 说明 |
|---------|------|
| `SearchController.java` | 搜索控制器 |
| `SearchResultVo.java` | 搜索结果视图对象 |

---

## 六、后端核心代码

### 6.1 搜索控制器

```java
// ===== 文件：SearchController.java =====
@Tag(name = "搜索")
@RestController
@RequestMapping("/content/search")
@RequiredArgsConstructor
public class SearchController {

    private final IDocVideoDetailService videoService;
    private final IDocNoteService noteService;

    @Operation(summary = "全站搜索")
    @GetMapping("/all")
    public R<Map<String, Object>> searchAll(
        @RequestParam(value = "keyword", required = false) String keyword,
        @RequestParam(value = "type", required = false, defaultValue = "all") String type,
        @RequestParam(value = "sort", required = false) String sort,
        @RequestParam(value = "duration", required = false) String duration,
        @RequestParam(value = "timeRange", required = false) String timeRange,
        @RequestParam(value = "category", required = false) String category,
        @RequestParam(value = "page", defaultValue = "1") Integer page,
        @RequestParam(value = "pageSize", defaultValue = "20") Integer pageSize) {
        // 搜索视频和文档、排序、分页
    }
}
```

---

## 七、对接检查清单

### 7.1 后端新增清单

- [x] 新建 `SearchController.java` 控制器
- [x] 新建 `SearchResultVo.java` 视图对象

### 7.2 前端修改清单

- [x] 无需修改（路径已正确）

---

## 八、注意事项

1. **搜索类型**：目前支持 video（视频）和 document（文档）类型搜索
2. **关键字搜索**：支持标题和内容模糊匹配
3. **排序功能**：支持 hot（热度）和 like（点赞）排序
4. **分类筛选**：通过 broadCode 字段进行分类筛选
5. **分页**：支持 page 和 pageSize 参数
6. **扩展性**：后续可扩展 tool（工具）和 user（用户）类型搜索
