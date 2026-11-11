-- ============================================================================
-- PLAYGRID: Sports Tournament Management System
-- Relational DBMS Academic & Production Demonstration Queries
-- Covers: Joins, Aggregates, GROUP BY + HAVING, Subqueries, CTEs, Window Functions,
-- Views, Stored Procedures, Triggers, and Set Operations
-- ============================================================================

-- Q01: Simple Inner Join - Match Fixtures with Team Names and City
-- Demonstrates: Standard 3-table INNER JOIN across matches, teams, and cities
SELECT 
    m.id AS match_id,
    m.round_number,
    ht.name AS home_team,
    at.name AS away_team,
    v.name AS venue_name,
    c.name AS city_name,
    m.scheduled_at,
    m.status
FROM matches m
INNER JOIN teams ht ON m.home_team_id = ht.id
INNER JOIN teams at ON m.away_team_id = at.id
INNER JOIN venues v ON m.venue_id = v.id
INNER JOIN cities c ON v.city_id = c.id
ORDER BY m.scheduled_at ASC;

-- Q02: Left Outer Join - All Teams and their Approved Registrations
-- Demonstrates: LEFT JOIN ensuring teams without registrations still appear
SELECT 
    t.id AS team_id,
    t.name AS team_name,
    t.short_name,
    c.name AS city_name,
    r.tournament_id,
    COALESCE(r.status, 'UNREGISTERED') AS registration_status
FROM teams t
INNER JOIN cities c ON t.city_id = c.id
LEFT JOIN registrations r ON t.id = r.team_id AND r.status = 'APPROVED'
ORDER BY t.name ASC;

-- Q03: Self-Join - Knockout Match Tree Progression
-- Demonstrates: Self-join on `matches` table linking quarter/semi-final to next match
SELECT 
    cur.id AS current_match_id,
    cur.round_number AS current_round,
    cur.status AS current_status,
    nxt.id AS next_match_id,
    nxt.round_number AS next_round,
    cur.next_match_slot AS destination_slot
FROM matches cur
LEFT JOIN matches nxt ON cur.next_match_id = nxt.id
WHERE cur.next_match_id IS NOT NULL;

-- Q04: Aggregation with GROUP BY and HAVING - High Scoring Teams
-- Demonstrates: SUM aggregate, GROUP BY, and HAVING filtering for teams with >= 10 goals
SELECT 
    t.name AS team_name,
    COUNT(s.tournament_id) AS tournaments_participated,
    SUM(s.goals_for) AS total_goals_scored,
    SUM(s.goals_against) AS total_goals_conceded,
    SUM(s.won) AS total_wins
FROM standings s
INNER JOIN teams t ON s.team_id = t.id
GROUP BY t.id, t.name
HAVING SUM(s.goals_for) >= 10
ORDER BY total_goals_scored DESC;

-- Q05: Window Function - Dense Rank of Teams by Standings Points
-- Demonstrates: DENSE_RANK() OVER (PARTITION BY tournament_id ORDER BY points DESC, goal_difference DESC)
SELECT 
    s.tournament_id,
    t.name AS team_name,
    s.played,
    s.won,
    s.drawn,
    s.lost,
    s.goals_for,
    s.goals_against,
    s.goal_difference,
    s.points,
    DENSE_RANK() OVER (
        PARTITION BY s.tournament_id 
        ORDER BY s.points DESC, s.goal_difference DESC, s.goals_for DESC
    ) AS standings_rank
FROM standings s
INNER JOIN teams t ON s.team_id = t.id;

-- Q06: Common Table Expression (CTE) - Top Scorers Leaderboard
-- Demonstrates: WITH clause (CTE) aggregating goals, filtering out own-goals, joining players
WITH PlayerGoalCounts AS (
    SELECT 
        me.player_id,
        me.team_id,
        COUNT(me.id) AS total_goals
    FROM match_events me
    WHERE me.event_type = 'GOAL'
    GROUP BY me.player_id, me.team_id
)
SELECT 
    p.full_name AS player_name,
    p.preferred_position,
    t.name AS team_name,
    pgc.total_goals,
    RANK() OVER (ORDER BY pgc.total_goals DESC) AS golden_boot_rank
FROM PlayerGoalCounts pgc
INNER JOIN players p ON pgc.player_id = p.id
INNER JOIN teams t ON pgc.team_id = t.id
ORDER BY pgc.total_goals DESC;

-- Q07: Correlated Subquery - Players Who Scored Above the Average
-- Demonstrates: Correlated subquery computing per-team average goals
SELECT 
    p.id,
    p.full_name,
    t.name AS team_name,
    (SELECT COUNT(*) FROM match_events me WHERE me.player_id = p.id AND me.event_type = 'GOAL') AS player_goals
