import type { Request, Response, NextFunction } from "express";
import * as authService from "./auth.service.js";
import { getUserByID } from "../users/users.service.js";

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await authService.register(
      req.body.email,
      req.body.username,
      req.body.first_name,
      req.body.password,
      req.body.last_name
    );
    res.status(201).json(user);
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await authService.login(
      req.body.email,
      req.body.password
    );
    req.session.userId = user.id;
    res.status(200).json({ message: "Logged in successfully" });
  } catch (err) {
    next(err);
  }
}

export async function me(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  try {
    const user = await getUserByID(req.session.userId);
    res.json(user);
  } catch (err) {
    next(err);
  }
}

export async function logout(req: Request, res: Response, next: NextFunction) {
  req.session.destroy((err) => {
    if (err) return next(err);

    res.clearCookie("connect.sid");
    res.status(200).json({ message: "Logged out" });
  });
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  next();
}