import type { Prisma } from "../generated/prisma/client.js";
import { prisma } from "../config/database.js";

export const accountRepository = {
  createAccount(account: Prisma.accountCreateInput) {
    return prisma.account.create({
      data: account,
      omit: { password: true },
    });
  },
  getAccountByEmail(email: string) {
    if (typeof email !== "string" || email.trim() === "") {
      return Promise.resolve(null);
    }
    return prisma.account.findUnique({
      where: { email },
    });
  },
  getAccountById(id: number) {
    return prisma.account.findUnique({
      where: {
        id: id,
      },
      omit: { password: true },
    });
  },
  getActiveTeacherById(id: number) {
    return prisma.account.findFirst({
      where: { id, role: "TEACHER", is_active: true },
      select: { id: true },
    });
  },
  async getAllAccountTeacher() {
    const [data] = await prisma.$transaction([
      prisma.account.findMany({
        where: {
          role: "TEACHER",
          is_active: true,
        },
        select: {
          id: true,
          email: true,
          full_name: true,
          username: true,
        },
      }),
    ]);

    return data;
  },

  async searchTeacher(search: any, pagination: any) {
    const [data, total] = await prisma.$transaction([
      prisma.account.findMany({
        select: {
          id: true,
          email: true,
          full_name: true,
          username: true,
          is_active: true,
        },
        where: {
          email: {
            contains: search.email,
            mode: "insensitive",
          },
          username: {
            contains: search.username,
            mode: "insensitive",
          },
          full_name: {
            contains: search.full_name,
            mode: "insensitive",
          },
          is_active: search.is_active,
          role: "TEACHER",
        },
        skip: (pagination.page - 1) * pagination.pageSize,
        take: pagination.pageSize,
      }),

      prisma.account.count({
        where: {
          email: {
            contains: search.email,
            mode: "insensitive",
          },
          username: {
            contains: search.username,
            mode: "insensitive",
          },
          full_name: {
            contains: search.full_name,
            mode: "insensitive",
          },
          is_active: search.is_active,
          role: "TEACHER",
        },
      }),
    ]);
    return {
      data,
      total,
    };
  },

  async deleteTeacher(accountId: number) {
    const result = await prisma.account.updateMany({
      where: {
        id: accountId,
        role: "TEACHER",
      },
      data: {
        is_active: false,
      },
    });

    return result.count > 0;
  },

  async updateTeacher(
    id: number,
    data: { full_name: string; is_active: boolean },
  ) {
    // Chỉ cập nhật tài khoản TEACHER (giống deleteTeacher); id không tồn tại
    // hoặc không phải teacher thì count = 0 thay vì ném lỗi P2025.
    const result = await prisma.account.updateMany({
      where: { id, role: "TEACHER" },
      data: {
        full_name: data.full_name,
        is_active: data.is_active,
        updated_at: new Date(),
      },
    });

    return result.count > 0;
  },
};
