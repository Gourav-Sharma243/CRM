import {Router} from 'express';
import {
    aiStatus,
    leadSummary,
    generateEmailDraft,
    salesInsights
} from "../controllers/ai.controller.js";
import {authenticateUser} from "../middleware/auth.middleware.js";

const router = Router();
router.use(authenticateUser);

router.get("/status", aiStatus);
router.post("/lead-summary", leadSummary);
router.post("/generate-email", generateEmailDraft);
router.post("/sales-insights", salesInsights);

export default router;
