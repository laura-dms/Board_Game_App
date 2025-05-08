import pymysql
from dotenv import load_dotenv
import os


load_dotenv()

# conenct DB with .env
conn = pymysql.connect(
    host=os.getenv("DB_HOST"),
    user=os.getenv("DB_USER"),
    password=os.getenv("DB_PASSWORD"),
    database=os.getenv("DB_NAME"),
    port=int(os.getenv("DB_PORT"))
)

cursor = conn.cursor()

# get all categories and mechanics
cursor.execute("SELECT ID_Category, Category_Name FROM categories")
categories = cursor.fetchall()
category_index = {cat_id: i for i, (cat_id, _) in enumerate(categories)}

cursor.execute("SELECT ID_Mechanics, Mechanic_name FROM mechanics")
mechanics = cursor.fetchall()
mechanic_index = {mech_id: i + len(category_index) for i, (mech_id, _) in enumerate(mechanics)}

vector_size = len(category_index) + len(mechanic_index)

# get all games
cursor.execute("SELECT ID_Game, Name_Game FROM games")
games = cursor.fetchall()

# for all games, create a vector of size vector_size
game_vectors = {}

for game_id, game_name in games:
    vector = [0] * vector_size

    # categories
    cursor.execute("SELECT ID_Category FROM have_a WHERE ID_Game = %s", (game_id,))
    cat_ids = [row[0] for row in cursor.fetchall()]
    for cid in cat_ids:
        if cid in category_index:
            vector[category_index[cid]] = 1

    # mechanics
    cursor.execute("SELECT ID_Mechanics FROM have_a WHERE ID_Game = %s", (game_id,))
    mech_ids = [row[0] for row in cursor.fetchall()]
    for mid in mech_ids:
        if mid in mechanic_index:
            vector[mechanic_index[mid]] = 1

    game_vectors[game_id] = {
        "name": game_name,
        "vector": vector
    }

for game_id, data in game_vectors.items():
    print(f"{data['name']}: {data['vector']}")
