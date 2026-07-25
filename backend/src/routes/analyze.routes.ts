import { Router } from 'express';
import { analyzeUrl } from '../controllers/analyze.controller';
import { analyzeValidationRules, handleValidationErrors } from '../middleware/validators';

const router = Router();

// POST /api/analyze — body: { url: string }
router.post('/analyze', analyzeValidationRules, handleValidationErrors, analyzeUrl);

export default router;
