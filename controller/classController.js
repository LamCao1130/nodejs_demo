import { json } from "body-parser";
import classRepository from "../repository/classRepository.js";
import crypto from "node:crypto";

class ClassRoomController {
  createClass = async (req, res, next) => {
    const classroom = req.body;
    let code = "";
    while (true) {
      code = this.generateCode();
      const classExisted = await classRepository.getClassByCode(code);
      if (!classExisted) {
        break;
      }
    }
    classroom.code = code;
    classroom.is_active = true;
    const classSave = await classRepository.createClassRoom(classroom);
    return res.status(200).json(classSave);
  };

  searchClassRoom = async (req, res, next) => {
    try {
      const page = Math.max(1, Number(req.body.page) || 1);
      const pageSize = Math.max(1, Number(req.body.limit) || 10);
      const response = await classRepository.searchClassRoom(page, pageSize);
      return res.status(200).json(response);
    } catch (e) {
      return res.status(406).json({ message: "search fail" });
    }
  };

  generateCode() {
    return crypto.randomBytes(6).toString("hex").slice(0, 6).toUpperCase();
  }
}
export default new ClassRoomController();
