# 系统配置 API 接口文档

## 1. 概述

本文档定义了后台系统配置模块的接口规范，包含数据字典管理与通知机器人（Bot）配置。

- **基础路径**: `/api/admin`
- **数据格式**: `JSON`
- **通用响应**: 所有接口统一返回 `{ code, msg, data }` 结构。

## 2. 接口列表

### 2.1 数据字典 (`/system/dict`)

#### 获取数据字典列表
- **接口地址**: `GET /system/dict/list`
- **描述**: 分页获取系统数据字典定义。
- **请求参数**: `page`, `pageSize`, `keyword`, `status`
- **响应示例**:
  ```json
  {
    "code": 0,
    "msg": "ok",
    "data": {
      "list": [
        {
          "id": "d_001",
          "code": "content_category",
          "name": "内容分类",
          "itemCount": 5,
          "status": "enabled"
        }
      ],
      "total": 1
    }
  }
  ```

#### 保存数据字典
- **接口地址**: `POST /system/dict/save`
- **描述**: 新增或更新数据字典。
- **请求参数**: `id` (可选), `code`, `name`, `category`, `description`, `status`

#### 切换字典状态
- **接口地址**: `POST /system/dict/toggle-status`
- **描述**: 启用或禁用字典。
- **请求参数**: `id`, `status`

### 2.2 通知 Bot 配置 (`/bot`)

#### 获取 Bot 配置列表
- **接口地址**: `GET /bot/list`
- **描述**: 获取所有配置的通知机器人。
- **请求参数**: 无
- **响应示例**:
  ```json
  {
    "code": 0,
    "msg": "ok",
    "data": [
      {
        "id": "bot_01",
        "type": "dingtalk",
        "name": "钉钉报警",
        "status": "active"
      }
    ]
  }
  ```

#### 保存 Bot 配置
- **接口地址**: `POST /bot/save`
- **描述**: 新增或更新 Bot 配置。
- **请求参数**:
  | 字段名 | 类型 | 必填 | 说明 |
  |---|---|---|---|
  | id | string | 否 | ID (更新时必填) |
  | type | string | 是 | 类型: `dingtalk`, `wechat`, `qq`, `napcat` |
  | name | string | 是 | 名称 |
  | webhook | string | 否 | Webhook 地址 |
  | secret | string | 否 | 签名密钥 |
  | token | string | 否 | 访问令牌 |
  | status | string | 是 | 状态: `active`, `inactive` |

## 3. 错误码说明

| 错误码 | 说明 |
|---|---|
| 50001 | 字典编码已存在 |
| 50002 | 禁止禁用含有子项的字典 |
| 50003 | Bot 配置验证失败 |
