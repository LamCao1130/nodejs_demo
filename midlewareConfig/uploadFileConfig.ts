import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "node:crypto";
import type { NextFunction, Request, Response } from "express";
import { AppError } from "../service/AppError.js";

const uploadDir = path.join(process.cwd(), "storage", "cvRequestTeacher");
fs.mkdirSync(uploadDir, { recursive: true });

// Giữ file trong RAM (tối đa 10MB) thay vì ghi thẳng xuống đĩa: request sai
// (không phải PDF, thiếu field...) bị từ chối mà không để lại gì trên server.
// File chỉ được ghi xuống đĩa ở saveUploadedFile, sau khi mọi kiểm tra đã qua.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 1,
  },
  fileFilter: (_req, file, cb) => {
    // mimetype do client tự khai báo -> chỉ là lớp lọc đầu, xem verifyPdf bên dưới
    if (file.mimetype !== "application/pdf") {
      return cb(new AppError(400, { message: "Chỉ chấp nhận file PDF" }));
    }
    cb(null, true);
  },
});

// Chạy sau upload.single(): kiểm tra 5 byte đầu phải là "%PDF-".
export const verifyPdf = (req: Request, _res: Response, next: NextFunction) => {
  const file = req.file;
  if (file && file.buffer.subarray(0, 5).toString("latin1") !== "%PDF-") {
    return next(new AppError(400, { message: "Chỉ chấp nhận file PDF" }));
  }
  next();
};

// Chạy sau khi controller đã verify OTP + lưu DB: ghi file xuống đĩa với tên ngẫu nhiên
// (tên gốc đã lưu riêng ở cột origin_cv_file) rồi gán filename/path cho req.file.
export const saveUploadedFile = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const file = req.file;
  if (!file) return next();

  try {
    // controller có thể đã định sẵn tên (đã lưu DB), nếu không thì tự sinh
    const filename = file.filename || crypto.randomUUID() + ".pdf";
    const filePath = path.join(uploadDir, filename);
    await fs.promises.writeFile(filePath, file.buffer, { flag: "wx" });
    file.filename = filename;
    file.path = filePath;
    file.destination = uploadDir;

    // Client đã ngắt trong lúc đang ghi file (controller đã dọn DB xong) -> bỏ file
    if (res.locals.aborted) {
      await fs.promises.unlink(filePath).catch(() => {});
      return;
    }

    // Nếu bước sau (vd. ghi DB) thất bại thì không để file mồ côi
    res.on("close", () => {
      if (!res.writableFinished || res.statusCode >= 400)
        fs.promises.unlink(filePath).catch(() => {});
    });
    next();
  } catch (err) {
    next(err);
  }
};

export default upload;
