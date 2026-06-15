-- =====================================================
-- Extensions
-- =====================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- Users
-- =====================================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    email TEXT NOT NULL UNIQUE,
    username TEXT NOT NULL UNIQUE,

    password_hash TEXT NOT NULL,

    first_name TEXT,
    last_name TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- Training Plans
-- =====================================================

CREATE TABLE training_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,

    name TEXT NOT NULL,

    start_date DATE NOT NULL,
    end_date DATE NOT NULL,

    description TEXT,

    status TEXT NOT NULL DEFAULT 'active'
        CHECK (status IN ('active', 'completed', 'archived')),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- Planned Workouts
-- =====================================================

CREATE TABLE workouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,

    title TEXT NOT NULL,

    workout_type TEXT NOT NULL
        CHECK (workout_type IN ('running', 'cycling', 'swimming')),

    scheduled_date DATE,

    notes TEXT,

    status TEXT NOT NULL DEFAULT 'planned'
        CHECK (status IN ('planned', 'completed', 'skipped')),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- Workout Details — Running
-- =====================================================

CREATE TABLE workout_details_running (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    workout_id UUID NOT NULL UNIQUE
        REFERENCES workouts(id)
        ON DELETE CASCADE,

    target_distance_meters  INTEGER,
    target_duration_seconds INTEGER,
    target_pace_sec_per_m   INTEGER
);

-- =====================================================
-- Workout Details — Cycling
-- =====================================================

CREATE TABLE workout_details_cycling (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    workout_id UUID NOT NULL UNIQUE
        REFERENCES workouts(id)
        ON DELETE CASCADE,

    target_distance_meters  INTEGER,
    target_duration_seconds INTEGER,
    target_pace_sec_per_m   INTEGER,
    bike_type               TEXT CHECK (bike_type IN ('road', 'mountain', 'indoor', 'gravel'))
);

-- =====================================================
-- Workout Details — Swimming
-- =====================================================

CREATE TABLE workout_details_swimming (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    workout_id UUID NOT NULL UNIQUE
        REFERENCES workouts(id)
        ON DELETE CASCADE,

    target_distance_meters  INTEGER,
    target_duration_seconds INTEGER,
    target_pace_sec_per_m   INTEGER,
    pool_length_meters      INTEGER CHECK (pool_length_meters IN (25, 50)),
    stroke                  TEXT CHECK (stroke IN ('freestyle', 'backstroke', 'breaststroke', 'butterfly', 'mixed'))
);

-- =====================================================
-- Workout Steps
-- =====================================================

CREATE TABLE workout_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    workout_id UUID NOT NULL
        REFERENCES workouts(id)
        ON DELETE CASCADE,

    step_order INTEGER NOT NULL,

    step_type TEXT NOT NULL
        CHECK (step_type IN ('warmup', 'run', 'recovery', 'cooldown', 'rest', 'other')),

    end_condition TEXT NOT NULL
        CHECK (end_condition IN ('distance', 'time', 'manual')),

    end_condition_value INTEGER,   -- meters if distance, seconds if time, null if manual

    target_type TEXT
        CHECK (target_type IN ('pace', 'hr', 'hr_zone')),

    target_value INTEGER,

    notes TEXT,

    UNIQUE (workout_id, step_order)
);

-- =====================================================
-- Workout Logs
-- =====================================================

CREATE TABLE workout_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    workout_id UUID
        REFERENCES workouts(id)
        ON DELETE SET NULL,

    user_id UUID NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,

    completed_at TIMESTAMPTZ,

    duration_seconds  INTEGER,
    distance_meters   INTEGER,
    elevation_gain_meters INTEGER,

    avg_hr    INTEGER,
    avg_pace_sec_per_m NUMERIC(10,6),

    notes  TEXT,
    source TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- Events / Races
-- =====================================================

CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    creator_id UUID NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,

    title TEXT NOT NULL,

    event_type TEXT NOT NULL,

    start_date DATE NOT NULL,
    end_date DATE,

    location TEXT,

    description TEXT,

    highlighted BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- Event Participants
-- =====================================================

CREATE TABLE event_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    event_id UUID NOT NULL
        REFERENCES events(id)
        ON DELETE CASCADE,

    user_id UUID NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,

    status TEXT NOT NULL DEFAULT 'going'
        CHECK (
            status IN (
                'invited',
                'going',
                'maybe',
                'declined'
            )
        ),

    UNIQUE(event_id, user_id)
);

-- =====================================================
-- Workout Participants
-- =====================================================

CREATE TABLE workout_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    workout_id UUID NOT NULL
        REFERENCES workouts(id)
        ON DELETE CASCADE,

    user_id UUID NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,

    UNIQUE(workout_id, user_id)
);

-- =====================================================
-- Invitations
-- =====================================================

CREATE TABLE invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    sender_id UUID NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,

    recipient_id UUID NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,

    entity_type TEXT NOT NULL
        CHECK (
            entity_type IN (
                'event',
                'workout'
            )
        ),

    entity_id UUID NOT NULL,

    status TEXT NOT NULL DEFAULT 'pending'
        CHECK (
            status IN (
                'pending',
                'accepted',
                'declined'
            )
        ),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- FIT Uploads
-- =====================================================

CREATE TABLE fit_uploads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,

    workout_log_id UUID
        REFERENCES workout_logs(id)
        ON DELETE SET NULL,

    file_name     TEXT NOT NULL,
    storage_path  TEXT NOT NULL,

    parsed_status TEXT NOT NULL DEFAULT 'pending'
        CHECK (parsed_status IN ('pending', 'processing', 'complete', 'failed')),

    parsed_metadata_json JSONB,

    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- Indexes
-- =====================================================

CREATE INDEX idx_workouts_user
ON workouts(user_id);

CREATE INDEX idx_workouts_date
ON workouts(scheduled_date);

CREATE INDEX idx_workouts_type
ON workouts(workout_type);

CREATE INDEX idx_workout_steps_workout
ON workout_steps(workout_id);

CREATE INDEX idx_logs_user
ON workout_logs(user_id);

CREATE INDEX idx_training_plans_user
ON training_plans(user_id);

CREATE INDEX idx_events_date
ON events(start_date);

CREATE INDEX idx_fit_uploads_user
ON fit_uploads(user_id);

-- Details tables are joined by workout_id; the UNIQUE constraint
-- creates the index automatically, so no explicit index needed.