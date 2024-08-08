from django.contrib.auth import authenticate, login, logout
from django.http import HttpResponseRedirect, JsonResponse
from django.shortcuts import render
from django.urls import reverse
from .models import User

# Create your views here.
def home(request):
    return render(request, "piano/index.html")

def login_view(request):
    if request.method == "POST":
        username = request.POST["username"]
        password = request.POST["password"]

        # Adjust username case
        try: 
            account = User.objects.get(username__iexact=username)
            username = account.username
        except User.DoesNotExist:
            return render(request, "piano/login.html", {
                "error": "Incorrect username or password."
            })

        # Sign user in
        user = authenticate(request, username=username, password=password)

        # Check authentication
        if user:
            login(request, user)
            return HttpResponseRedirect(reverse("home"))
        else:
            return render(request, "piano/login.html", {
                "error": "Incorrect username or password."
            })
            
    else:
        return render(request, "piano/login.html")

def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("login"))