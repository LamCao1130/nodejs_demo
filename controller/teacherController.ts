import type { Request, Response } from "express";
import teacherService from "../service/teacherService.js";

class TeacherController {
  createTeacher = async (req: Request, res: Response) => {
    res.status(200).json(await teacherService.createTeacher(req.body));
  };

  searchListTeacher = async (req: Request, res: Response) => {
    res.status(200).json(await teacherService.searchTeacher(req.body));
  };

  getAllTeacher = async (_req: Request, res: Response) => {
    res.status(200).json(await teacherService.getAllTeacher());
  };
}
export default new TeacherController();
