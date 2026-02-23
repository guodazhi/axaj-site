const { json } = require("./_common");
exports.handler = async () => {
  const ok = !!(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.JWT_SECRET);
  return json(200, { ok: true, mode: ok ? "api" : "local" });
};