FROM players p
INNER JOIN team_players tp ON p.id = tp.player_id
INNER JOIN teams t ON tp.team_id = t.id
WHERE (SELECT COUNT(*) FROM match_events me WHERE me.player_id = p.id AND me.event_type = 'GOAL') > (
    SELECT AVG(goal_count) FROM (
        SELECT COUNT(me2.id) AS goal_count
        FROM match_events me2
        WHERE me2.event_type = 'GOAL'
        GROUP BY me2.player_id
    ) avg_tbl
);

-- Q08: Nested Subquery with EXISTS - Teams with Verified Payments
-- Demonstrates: Subquery with EXISTS clause validating verified payment receipts
SELECT 
    t.id,
    t.name,
    t.short_name,
    c.name AS city
FROM teams t
INNER JOIN cities c ON t.city_id = c.id
WHERE EXISTS (
    SELECT 1 
    FROM registrations r
    INNER JOIN payments p ON r.id = p.registration_id
    WHERE r.team_id = t.id AND p.status = 'VERIFIED'
);

-- Q09: Set Operation (UNION) - Combined Disciplinary Infractions
-- Demonstrates: UNION of distinct card events with severity weights
SELECT 
    p.full_name AS player_name,
    t.name AS team_name,
    'Yellow Card' AS infraction_type,
    COUNT(me.id) AS occurrences
FROM match_events me
INNER JOIN players p ON me.player_id = p.id
INNER JOIN teams t ON me.team_id = t.id
WHERE me.event_type = 'YELLOW_CARD'
GROUP BY p.full_name, t.name
UNION
SELECT 
    p.full_name AS player_name,
    t.name AS team_name,
    'Red Card' AS infraction_type,
    COUNT(me.id) AS occurrences
FROM match_events me
INNER JOIN players p ON me.player_id = p.id
INNER JOIN teams t ON me.team_id = t.id
WHERE me.event_type = 'RED_CARD'
GROUP BY p.full_name, t.name
ORDER BY occurrences DESC;

-- Q10: Multi-Table Full Match Summary
-- Demonstrates: Joining matches, results, teams, venues, and man-of-the-match
SELECT 
    m.id AS match_id,
    ht.name AS home_team,
    mr.home_score,
    mr.away_score,
    at.name AS away_team,
    mr.home_penalties,
    mr.away_penalties,
    motm.full_name AS man_of_the_match,
    v.name AS venue,
    mr.recorded_at
FROM matches m
INNER JOIN match_results mr ON m.id = mr.match_id
INNER JOIN teams ht ON m.home_team_id = ht.id
INNER JOIN teams at ON m.away_team_id = at.id
INNER JOIN venues v ON m.venue_id = v.id
LEFT JOIN players motm ON mr.man_of_the_match_player_id = motm.id
ORDER BY mr.recorded_at DESC;

-- Q11: View Query - Ranked Standings View
-- Demonstrates: Querying `v_standings_ranked` view
SELECT * FROM v_standings_ranked
WHERE tournament_id = (SELECT id FROM tournaments WHERE slug = 'karachi-futsal-league-2026')
ORDER BY rank ASC;

-- Q12: View Query - Top Scorers View
-- Demonstrates: Querying `v_top_scorers` view
SELECT * FROM v_top_scorers
LIMIT 10;

-- Q13: View Query - Tournament Financial and Operational Summary
-- Demonstrates: Querying `v_tournament_summary` view
SELECT * FROM v_tournament_summary;

-- Q14: View Query - Upcoming Matches with Officials
-- Demonstrates: Querying `v_upcoming_matches` view
SELECT * FROM v_upcoming_matches
ORDER BY scheduled_at ASC
LIMIT 5;

-- Q15: View Query - Disciplinary Report
-- Demonstrates: Querying `v_discipline` view
SELECT * FROM v_discipline
ORDER BY red_cards DESC, yellow_cards DESC;

-- Q16: Complex Aggregate - Average Match Duration and Total Goals per Venue
-- Demonstrates: Multiple aggregates (AVG, SUM, COUNT) grouped by venue
SELECT 
    v.id AS venue_id,
    v.name AS venue_name,
    c.name AS city_name,
    COUNT(m.id) AS matches_hosted,
    COALESCE(SUM(mr.home_score + mr.away_score), 0) AS total_goals_scored,
    ROUND(COALESCE(AVG(mr.home_score + mr.away_score), 0), 2) AS avg_goals_per_match
FROM venues v
INNER JOIN cities c ON v.city_id = c.id
LEFT JOIN matches m ON v.id = m.venue_id AND m.status = 'COMPLETED'
LEFT JOIN match_results mr ON m.id = mr.match_id
GROUP BY v.id, v.name, c.name
ORDER BY matches_hosted DESC;

