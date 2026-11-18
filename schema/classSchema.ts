import { z } from "zod";

// Chỉ cho phép client gửi các field này; id, code, is_active, created_at... bị loại bỏ.
export const CreateClassSchema = z.object({
  teacher_id: z.number().int().positive(),
  name_class: z.string().trim().min(1).max(100),
  description: z.string().optional(),
});

export const SearchClassSchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

export type CreateClassInput = z.infer<typeof CreateClassSchema>;
export type SearchClassInput = z.infer<typeof SearchClassSchema>;
