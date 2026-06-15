import { Request, Response } from "express";
import { createWorkoutSchema } from "./workouts.schema.js";
import * as workoutsService from "./workouts.service.js";


export async function createWorkout(req: Request, res: Response) {
  /* Validate the request body against the user schema */
  const input = createWorkoutSchema.safeParse(req.body);

  // Reject the request if validation fails
  if (!input.success) {
    return res.status(400).json({
      error: "Validation failed",
      details: input.error,
    });
  }

  /* Insert the validated user into the database */
  const workout = await workoutsService.createWorkout(input.data, req.session.userId);

  res.status(201).json({
    data: workout,
  });
}