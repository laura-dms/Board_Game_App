import csv
import os

# --- Configuration ---
details_csv_path = 'details.csv'
ratings_csv_path = 'ratings.csv' # Path to the ratings file
sql_output_file = 'insert_games.sql'
table_name = 'Games'
batch_size = 1000 # How many rows per INSERT statement

# Column indices from details.csv (0-based)
# num,id,primary,description,yearpublished,minplayers,maxplayers,playingtime,minplaytime,maxplaytime,minage,...
ID_COL_D = 1
NAME_COL_D = 2
DESC_COL_D = 3
YEAR_COL_D = 4
MIN_PLAYER_COL_D = 5
MAX_PLAYER_COL_D = 6
PLAY_TIME_COL_D = 7
MIN_AGE_COL_D = 10

# Column indices from ratings.csv (0-based)
# num,id,name,year,rank,average,bayes_average,users_rated,url,thumbnail
ID_COL_R = 1
THUMBNAIL_COL_R = 9

# --- Helper Function ---
def escape_sql_string(value):
    """Escapes single quotes for SQL insertion."""
    if value is None:
        return "NULL"
    # Replace single quotes with two single quotes
    return "'" + str(value).replace("'", "''") + "'"

def format_sql_value(value, is_numeric=False, is_nullable=False, max_len=None):
    """Formats a value for SQL, handling escaping, truncation, NULLs, and numeric types."""
    if value is None or value == '':
        return "NULL" if is_nullable else ('0' if is_numeric else "''") # Default for NOT NULL

    str_value = str(value)

    # Truncate if max_len is specified *before* escaping
    if max_len is not None:
        str_value = str_value[:max_len]

    if is_numeric:
        try:
            # Try converting to float first to handle potential decimals, then format
            float_val = float(str_value)
            # You might want specific formatting, e.g., always 2 decimal places
            # return f"{float_val:.2f}"
            return str(float_val) # Let SQL handle DECIMAL conversion
        except (ValueError, TypeError):
            # If conversion fails for a numeric field
            if is_nullable:
                return "NULL"
            else:
                # This case should ideally be handled before calling format_sql_value
                # for NOT NULL columns, but as a fallback:
                print(f"Warning: Could not convert '{value}' to number for a NOT NULL column. Using 0.")
                return '0'
    else:
        # Escape string values
        return escape_sql_string(str_value)

# --- Main Script ---
print(f"Starting conversion using:")
print(f"  Details file: {details_csv_path}")
print(f"  Ratings file: {ratings_csv_path}")
print(f"  Output SQL:   {sql_output_file}")

