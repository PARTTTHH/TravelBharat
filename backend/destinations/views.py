from django.db.models import Count, Q
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Category, City, State, TouristPlace
from .serializers import (
    CategorySerializer,
    CityListSerializer,
    StateDetailSerializer,
    StateListSerializer,
    TouristPlaceDetailSerializer,
    TouristPlaceListSerializer,
)


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    lookup_field = "slug"


class StateViewSet(viewsets.ReadOnlyModelViewSet):
    lookup_field = "slug"

    def get_queryset(self):
        return State.objects.annotate(place_count=Count("places")).order_by("name")

    def get_serializer_class(self):
        if self.action == "retrieve":
            return StateDetailSerializer
        return StateListSerializer

    @action(detail=True, methods=["get"])
    def places(self, request, slug=None):
        state = self.get_object()
        places = (
            TouristPlace.objects.filter(state=state)
            .select_related("state", "city")
            .prefetch_related("categories", "images")
            .annotate()
        )

        category = request.query_params.get("category")
        if category:
            places = places.filter(categories__slug=category)

        serializer = TouristPlaceListSerializer(
            places, many=True, context={"request": request}
        )
        return Response(serializer.data)


class CityViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = CityListSerializer
    lookup_field = "slug"

    def get_queryset(self):
        queryset = City.objects.select_related("state").annotate(
            place_count=Count("places")
        )

        state_slug = self.request.query_params.get("state")
        if state_slug:
            queryset = queryset.filter(state__slug=state_slug)

        return queryset.order_by("name")


class TouristPlaceViewSet(viewsets.ReadOnlyModelViewSet):
    lookup_field = "slug"

    def get_queryset(self):
        queryset = (
            TouristPlace.objects.select_related("state", "city")
            .prefetch_related("categories", "images")
            .order_by("-is_featured", "name")
        )

        params = self.request.query_params

        state = params.get("state")
        if state:
            queryset = queryset.filter(state__slug=state)

        city = params.get("city")
        if city:
            queryset = queryset.filter(city__slug=city)

        category = params.get("category")
        if category:
            queryset = queryset.filter(categories__slug=category)

        featured = params.get("featured")
        if featured and featured.lower() in ("true", "1", "yes"):
            queryset = queryset.filter(is_featured=True)

        search = params.get("search")
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search)
                | Q(description__icontains=search)
                | Q(state__name__icontains=search)
                | Q(city__name__icontains=search)
                | Q(categories__name__icontains=search)
            ).distinct()

        return queryset

    def get_serializer_class(self):
        if self.action == "retrieve":
            return TouristPlaceDetailSerializer
        return TouristPlaceListSerializer

    @action(detail=False, methods=["get"])
    def featured(self, request):
        places = self.get_queryset().filter(is_featured=True)[:6]
        serializer = TouristPlaceListSerializer(
            places, many=True, context={"request": request}
        )
        return Response(serializer.data)
