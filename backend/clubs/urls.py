from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    ClubViewSet,
    EventCommentViewSet,
    EventLikeViewSet,
    EventViewSet,
    MembershipViewSet,
    NewsViewSet,
    NotificationLogViewSet,
    admin_login_api,
    notify_api,
)

router = DefaultRouter()
router.register(r"clubs", ClubViewSet, basename="club")
router.register(r"events", EventViewSet, basename="event")
router.register(r"memberships", MembershipViewSet, basename="membership")
router.register(r"event-comments", EventCommentViewSet, basename="event-comment")
router.register(r"event-likes", EventLikeViewSet, basename="event-like")
router.register(r"notifications", NotificationLogViewSet, basename="notification")
router.register(r"news", NewsViewSet, basename="news")

# Ce fichier est inclus via path('api/', include('<votre_app>.urls')) dans le urls.py du projet
urlpatterns = [
    path("", include(router.urls)),
    path("admin-login/", admin_login_api, name="admin-login"),
    path("notify/", notify_api, name="notify"),
]