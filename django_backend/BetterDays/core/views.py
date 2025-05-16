import json

from django.contrib.auth import authenticate, login, logout
from django.http import JsonResponse
from django.middleware.csrf import get_token
from django.views.decorators.csrf import ensure_csrf_cookie, csrf_exempt
from django.views.decorators.http import require_POST
from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import make_password
from django.core.exceptions import ValidationError
from .models import Note, Comment
from django.contrib.auth.decorators import login_required
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .serializers import CommentSerializer


from .models import ApplicationUser

User = get_user_model()


def get_csrf(request):
    response = JsonResponse({"detail": "CSRF cookie set"})
    response["X-CSRFToken"] = get_token(request)
    return response


# @csrf_exempt
# @require_POST
# def login_view(request):
#     data = json.loads(request.body)
#     username = data.get("username")
#     password = data.get("password")

#     if username is None or password is None:
#         return JsonResponse(
#             {"detail": "Please provide username and password."}, status=400
#         )

#     user = authenticate(username=username, password=password)

#     if user is None:
#         return JsonResponse({"detail": "Invalid credentials."}, status=400)

#     login(request, user)
#     return JsonResponse({"detail": "Successfully logged in."})


@require_POST
def login_view(request):
    data = json.loads(request.body)
    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return JsonResponse(
            {"detail": "Please provide username and password."}, status=400
        )

    try:
        user = User.objects.get(username=username)  # Fetch user manually
        if not user.check_password(password):
            return JsonResponse({"detail": "Invalid credentials."}, status=400)
    except User.DoesNotExist:
        return JsonResponse({"detail": "Invalid credentials."}, status=400)

    login(request, user)
    return JsonResponse({"detail": "Successfully logged in."})


def logout_view(request):
    if not request.user.is_authenticated:
        return JsonResponse({"detail": "You're not logged in."}, status=400)

    logout(request)
    return JsonResponse({"detail": "Successfully logged out."})


@ensure_csrf_cookie
def session_view(request):
    if not request.user.is_authenticated:
        return JsonResponse({"isAuthenticated": False})

    return JsonResponse({
        "isAuthenticated": True,
        "username": request.user.username,
        "userId": request.user.id
    })


def whoami_view(request):
    if not request.user.is_authenticated:
        return JsonResponse({"isAuthenticated": False})

    return JsonResponse({"username": request.user.username})


@require_POST
def signup_view(request):
    data = json.loads(request.body)
    username = data.get("username")
    password = data.get("password")
    email = data.get("email")

    if not username or not password:
        return JsonResponse(
            {"detail": "Please provide both username and password."}, status=400
        )

    if ApplicationUser.objects.filter(username=username).exists():
        return JsonResponse({"detail": "Username is already taken."}, status=400)

    # Optionally, check for email uniqueness
    if email and ApplicationUser.objects.filter(email=email).exists():
        return JsonResponse({"detail": "Email is already registered."}, status=400)

    try:
        user = ApplicationUser.objects.create_user(
            username=username, email=email, password=password
        )
    except ValueError as e:
        return JsonResponse({"detail": str(e)}, status=400)

    login(request, user)

    return JsonResponse({"detail": "User created successfully."})

@require_POST
def forgotPassword_view(request):
    data = json.loads(request.body)
    username = data.get("username")
    password = data.get("password")
    email = data.get("email")

    if not username or not password or not email:
        return JsonResponse(
            {"detail": "Please provide username, password, and email."}, status=400
        )

    try:
        user = ApplicationUser.objects.get(username=username)
        if user.email != email:
            return JsonResponse({"detail": "Email does not match the username."}, status=400)

        # Update the password
        user.set_password(password)
        user.save()

        return JsonResponse({"detail": "Password updated successfully."})
    except ApplicationUser.DoesNotExist:
        # Username does not exist, so create new user
        try:
            if ApplicationUser.objects.filter(email=email).exists():
                return JsonResponse({"detail": "Email is already registered with another user."}, status=400)
        except ValueError as e:
            return JsonResponse({"detail": str(e)}, status=400)



@require_POST
def forgotPassword_view(request):
    data = json.loads(request.body)
    username = data.get("username")
    password = data.get("password")
    email = data.get("email")

    if not username or not password or not email:
        return JsonResponse(
            {"detail": "Please provide username, password, and email."}, status=400
        )

    try:
        user = ApplicationUser.objects.get(username=username)
        if user.email != email:
            return JsonResponse({"detail": "Email does not match the username."}, status=400)

        # Update the password
        user.set_password(password)
        user.save()

        return JsonResponse({"detail": "Password updated successfully."})
    except ApplicationUser.DoesNotExist:
        # Username does not exist, so create new user
        try:
            if ApplicationUser.objects.filter(email=email).exists():
                return JsonResponse({"detail": "Email is already registered with another user."}, status=400)
        except ValueError as e:
            return JsonResponse({"detail": str(e)}, status=400)

# @require_POST
# @login_required  # Ensure the user is authenticated
# def create_note_view(request):
#     try:
#         data = json.loads(request.body)
#         note_caption = data.get("note_caption")
#         note_content = data.get("note_content")
#         time_spent = data.get("time_spent", 0)
#         accountability_partner_id = data.get("accountability_partner", None)
#         habit_id = data.get("habit", None)
#         mood_subcategory_id = data.get("mood_subcategory", None)
#         achievements_id = data.get("achievements", None)
#         note_image = data.get("note_image", None)

#         # Validate that necessary fields are provided
#         if not note_caption or not note_content:
#             return JsonResponse(
#                 {"detail": "Note caption and content are required."}, status=400
#             )

#         # Check if the accountability partner is valid
#         accountability_partner = None
#         if accountability_partner_id:
#             accountability_partner = ApplicationUser.objects.filter(
#                 id=accountability_partner_id
#             ).first()
#             if accountability_partner and accountability_partner == request.user:
#                 return JsonResponse(
#                     {
#                         "detail": "You cannot set yourself as your own accountability partner."
#                     },
#                     status=400,
#                 )

#         # Create the new note
#         note = Note.objects.create(
#             user=request.user,
#             note_caption=note_caption,
#             note_content=note_content,
#             time_spent=time_spent,
#             accountability_partner=accountability_partner,
#             Habit_id=habit_id,
#             mood_subcategory_id=mood_subcategory_id,
#             achievements_id=achievements_id,
#         )

#         # Handle image if provided
#         if note_image:
#             note.note_image = note_image
#             note.save()

#         return JsonResponse({"detail": "Note created successfully."}, status=201)

#     except json.JSONDecodeError:
#         return JsonResponse({"detail": "Invalid JSON."}, status=400)
#     except ValidationError as e:
#         return JsonResponse({"detail": str(e)}, status=400)
#     except Exception as e:
#         return JsonResponse({"detail": f"Error: {str(e)}"}, status=500)
