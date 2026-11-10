import type { Request, Response } from "express";
import teacherService from "../service/teacherService.js";
import { sendError } from "../service/AppError.js";

class TeacherController {
  createTeacher = async (req: Request, res: Response) => {
    try {
      return res.status(200).json(await teacherService.createTeacher(req.body));
    } catch (err) {
      return sendError(res, err, 500, { message: "create teacher fail" });
    }
  };

  searchListTeacher = async (req: Request, res: Response) => {
    try {
      return res.status(200).json(await teacherService.searchTeacher(req.body));
    } catch (err) {
      return sendError(res, err, 406, { message: "search fail" });
    }
  };

  getAllTeacher = async (req: Request, res: Response) => {
    try {
      return res.status(200).json(await teacherService.getAllTeacher());
    } catch (err) {
      return sendError(res, err, 406, { message: "get list fail" });
    }
  };
}
export default new TeacherController();
