import { z } from "zod";

export const CreateTeacherSchema = z.object({
  username: z.string().min(1).max(50),
  email: z.string().email().max(100),
  password: z.string().min(6),
  full_name: z.string().max(100),
});

export const SearchTeacherSchema = z.object({
  search: z
    .object({
      username: z.string().optional(),
      email: z.string().optional(),
      full_name: z.string().optional(),
      is_active: z.boolean().optional(),
    })
    .prefault({}),
  pagination: z
    .object({
      page: z.coerce.number().int().min(1).default(1),
      limit: z.coerce.number().int().min(1).max(100).default(10),
    })
    .prefault({}),
});

export const TeacherIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const UpdateTeacherSchema = z.object({
  full_name: z.string().max(100),
  is_active: z.boolean(),
});

export const RequestTeacherSchema = z.object({
  username: z.string().min(1).max(50),
  email: z.string().email().max(100),
  full_name: z.string().max(100),
});

export type SearchTeacherInput = z.infer<typeof SearchTeacherSchema>;
export type UpdateTeacherInput = z.infer<typeof UpdateTeacherSchema>;
export type RequestTeacherInput = z.infer<typeof RequestTeacherSchema>;
