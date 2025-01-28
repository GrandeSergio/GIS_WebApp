from django.urls import path
from .views import korytarze_ekologiczne, jcwprzeczne, map_view

urlpatterns = [
    path('api/layers/korytarze/', korytarze_ekologiczne, name='korytarze_ekologiczne'),
    path('api/layers/jcwprzeczne/', jcwprzeczne, name='jcwprzeczne'),
    path('map/', map_view, name='map-view'),
]