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
  deleteTeacher = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    await teacherService.deleteTeacher(id);
    return res.status(200).json({ message: "delete success" });
  };

  updateTeacher = async (req: Request, res: Response) => {
    await teacherService.updateTeacher(req.body);
    return res.status(200).json({ message: "update success" });
  };
}
export default new TeacherController();
