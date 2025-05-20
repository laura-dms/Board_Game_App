use board_games;


-- View: GameSummaryView
CREATE VIEW GameSummaryView AS
SELECT 
    ID_Game AS GameID,
    Name_Game AS GameName,
    Description_Game AS Description,
    CONCAT(Min_players_Game, '-', Max_players_Game) AS PlayerRange,
    Min_age_Game AS MinAge,
    Playing_time_Game AS PlayingTime,
    Year_published_Game AS YearPublished,
    Thumbnail_Game AS Thumbnail
FROM Games
ORDER BY YearPublished DESC;

-- View: FamilyFriendlyGamesView
CREATE OR REPLACE VIEW FamilyFriendlyGamesView AS
SELECT 
    ID_Game AS GameID,
    Name_Game AS GameName,
    Description_Game AS Description,
    Min_age_Game AS MinAge,
    CONCAT(Min_players_Game, '-', Max_players_Game) AS PlayerRange,
    Playing_time_Game AS PlayingTime,
    Thumbnail_Game AS Thumbnail
FROM Games
WHERE Min_age_Game <= 10
ORDER BY MinAge ASC, PlayingTime ASC;

-- View: GamesByYearView
CREATE VIEW GamesByYearView AS
SELECT 
    Year_published_Game AS YearPublished,
    COUNT(*) AS TotalGames
FROM Games
GROUP BY Year_published_Game
ORDER BY YearPublished DESC;

-- View: GamesWithCategoriesView
CREATE VIEW GamesWithCategoriesView AS
SELECT 
    g.ID_Game AS GameID,
    g.Name_Game AS GameName,
    c.Category_Name AS Category
FROM Games g
JOIN have_a ha ON g.ID_Game = ha.ID_Game
JOIN Categories c ON ha.ID_Category = c.ID_Category
ORDER BY GameName ASC, Category ASC;

-- View: GamesWithMechanicsView
CREATE VIEW GamesWithMechanicsView AS
SELECT 
    g.ID_Game AS GameID,
    g.Name_Game AS GameName,
    m.Mechanic_name AS Mechanic
FROM Games g
JOIN have_a ha ON g.ID_Game = ha.ID_Game
JOIN Mechanics m ON ha.ID_Mechanics = m.ID_Mechanics
ORDER BY GameName ASC, Mechanic ASC;

-- View: LongPlayingGamesView
CREATE OR REPLACE VIEW LongPlayingGamesView AS
SELECT 
    ID_Game AS GameID,
    Name_Game AS GameName,
    Description_Game AS Description, -- Added this line
    Playing_time_Game AS PlayingTime,
    Year_published_Game AS YearPublished,
    Thumbnail_Game AS Thumbnail
FROM Games
WHERE Playing_time_Game > 120
ORDER BY PlayingTime DESC;

-- View: GamesPublishedBefore2000View
CREATE VIEW GamesPublishedBefore2000View AS
SELECT 
    ID_Game AS GameID,
    Name_Game AS GameName,
    Year_published_Game AS YearPublished,
    Min_players_Game AS MinPlayers,
    Max_players_Game AS MaxPlayers,
    Thumbnail_Game AS Thumbnail
FROM Games
WHERE Year_published_Game < 2000
ORDER BY YearPublished ASC;

-- View: GamesWithThumbnailView
CREATE VIEW GamesWithThumbnailView AS
SELECT 
    ID_Game AS GameID,
    Name_Game AS GameName,
    Thumbnail_Game AS Thumbnail
FROM Games
WHERE Thumbnail_Game IS NOT NULL AND Thumbnail_Game != ''
ORDER BY GameName ASC;

-- View: GamesByPlayerCountView
CREATE VIEW GamesByPlayerCountView AS
SELECT 
    CONCAT(Min_players_Game, '-', Max_players_Game) AS PlayerRange,
    COUNT(*) AS TotalGames
FROM Games
GROUP BY Min_players_Game, Max_players_Game
ORDER BY TotalGames DESC;

-- Find Games not already liked by User
CREATE VIEW UserGameRecommendationsView AS
SELECT
    u.ID_User AS UserID,
    g.ID_Game AS GameID,
    g.Name_Game AS GameName,
    g.Description_Game as GameDescription
FROM Users u
CROSS JOIN Games g  -- Start with all possible game combinations
LEFT JOIN like_a l ON u.ID_User = l.ID_User AND g.ID_Game = l.ID_Game
WHERE l.ID_Game IS NULL  -- Exclude already liked games
ORDER BY g.Name_Game
LIMIT 10; -- Limit API's calls to 10 recommendations display

-- Complex recommendation :

START TRANSACTION;

-- Get the categories and mechanics of games the user has liked
CREATE TEMPORARY TABLE UserLikedGameAttributes AS
SELECT
    ha.ID_Category,
    ha.ID_Mechanics
FROM have_a ha
JOIN like_a l ON ha.ID_Game = l.ID_Game
WHERE l.ID_User = user_id;

-- Content-Based Filtering:
-- Recommend games that share categories or mechanics with the user's liked games
SELECT * FROM Games g JOIN have_a ha ON g.ID_Game = ha.ID_Game
JOIN UserLikedGameAttributes ula ON ha.ID_Category = ula.ID_Category OR ha.ID_Mechanics = ula.ID_Mechanics
WHERE g.ID_Game NOT IN (SELECT ID_Game FROM like_a WHERE ID_User = user_id)  -- Exclude already liked games
ORDER BY g.Name_Game;

DROP TEMPORARY TABLE IF EXISTS UserLikedGameAttributes;
COMMIT;

-- Collaborative Filtering (User-Based)
START TRANSACTION;

-- Find similar users (simplified: users who liked at least one of the same games)
CREATE TEMPORARY TABLE SimilarUsers AS
SELECT
    l2.ID_User AS SimilarUserID
FROM like_a l1
JOIN like_a l2 ON l1.ID_Game = l2.ID_Game AND l1.ID_User != l2.ID_User
WHERE l1.ID_User = user_id
GROUP BY l2.ID_User;

-- Recommend games liked by similar users but not by the current user
SELECT * FROM Games g
JOIN like_a l ON g.ID_Game = l.ID_Game
JOIN SimilarUsers su ON l.ID_User = su.SimilarUserID
WHERE g.ID_Game NOT IN (SELECT ID_Game FROM like_a WHERE ID_User = user_id)
GROUP BY g.ID_Game
ORDER BY COUNT(*) DESC, g.Name_Game ASC;  -- Order by popularity among similar users

DROP TEMPORARY TABLE IF EXISTS SimilarUsers;

COMMIT;