import { Router } from "express";
import { requireAuth } from "../middleware/auth";
// NOTE: use a namespace import to avoid named-export mismatch issues
import * as dashboard from "../controllers/dashboardController";

const router = Router();

// Debug once on boot — should print "function"
console.log("[dashboardRoutes] typeof requireAuth:", typeof requireAuth);
console.log("[dashboardRoutes] typeof getDashboard:", typeof dashboard.getDashboard);

router.get("/", requireAuth, dashboard.getDashboard);

export default router;
