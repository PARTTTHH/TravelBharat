import os
import importlib
from django.core.management.base import BaseCommand
from destinations.models import Category, City, State, TouristPlace

# -----------------------------------------------------------------------
# Category Consolidation Map
# Maps every sub-tag used in seed data files → one of the 7 primary categories
# Primary slugs (heritage, nature, spiritual, adventure, beach, culture,
# wildlife) pass through directly; sub-tags get remapped here.
# -----------------------------------------------------------------------
CATEGORY_MAP = {
    # Heritage -------------------------------------------------------
    "fort": "heritage",
    "palace": "heritage",
    "monument": "heritage",
    "ruins": "heritage",
    "architecture": "heritage",
    "memorial": "heritage",
    "caves": "heritage",
    "museum": "heritage",
    "landmark": "heritage",
    "unesco": "heritage",
    "archaeological": "heritage",
    "history": "heritage",
    # Nature ---------------------------------------------------------
    "lakes": "nature",
    "lake": "nature",
    "waterfall": "nature",
    "river": "nature",
    "river_island": "nature",
    "backwaters": "nature",
    "eco_tourism": "nature",
    "coastal": "nature",
    "gardens": "nature",
    "botanical": "nature",
    "viewpoint": "nature",
    "geological_wonder": "nature",
    "national_park": "nature",
    "island": "nature",
    "high_altitude": "nature",
    # Spiritual ------------------------------------------------------
    "temple": "spiritual",
    "gurdwara": "spiritual",
    "mosque": "spiritual",
    "church": "spiritual",
    "monastery": "spiritual",
    "pilgrimage": "spiritual",
    # Adventure ------------------------------------------------------
    "desert": "adventure",
    "border": "adventure",
    "trekking": "adventure",
    "hiking": "adventure",
    "water_sports": "adventure",
    # Beach ----------------------------------------------------------
    "beach": "beach",
    "marine": "beach",
    "ocean": "beach",
    # Culture --------------------------------------------------------
    "culture": "culture",
    "art": "culture",
    "walking_tour": "culture",
    "engineering": "culture",
    "modern": "culture",
    "astronomy": "culture",
    "leisure": "culture",
    "iconic": "culture",
    "festival": "culture",
    "market": "culture",
    "photography": "culture",
    # Wildlife -------------------------------------------------------
    "wildlife": "wildlife",
    "bird_watching": "wildlife",
}

# The 7 valid primary category slugs
PRIMARY_CATEGORIES = {
    "heritage", "nature", "spiritual", "adventure", "beach", "culture", "wildlife"
}

# Recognized Union Territories
UNION_TERRITORIES = {
    "Andaman and Nicobar Islands",
    "Chandigarh",
    "Dadra and Nagar Haveli and Daman and Diu",
    "Delhi",
    "Jammu and Kashmir",
    "Ladakh",
    "Lakshadweep",
    "Puducherry",
}


def resolve_categories(raw_slugs):
    """
    Given a list of raw slugs from a seed data file, returns a set of valid primary category slugs.
    """
    resolved = set()
    for slug in raw_slugs:
        slug_clean = slug.strip().lower()
        if slug_clean in PRIMARY_CATEGORIES:
            resolved.add(slug_clean)
        elif slug_clean in CATEGORY_MAP:
            resolved.add(CATEGORY_MAP[slug_clean])
    return resolved


def load_all_seed_data():
    """
    Dynamically loads DATA dictionaries from all Python files in the seed_data folder.
    """
    seed_dir = os.path.join(os.path.dirname(__file__), "seed_data")
    sample_data = []

    for fname in sorted(os.listdir(seed_dir)):
        if fname.endswith(".py") and fname != "__init__.py":
            mod_name = fname[:-3]
            try:
                mod = importlib.import_module(f"destinations.management.commands.seed_data.{mod_name}")
                if hasattr(mod, "DATA"):
                    sample_data.append((mod_name, getattr(mod, "DATA")))
            except Exception as e:
                print(f"Error loading {fname}: {e}")

    return sample_data


