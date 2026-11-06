import bcrypt from "bcrypt";
import { accountRepository } from "../repository/accountRepository.js";
import {
  createAccessToken,
  createRefreshToken,
} from "../midlewareConfig/jwtAuthencation.js";

import tokenRepository from "../repository/tokenRepository.js";
import jwt from "jsonwebtoken";

export const register = async (req, res, next) => {
  try {
    const account = req.body;
    const hashedPassword = await bcrypt.hash(account.password, 10);
    const accountNew = { ...account, password: hashedPassword };
    await accountRepository.createAccount(accountNew);
    res.json("success");
  } catch (err) {
    console.log(err);
    return res.status(405).json({
      message: "lỗi thêm mới",
    });
  }
};

export const login = async (req, res, next) => {
  try {
    const emailLog = req.body.email;
    const account = await accountRepository.getAccountByEmail(emailLog);
    if (!account) {
      return res.status(404).json({ message: "không tìm thấy tài khoản" });
    } else if (!account.is_active) {
      return res
        .status(403)
        .json("tài khoản đã bị khóa vui lòng liên hệ admin");
    } else {
      const isMatch = await bcrypt.compare(req.body.password, account.password);
      if (isMatch) {
        const accessToken = createAccessToken(account);
        const refreshToken = createRefreshToken(account);
        await tokenRepository.saveRefreshToken(account, refreshToken);
        return res.status(200).json({
          accessTokenNodeRe: accessToken,
          refreshTokenNodeRe: refreshToken,
        });
      } else {
        return res.status(403).json({ message: "sai mật khẩu hoặc tài khoản" });
      }
    }
  } catch (err) {
    console.log(err);
    return res.status(405).json({
      message: "lỗi thêm mới",
    });
  }
};

export const refreshAccessToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        message: "Refresh token is required",
      });
    }

    const decoded = jwt.verify(refreshToken, process.env.jwtSecret);

    const storedToken = await tokenRepository.findValidRefreshToken(
      decoded.accountId,
      refreshToken,
    );

    if (!storedToken) {
      return res.status(401).json({
        message: "Refresh token is invalid or expired",
      });
    }

    if (storedToken.is_revoked) {
      return res.status(401).json({
        message: "Refresh token is invalid or expired",
      });
    }

    const account = await accountRepository.getAccountById(
      storedToken.account_id,
    );

    if (!account || account.is_active === false) {
      return res.status(401).json({
        message: "Account is disabled",
      });
    }

    const accessToken = createAccessToken(account);

    return res.status(200).json({
      accessToken,
    });
  } catch (error) {
    return res.status(401).json({
      message: "Refresh token is invalid or expired",
    });
  }
};

export const logout = async (req, res) => {
  try {
    const { refreshTokenNodeRe } = req.body;

    if (!refreshTokenNodeRe) {
      return res.status(401).json({
        message: "Refresh token is required",
      });
    }

    await tokenRepository.deleteRefreshToken(refreshTokenNodeRe);

    return res.status(201).json({ message: "logout success" });
  } catch (error) {
    return res.status(401).json({
      message: "Refresh token is invalid or expired",
    });
  }
};
