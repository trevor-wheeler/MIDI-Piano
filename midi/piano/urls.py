from django.urls import path
from . import views

urlpatterns = [
	path("", views.home, name="home"),
	path("login", views.login_view, name="login"),
	path("logout", views.logout_view, name="logout"),
	path("register", views.register_view, name="register"),
	path("account", views.account, name="account"),
	path("presets", views.presets, name="presets"),
	path("api/<str:param>", views.api, name="api"),
	path("api/user/<str:param>", views.checkUsername, name="username")
]