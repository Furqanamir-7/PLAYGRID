-- ============================================================================
-- PLAYGRID: Initial Migration & Schema Definition
-- Tables, Constraints, Indexes, Views, Triggers, Functions & Stored Procedures
-- ============================================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create Enums
DO $$ BEGIN
    CREATE TYPE "Role" AS ENUM ('SUPER_ADMIN', 'ORGANIZER', 'TEAM_MANAGER', 'VIEWER');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "Province" AS ENUM ('Sindh', 'Punjab', 'KPK', 'Balochistan', 'ICT', 'GB', 'AJK');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "SurfaceType" AS ENUM ('artificial_turf', 'indoor_wooden', 'sports_court');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "TournamentFormat" AS ENUM ('LEAGUE', 'KNOCKOUT', 'GROUP_KNOCKOUT');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "TournamentStatus" AS ENUM ('DRAFT', 'REGISTRATION_OPEN', 'REGISTRATION_CLOSED', 'ONGOING', 'COMPLETED', 'CANCELLED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "Position" AS ENUM ('GOALKEEPER', 'DEFENDER', 'WINGER', 'PIVOT');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "RegistrationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'WITHDRAWN');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "PaymentMethod" AS ENUM ('JAZZCASH', 'EASYPAISA', 'BANK_TRANSFER', 'CASH');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'VERIFIED', 'FAILED', 'REFUNDED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "MatchStatus" AS ENUM ('SCHEDULED', 'LIVE', 'COMPLETED', 'POSTPONED', 'CANCELLED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "RefereeCertLevel" AS ENUM ('NATIONAL', 'REGIONAL', 'LOCAL');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "OfficialRole" AS ENUM ('FIRST_REFEREE', 'SECOND_REFEREE', 'TIMEKEEPER');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "EventType" AS ENUM ('GOAL', 'OWN_GOAL', 'YELLOW_CARD', 'RED_CARD', 'FOUL');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Create Core Tables
CREATE TABLE IF NOT EXISTS "users" (
    "id" TEXT PRIMARY KEY,
    "name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(150) NOT NULL UNIQUE,
    "password_hash" TEXT NOT NULL,
    "phone" VARCHAR(20),
    "role" "Role" NOT NULL DEFAULT 'TEAM_MANAGER',
    "is_active" BOOLEAN NOT NULL DEFAULT TRUE,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "cities" (
    "id" TEXT PRIMARY KEY,
    "name" VARCHAR(50) NOT NULL UNIQUE,
    "province" "Province" NOT NULL
);

CREATE TABLE IF NOT EXISTS "venues" (
    "id" TEXT PRIMARY KEY,
    "name" VARCHAR(100) NOT NULL,
    "address" TEXT NOT NULL,
    "city_id" TEXT NOT NULL REFERENCES "cities"("id") ON DELETE RESTRICT,
    "surface_type" "SurfaceType" NOT NULL,
    "capacity" INT NOT NULL DEFAULT 200,
    "has_floodlights" BOOLEAN NOT NULL DEFAULT TRUE,
    "contact_phone" VARCHAR(20)
);

CREATE TABLE IF NOT EXISTS "sports" (
    "id" TEXT PRIMARY KEY,
    "name" VARCHAR(50) NOT NULL UNIQUE,
    "players_on_field" INT NOT NULL DEFAULT 5,
    "max_squad_size" INT NOT NULL DEFAULT 12,
    "match_duration_minutes" INT NOT NULL DEFAULT 40,
    "periods" INT NOT NULL DEFAULT 2
);

CREATE TABLE IF NOT EXISTS "tournaments" (
    "id" TEXT PRIMARY KEY,
    "name" VARCHAR(150) NOT NULL,
    "slug" VARCHAR(150) NOT NULL UNIQUE,
    "sport_id" TEXT NOT NULL REFERENCES "sports"("id") ON DELETE RESTRICT,
    "city_id" TEXT NOT NULL REFERENCES "cities"("id") ON DELETE RESTRICT,
    "organizer_id" TEXT NOT NULL REFERENCES "users"("id") ON DELETE RESTRICT,
    "format" "TournamentFormat" NOT NULL,
    "status" "TournamentStatus" NOT NULL DEFAULT 'DRAFT',
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "registration_deadline" DATE NOT NULL,
    "entry_fee_pkr" NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK ("entry_fee_pkr" >= 0),
    "prize_pool_pkr" NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK ("prize_pool_pkr" >= 0),
    "max_teams" INT NOT NULL DEFAULT 8,
    "min_squad_size" INT NOT NULL DEFAULT 7,
    "max_squad_size" INT NOT NULL DEFAULT 12,
    "points_win" INT NOT NULL DEFAULT 3,
    "points_draw" INT NOT NULL DEFAULT 1,
    "points_loss" INT NOT NULL DEFAULT 0,
    "description" TEXT,
    "banner_url" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT "chk_dates_valid" CHECK ("end_date" >= "start_date")
);

CREATE TABLE IF NOT EXISTS "tournament_venues" (
    "tournament_id" TEXT NOT NULL REFERENCES "tournaments"("id") ON DELETE CASCADE,
    "venue_id" TEXT NOT NULL REFERENCES "venues"("id") ON DELETE RESTRICT,
    PRIMARY KEY ("tournament_id", "venue_id")
);

CREATE TABLE IF NOT EXISTS "teams" (
    "id" TEXT PRIMARY KEY,
    "name" VARCHAR(100) NOT NULL UNIQUE,
    "short_name" VARCHAR(4) NOT NULL,
    "city_id" TEXT NOT NULL REFERENCES "cities"("id") ON DELETE RESTRICT,
    "manager_id" TEXT NOT NULL REFERENCES "users"("id") ON DELETE RESTRICT,
    "logo_url" TEXT,
    "primary_color" VARCHAR(10) NOT NULL DEFAULT '#8E4585',
    "founded_year" INT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "players" (
    "id" TEXT PRIMARY KEY,
    "full_name" VARCHAR(100) NOT NULL,
    "date_of_birth" DATE NOT NULL,
    "cnic" VARCHAR(15) UNIQUE,
    "phone" VARCHAR(20),
    "preferred_position" "Position" NOT NULL,
    "photo_url" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "team_players" (
    "id" TEXT PRIMARY KEY,
    "team_id" TEXT NOT NULL REFERENCES "teams"("id") ON DELETE CASCADE,
    "player_id" TEXT NOT NULL REFERENCES "players"("id") ON DELETE CASCADE,
    "tournament_id" TEXT NOT NULL REFERENCES "tournaments"("id") ON DELETE CASCADE,
    "jersey_number" INT NOT NULL CHECK ("jersey_number" BETWEEN 1 AND 99),
    "is_captain" BOOLEAN NOT NULL DEFAULT FALSE,
    "joined_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT "uq_tournament_player" UNIQUE ("tournament_id", "player_id"),
    CONSTRAINT "uq_tournament_team_jersey" UNIQUE ("tournament_id", "team_id", "jersey_number")
);

CREATE UNIQUE INDEX IF NOT EXISTS "uq_team_captain_per_tournament" 
ON "team_players" ("tournament_id", "team_id") 
WHERE "is_captain" = TRUE;

CREATE TABLE IF NOT EXISTS "registrations" (
    "id" TEXT PRIMARY KEY,
    "tournament_id" TEXT NOT NULL REFERENCES "tournaments"("id") ON DELETE CASCADE,
    "team_id" TEXT NOT NULL REFERENCES "teams"("id") ON DELETE CASCADE,
    "status" "RegistrationStatus" NOT NULL DEFAULT 'PENDING',
    "submitted_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "reviewed_by" TEXT REFERENCES "users"("id") ON DELETE SET NULL,
    "reviewed_at" TIMESTAMPTZ,
    "rejection_reason" TEXT,
    CONSTRAINT "uq_tournament_team_reg" UNIQUE ("tournament_id", "team_id")
);

CREATE TABLE IF NOT EXISTS "payments" (
    "id" TEXT PRIMARY KEY,
    "registration_id" TEXT NOT NULL REFERENCES "registrations"("id") ON DELETE CASCADE,
    "amount_pkr" NUMERIC(12, 2) NOT NULL CHECK ("amount_pkr" >= 0),
    "method" "PaymentMethod" NOT NULL,
    "transaction_ref" VARCHAR(100) NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "paid_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "verified_by" TEXT REFERENCES "users"("id") ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS "groups" (
    "id" TEXT PRIMARY KEY,
    "tournament_id" TEXT NOT NULL REFERENCES "tournaments"("id") ON DELETE CASCADE,
    "name" VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS "group_teams" (
    "group_id" TEXT NOT NULL REFERENCES "groups"("id") ON DELETE CASCADE,
    "team_id" TEXT NOT NULL REFERENCES "teams"("id") ON DELETE CASCADE,
    PRIMARY KEY ("group_id", "team_id")
);

CREATE TABLE IF NOT EXISTS "stages" (
    "id" TEXT PRIMARY KEY,
    "tournament_id" TEXT NOT NULL REFERENCES "tournaments"("id") ON DELETE CASCADE,
    "name" VARCHAR(50) NOT NULL,
    "stage_order" INT NOT NULL,
    "is_knockout" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "matches" (
    "id" TEXT PRIMARY KEY,
    "tournament_id" TEXT NOT NULL REFERENCES "tournaments"("id") ON DELETE CASCADE,
    "stage_id" TEXT NOT NULL REFERENCES "stages"("id") ON DELETE RESTRICT,
    "group_id" TEXT REFERENCES "groups"("id") ON DELETE SET NULL,
    "round_number" INT NOT NULL DEFAULT 1,
    "home_team_id" TEXT NOT NULL REFERENCES "teams"("id") ON DELETE RESTRICT,
    "away_team_id" TEXT REFERENCES "teams"("id") ON DELETE RESTRICT,
    "venue_id" TEXT NOT NULL REFERENCES "venues"("id") ON DELETE RESTRICT,
    "scheduled_at" TIMESTAMPTZ NOT NULL,
    "status" "MatchStatus" NOT NULL DEFAULT 'SCHEDULED',
    "next_match_id" TEXT REFERENCES "matches"("id") ON DELETE SET NULL,
    "next_match_slot" VARCHAR(10),
    CONSTRAINT "chk_teams_distinct" CHECK ("home_team_id" <> "away_team_id")
);

CREATE TABLE IF NOT EXISTS "referees" (
    "id" TEXT PRIMARY KEY,
    "full_name" VARCHAR(100) NOT NULL,
    "phone" VARCHAR(20) NOT NULL,
    "city_id" TEXT NOT NULL REFERENCES "cities"("id") ON DELETE RESTRICT,
    "certification_level" "RefereeCertLevel" NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS "match_officials" (
    "match_id" TEXT NOT NULL REFERENCES "matches"("id") ON DELETE CASCADE,
    "referee_id" TEXT NOT NULL REFERENCES "referees"("id") ON DELETE RESTRICT,
    "role" "OfficialRole" NOT NULL,
    PRIMARY KEY ("match_id", "role"),
    CONSTRAINT "uq_match_referee" UNIQUE ("match_id", "referee_id")
);

CREATE TABLE IF NOT EXISTS "match_results" (
    "match_id" TEXT PRIMARY KEY REFERENCES "matches"("id") ON DELETE CASCADE,
    "home_score" INT NOT NULL DEFAULT 0 CHECK ("home_score" >= 0),
    "away_score" INT NOT NULL DEFAULT 0 CHECK ("away_score" >= 0),
    "home_penalties" INT,
    "away_penalties" INT,
    "winner_team_id" TEXT REFERENCES "teams"("id") ON DELETE SET NULL,
    "home_fouls" INT NOT NULL DEFAULT 0 CHECK ("home_fouls" >= 0),
    "away_fouls" INT NOT NULL DEFAULT 0 CHECK ("away_fouls" >= 0),
    "man_of_the_match_player_id" TEXT REFERENCES "players"("id") ON DELETE SET NULL,
    "recorded_by" TEXT NOT NULL REFERENCES "users"("id") ON DELETE RESTRICT,
    "recorded_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "match_events" (
    "id" TEXT PRIMARY KEY,
    "match_id" TEXT NOT NULL REFERENCES "matches"("id") ON DELETE CASCADE,
    "team_id" TEXT NOT NULL REFERENCES "teams"("id") ON DELETE CASCADE,
    "player_id" TEXT NOT NULL REFERENCES "players"("id") ON DELETE CASCADE,
    "event_type" "EventType" NOT NULL,
    "minute" INT NOT NULL CHECK ("minute" BETWEEN 0 AND 60),
    "notes" TEXT
);

CREATE TABLE IF NOT EXISTS "standings" (
    "tournament_id" TEXT NOT NULL REFERENCES "tournaments"("id") ON DELETE CASCADE,
    "team_id" TEXT NOT NULL REFERENCES "teams"("id") ON DELETE CASCADE,
    "group_id" TEXT REFERENCES "groups"("id") ON DELETE SET NULL,
    "played" INT NOT NULL DEFAULT 0,
    "won" INT NOT NULL DEFAULT 0,
    "drawn" INT NOT NULL DEFAULT 0,
    "lost" INT NOT NULL DEFAULT 0,
    "goals_for" INT NOT NULL DEFAULT 0,
    "goals_against" INT NOT NULL DEFAULT 0,
    "goal_difference" INT NOT NULL DEFAULT 0,
    "points" INT NOT NULL DEFAULT 0,
    PRIMARY KEY ("tournament_id", "team_id")
);

CREATE TABLE IF NOT EXISTS "audit_log" (
    "id" TEXT PRIMARY KEY,
    "user_id" TEXT REFERENCES "users"("id") ON DELETE SET NULL,
    "action" VARCHAR(50) NOT NULL,
    "entity" VARCHAR(50) NOT NULL,
    "entity_id" TEXT NOT NULL,
    "details" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS "idx_matches_tourn_stage" ON "matches"("tournament_id", "stage_id");
CREATE INDEX IF NOT EXISTS "idx_matches_schedule" ON "matches"("scheduled_at");
CREATE INDEX IF NOT EXISTS "idx_match_events_match" ON "match_events"("match_id");
CREATE INDEX IF NOT EXISTS "idx_match_events_player" ON "match_events"("player_id");
CREATE INDEX IF NOT EXISTS "idx_team_players_tourn" ON "team_players"("tournament_id", "team_id");
CREATE INDEX IF NOT EXISTS "idx_registrations_tourn" ON "registrations"("tournament_id", "status");

-- ============================================================================
-- 3. VIEWS
-- ============================================================================

-- View 1: Ranked Standings
CREATE OR REPLACE VIEW "v_standings_ranked" AS
SELECT 
    s."tournament_id",
    s."group_id",
    s."team_id",
    t."name" AS "team_name",
    t."short_name",
    t."logo_url",
    s."played",
    s."won",
    s."drawn",
    s."lost",
    s."goals_for",
    s."goals_against",
    (s."goals_for" - s."goals_against") AS "goal_difference",
    s."points",
    RANK() OVER (
        PARTITION BY s."tournament_id", s."group_id"
        ORDER BY s."points" DESC, (s."goals_for" - s."goals_against") DESC, s."goals_for" DESC, t."name" ASC
    ) AS "rank"
FROM "standings" s
INNER JOIN "teams" t ON s."team_id" = t."id";

-- View 2: Top Scorers
CREATE OR REPLACE VIEW "v_top_scorers" AS
SELECT 
    m."tournament_id",
    p."id" AS "player_id",
    p."full_name" AS "player_name",
    p."preferred_position",
    t."id" AS "team_id",
    t."name" AS "team_name",
    t."short_name",
    COUNT(me."id") AS "goals",
    RANK() OVER (
        PARTITION BY m."tournament_id"
        ORDER BY COUNT(me."id") DESC, p."full_name" ASC
    ) AS "rank"
FROM "match_events" me
INNER JOIN "matches" m ON me."match_id" = m."id"
INNER JOIN "players" p ON me."player_id" = p."id"
INNER JOIN "teams" t ON me."team_id" = t."id"
WHERE me."event_type" = 'GOAL'
GROUP BY m."tournament_id", p."id", p."full_name", p."preferred_position", t."id", t."name", t."short_name";

-- View 3: Disciplinary Records
CREATE OR REPLACE VIEW "v_discipline" AS
SELECT 
    m."tournament_id",
    p."id" AS "player_id",
    p."full_name" AS "player_name",
    t."id" AS "team_id",
    t."name" AS "team_name",
    SUM(CASE WHEN me."event_type" = 'YELLOW_CARD' THEN 1 ELSE 0 END) AS "yellow_cards",
    SUM(CASE WHEN me."event_type" = 'RED_CARD' THEN 1 ELSE 0 END) AS "red_cards",
    SUM(CASE WHEN me."event_type" = 'FOUL' THEN 1 ELSE 0 END) AS "fouls"
FROM "match_events" me
INNER JOIN "matches" m ON me."match_id" = m."id"
INNER JOIN "players" p ON me."player_id" = p."id"
INNER JOIN "teams" t ON me."team_id" = t."id"
WHERE me."event_type" IN ('YELLOW_CARD', 'RED_CARD', 'FOUL')
GROUP BY m."tournament_id", p."id", p."full_name", t."id", t."name";

-- View 4: Tournament Operational Summary
CREATE OR REPLACE VIEW "v_tournament_summary" AS
SELECT 
    tour."id" AS "tournament_id",
    tour."name" AS "tournament_name",
    tour."status",
    COUNT(DISTINCT reg."team_id") AS "approved_teams",
    tour."max_teams",
    COUNT(DISTINCT CASE WHEN m."status" = 'COMPLETED' THEN m."id" END) AS "matches_played",
    COUNT(DISTINCT CASE WHEN m."status" = 'SCHEDULED' THEN m."id" END) AS "matches_remaining",
    COALESCE(SUM(mr."home_score" + mr."away_score"), 0) AS "total_goals",
    ROUND(
        CASE 
            WHEN COUNT(DISTINCT CASE WHEN m."status" = 'COMPLETED' THEN m."id" END) > 0 
            THEN COALESCE(SUM(mr."home_score" + mr."away_score"), 0)::NUMERIC / COUNT(DISTINCT CASE WHEN m."status" = 'COMPLETED' THEN m."id" END)
            ELSE 0 
        END, 2
    ) AS "avg_goals_per_match",
    COALESCE(SUM(CASE WHEN p."status" = 'VERIFIED' THEN p."amount_pkr" ELSE 0 END), 0) AS "revenue_verified_pkr"
FROM "tournaments" tour
LEFT JOIN "registrations" reg ON tour."id" = reg."tournament_id" AND reg."status" = 'APPROVED'
LEFT JOIN "payments" p ON reg."id" = p."registration_id"
LEFT JOIN "matches" m ON tour."id" = m."tournament_id"
LEFT JOIN "match_results" mr ON m."id" = mr."match_id"
GROUP BY tour."id", tour."name", tour."status", tour."max_teams";

-- View 5: Upcoming Matches with Officials & Venues
CREATE OR REPLACE VIEW "v_upcoming_matches" AS
SELECT 
    m."id" AS "match_id",
    m."tournament_id",
    tour."name" AS "tournament_name",
    m."round_number",
    m."scheduled_at",
    m."status",
    ht."name" AS "home_team",
    ht."short_name" AS "home_short",
    at."name" AS "away_team",
    at."short_name" AS "away_short",
    v."name" AS "venue_name",
    c."name" AS "city_name",
    (
        SELECT STRING_AGG(r."full_name" || ' (' || mo."role" || ')', ', ')
        FROM "match_officials" mo
        JOIN "referees" r ON mo."referee_id" = r."id"
        WHERE mo."match_id" = m."id"
    ) AS "officials"
FROM "matches" m
INNER JOIN "tournaments" tour ON m."tournament_id" = tour."id"
INNER JOIN "teams" ht ON m."home_team_id" = ht."id"
LEFT JOIN "teams" at ON m."away_team_id" = at."id"
INNER JOIN "venues" v ON m."venue_id" = v."id"
INNER JOIN "cities" c ON v."city_id" = c."id"
WHERE m."status" = 'SCHEDULED'
ORDER BY m."scheduled_at" ASC;

-- ============================================================================
-- 4. TRIGGERS & FUNCTIONS
-- ============================================================================

-- Trigger 1: Squad Limit Check
CREATE OR REPLACE FUNCTION "fn_trg_check_squad_limit"()
RETURNS TRIGGER AS $$
DECLARE
    v_max_squad INT;
    v_curr_count INT;
BEGIN
    SELECT "max_squad_size" INTO v_max_squad 
    FROM "tournaments" 
    WHERE "id" = NEW."tournament_id";

    SELECT COUNT(*) INTO v_curr_count 
    FROM "team_players" 
    WHERE "tournament_id" = NEW."tournament_id" AND "team_id" = NEW."team_id";

    IF v_curr_count >= v_max_squad THEN
        RAISE EXCEPTION 'Squad limit reached! Maximum permitted squad size for this tournament is %', v_max_squad;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS "trg_check_squad_limit" ON "team_players";
CREATE TRIGGER "trg_check_squad_limit"
BEFORE INSERT ON "team_players"
FOR EACH ROW EXECUTE FUNCTION "fn_trg_check_squad_limit"();

-- Trigger 2: Registration Capacity Check
CREATE OR REPLACE FUNCTION "fn_trg_check_registration_capacity"()
RETURNS TRIGGER AS $$
DECLARE
    v_max_teams INT;
    v_approved_count INT;
BEGIN
    IF NEW."status" = 'APPROVED' AND (OLD."status" IS NULL OR OLD."status" <> 'APPROVED') THEN
        SELECT "max_teams" INTO v_max_teams 
        FROM "tournaments" 
        WHERE "id" = NEW."tournament_id";

        SELECT COUNT(*) INTO v_approved_count 
        FROM "registrations" 
        WHERE "tournament_id" = NEW."tournament_id" AND "status" = 'APPROVED';

        IF v_approved_count >= v_max_teams THEN
            RAISE EXCEPTION 'Tournament capacity reached! Maximum allowed teams is %', v_max_teams;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS "trg_check_registration_capacity" ON "registrations";
CREATE TRIGGER "trg_check_registration_capacity"
BEFORE UPDATE ON "registrations"
FOR EACH ROW EXECUTE FUNCTION "fn_trg_check_registration_capacity"();

-- Trigger 3: Recalculate Standings on Match Result Change
CREATE OR REPLACE FUNCTION "fn_trg_update_standings"()
RETURNS TRIGGER AS $$
DECLARE
    v_match RECORD;
    v_tourn_format TEXT;
    v_is_knockout BOOLEAN;
BEGIN
    -- Determine match context
    SELECT m."tournament_id", m."group_id", m."home_team_id", m."away_team_id", s."is_knockout", t."format"
    INTO v_match
    FROM "matches" m
    INNER JOIN "stages" s ON m."stage_id" = s."id"
    INNER JOIN "tournaments" t ON m."tournament_id" = t."id"
    WHERE m."id" = COALESCE(NEW."match_id", OLD."match_id");

    -- Only recalculate for League or Group stage matches
    IF v_match."is_knockout" = FALSE THEN
        -- Recalculate Home Team
        PERFORM fn_recalculate_single_team_standings(v_match."tournament_id", v_match."home_team_id", v_match."group_id");
        
        -- Recalculate Away Team if set
        IF v_match."away_team_id" IS NOT NULL THEN
            PERFORM fn_recalculate_single_team_standings(v_match."tournament_id", v_match."away_team_id", v_match."group_id");
        END IF;
    END IF;

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Helper function to recalculate a single team's standings cleanly
CREATE OR REPLACE FUNCTION "fn_recalculate_single_team_standings"(p_tourn_id TEXT, p_team_id TEXT, p_group_id TEXT)
RETURNS VOID AS $$
DECLARE
    v_played INT := 0;
    v_won INT := 0;
    v_drawn INT := 0;
    v_lost INT := 0;
    v_gf INT := 0;
    v_ga INT := 0;
    v_points INT := 0;
    r RECORD;
BEGIN
    FOR r IN (
        SELECT 
            m."home_team_id", 
            m."away_team_id", 
            mr."home_score", 
            mr."away_score"
        FROM "matches" m
        INNER JOIN "match_results" mr ON m."id" = mr."match_id"
        INNER JOIN "stages" s ON m."stage_id" = s."id"
        WHERE m."tournament_id" = p_tourn_id 
          AND s."is_knockout" = FALSE
          AND (m."home_team_id" = p_team_id OR m."away_team_id" = p_team_id)
    ) LOOP
        v_played := v_played + 1;
        IF r."home_team_id" = p_team_id THEN
            v_gf := v_gf + r."home_score";
            v_ga := v_ga + r."away_score";
            IF r."home_score" > r."away_score" THEN
                v_won := v_won + 1;
                v_points := v_points + 3;
            ELSIF r."home_score" = r."away_score" THEN
                v_drawn := v_drawn + 1;
                v_points := v_points + 1;
            ELSE
                v_lost := v_lost + 1;
            END IF;
        ELSE
            v_gf := v_gf + r."away_score";
            v_ga := v_ga + r."home_score";
            IF r."away_score" > r."home_score" THEN
                v_won := v_won + 1;
                v_points := v_points + 3;
            ELSIF r."away_score" = r."home_score" THEN
                v_drawn := v_drawn + 1;
                v_points := v_points + 1;
            ELSE
                v_lost := v_lost + 1;
            END IF;
        END IF;
    END LOOP;

    INSERT INTO "standings" (
        "tournament_id", "team_id", "group_id", "played", "won", "drawn", "lost", "goals_for", "goals_against", "goal_difference", "points"
    ) VALUES (
        p_tourn_id, p_team_id, p_group_id, v_played, v_won, v_drawn, v_lost, v_gf, v_ga, (v_gf - v_ga), v_points
    )
    ON CONFLICT ("tournament_id", "team_id") DO UPDATE SET
        "group_id" = EXCLUDED."group_id",
        "played" = EXCLUDED."played",
        "won" = EXCLUDED."won",
        "drawn" = EXCLUDED."drawn",
        "lost" = EXCLUDED."lost",
        "goals_for" = EXCLUDED."goals_for",
        "goals_against" = EXCLUDED."goals_against",
        "goal_difference" = EXCLUDED."goal_difference",
        "points" = EXCLUDED."points";
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS "trg_update_standings" ON "match_results";
CREATE TRIGGER "trg_update_standings"
AFTER INSERT OR UPDATE OR DELETE ON "match_results"
FOR EACH ROW EXECUTE FUNCTION "fn_trg_update_standings"();

-- Trigger 4: Advance Knockout Winner to Next Match
CREATE OR REPLACE FUNCTION "fn_trg_advance_knockout_winner"()
RETURNS TRIGGER AS $$
DECLARE
    v_match RECORD;
    v_winner_id TEXT;
BEGIN
    SELECT m."next_match_id", m."next_match_slot", s."is_knockout"
    INTO v_match
    FROM "matches" m
    INNER JOIN "stages" s ON m."stage_id" = s."id"
    WHERE m."id" = NEW."match_id";

    IF v_match."is_knockout" = TRUE AND v_match."next_match_id" IS NOT NULL THEN
        -- Determine winner including penalties
        IF NEW."winner_team_id" IS NOT NULL THEN
            v_winner_id := NEW."winner_team_id";
        ELSIF NEW."home_score" > NEW."away_score" THEN
            v_winner_id := (SELECT "home_team_id" FROM "matches" WHERE "id" = NEW."match_id");
        ELSIF NEW."away_score" > NEW."home_score" THEN
            v_winner_id := (SELECT "away_team_id" FROM "matches" WHERE "id" = NEW."match_id");
        ELSIF COALESCE(NEW."home_penalties", 0) > COALESCE(NEW."away_penalties", 0) THEN
            v_winner_id := (SELECT "home_team_id" FROM "matches" WHERE "id" = NEW."match_id");
        ELSE
            v_winner_id := (SELECT "away_team_id" FROM "matches" WHERE "id" = NEW."match_id");
        END IF;

        IF v_match."next_match_slot" = 'HOME' THEN
            UPDATE "matches" SET "home_team_id" = v_winner_id WHERE "id" = v_match."next_match_id";
        ELSE
            UPDATE "matches" SET "away_team_id" = v_winner_id WHERE "id" = v_match."next_match_id";
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS "trg_advance_knockout_winner" ON "match_results";
CREATE TRIGGER "trg_advance_knockout_winner"
AFTER INSERT OR UPDATE ON "match_results"
FOR EACH ROW EXECUTE FUNCTION "fn_trg_advance_knockout_winner"();

-- Trigger 5: Audit Log on Result Entry
CREATE OR REPLACE FUNCTION "fn_trg_audit_results"()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO "audit_log" ("id", "user_id", "action", "entity", "entity_id", "details", "created_at")
    VALUES (
        gen_random_uuid()::TEXT,
        NEW."recorded_by",
        'RECORD_RESULT',
        'matches',
        NEW."match_id",
        json_build_object(
            'home_score', NEW."home_score",
            'away_score', NEW."away_score",
            'home_penalties', NEW."home_penalties",
            'away_penalties', NEW."away_penalties",
            'winner_team_id', NEW."winner_team_id",
            'home_fouls', NEW."home_fouls",
            'away_fouls', NEW."away_fouls"
        )::jsonb,
        NOW()
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS "trg_audit_results" ON "match_results";
CREATE TRIGGER "trg_audit_results"
AFTER INSERT OR UPDATE ON "match_results"
FOR EACH ROW EXECUTE FUNCTION "fn_trg_audit_results"();

-- ============================================================================
-- 5. STORED PROCEDURES & PROCEDURAL FUNCTIONS
-- ============================================================================

-- Procedure: Approve Registration
CREATE OR REPLACE PROCEDURE "sp_approve_registration"(
    p_registration_id TEXT,
    p_admin_id TEXT
)
LANGUAGE plpgsql AS $$
DECLARE
    v_tourn_id TEXT;
    v_team_id TEXT;
    v_payment_status TEXT;
BEGIN
    -- Check registration and payment
    SELECT r."tournament_id", r."team_id", p."status"
    INTO v_tourn_id, v_team_id, v_payment_status
    FROM "registrations" r
    LEFT JOIN "payments" p ON r."id" = p."registration_id"
    WHERE r."id" = p_registration_id;

    IF v_tourn_id IS NULL THEN
        RAISE EXCEPTION 'Registration % not found', p_registration_id;
    END IF;

    -- Update registration status
    UPDATE "registrations"
    SET "status" = 'APPROVED',
        "reviewed_by" = p_admin_id,
        "reviewed_at" = NOW(),
        "rejection_reason" = NULL
    WHERE "id" = p_registration_id;

    -- Initialize standings row
    INSERT INTO "standings" ("tournament_id", "team_id", "played", "won", "drawn", "lost", "goals_for", "goals_against", "goal_difference", "points")
    VALUES (v_tourn_id, v_team_id, 0, 0, 0, 0, 0, 0, 0, 0)
    ON CONFLICT ("tournament_id", "team_id") DO NOTHING;

    -- Write Audit Log
    INSERT INTO "audit_log" ("id", "user_id", "action", "entity", "entity_id", "details", "created_at")
    VALUES (
        gen_random_uuid()::TEXT,
        p_admin_id,
        'APPROVE_REGISTRATION',
        'registrations',
        p_registration_id,
        json_build_object('tournament_id', v_tourn_id, 'team_id', v_team_id)::jsonb,
        NOW()
    );
END;
$$;

-- Procedure: Full Recalculate Standings
CREATE OR REPLACE PROCEDURE "sp_recalculate_standings"(p_tournament_id TEXT)
LANGUAGE plpgsql AS $$
DECLARE
    r RECORD;
BEGIN
    -- Reset all standings for this tournament
    UPDATE "standings"
    SET "played" = 0, "won" = 0, "drawn" = 0, "lost" = 0,
        "goals_for" = 0, "goals_against" = 0, "goal_difference" = 0, "points" = 0
    WHERE "tournament_id" = p_tournament_id;

    -- Recalculate from all completed non-knockout matches
    FOR r IN (
        SELECT DISTINCT s."team_id", s."group_id"
        FROM "standings" s
        WHERE s."tournament_id" = p_tournament_id
    ) LOOP
        PERFORM fn_recalculate_single_team_standings(p_tournament_id, r."team_id", r."group_id");
    END LOOP;
END;
$$;

-- Function: Head to Head Record
CREATE OR REPLACE FUNCTION "fn_head_to_head"(
    p_tournament_id TEXT,
    p_team_a TEXT,
    p_team_b TEXT
)
RETURNS TABLE (
    matches_played INT,
    team_a_wins INT,
    team_b_wins INT,
    draws INT,
    team_a_goals INT,
    team_b_goals INT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(m."id")::INT AS matches_played,
        SUM(CASE 
            WHEN m."home_team_id" = p_team_a AND mr."home_score" > mr."away_score" THEN 1
            WHEN m."away_team_id" = p_team_a AND mr."away_score" > mr."home_score" THEN 1
            ELSE 0 
        END)::INT AS team_a_wins,
        SUM(CASE 
            WHEN m."home_team_id" = p_team_b AND mr."home_score" > mr."away_score" THEN 1
            WHEN m."away_team_id" = p_team_b AND mr."away_score" > mr."home_score" THEN 1
            ELSE 0 
        END)::INT AS team_b_wins,
        SUM(CASE WHEN mr."home_score" = mr."away_score" THEN 1 ELSE 0 END)::INT AS draws,
        SUM(CASE 
            WHEN m."home_team_id" = p_team_a THEN mr."home_score"
            ELSE mr."away_score"
        END)::INT AS team_a_goals,
        SUM(CASE 
            WHEN m."home_team_id" = p_team_b THEN mr."home_score"
            ELSE mr."away_score"
        END)::INT AS team_b_goals
    FROM "matches" m
    INNER JOIN "match_results" mr ON m."id" = mr."match_id"
    WHERE m."tournament_id" = p_tournament_id
      AND ((m."home_team_id" = p_team_a AND m."away_team_id" = p_team_b)
        OR (m."home_team_id" = p_team_b AND m."away_team_id" = p_team_a));
END;
$$ LANGUAGE plpgsql;

