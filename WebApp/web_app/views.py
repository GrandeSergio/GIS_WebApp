from .utils import execute_geojson_query
from django.shortcuts import render


def korytarze_ekologiczne(request):
    sql_query = 'SELECT *, ST_AsGeoJSON(geom) as geometry FROM public."KorytarzeEkologiczne"'
    return execute_geojson_query(sql_query)

def jcwprzeczne(request):
    sql_query = 'SELECT *, ST_AsGeoJSON(geom) as geometry FROM public."JCWPRzeczne"'
    return execute_geojson_query(sql_query)

def map_view(request):
    return render(request, 'base.html')