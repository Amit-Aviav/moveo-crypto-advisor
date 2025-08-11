import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { myVotes, upsertVote } from "../controllers/votesController";

const router = Router();

router.get("/me", requireAuth, myVotes);  // GET /api/votes/me
router.post("/", requireAuth, upsertVote); // POST /api/votes

export default router;
