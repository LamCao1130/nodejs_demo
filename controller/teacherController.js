import { accountRepository } from "../repository/accountRepository.js";
import bcrypt from "bcrypt";

class TeacherController {
  createTeacher = async (req, res, next) => {
    const teacher = req.body;
    teacher.role = "TEACHER";
    const hashedPassword = await bcrypt.hash(teacher.password, 10);
    teacher.password = hashedPassword;
    const resp = await accountRepository.createAccount(teacher);
    return res.status(200).json(resp);
  };

  searchListTeacher = async (req, res, next) => {
    try {
      const page = Math.max(1, Number(req.body.page) || 1);
      const pageSize = Math.max(1, Number(req.body.limit) || 10);
      const response = await accountRepository.searchTeacher(page, pageSize);
      return res.status(200).json(response);
    } catch (e) {
      return res.status(406).json({ message: "search fail" });
    }
  };

  getAllTeacher = async (req, res, next) => {
    try {
      const teachers = await accountRepository.getAllAccountTeacher();
      return res.status(200).json(teachers);
    } catch (e) {
      return res.status(406).json({ message: "get list fail" });
    }
  };
}
export default new TeacherController();
