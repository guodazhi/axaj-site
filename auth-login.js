const { json, sb, verifyPassword, signJWT, log } = require("./_common");
exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body || "{}");
    const phone = String(body.phone || "").trim();
    const password = String(body.password || "");
    if (!phone || !password) return json(400, { ok: false, error: "BAD_REQUEST" });
    const rows = await sb(`users?select=*&phone=eq.${encodeURIComponent(phone)}`);
    const user = rows?.[0];
    if (!user) return json(401, { ok: false, error: "INVALID_CREDENTIALS" });
    if (user.is_banned) return json(403, { ok: false, error: "BANNED" });
    if (!verifyPassword(password, user.password_hash)) return json(401, { ok: false, error: "INVALID_CREDENTIALS" });
    const token = signJWT({ uid: user.id });
    await log("user", "login", user.id, null);
    return json(200, { ok: true, token });
  } catch (e) {
    return json(500, { ok: false, error: String(e.message || e) });
  }
};
