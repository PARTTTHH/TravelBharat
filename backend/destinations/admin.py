from django.contrib import admin

from .models import Category, City, PlaceImage, State, TouristPlace


class PlaceImageInline(admin.TabularInline):
    model = PlaceImage
    extra = 1
    fields = ("image", "image_url", "caption", "is_primary", "order")


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "slug")
    prepopulated_fields = {"slug": ("name",)}


@admin.register(State)
class StateAdmin(admin.ModelAdmin):
    list_display = ("name", "capital", "is_union_territory")
    list_filter = ("is_union_territory",)
    search_fields = ("name", "capital")
    prepopulated_fields = {"slug": ("name",)}


@admin.register(City)
class CityAdmin(admin.ModelAdmin):
    list_display = ("name", "state")
    list_filter = ("state",)
    search_fields = ("name", "state__name")
    prepopulated_fields = {"slug": ("name",)}


@admin.register(TouristPlace)
class TouristPlaceAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "state",
        "city",
        "is_featured",
        "is_verified",
        "updated_at",
    )
    list_editable = ("is_featured", "is_verified")
    list_filter = ("state", "categories", "is_featured", "is_verified")
    search_fields = ("name", "description", "state__name", "city__name")
    prepopulated_fields = {"slug": ("name",)}
    filter_horizontal = ("categories",)
    readonly_fields = ("created_at", "updated_at")
    inlines = [PlaceImageInline]

