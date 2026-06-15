// workouts.docs.ts
import { createWorkoutSchema } from "./workouts.schema.js";

/*
 * OpenAPI documentation for the /v1/workouts route.
 */
export const workoutsDocs = {
  "/v1/workouts/": {
    get: {
      tags: ["Workouts"],
      summary: "Get all user's workouts or search by status, type, or date range",

      parameters: [
        {
          name: "status",
          in: "query",
          required: false,
          description: "Filter workouts by status",
          schema: {
            type: "string",
            enum: ["planned", "completed", "skipped"],
            example: "planned",
          },
        },
        {
          name: "workout_type",
          in: "query",
          required: false,
          description: "Filter workouts by workout type",
          schema: {
            type: "string",
            enum: ["running", "cycling", "swimming"],
            example: "running",
          },
        },
        {
          name: "earliest_date",
          in: "query",
          required: false,
          description: "Filter workouts by earliest date",
          schema: {
            type: "string",
            format: "date",
            example: "2026-01-23",
          },
        },
        {
          name: "latest_date",
          in: "query",
          required: false,
          description: "Filter workouts by latest date",
          schema: {
            type: "string",
            format: "date",
            example: "2026-06-01",
          },
        },
      ],

      responses: {
        200: {
          description: "Workouts returned successfully",
        },
        400: {
          description: "Invalid status or workout type",
        },
        500: {
          description: "Failed to fetch workouts",
        },
      },
    },

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

  "/v1/workouts/{id}": {
    get: {
      tags: ["Workouts"],
      summary: "Get a specific workout by ID",

      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          description: "Workout UUID",
          schema: {
            type: "string",
            format: "uuid",
          },
        },
        {
          name: "type",
          in: "query",
          required: true,
          description: "Workout type",
          schema: {
            type: "string",
            enum: ["running", "cycling", "swimming"],
            example: "running",
          },
        },
      ],

      responses: {
        200: {
          description: "Workout returned successfully",
        },
        400: {
          description: "Missing or invalid workout type",
        },
        404: {
          description: "Workout not found",
        },
        500: {
          description: "Failed to fetch workout",
        },
      },
    },
  },
};