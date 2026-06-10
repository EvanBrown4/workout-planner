import { Router } from "express";
import {
  getUsers,
  createUser,
  getUserInformation,
} from "./users.controller.js";

/* Register all routes for the users resource */
export const usersRouter = Router();

// GET / — fetch all users
usersRouter.get("/", getUsers);

// POST / — create a new user
usersRouter.post("/", createUser);

// GET /:id - fetch user information for corresponding id
usersRouter.get("/:id", getUserInformation);