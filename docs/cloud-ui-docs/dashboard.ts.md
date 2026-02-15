# dashboard.ts（仪表盘）前后端接口对接文档

> 文档创建时间：2026-02-15  
> 对接策略：后端新建接口，前端修改路径

---

## 一、模块总览

| 子模块 | 前端接口数 | 后端状态 | 对接方案 |
|-------|----------|---------|---------|
| 概览数据 | 1个 | ✅ 已完成 | 前端修改路径 |
| 流量统计 | 1个 | ❌ 缺失 | 后端新建 |
| 趋势数据 | 1个 | ❌ 缺失 | 后端新建 |
| 管理日志 | 1个 | ❌ 缺失 | 后端新建 |
| 分析指标 | 1个 | ❌ 缺失 | 后端新建 |
| 时间分布 | 1个 | ❌ 缺失 | 后端新建 |

---

## 二、概览数据（fetchDashboardOverview）

### 2.1 接口映射表

| 前端接口 | HTTP | 后端接口 | 对接方案 |
|---------|------|---------|---------|
| `/admin/dashboard/overview` | GET | `/system/dashboard/overview` | 前端修改路径 |

### 2.2 字段映射表

| 前端字段 | 后端字段 | 类型 | 说明 |
|---------|---------|------|------|
| key | key | String | 唯一标识（users/docs/videos/views） |
| label | label | String | 显示标签 |
| value | value | String | 当前数值 |
| delta | delta | String | 变化量（如：+12.5%） |
| description | description | String | 描述说明 |
| icon | - | React.Component | 前端自行处理，后端不返回 |

### 2.3 数据来源

| 统计项 | 数据来源表 | 模块 | 统计逻辑 |
|-------|----------|------|---------|
| 用户数 | `sys_user` | system | `COUNT(*) WHERE deleted=0` |
| 文档数 | `document_note` | document | `COUNT(*) WHERE deleted=0 AND status=1` |
| 视频数 | `document_video_detail` | document | `COUNT(*) WHERE deleted=0 AND status=1` |
| 访问量 | `document_note.view_count` + `document_video_detail.view_count` | document | `SUM(view_count)` |

### 2.4 前端修改清单

```typescript
// ===== 修改文件：zsk-ui/src/api/admin/dashboard.ts =====

/**
 * 获取仪表盘概览卡片数据
 * @returns {Promise<DashboardOverviewItem[]>} 概览数据列表
 */
export async function fetchDashboardOverview(): Promise<DashboardOverviewItem[]> {
  const { data } = await handleRequest({
    requestFn: () =>
      request.instance
        .get<ApiResponse<DashboardOverviewItem[]>>("/system/dashboard/overview")
        .then((r) => r.data),
    mockData: mockOverviewCards as DashboardOverviewItem[],
    apiName: "fetchDashboardOverview",
  });
  return data;
}
```

**修改说明：**
- 路径从 `/admin/dashboard/overview` 改为 `/system/dashboard/overview`

### 2.5 后端新增文件清单

#### 2.5.1 API模块（zsk-api-document）

| 文件路径 | 说明 |
|---------|------|
| `zsk-api-document/pom.xml` | Maven配置 |
| `RemoteDocumentService.java` | Feign远程调用接口 |
| `RemoteDocumentFallbackFactory.java` | 降级处理 |
| `DocStatisticsApi.java` | 统计数据传输对象 |
| `RemoteDocumentAutoConfiguration.java` | 自动配置 |

#### 2.5.2 Document模块

| 文件路径 | 说明 |
|---------|------|
| `DocStatisticsController.java` | 统计控制器 |
| `IDocStatisticsService.java` | 服务接口 |
| `DocStatisticsServiceImpl.java` | 服务实现 |
| `DocStatisticsVo.java` | 视图对象 |
| `DocNoteMapper.java` | 新增sumViewCount方法 |
| `DocVideoDetailMapper.java` | 新增sumViewCount方法 |

