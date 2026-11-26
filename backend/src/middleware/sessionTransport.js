const { ApiError } = require("./apiErrors");

const name = "__Host-parkfair-refresh";
const cookieOptions = { httpOnly: true, secure: true, sameSite: "strict", path: "/" };

function transport(req, allowLegacy = false) {
  const client = req.get("X-ParkFair-Session");
  const origin = req.get("Origin");
  if (!client && allowLegacy) return null;
  if (client === "native" && !origin) return client;
  const origins = (process.env.WEB_ORIGINS ?? "").split(",").map((value) => value.trim());
  if (client === "web" && origin && origins.includes(origin)) return client;
  throw new ApiError(403, "Session request origin or transport is not allowed.");
}

function readRefresh(req, client) {
  if (client === "native") return req.body?.refreshToken;
  return req.get("Cookie")?.split(";").map((entry) => entry.trim())
    .find((entry) => entry.startsWith(name + "="))?.slice(name.length + 1);
}

function writeSession(res, client, session, publicUser) {
  const { token, refreshToken, user, family } = session;
  if (client === "web") res.cookie(name, refreshToken, { ...cookieOptions, expires: family.expiresAt });
  res.json({
    success: true, token, user: publicUser(user), sessionId: family.id,
    ...(client === "native" && { refreshToken }),
  });
}

function clearWebSession(res, client) {
  if (client === "web") res.clearCookie(name, cookieOptions);
}

module.exports = { transport, readRefresh, writeSession, clearWebSession };
