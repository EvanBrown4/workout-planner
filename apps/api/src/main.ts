import express from "express";
import swaggerUi from "swagger-ui-express";
import cors from "cors";
import { openApiDocument } from "./docs/openapi.js";
import { testDbConnection } from "./db/test-db.js";

/* Verify the database is reachable before starting the server */
await testDbConnection();

const app = express();

app.use(cors({
  origin: "http://localhost:6129",
}));

/* Register global middleware */
app.use(express.json());

// Health check route
app.get("/", (req, res) => {
  res.send("Workout API is running");
});

/* Mount resource routers */
// app.use("/v1/ingredients", ingredientsRouter);

// Start listening for incoming requests
app.listen(3000, () => {
  console.log("Server running on port 4000");
});

// Serve the Swagger UI at /docs
app.use(
  "/docs",
  swaggerUi.serve,
  swaggerUi.setup(openApiDocument)
);