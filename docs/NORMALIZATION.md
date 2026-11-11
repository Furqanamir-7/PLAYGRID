# PLAYGRID — Relational Database Normalization (1NF, 2NF, 3NF)

This document formalizes the relational normalization proof for the **PLAYGRID** database system.

---

## 1. First Normal Form (1NF)

A relation is in 1NF if and only if:
1. Every attribute contains only atomic (indivisible) values.
2. There are no repeating groups or arrays stored in single attributes.
3. Each record is uniquely identified by a primary key.

### Examples in PLAYGRID:
- **Players**: Instead of storing a comma-separated list of telephone numbers or nicknames in a text column, each player has atomic scalar columns: `full_name`, `cnic`, `phone`, `preferred_position`.
- **Match Events**: Rather than storing a JSON or CSV array of scorers inside `matches`, each individual goal, yellow card, or red card is stored as an independent row in `match_events` with an atomic `minute` integer (0–60).
- **Match Officials**: Separate rows in `match_officials` identify each official and their explicit role (`FIRST_REFEREE`, `SECOND_REFEREE`, `TIMEKEEPER`), rather than packing referee IDs into a single field.

---

## 2. Second Normal Form (2NF)

A relation is in 2NF if and only if:
1. It is in 1NF.
2. No non-prime attribute is partially dependent on any candidate key (full functional dependency on candidate keys).

### Example of Decomposition from 1NF to 2NF:
Consider an unnormalized table tracking player squad assignments:
```
Unnormalized_Squad_Assignment (
    tournament_id, player_id, team_id, jersey_number, player_name, player_dob, tournament_name, tournament_entry_fee
)
Candidate Key: {tournament_id, player_id}
```
**Partial Dependencies Violating 2NF:**
- `{player_id} → {player_name, player_dob}` (depends only on part of the composite key).
- `{tournament_id} → {tournament_name, tournament_entry_fee}` (depends only on tournament_id).

**2NF Decomposition in PLAYGRID:**
1. `players(id, full_name, date_of_birth, cnic, phone, preferred_position)`
2. `tournaments(id, name, entry_fee_pkr, start_date, ...)`
3. `team_players(id, tournament_id, player_id, team_id, jersey_number, is_captain, joined_at)`
Every non-key attribute in `team_players` depends strictly on the whole squad registration key.

---

## 3. Third Normal Form (3NF)

A relation is in 3NF if and only if:
1. It is in 2NF.
2. There are no transitive dependencies (no non-prime attribute is functionally dependent on another non-prime attribute: $X \to Y \to Z$).

### Example of Decomposition from 2NF to 3NF:
Consider a table storing match venues:
```
Matches_Venues_Denormalized (
    match_id, scheduled_at, venue_id, venue_name, venue_address, city_id, city_name, province
)
Functional Dependencies:
match_id → venue_id
venue_id → city_id
city_id → province
```
**Transitive Dependencies Violating 3NF:**
- `match_id → venue_id → venue_name`
- `match_id → city_id → province`

**3NF Decomposition in PLAYGRID:**
1. `cities(id, name, province)`
2. `venues(id, name, address, city_id, surface_type, capacity, has_floodlights)`
3. `matches(id, tournament_id, stage_id, venue_id, scheduled_at, ...)`

Now, if a city or venue address updates, it is modified in exactly one place with zero update anomalies, insertion anomalies, or deletion anomalies.

---

## 4. Summary Table of Normalization Status

| Table | Normal Form | Primary Key / Candidate Keys | Eliminates |
|---|---|---|---|
| `users` | 3NF | `id`, AK: `email` | Redundant credentials |
| `cities` | 3NF | `id`, AK: `name` | City name / province duplication |
| `venues` | 3NF | `id` | Venue detail anomalies |
| `tournaments` | 3NF | `id`, AK: `slug` | Tournament metadata duplication |
| `teams` | 3NF | `id`, AK: `name` | Team info separation |
| `players` | 3NF | `id`, AK: `cnic` | Player identity duplication |
| `team_players` | 3NF | `id`, AK: `(tournament_id, player_id)` | Squad redundancy |
| `registrations`| 3NF | `id`, AK: `(tournament_id, team_id)` | Registration anomalies |
| `payments` | 3NF | `id` | Payment reference isolation |
| `matches` | 3NF | `id` | Match scheduling anomalies |
| `match_results`| 3NF | `match_id` | Match score independence |
| `match_events` | 3NF | `id` | Event timeline atomicity |
| `standings` | 3NF | `(tournament_id, team_id)` | Dynamically maintained summary |

