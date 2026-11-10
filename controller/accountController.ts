import type { Request, Response } from "express";
import accountService from "../service/accountService.js";
import { sendError } from "../service/AppError.js";

export const register = async (req: Request, res: Response) => {
  try {
    return res.status(201).json(await accountService.register(req.body));
  } catch (err) {
    console.log(err);
    return sendError(res, err, 405, { message: "lỗi thêm mới" });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    return res.status(200).json(await accountService.login(req.body));
  } catch (err) {
    return sendError(res, err, 404, { message: "lỗi đăng nhập" });
  }
};

export const refreshAccessToken = async (req: Request, res: Response) => {
  try {
    const result = await accountService.refreshAccessToken(
      req.body?.refreshToken,
    );
    return res.status(200).json(result);
  } catch (err) {
    return sendError(res, err, 401, {
      message: "Refresh token is invalid or expired",
    });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    const result = await accountService.logout(req.body?.refreshTokenNodeRe);
    return res.status(201).json(result);
  } catch (err) {
    return sendError(res, err, 401, {
      message: "Refresh token is invalid or expired",
    });
  }
};
