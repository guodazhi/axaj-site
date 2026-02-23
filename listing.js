const { json, sb, requireUser } = require("./_common");
exports.handler = async (event) => {
  try {
    const id = (event.queryStringParameters?.id || "").trim();
    if (!id) return json(400, { ok:false, error:"BAD_REQUEST" });
    const u = await requireUser(event);
    if ((u.verify_status||"unverified") !== "verified") return json(403, { ok:false, error:"NOT_VERIFIED" });
    const rows = await sb(`listings?select=*&id=eq.${encodeURIComponent(id)}`);
    return json(200, { ok:true, item: rows?.[0] || null });
  } catch (e) {
    const msg = String(e.message || e);
    if (msg.includes("UNAUTHORIZED")) return json(401, { ok:false, error:"UNAUTHORIZED" });
    return json(500, { ok:false, error: msg });
  }
};
