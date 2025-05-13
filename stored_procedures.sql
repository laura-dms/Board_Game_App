use board_games;

DELIMITER //

CREATE PROCEDURE InsertNewUser (
    IN p_Username VARCHAR(50),
    IN p_Password VARCHAR(255),
    IN p_RoleUser VARCHAR(10)
)
BEGIN
    -- var to count existing users
    DECLARE user_count INT;

    -- check if role is valid
    IF p_RoleUser NOT IN ('Admin', 'Player', 'Editor') THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Invalid user role.';
    ELSE
        -- check if user already exists
        SELECT COUNT(*) INTO user_count FROM Users WHERE Username = p_Username;
        IF user_count > 0 THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Username already exists.';
        ELSE
            SET p_Password = p_Password;
            -- insert user
            INSERT INTO Users (Username, Password, Role_User)
            VALUES (p_Username, p_Password, p_RoleUser);
        END IF;
    END IF;
END //

DELIMITER ;



DELIMITER //

CREATE PROCEDURE InsertGame (
    IN p_User_ID INT,
    IN p_Description_Game VARCHAR(500),
    IN p_Name_Game VARCHAR(50),
    IN p_Min_players_Game INT,
    IN p_Max_players_Game INT,
    IN p_Min_age_Game DECIMAL(15,2),
    IN p_Playing_time_Game DECIMAL(15,2),
    IN p_Year_published_Game DECIMAL(15,2),
    IN p_Thumbnail_Game VARCHAR(500)
)
BEGIN
    DECLARE user_role VARCHAR(10);

    -- get role of the user
    SELECT Role_User INTO user_role FROM Users WHERE ID_User = p_User_ID;

    -- check is user has editor or admin role
    IF user_role IN ('Editor', 'Admin') THEN
        -- check if game not already exists
        IF NOT EXISTS (SELECT 1 FROM Games WHERE Name_Game = p_Name_Game) THEN
            -- Iinsert game
            INSERT INTO Games (
                Description_Game,
                Name_Game,
                Min_players_Game,
                Max_players_Game,
                Min_age_Game,
                Playing_time_Game,
                Year_published_Game,
                Thumbnail_Game
            )
            VALUES (
                p_Description_Game,
                p_Name_Game,
                p_Min_players_Game,
                p_Max_players_Game,
                p_Min_age_Game,
                p_Playing_time_Game,
                p_Year_published_Game,
                p_Thumbnail_Game
            );
        ELSE
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'A game with this name already exists.';
        END IF;
    ELSE
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Only users with Editor or Admin role can insert games.';
    END IF;
END //

DELIMITER ;



DELIMITER //

CREATE PROCEDURE UpdateUserPassword (
    IN p_UserID INT,
    IN p_CurrentPassword VARCHAR(255),
    IN p_NewPassword VARCHAR(255)
)
BEGIN
    -- variable to count existing users
    DECLARE user_count INT;
    DECLARE stored_password VARCHAR(255);

    -- check if user exist
    SELECT COUNT(*) INTO user_count FROM Users WHERE ID_User = p_UserID;

    IF user_count = 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'User not found.';
    ELSE
        -- get old password
        SELECT Password INTO stored_password FROM Users WHERE ID_User = p_UserID;

        IF p_CurrentPassword = stored_password THEN
            -- set new password
            SET p_NewPassword = p_NewPassword;

            -- update password
            UPDATE Users
            SET Password = p_NewPassword
            WHERE ID_User = p_UserID;
        ELSE
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Current password is incorrect.';
        END IF;
    END IF;
END //

DELIMITER ;

CALL UpdateUserPassword(75, '+d7LL4r)yeUJ', 'motdepasse');
CALL InsertNewUser ('kevinadmin', '123456789', 'Admin');
-- CALL InsertGame(76, 'A fast-paced card game for 2-4 players.', 'Space Explorers', 2, 4, 8.0, 30.0, 2023.0, 'https://example.com/space_explorers_thumbnail.jpg');



CREATE OR REPLACE VIEW view_candidate_recommendations AS
SELECT
  ha.ID_Game,
  ha.ID_Category,
  ha.ID_Mechanics
FROM have_a ha
WHERE (
  ha.ID_Category IN (
    SELECT ha2.ID_Category
    FROM have_a ha2
    JOIN like_a la2 ON ha2.ID_Game = la2.ID_Game
  )
  OR
  ha.ID_Mechanics IN (
    SELECT ha2.ID_Mechanics
    FROM have_a ha2
    JOIN like_a la2 ON ha2.ID_Game = la2.ID_Game
  )
)
AND ha.ID_Game NOT IN (
  SELECT la3.ID_Game
  FROM like_a la3
);



DELIMITER //

CREATE PROCEDURE generate_recommendations(IN user_id INT)
BEGIN
  START TRANSACTION;

  -- Supprimer les anciennes recommandations pour cet utilisateur
  DELETE FROM gamerecommendations
  WHERE ID_User = user_id;

  -- Insérer les nouvelles recommandations
  INSERT INTO gamerecommendations (ID_User, ID_Game, Recommendation_Date, Score)
  SELECT
    user_id AS ID_User,
    vcr.ID_Game,
    NOW() AS Recommendation_Date,
    COUNT(*) AS Score
  FROM view_candidate_recommendations vcr
  WHERE vcr.ID_Game NOT IN (
    SELECT ID_Game FROM like_a WHERE ID_User = user_id
  )
  AND (
    vcr.ID_Category IN (
      SELECT ha.ID_Category
      FROM have_a ha
      WHERE ha.ID_Game IN (
        SELECT la.ID_Game
        FROM like_a la
        WHERE la.ID_User = user_id
      )
    )
    OR
    vcr.ID_Mechanics IN (
      SELECT ha.ID_Mechanics
      FROM have_a ha
      WHERE ha.ID_Game IN (
        SELECT la.ID_Game
        FROM like_a la
        WHERE la.ID_User = user_id
      )
    )
  )
  GROUP BY vcr.ID_Game;

  COMMIT;
END;

//

DELIMITER ;




CALL generate_recommendations(3);
