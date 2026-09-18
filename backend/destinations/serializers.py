from django.db.models import Count
from rest_framework import serializers

from .models import Category, City, PlaceImage, State, TouristPlace


class CategorySerializer(serializers.ModelSerializer):
    label = serializers.CharField(source="get_name_display", read_only=True)

    class Meta:
        model = Category
        fields = ["id", "name", "label", "slug", "description"]


class PlaceImageSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = PlaceImage
        fields = ["id", "image_url", "caption", "is_primary", "order"]

    def get_image_url(self, obj):
        if obj.image:
            request = self.context.get("request")
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        if obj.image_url:
            return obj.image_url
        return None


class StateListSerializer(serializers.ModelSerializer):
    place_count = serializers.IntegerField(read_only=True)
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = State
        fields = [
            "id",
            "name",
            "slug",
            "capital",
            "is_union_territory",
            "description",
            "image_url",
            "place_count",
        ]

    def get_image_url(self, obj):
        if obj.image:
            request = self.context.get("request")
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        if obj.image_url:
            return obj.image_url
        return None


class StateDetailSerializer(StateListSerializer):
    cities = serializers.SerializerMethodField()

    class Meta(StateListSerializer.Meta):
        fields = StateListSerializer.Meta.fields + ["cities"]

    def get_cities(self, obj):
        cities = obj.cities.annotate(place_count=Count("places"))
        return CityListSerializer(cities, many=True, context=self.context).data


class CityListSerializer(serializers.ModelSerializer):
    state_name = serializers.CharField(source="state.name", read_only=True)
    state_slug = serializers.CharField(source="state.slug", read_only=True)
    place_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = City
        fields = ["id", "name", "slug", "state_name", "state_slug", "description", "place_count"]


class TouristPlaceListSerializer(serializers.ModelSerializer):
    state_name = serializers.CharField(source="state.name", read_only=True)
    state_slug = serializers.CharField(source="state.slug", read_only=True)
    city_name = serializers.CharField(source="city.name", read_only=True)
    categories = CategorySerializer(many=True, read_only=True)
    images = PlaceImageSerializer(many=True, read_only=True)
    primary_image = serializers.SerializerMethodField()

    class Meta:
        model = TouristPlace
        fields = [
            "id",
            "name",
            "slug",
            "state_name",
            "state_slug",
            "city_name",
            "categories",
            "description",
            "best_time_to_visit",
            "is_featured",
            "is_verified",
            "primary_image",
            "images",
        ]

    def get_primary_image(self, obj):
        primary = obj.images.filter(is_primary=True).first()
        if not primary:
            primary = obj.images.first()
        if primary:
            return PlaceImageSerializer(primary, context=self.context).data
        return None


class TouristPlaceDetailSerializer(TouristPlaceListSerializer):
    images = PlaceImageSerializer(many=True, read_only=True)
    nearby_attractions_list = serializers.SerializerMethodField()

    class Meta(TouristPlaceListSerializer.Meta):
        fields = TouristPlaceListSerializer.Meta.fields + [
            "historical_significance",
            "entry_fee",
            "timings",
            "location_map_url",
            "latitude",
            "longitude",
            "nearby_attractions",
            "nearby_attractions_list",
            "images",
            "created_at",
            "updated_at",
        ]

    def get_nearby_attractions_list(self, obj):
        if not obj.nearby_attractions:
            return []
        return [line.strip() for line in obj.nearby_attractions.splitlines() if line.strip()]


class TouristPlaceWriteSerializer(serializers.ModelSerializer):
    state_id = serializers.PrimaryKeyRelatedField(
        queryset=State.objects.all(), source="state", write_only=True
    )
    city_id = serializers.PrimaryKeyRelatedField(
        queryset=City.objects.all(), source="city", write_only=True, required=False, allow_null=True
    )
    category_ids = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(), source="categories", many=True, write_only=True, required=False
    )
    image_url = serializers.URLField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = TouristPlace
        fields = [
            "id",
            "name",
            "slug",
            "state_id",
            "city_id",
            "category_ids",
            "description",
            "historical_significance",
            "best_time_to_visit",
            "entry_fee",
            "timings",
            "location_map_url",
            "is_featured",
            "is_verified",
            "image_url",
        ]

    def create(self, validated_data):
        image_url = validated_data.pop("image_url", None)
        categories = validated_data.pop("categories", [])
        place = TouristPlace.objects.create(**validated_data)
        if categories:
            place.categories.set(categories)
        if image_url:
            PlaceImage.objects.create(
                place=place,
                image_url=image_url,
                is_primary=True,
                caption=place.name
            )
        return place
