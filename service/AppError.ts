import type { Response } from "express";

// Lỗi nghiệp vụ do service ném ra; controller chỉ việc map sang HTTP response.
export class AppError extends Error {
  constructor(
    public status: number,
    public body: unknown,
  ) {
    super(
      typeof body === "string"
        ? body
        : ((body as { message?: string } | null)?.message ?? "Error"),
    );
  }
}

// Controller dùng hàm này: AppError -> status/body của nó, lỗi khác -> fallback.
export const sendError = (
  res: Response,
  err: unknown,
  fallbackStatus: number,
  fallbackBody: unknown,
) => {
  if (err instanceof AppError) {
    return res.status(err.status).json(err.body);
  }
  return res.status(fallbackStatus).json(fallbackBody);
};
