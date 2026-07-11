# 功能说明

## 项目定位

围绕影片、影院、影厅、场次、订单和评论评分的电影票务演示系统。

## 功能树

| 模块 | 责任 | 数据归属 |
|---|---|---|
| 影片管理 | 影片、类型、演员、上映状态和热度 | `items.module_key = film` |
| 影院管理 | 影院、区域、影厅和放映能力 | `items.module_key = cinema` |
| 场次排片 | 影片场次、价格、座位和时间 | `items.module_key = show` |
| 票务订单 | 购票、支付、取票和退票状态 | `items.module_key = order` |
| 评论评分 | 观众评论、评分和收藏 | `items.module_key = comment` |
| 公告视频 | 公告、宣传片和运营信息 | `items.module_key = notice` |

## 使用场景

1. 访客打开 `https://ot-xm-film-ticket.pages.dev`，先浏览项目定位、核心模块和演示账号。
2. 使用公开账号登录，进入工作台查看统计数据。
3. 通过模块侧边栏进入业务表，进行列表浏览、关键词搜索、新增、编辑和删除。
4. 管理员可完整演示数据维护流程；普通用户和工作人员账号用于展示不同角色入口。

## 调用链和数据流

```text
浏览器
  -> site/app.js
  -> /api/login 或 /api/items/*
  -> site/_worker.js
  -> Supabase RPC public.ot_xm_film_ticket_demo_rest
  -> ot_xm_film_ticket.accounts / ot_xm_film_ticket.items
```

## 推荐演示路径

```text
登录 -> 工作台统计 -> 影片管理 -> 影院管理 -> 场次排片 -> 票务订单 -> 新增一条记录 -> 编辑状态 -> 删除测试记录
```

## 演示边界

- 已实现：登录、统计、业务模块列表、搜索、新增、编辑、删除。
- 部分实现：原项目的复杂权限、文件上传、第三方服务以作品集展示为主。
- 未接入：真实支付、短信、地图、邮件、生产级文件存储。
