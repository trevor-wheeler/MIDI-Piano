from django.contrib.auth import authenticate, login, logout
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import render
from django.urls import reverse
import json
from .models import User, Preset

# Create your views here.
def home(request):
    return render(request, "piano/index.html")

def login_view(request):

    # Log user out if they visit the login page while signed in
    if request.user.is_authenticated:
        logout(request)

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

def account(request):
    if request.method == "POST":
        password = request.POST["password"]
        newPassword = request.POST["new-password"]
        confirmNewPassword = request.POST["confirm-new-password"]

        # Check for password consistency
        if newPassword != confirmNewPassword:
            return render(request, "piano/account.html")

        # Check to see if old password matches
        if request.user.check_password(password):
            request.user.set_password(newPassword)
            request.user.save()
            return HttpResponseRedirect(reverse("login"))
        # Password is incorrect
        else:
            return render(request, "piano/account.html", {
                "error": "Incorrect password."
            })
    else:
        if request.user.is_authenticated:
            return render(request, "piano/account.html")
        # If user is not logged in redirect them to the login page
        else:
            return HttpResponseRedirect(reverse("login"))

def presets(request):
    if request.user.is_authenticated:
        return render(request, "piano/presets.html")
    # If user is not logged in redirect them to the login page
    else:
        return HttpResponseRedirect(reverse("login"))
        

# API
def api(request, param, param2=None):
    if request.method == 'GET':
        
        # Return a list of the users created presets
        if param == "presets":

            if not request.user.is_authenticated:
                return JsonResponse({})

            # Query database for users created presets
            presets = Preset.objects.filter(creator=request.user)
            
            # Create a new object relating preset IDs to preset names
            presetsData = {}
            for preset in presets:
                presetsData[preset.id] = preset.name

            # Return new Object
            return JsonResponse(presetsData)

        # Get preset knob values
        else:
             preset = Preset.objects.get(id=param)
             print(request.path)
             return JsonResponse(preset.knobValues)
        
    elif request.method == 'POST':

        # Create and delete presets
        if param == "preset":
            # Convert request body into python dict
            preset = json.loads(request.body.decode('utf-8'))

            # Create new database entry using the request body
            newPreset = Preset(
                name=preset['name'],
                knobValues=preset['values'],
                creator=request.user
            )
            newPreset.save()

            # Grab the new preset
            instance = Preset.objects.filter(creator=request.user).latest('id')

            return JsonResponse({"id": instance.id})

    elif request.method == 'DELETE':
        
        # Delete preset from database
        if param == "preset":
            # Get preset ID from request body and convert it
            preset = json.loads(request.body.decode('utf-8'))

            # Select preset from database
            instance = Preset.objects.get(id=preset)

            # If the user that made the request is the creator of the preset return 200
            if instance.creator == request.user:
                instance.delete()
                return HttpResponse(status=200)
            # Else return 304
            else:
                return HttpResponse(status=304)

def checkUsername(request, param):
    # Check for username availability
        try:
            # Try to get select username from database
            user = User.objects.get(username__iexact=param)
        except User.DoesNotExist:
            # If username doesn't exit return empty JSON object
            return JsonResponse({})
        # If user does exist return error
        return JsonResponse({"error": "Username taken."})
