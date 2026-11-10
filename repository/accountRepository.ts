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

  async searchTeacher(page: number, pageSize: number) {
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
