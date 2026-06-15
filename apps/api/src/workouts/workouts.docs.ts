import { createWorkoutSchema } from "./workouts.schema.js";

/*
 * OpenAPI documentation for the /v1/workouts route.
 */
export const workoutsDocs = {
  "/v1/workouts/": {
    post: {
      tags: ["Workouts"],
      summary: "Create a new workout",

      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: createWorkoutSchema,
          },
        },
      },

      responses: {
        201: {
          description: "Workout created successfully",
        },
        400: {
          description: "Validation failed",
        },
        500: {
          description: "Failed to create workout",
        },
      },
    },
  },
};