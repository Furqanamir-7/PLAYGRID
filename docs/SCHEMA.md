# PLAYGRID — Relational Database Schema Specification

This document details the complete 3NF normalized schema for **PLAYGRID**, including data types, default values, primary/foreign key definitions, check constraints, and justifications.

---

## 1. Core Reference Entities

### 1.1 `users`
Stores authenticated users across roles (`SUPER_ADMIN`, `ORGANIZER`, `TEAM_MANAGER`, `VIEWER`).
- `id` (VARCHAR(36) / TEXT, PK): Unique user identifier (UUID).
- `name` (VARCHAR(100), NOT NULL): Full display name.
- `email` (VARCHAR(150), UNIQUE, NOT NULL): Normalized lowercase email for login.
- `password_hash` (TEXT, NOT NULL): Salted bcrypt hash ($2a$12$).
- `phone` (VARCHAR(20), NULL): Pakistani contact number (`+92 3XX XXXXXXX`).
- `role` (VARCHAR(20), NOT NULL, DEFAULT 'TEAM_MANAGER'): Role enum (`SUPER_ADMIN`, `ORGANIZER`, `TEAM_MANAGER`, `VIEWER`).
- `is_active` (BOOLEAN, NOT NULL, DEFAULT TRUE): Soft-disable flag.
- `created_at` / `updated_at` (TIMESTAMPTZ, NOT NULL): Audit timestamps.

### 1.2 `cities`
Master table of Pakistani administrative divisions.
- `id` (VARCHAR(36), PK): UUID.
- `name` (VARCHAR(50), UNIQUE, NOT NULL): City name (e.g., Karachi, Lahore, Islamabad).
- `province` (VARCHAR(50), NOT NULL): Province (Sindh, Punjab, KPK, Balochistan, ICT, GB, AJK).

### 1.3 `sports`
Defines sport rules and configuration parameters.
- `id` (VARCHAR(36), PK): UUID.
- `name` (VARCHAR(50), UNIQUE, NOT NULL): Sport name (e.g. "Futsal").
- `players_on_field` (INT, NOT NULL, DEFAULT 5): Number of players on court per team (1 GK + 4 Outfield).
- `max_squad_size` (INT, NOT NULL, DEFAULT 12): Maximum tournament roster limit.
- `match_duration_minutes` (INT, NOT NULL, DEFAULT 40): Total match play time (2 × 20 min).
- `periods` (INT, NOT NULL, DEFAULT 2): Two halves.

### 1.4 `venues`
Physical sports venues and turf facilities.
- `id` (VARCHAR(36), PK): UUID.
- `name` (VARCHAR(100), NOT NULL): Arena name (e.g. "Seaview Futsal Arena").
- `address` (TEXT, NOT NULL): Street address and locality.
- `city_id` (VARCHAR(36), FK → `cities.id`, ON DELETE RESTRICT): Associated city.
- `surface_type` (VARCHAR(30), NOT NULL): Enum (`artificial_turf`, `indoor_wooden`, `sports_court`).
- `capacity` (INT, NOT NULL, DEFAULT 200): Spectator capacity.
- `has_floodlights` (BOOLEAN, NOT NULL, DEFAULT TRUE): Crucial for evening/night Pakistani futsal.
- `contact_phone` (VARCHAR(20), NULL): Booking contact number.

---

## 2. Tournament & Registration Entities

### 2.1 `tournaments`
Tournament championships and leagues.
- `id` (VARCHAR(36), PK): UUID.
- `name` (VARCHAR(150), NOT NULL): Tournament title.
- `slug` (VARCHAR(150), UNIQUE, NOT NULL): URL-safe slug.
- `sport_id` (VARCHAR(36), FK → `sports.id`): Sport specification.
- `city_id` (VARCHAR(36), FK → `cities.id`): Primary host city.
- `organizer_id` (VARCHAR(36), FK → `users.id`): Creator/lead organizer.
- `format` (VARCHAR(20), NOT NULL): Enum (`LEAGUE`, `KNOCKOUT`, `GROUP_KNOCKOUT`).
- `status` (VARCHAR(30), NOT NULL, DEFAULT 'DRAFT'): Enum (`DRAFT`, `REGISTRATION_OPEN`, `REGISTRATION_CLOSED`, `ONGOING`, `COMPLETED`, `CANCELLED`).
- `start_date` / `end_date` (DATE, NOT NULL): Duration with `CHECK (end_date >= start_date)`.
- `registration_deadline` (DATE, NOT NULL): Cutoff date.
- `entry_fee_pkr` (NUMERIC(12,2), NOT NULL, DEFAULT 0, `CHECK (entry_fee_pkr >= 0)`): Registration fee.
- `prize_pool_pkr` (NUMERIC(12,2), NOT NULL, DEFAULT 0): Prize pool.
- `max_teams` (INT, NOT NULL, DEFAULT 8): Maximum team limit.
- `min_squad_size` (INT, NOT NULL, DEFAULT 7): Minimum squad size per team.
- `max_squad_size` (INT, NOT NULL, DEFAULT 12): Maximum squad size per team.
- `points_win` (INT, DEFAULT 3), `points_draw` (INT, DEFAULT 1), `points_loss` (INT, DEFAULT 0).
- `description` (TEXT): Tournament overview and rules.
- `banner_url` (TEXT): Promotional header image.

