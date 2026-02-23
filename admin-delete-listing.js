const { json, sb, adminGuard, log } = require("./_common");
exports.handler = async (event) => {
  try {
    if (!adminGuard(event)) return json(401, { ok:false, error:"UNAUTHORIZED" });
    const body = JSON.parse(event.body || "{}");
    const id = String(body.id || "").trim();
    if (!id) return json(400, { ok:false, error:"BAD_REQUEST" });
    await sb(`listings?id=eq.${encodeURIComponent(id)}`, { method:"DELETE", headers: { prefer:"return=minimal" } });
    await log("admin", "delete_listing", id, null);
    return json(200, { ok:true });
  } catch (e) {
    return json(500, { ok:false, error: String(e.message || e) });
  }
};
