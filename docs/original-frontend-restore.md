# Original Frontend Restore - 2026-07-12

## Production

- Stable URL: `https://ot-xm-film-ticket.pages.dev`
- Cloudflare Pages project: `ot-xm-film-ticket`
- Published directory: `original-site/`
- Original source: `vue/` (Vue 3, Vite, Element Plus)
- Compatibility API: `original-site/_worker.js`
- Supabase schema: `ot_xm_film_ticket`

## Restore Scope

- Built the current original Vue 3 frontend with `VITE_BASE_URL=/` and published the result as `original-site/`.
- Preserved the original public film site, login, administrator dashboard, film, cinema, show, order, comment, notice, and account views.
- Added same-origin compatibility routes for the original root-level API contract while retaining `/api/*` verification routes.
- Kept `site/` as a fallback only. Production publishes `original-site/`.

## Verified Core

- Public home: `/front/home`
- Administrator login: `admin / admin`, role `ADMIN`
- Film list: `/film/selectPage`
- Film create/update/delete: `/film/add`, `/film/update`, `/film/delete/:id`
- Dashboard statistics: `/statistics/base`, `/statistics/line`, `/statistics/bar`, `/statistics/pie`
- Health and isolated schema: `/health`
- Browser checks: public home, login page, administrator dashboard, desktop and mobile screenshots.

## Boundary

The portfolio compatibility layer persists core film records through Supabase. Real payment, seat locking, file upload, recommendation training, and cinema settlement are not connected to production third-party services.