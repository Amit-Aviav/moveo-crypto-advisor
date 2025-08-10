// backend/src/routes/preferences.ts
import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { getMyPreferences, upsertMyPreferences } from '../controllers/preferencesController'; 

const preferencesRouter = Router();
preferencesRouter.get('/me', requireAuth, getMyPreferences);
preferencesRouter.post('/', requireAuth, upsertMyPreferences);
export default preferencesRouter;
