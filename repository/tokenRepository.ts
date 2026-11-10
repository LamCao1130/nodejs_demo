import { prisma } from "../config/database.js";
import crypto from "node:crypto";

class TokenRepository {
  async saveRefreshToken(account: { id: number }, token: string) {
    const refreshTokenExpiresAt = new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000,
    );

    return prisma.refresh_token.create({
      data: {
        account_id: account.id,
        token: this.hashToken(token),
        expires_at: refreshTokenExpiresAt,
        is_revoked: false,
      },
    });
  }

  async findValidRefreshToken(accountId: number, token: string) {
    return prisma.refresh_token.findFirst({
      where: {
        account_id: accountId,
        token: this.hashToken(token),
        is_revoked: false,
        expires_at: {
          gt: new Date(),
        },
      },
    });
  }

  async deleteRefreshToken(refreshToken: string) {
    return prisma.refresh_token.delete({
      where: {
        token: this.hashToken(refreshToken),
      },
    });
  }

  hashToken(token: string) {
    return crypto.createHash("sha256").update(token).digest("hex");
  }
}
export default new TokenRepository();
