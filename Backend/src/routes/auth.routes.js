import {
  register,
  login,
  logout,
  refreshAccessToken,
  getCurrentUser,
  changePassword,
} from "../controllers/auth.controller.js";
import { Router } from "express";
import { verifyJWT } from "../middlewares/verifyJWT.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refreshAccessToken);
router.post("/logout", verifyJWT, logout);
router.get("/me", verifyJWT, getCurrentUser);
router.patch("/change-password", verifyJWT, changePassword);

export default router;
