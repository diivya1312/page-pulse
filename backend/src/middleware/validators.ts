import { NextFunction, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { AppError } from '../types';

/**
 * Validation chain for POST /api/analyze.
 * Checks shape/presence only — deep URL semantics are handled by
 * normalizeAndValidateUrl() in the service layer, keeping this middleware
 * focused on "is the request well-formed" per single-responsibility.
 */
export const analyzeValidationRules = [
  body('url')
    .exists({ checkFalsy: true })
    .withMessage('The "url" field is required.')
    .bail()
    .isString()
    .withMessage('The "url" field must be a string.')
    .bail()
    .isLength({ max: 2048 })
    .withMessage('The "url" field must be 2048 characters or fewer.'),
];

/** Converts express-validator errors into our uniform AppError shape. */
export function handleValidationErrors(req: Request, _res: Response, next: NextFunction): void {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    const firstError = result.array()[0];
    next(new AppError('VALIDATION_ERROR', firstError.msg, 400));
    return;
  }
  next();
}
