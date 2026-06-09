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

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- Planned Workouts
-- =====================================================

CREATE TABLE workouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    training_plan_id UUID
        REFERENCES training_plans(id)
        ON DELETE CASCADE,

    user_id UUID NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,

    title TEXT NOT NULL,

    workout_type TEXT NOT NULL,

    scheduled_date DATE NOT NULL,

    duration_minutes INTEGER,
    distance_miles NUMERIC(6,2),

    notes TEXT,

    status TEXT NOT NULL DEFAULT 'planned'
        CHECK (status IN ('planned', 'completed', 'skipped')),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
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

    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,

    actual_duration_minutes INTEGER,
    actual_distance_miles NUMERIC(6,2),

    average_hr INTEGER,
    max_hr INTEGER,

    calories INTEGER,

    notes TEXT,

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

    file_name TEXT NOT NULL,

    file_size_bytes BIGINT,

    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    parsed BOOLEAN NOT NULL DEFAULT FALSE,

    raw_metadata JSONB
);

-- =====================================================
-- Indexes
-- =====================================================

CREATE INDEX idx_workouts_user
ON workouts(user_id);

CREATE INDEX idx_workouts_date
ON workouts(scheduled_date);

CREATE INDEX idx_logs_user
ON workout_logs(user_id);

CREATE INDEX idx_events_date
ON events(start_date);

CREATE INDEX idx_fit_uploads_user
ON fit_uploads(user_id);