#### 2.5.3 System模块

| 文件路径 | 说明 |
|---------|------|
| `SysDashboardController.java` | 仪表盘控制器 |
| `ISysDashboardService.java` | 服务接口 |
| `SysDashboardServiceImpl.java` | 服务实现 |
| `SysDashboardOverviewVo.java` | 视图对象 |

### 2.6 后端核心代码

#### 2.6.1 Feign远程调用接口

```java
// ===== 文件：RemoteDocumentService.java =====
package com.zsk.document.api;

@FeignClient(contextId = "remoteDocumentService", value = "zsk-module-document", fallbackFactory = RemoteDocumentFallbackFactory.class)
public interface RemoteDocumentService {

    /**
     * 获取文档统计信息
     *
     * @param source 请求来源
     * @return 统计信息
     */
    @GetMapping("/document/statistics/overview")
    R<DocStatisticsApi> getStatisticsOverview(@RequestHeader(CommonConstants.REQUEST_SOURCE_HEADER) String source);
}
```

#### 2.6.2 仪表盘服务实现

```java
// ===== 文件：SysDashboardServiceImpl.java =====
package com.zsk.system.service.impl;

@Slf4j
@Service
@RequiredArgsConstructor
public class SysDashboardServiceImpl implements ISysDashboardService {

    private final SysUserMapper userMapper;
    private final RemoteDocumentService remoteDocumentService;

    @Override
    public List<SysDashboardOverviewVo> getOverview() {
        List<SysDashboardOverviewVo> list = new ArrayList<>();

        /** 用户总数 */
        Long userCount = userMapper.selectCount(
            new LambdaQueryWrapper<SysUser>()
                .eq(SysUser::getDeleted, 0)
        );
        list.add(createItem("users", "用户总数", String.valueOf(userCount), "", "系统注册用户数量"));

        /** 远程调用获取文档统计数据 */
        DocStatisticsApi docStats = getDocStatistics();

        /** 文档总数 */
        Long noteCount = docStats != null ? docStats.getNoteCount() : 0L;
        Long lastWeekNoteCount = docStats != null ? docStats.getLastWeekNoteCount() : 0L;
        String noteDelta = calculateDelta(noteCount, lastWeekNoteCount);
        list.add(createItem("docs", "文档总数", String.valueOf(noteCount), noteDelta, "已发布文档数量"));

        /** 视频总数 */
        Long videoCount = docStats != null ? docStats.getVideoCount() : 0L;
        Long lastWeekVideoCount = docStats != null ? docStats.getLastWeekVideoCount() : 0L;
        String videoDelta = calculateDelta(videoCount, lastWeekVideoCount);
        list.add(createItem("videos", "视频总数", String.valueOf(videoCount), videoDelta, "已发布视频数量"));

        /** 总访问量 */
        Long noteViewCount = docStats != null ? docStats.getNoteViewCount() : 0L;
        Long videoViewCount = docStats != null ? docStats.getVideoViewCount() : 0L;
        Long totalViewCount = noteViewCount + videoViewCount;
        list.add(createItem("views", "总访问量", String.valueOf(totalViewCount), "", "文档和视频总浏览量"));

        return list;
    }

    /**
     * 计算变化率
     *
     * @param current 当前值
     * @param lastWeek 上周新增值
     * @return 变化率字符串（如：+12.5%）
     */
    private String calculateDelta(Long current, Long lastWeek) {
        if (lastWeek == null || lastWeek == 0) {
            return "";
        }
        if (current == null || current == 0) {
            return "-100%";
        }
        Long previousTotal = current - lastWeek;
        if (previousTotal <= 0) {
            return "+" + lastWeek;
        }
        double rate = (double) lastWeek / previousTotal * 100;
        return String.format("+%.1f%%", rate);
    }
}
```

#### 2.6.3 文档统计服务实现

