import {Router} from "express";
import {getOverview} from "../controllers/analytics.controller.js";
import {authenticateUser} from "../middleware/auth.middleware.js";

const router = Router();
router.use(authenticateUser);

router.get("/overview", getOverview);

export default router;