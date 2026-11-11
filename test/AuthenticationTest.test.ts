import "dotenv/config";
import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import {
  register,
  login,
  refreshAccessToken,
  logout,
} from "../controller/accountController.ts";
import accountService from "../service/accountService.ts";
import { AppError } from "../service/AppError.ts";
import type { Request, Response } from "express";

describe("Register Test", () => {
  let reqSuccess: any;
  let resSuccess: Response;

  reqSuccess = {
    body: {
      username: "lamch4651111", // thay đổi để pass case unique của bảng account
      email: "lamch038@gmail.com", // thay đổi để pass case unique của bảng account
      full_name: "Cao Hai Lam",
      password: "123456",
    },
  };

  resSuccess = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  } as unknown as Response;

  test("Test đăng ký thành công", async () => {
    const regisSuccess = { id: 27 };
    const spy = vi
      .spyOn(accountService, "register")
      .mockResolvedValue(regisSuccess);

    await register(reqSuccess, resSuccess);

    expect(spy).toHaveBeenCalledWith(reqSuccess.body);
    expect(resSuccess.status).toHaveBeenCalledWith(201);
    expect(resSuccess.json).toHaveBeenCalledWith({ id: 27 });
  });
});

//  Helpers: dựng req/res giả, controller chỉ được test cô lập (service bị spy)
const mockReq = (body: unknown = {}) => ({ body }) as unknown as Request;

const mockRes = () =>
  ({
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  }) as unknown as Response;

describe("AccountController (service được mock)", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("login", () => {
    const body = { email: "a@gmail.com", password: "123456" };

    test("trả 200 và token khi service thành công", async () => {
      const tokens = { accessTokenNodeRe: "acc", refreshTokenNodeRe: "ref" };
      const spy = vi.spyOn(accountService, "login").mockResolvedValue(tokens);
      const res = mockRes();

      await login(mockReq(body), res);

      expect(spy).toHaveBeenCalledWith(body);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(tokens);
    });

    test("ném lại AppError để errorHandler xử lý (không tự gửi body)", async () => {
      const err = new AppError(404, { message: "sai mật khẩu hoặc tài khoản" });
      vi.spyOn(accountService, "login").mockRejectedValue(err);
      const res = mockRes();

      await expect(login(mockReq(body), res)).rejects.toBe(err);
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe("refreshAccessToken", () => {
    test("truyền refreshToken từ body và trả 200", async () => {
      const spy = vi
        .spyOn(accountService, "refreshAccessToken")
        .mockResolvedValue({ accessToken: "new-acc" });
      const res = mockRes();

      await refreshAccessToken(mockReq({ refreshToken: "ref-token" }), res);

      expect(spy).toHaveBeenCalledWith("ref-token");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ accessToken: "new-acc" });
    });

    test("body rỗng -> truyền undefined cho service", async () => {
      const spy = vi
        .spyOn(accountService, "refreshAccessToken")
        .mockRejectedValue(
          new AppError(401, { message: "Refresh token is required" }),
        );

      await expect(
        refreshAccessToken(mockReq(undefined), mockRes()),
      ).rejects.toMatchObject({ status: 401 });
      expect(spy).toHaveBeenCalledWith(undefined);
    });

    test("ném lại AppError 401 khi token không hợp lệ", async () => {
      const err = new AppError(401, {
        message: "Refresh token is invalid or expired",
      });
      vi.spyOn(accountService, "refreshAccessToken").mockRejectedValue(err);
      const res = mockRes();

      await expect(
        refreshAccessToken(mockReq({ refreshToken: "bad" }), res),
      ).rejects.toBe(err);
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe("logout", () => {
    test("đọc refreshTokenNodeRe từ body và trả 201", async () => {
      const spy = vi
        .spyOn(accountService, "logout")
        .mockResolvedValue({ message: "logout success" });
      const res = mockRes();

      await logout(mockReq({ refreshTokenNodeRe: "ref-token" }), res);

      expect(spy).toHaveBeenCalledWith("ref-token");
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ message: "logout success" });
    });

    test("ném lại AppError 401 khi thiếu token", async () => {
      const err = new AppError(401, { message: "Refresh token is required" });
      vi.spyOn(accountService, "logout").mockRejectedValue(err);
      const res = mockRes();

      await expect(logout(mockReq({}), res)).rejects.toBe(err);
      expect(res.json).not.toHaveBeenCalled();
    });
  });
});
