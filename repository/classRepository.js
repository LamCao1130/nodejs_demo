import { prisma } from "../config/database.js";

class ClassRoomRepository {
  async createClassRoom(classroom) {
    return prisma.classroom.create({ data: classroom });
  }

  async getClassByCode(code) {
    return prisma.classroom.findFirst({
      where: { code: code },
    });
  }

  async searchClassRoom(page, pageSize) {
    const [data, total] = await prisma.$transaction([
      prisma.classroom.findMany({
        select: {
          code: true,
          name_class: true,
          teacher_id: true,
          description: true,
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),

      prisma.classroom.count(),
    ]);

    const teacherIds = [
      ...new Set(
        data.map((item) => item.teacher_id).filter((id) => id !== null),
      ),
    ];

    const teachers = await prisma.account.findMany({
      where: {
        id: {
          in: teacherIds,
        },
      },
      select: {
        id: true,
        full_name: true,
        email: true,
      },
    });

    const result = data.map((classroom) => ({
      ...classroom,
      teacher:
        teachers.find((teacher) => teacher.id === classroom.teacher_id) || null,
    }));

    return {
      data: result,
      total,
    };
  }
}
export default new ClassRoomRepository();
