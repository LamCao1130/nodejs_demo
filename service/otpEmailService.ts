import crypto from "node:crypto";
import otpEmailRepository from "../repository/otpEmailRepository.js";

export const OTP_PURPOSE_CREATE_TEACHER = "CREATE_TEACHER";
const OTP_TTL_MS = 60 * 1000; // 1 phút

class OtpEmailService {
  private hash(otp: string) {
    return crypto.createHash("sha256").update(otp).digest("hex");
  }

  // Tạo (hoặc ghi đè) OTP cho email, trả về OTP gốc để gửi mail
  async createOtp(email: string, purpose: string) {
    const otp = crypto.randomBytes(4).toString("hex");
    const expiresAt = new Date(Date.now() + OTP_TTL_MS);
    await otpEmailRepository.upsert(email, purpose, this.hash(otp), expiresAt);
    return otp;
  }

  // true nếu OTP đúng và còn hạn (đồng thời xóa luôn để không dùng lại được)
  async verifyOtp(email: string, purpose: string, otp: string) {
    return otpEmailRepository.consume(email, purpose, this.hash(otp));
  }
}

export default new OtpEmailService();
