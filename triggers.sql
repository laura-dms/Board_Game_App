use board_games;

/* MOST USEFUL FOR AUTOMATION : ⬅️*/

/* TRIGGER 1 ⬅️ 🆗
- To ensure that the Role_User is one of a predefined set of valid roles (e.g., 'Admin', 'Player', 'Editor').
- To hash the Password before storing it in the database.
*/

delimiter $$
CREATE TRIGGER TR_Users_BeforeInsert
BEFORE INSERT ON Users
FOR EACH ROW
BEGIN
    IF NEW.Role_User NOT IN ('Admin', 'Player', 'Editor') THEN
		SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Invalid user role';
    END IF;
    SET NEW.Password = SHA2(NEW.Password, 256);
END $$
delimiter ;

/* TEST TRIGGER 1*/

/* Test Case 1: Valid User Insertion */

ALTER TABLE Users MODIFY Password VARCHAR(255); /* Increase the lenght of attribute Password as (50) not enough*/

INSERT INTO Users (ID_User, Username, Password, Role_User) VALUES (76, 'valid_user', 'password123', 'Player');
SELECT ID_User, Username, Role_User, Password FROM Users WHERE Username = 'valid_user';

/*Test Case 2: Invalid User Role*/

INSERT INTO Users (ID_User, Username, Password, Role_User) VALUES (2, 'invalid_user', 'password456', 'InvalidRole');

/*Test Case : NULL Password*/

INSERT INTO Users (ID_User, Username, Password, Role_User) VALUES (79, 'null_password_user', NULL, 'Editor');
SELECT ID_User, Username, Role_User, Password FROM Users WHERE Username = 'null_password_user';

/* TRIGGER 2 🆗
- To prevent direct modification of the Role_User (if role changes should be controlled by a specific procedure).
- To re-hash the password if it is being updated.
*/

delimiter $$
CREATE TRIGGER TR_Users_BeforeUpdate
BEFORE UPDATE ON Users
FOR EACH ROW
BEGIN
    IF NEW.Role_User != OLD.Role_User THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Role changes are not allowed.';
    END IF;
    IF NEW.Password != OLD.Password THEN
        SET NEW.Password = SHA2(NEW.Password, 256);
    END IF;
END $$
delimiter ;

/* Test 1: Valid Password Update*/

UPDATE Users SET Password = 'newpassword789' WHERE ID_User = 1;
SELECT ID_User, Username, Role_User, Password FROM Users WHERE ID_User = 1;

/* Test 2: Attempt to Change Role*/

UPDATE Users SET Role_User = 'Player' WHERE ID_User = 1;

/* Test 3 : No password and role change*/

UPDATE Users SET Username = 'laurencice' WHERE ID_User = 1;
SELECT ID_User, Username, Role_User, Password FROM Users WHERE ID_User = 1;

/* TRIGGER 3 ⬅️
- To set the Date_click to the current timestamp if it's not provided.
- To prevent a user from clicking on the same game too frequently (click fraud)
*/

delimiter $$
CREATE TRIGGER TR_click_on_BeforeInsert 
BEFORE INSERT ON click_on
FOR EACH ROW
BEGIN
    IF NEW.Date_click IS NULL THEN
        SET NEW.Date_click = NOW();
    END IF;
    SELECT COUNT(*) INTO @click_count
    FROM click_on
    WHERE ID_User = NEW.ID_User AND ID_Game = NEW.ID_Game
    AND Date_click > NOW() - INTERVAL 10 SECOND;
    IF @click_count > 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Too many clicks on the same game in a short period.';
    END IF;
END $$
delimiter ;

/* Test 1: Insert with NULL Date_click*/

ALTER TABLE click_on
MODIFY ID_Click INT AUTO_INCREMENT; /* Auto-calculation of ID_Click, not manual*/

INSERT INTO click_on (ID_User, ID_Game, Date_click) VALUES (65, 432, NULL);
SELECT * FROM click_on WHERE ID_User = 65 AND ID_Game = 432;

/* Test 2: Insert with Provided Date_click */

SELECT ID_User FROM Users;
SELECT ID_Game FROM Games;

