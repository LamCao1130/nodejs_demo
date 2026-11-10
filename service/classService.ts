import type { Prisma } from "../generated/prisma/client.js";
import crypto from "node:crypto";
import classRepository from "../repository/classRepository.js";

interface PageBody {
  page?: unknown;
  limit?: unknown;
}

class ClassService {
  async createClass(classroom: Omit<Prisma.classroomUncheckedCreateInput, "code" | "is_active">) {
    let code;
    do {
      code = this.generateCode();
    } while (await classRepository.getClassByCode(code));

    return classRepository.createClassRoom({
      ...classroom,
      code,
      is_active: true,
    });
  }

  async searchClassRoom(body?: PageBody) {
    const page = Math.max(1, Math.floor(Number(body?.page)) || 1);
    const pageSize = Math.min(
      100,
      Math.max(1, Math.floor(Number(body?.limit)) || 10),
    );
    return classRepository.searchClassRoom(page, pageSize);
  }

  generateCode() {
    return crypto.randomBytes(6).toString("hex").slice(0, 6).toUpperCase();
  }
}

export default new ClassService();
