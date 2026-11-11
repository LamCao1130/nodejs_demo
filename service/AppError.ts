import type { ErrorRequestHandler, RequestHandler } from "express";

// Lỗi nghiệp vụ: chỉ cần `throw new AppError(status, body)` ở bất kỳ đâu
// (service, controller, middleware) -> errorHandler sẽ trả thẳng về client.
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

const toBody = (body: unknown) =>
  typeof body === "string" ? { message: body } : body;

// Error middleware toàn cục (đăng ký SAU router trong index.ts).
// Express 5 tự đẩy lỗi từ handler async vào đây nên controller không cần try/catch.
export const errorHandler: ErrorRequestHandler = (err, _req, res, next) => {
  if (res.headersSent) return next(err);

  if (err instanceof AppError) {
    return res.status(err.status).json(toBody(err.body));
  }

  const status = (err as { status?: unknown })?.status;
  if (typeof status === "number" && status >= 400 && status < 500) {
    return res.status(status).json({ message: (err as Error).message });
  }

  console.error("Unhandled error:", err);
  return res.status(500).json({ message: "Internal server error" });
};

export const notFoundHandler: RequestHandler = (req, _res, next) => {
  next(new AppError(404, { message: `Not found: ${req.method} ${req.path}` }));
};
