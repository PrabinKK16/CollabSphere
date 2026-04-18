import {
  register,
  login,
  logout,
  refreshAccessToken,
  getCurrentUser,
  changePassword,
  updateProfile,
  forgotPassword,
  resetPassword,
} from "../controllers/auth.controller.js";
import { Router } from "express";
import { verifyJWT } from "../middlewares/verifyJWT.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refreshAccessToken);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

router.use(verifyJWT);

router.post("/logout", logout);
router.get("/me", getCurrentUser);
router.patch("/profile", updateProfile);
router.patch("/change-password", changePassword);

export default router;
