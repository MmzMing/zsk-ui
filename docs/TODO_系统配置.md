# 系统配置与字典 / Bot 配置模块接口 TODO 清单

> 本文档用于记录「系统配置」相关后台页面预计对接的接口信息，包含数据字典与通知 Bot 配置，便于后续与后端对齐实现方案。所有接口返回格式统一为 `{ code, msg, data }`。

## 一、数据字典管理

- 接口名称：获取数据字典列表  
- 接口地址：`GET /api/admin/system/dict/list`  
- 请求参数：
  - `page`: number，页码，从 1 开始  
  - `pageSize`: number，分页大小，默认 20  
  - `keyword`: string，可选，按字典名称 / 编码模糊搜索  
  - `status`: string，可选，`enabled` | `disabled`  
- 返回数据示例：
  ```json
  {
    "code": 0,
    "msg": "ok",
    "data": {
      "list": [
        {
          "id": "dict_content_category",
          "code": "content_category",
          "name": "内容分类",
          "category": "content",
          "description": "文档/视频分类字典",
          "itemCount": 12,
          "status": "enabled",
          "updatedAt": "2026-01-18 10:20:00"
        }
      ],
      "total": 5
    }
  }
  ```  
- 测试用例要点：
  - 分页字段与其他列表接口保持一致  
  - `itemCount` 为非负整数，表示该字典下条目数量  
  - `status` 用于控制是否在前端下拉选项中展示  
- 精简待办：
  - 字典分类 `category` 字段枚举需与前端页面约定统一（如 content/system/user 等）  

- 接口名称：保存数据字典（新增或更新）  
- 接口地址：`POST /api/admin/system/dict/save`  
- 请求参数：
  - `id`: string，可选，存在时表示更新，不存在时表示新增  
  - `code`: string，字典编码（全局唯一，英文小写 + 下划线）  
  - `name`: string，字典名称  
  - `category`: string，所属大类  
  - `description`: string，说明  
  - `status`: string，`enabled` | `disabled`  
- 返回数据示例：
  ```json
  { "code": 0, "msg": "ok", "data": true }
  ```  
- 测试用例要点：
  - 新增时 `code` 不可重复，更新时允许保持原值  
  - 禁止将仍有启用子项的字典直接置为 `disabled`（如有该约束）  
- 精简待办：
  - 与具体字典项维护接口（若存在）对齐级联更新策略  

- 接口名称：切换字典状态  
- 接口地址：`POST /api/admin/system/dict/toggle-status`  
- 请求参数：
  - `id`: string，字典 ID  
  - `status`: string，`enabled` | `disabled`  
- 测试用例要点：
  - 切换状态后缓存刷新策略（前端是否需要重新拉取字典列表）  

## 二、通知机器人（Bot）配置

- 接口名称：获取 Bot 配置列表  
- 接口地址：`GET /api/admin/bot/list`  
- 请求参数：无  
- 返回数据示例：
  ```json
  {
    "code": 0,
    "msg": "ok",
    "data": [
      {
        "id": "bot_dt_001",
        "type": "dingtalk",
        "name": "钉钉告警群机器人",
        "webhook": "https://oapi.dingtalk.com/robot/send?access_token=***",
        "secret": "***",
        "token": null,
        "status": "active"
      }
    ]
  }
  ```  
- 测试用例要点：
  - `type` 仅允许 `dingtalk` | `wechat` | `qq` | `napcat` 等约定值  
  - `status` 为 `active` / `inactive`，用于控制是否启用该 Bot  
  - 敏感字段（`webhook`、`secret`、`token`）返回时是否需要脱敏，由安全策略决定  
- 精简待办：
  - 与告警 / 通知系统约定不同 Bot 类型的字段必填项  
  - 确认是否需要区分测试环境 / 生产环境的机器人配置  

- 接口名称：保存 Bot 配置  
- 接口地址：`POST /api/admin/bot/save`  
- 请求参数：
  - `id`: string，可选，存在表示更新，不存在表示新增  
  - `type`: string，`dingtalk` | `wechat` | `qq` | `napcat`  
  - `name`: string，配置名称  
  - `webhook`: string，可选，Webhook 地址  
  - `secret`: string，可选，签名密钥  
  - `token`: string，可选，访问令牌  
  - `status`: string，`active` | `inactive`  
- 测试用例要点：
  - 根据不同 `type` 校验对应字段必填规则（例如某些类型只需 token，无需 webhook）  
  - 保存成功后是否需要立即生效，还是下次任务触发时生效  
- 精简待办：
  - 与消息推送模块约定失败重试、告警策略等细节  

## 附录：接口测试用例模板与对接说明

- 本模块可复用 README 中的「接口测试用例模板与后端对接 Checklist」，重点关注：  
  - 字典配置对前台下拉选项、校验规则的影响  
  - Bot 配置对系统告警、通知发送的影响  
- 建议在实际对接时：
  - 为每个字典类型设计至少一组“新增 / 更新 / 禁用 / 启用”测试用例  
  - 为每类 Bot 配置设计至少一条真实通知路径的联调用例，确保配置有效。  

