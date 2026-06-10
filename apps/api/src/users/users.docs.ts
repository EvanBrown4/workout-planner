import { createUserSchema } from "./users.schema.js";

/*
 * OpenAPI documentation for the /v1/users route.
 * Covers GET (fetch) and POST (create new) operations.
 */
export const usersDocs = {
  "/v1/users": {
    // GET endpoint: retrieve all users
    get: {
      tags: ["Users"],
      summary: "Get all users or search by name",

      parameters: [
        {
          name: "name",
          in: "query",
          required: false,
          description: "Filter users by name",
          schema: {
            type: "string",
          },
        },
      ],

      responses: {
        200: {
          description: "Users returned successfully",
        },
      },
    },
    // POST endpoint: create a new user
    post: {
      tags: ["Users"],
      summary: "Create an user",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            // Reuse the Zod schema to define the expected request body shape
            schema: createUserSchema,
          },
        },
      },
      responses: {
        201: {
          description: "User created successfully",
        },
        400: {
          description: "Validation failed",
        },
        500: {
          description: "User already exists."
        }
      },
    },
  },
  "/v1/users/{id}": {
    get: {
      tags: ["Users"],
      summary: "Get a specific user by ID",
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          description: "User UUID",
          schema: {
            type: "string",
            format: "uuid",
          },
        },
      ],
      responses: {
        200: {
          description: "User returned successfully",
        },
        404: {
          description: "User not found",
        },
        500: {
          description: "Failed to fetch user",
        },
      },
    },
  },
};