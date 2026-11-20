import fs from "node:fs";
import type { NextFunction, Request, Response } from "express";
import teacherService from "../service/teacherService.js";
import otpEmailService, {
  OTP_PURPOSE_CREATE_TEACHER,
} from "../service/otpEmailService.js";
import { emailService } from "../service/emailService.ts";

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
    await teacherService.updateTeacher(Number(req.params.id), req.body);
    return res.status(200).json({ message: "update success" });
  };

  sendOTPVerifyEmailCreateTeacher = async (req: Request, res: Response) => {
    const email = req.body.email;
    await teacherService.assertEmailAvailableForRequest(email);
    const otp = await otpEmailService.createOtp(
      email,
      OTP_PURPOSE_CREATE_TEACHER,
    );
    await emailService.sendOTPRequestTeacher(email, otp);
    return res.status(200).json({ email: email, message: "OTP sent" });
  };

  // Bước 1: verify OTP + lưu DB, thành công mới next() sang saveUploadedFile
  createRequestTeacher = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    const fileCV = req.file;

    if (!fileCV) {
      return res.status(400).json({
        message: "CV file is required",
      });
    }
    const id = await teacherService.createRequestTeacher(req.body, fileCV);
    res.locals.requestTeacherId = id;

    // "close" chạy cả khi response hoàn tất lẫn khi client ngắt kết nối giữa chừng
    // ("finish" thì không), nên dùng nó để dọn bản ghi + file nếu chưa thành công.
    res.on("close", () => {
      if (res.writableFinished && res.statusCode < 400) return;
      res.locals.aborted = true;
      void teacherService.deleteRequestTeacher(id);
      if (fileCV.path) fs.promises.unlink(fileCV.path).catch(() => {});
    });
    next();
  };

  // Bước 2: chạy sau saveUploadedFile, file đã nằm trong storage
  finishCreateRequestTeacher = (_req: Request, res: Response) => {
    return res.status(201).json(res.locals.requestTeacherId);
  };
}
export default new TeacherController();
