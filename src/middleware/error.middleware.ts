import type {
  Request,
  Response,
  NextFunction,
  ErrorRequestHandler,
} from "express";

class AppError extends Error {
  public readonly statusCode: number;
  public readonly expose: boolean;
  constructor(message: string, statusCode = 500, expose = statusCode < 500) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.expose = expose;
  }
}

const errorHanlder: ErrorRequestHandler = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (res.headersSent) return next(err);

  const error = err instanceof Error ? err : new Error(String(err));
  const appError = err instanceof AppError ? err : undefined;

  const statusCode = appError?.statusCode ?? 500;

  console.error({
    message: error.message,
    stack: error.stack,
    method: req.method,
    path: req.path,
  });

  return res.status(statusCode).json({
    success: false,
    message: appError?.expose ? appError.message : "Internal server error",
  });
};

export { AppError, errorHanlder };
