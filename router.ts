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
import teacherController from "./controller/teacherController.js";
const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/refreshToken", refreshAccessToken);
router.post("/api/v1/public/logout", logout);
router.post(
  "/admin/createClass",
  jwtAuthencation,
  authorizeRole(["ADMIN"]),
  classController.createClass,
);
router.post(
  "/admin/createTeacher",
  jwtAuthencation,
  authorizeRole(["ADMIN"]),
  teacherController.createTeacher,
);
router.post(
  "/admin/searchTeacher",
  jwtAuthencation,
  authorizeRole(["ADMIN"]),
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
  classController.searchClassRoom,
);

router.delete(
  "/admin/deleteTeacher/:id",
  jwtAuthencation,
  authorizeRole(["ADMIN"]),
  teacherController.deleteTeacher,
);

router.put(
  "/admin/updateTeacher",
  jwtAuthencation,
  authorizeRole(["ADMIN"]),
  teacherController.updateTeacher,
);
export default router;
