const { json, sb, adminGuard } = require("./_common");
exports.handler = async (event) => {
  try {
    if (!adminGuard(event)) return json(401, { ok:false, error:"UNAUTHORIZED" });
    const rows = await sb("listings?select=*&order=created_at.desc");
    return json(200, { ok:true, items: rows || [] });
  } catch (e) {
    return json(500, { ok:false, error: String(e.message || e) });
  }
};
