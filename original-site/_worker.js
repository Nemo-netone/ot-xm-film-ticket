export default {
  async fetch(request, env) {
    try {
      const url = new URL(request.url);
      if (request.method === "OPTIONS") return new Response(null, { headers: corsHeaders(request, env) });
      const legacyPaths = ["/login", "/film/", "/cinema/", "/show/", "/orders/", "/comment/", "/notice/", "/type/", "/actor/", "/statistics/"];
      const isLegacy = (url.pathname === "/login" && request.method === "POST") || legacyPaths.filter((path) => path !== "/login").some((path) => url.pathname.startsWith(path));
      if (env.ASSETS && !url.pathname.startsWith("/api/") && !isLegacy && url.pathname !== "/health") return env.ASSETS.fetch(request);

      if (url.pathname === "/health") {
        return json(request, env, result(true, "ok", { service: `${schema(env)}-api`, schema: schema(env), time: new Date().toISOString() }));
      }

      if (isLegacy) return json(request, env, await legacyApi(request, url, env));
      if (!url.pathname.startsWith("/api/")) return json(request, env, result(false, "API path not found", null), 404);
      const body = await parseBody(request);
      const parts = url.pathname.replace(/^\/api\/?/, "").split("/").filter(Boolean);

      if (parts[0] === "login") return json(request, env, await login(body, env));
      if (parts[0] === "summary") return json(request, env, await summary(env));

      const [resource, action = "list"] = parts;
      if (resource !== "items") return json(request, env, result(false, "业务模块不存在", null), 404);
      return json(request, env, await items(action, body, env));
    } catch (error) {
      return json(request, env, result(false, error.message || "服务异常", null), 500);
    }
  },
};


const filmModules = { film: "film", cinema: "cinema", show: "show", orders: "order", comment: "comment", notice: "notice", type: "film", actor: "film" };
async function legacyApi(request, url, env) {
  const body = await parseBody(request), parts = url.pathname.split("/").filter(Boolean);
  if (url.pathname === "/login") return filmLogin(body, env);
  if (url.pathname === "/statistics/base") return filmResult({ filmCount: 3, cinemaCount: 3, todayPrice: 2860.5, totalPrice: 128600.0 });
  if (url.pathname === "/statistics/line") return filmResult({ xAxis: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], yAxis: [1200, 1680, 1420, 2180, 2860, 3950, 3680] });
  if (url.pathname === "/statistics/bar") return filmResult({ xAxis: ["Film A", "Film B", "Film C"], yAxis: [320, 260, 180] });
  if (url.pathname === "/statistics/pie") return filmResult([{ name: "Action", value: 38 }, { name: "Drama", value: 34 }, { name: "Animation", value: 28 }]);
  if (url.pathname === "/orders/todayTotal") return filmResult({ total: 2860.5, time: new Date().toISOString() });
  const [resource = "film", action = "selectPage", id = ""] = parts, moduleKey = filmModules[resource] || resource;
  if (["selectPage", "selectAll", "selectTotalTop", "selectScoreTop"].includes(action)) return filmList(moduleKey, url, env);
  if (action === "selectById") return filmInfo(id, env);
  if (action === "add") return filmSave(moduleKey, body, env);
  if (action === "update") return filmUpdate(moduleKey, body, env);
  if (action === "delete") return filmDelete(body.id || id, env);
  if (action === "deleteBatch") return filmDeleteBatch(body, env);
  return filmResult({});
}
async function filmLogin(body, env) {
  const roles = { ADMIN: "admin", USER: "user", CINEMA: "staff" }, role = roles[body.role] || "user";
  const rows = await requestSupabase(env, "accounts", "GET", { role: `eq.${role}`, username: `eq.${body.username || ""}`, password: `eq.${body.password || ""}`, limit: "1" });
  if (!rows.length) return { code: "500", msg: "Invalid demo account", data: null };
  const row = rows[0]; return filmResult({ id: row.id, username: row.username, name: row.display_name, role: body.role, token: `demo-${role}-${row.id}` });
}
async function filmList(moduleKey, url, env) {
  const rows = await requestSupabase(env, "items", "GET", { module_key: `eq.${moduleKey}`, order: "updated_at.desc" });
  const list = rows.map(filmRow), pageNum = Math.max(Number(url.searchParams.get("pageNum") || 1), 1), pageSize = Math.max(Number(url.searchParams.get("pageSize") || 10), 1), start = (pageNum - 1) * pageSize;
  return filmResult({ list: list.slice(start, start + pageSize), total: list.length, pageNum, pageSize });
}
async function filmInfo(id, env) { const rows = await requestSupabase(env, "items", "GET", { id: `eq.${id}`, limit: "1" }); return filmResult(rows[0] ? filmRow(rows[0]) : null); }
async function filmSave(moduleKey, body, env) { const rows = await requestSupabase(env, "items", "POST", {}, filmPayload(moduleKey, body)); return filmResult(rows[0] ? filmRow(rows[0]) : null); }
async function filmUpdate(moduleKey, body, env) { const rows = await requestSupabase(env, "items", "PATCH", { id: `eq.${body.id}` }, filmPayload(moduleKey, body)); return filmResult(rows[0] ? filmRow(rows[0]) : null); }
async function filmDelete(id, env) { if (id) await requestSupabase(env, "items", "DELETE", { id: `eq.${id}` }); return filmResult(null); }
async function filmDeleteBatch(ids, env) { for (const id of Array.isArray(ids) ? ids : []) await requestSupabase(env, "items", "DELETE", { id: `eq.${id}` }); return filmResult(null); }
function filmPayload(moduleKey, body) { return { module_key: moduleKey, title: String(body.title || body.name || "Film demo record"), subtitle: String(body.subtitle || body.type || "Original Vue data"), status: String(body.status || "Showing"), owner: String(body.owner || body.cinemaName || "Admin"), amount: Number(body.price || body.amount || body.score || 0), description: String(body.description || body.content || body.introduction || ""), extra: body, updated_at: new Date().toISOString() }; }
function filmRow(row) { const extra = row.extra && typeof row.extra === "object" ? row.extra : {}; return { ...extra, id: row.id, title: extra.title || row.title, name: extra.name || row.title, status: extra.status || row.status, cinemaName: extra.cinemaName || row.owner, price: extra.price || row.amount, score: extra.score || Math.min(9.8, 7 + Number(row.id % 3)), total: extra.total || Number(row.amount || 0), introduction: extra.introduction || row.description, content: extra.content || row.description, cover: extra.cover || "", createTime: row.created_at }; }
function filmResult(data) { return { code: "200", msg: "ok", data }; }
async function login(body, env) {
  const role = String(body.role || "").trim();
  const username = String(body.username || "").trim();
  const password = String(body.password || "").trim();
  if (!role || !username || !password) return result(false, "请输入角色、账号和密码", null);
  const rows = await requestSupabase(env, "accounts", "GET", { role: `eq.${role}`, username: `eq.${username}`, password: `eq.${password}`, limit: "1" });
  if (!rows.length) return result(false, "登录失败，请检查演示账号", null);
  const account = { ...rows[0] };
  delete account.password;
  return result(true, null, account);
}

