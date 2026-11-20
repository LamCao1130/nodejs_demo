import { transporter } from "../config/emailTransporter.ts";

class EmailService {
  async sendEmail(to: any, subject: any, html: any) {
    return transporter.sendMail({
      from: `"ReNode" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
  }

  async sendOTPRequestTeacher(to: any, otp: any) {
    const html = `
      <h2>Xác thực tài khoản</h2>
      <p>Mã OTP của bạn là:</p>
      <h1>${otp}</h1>
      <p>Mã có hiệu lực trong 1 phút.</p>
    `;

    return this.sendEmail(to, "Xác thực tài khoản", html);
  }
}

export const emailService = new EmailService();
