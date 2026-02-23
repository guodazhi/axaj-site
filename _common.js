const crypto = require("crypto");

const json = (status, body, headers = {}) => ({
  statusCode: status,
  headers: {
    "content-type": "application/json; charset=utf-8",
    "access-control-allow-origin": "*",
    "access-control-allow-headers": "content-type,authorization,x-admin-pin",
    ...headers,
  },
  body: JSON.stringify(body),
});

const requireEnv = (name) => {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
};

const sb = async (path, { method = "GET", body = null, headers = {} } = {}) => {
  const base = requireEnv("SUPABASE_URL").replace(/\/$/, "");
  const url = base + "/rest/v1/" + path;
  const key = requireEnv("SUPABASE_SERVICE_ROLE_KEY");
  const res = await fetch(url, {
    method,
    headers: {
      apikey: key,
      authorization: `Bearer ${key}`,
      "content-type": "application/json",
      prefer: "return=representation",
      ...headers,
    },
    body: body ? JSON.stringify(body) : null,
  });
  const txt = await res.text();
  let data = null;
  try { data = txt ? JSON.parse(txt) : null; } catch (e) { data = txt; }
  if (!res.ok) throw new Error(`Supabase ${res.status}: ${typeof data === "string" ? data : JSON.stringify(data)}`);
  return data;
};

const hashPassword = (pwd, salt) => {
  const s = salt || crypto.randomBytes(16).toString("hex");
  const h = crypto.createHash("sha256").update(s + ":" + pwd).digest("hex");
  return { hash: `${s}$${h}` };
};
const verifyPassword = (pwd, stored) => {
  const [s, h] = String(stored || "").split("$");
  if (!s || !h) return false;
  const hh = crypto.createHash("sha256").update(s + ":" + pwd).digest("hex");
  return hh === h;
};

const b64url = (buf) => Buffer.from(buf).toString("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
const signJWT = (payload, expSeconds = 60 * 60 * 24 * 7) => {
  const secret = requireEnv("JWT_SECRET");
  const header = { alg: "HS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const body = { ...payload, iat: now, exp: now + expSeconds };
  const h = b64url(JSON.stringify(header));
  const p = b64url(JSON.stringify(body));
  const sig = crypto.createHmac("sha256", secret).update(h + "." + p).digest();
  return `${h}.${p}.${b64url(sig)}`;
};
const verifyJWT = (token) => {
  const secret = requireEnv("JWT_SECRET");
  const parts = String(token || "").split(".");
  if (parts.length !== 3) return null;
  const [h, p, s] = parts;
  const sig = crypto.createHmac("sha256", secret).update(h + "." + p).digest();
  if (b64url(sig) !== s) return null;
  const payload = JSON.parse(Buffer.from(p.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8"));
  const now = Math.floor(Date.now() / 1000);
  if (payload.exp && payload.exp < now) return null;
  return payload;
};

const getBearer = (event) => {
  const a = event.headers.authorization || event.headers.Authorization || "";
  const m = /^Bearer\s+(.+)$/i.exec(a);
  return m ? m[1].trim() : "";
};

const requireUser = async (event) => {
  const token = getBearer(event);
  const payload = verifyJWT(token);
  if (!payload?.uid) throw new Error("UNAUTHORIZED");
  const rows = await sb(`users?select=*&id=eq.${payload.uid}`);
  const user = rows?.[0];
  if (!user || user.is_banned) throw new Error("UNAUTHORIZED");
  return user;
};

const adminGuard = (event) => {
  const expected = process.env.ADMIN_PIN;
  if (!expected) return true;
  const got = (event.headers["x-admin-pin"] || event.headers["X-Admin-Pin"] || "").trim();
  return got && got === expected.trim();
};

const log = async (actor, action, target = null, payload = null) => {
  try { await sb("audit_logs", { method: "POST", body: { actor, action, target, payload } }); } catch (e) {}
};

module.exports = { json, sb, adminGuard, hashPassword, verifyPassword, signJWT, requireUser, log };
