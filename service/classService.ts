import crypto from "node:crypto";
import classRepository from "../repository/classRepository.js";
import { accountRepository } from "../repository/accountRepository.js";
import { AppError } from "./AppError.js";
import type {
  CreateClassInput,
  SearchClassInput,
} from "../schema/classSchema.js";

class ClassService {
  async createClass(input: CreateClassInput) {
    // teacher_id phải là tài khoản TEACHER đang active (không phải student/admin)
    const teacher = await accountRepository.getActiveTeacherById(
      input.teacher_id,
    );
    if (!teacher) {
      throw new AppError(400, {
        message: "teacher_id không phải giáo viên đang hoạt động",
      });
    }

    let code;
    do {
      code = this.generateCode();
    } while (await classRepository.getClassByCode(code));

    // Chỉ lấy đúng các field được phép, không spread nguyên dữ liệu từ client
    return classRepository.createClassRoom({
      teacher_id: input.teacher_id,
      name_class: input.name_class,
      description: input.description,
      code,
      is_active: true,
    });
  }

  async searchClassRoom(body: SearchClassInput) {
    return classRepository.searchClassRoom(body.page ?? 1, body.limit ?? 10);
  }

  generateCode() {
    return crypto.randomBytes(6).toString("hex").slice(0, 6).toUpperCase();
  }
}

export default new ClassService();
