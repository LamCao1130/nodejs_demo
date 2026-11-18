import type { Prisma } from "../generated/prisma/client.js";
import { prisma } from "../config/database.js";

class ClassRoomRepository {
  async createClassRoom(classroom: Prisma.classroomUncheckedCreateInput) {
    return prisma.classroom.create({ data: classroom });
  }

  async getClassByCode(code: string) {
    if (typeof code !== "string" || code.trim() === "") {
      return null;
    }
    // code là @unique -> dùng findUnique
    return prisma.classroom.findUnique({
      where: { code },
    });
  }

  async searchClassRoom(page: number, pageSize: number) {
    const [rows, total] = await prisma.$transaction([
      prisma.classroom.findMany({
        select: {
          code: true,
          name_class: true,
          teacher_id: true,
          description: true,
          account: { select: { id: true, full_name: true, email: true } },
        },
        // id làm tiêu chí phụ để phân trang ổn định khi created_at trùng nhau
        orderBy: [{ created_at: "desc" }, { id: "desc" }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.classroom.count(),
    ]);

    const data = rows.map(({ account, ...classroom }) => ({
      ...classroom,
      teacher: account,
    }));

    return { data, total };
  }
}
export default new ClassRoomRepository();
