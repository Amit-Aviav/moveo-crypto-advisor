import { Response } from "express";
import type { AuthedRequest } from "../middleware/auth";
import { prisma } from "../utils/prisma";

const ALLOWED = new Set(["news","price","insight","meme"]);

export async function upsertVote(req: AuthedRequest, res: Response) {
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });
  const { type, itemId, value } = req.body ?? {};
  if (!ALLOWED.has(String(type)) || !itemId || ![1,-1].includes(Number(value))) {
    return res.status(400).json({ ok:false, error:"Invalid vote" });
  }

  const existing = await prisma.vote.findFirst({
    where: { userId: req.user.id, type: String(type), itemId: String(itemId) },
  });

  const vote = existing
    ? await prisma.vote.update({ where: { id: existing.id }, data: { value: Number(value) } })
    : await prisma.vote.create({ data: { userId: req.user.id, type, itemId, value: Number(value) } });

  return res.status(201).json({ ok:true, vote });
}

export async function myVotes(req: AuthedRequest, res: Response) {
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });
  const votes = await prisma.vote.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: "desc" },
  });
  return res.json({ ok:true, votes });
}
