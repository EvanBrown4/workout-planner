import { pool } from "./pool.js";

export async function testDbConnection() {
  const result = await pool.query("SELECT NOW() as now;");
  console.log("Database connected:", result.rows[0]);
}