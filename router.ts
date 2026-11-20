import { Router } from "express";
import {
  login,
  register,
  refreshAccessToken,
  logout,
} from "./controller/accountController.js";
import classController from "./controller/classController.js";
import { jwtAuthencation } from "./midlewareConfig/jwtAuthencation.js";
import { authorizeRole } from "./midlewareConfig/Authorization.js";
import { validate } from "./midlewareConfig/validate.js";
import teacherController from "./controller/teacherController.js";
import upload, {
  verifyPdf,
  saveUploadedFile,
} from "./midlewareConfig/uploadFileConfig.ts";
import {
  RegisterSchema,
  LoginSchema,
  RefreshTokenSchema,
  LogoutSchema,
} from "./schema/accountSchema.js";
import { CreateClassSchema, SearchClassSchema } from "./schema/classSchema.js";
import {
  CreateTeacherSchema,
  SearchTeacherSchema,
  TeacherIdParamSchema,
  UpdateTeacherSchema,
  RequestTeacherSchema,
  EmailRequestTeacher,
} from "./schema/teacherSchema.js";
import { sendOtpLimiter } from "./midlewareConfig/rateLimit.js";
const router = Router();

router.post("/register", validate({ body: RegisterSchema }), register);
router.post("/login", validate({ body: LoginSchema }), login);
router.post(
  "/refreshToken",
  validate({ body: RefreshTokenSchema }),
  refreshAccessToken,
);
router.post("/api/v1/public/logout", validate({ body: LogoutSchema }), logout);
router.post(
  "/admin/createClass",
  jwtAuthencation,
  authorizeRole(["ADMIN"]),
  validate({ body: CreateClassSchema }),
  classController.createClass,
);
router.post(
  "/admin/createTeacher",
  jwtAuthencation,
  authorizeRole(["ADMIN"]),
  validate({ body: CreateTeacherSchema }),
  teacherController.createTeacher,
);
router.post(
  "/admin/searchTeacher",
  jwtAuthencation,
  authorizeRole(["ADMIN"]),
  validate({ body: SearchTeacherSchema }),
  teacherController.searchListTeacher,
);
router.get(
  "/admin/allTeacher",
  jwtAuthencation,
  authorizeRole(["ADMIN"]),
  teacherController.getAllTeacher,
);

router.post(
  "/admin/searchClass",
  jwtAuthencation,
  authorizeRole(["ADMIN"]),
  validate({ body: SearchClassSchema }),
  classController.searchClassRoom,
);

router.delete(
  "/admin/deleteTeacher/:id",
  jwtAuthencation,
  authorizeRole(["ADMIN"]),
  validate({ params: TeacherIdParamSchema }),
  teacherController.deleteTeacher,
);

router.put(
  "/admin/updateTeacher/:id",
  jwtAuthencation,
  authorizeRole(["ADMIN"]),
  validate({ params: TeacherIdParamSchema, body: UpdateTeacherSchema }),
  teacherController.updateTeacher,
);

router.post(
  "/sendOTPVerifyEmailCreateTeacher",
  sendOtpLimiter,
  validate({ body: EmailRequestTeacher }),
  teacherController.sendOTPVerifyEmailCreateTeacher,
);

router.post(
  "/createRequestTeacher",
  upload.single("cv"),
  verifyPdf,
  validate({ body: RequestTeacherSchema }),
  teacherController.createRequestTeacher,
  saveUploadedFile,
  teacherController.finishCreateRequestTeacher,
);
export default router;
