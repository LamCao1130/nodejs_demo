import bcrypt from "bcrypt";
import { z } from "zod";
import { accountRepository } from "../repository/accountRepository.js";
import { AppError } from "./AppError.js";

const CreateTeacherSchema = z.object({
  username: z.string(),
  email: z.string(),
  password: z.string(),
  full_name: z.string(),
});

interface PageBody {
  page?: unknown;
  limit?: unknown;
}

class TeacherService {
  async createTeacher(body: unknown) {
    const parsed = CreateTeacherSchema.safeParse(body);
    if (!parsed.success) {
      throw new AppError(400, {
        message: "Dữ liệu không hợp lệ",
        errors: parsed.error.issues.map((i) => ({
          field: i.path.join("."),
          message: i.message,
        })),
      });
    }
    const teacher = parsed.data;
    return accountRepository.createAccount({
      ...teacher,
      role: "TEACHER",
      password: await bcrypt.hash(teacher.password, 10),
    });
  }

  async searchTeacher(body?: PageBody) {
    const page = Math.max(1, Math.floor(Number(body?.page)) || 1);
    const pageSize = Math.min(
      100,
      Math.max(1, Math.floor(Number(body?.limit)) || 10),
    );
    return accountRepository.searchTeacher(page, pageSize);
  }

  async getAllTeacher() {
    return accountRepository.getAllAccountTeacher();
  }
}

export default new TeacherService();
