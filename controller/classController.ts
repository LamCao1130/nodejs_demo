import type { Request, Response } from "express";
import classService from "../service/classService.js";

class ClassRoomController {
  createClass = async (req: Request, res: Response) => {
    res.status(200).json(await classService.createClass(req.body));
  };

  searchClassRoom = async (req: Request, res: Response) => {
    res.status(200).json(await classService.searchClassRoom(req.body));
  };
}
export default new ClassRoomController();
