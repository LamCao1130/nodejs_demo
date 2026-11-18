import type { NextFunction, Request, Response } from "express";
import type { ZodType } from "zod";
import { AppError } from "../service/AppError.js";

type Schemas = {
  body?: ZodType;
  params?: ZodType;
  query?: ZodType;
};

const parts = ["body", "params", "query"] as const;

// Middleware dùng chung: validate body / params / query theo zod schema.
// Dữ liệu sau khi parse (đã loại bỏ field lạ) sẽ ghi đè lại req để controller/service
// chỉ nhận được đúng những field đã khai báo trong schema.
export const validate = (schemas: Schemas) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const errors: { in: string; field: string; message: string }[] = [];

    for (const part of parts) {
      const schema = schemas[part];
      if (!schema) continue;

      const parsed = schema.safeParse(req[part]);
      if (!parsed.success) {
        errors.push(
          ...parsed.error.issues.map((i) => ({
            in: part,
            field: i.path.join("."),
            message: i.message,
          })),
        );
        continue;
      }
      // Express 5: req.query là getter nên phải defineProperty thay vì gán trực tiếp
      Object.defineProperty(req, part, {
        value: parsed.data,
        writable: true,
        configurable: true,
        enumerable: true,
      });
    }

    if (errors.length > 0) {
      return next(new AppError(400, { message: "Dữ liệu không hợp lệ", errors }));
    }
    next();
  };
};
