from django.db import models
from django.db import connection

class KorytarzeEkologiczne:
    @staticmethod
    def get_all():
        with connection.cursor() as cursor:
            cursor.execute('SELECT * FROM public."KorytarzeEkologiczne"')
            columns = [col[0] for col in cursor.description]  # Get column names
            results = [
                dict(zip(columns, row)) for row in cursor.fetchall()
            ]
            return results

class JCWPRzeczne:
    @staticmethod
    def get_all():
        with connection.cursor() as cursor:
            cursor.execute('SELECT * FROM public."JCWPRzeczne"')
            columns = [col[0] for col in cursor.description]  # Pobierz nazwy kolumn
            results = [dict(zip(columns, row)) for row in cursor.fetchall()]
            return results
