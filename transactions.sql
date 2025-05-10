use board_games;

START TRANSACTION;
-- Search for a Specific Game with Criteria (Form)
SELECT * FROM Games
WHERE Name_Game LIKE '%search_term%'
AND Min_players_Game <= num_players
AND Max_players_Game >= num_players
AND Min_age_Game <= age_limit;

INSERT INTO Search_History (ID_User, Search_Term, Search_Date) VALUES (user_id, 'search_term', NOW());
COMMIT;

--  Recommendations Based on User History
--  Find games that share categories with the user's liked games.
START TRANSACTION;
--  Get user's liked games and Get categories of those games
--  Get other games in those categories
SELECT * FROM Games g JOIN have_a ha ON g.ID_Game = ha.ID_Game WHERE ha.ID_Category IN (SELECT ID_Category FROM have_a WHERE ID_Game IN (SELECT ID_Game FROM like_a WHERE ID_User = user_id)) AND g.ID_Game NOT IN (SELECT ID_Game FROM like_a WHERE ID_User = user_id);
COMMIT;

START TRANSACTION;
-- User Account to Track Previous Searches: View Search Games Historic
SELECT g.*, sh.Search_Date
FROM Search_History sh
JOIN Games g ON sh.ID_Game = g.ID_Game
WHERE sh.ID_User = user_id
ORDER BY sh.Search_Date DESC;
COMMIT;

-- Delete Search History
START TRANSACTION;
DELETE FROM Search_History WHERE ID_User = user_id;
COMMIT;

-- Admin: Updating Recommendation Data (Complex)
START TRANSACTION;
--  Example:  Update a table of pre-calculated game recommendations
UPDATE GameRecommendations SET RecommendedGames = '101,202,303' WHERE ID_User = user_id;
COMMIT;

