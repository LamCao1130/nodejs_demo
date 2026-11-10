import "dotenv/config";
import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { accountRepository } from "../repository/accountRepository.js";

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

if (!JWT_ACCESS_SECRET || !JWT_REFRESH_SECRET) {
  throw new Error(
    "Missing JWT_ACCESS_SECRET or JWT_REFRESH_SECRET environment variable",
  );
}

if (JWT_ACCESS_SECRET === JWT_REFRESH_SECRET) {
  throw new Error("JWT_ACCESS_SECRET and JWT_REFRESH_SECRET must be different");
}

export interface AccessTokenPayload extends jwt.JwtPayload {
  accountId: number;
  email: string;
  role: string;
  type: "access";
}

export interface RefreshTokenPayload extends jwt.JwtPayload {
  accountId: number;
  type: "refresh";
}

interface TokenAccount {
  id: number;
  email: string;
  role: string;
}

declare module "express-serve-static-core" {
  interface Request {
    user?: AccessTokenPayload;
  }
}

export const verifyRefreshToken = (token: string): RefreshTokenPayload => {
  const decoded = jwt.verify(token, JWT_REFRESH_SECRET) as RefreshTokenPayload;
  if (decoded.type !== "refresh") {
    throw new Error("Invalid token type");
  }
  return decoded;
};

export const jwtAuthencation = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }

  const token = authHeader.split(" ")[1] as string;

  try {
    const decoded = jwt.verify(token, JWT_ACCESS_SECRET) as AccessTokenPayload;

    if (decoded.type !== "access" || !decoded.accountId) {
      return res.status(401).json({
        message: "Invalid or expired token",
      });
    }

    const accountCheck = await accountRepository.getAccountById(
      decoded.accountId,
    );

    if (!accountCheck) {
      return res.status(401).json({
        message: "Invalid or expired token",
      });
    }

    if (!accountCheck.is_active) {
      return res.status(403).json({
        message: "The account is banned",
      });
    }

    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
};

export const createAccessToken = (account: TokenAccount) => {
  return jwt.sign(
    {
      accountId: account.id,
      email: account.email,
      role: account.role,
      type: "access",
    },
    JWT_ACCESS_SECRET,
    {
      expiresIn: "60m",
    },
  );
};

export const createRefreshToken = (account: Pick<TokenAccount, "id">) => {
  return jwt.sign(
    {
      accountId: account.id,
      type: "refresh",
    },
    JWT_REFRESH_SECRET,
    {
      expiresIn: "7d",
    },
  );
};
