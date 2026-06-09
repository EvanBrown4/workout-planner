import fs from "node:fs";
import path from "node:path";
import { Client } from "pg";
import "dotenv/config";

type UserSeed = {
  email: string;
  username: string;
  password_hash: string;
  first_name?: string | null;
  last_name?: string | null;
};

function readJson<T>(fileRel: string): T {
  const p = path.join(process.cwd(), "db", "seeds", "data", fileRel);
  const raw = fs.readFileSync(p, "utf-8");
  return JSON.parse(raw) as T;
}

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error("Missing DATABASE_URL");

  const client = new Client({ connectionString: databaseUrl });
  await client.connect();

  try {
    await client.query("BEGIN");

    await client.query(`
      TRUNCATE TABLE
        fit_uploads,
        invitations,
        workout_participants,
        event_participants,
        workout_logs,
        workouts,
        events,
        training_plans,
        users
      RESTART IDENTITY CASCADE;
    `);

    const users = readJson<UserSeed[]>("users.json");

    for (const user of users) {
      await client.query(
        `
        INSERT INTO users (
          email,
          username,
          password_hash,
          first_name,
          last_name
        )
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (email)
        DO UPDATE SET
          username = EXCLUDED.username,
          password_hash = EXCLUDED.password_hash,
          first_name = EXCLUDED.first_name,
          last_name = EXCLUDED.last_name,
          updated_at = NOW();
        `,
        [
          user.email.trim().toLowerCase(),
          user.username.trim().toLowerCase(),
          user.password_hash,
          user.first_name ?? null,
          user.last_name ?? null,
        ]
      );
    }

    await client.query("COMMIT");
    console.log("✅ Seed complete");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("❌ Seed failed:", err);
    throw err;
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error("Unhandled error:");
  console.error(err);
  process.exit(1);
});