```java
// ===== 文件：DocStatisticsServiceImpl.java =====
package com.zsk.document.service.impl;

@Service
@RequiredArgsConstructor
public class DocStatisticsServiceImpl implements IDocStatisticsService {

    private final DocNoteMapper noteMapper;
    private final DocVideoDetailMapper videoDetailMapper;

    @Override
    public DocStatisticsVo getStatisticsOverview() {
        DocStatisticsVo vo = new DocStatisticsVo();

        /** 当前文档总数 */
        vo.setNoteCount(noteMapper.selectCount(
            new LambdaQueryWrapper<DocNote>()
                .eq(DocNote::getDeleted, 0)
                .eq(DocNote::getStatus, 1)
        ));

        /** 当前视频总数 */
        vo.setVideoCount(videoDetailMapper.selectCount(
            new LambdaQueryWrapper<DocVideoDetail>()
                .eq(DocVideoDetail::getDeleted, 0)
                .eq(DocVideoDetail::getStatus, 1)
        ));

        /** 文档总浏览量 */
        Long noteViewCount = noteMapper.sumViewCount();
        vo.setNoteViewCount(noteViewCount != null ? noteViewCount : 0L);

        /** 视频总浏览量 */
        Long videoViewCount = videoDetailMapper.sumViewCount();
        vo.setVideoViewCount(videoViewCount != null ? videoViewCount : 0L);

        /** 上周数据统计 */
        LocalDateTime lastWeekStart = LocalDateTime.now().minusWeeks(1).withHour(0).withMinute(0).withSecond(0).withNano(0);
        LocalDateTime lastWeekEnd = LocalDateTime.now();

        /** 上周文档总数 */
        vo.setLastWeekNoteCount(noteMapper.selectCount(
            new LambdaQueryWrapper<DocNote>()
                .eq(DocNote::getDeleted, 0)
                .eq(DocNote::getStatus, 1)
                .between(DocNote::getCreateTime, lastWeekStart, lastWeekEnd)
        ));

        /** 上周视频总数 */
        vo.setLastWeekVideoCount(videoDetailMapper.selectCount(
            new LambdaQueryWrapper<DocVideoDetail>()
                .eq(DocVideoDetail::getDeleted, 0)
                .eq(DocVideoDetail::getStatus, 1)
                .between(DocVideoDetail::getCreateTime, lastWeekStart, lastWeekEnd)
        ));

        return vo;
    }
}
```

---

## 三、流量统计（fetchDashboardTraffic）- 待对接

### 3.1 接口信息

| 项目 | 内容 |
|-----|------|
| 前端路径 | `/admin/dashboard/traffic` |
| 后端路径 | `/system/dashboard/traffic` |
| HTTP方法 | GET |
| 功能说明 | 获取流量统计数据 |

### 3.2 字段映射表

| 前端字段 | 后端字段 | 类型 | 说明 |
|---------|---------|------|------|
| type | type | String | 类型（文档/视频） |
| date | date | String | 日期 |
| value | value | Number | 访问值 |

### 3.3 后端待开发

- [ ] 新增流量统计接口
- [ ] 设计流量数据存储方案

---

## 四、趋势数据（fetchDashboardTrend）- 待对接

### 4.1 接口信息

| 项目 | 内容 |
|-----|------|
| 前端路径 | `/admin/dashboard/trend` |
| 后端路径 | `/system/dashboard/trend` |
| HTTP方法 | GET |
| 功能说明 | 获取趋势数据 |

### 4.2 字段映射表

| 前端字段 | 后端字段 | 类型 | 说明 |
|---------|---------|------|------|
| date | date | String | 日期 |
| value | value | Number | 数值 |

### 4.3 后端待开发

- [ ] 新增趋势数据接口
- [ ] 设计趋势数据存储方案

---

## 五、管理日志（fetchRecentAdminLogs）- 待对接

