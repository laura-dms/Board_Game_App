import csv

# Ouvre le fichier CSV
with open('ratings.csv', newline='', encoding='utf-8') as csvfile:
    reader = csv.DictReader(csvfile)

    with open('details.sql', 'w', encoding='utf-8') as sqlfile:
        for row in reader:
            query = (
                "INSERT INTO boardgames (num, id, name, year, rank, average, bayes_average, users_rated, url, thumbnail) "
                f"VALUES ({int(row['num'])}, {int(row['id'])}, '{row['name']}', "
                f"{int(row['year'])}, {int(row['rank'])}, {float(row['average'])}, {float(row['bayes_average'])}, "
                f"{int(row['users_rated'])}, '{row['url']}', '{row['thumbnail']}');\n"
            )
            sqlfile.write(query)
