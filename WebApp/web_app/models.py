from .utils import BaseModel


class KorytarzeEkologiczne:
    @staticmethod
    def get_all():
        return BaseModel.fetch_all('SELECT * FROM public."KorytarzeEkologiczne"')

class JCWPRzeczne:
    @staticmethod
    def get_all():
        return BaseModel.fetch_all('SELECT * FROM public."JCWPRzeczne"')