### 5.1 接口信息

| 项目 | 内容 |
|-----|------|
| 前端路径 | `/admin/logs/recent` |
| 后端路径 | `/system/logs/recent` |
| HTTP方法 | GET |
| 功能说明 | 获取最近管理日志 |

### 5.2 字段映射表

| 前端字段 | 后端字段 | 类型 | 说明 |
|---------|---------|------|------|
| id | id | String | 日志ID |
| category | category | String | 分类 |
| operator | operator | String | 操作人 |
| action | action | String | 动作名称 |
| detail | detail | String | 详细描述 |
| createdAt | createTime | String | 创建时间 |

### 5.3 后端待开发

- [ ] 新建 sys_oper_log 操作日志表
- [ ] 新增日志查询接口

---

## 六、分析指标（fetchAnalysisMetrics）- 待对接

### 6.1 接口信息

| 项目 | 内容 |
|-----|------|
| 前端路径 | `/admin/dashboard/analysis/metrics` |
| 后端路径 | `/system/dashboard/analysis/metrics` |
| HTTP方法 | GET |
| 功能说明 | 获取分析指标数据 |

### 6.2 字段映射表

| 前端字段 | 后端字段 | 类型 | 说明 |
|---------|---------|------|------|
| key | key | String | 唯一标识 |
| label | label | String | 显示标签 |
| value | value | String | 当前数值 |
| delta | delta | String | 变化量 |
| description | description | String | 描述说明 |
| tone | tone | String | 趋势（up/down/stable） |

### 6.3 后端待开发

- [ ] 新增分析指标接口

---

## 七、时间分布（fetchAnalysisTimeDistribution）- 待对接

### 7.1 接口信息

| 项目 | 内容 |
|-----|------|
| 前端路径 | `/admin/dashboard/analysis/time-distribution` |
| 后端路径 | `/system/dashboard/analysis/time-distribution` |
| HTTP方法 | GET |
| 功能说明 | 获取时间分布数据 |

### 7.2 字段映射表

| 前端字段 | 后端字段 | 类型 | 说明 |
|---------|---------|------|------|
| type | type | String | 类型（文档/视频） |
| time | time | String | 时间点 |
| value | value | Number | 数值 |

### 7.3 后端待开发

- [ ] 新增时间分布接口

---

## 八、对接检查清单

### 8.1 前端修改清单

- [x] 修改 `fetchDashboardOverview` 接口路径
- [ ] 修改 `fetchDashboardTraffic` 接口路径
- [ ] 修改 `fetchDashboardTrend` 接口路径
- [ ] 修改 `fetchRecentAdminLogs` 接口路径
- [ ] 修改 `fetchAnalysisMetrics` 接口路径
- [ ] 修改 `fetchAnalysisTimeDistribution` 接口路径

### 8.2 后端新增清单

- [x] 新建 zsk-api-document 模块
- [x] 新建 RemoteDocumentService Feign接口
- [x] 新建 DocStatisticsController 控制器
- [x] 新建 IDocStatisticsService 服务接口
- [x] 新建 DocStatisticsServiceImpl 服务实现
- [x] 新建 SysDashboardController 控制器
- [x] 新建 ISysDashboardService 服务接口
- [x] 新建 SysDashboardServiceImpl 服务实现
- [ ] 新建流量统计接口
- [ ] 新建趋势数据接口
- [ ] 新建管理日志接口
- [ ] 新建分析指标接口
- [ ] 新建时间分布接口

---

## 九、注意事项

1. **跨模块调用**：通过 Feign 远程调用 document 模块获取文档统计数据
2. **delta变化量**：计算上周新增数量相对于上周前总数的增长率
3. **实时统计**：每次请求实时查询数据库，不使用缓存
4. **字段映射**：前端 icon 字段是 React 组件，后端不返回，前端自行处理
5. **注释规范**：前后端代码都需要添加中文注释
