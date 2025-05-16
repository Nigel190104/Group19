from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views, api_views
from django.conf import settings
from django.conf.urls.static import static

# Setup DRF router for HabitViewSet
router = DefaultRouter()
router.register(r'habits', api_views.HabitViewSet, basename='habit')  # Handles all habit routes
router.register('follows', api_views.FollowViewSet)
router.register(r'comments', api_views.CommentViewSet, basename='comment')
urlpatterns = [
    # Authentication routes (keep these unchanged)
    path("csrf/", views.get_csrf, name="api-csrf"),
    path("login/", views.login_view, name="api-login"),
    path("logout/", views.logout_view, name="api-logout"),
    path("session/", views.session_view, name="api-session"),
    path("whoami/", views.whoami_view, name="api-whoami"),
    path("signup/", views.signup_view, name="api-signup"),
    path("forgot/", views.forgotPassword_view, name="api-forgot"),
    
    # Include all DRF router URLs under /api/
    path("api/", include(router.urls)),  
]
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)