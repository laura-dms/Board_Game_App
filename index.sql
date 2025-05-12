CREATE INDEX idx_user_game          ON click_on (ID_User, ID_Game);
CREATE INDEX idx_like_a             ON like_a (ID_User, ID_Game);
CREATE INDEX idx_have_a             ON have_a (ID_Game, ID_Category, ID_Mechanics);
CREATE INDEX idx_games              ON Games (ID_Game, Name_Game);
CREATE INDEX idx_Games_Name		    ON Games(Name_Game);

CREATE INDEX idx_Games_Year		    ON Games(Year_published_Game);
CREATE INDEX idx_Games_Time		    ON Games(Playing_time_Game);
CREATE INDEX idx_Games_MinAge	    ON Games(Min_age_Game);
CREATE INDEX idx_Games_MinPlayers	ON Games(Min_players_Game);
CREATE INDEX idx_Games_MaxPlayers	ON Games(Max_players_Game);

CREATE INDEX idx_Cat_Name		    ON Categories(Category_Name);
CREATE INDEX idx_Mech_Name		    ON Mechanics(Mechanic_name);

CREATE INDEX idx_havea_Game		    ON have_a(ID_Game);
CREATE INDEX idx_havea_Category	    ON have_a(ID_Category);
CREATE INDEX idx_havea_Mechanics	ON have_a(ID_Mechanics);