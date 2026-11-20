import { prisma } from "../config/database.js";

class otpEmailRepository {
  // unique (email, purpose): gửi lại OTP thì ghi đè bản ghi cũ
  upsert(email: string, purpose: string, otpHash: string, expiresAt: Date) {
    return prisma.otp_email.upsert({
      where: { email_purpose: { email, purpose } },
      create: { email, purpose, otp_hash: otpHash, expires_at: expiresAt },
      update: {
        otp_hash: otpHash,
        expires_at: expiresAt,
        created_at: new Date(),
      },
    });
  }

  // Xóa OTP nếu khớp hash và chưa hết hạn. Một câu lệnh nguyên tử nên
  // OTP chỉ dùng được một lần. Trả về true nếu có bản ghi bị xóa.
  async consume(email: string, purpose: string, otpHash: string) {
    const { count } = await prisma.otp_email.deleteMany({
      where: {
        email,
        purpose,
        otp_hash: otpHash,
        expires_at: { gt: new Date() },
      },
    });
    return count > 0;
  }
}
export default new otpEmailRepository();
