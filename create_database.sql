drop database if exists board_games;
create database if not exists board_games;
use board_games;

CREATE TABLE Users(
   ID_User INT AUTO_INCREMENT,
   Username VARCHAR(50) NOT NULL,
   Password VARCHAR(255) NOT NULL,
   Role_User VARCHAR(50) NOT NULL,
   PRIMARY KEY(ID_User),
   UNIQUE(Username)
);

CREATE TABLE Games(
   ID_Game INT AUTO_INCREMENT,
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
   ID_Category INT AUTO_INCREMENT,
   Category_Name VARCHAR(50) NOT NULL,
   PRIMARY KEY(ID_Category)
);

CREATE TABLE Mechanics(
   ID_Mechanics INT AUTO_INCREMENT,
   Mechanic_name VARCHAR(50) NOT NULL,
   PRIMARY KEY(ID_Mechanics)
);

CREATE TABLE Creators(
   ID_Creators INT AUTO_INCREMENT,
   Name_Creator VARCHAR(50) NOT NULL,
   Company_Creator VARCHAR(50) NOT NULL,
   PRIMARY KEY(ID_Creators)
);

CREATE TABLE click_on(
   ID_Click INT AUTO_INCREMENT,
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

-- Table to store user search history
CREATE TABLE SearchHistory (
    ID_Search INT AUTO_INCREMENT PRIMARY KEY,
    ID_User INT,
    Search_Term VARCHAR(255) NOT NULL,
    Search_Date DATETIME NOT NULL,
    FOREIGN KEY (ID_User) REFERENCES Users(ID_User)
);

-- Table to store game recommendations for users
CREATE TABLE GameRecommendations (
    ID_Recommendation INT AUTO_INCREMENT PRIMARY KEY,
    ID_User INT,
    ID_Game INT,
    Recommendation_Date DATETIME NOT NULL,
    Score DECIMAL(10, 5),  -- Optional:  A score indicating recommendation strength
    FOREIGN KEY (ID_User) REFERENCES Users(ID_User),
    FOREIGN KEY (ID_Game) REFERENCES Games(ID_Game),
    UNIQUE (ID_User, ID_Game) --  Prevent duplicate recommendations for the same user and game
);