class Command(BaseCommand):
    help = "Seed all 28 states and 8 Union Territories with cities and tourist places"

    def handle(self, *args, **options):
        # Step 1: Ensure the 7 primary categories exist in DB
        from destinations.management.commands.seed_categories import Command as SeedCategories
        SeedCategories().handle()

        sample_data = load_all_seed_data()
        self.stdout.write(self.style.NOTICE(f"\nLoaded {len(sample_data)} state/UT seed modules."))

        place_count = 0
        state_count = 0
        city_count = 0

        for mod_name, entry in sample_data:
            state_data = entry.get("state", {})
            state_name = state_data.get("name", "").strip()
            if not state_name:
                continue

            is_ut = state_data.get("is_union_territory", state_name in UNION_TERRITORIES)

            state, state_created = State.objects.get_or_create(
                name=state_name,
                defaults={
                    "capital": state_data.get("capital", ""),
                    "description": state_data.get("description", ""),
                    "is_union_territory": is_ut,
                },
            )
            # Update fields if already existing
            if not state_created:
                updated = False
                if state.is_union_territory != is_ut:
                    state.is_union_territory = is_ut
                    updated = True
                if not state.capital and state_data.get("capital"):
                    state.capital = state_data.get("capital")
                    updated = True
                if not state.description and state_data.get("description"):
                    state.description = state_data.get("description")
                    updated = True
                if updated:
                    state.save()

            if state_created:
                state_count += 1
            
            label = "UT" if is_ut else "State"
            self.stdout.write(f"\n>> [{label}] {state.name}")

            for city_entry in entry.get("cities", []):
                city_name = city_entry.get("name", "").strip()
                if not city_name:
                    continue

                city, city_created = City.objects.get_or_create(
                    name=city_name,
                    state=state,
                )
                if city_created:
                    city_count += 1

                for raw_place in city_entry.get("places", []):
                    place_data = raw_place.copy()
                    raw_slugs = place_data.pop("categories", [])

                    place, created = TouristPlace.objects.get_or_create(
                        name=place_data["name"],
                        state=state,
                        defaults={**place_data, "city": city},
                    )

                    # Update place city / attributes if needed
                    if not created:
                        if place.city != city:
                            place.city = city
                            place.save()

                    # Set categories
                    primary_slugs = resolve_categories(raw_slugs)
                    if primary_slugs:
                        cats = Category.objects.filter(slug__in=primary_slugs)
                        place.categories.set(cats)
                    else:
                        self.stdout.write(
                            self.style.WARNING(
                                f"  [!] No category resolved for: {place.name} (raw: {raw_slugs})"
                            )
                        )

                    if created:
                        place_count += 1
                        self.stdout.write(
                            self.style.SUCCESS(
                                f"  + {place.name} ({city.name}) [{', '.join(primary_slugs) or 'none'}]"
                            )
                        )
                    else:
                        self.stdout.write(
                            f"  * {place.name} ({city.name}) [{', '.join(primary_slugs) or 'none'}]"
                        )

        self.stdout.write(
            self.style.SUCCESS(
                f"\nDone! Processed {len(sample_data)} States/UTs. "
                f"({state_count} new states, {city_count} new cities, {place_count} new places added)."
            )
        )

        # Step 3: Ensure Superuser / Admin account exists for Cloud & Local deployment
        from django.contrib.auth.models import User

        admin_username = os.environ.get("DJANGO_SUPERUSER_USERNAME", "admin").strip() or "admin"
        admin_password = os.environ.get("DJANGO_SUPERUSER_PASSWORD", "admin123").strip() or "admin123"
        admin_email = os.environ.get("DJANGO_SUPERUSER_EMAIL", "admin@travelbharat.local").strip()

        admin_user, created_admin = User.objects.get_or_create(
            username=admin_username,
            defaults={
                "email": admin_email,
                "is_staff": True,
                "is_superuser": True,
            },
        )
        admin_user.is_staff = True
        admin_user.is_superuser = True
        admin_user.set_password(admin_password)
        admin_user.save()

        if created_admin:
            self.stdout.write(
                self.style.SUCCESS(f"\n[+] Created Admin Superuser: '{admin_username}' (Password configured).")
            )
        else:
            self.stdout.write(
                self.style.SUCCESS(f"\n[*] Verified and updated Admin Superuser: '{admin_username}' (Password updated).")
            )

