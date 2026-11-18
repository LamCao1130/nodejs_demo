import bcrypt from "bcrypt";
import fs from "node:fs";
import type { z } from "zod";
import { AppError } from "./AppError.js";
import { accountRepository } from "../repository/accountRepository.js";
import requestTeacherRepository from "../repository/requestTeacherRepository.ts";
import type {
  CreateTeacherSchema,
  SearchTeacherInput,
  UpdateTeacherInput,
  RequestTeacherInput,
} from "../schema/teacherSchema.js";

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
class TeacherService {
  async createTeacher(teacher: z.infer<typeof CreateTeacherSchema>) {
    return accountRepository.createAccount({
      ...teacher,
      role: "TEACHER",
      password: await bcrypt.hash(teacher.password, 10),
    });
  }

  async searchTeacher(body: SearchTeacherInput) {
    return accountRepository.searchTeacher(body.search, {
      page: body.pagination.page,
      pageSize: body.pagination.limit,
    });
  }

  async getAllTeacher() {
    return accountRepository.getAllAccountTeacher();
  }

  async deleteTeacher(accountId: number) {
    const deleted = await accountRepository.deleteTeacher(accountId);
    if (!deleted) {
      throw new AppError(404, { message: "Không tìm thấy giáo viên" });
    }
  }

  async updateTeacher(id: number, body: UpdateTeacherInput) {
    const updated = await accountRepository.updateTeacher(id, body);
    if (!updated) {
      throw new AppError(404, { message: "Không tìm thấy giáo viên" });
    }
  }

  async createRequestTeacher(
    requestTeacherBody: RequestTeacherInput,
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

    try {
      const rs =
        await requestTeacherRepository.createRequestTeacherRepository(
          requestTeacher,
        );
      return rs.id;
    } catch (e) {
      // Insert lỗi thì không để file mồ côi trên ổ đĩa
      await fs.promises.unlink(fileCV.path).catch(() => {});
      // email là @unique: gửi CV lần 2 -> P2002 -> 409 thay vì 500
      if ((e as { code?: string })?.code === "P2002") {
        throw new AppError(409, { message: "Email này đã gửi yêu cầu" });
      }
      throw e;
    }
  }
}

export default new TeacherService();
