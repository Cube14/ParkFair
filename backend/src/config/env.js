function validateEnv(env, { localDevelopment = false } = {}) {
  const invalid = [];
  const mongoPattern = localDevelopment
    ? /^mongodb:\/\/(?:127\.0\.0\.1|localhost):\d{1,5}\/parkfair_dev(?:_[a-z0-9_]+)?(?:\?.*)?$/
    : /^mongodb(?:\+srv)?:\/\//;
  if (!mongoPattern.test(env.MONGODB_URI ?? "")) invalid.push("MONGODB_URI");
  if (Buffer.byteLength(env.JWT_SECRET ?? "", "utf8") < 32) invalid.push("JWT_SECRET");
  const port = Number(env.PORT ?? 5000);
  if (!Number.isInteger(port) || port < 1 || port > 65535) invalid.push("PORT");
  if ((localDevelopment && env.NODE_ENV !== "development") ||
      (env.NODE_ENV && !["development", "test", "production"].includes(env.NODE_ENV))) {
    invalid.push("NODE_ENV");
  }
  for (const key of ["WHATSAPP_ENABLED", "WHATSAPP_SEND_APPROVED", "ENABLE_DEV_RESETS"]) {
    if (env[key] !== undefined && !["true", "false"].includes(env[key])) invalid.push(key);
  }
  if (env.WEB_ORIGINS?.split(",").some((entry) => {
    try {
      const url = new URL(entry.trim());
      return !["http:", "https:"].includes(url.protocol) || url.origin !== entry.trim();
    } catch {
      return true;
    }
  })) invalid.push("WEB_ORIGINS");

  if (invalid.length) throw new Error(`Invalid or missing environment settings: ${invalid.join(", ")}.`);
  return port;
}
module.exports = validateEnv;
