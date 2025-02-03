from django.urls import include

from django.contrib import admin
from django.urls import path

urlpatterns = [
    path('admin/', admin.site.urls),
    path('WebApp/', include('web_app.urls')),
]
