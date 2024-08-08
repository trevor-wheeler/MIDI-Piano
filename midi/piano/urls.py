from django.urls import path
from . import views

urlpatterns = [
	path("", views.home, name="home"),
	path("login", views.login_view, name="login"),
	path("logout", views.logout_view, name="logout"),
	path("register", views.register_view, name="register"),
	path("api/<str:param1>/<str:param2>", views.api, name="api"),
]