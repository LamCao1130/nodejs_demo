import type { Request, Response } from "express";
import accountService from "../service/accountService.js";

export const register = async (req: Request, res: Response) => {
  res.status(201).json(await accountService.register(req.body));
};

export const login = async (req: Request, res: Response) => {
  res.status(200).json(await accountService.login(req.body));
};

export const refreshAccessToken = async (req: Request, res: Response) => {
  res
    .status(200)
    .json(await accountService.refreshAccessToken(req.body?.refreshToken));
};

export const logout = async (req: Request, res: Response) => {
  res
    .status(201)
    .json(await accountService.logout(req.body?.refreshTokenNodeRe));
};
