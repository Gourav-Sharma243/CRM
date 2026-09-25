import { Router } from "express";
import {
    registerUser, loginUser, getMe, updateProfile,
} from "../controllers/auth.controller.js";
import {authenticateUser} from "../middleware/auth.middleware.js";

const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", authenticateUser, getMe);
router.put("/me", authenticateUser, updateProfile);

export default router;
