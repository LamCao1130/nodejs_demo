import type { Prisma } from "../generated/prisma/client.js";
import { prisma } from "../config/database.js";

class RequestTeacherRepository {
  async createRequestTeacherRepository(requestTeacher: any) {
    return prisma.request_teacher.create({
      data: {
        username: requestTeacher.username,
        email: requestTeacher.email,
        full_name: requestTeacher.full_name,
        file_cv: requestTeacher.file_cv,
        status: requestTeacher.status,
        origin_cv_file: requestTeacher.origin_file_cv,
      },
    });
  }
}
export default new RequestTeacherRepository();
