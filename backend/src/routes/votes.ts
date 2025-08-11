import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { upsertVote, myVotes } from "../controllers/votesController";

const router = Router();

router.post("/", requireAuth, upsertVote);        // upsert a vote
router.get("/me", requireAuth, myVotes);          // (optional) list my votes
router.post("/summary", requireAuth); // totals for items

export default router;
