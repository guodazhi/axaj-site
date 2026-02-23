const { json, sb, adminGuard, log } = require("./_common");
const genId = () => "xatu-" + Math.random().toString(36).slice(2, 8) + "-" + Date.now().toString(36);
exports.handler = async (event) => {
  try {
    if (!adminGuard(event)) return json(401, { ok:false, error:"UNAUTHORIZED" });
    const body = JSON.parse(event.body || "{}");
    const id = (body.id && String(body.id).trim()) || genId();
    const row = {
      id,
      code: body.code || null,
      title: body.title,
      type: body.type,
      status: body.status,
      area_sqm: Number(body.area_sqm || 0),
      rooms: Number(body.rooms || 0),
      rent: Number(body.rent || 0),
      map_area: body.map_area || null,
      facilities: body.facilities || [],
      images: body.images || [],
      video_url: body.video_url || null,
      desc: body.desc || null,
      updated_at: new Date().toISOString(),
    };
    if (!row.title || !row.type || !row.status || !row.rent || !row.area_sqm || !row.rooms) return json(400, { ok:false, error:"BAD_REQUEST" });
    const created = await sb("listings?on_conflict=id", { method:"POST", body: row, headers: { prefer:"resolution=merge-duplicates,return=representation" } });
    await log("admin", "upsert_listing", id, { status: row.status });
    return json(200, { ok:true, id, item: created?.[0] || row });
  } catch (e) {
    return json(500, { ok:false, error: String(e.message || e) });
  }
};