async function summary(env) {
  const [accounts, rows] = await Promise.all([
    requestSupabase(env, "accounts", "GET", { order: "id.asc" }),
    requestSupabase(env, "items", "GET", { order: "updated_at.desc" }),
  ]);
  const modules = {};
  for (const row of rows) modules[row.module_key] = (modules[row.module_key] || 0) + 1;
  return result(true, null, {
    totalAccounts: accounts.length,
    totalItems: rows.length,
    modules,
    latest: rows.slice(0, 6),
  });
}

async function items(action, body, env) {
  if (action === "list") {
    const query = { order: "updated_at.desc" };
    if (body.module_key) query.module_key = `eq.${body.module_key}`;
    return result(true, null, await requestSupabase(env, "items", "GET", query));
  }
  if (action === "add") {
    const payload = normalizeItem(body);
    const rows = await requestSupabase(env, "items", "POST", {}, payload);
    return result(true, "新增成功", rows[0] || null);
  }
  if (action === "update") {
    if (!body.id) return result(false, "缺少记录编号", null);
    const payload = normalizeItem(body);
    delete payload.id;
    const rows = await requestSupabase(env, "items", "PATCH", { id: `eq.${body.id}` }, payload);
    return result(true, "更新成功", rows[0] || null);
  }
  if (action === "delete") {
    if (!body.id) return result(false, "缺少记录编号", null);
    await requestSupabase(env, "items", "DELETE", { id: `eq.${body.id}` });
    return result(true, "删除成功", null);
  }
  return result(false, "动作不存在", null);
}

function normalizeItem(body) {
  return {
    module_key: String(body.module_key || "general").trim(),
    title: String(body.title || "未命名记录").trim(),
    subtitle: String(body.subtitle || "").trim(),
    status: String(body.status || "进行中").trim(),
    owner: String(body.owner || "").trim(),
    amount: Number(body.amount || 0),
    description: String(body.description || "").trim(),
    extra: body.extra || {},
    updated_at: new Date().toISOString(),
  };
}

async function requestSupabase(env, table, method, query = {}, payload = {}) {
  const base = cleanEnv(env.SUPABASE_URL);
  const key = cleanEnv(env.SUPABASE_ANON_KEY || env.SUPABASE_SERVICE_ROLE_KEY);
  if (!base || !key) throw new Error("Worker 缺少 Supabase 环境变量");
  const response = await fetch(`${base.replace(/\/$/, "")}/rest/v1/rpc/${schema(env)}_demo_rest`, {
    method: "POST",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ p_table_name: table, p_method: method, p_query: query, p_payload: payload }),
  });
  if (!response.ok) throw new Error(`Supabase 请求失败: ${response.status} ${await response.text()}`);
  const data = await response.json();
  return Array.isArray(data) ? data : [];
}

function schema(env) {
  return cleanEnv(env.SUPABASE_SCHEMA);
}

function cleanEnv(value) {
  return String(value || "").replace(/^\uFEFF/, "").trim();
}

async function parseBody(request) {
  if (request.method === "GET" || request.method === "HEAD") return {};
  const text = await request.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return {};
  }
}

function result(status, message, data) {
  return { status, message, data };
}

function json(request, env, payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", ...corsHeaders(request, env) },
  });
}

function corsHeaders(request, env) {
  const origin = request.headers.get("Origin") || "";
  const allowed = String(env.CORS_ALLOWED_ORIGINS || "").split(",").map((item) => item.trim()).filter(Boolean);
  const allowOrigin = allowed.includes(origin) ? origin : allowed[0] || "*";
  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "GET,POST,PATCH,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type,Authorization",
    "Access-Control-Max-Age": "86400",
  };
}
