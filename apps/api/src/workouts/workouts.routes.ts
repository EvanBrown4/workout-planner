import { Router } from "express";
import {
  createWorkout,
  deleteWorkout,
  getWorkoutInformation,
  getWorkouts,
  updateWorkout,
  updateWorkoutStatus,
} from "./workouts.controller.js";
import { requireAuth } from "../auth/auth.controller.js";

/* Register all routes for the users resource */
export const workoutsRouter = Router();

workoutsRouter.post("/", requireAuth, createWorkout);

workoutsRouter.get("/", requireAuth, getWorkouts);

workoutsRouter.get("/:id", requireAuth, getWorkoutInformation)

workoutsRouter.put("/:id", requireAuth, updateWorkout);

workoutsRouter.patch("/:id/status", requireAuth, updateWorkoutStatus);

workoutsRouter.delete("/:id", requireAuth, deleteWorkout);