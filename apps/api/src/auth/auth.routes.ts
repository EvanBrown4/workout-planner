import { Router } from "express";
import {
  register,
  login,
  logout,
  me,
  requireAuth
} from "./auth.controller.js";

export const authRouter = Router();

authRouter.get("/me", requireAuth, me);

authRouter.post("/register", register);

authRouter.post("/login", login);

authRouter.post("/logout", logout);