-- Q17: Subquery in SELECT - Tournament Registration Fill Rates
-- Demonstrates: Scalar subqueries inside SELECT projection
SELECT 
    t.id,
    t.name,
    t.max_teams,
    (SELECT COUNT(*) FROM registrations r WHERE r.tournament_id = t.id AND r.status = 'APPROVED') AS approved_teams,
    ROUND(
        (SELECT COUNT(*) FROM registrations r WHERE r.tournament_id = t.id AND r.status = 'APPROVED')::DECIMAL / t.max_teams * 100, 
        1
    ) AS fill_percentage
FROM tournaments t;

-- Q18: CASE Statement - Team Performance Tiering
-- Demonstrates: Conditional CASE expression based on win percentage
SELECT 
    t.name AS team_name,
    s.played,
    s.won,
    s.points,
    CASE 
        WHEN s.won >= 4 THEN 'Championship Contender'
        WHEN s.won BETWEEN 2 AND 3 THEN 'Mid Table'
        ELSE 'Relegation Zone'
    END AS performance_tier
FROM standings s
INNER JOIN teams t ON s.team_id = t.id
ORDER BY s.points DESC;

-- Q19: Cross Join / Head-to-Head Matrix Preparation
-- Demonstrates: CROSS JOIN generating potential match pairings
SELECT 
    t1.short_name AS home,
    t2.short_name AS away
FROM teams t1
CROSS JOIN teams t2
WHERE t1.id < t2.id AND t1.city_id = t2.city_id
LIMIT 10;

-- Q20: Function Call - Head-to-Head Comparison
-- Demonstrates: Calling stored function `fn_head_to_head`
SELECT * FROM fn_head_to_head(
    (SELECT id FROM tournaments WHERE slug = 'karachi-futsal-league-2026'),
    (SELECT id FROM teams WHERE name = 'Clifton Strikers'),
    (SELECT id FROM teams WHERE name = 'Lyari Lions')
);

-- Q21: Stored Procedure Simulation - Recalculate Standings
-- Demonstrates: Invoking `sp_recalculate_standings`
CALL sp_recalculate_standings((SELECT id FROM tournaments WHERE slug = 'karachi-futsal-league-2026'));

-- Q22: Date and Time Analysis - Match Schedule Distribution by Hour
-- Demonstrates: EXTRACT(HOUR FROM scheduled_at) and GROUP BY in Asia/Karachi time
SELECT 
    EXTRACT(HOUR FROM scheduled_at AT TIME ZONE 'Asia/Karachi') AS kickoff_hour_pkt,
    COUNT(*) AS total_fixtures
FROM matches
GROUP BY EXTRACT(HOUR FROM scheduled_at AT TIME ZONE 'Asia/Karachi')
ORDER BY kickoff_hour_pkt ASC;

-- Q23: Referee Workload and Official Roles
-- Demonstrates: Aggregating referee match assignments across roles
SELECT 
    r.full_name AS referee_name,
    r.certification_level,
    c.name AS city,
    COUNT(mo.match_id) AS total_matches_officiated,
    SUM(CASE WHEN mo.role = 'FIRST_REFEREE' THEN 1 ELSE 0 END) AS as_first_referee,
    SUM(CASE WHEN mo.role = 'SECOND_REFEREE' THEN 1 ELSE 0 END) AS as_second_referee,
    SUM(CASE WHEN mo.role = 'TIMEKEEPER' THEN 1 ELSE 0 END) AS as_timekeeper
FROM referees r
INNER JOIN cities c ON r.city_id = c.id
LEFT JOIN match_officials mo ON r.id = mo.referee_id
GROUP BY r.id, r.full_name, r.certification_level, c.name
ORDER BY total_matches_officiated DESC;

-- Q24: Squad Depth and Player Position Distribution
-- Demonstrates: Pivot-style aggregation using FILTER / CASE on player positions
SELECT 
    t.name AS team_name,
    COUNT(tp.player_id) AS squad_size,
    COUNT(CASE WHEN p.preferred_position = 'GOALKEEPER' THEN 1 END) AS goalkeepers,
    COUNT(CASE WHEN p.preferred_position = 'DEFENDER' THEN 1 END) AS fixos_defenders,
    COUNT(CASE WHEN p.preferred_position = 'WINGER' THEN 1 END) AS alas_wingers,
    COUNT(CASE WHEN p.preferred_position = 'PIVOT' THEN 1 END) AS pivots_attackers
FROM teams t
INNER JOIN team_players tp ON t.id = tp.team_id
INNER JOIN players p ON tp.player_id = p.id
GROUP BY t.id, t.name
ORDER BY squad_size DESC;

-- Q25: System Audit Trail Activity Log
-- Demonstrates: JSON extraction and chronological audit tracking
SELECT 
    al.id,
    al.action,
    al.entity,
    al.entity_id,
    u.name AS actor_name,
    u.role AS actor_role,
    al.details,
    al.created_at
FROM audit_log al
LEFT JOIN users u ON al.user_id = u.id
ORDER BY al.created_at DESC
LIMIT 15;

