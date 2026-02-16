# 登录与安全 API 接口文档

## 1. 概述

本文档定义了「登录与安全」模块的接口规范，涵盖滑块验证码、用户认证（登录/注册/注销）、令牌管理及密码找回等功能。

- **基础路径**: `/api/auth`
- **数据格式**: `JSON`
- **通用响应**: 所有接口统一返回 `{ code, msg, data }` 结构。

## 2. 接口列表

### 2.1 滑块验证码

#### 获取滑块验证码
- **接口地址**: `GET /captcha/slider`
- **描述**: 获取滑块拼图验证码，用于登录、注册或找回密码时的安全验证。
- **请求参数**:
  | 字段名 | 类型 | 必填 | 说明 |
  |---|---|---|---|
  | scene | string | 是 | 场景值: `login_email` (邮箱登录), `forgot_email` (找回密码), `register_email` (注册) |
- **响应示例**:
  ```json
  {
    "code": 0,
    "msg": "ok",
    "data": {
      "uuid": "550e8400-e29b-41d4-a716-446655440000",
      "bgUrl": "https://example.com/captcha/bg/1.png",
      "puzzleUrl": "https://example.com/captcha/puzzle/1.png"
    }
  }
  ```

#### 校验滑块验证码
- **接口地址**: `POST /captcha/slider/verify`
- **描述**: 校验用户拖动滑块的结果。
- **请求参数**:
  | 字段名 | 类型 | 必填 | 说明 |
  |---|---|---|---|
  | scene | string | 是 | 场景值，需与获取时一致 |
  | uuid | string | 是 | 验证码会话 ID |
  | account | string | 否 | 账号（用户名/手机号） |
  | email | string | 否 | 邮箱 |
  | ... | ... | 否 | 其他扩展轨迹参数 |
- **响应示例**:
  ```json
  {
    "code": 0,
    "msg": "ok",
    "data": {
      "passed": true
    }
  }
  ```

### 2.2 认证管理

#### 用户登录
- **接口地址**: `POST /login`
- **描述**: 用户登录接口，支持账号密码、邮箱、手机号等多种方式。
- **请求参数**:
  | 字段名 | 类型 | 必填 | 说明 |
  |---|---|---|---|
  | type | string | 是 | 登录方式: `account`, `email`, `phone` |
  | username | string | 否 | 用户名 (type=account) |
  | email | string | 否 | 邮箱 (type=email) |
  | password | string | 否 | 密码 (type=account/email) |
  | code | string | 否 | 验证码 (type=email/phone) |
- **响应示例**:
  ```json
  {
    "code": 0,
    "msg": "登录成功",
    "data": {
      "token": "eyJhbGciOi...",
      "refreshToken": "eyJhbGciOi...",
      "expiresIn": 7200,
      "user": {
        "id": "u_001",
        "username": "admin",
        "avatar": "https://example.com/avatar.png",
        "roles": ["admin", "editor"]
      }
    }
  }
  ```

#### 刷新令牌
- **接口地址**: `POST /refresh-token`
- **描述**: 使用刷新令牌换取新的访问令牌。
- **请求参数**:
  | 字段名 | 类型 | 必填 | 说明 |
  |---|---|---|---|
  | token | string | 是 | 当前的 refreshToken |
- **响应示例**:
  ```json
  {
    "code": 0,
    "msg": "ok",
    "data": {
      "token": "eyJhbGciOi...new_token"
    }
  }
  ```

#### 退出登录
- **接口地址**: `POST /logout`
- **描述**: 注销当前用户登录态。
- **请求参数**: 无
- **响应示例**:
  ```json
  {
    "code": 0,
    "msg": "ok",
    "data": true
  }
  ```

### 2.3 账号安全

#### 用户注册
- **接口地址**: `POST /register`
- **描述**: 新用户注册。
- **请求参数**:
  | 字段名 | 类型 | 必填 | 说明 |
  |---|---|---|---|
  | username | string | 是 | 用户名 |
  | email | string | 是 | 邮箱 |
  | password | string | 否 | 密码 |
  | code | string | 否 | 邮箱验证码 |
- **响应示例**:
  ```json
  {
    "code": 0,
    "msg": "注册成功",
    "data": true
  }
  ```

#### 找回/重置密码
- **接口地址**: `POST /forgot-password`
- **描述**: 通过邮箱验证码重置密码。
- **请求参数**:
  | 字段名 | 类型 | 必填 | 说明 |
  |---|---|---|---|
  | email | string | 是 | 邮箱 |
  | code | string | 是 | 验证码 |
  | newPassword | string | 否 | 新密码 |
- **响应示例**:
  ```json
  {
    "code": 0,
    "msg": "密码重置成功",
    "data": true
  }
  ```

## 3. 错误码说明

| 错误码 | 说明 |
|---|---|
| 401 | 未登录或 Token 无效 |
| 403 | 无权限访问 |
| 10001 | 验证码错误或过期 |
| 10002 | 用户名或密码错误 |
| 10003 | 账号已被锁定 |
| 10004 | Token 已过期 |