INSERT INTO click_on (ID_User, ID_Game, Date_click) VALUES (66, 68448, '2024-01-15 10:00:00');
SELECT * FROM click_on WHERE ID_User = 66 AND ID_Game = 68448;

/* Test 3: Rapid Clicks*/

INSERT INTO click_on (ID_User, ID_Game, Date_click) VALUES (66, 68448, NOW());
INSERT INTO click_on (ID_User, ID_Game, Date_click) VALUES (66, 68448, NOW());  -- Attempt a second click within 10 seconds.

/* TRIGGER 4
- To set the Date_like to the current timestamp if it's not provided.
- To prevent duplicate likes.
*/
delimiter $$
CREATE TRIGGER TR_like_a_BeforeInsert
BEFORE INSERT ON like_a
FOR EACH ROW
BEGIN
    IF NEW.Date_like IS NULL THEN
        SET NEW.Date_like = NOW();
    END IF;
    SELECT COUNT(*) INTO @like_count
    FROM like_a
    WHERE ID_User = NEW.ID_User AND ID_Game = NEW.ID_Game;
    IF @like_count > 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'User has already liked this game.';
    END IF;
END $$
delimiter ;

/* Test 1: Insert with NULL Date_like*/
INSERT INTO like_a (ID_User, ID_Game, Date_like) VALUES (65, 432, NULL);
SELECT * FROM like_a WHERE ID_User = 65 AND ID_Game = 432;

/*Test 2: Insert with Provided Date_like*/
INSERT INTO like_a (ID_User, ID_Game, Date_like) VALUES (66, 68448, '2024-02-20 15:30:00');
SELECT * FROM like_a WHERE ID_User = 66 AND ID_Game = 68448;

/* Test 3: Duplicate Like*/
INSERT INTO like_a (ID_User, ID_Game, Date_like) VALUES (75, 31260, NOW());
INSERT INTO like_a (ID_User, ID_Game, Date_like) VALUES (75, 31260, NOW());  -- Attempt a duplicate like

/* TRIGGER 5
- Check the insertion limit before a new line in the like_a table is inserted. 
- To make tests easier, let’s consider that the liked_limit is 50.
*/
delimiter $$
CREATE TRIGGER cap_games_liked
BEFORE INSERT ON like_a
FOR EACH ROW
BEGIN
    DECLARE liked_count INT;
    SELECT COUNT(*) INTO liked_count
    FROM like_a
    WHERE ID_User = NEW.ID_User;
    IF liked_count >= 50 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Maximum number of liked games (50) reached.';
    END IF;
END $$
delimiter ;


/* TRIGGER 6 ⬅️
- Log into a new table called users_changes_log, every update made to the user username and password in the USERS table
- Help to keep track of changes over time
*/

CREATE TABLE users_changes_log (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    ID_User INT,
    old_username VARCHAR(50),
    new_username VARCHAR(50),
    old_password VARCHAR(255),  -- Store hashed password
    new_password VARCHAR(255),  -- Store hashed password
    change_timestamp DATETIME
);

delimiter $$
CREATE TRIGGER users_results_changes
AFTER UPDATE ON Users
FOR EACH ROW
BEGIN
    IF OLD.Username != NEW.Username OR OLD.Password != NEW.Password THEN
        INSERT INTO users_changes_log (ID_User, old_username, new_username, old_password, new_password, change_timestamp)
        VALUES (OLD.ID_User, OLD.Username, NEW.Username, OLD.Password, NEW.Password, NOW());
    END IF;
END $$
delimiter ;

/*Test 1: Change Username Only*/

UPDATE Users SET Username = 'new_username' WHERE ID_User = 1;
SELECT * FROM users_changes_log WHERE ID_User = 1;

/*Test 2: Change Password Only*/

UPDATE Users SET Password = 'another_password' WHERE ID_User = 1;
SELECT * FROM users_changes_log WHERE ID_User = 1;

/* Test 3 : Change BOTH password and username */ 
UPDATE Users SET Username = 'another_username', Password = 'password3' WHERE ID_User = 1;
SELECT * FROM users_changes_log WHERE ID_User = 1;