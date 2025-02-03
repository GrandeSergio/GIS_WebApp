from django.http import JsonResponse
from django.db import connection
import json

class BaseModel:
    @staticmethod
    def fetch_all(query):
        """
        Generic method to fetch all records from table .
        :param query: SQL query to fetch records.
        """
        try:
            with connection.cursor() as cursor:
                cursor.execute(query)
                columns = [col[0] for col in cursor.description]
                results = [
                    dict(zip(columns, row)) for row in cursor.fetchall()
                ]
            return results
        except Exception as e:
            print(f"Error occurred fetching data using query: {query}: {e}")
            return []

def execute_geojson_query(sql_query):
    """
    Generic method to execute sql query and receive response from database with GeoJSON format.
    :param sql_query: SQL query to fetch records
    :return: JsonResponse with data in GeoJSON format.
    """
    try:
        with connection.cursor() as cursor:
            cursor.execute(sql_query)
            columns = [col[0] for col in cursor.description]
            data = [dict(zip(columns, row)) for row in cursor.fetchall()]

        geojson = {
            "type": "FeatureCollection",
            "features": [
                {
                    "type": "Feature",
                    "properties": {key: row[key] for key in row if key not in ["geometry", "geom"]},
                    "geometry": json.loads(row["geometry"])
                }
                for row in data if row.get("geometry")
            ]
        }

        return JsonResponse(geojson)

    except Exception as e:
        return JsonResponse({"error": str(e), "message": "Error occurred while processing data."})
