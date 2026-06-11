import { hashPassword, verifyPassword } from "../utils/password.js";
import { createUser, getUserByEmail, getUserByUsername } from "../users/users.service.js";
import { AppError } from "../middleware/errors.middleware.js";

export async function register(
  email: string,
  username: string,
  first_name: string,
  password: string,
  last_name?: string
) {
  let user = await getUserByEmail(email);

  if (user !== null) {
    throw new AppError("Email already in use.");
  }

  user = await getUserByUsername(username);

  if (user !== null) {
    throw new AppError("Username already in use.");
  }

  const passwordHash = await hashPassword(password);

  return createUser({
    email,
    username,
    password_hash: passwordHash,
    first_name,
    last_name
  });
}

export async function login(email: string, password: string) {
  const user = await getUserByEmail(email);

  if (user == null) {
    throw new AppError("Invalid email or password");
  }

  const valid = await verifyPassword(password, user.password_hash);

  if (!valid) {
    throw new AppError("Invalid email or password");
  }

  const { password_hash, ...safeUser } = user;
  return safeUser;
}