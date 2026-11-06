import { prisma } from "../config/database.js";

export const accountRepository = {
  createAccount(account) {
    return prisma.account.create({
      data: account,
    });
  },
  getAccountByEmail(email) {
    return prisma.account.findFirst({
      where: { email: email },
    });
  },
  getAccountById(id) {
    return prisma.account.findUnique({
      where: {
        id: id,
      },
    });
  },
  async getAllAccountTeacher() {
    const [data] = await prisma.$transaction([
      prisma.account.findMany({
        where: {
          role: "TEACHER",
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

  async searchTeacher(page, pageSize) {
    const [data, total] = await prisma.$transaction([
      prisma.account.findMany({
        select: {
          id: true,
          email: true,
          full_name: true,
          username: true,
        },
        where: {
          role: "TEACHER",
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),

      prisma.account.count({ where: { role: "TEACHER" } }),
    ]);
    return {
      data,
      total,
    };
  },
};
