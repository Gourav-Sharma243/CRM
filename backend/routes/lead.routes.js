import {Router} from "express";
import {
    getLeads, getLeadById, createLead, updateLead, deleteLead, reorderLeads
} from "../controllers/lead.controller.js";
import {authenticateUser} from "../middleware/auth.middleware.js";

const router = Router();

router.use(authenticateUser);
router.patch("/reorder", reorderLeads);
router.route("/").get(getLeads).post(createLead);
router.route("/:id").get(getLeadById).put(updateLead).delete(deleteLead);

export default router;