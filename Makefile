# ------------------------
# Config
# ------------------------

DB_CONTAINER=workout-db
DATABASE_URL=postgres://workout_user:workout_pass@localhost:5111/workout_mvp

# ------------------------
# Docker / DB
# ------------------------

db-up:
	@echo "🚀 Starting Postgres..."
	docker compose up -d
	@echo "⏳ Waiting for database to become healthy..."
	@until [ "$$(docker inspect --format='{{.State.Health.Status}}' $(DB_CONTAINER) 2>/dev/null)" = "healthy" ]; do \
		sleep 2; \
	done
	@echo "✅ Database is up and healthy"

db-down:
	@echo "🛑 Stopping database (data preserved)..."
	docker compose down

db-reset:
	@echo "🔥 Resetting database (THIS DELETES DATA + VOLUME)..."
	@read -r -p "Type 'RESET' to continue: " ans; \
	if [ "$$ans" != "RESET" ]; then \
		echo "❌ Aborted."; \
		exit 1; \
	fi
	docker compose down -v
	docker compose up -d
	@until [ "$$(docker inspect --format='{{.State.Health.Status}}' $(DB_CONTAINER) 2>/dev/null)" = "healthy" ]; do \
		sleep 2; \
	done
	@echo "✅ Fresh database ready"

db-logs:
	docker logs $(DB_CONTAINER)

db-psql:
	docker exec -it $(DB_CONTAINER) psql -U workout_user -d workout_mvp

# ------------------------
# Migrations / Seeds
# ------------------------

db-migrateup:
	@echo "📦 Running migrations..."
	for file in db/migrations/*.sql; do \
		echo "Running $$file"; \
		docker exec -i $(DB_CONTAINER) psql -U workout_user -d workout_mvp < $$file; \
	done
	@echo "✅ Migrations complete"

seed:
	@echo "🌱 Seeding database..."
	npx cross-env DATABASE_URL="$(DATABASE_URL)" npx tsx db/seeds/seed.ts
	@echo "✅ Seed complete"

db-rebuild: db-reset db-migrateup

reset-and-seed: db-reset db-migrateup seed

# ------------------------
# App commands
# ------------------------

web:
	cd apps/web && npm run dev

api:
	@echo "Access docs via http://localhost:4000/docs"
	cd apps/api && npm run dev

recommender:
	cd services/recommender && python src/main.py

# ------------------------
# Help
# ------------------------

help:
	@echo ""
	@echo "Available commands:"
	@echo "  make db-up            Start Postgres"
	@echo "  make db-down          Stop Postgres"
	@echo "  make db-reset         Reset Postgres (DELETES DATA)"
	@echo "  make db-logs          View Postgres logs"
	@echo "  make db-psql          Open psql inside container"
	@echo "  make db-migrateup     Run SQL files in db/migrations"
	@echo "  make seed             Run SQL files in db/seeds"
	@echo "  make db-rebuild       Reset + migrate"
	@echo "  make reset-and-seed   Reset + migrate + seed"
	@echo "  make web              Start up web"
	@echo "  make api              Start up api"
	@echo "  make recommender      Start up recommender"
	@echo ""