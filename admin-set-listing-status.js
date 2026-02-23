const { json, sb, adminGuard, log } = require("./_common");
exports.handler = async (event) => {
  try {
    if (!adminGuard(event)) return json(401, { ok:false, error:"UNAUTHORIZED" });
    const body = JSON.parse(event.body || "{}");
    const id = String(body.id || "").trim();
    const status = String(body.status || "").trim();
    if (!id || !status) return json(400, { ok:false, error:"BAD_REQUEST" });
    await sb(`listings?id=eq.${encodeURIComponent(id)}`, { method:"PATCH", body: { status, updated_at: new Date().toISOString() }, headers: { prefer:"return=minimal" } });
    await log("admin", "set_listing_status", id, { status });
    return json(200, { ok:true });
  } catch (e) {
    return json(500, { ok:false, error: String(e.message || e) });
  }
};