### 2.2 `tournament_venues`
Many-to-many junction table associating multiple venues with a tournament.
- `tournament_id` (VARCHAR(36), FK → `tournaments.id`, ON DELETE CASCADE).
- `venue_id` (VARCHAR(36), FK → `venues.id`, ON DELETE RESTRICT).
- Primary Key: `(tournament_id, venue_id)`.

### 2.3 `teams`
Permanent club/team profiles.
- `id` (VARCHAR(36), PK): UUID.
- `name` (VARCHAR(100), UNIQUE, NOT NULL): Full club name.
- `short_name` (VARCHAR(4), NOT NULL): 3–4 character abbreviation (e.g., "CLS", "LYL").
- `city_id` (VARCHAR(36), FK → `cities.id`): Home city.
- `manager_id` (VARCHAR(36), FK → `users.id`): Team manager owner.
- `logo_url` (TEXT): Club badge.
- `primary_color` (VARCHAR(10), DEFAULT '#8E4585'): Brand hex code.
- `founded_year` (INT): Club founding year.

### 2.4 `players`
Player registry.
- `id` (VARCHAR(36), PK): UUID.
- `full_name` (VARCHAR(100), NOT NULL): Full legal name.
- `date_of_birth` (DATE, NOT NULL): Birth date for age eligibility.
- `cnic` (VARCHAR(15), UNIQUE, NULL): Pakistani CNIC (`XXXXX-XXXXXXX-X`).
- `phone` (VARCHAR(20), NULL): Contact number.
- `preferred_position` (VARCHAR(20), NOT NULL): Enum (`GOALKEEPER`, `DEFENDER`, `WINGER`, `PIVOT`).
- `photo_url` (TEXT): Player headshot.

### 2.5 `team_players`
Tournament-specific squad allocation.
- `id` (VARCHAR(36), PK): UUID.
- `team_id` (VARCHAR(36), FK → `teams.id`, ON DELETE CASCADE).
- `player_id` (VARCHAR(36), FK → `players.id`, ON DELETE CASCADE).
- `tournament_id` (VARCHAR(36), FK → `tournaments.id`, ON DELETE CASCADE).
- `jersey_number` (INT, NOT NULL, `CHECK (jersey_number BETWEEN 1 AND 99)`).
- `is_captain` (BOOLEAN, NOT NULL, DEFAULT FALSE).
- `joined_at` (TIMESTAMPTZ, NOT NULL, DEFAULT NOW()).
- Constraints:
  - `UNIQUE (tournament_id, player_id)`: Prevents a player playing for 2 teams in the same tournament.
  - `UNIQUE (tournament_id, team_id, jersey_number)`: Enforces unique kit numbers in a squad.

### 2.6 `registrations`
Team entry applications for tournaments.
- `id` (VARCHAR(36), PK): UUID.
- `tournament_id` (VARCHAR(36), FK → `tournaments.id`).
- `team_id` (VARCHAR(36), FK → `teams.id`).
- `status` (VARCHAR(20), NOT NULL, DEFAULT 'PENDING'): Enum (`PENDING`, `APPROVED`, `REJECTED`, `WITHDRAWN`).
- `submitted_at` (TIMESTAMPTZ, NOT NULL, DEFAULT NOW()).
- `reviewed_by` (VARCHAR(36), FK → `users.id`, NULL).
- `reviewed_at` (TIMESTAMPTZ, NULL).
- `rejection_reason` (TEXT, NULL).
- Constraint: `UNIQUE (tournament_id, team_id)`.

### 2.7 `payments`
Fee payment slips and manual transaction verification.
- `id` (VARCHAR(36), PK): UUID.
- `registration_id` (VARCHAR(36), FK → `registrations.id`, ON DELETE CASCADE).
- `amount_pkr` (NUMERIC(12,2), NOT NULL, `CHECK (amount_pkr >= 0)`).
- `method` (VARCHAR(20), NOT NULL): Enum (`JAZZCASH`, `EASYPAISA`, `BANK_TRANSFER`, `CASH`).
- `transaction_ref` (VARCHAR(100), NOT NULL): Transaction TID or slip reference.
- `status` (VARCHAR(20), NOT NULL, DEFAULT 'PENDING'): Enum (`PENDING`, `VERIFIED`, `FAILED`, `REFUNDED`).
- `paid_at` (TIMESTAMPTZ, NOT NULL, DEFAULT NOW()).
- `verified_by` (VARCHAR(36), FK → `users.id`, NULL).

---

## 3. Match, Official & Result Entities

### 3.1 `groups` & `group_teams`
For `GROUP_KNOCKOUT` format:
- `groups`: `id`, `tournament_id`, `name` ("Group A", "Group B").
- `group_teams`: `group_id`, `team_id` (PK: `(group_id, team_id)`).

