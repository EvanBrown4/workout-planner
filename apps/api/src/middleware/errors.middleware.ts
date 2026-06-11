import type { Request, Response, NextFunction } from "express";

export class AppError extends Error {
  constructor(public message: string, public status: number = 400) {
    super(message);
  }
}

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error(err.message);
  const status = err instanceof AppError ? err.status : 500;
  res.status(status).json({ message: err.message });
}