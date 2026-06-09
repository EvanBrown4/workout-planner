-- 001_init.sql
-- Initial schema for Recipe Recommendation MVP

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  instructions TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ingredients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS recipe_ingredients (
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  ingredient_id UUID NOT NULL REFERENCES ingredients(id) ON DELETE RESTRICT,
  quantity NUMERIC(10, 2),
  unit TEXT,
  PRIMARY KEY (recipe_id, ingredient_id)
);

CREATE TABLE IF NOT EXISTS substitutions (
  from_ingredient_id UUID NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
  to_ingredient_id UUID NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
  note TEXT,
  confidence SMALLINT NOT NULL DEFAULT 50,
  PRIMARY KEY (from_ingredient_id, to_ingredient_id),
  CONSTRAINT substitutions_no_self CHECK (from_ingredient_id <> to_ingredient_id)
);

CREATE INDEX IF NOT EXISTS idx_recipe_ingredients_recipe
  ON recipe_ingredients(recipe_id);

CREATE INDEX IF NOT EXISTS idx_recipe_ingredients_ingredient
  ON recipe_ingredients(ingredient_id);

CREATE INDEX IF NOT EXISTS idx_substitutions_from
  ON substitutions(from_ingredient_id);
