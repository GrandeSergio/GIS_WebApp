from django.http import JsonResponse
from django.db import connection
import json


def execute_geojson_query(sql_query):
    """
    Generyczna metoda do wykonania zapytania SQL i zwrócenia danych w formacie GeoJSON.
    :param sql_query: Strona zapytania SQL do wykonania
    :return: JsonResponse z danymi w formacie GeoJSON
    """
    try:
        with connection.cursor() as cursor:
            cursor.execute(sql_query)
            columns = [col[0] for col in cursor.description]  # Pobieranie nazw kolumn
            data = [dict(zip(columns, row)) for row in cursor.fetchall()]  # Pobieranie wyników w formie listy słowników

        # Tworzenie struktury GeoJSON
        geojson = {
            "type": "FeatureCollection",
            "features": [
                {
                    "type": "Feature",
                    "properties": {key: row[key] for key in row if key not in ["geometry", "geom"]},
                    "geometry": json.loads(row["geometry"])  # Parsowanie geometrii jako JSON
                }
                for row in data if row.get("geometry")  # Ignorowanie rekordów z pustą geometrią
            ]
        }

        return JsonResponse(geojson)

    except Exception as e:
        return JsonResponse({"error": str(e), "message": "Error occurred while processing data."})
