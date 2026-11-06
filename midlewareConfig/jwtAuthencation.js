import jwt from "jsonwebtoken";
import { accountRepository } from "../repository/accountRepository.js";

export const jwtAuthencation = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.jwtSecret);

    const accountCheck = await accountRepository.getAccountByEmail(
      decoded.email,
    );

    if (!accountCheck.is_active) {
      return res.status(403).json({
        message: "The account is banned",
      });
    }

    req.user = decoded;

    console.log(decoded);

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
};

export const createAccessToken = (account) => {
  return jwt.sign(
    {
      accountId: account.id,
      email: account.email,
      role: account.role,
    },
    process.env.jwtSecret,
    {
      expiresIn: "60m",
    },
  );
};

export const createRefreshToken = (account) => {
  return jwt.sign(
    {
      accountId: account.id,
    },
    process.env.jwtSecret,
    {
      expiresIn: "7d",
    },
  );
};
