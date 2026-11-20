import { rateLimit } from "express-rate-limit";
import { AppError } from "../service/AppError.js";

// API gửi OTP qua email: tối đa 3 lần / phút / IP để chống spam mail.
export const sendOtpLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 3,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  handler: (_req, _res, next) => {
    next(
      new AppError(429, {
        message: "Bạn gửi quá nhiều yêu cầu, vui lòng thử lại sau 1 phút",
      }),
    );
  },
});
