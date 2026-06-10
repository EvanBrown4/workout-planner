import { pool } from "../db/pool.js";
import type { CreateUserInput } from "./users.schema.js";

/**
 * Fetches all users from the database, ordered alphabetically by name.
 *
 * @returns (Promise<object[]>) An array of all user rows, each containing
 *          id, name, category, nutritional_metadata, and created_at.
 */
export async function queryAllUsers() {
  const result = await pool.query(`
    SELECT id, email, username, password_hash, first_name, last_name, created_at, updated_at
    FROM users
    ORDER BY created_at;
  `);

  return result.rows;
}

/**
 * Fetches a specific user from database, found by name.
 *
 * @returns (Promise<object[]>) An array of (theoretically) one user row containing
 *          id, name, category, nutritional_metadata, and created_at of the found user.
 */
export async function querySpecificUserName(username: string) {
  const result = await pool.query(`
    SELECT id, email, username, password_hash, first_name, last_name, created_at, updated_at
    FROM users
    WHERE username = '${username}';
  `);

  return result.rows;
}

/**
 * Fetches a specific user from database, found by id.
 *
 * @returns (Promise<object[]>) An array of (theoretically) one user row containing
 *          id, name, category, nutritional_metadata, and created_at of the found user.
 */
export async function querySpecificUserID(user_id: string) {
  const result = await pool.query(`
    SELECT id, email, username, password_hash, first_name, last_name, created_at, updated_at
    FROM users
    WHERE id = '${user_id}';
  `);

  return result.rows;
}

/**
 * Inserts a new user into the database after normalizing its name.
 * Throws a descriptive error if a duplicate user name is detected.
 *
 * @param input - (CreateUserInput) The validated user data to insert,
 *                including name, optional category, and optional nutritional metadata.
 * @returns (Promise<object>) The newly created user row, including its
 *          generated id and created_at timestamp.
 */
export async function addUserToTable(
  input: CreateUserInput
) {
  try {

    // Insert the user and return the full created record
    const result = await pool.query(
      `
      INSERT INTO users
      (email, username, password_hash, first_name, last_name)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, email, username, password_hash, first_name, last_name, created_at;
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