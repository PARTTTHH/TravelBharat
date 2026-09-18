from django.db import models
from django.utils.text import slugify


class Category(models.Model):
    class CategoryType(models.TextChoices):
        HERITAGE = "heritage", "Heritage"
        NATURE = "nature", "Nature"
        SPIRITUAL = "spiritual", "Spiritual"
        ADVENTURE = "adventure", "Adventure"
        BEACH = "beach", "Beach"
        CULTURE = "culture", "Culture"
        WILDLIFE = "wildlife", "Wildlife"

    name = models.CharField(max_length=50, choices=CategoryType.choices, unique=True)
    slug = models.SlugField(max_length=50, unique=True, blank=True)
    description = models.TextField(blank=True)

    class Meta:
        verbose_name_plural = "categories"
        ordering = ["name"]

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.get_name_display()


class State(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=100, unique=True, blank=True)
    is_union_territory = models.BooleanField(default=False)
    description = models.TextField(blank=True)
    capital = models.CharField(max_length=100, blank=True)
    image = models.ImageField(upload_to="states/", blank=True, null=True)
    image_url = models.URLField(max_length=1000, blank=True, help_text="Direct URL if not uploaded locally")

    class Meta:
        ordering = ["name"]

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class City(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(max_length=100, blank=True)
    state = models.ForeignKey(State, on_delete=models.CASCADE, related_name="cities")
    description = models.TextField(blank=True)

    class Meta:
        verbose_name_plural = "cities"
        ordering = ["name"]
        unique_together = [["name", "state"]]

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name}, {self.state.name}"


class TouristPlace(models.Model):
    name = models.CharField(max_length=200)
    slug = models.SlugField(max_length=200, unique=True, blank=True)
    state = models.ForeignKey(State, on_delete=models.CASCADE, related_name="places")
    city = models.ForeignKey(
        City, on_delete=models.SET_NULL, null=True, blank=True, related_name="places"
    )
    categories = models.ManyToManyField(Category, related_name="places", blank=True)
    description = models.TextField()
    historical_significance = models.TextField(blank=True)
    best_time_to_visit = models.CharField(max_length=200, blank=True)
    entry_fee = models.CharField(max_length=100, blank=True)
    timings = models.CharField(max_length=200, blank=True)
    location_map_url = models.URLField(blank=True)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    nearby_attractions = models.TextField(blank=True, help_text="One attraction per line")
    is_featured = models.BooleanField(default=False)
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.name)
            slug = base_slug
            counter = 1
            while TouristPlace.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            self.slug = slug
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class PlaceImage(models.Model):
    place = models.ForeignKey(
        TouristPlace, on_delete=models.CASCADE, related_name="images"
    )
    image = models.ImageField(upload_to="places/", blank=True, null=True)
    image_url = models.URLField(
        max_length=1000, blank=True, help_text="Direct URL if not uploaded locally"
    )
    caption = models.CharField(max_length=200, blank=True)
    is_primary = models.BooleanField(default=False)
    order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ["order", "id"]

    def __str__(self):
        return f"{self.place.name} - {self.caption or 'Image'}"
