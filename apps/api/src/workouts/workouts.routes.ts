import { Router } from "express";
import {
  createWorkout,
  getWorkouts
} from "./workouts.controller.js";
import { requireAuth } from "../auth/auth.controller.js";

/* Register all routes for the users resource */
export const workoutsRouter = Router();

workoutsRouter.post("/", requireAuth, createWorkout);

workoutsRouter.get("/", requireAuth, getWorkouts);