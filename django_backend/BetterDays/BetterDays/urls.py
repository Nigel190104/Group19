"""
URL configuration for BetterDays project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from core.sse import accountability_stream
from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path, include
from rest_framework import routers
from core.api_views import (
    ApplicationUserViewSet,
    FollowViewSet,
    PostViewSet,
    CommentViewSet,
    PostLikeViewSet,
    CommentLikeViewSet,
    AccountabilityPartnerViewSet,
    MoodCategoryViewSet,
    MoodSubcategoryViewSet,
    NoteViewSet,
    HabitViewSet,
    AchievementViewSet,
    AchievementTypeViewSet,
    GeneratingPostViewSet,
    JournalViewSet,
    WorkNoteViewSet, 
    WorkTaskViewSet,
    HabitPartnerViewSet,
    AccountabilityPartnerViewSet,
)

router = routers.DefaultRouter()
router.register("users", ApplicationUserViewSet)
router.register("follows", FollowViewSet)
router.register("posts", PostViewSet)
router.register("comments", CommentViewSet)
router.register("post-likes", PostLikeViewSet)
router.register("comment-likes", CommentLikeViewSet)

router.register('accountability', AccountabilityPartnerViewSet, basename='accountability')
router.register('habit-partner', HabitPartnerViewSet, basename='habit-partner')

router.register("mood-categories", MoodCategoryViewSet)
router.register("mood-subcategories", MoodSubcategoryViewSet)
router.register("notes", NoteViewSet)
router.register("habits", HabitViewSet)
router.register("achievements", AchievementViewSet)
router.register("achievement-types", AchievementTypeViewSet)
router.register(
    "generating-posts", GeneratingPostViewSet, basename="generating-posts"
)  # Added basename
router.register("journals", JournalViewSet, basename="journals")  # Added basename
router.register('work-notes', WorkNoteViewSet, basename='work-notes')
router.register('work-tasks', WorkTaskViewSet, basename='work-tasks')

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include(router.urls)),
    path("auth/", include("core.urls")),
    path("api/accountability-stream/", accountability_stream, name="accountability_stream"),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)