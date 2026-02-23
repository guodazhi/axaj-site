const { json, requireUser } = require("./_common");
exports.handler = async (event) => {
  try {
    const u = await requireUser(event);
    delete u.password_hash;
    return json(200, { ok: true, user: u });
  } catch (e) {
    return json(401, { ok: false, error: "UNAUTHORIZED" });
  }
};
