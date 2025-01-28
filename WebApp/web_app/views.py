
from django.http import JsonResponse
from django.db import connection
import json

def korytarze_ekologiczne(request):
    with connection.cursor() as cursor:
        cursor.execute(
            'SELECT id, "Nazwa_PL" as name, ST_AsGeoJSON(geom) as geometry FROM public."KorytarzeEkologiczne"'
        )
        columns = [col[0] for col in cursor.description]
        data = [dict(zip(columns, row)) for row in cursor.fetchall()]

    # Convert results into GeoJSON format
    geojson = {
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "properties": {"id": row["id"], "name": row["name"]},
                "geometry": json.loads(row["geometry"]),  # Convert GeoJSON string to dict
            }
            for row in data
        ],
    }

    return JsonResponse(geojson)

def jcwprzeczne(request):
    with connection.cursor() as cursor:
        cursor.execute(
            'SELECT id, "Nazwa_JCWP" as name, ST_AsGeoJSON(geom) as geometry FROM public."JCWPRzeczne"'
        )
        columns = [col[0] for col in cursor.description]
        data = [dict(zip(columns, row)) for row in cursor.fetchall()]

    geojson = {
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "properties": {"id": row["id"], "name": row.get("Nazwa_JCWP", "Brak nazwy")},
                "geometry": json.loads(row["geometry"]),  # Konwertuj GeoJSON string na dict
            }
            for row in data if row.get("geometry")  # Filtruj rekordy bez geometrii
        ],
    }

    return JsonResponse(geojson)

from django.shortcuts import render

def map_view(request):
    return render(request, 'base.html')