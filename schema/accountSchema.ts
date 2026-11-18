import { z } from "zod";

export const RegisterSchema = z.object({
  username: z.string(),
  email: z.string().email(),
  password: z.string().min(6),
  full_name: z.string().max(100).optional(),
});

export const LoginSchema = z.object({
  email: z.string().trim().min(1),
  password: z.string().min(1),
});

export const RefreshTokenSchema = z.object({
  refreshToken: z.string().min(1),
});

export const LogoutSchema = z.object({
  refreshTokenNodeRe: z.string().min(1),
});
