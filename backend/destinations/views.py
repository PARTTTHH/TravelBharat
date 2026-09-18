from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.db.models import Count, Q
from django.views.decorators.csrf import csrf_exempt
from rest_framework import status, viewsets
from rest_framework.decorators import action, api_view, authentication_classes, permission_classes
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from .models import Category, City, State, TouristPlace
from .serializers import (
    CategorySerializer,
    CityListSerializer,
    StateDetailSerializer,
    StateListSerializer,
    TouristPlaceDetailSerializer,
    TouristPlaceListSerializer,
    TouristPlaceWriteSerializer,
)


class StandardPagination(PageNumberPagination):
    page_size = 12
    page_size_query_param = "page_size"
    max_page_size = 1000


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    pagination_class = StandardPagination
    lookup_field = "slug"


class StateViewSet(viewsets.ReadOnlyModelViewSet):
    pagination_class = StandardPagination
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
            TouristPlace.objects.filter(state=state, is_verified=True)
            .select_related("state", "city")
            .prefetch_related("categories", "images")
        )

        category = request.query_params.get("category")
        if category:
            places = places.filter(categories__slug=category)

        page = self.paginate_queryset(places)
        if page is not None:
            serializer = TouristPlaceListSerializer(
                page, many=True, context={"request": request}
            )
            return self.get_paginated_response(serializer.data)

        serializer = TouristPlaceListSerializer(
            places, many=True, context={"request": request}
        )
        return Response(serializer.data)


class CityViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = CityListSerializer
    pagination_class = StandardPagination
    lookup_field = "slug"

    def get_queryset(self):
        queryset = City.objects.select_related("state").annotate(
            place_count=Count("places")
        )

        state_slug = self.request.query_params.get("state")
        if state_slug:
            queryset = queryset.filter(state__slug=state_slug)

        return queryset.order_by("name")


class TouristPlaceViewSet(viewsets.ModelViewSet):
    pagination_class = StandardPagination
    lookup_field = "slug"
    authentication_classes = []
    permission_classes = [AllowAny]

    def get_queryset(self):
        queryset = (
            TouristPlace.objects.all()
            .select_related("state", "city")
            .prefetch_related("categories", "images")
            .order_by("-is_featured", "name")
        )

        params = self.request.query_params

        # Verification filtering: if action is admin toggle/update/destroy, or param asks for all/unverified
        if self.action in ["toggle_verify", "destroy", "update", "partial_update"]:
            pass
        elif params.get("all") in ("true", "1", "yes") or params.get("is_verified") == "all":
            pass
        elif params.get("is_verified") in ("false", "0", "unverified"):
            queryset = queryset.filter(is_verified=False)
        else:
            queryset = queryset.filter(is_verified=True)

        state = params.get("state")
        if state:
            queryset = queryset.filter(
                Q(state__slug=state) | Q(state__name__iexact=state.replace("-", " "))
            )

        city = params.get("city")
        if city:
            queryset = queryset.filter(
                Q(city__slug=city) | Q(city__name__iexact=city.replace("-", " "))
            )

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
            )

        return queryset.distinct()

    def get_serializer_class(self):
        if self.action == "retrieve":
            return TouristPlaceDetailSerializer
        if self.action in ["create", "update", "partial_update"]:
            return TouristPlaceWriteSerializer
        return TouristPlaceListSerializer

    @action(detail=False, methods=["get"])
    def featured(self, request):
        limit = int(request.query_params.get("limit", 10))
        places = self.get_queryset().filter(is_featured=True)[:limit]
        serializer = TouristPlaceListSerializer(
            places, many=True, context={"request": request}
        )
        return Response(serializer.data)

    @action(detail=True, methods=["post"])
    def toggle_verify(self, request, slug=None):
        place = self.get_object()
        place.is_verified = not place.is_verified
        place.save(update_fields=["is_verified"])
        return Response({
            "id": place.id,
            "slug": place.slug,
            "name": place.name,
            "is_verified": place.is_verified,
        })

    @action(detail=False, methods=["get"])
    def stats(self, request):
        total_places = TouristPlace.objects.count()
        verified_places = TouristPlace.objects.filter(is_verified=True).count()
        unverified_places = TouristPlace.objects.filter(is_verified=False).count()
        featured_places = TouristPlace.objects.filter(is_featured=True).count()
        total_states = State.objects.count()
        total_cities = City.objects.count()
        total_categories = Category.objects.count()

        return Response({
            "total_places": total_places,
            "verified_places": verified_places,
            "unverified_places": unverified_places,
            "featured_places": featured_places,
            "total_states": total_states,
            "total_cities": total_cities,
            "total_categories": total_categories,
        })


@csrf_exempt
@api_view(["POST"])
@authentication_classes([])
@permission_classes([AllowAny])
def admin_login(request):
    username = request.data.get("username", "").strip()
    password = request.data.get("password", "").strip()

    if not username or not password:
        return Response(
            {"success": False, "error": "Username and password are required."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # 1. Standard Django authenticate
    user = authenticate(request=request, username=username, password=password)
    if user is None:
        user = authenticate(username=username, password=password)

    # 2. Case-insensitive and email lookup fallback
    if user is None:
        candidate = User.objects.filter(
            Q(username__iexact=username) | Q(email__iexact=username)
        ).first()
        if candidate and candidate.check_password(password):
            user = candidate

    if user is not None and (user.is_staff or user.is_superuser):
        return Response({
            "success": True,
            "user": {
                "id": user.id,
                "username": user.username,
                "is_staff": user.is_staff,
                "is_superuser": user.is_superuser,
            },
            "token": f"admin-token-{user.id}-{user.username}",
        })

    return Response(
        {
            "success": False,
            "error": f"Invalid credentials for '{username}'. Please ensure correct password and staff/superuser permissions.",
        },
        status=status.HTTP_401_UNAUTHORIZED,
    )

