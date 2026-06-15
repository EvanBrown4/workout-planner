import { Router } from "express";
import {
  createWorkout
} from "./workouts.controller.js";
import { requireAuth } from "../auth/auth.controller.js";
import { createWorkoutSchema } from "./workouts.schema.js";

/* Register all routes for the users resource */
export const workoutsRouter = Router();

workoutsRouter.post("/", requireAuth, createWorkout)