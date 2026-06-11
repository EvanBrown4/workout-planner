import express from "express";
import session from "express-session";
import swaggerUi from "swagger-ui-express";
import cors from "cors";
import "dotenv/config";
import { openApiDocument } from "./docs/openapi.js";
import { testDbConnection } from "./db/test-db.js";
import {usersRouter} from "./users/users.routes.js";
import { authRouter } from "./auth/auth.routes.js";
import { errorHandler } from "./middleware/errors.middleware.js";

/* Verify the database is reachable before starting the server */
await testDbConnection();

const app = express();

app.use(cors({
  origin: "http://localhost:6129",
  credentials: true,
}));  

/* Register global middleware */
app.use(session({
  secret: process.env.SESSION_SECRET!,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 1000 * 60 * 60 * 24, // 24 hours
  },
}));

app.use(express.json());

// Health check route
app.get("/", (req, res) => {
  res.send("Workout API is running");
});

/* Mount resource routers */
app.use("/v1/users", usersRouter);
app.use("/v1/auth", authRouter);


app.use(errorHandler);

// Serve the Swagger UI at /docs
app.use(
  "/docs",
  swaggerUi.serve,
  swaggerUi.setup(openApiDocument)
);

// Start listening for incoming requests
app.listen(4000, () => {
  console.log("Server running on port 4000");
});