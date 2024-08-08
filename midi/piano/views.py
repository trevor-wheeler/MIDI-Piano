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

def register_view(request):
    if request.method == "POST":
        username = request.POST["username"]
        password = request.POST["password"]
        confirmpassword = request.POST["confirm-password"]

        # Check for password consistency
        if password != confirmpassword:
            return render(request, "piano/register.html")

        # Check for allowed username characters
        if not username.isalnum():
            return render(request, "piano/register.html")
            

        # Create new user
        try:
            user = User.objects.create_user(
                username=username,
                password=password
            )
            user.save()
        # Check if username is taken
        except IntegrityError:
            return render(request, "piano/register.html")

       # If account creation is successful log the user in 
        login(request, user)
        return HttpResponseRedirect(reverse("home"))
    else:
        return render(request, "piano/register.html")

# API
def api(request, param1, param2):
    if param1 == "username":
        try:
            user = User.objects.get(username__iexact=param2)
        except User.DoesNotExist:
            return JsonResponse({})

        return JsonResponse({"error": "Username taken."})