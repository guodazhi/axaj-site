const { json, sb, hashPassword, log } = require("./_common");
exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body || "{}");
    const name = String(body.name || "").trim();
    const phone = String(body.phone || "").trim();
    const password = String(body.password || "");
    const school = String(body.school || "").trim() || null;
    if (!name || !phone || password.length < 6) return json(400, { ok: false, error: "BAD_REQUEST" });
    const hp = hashPassword(password);
    await sb("users", { method: "POST", body: { name, phone, school, password_hash: hp.hash, verify_status: "unverified", is_banned: false } });
    await log("user", "register", null, { phone });
    return json(200, { ok: true });
  } catch (e) {
    const msg = String(e.message || e);
    if (msg.includes("duplicate key")) return json(409, { ok: false, error: "PHONE_EXISTS" });
    return json(500, { ok: false, error: msg });
  }
};
