import { Router } from "express";
import {
    registerUser, loginUser, getMe, updateProfile,
} from "../controllers/auth.controller.js";
import { authenticateUser } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

// Profile routes (support both /me and /profile)
router.get("/me", authenticateUser, getMe);
router.put("/me", authenticateUser, updateProfile);
router.get("/profile", authenticateUser, getMe);
router.put("/profile", authenticateUser, updateProfile);

export default router;
