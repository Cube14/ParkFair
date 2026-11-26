const router = require("express").Router();
const { rateLimit } = require("express-rate-limit");
const { login, me, refresh, logout, listSessions, revokeSession, createResidentAccount, resetResidentPassword, toggleResidentStatus } =
  require("../controllers/authController");
const { authenticate, requireRole } = require("../middleware/authMiddleware");
const { validateIds } = require("../middleware/validateRequest");

const limitLogin = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { success: false, message: "Too many sign-in attempts. Try again later." },
});
router.post("/login", limitLogin, login);
router.get("/me", authenticate, me);
router.post("/refresh", rateLimit({
  windowMs: 60000, limit: 120, standardHeaders: "draft-8", legacyHeaders: false,
  message: { success: false, message: "Too many session requests. Try again later." },
}), refresh);
router.post("/logout", logout);
router.get("/sessions", authenticate, listSessions);
router.delete("/sessions/:id", authenticate, validateIds("id"), revokeSession);
router.use("/resident", authenticate, requireRole("ADMIN"));
router.post("/resident", createResidentAccount);
router.put("/resident/:id/password", validateIds("id"), resetResidentPassword);
router.put("/resident/:id/toggle", validateIds("id"), toggleResidentStatus);
module.exports = router;
