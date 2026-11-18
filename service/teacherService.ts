import bcrypt from "bcrypt";
import { z } from "zod";
import { accountRepository } from "../repository/accountRepository.js";
import { AppError } from "./AppError.js";
import requestTeacherRepository from "../repository/requestTeacherRepository.ts";

const CreateTeacherSchema = z.object({
  username: z.string(),
  email: z.string(),
  password: z.string(),
  full_name: z.string(),
});

interface PageBody {
  search: {
    username: string;
    email: string;
    full_name: string;
    is_active: boolean;
  };
  pagination: { page?: unknown; limit?: unknown };
}

interface UpdateBody {
  id: number;
  full_name: string;
  is_active: boolean;
}

interface requestTeacherBody {
  username: string;
  email: string;
  full_name: string;
  file_cv: string;
  status: string;
  origin_file_cv: string;
}

interface fileCV {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  path: string;
  destination: string;
  filename: string;
  size: number;
}
interface bodyRequestTeacher {
  username: string;
  email: string;
  full_name: string;
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
    const page = Math.max(1, Math.floor(Number(body?.pagination.page)) || 1);
    const pageSize = Math.min(
      100,
      Math.max(1, Math.floor(Number(body?.pagination.limit)) || 10),
    );

    return accountRepository.searchTeacher(body?.search, { page, pageSize });
  }

  async getAllTeacher() {
    return accountRepository.getAllAccountTeacher();
  }

  async deleteTeacher(accountId: number) {
    return accountRepository.deleteTeacher(accountId);
  }

  async updateTeacher(bodyUpdate: UpdateBody) {
    return accountRepository.updateTeacher(bodyUpdate);
  }

  async createRequestTeacher(
    requestTeacherBody: bodyRequestTeacher,
    fileCV: Express.Multer.File,
  ) {
    const requestTeacher: requestTeacherBody = {
      username: requestTeacherBody.username,
      email: requestTeacherBody.email,
      full_name: requestTeacherBody.full_name,
      file_cv: fileCV.filename,
      status: "OPEN",
      origin_file_cv: fileCV.originalname,
    };

    const rs =
      await requestTeacherRepository.createRequestTeacherRepository(
        requestTeacher,
      );

    return rs.id;
  }
}

export default new TeacherService();
