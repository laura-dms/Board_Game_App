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