### 3.2 `stages`
Tournament rounds and brackets.
- `id` (VARCHAR(36), PK): UUID.
- `tournament_id` (VARCHAR(36), FK → `tournaments.id`).
- `name` (VARCHAR(50), NOT NULL): e.g. "League", "Quarter-final", "Semi-final", "Final".
- `stage_order` (INT, NOT NULL): Sequencing order.
- `is_knockout` (BOOLEAN, NOT NULL, DEFAULT FALSE).

### 3.3 `matches`
Scheduled or completed fixtures.
- `id` (VARCHAR(36), PK): UUID.
- `tournament_id` (VARCHAR(36), FK → `tournaments.id`).
- `stage_id` (VARCHAR(36), FK → `stages.id`).
- `group_id` (VARCHAR(36), FK → `groups.id`, NULL).
- `round_number` (INT, NOT NULL, DEFAULT 1).
- `home_team_id` (VARCHAR(36), FK → `teams.id`, NOT NULL).
- `away_team_id` (VARCHAR(36), FK → `teams.id`, NULL for TBD bracket slots).
- `venue_id` (VARCHAR(36), FK → `venues.id`, NOT NULL).
- `scheduled_at` (TIMESTAMPTZ, NOT NULL).
- `status` (VARCHAR(20), NOT NULL, DEFAULT 'SCHEDULED'): Enum (`SCHEDULED`, `LIVE`, `COMPLETED`, `POSTPONED`, `CANCELLED`).
- `next_match_id` (VARCHAR(36), FK → `matches.id`, NULL): Bracket winner destination.
- `next_match_slot` (VARCHAR(10), NULL): 'HOME' or 'AWAY'.
- Constraint: `CHECK (home_team_id <> away_team_id)`.

### 3.4 `referees` & `match_officials`
- `referees`: `id`, `full_name`, `phone`, `city_id`, `certification_level` (`NATIONAL`, `REGIONAL`, `LOCAL`), `is_active`.
- `match_officials`: `match_id`, `referee_id`, `role` (`FIRST_REFEREE`, `SECOND_REFEREE`, `TIMEKEEPER`).
- Constraint: PK `(match_id, role)`, UNIQUE `(match_id, referee_id)`.

### 3.5 `match_results`
Match score, penalty tie-breaker, fouls, and award.
- `match_id` (VARCHAR(36), PK & FK → `matches.id`, ON DELETE CASCADE).
- `home_score` (INT, NOT NULL, DEFAULT 0, `CHECK (home_score >= 0)`).
- `away_score` (INT, NOT NULL, DEFAULT 0, `CHECK (away_score >= 0)`).
- `home_penalties` (INT, NULL).
- `away_penalties` (INT, NULL).
- `winner_team_id` (VARCHAR(36), FK → `teams.id`, NULL).
- `home_fouls` (INT, NOT NULL, DEFAULT 0).
- `away_fouls` (INT, NOT NULL, DEFAULT 0).
- `man_of_the_match_player_id` (VARCHAR(36), FK → `players.id`, NULL).
- `recorded_by` (VARCHAR(36), FK → `users.id`, NOT NULL).
- `recorded_at` (TIMESTAMPTZ, NOT NULL, DEFAULT NOW()).

### 3.6 `match_events`
Individual timeline events.
- `id` (VARCHAR(36), PK): UUID.
- `match_id` (VARCHAR(36), FK → `matches.id`, ON DELETE CASCADE).
- `team_id` (VARCHAR(36), FK → `teams.id`).
- `player_id` (VARCHAR(36), FK → `players.id`).
- `event_type` (VARCHAR(20), NOT NULL): Enum (`GOAL`, `OWN_GOAL`, `YELLOW_CARD`, `RED_CARD`, `FOUL`).
- `minute` (INT, NOT NULL, `CHECK (minute BETWEEN 0 AND 60)`).
- `notes` (TEXT, NULL).

### 3.7 `standings`
Points table maintained via triggers or stored procedure.
- `tournament_id` (VARCHAR(36), FK → `tournaments.id`, ON DELETE CASCADE).
- `team_id` (VARCHAR(36), FK → `teams.id`, ON DELETE CASCADE).
- `group_id` (VARCHAR(36), FK → `groups.id`, NULL).
- `played` (INT, DEFAULT 0), `won` (INT, DEFAULT 0), `drawn` (INT, DEFAULT 0), `lost` (INT, DEFAULT 0).
- `goals_for` (INT, DEFAULT 0), `goals_against` (INT, DEFAULT 0).
- `goal_difference` (INT, DEFAULT 0).
- `points` (INT, DEFAULT 0).
- Primary Key: `(tournament_id, team_id)`.

### 3.8 `audit_log`
Immutable system audit trail.
- `id` (VARCHAR(36), PK): UUID.
- `user_id` (VARCHAR(36), FK → `users.id`, NULL).
- `action` (VARCHAR(50), NOT NULL): e.g. "RECORD_RESULT", "APPROVE_REGISTRATION".
- `entity` (VARCHAR(50), NOT NULL).
- `entity_id` (VARCHAR(36), NOT NULL).
- `details` (JSONB, NOT NULL, DEFAULT '{}').
- `created_at` (TIMESTAMPTZ, NOT NULL, DEFAULT NOW()).

