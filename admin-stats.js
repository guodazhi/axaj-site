const { json, sb, adminGuard } = require("./_common");
exports.handler = async (event) => {
  try {
    if (!adminGuard(event)) return json(401, { ok:false, error:"UNAUTHORIZED" });
    const listings = await sb("listings?select=status");
    const users = await sb("users?select=verify_status");
    const reqs = await sb("view_requests?select=status");
    const count = (arr, pred) => arr.filter(pred).length;
    return json(200, {
      listings_total: listings.length,
      listings_empty: count(listings, x => x.status === "空置"),
      listings_reserved: count(listings, x => x.status === "已预约"),
      listings_rented: count(listings, x => x.status === "已租"),
      users_total: users.length,
      users_verified: count(users, x => x.verify_status === "verified"),
      users_pending: count(users, x => x.verify_status === "pending"),
      requests_total: reqs.length,
      requests_pending: count(reqs, x => x.status === "pending"),
    });
  } catch (e) {
    return json(500, { ok:false, error: String(e.message || e) });
  }
};
