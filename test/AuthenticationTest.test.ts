import "dotenv/config";
import { describe, test, expect, vi } from "vitest";
import { register } from "../controller/accountController.ts";
import type { Response } from "express";

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

  test("Test success", async () => {
    await register(reqSuccess, resSuccess);

    const responseBody = vi.mocked(resSuccess.json).mock.calls[0][0];

    console.log("Response body:", responseBody);

    // thay đổi id + 1 để đáp ứng cùng identity id trong db
    expect(responseBody.id).toBe(27);
  });
});
