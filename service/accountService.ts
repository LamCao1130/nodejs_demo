import bcrypt from "bcrypt";
import type { z } from "zod";
import type { RegisterSchema } from "../schema/accountSchema.js";
import { accountRepository } from "../repository/accountRepository.js";
import tokenRepository from "../repository/tokenRepository.js";
import {
  createAccessToken,
  createRefreshToken,
  verifyRefreshToken,
} from "../midlewareConfig/jwtAuthencation.js";
import { AppError } from "./AppError.js";

// Hash hợp lệ (cost 10) dùng để so sánh giả khi email không tồn tại
const DUMMY_HASH =
  "$2b$10$CwTycUXWue0Thq9StjUM0uJ8.2hVq6s0yG5Zx5y8H1c8y3w7kq0e2";

class AccountService {
  async register(input: z.infer<typeof RegisterSchema>) {
    const hashedPassword = await bcrypt.hash(input.password, 10);
    const created = await accountRepository.createAccount({
      ...input,
      password: hashedPassword,
    });
    return { id: created.id };
  }

  async login(body: unknown) {
    const { email, password } = (body ?? {}) as {
      email?: unknown;
      password?: unknown;
    };
    if (
      typeof email !== "string" ||
      email.trim() === "" ||
      typeof password !== "string" ||
      password === ""
    ) {
      throw new AppError(400, { message: "Thiếu email hoặc mật khẩu" });
    }
    const account = await accountRepository.getAccountByEmail(email);
    // Luôn chạy bcrypt.compare (kể cả khi không có account) để thời gian phản hồi
    // không lộ email nào tồn tại.
    const ok = await bcrypt.compare(
      password,
      account?.password ?? DUMMY_HASH,
    );
    if (!account || !ok) {
      throw new AppError(401, { message: "Sai email hoặc mật khẩu" });
    }
    // Chỉ báo khoá sau khi đã xác thực đúng mật khẩu
    if (!account.is_active) {
      throw new AppError(403, {
        message: "Tài khoản đã bị khoá, vui lòng liên hệ admin",
      });
    }
    const accessToken = createAccessToken(account);
    const refreshToken = createRefreshToken(account);
    await tokenRepository.saveRefreshToken(account, refreshToken);
    return {
      accessTokenNodeRe: accessToken,
      refreshTokenNodeRe: refreshToken,
    };
  }

  async refreshAccessToken(refreshToken?: string) {
    if (!refreshToken) {
      throw new AppError(401, { message: "Refresh token is required" });
    }
    const invalid = new AppError(401, {
      message: "Refresh token is invalid or expired",
    });

    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch {
      throw invalid;
    }

    const storedToken = await tokenRepository.findValidRefreshToken(
      decoded.accountId,
      refreshToken,
    );
    if (!storedToken || storedToken.is_revoked) {
      throw invalid;
    }

    const account = await accountRepository.getAccountById(
      storedToken.account_id,
    );
    if (!account || account.is_active === false) {
      throw new AppError(401, { message: "Account is disabled" });
    }

    return { accessToken: createAccessToken(account) };
  }

  async logout(refreshToken?: string) {
    if (!refreshToken) {
      throw new AppError(401, { message: "Refresh token is required" });
    }
    await tokenRepository.deleteRefreshToken(refreshToken);
    return { message: "logout success" };
  }
}

export default new AccountService();
