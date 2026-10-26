import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';

export const summarizeSchema = z.object({
  text: z.string()
    .min(20, 'Input text must be at least 20 characters long.')
    .max(50000, 'Input text cannot exceed 50,000 characters.'),
  mode: z.enum(['executive', 'key-points', 'technical', 'brief']).optional(),
  maxLengthWords: z.number().positive().max(1000).optional()
});

export const researchSchema = z.object({
  topic: z.string()
    .min(3, 'Topic must be at least 3 characters long.')
    .max(300, 'Topic cannot exceed 300 characters.'),
  focusArea: z.string().max(200).optional(),
  depth: z.enum(['standard', 'deep']).optional()
});

export function validateBody<T>(schema: z.ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (err: any) {
      if (err instanceof ZodError) {
        res.status(400).json({
          error: 'Validation failed',
          issues: err.issues.map(e => ({ path: e.path.join('.'), message: e.message }))
        });
        return;
      }
      res.status(400).json({ error: 'Malformed request body' });
    }
  };
}
