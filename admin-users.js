const { json, sb, adminGuard } = require("./_common");
exports.handler = async (event) => {
  try {
    if (!adminGuard(event)) return json(401, { ok:false, error:"UNAUTHORIZED" });
    const rows = await sb("users?select=id,name,phone,school,verify_status,student_id_image,is_banned,created_at&order=created_at.desc");
    return json(200, { ok:true, items: rows || [] });
  } catch (e) {
    return json(500, { ok:false, error: String(e.message || e) });
  }
};
