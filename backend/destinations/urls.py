from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import CategoryViewSet, CityViewSet, StateViewSet, TouristPlaceViewSet

router = DefaultRouter()
router.register("categories", CategoryViewSet, basename="category")
router.register("states", StateViewSet, basename="state")
router.register("cities", CityViewSet, basename="city")
router.register("places", TouristPlaceViewSet, basename="place")

urlpatterns = [
    path("", include(router.urls)),
]
