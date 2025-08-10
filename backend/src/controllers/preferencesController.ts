// backend/src/controllers/preferencesController.ts
import { Response } from 'express';
import { prisma } from '../utils/prisma';
import { AuthedRequest } from '../middleware/auth';

function asStringArray(v: unknown): string[] {
  if (Array.isArray(v)) return v.map(String);
  if (typeof v === 'string') return [v];
  return [];
}

// GET /api/preferences/me
export async function getMyPreferences(req: AuthedRequest, res: Response) {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const prefs = await prisma.preference.findUnique({
      where: { userId: req.user.id },
    });

    res.status(200).json({ ok: true, preferences: prefs ?? null });
  } catch (err) {
    console.error('[getMyPreferences]', err);
    res.status(500).json({ ok: false, error: 'Failed to fetch preferences' });
  }
}

// POST /api/preferences
export async function upsertMyPreferences(req: AuthedRequest, res: Response) {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const investorType = String(req.body?.investorType ?? '').trim();
    const assets = asStringArray(req.body?.assets);
    const contentTypes = asStringArray(req.body?.contentTypes);

    if (!investorType) {
      res.status(400).json({ ok: false, error: 'investorType is required' });
      return;
    }

    const saved = await prisma.preference.upsert({
      where: { userId: req.user.id },
      create: { userId: req.user.id, investorType, assets, contentTypes },
      update: { investorType, assets, contentTypes },
    });

    res.status(201).json({ ok: true, preferences: saved });
  } catch (err) {
    console.error('[upsertMyPreferences]', err);
    res.status(500).json({ ok: false, error: 'Failed to save preferences' });
  }
}
