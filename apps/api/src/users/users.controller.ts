import type { Request, Response } from "express";
import { createUserSchema } from "./users.schema.js";
import * as usersService from "./users.service.js";

/**
 * Retrieves all uyser from the database and returns them as JSON.
 *
 * @param req - The incoming HTTP request.
 * @param res - The HTTP response, returning a JSON array of all users
 *              or a 500 error if the query fails.
 */
export async function getUsers(req: Request, res: Response) {
  console.log("[getRecipes] Request received");
  console.log("[getRecipes] query:", req.query);
  try {
    const username = req.query.username as string | undefined;

    let users;

    if (username) {
      users = await usersService.getUserByUsername(username);
    } else {
      users = await usersService.queryAllUsers();
    }

    res.json({
      data: users,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Failed to fetch users",
    });
  }
}

/**
 * Retrieves information for specified user from the database and returns them as JSON.
 *
 * @param req - The incoming HTTP request.
 * @param res - The HTTP response, returning a JSON array of all users
 *              or a 500 error if the query fails.
 */
export async function getUserInformation(req: Request, res: Response) {
  try {
    /* Fetch all users from the database */
    let user_id = req.params.id;
    if (Array.isArray(user_id)) {
      user_id = user_id[0]; 
    }
    const users = await usersService.getUserByID(user_id);

    if (!users || users.length === 0) {
      return res.status(404).json({
        error: `User with ID '${user_id}' not found`,
      });
    }

    return res.json({
      data: users,
    });

    
  } catch (err) {
    console.error(err);

    // Respond with a 500 if the database query fails
    return res.status(500).json({
      error: "Failed to fetch user information",
    });
  }
}

/**
 * Validates the request body and creates a new user in the database.
 *
 * @param req - The incoming HTTP request, with a body matching CreateUserInput.
 * @param res - The HTTP response, returning the created user with status 201,
 *              or a 400 error if validation fails.
 */
export async function createUser(req: Request, res: Response) {
  /* Validate the request body against the user schema */
  const result = createUserSchema.safeParse(req.body);

  // Reject the request if validation fails
  if (!result.success) {
    return res.status(400).json({
      error: "Validation failed",
      details: result.error,
    });
  }

  /* Insert the validated user into the database */
  const user = await usersService.createUser(result.data);

  res.status(201).json({
    data: user,
  });
}