# 前台展示与互动 API 接口文档

## 1. 概述

本文档定义了前台展示与互动模块的接口规范，包括首页推荐、全站搜索、用户主页、视频详情及互动（点赞/收藏/评论）等功能。

- **基础路径**: `/api`
- **数据格式**: `JSON`
- **通用响应**: 所有接口统一返回 `{ code, msg, data }` 结构。

## 2. 接口列表

### 2.1 首页内容聚合 (`/home`)

#### 获取首页视频推荐
- **接口地址**: `GET /home/videos`
- **描述**: 获取首页推荐的视频列表。
- **请求参数**: 无
- **响应示例**:
  ```json
  {
    "code": 0,
    "msg": "ok",
    "data": [
      {
        "id": "v_001",
        "title": "从 0 搭建个人知识库前端",
        "views": "1.2w",
        "date": "2026-01-18"
      }
    ]
  }
  ```

#### 获取首页文章推荐
- **接口地址**: `GET /home/articles`
- **描述**: 获取首页推荐的文章列表。
- **请求参数**: 无
- **响应示例**:
  ```json
  {
    "code": 0,
    "msg": "ok",
    "data": [
      {
        "id": "a_001",
        "category": "工程实践",
        "title": "React 19 新特性解析",
        "date": "2026-01-15",
        "summary": "深入探讨 React 19 的新特性...",
        "views": "3k",
        "author": "前端小助手"
      }
    ]
  }
  ```

#### 获取用户评价/反馈
- **接口地址**: `GET /home/reviews`
- **描述**: 获取首页展示的用户评价或反馈信息。
- **请求参数**: 无
- **响应示例**:
  ```json
  {
    "code": 0,
    "msg": "ok",
    "data": [
      {
        "id": "r_001",
        "name": "UserA",
        "role": "全栈工程师",
        "source": "评论区",
        "date": "2026-01-10",
        "content": "非常有用的知识库系统！",
        "tone": "positive"
      }
    ]
  }
  ```

### 2.2 全站搜索 (`/search`)

#### 全站统一搜索
- **接口地址**: `GET /search/all`
- **描述**: 综合搜索接口，支持按类型、排序、时间等维度过滤。
- **请求参数**:
  | 字段名 | 类型 | 必填 | 说明 |
  |---|---|---|---|
  | keyword | string | 否 | 搜索关键词 |
  | category | string | 否 | 类别: `all`, `video`, `document`, `tool`, `user` |
  | sort | string | 否 | 排序: `hot`, `latest`, `relevance` 等 |
  | duration | string | 否 | 时长过滤 (如 `0-10`) |
  | timeRange | string | 否 | 时间范围 (如 `7d`) |
  | tag | string | 否 | 标签过滤 |
- **响应示例**:
  ```json
  {
    "code": 0,
    "msg": "ok",
    "data": {
      "list": [
        {
          "id": "v_001",
          "type": "video",
          "title": "知识库搭建教程",
          "description": "详细教程...",
          "tags": ["教程", "前端"],
          "stats": "1.2w次播放",
          "thumbnail": "https://example.com/cover.jpg"
        }
      ],
      "total": 100
    }
  }
  ```

### 2.3 用户主页 (`/user`)

#### 获取用户主页信息
- **接口地址**: `GET /user/profile/{id}`
- **描述**: 获取指定用户的公开主页信息。
- **请求参数**: `id` (Path, 用户ID)
- **响应示例**:
  ```json
  {
    "code": 0,
    "msg": "ok",
    "data": {
      "id": "u_001",
      "username": "creator_01",
      "name": "知识库创作者",
      "avatar": "https://example.com/avatar.png",
      "bio": "分享技术知识",
      "stats": {
        "followers": 1024,
        "following": 12,
        "works": 56,
        "likes": 8848
      },
      "isFollowing": false
    }
  }
  ```

#### 关注/取消关注
- **接口地址**: `POST /user/follow/{id}`
- **描述**: 关注或取消关注指定用户。
- **请求参数**: `id` (Path, 目标用户ID)
- **响应示例**:
  ```json
  {
    "code": 0,
    "msg": "ok",
    "data": {
      "isFollowing": true
    }
  }
  ```

#### 获取用户作品列表
- **接口地址**: `GET /user/works/{id}`
- **描述**: 分页获取用户的作品列表。
- **请求参数**:
  | 字段名 | 类型 | 必填 | 说明 |
  |---|---|---|---|
  | page | number | 否 | 页码 |
  | pageSize | number | 否 | 每页数量 |
  | type | string | 否 | 类型过滤: `video`, `article` |
- **响应示例**:
  ```json
  {
    "code": 0,
    "msg": "ok",
    "data": {
      "list": [
        {
          "id": "w_001",
          "type": "video",
          "title": "作品标题",
          "coverUrl": "...",
          "views": 100,
          "createdAt": "2026-01-01"
        }
      ],
      "total": 56
    }
  }
  ```

### 2.4 视频详情与互动 (`/content/video`)

#### 获取视频详情
- **接口地址**: `GET /content/video/detail/{id}`
- **描述**: 获取视频详细信息、播放地址及互动状态。
- **请求参数**: `id` (Path, 视频ID)
- **响应示例**:
  ```json
  {
    "code": 0,
    "msg": "ok",
    "data": {
      "id": "v_001",
      "title": "视频标题",
      "videoUrl": "https://example.com/video.m3u8",
      "author": { "id": "u_001", "name": "作者", "isFollowing": false },
      "stats": { "views": "1w", "likes": 100, "isLiked": false, "isFavorited": false }
    }
  }
  ```

#### 点赞/取消点赞
- **接口地址**: `POST /content/video/like/{id}`
- **描述**: 对视频进行点赞或取消点赞。
- **请求参数**: `id` (Path, 视频ID)
- **响应示例**:
  ```json
  {
    "code": 0,
    "msg": "ok",
    "data": {
      "isLiked": true,
      "count": 101
    }
  }
  ```

#### 收藏/取消收藏
- **接口地址**: `POST /content/video/favorite/{id}`
- **描述**: 对视频进行收藏或取消收藏。
- **请求参数**: `id` (Path, 视频ID)
- **响应示例**:
  ```json
  {
    "code": 0,
    "msg": "ok",
    "data": {
      "isFavorited": true,
      "count": 56
    }
  }
  ```

#### 获取评论列表
- **接口地址**: `GET /content/video/comments/{id}`
- **描述**: 分页获取视频评论。
- **请求参数**: `page`, `pageSize`
- **响应示例**:
  ```json
  {
    "code": 0,
    "msg": "ok",
    "data": {
      "list": [],
      "total": 0
    }
  }
  ```

#### 发表/回复评论
- **接口地址**: `POST /content/video/comment`
- **描述**: 发表新评论或回复已有评论。
- **请求参数**:
  | 字段名 | 类型 | 必填 | 说明 |
  |---|---|---|---|
  | videoId | string | 是 | 视频ID |
  | content | string | 是 | 评论内容 |
  | parentId | string | 否 | 回复的父评论ID |
- **响应示例**:
  ```json
  {
    "code": 0,
    "msg": "ok",
    "data": { "id": "c_new", "content": "..." }
  }
  ```
