const { json, sb, requireUser, log } = require("./_common");
exports.handler = async (event) => {
  try {
    const u = await requireUser(event);
    if ((u.verify_status||"unverified") !== "verified") return json(403, { ok:false, error:"NOT_VERIFIED" });
    const body = JSON.parse(event.body || "{}");
    const listing_id = String(body.listing_id || "").trim();
    const name = String(body.name || "").trim();
    const phone = String(body.phone || "").trim();
    const prefer_time = String(body.prefer_time || "").trim() || null;
    const note = String(body.note || "").trim() || null;
    if (!listing_id || !name || !phone) return json(400, { ok:false, error:"BAD_REQUEST" });
    const lr = await sb(`listings?select=code&id=eq.${encodeURIComponent(listing_id)}`);
    const listing_code = lr?.[0]?.code || listing_id;
    await sb("view_requests", { method:"POST", body: { listing_id, listing_code, user_id: u.id, name, phone, prefer_time, note, status:"pending" } });
    await log("user", "create_view_request", u.id, { listing_id });
    return json(200, { ok:true });
  } catch (e) {
    const msg = String(e.message || e);
    if (msg.includes("UNAUTHORIZED")) return json(401, { ok:false, error:"UNAUTHORIZED" });
    return json(500, { ok:false, error: msg });
  }
};
