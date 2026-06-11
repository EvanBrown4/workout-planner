import { pool } from "../db/pool.js";
import type { User, CreateUserInput } from "./users.schema.js";

export async function createUser(
  input: CreateUserInput
) {
  try {

    // Insert the user and return the full created record
    const result = await pool.query(
      `
      INSERT INTO users
      (email, username, password_hash, first_name, last_name)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, email, username, first_name, last_name, created_at;
      `,
      [
        input.email,
        input.username,
        input.password_hash,
        input.first_name,
        input.last_name ?? null,
      ]
    );

    return result.rows[0];

  } catch (err: any) {
    /* Handle unique constraint violation — user already exists */
    if (err.code === "23505") {
      throw new Error("User already exists");
    }

    // Re-throw any other unexpected database errors
    throw err;
  }
}

export async function queryAllUsers() {
  const result = await pool.query(`
    SELECT id, email, username, password_hash, first_name, last_name, created_at, updated_at
    FROM users
    ORDER BY created_at;
  `);

  return result.rows;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const result = await pool.query<User>(
    `
      SELECT id, email, username, password_hash, first_name, last_name, created_at, updated_at
      FROM users
      WHERE email = $1;
    `,
    [email]
  );

  return result.rows[0] ?? null;
}

export async function getUserByUsername(username: string): Promise<User | null> {
    const result = await pool.query<User>(
    `
      SELECT id, email, username, password_hash, first_name, last_name, created_at, updated_at
      FROM users
      WHERE username = $1;
    `,
    [username]
  );

  return result.rows[0] ?? null;
}

export async function getUserByID(user_id: string) {
  const result = await pool.query(`
    SELECT id, email, username, first_name, last_name, created_at, updated_at
    FROM users
    WHERE id = '${user_id}';
  `);

  return result.rows;
}