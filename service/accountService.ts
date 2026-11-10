import bcrypt from "bcrypt";
import { z } from "zod";
import { accountRepository } from "../repository/accountRepository.js";
import tokenRepository from "../repository/tokenRepository.js";
import {
  createAccessToken,
  createRefreshToken,
  verifyRefreshToken,
} from "../midlewareConfig/jwtAuthencation.js";
import { AppError } from "./AppError.js";

const RegisterSchema = z.object({
  username: z.string(),
  email: z.string().email(),
  password: z.string().min(6),
  full_name: z.string().max(100).optional(),
});

class AccountService {
  async register(body: unknown) {
    const parsed = RegisterSchema.safeParse(body);
    if (!parsed.success) {
      throw new AppError(400, {
        message: "Dữ liệu không hợp lệ",
        errors: parsed.error.issues.map((i) => ({
          field: i.path.join("."),
          message: i.message,
        })),
      });
    }
    const input = parsed.data;
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
    if (!account) {
      throw new AppError(404, { message: "sai mật khẩu hoặc tài khoản" });
    }
    if (!account.is_active) {
      throw new AppError(403, "tài khoản đã bị khóa vui lòng liên hệ admin");
    }
    const isMatch = await bcrypt.compare(password, account.password);
    if (!isMatch) {
      throw new AppError(404, { message: "sai mật khẩu hoặc tài khoản" });
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
