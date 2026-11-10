import type { Request, Response } from "express";
import classService from "../service/classService.js";
import { sendError } from "../service/AppError.js";

class ClassRoomController {
  createClass = async (req: Request, res: Response) => {
    try {
      return res.status(200).json(await classService.createClass(req.body));
    } catch (err) {
      return sendError(res, err, 500, { message: "create class fail" });
    }
  };

  searchClassRoom = async (req: Request, res: Response) => {
    try {
      return res.status(200).json(await classService.searchClassRoom(req.body));
    } catch (err) {
      return sendError(res, err, 406, { message: "search fail" });
    }
  };
}
export default new ClassRoomController();
