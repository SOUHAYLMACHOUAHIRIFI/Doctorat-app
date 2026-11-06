import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Handle Zod validation errors
  if (err instanceof ZodError) {
    const errorDetails = err.issues.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));

    res.status(400).json({
      success: false,
      message: errorDetails[0]?.message || 'Données fournies non valides.',
      errors: errorDetails,
    });
    return;
  }

  // Handle generic / server errors without leaking stack traces in production
  console.error('Unhandled Server Error:', err);
  const status = typeof err.status === 'number' ? err.status : 500;
  res.status(status).json({
    success: false,
    message: err.message || 'Une erreur interne est survenue sur le serveur.',
  });
};