try:
    # Ensure the output directory exists
    output_dir = os.path.dirname(sql_output_file)
    if output_dir and not os.path.exists(output_dir):
        os.makedirs(output_dir)
        print(f"Created output directory: {output_dir}")

    with open(details_csv_path, mode='r', encoding='utf-8', newline='') as infile_d, \
         open(ratings_csv_path, mode='r', encoding='utf-8', newline='') as infile_r, \
         open(sql_output_file, mode='w', encoding='utf-8') as outfile:

        reader_d = csv.reader(infile_d)
        reader_r = csv.reader(infile_r)

        # Read and discard headers
        header_d = next(reader_d)
        header_r = next(reader_r)

        print("Headers skipped. Starting row processing...")

        row_count = 0
        error_count = 0
        id_mismatch_count = 0
        values_batch = [] # For batch inserts

        # Use zip to read both files line by line simultaneously
        # Note: zip stops when the shorter iterable is exhausted
        for i, (row_details, row_ratings) in enumerate(zip(reader_d, reader_r), start=1):
            try:
                # Basic check for sufficient columns in both rows
                if len(row_details) <= max(ID_COL_D, NAME_COL_D, DESC_COL_D, YEAR_COL_D, MIN_PLAYER_COL_D, MAX_PLAYER_COL_D, PLAY_TIME_COL_D, MIN_AGE_COL_D):
                    print(f"Warning: Skipping row {i} due to insufficient columns in details.csv ({len(row_details)} cols).")
                    error_count += 1
                    continue
                if len(row_ratings) <= max(ID_COL_R, THUMBNAIL_COL_R):
                    print(f"Warning: Skipping row {i} due to insufficient columns in ratings.csv ({len(row_ratings)} cols).")
                    error_count += 1
                    continue

                # --- Verification Step ---
                id_details = int(row_details[ID_COL_D])
                id_ratings = int(row_ratings[ID_COL_R])
                if id_details != id_ratings:
                    print(f"CRITICAL: ID mismatch on line {i}! Details ID: {id_details}, Ratings ID: {id_ratings}. Skipping row.")
                    id_mismatch_count += 1
                    error_count += 1
                    continue # Skip this row pair if IDs don't match

                # --- Extract data ---
                # From details.csv
                game_id = id_details # Use the verified ID
                name = row_details[NAME_COL_D]
                description = row_details[DESC_COL_D]
                description = description.replace('&#10;', '').replace('&#9;', '')
                year_published = int(row_details[YEAR_COL_D]) if row_details[YEAR_COL_D] else 0
                min_players = int(row_details[MIN_PLAYER_COL_D]) if row_details[MIN_PLAYER_COL_D] else 0
                max_players = int(row_details[MAX_PLAYER_COL_D]) if row_details[MAX_PLAYER_COL_D] else 0
                playing_time = row_details[PLAY_TIME_COL_D] # Handle NULL later
                min_age = int(row_details[MIN_AGE_COL_D]) if row_details[MIN_AGE_COL_D] else 0

                # From ratings.csv
                thumbnail = row_ratings[THUMBNAIL_COL_R] # Get the thumbnail URL

                # --- Format for SQL, applying constraints ---
                sql_id = format_sql_value(game_id, is_numeric=True)
                sql_desc = format_sql_value(description, max_len=500) # Truncate & Escape
                sql_name = format_sql_value(name, max_len=50) # Truncate & Escape
                sql_min_players = format_sql_value(min_players, is_numeric=True)
                sql_max_players = format_sql_value(max_players, is_numeric=True)
                sql_min_age = format_sql_value(min_age, is_numeric=True)
                sql_playing_time = format_sql_value(playing_time, is_numeric=True, is_nullable=True)
                sql_year = format_sql_value(year_published, is_numeric=True)
                sql_thumbnail = format_sql_value(thumbnail, max_len=500) # Truncate & Escape

                # Check if essential NOT NULL numeric conversions failed
                if any(val is None for val in [sql_id, sql_min_players, sql_max_players, sql_min_age, sql_year]):
                     raise ValueError("Essential numeric field conversion failed for NOT NULL column.")

                # Construct the VALUES part of the INSERT statement
                values_str = f"({sql_id}, {sql_desc}, {sql_name}, {sql_min_players}, {sql_max_players}, {sql_min_age}, {sql_playing_time}, {sql_year}, {sql_thumbnail})"
                values_batch.append(values_str)

                row_count += 1

                # Write batch insert statement
                if len(values_batch) >= batch_size:
                    outfile.write(f"INSERT INTO {table_name} (ID_Game, Description_Game, Name_Game, Min_players_Game, Max_players_Game, Min_age_Game, Playing_time_Game, Year_published_Game, Thumbnail_Game) VALUES\n")
                    outfile.write(',\n'.join(values_batch))
                    outfile.write(';\n\n')
                    values_batch = [] # Reset batch
                    if row_count % (batch_size * 10) == 0: # Print progress less often
                         print(f"Written batch up to row {row_count}...")


            except (ValueError, IndexError) as e:
                print(f"Error processing data row {i}: {e} - Skipping row.")
                print(f"  Details Data (partial): {row_details[:5]}...")
                print(f"  Ratings Data (partial): {row_ratings[:5]}...")
                error_count += 1
            except Exception as e:
                 print(f"An unexpected error occurred processing row {i}: {e} - Skipping row.")
                 error_count += 1


        # Write any remaining rows in the last batch
        if values_batch:
            outfile.write(f"INSERT INTO {table_name} (ID_Game, Description_Game, Name_Game, Min_players_Game, Max_players_Game, Min_age_Game, Playing_time_Game, Year_published_Game, Thumbnail_Game) VALUES\n")
            outfile.write(',\n'.join(values_batch))
            outfile.write(';\n')

    print("-" * 30)
    print(f"Conversion complete!")
    print(f"Successfully processed and matched rows: {row_count}")
    print(f"Skipped rows due to errors/short rows: {error_count}")
    print(f"Skipped rows due to ID mismatch: {id_mismatch_count}")
    print(f"SQL INSERT statements written to: {sql_output_file}")
    print("-" * 30)
    print("IMPORTANT NOTES:")
    print("- Review the generated '.sql' file before execution.")
    print("- Descriptions, Names, AND Thumbnails were truncated to 50 characters.")
    print("  >> Consider increasing VARCHAR lengths in your SQL table (e.g., 255).")
    print("- Ensure your SQL table schema matches (especially NULL constraints).")
    print("- UNIQUE constraints might fail due to truncation.")
    if id_mismatch_count > 0:
        print("- WARNING: ID mismatches occurred, indicating potential file misalignment.")

except FileNotFoundError as e:
    print(f"Error: A required CSV file was not found: {e.filename}")
except Exception as e:
    print(f"An unexpected error occurred: {e}")