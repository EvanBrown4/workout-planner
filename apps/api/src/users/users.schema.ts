import { z } from "zod";


export interface User {
  id: string;
  email: string;
  username: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  created_at: Date;
  updated_at: Date;
}

/**
 * Schema for validating the request body when creating a new user.
 * Nutritional metadata is fully optional.
 */
export const createUserSchema = z.object({
  email: z.string().min(1),                         // Required, non-empty email
  username: z.string().min(1),                      // Required, non-empty username
  password_hash: z.string().min(1),                 // Required, temp manual password hash
  first_name: z.string().min(1),                    // Required, non-empty first name
  last_name: z.string().optional(),                 // Optional last name
});

/* TypeScript type inferred directly from the create schema */
export type CreateUserInput = z.infer<typeof createUserSchema>;