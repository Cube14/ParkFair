const jwt = require("jsonwebtoken");
const { isObjectIdOrHexString } = require("mongoose");
const User = require("../models/User");

async function authenticate(req, res, next) {
  const header = req.get("authorization");
  let claims;
  try {
    if (!header?.startsWith("Bearer ")) throw new Error();
    claims = jwt.verify(header.slice(7), process.env.JWT_SECRET, {
      algorithms: ["HS256"],
    });
    if (!claims?.exp || !isObjectIdOrHexString(claims.id)) throw new Error();
  } catch {
    return res.status(401).json({ success: false, message: "Sign-in required." });
  }

  const user = await User.findById(claims.id)
    .select("role flatId isActive +sessionVersion")
    .lean();
  if (!user) {
    return res.status(401).json({ success: false, message: "Sign-in required." });
  }
  if (user.isActive === false) {
    return res.status(403).json({ success: false, code: "ACCOUNT_DISABLED", message: "Account disabled." });
  }
  if ((user.sessionVersion ?? 0) !== (claims.version ?? 0)) {
    return res.status(401).json({ success: false, message: "Sign-in required." });
  }
  req.user = { id: user._id, role: user.role, flatId: user.flatId };
  next();
}

function requireRole(role) {
  return (req, res, next) => {
    if (req.user.role !== role) {
      return res.status(403).json({ success: false, message: "Access denied." });
    }
    next();
  };
}

module.exports = { authenticate, requireRole };
