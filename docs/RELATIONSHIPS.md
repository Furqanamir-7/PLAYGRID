# PLAYGRID — Relational Database Entity Relationships

This document outlines the entity relationships implemented in the **PLAYGRID** relational database schema.

---

## 1. One-to-One Relationships (1:1)

| Parent Entity | Child Entity | Foreign Key / Primary Key | Description |
|---|---|---|---|
| `matches` | `match_results` | `match_results.match_id` (PK & FK → `matches.id`) | Each match has at most one result record containing official scores, penalties, fouls, and recorded timestamps. |

---

## 2. One-to-Many Relationships (1:N)

| One (Parent) | Many (Children) | Foreign Key | Purpose |
|---|---|---|---|
| `users` | `tournaments` | `tournaments.organizer_id` | An organizer organizes multiple tournaments. |
| `users` | `teams` | `teams.manager_id` | A team manager can own/manage multiple teams. |
| `users` | `audit_log` | `audit_log.user_id` | A user generates multiple audit log entries. |
| `cities` | `venues` | `venues.city_id` | A city contains multiple futsal venues. |
| `cities` | `teams` | `teams.city_id` | A city hosts multiple futsal teams. |
| `cities` | `referees` | `referees.city_id` | A city has multiple certified referees. |
| `sports` | `tournaments` | `tournaments.sport_id` | A sport (e.g. Futsal) governs tournament rules. |
| `tournaments` | `registrations` | `registrations.tournament_id` | A tournament receives multiple team registrations. |
| `tournaments` | `stages` | `stages.tournament_id` | A tournament comprises stages (Group Stage, Semi-Finals, Final). |
| `tournaments` | `matches` | `matches.tournament_id` | A tournament schedules multiple matches. |
| `tournaments` | `groups` | `groups.tournament_id` | Group knockout tournaments have multiple groups (Group A, B). |
| `tournaments` | `standings` | `standings.tournament_id` | A tournament computes standings rows for teams. |
| `registrations` | `payments` | `payments.registration_id` | A registration can have multiple payment attempts or a verified payment. |
| `matches` | `match_events` | `match_events.match_id` | A match produces multiple events (goals, yellow cards, red cards). |
| `players` | `match_events` | `match_events.player_id` | A player records multiple goals or card events. |
| `matches` | `matches` (self) | `matches.next_match_id` | Knockout match links forward to the winner's next round match. |

---

## 3. Many-to-Many Relationships (M:N)

| Entity 1 | Entity 2 | Junction Table | Composite / Unique Constraints |
|---|---|---|---|
| `tournaments` | `venues` | `tournament_venues` | PK: `(tournament_id, venue_id)` — associates venues allocated to a tournament. |
| `teams` | `players` (per tournament) | `team_players` | PK: `id`, UNIQUE `(tournament_id, player_id)` to ensure single squad per tournament, UNIQUE `(tournament_id, team_id, jersey_number)` for kit numbers. |
| `groups` | `teams` | `group_teams` | PK: `(group_id, team_id)` — assigns teams to groups in group-knockout tournaments. |
| `matches` | `referees` | `match_officials` | PK: `(match_id, role)` + UNIQUE `(match_id, referee_id)` preventing referee duplicate booking. |

