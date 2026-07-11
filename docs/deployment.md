# 部署记录

## 稳定资源

| 资源 | 值 |
|---|---|
| GitHub 仓库 | `https://github.com/Nemo-netone/ot-xm-film-ticket` |
| 生产分支 | `main` |
| Cloudflare Pages 项目 | `ot-xm-film-ticket` |
| 稳定演示地址 | `https://ot-xm-film-ticket.pages.dev` |
| API 运行时 | Cloudflare Pages Functions / `site/_worker.js` |
| Supabase schema | `ot_xm_film_ticket` |

首次生产部署使用 `main` 分支。后续重新发布继续使用同一个 GitHub 仓库、同一个 Pages 项目和同一个分支，保持演示地址不变。

## 部署架构

```text
site/
  -> Cloudflare Pages
  -> /api/* Pages Functions
  -> Supabase RPC public.ot_xm_film_ticket_demo_rest
  -> ot_xm_film_ticket schema
```

原始项目保留在仓库中。线上演示不直接运行 Java/Tomcat 后端，而是使用 Worker 兼容层承载公开演示功能。

## 环境变量

```text
SUPABASE_URL=<supabase-url>
SUPABASE_ANON_KEY=<supabase-anon-key>
SUPABASE_SCHEMA=ot_xm_film_ticket
CORS_ALLOWED_ORIGINS=https://ot-xm-film-ticket.pages.dev
```

真实密钥只放在 Cloudflare secrets、平台 CLI 或本机受控环境中，不能提交到仓库。

## 数据库初始化

初始化脚本：

```text
supabase/schema.sql
```

该脚本只创建和写入 `ot_xm_film_ticket`，不会创建、删除、重置或覆盖 `public` schema 及其他项目 schema。

## 发布命令

```powershell
supabase db query --linked --file supabase/schema.sql
npx wrangler@3 pages deploy site --project-name ot-xm-film-ticket --branch main
```

## 验证清单

- [ ] GitHub 仓库公开可访问。
- [ ] `main` 分支已推送。
- [ ] Pages 地址返回 200。
- [ ] `/health` 返回服务和 schema 信息。
- [ ] 管理员账号可登录。
- [ ] 普通用户账号可登录。
- [ ] 工作人员/运营账号可登录。
- [ ] `/api/summary` 返回统计数据。
- [ ] 演示数据新增、编辑、删除流程可用。
- [ ] README 演示地址、账号、截图和限制说明准确。
- [ ] secret scan 不包含真实平台密钥。

## 已知限制

- 演示版不接入真实短信、支付、地图或验证码服务。
- 上传图片为静态演示资源，不作为长期文件存储。
- 权限控制以公开演示账号区分，不等同生产级鉴权。
