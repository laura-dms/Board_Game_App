create database if not exists board_games;
use board_games;

CREATE TABLE Users(
   ID_User INT,
   Username VARCHAR(50) NOT NULL,
   Password VARCHAR(50) NOT NULL,
   Role_User VARCHAR(50) NOT NULL,
   PRIMARY KEY(ID_User),
   UNIQUE(Username)
);

CREATE TABLE Games(
   ID_Game INT,
   Description_Game VARCHAR(500) NOT NULL,
   Name_Game VARCHAR(50) NOT NULL,
   Min_players_Game INT NOT NULL,
   Max_players_Game INT NOT NULL,
   Min_age_Game DECIMAL(15,2) NOT NULL,
   Playing_time_Game DECIMAL(15,2),
   Year_published_Game DECIMAL(15,2) NOT NULL,
   Thumbnail_Game VARCHAR(500) NOT NULL,
   PRIMARY KEY(ID_Game),
   UNIQUE(Description_Game),
   UNIQUE(Name_Game),
   UNIQUE(Thumbnail_Game)
);

CREATE TABLE Categories(
   ID_Category INT,
   Category_Name VARCHAR(50) NOT NULL,
   PRIMARY KEY(ID_Category)
);

CREATE TABLE Mechanics(
   ID_Mechanics INT,
   Mechanic_name VARCHAR(50) NOT NULL,
   PRIMARY KEY(ID_Mechanics)
);

CREATE TABLE Creators(
   ID_Creators INT,
   Name_Creator VARCHAR(50) NOT NULL,
   Company_Creator VARCHAR(50) NOT NULL,
   PRIMARY KEY(ID_Creators)
);

CREATE TABLE click_on(
   ID_Click INT,
   ID_User INT,
   ID_Game INT,
   Date_click DATETIME,
   PRIMARY KEY(ID_Click),
   FOREIGN KEY(ID_User) REFERENCES Users(ID_User),
   FOREIGN KEY(ID_Game) REFERENCES Games(ID_Game)
);

CREATE TABLE like_a(
   ID_User INT,
   ID_Game INT,
   Date_like DATETIME,
   PRIMARY KEY(ID_User, ID_Game),
   FOREIGN KEY(ID_User) REFERENCES Users(ID_User),
   FOREIGN KEY(ID_Game) REFERENCES Games(ID_Game)
);

CREATE TABLE have_a(
   ID_Game INT,
   ID_Category INT,
   ID_Mechanics INT,
   ID_Creators INT,
   PRIMARY KEY(ID_Game, ID_Category, ID_Mechanics, ID_Creators),
   FOREIGN KEY(ID_Game) REFERENCES Games(ID_Game),
   FOREIGN KEY(ID_Category) REFERENCES Categories(ID_Category),
   FOREIGN KEY(ID_Mechanics) REFERENCES Mechanics(ID_Mechanics),
   FOREIGN KEY(ID_Creators) REFERENCES Creators(ID_Creators)
);

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
CREATE VIEW FamilyFriendlyGamesView AS
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
CREATE VIEW LongPlayingGamesView AS
SELECT 
    ID_Game AS GameID,
    Name_Game AS GameName,
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