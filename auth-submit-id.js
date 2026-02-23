const { json, sb, requireUser, log } = require("./_common");
exports.handler = async (event) => {
  try {
    const u = await requireUser(event);
    const body = JSON.parse(event.body || "{}");
    const image = String(body.image || "");
    if (!image.startsWith("data:image/")) return json(400, { ok:false, error:"BAD_IMAGE" });
    if (image.length > 1800000) return json(413, { ok:false, error:"IMAGE_TOO_LARGE" });
    await sb(`users?id=eq.${u.id}`, { method: "PATCH", body: { student_id_image: image, verify_status: "pending", updated_at: new Date().toISOString() }, headers: { prefer:"return=minimal" } });
    await log("user", "submit_student_id", u.id, { len: image.length });
    return json(200, { ok:true });
  } catch (e) {
    return json(401, { ok:false, error:"UNAUTHORIZED" });
  }
};
