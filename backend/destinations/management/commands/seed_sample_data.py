from django.core.management.base import BaseCommand

from destinations.models import Category, City, State, TouristPlace


SAMPLE_DATA = [
    {
        "state": {
            "name": "Rajasthan",
            "capital": "Jaipur",
            "description": "The Land of Kings — forts, palaces, and desert landscapes.",
        },
        "cities": [
            {
                "name": "Jaipur",
                "places": [
                    {
                        "name": "Amber Fort",
                        "categories": ["heritage"],
                        "description": "A magnificent hilltop fort known for its artistic Hindu-style architecture, mirror work, and panoramic views of Maota Lake.",
                        "historical_significance": "Built by Raja Man Singh in the 16th century, Amber Fort was the capital of the Kachwaha Rajputs before Jaipur.",
                        "best_time_to_visit": "October to March",
                        "entry_fee": "₹100 (Indians), ₹500 (Foreigners)",
                        "timings": "8:00 AM – 5:30 PM",
                        "location_map_url": "https://maps.google.com/?q=Amber+Fort+Jaipur",
                        "nearby_attractions": "Jaigarh Fort\nPanna Meena ka Kund\nJal Mahal",
                        "is_featured": True,
                        "is_verified": True,
                    },
                    {
                        "name": "Hawa Mahal",
                        "categories": ["heritage"],
                        "description": "The iconic Palace of Winds with 953 jharokhas, built so royal women could observe street festivals without being seen.",
                        "best_time_to_visit": "October to March",
                        "entry_fee": "₹50 (Indians), ₹200 (Foreigners)",
                        "timings": "9:00 AM – 4:30 PM",
                        "is_featured": True,
                        "is_verified": True,
                    },
                ],
            },
            {
                "name": "Udaipur",
                "places": [
                    {
                        "name": "City Palace",
                        "categories": ["heritage"],
                        "description": "A sprawling palace complex on the banks of Lake Pichola, showcasing Rajasthani and Mughal architecture.",
                        "best_time_to_visit": "September to March",
                        "entry_fee": "₹300 (Indians), ₹700 (Foreigners)",
                        "timings": "9:30 AM – 5:30 PM",
                        "is_featured": True,
                        "is_verified": True,
                    },
                ],
            },
        ],
    },
    {
        "state": {
            "name": "Kerala",
            "capital": "Thiruvananthapuram",
            "description": "God's Own Country — backwaters, beaches, and lush greenery.",
        },
        "cities": [
            {
                "name": "Alleppey",
                "places": [
                    {
                        "name": "Alleppey Backwaters",
                        "categories": ["nature"],
                        "description": "A network of tranquil canals, lagoons, and lakes best explored by traditional houseboats.",
                        "best_time_to_visit": "November to February",
                        "entry_fee": "Houseboat packages from ₹6,000",
                        "timings": "Open 24 hours",
                        "is_featured": True,
                        "is_verified": True,
                    },
                ],
            },
            {
                "name": "Munnar",
                "places": [
                    {
                        "name": "Eravikulam National Park",
                        "categories": ["nature", "adventure"],
                        "description": "Home to the endangered Nilgiri Tahr and the blooming Neelakurinji flowers that cover the hills every 12 years.",
                        "best_time_to_visit": "September to November, January to March",
                        "entry_fee": "₹125 (Indians), ₹420 (Foreigners)",
                        "timings": "7:00 AM – 4:00 PM",
                        "is_featured": True,
                        "is_verified": True,
                    },
                ],
            },
        ],
    },
    {
        "state": {
            "name": "Uttar Pradesh",
            "capital": "Lucknow",
            "description": "Home to the Taj Mahal and rich Mughal heritage along the Ganges.",
        },
        "cities": [
            {
                "name": "Agra",
                "places": [
                    {
                        "name": "Taj Mahal",
                        "categories": ["heritage", "religious"],
                        "description": "An ivory-white marble mausoleum and UNESCO World Heritage Site, built by Shah Jahan in memory of Mumtaz Mahal.",
                        "historical_significance": "Completed in 1653, the Taj Mahal is considered the finest example of Mughal architecture.",
                        "best_time_to_visit": "October to March",
                        "entry_fee": "₹50 (Indians), ₹1,100 (Foreigners)",
                        "timings": "6:00 AM – 6:30 PM (closed Fridays)",
                        "location_map_url": "https://maps.google.com/?q=Taj+Mahal+Agra",
                        "nearby_attractions": "Agra Fort\nMehtab Bagh\nItimad-ud-Daulah",
                        "is_featured": True,
                        "is_verified": True,
                    },
                ],
            },
            {
                "name": "Varanasi",
                "places": [
                    {
                        "name": "Kashi Vishwanath Temple",
                        "categories": ["religious"],
                        "description": "One of the most sacred Hindu temples dedicated to Lord Shiva, located on the western bank of the Ganges.",
                        "best_time_to_visit": "October to March",
                        "entry_fee": "Free",
                        "timings": "3:00 AM – 11:00 PM",
                        "is_featured": True,
                        "is_verified": True,
                    },
                ],
            },
        ],
    },
]


class Command(BaseCommand):
    help = "Seed sample states, cities, and tourist places for development"

    def handle(self, *args, **options):
        from destinations.management.commands.seed_categories import Command as SeedCategories

        SeedCategories().handle()

        place_count = 0

        for entry in SAMPLE_DATA:
            state_data = entry["state"]
            state, _ = State.objects.get_or_create(
                name=state_data["name"],
                defaults={
                    "capital": state_data.get("capital", ""),
                    "description": state_data.get("description", ""),
                },
            )

            for city_entry in entry["cities"]:
                city, _ = City.objects.get_or_create(
                    name=city_entry["name"],
                    state=state,
                )

                for raw_place in city_entry["places"]:
                    place_data = raw_place.copy()
                    category_slugs = place_data.pop("categories", [])
                    place, created = TouristPlace.objects.get_or_create(
                        name=place_data["name"],
                        state=state,
                        defaults={**place_data, "city": city},
                    )
                    if created:
                        place_count += 1
                        categories = Category.objects.filter(slug__in=category_slugs)
                        place.categories.set(categories)
                        self.stdout.write(
                            self.style.SUCCESS(f"  + {place.name} ({city.name})")
                        )

        self.stdout.write(
            self.style.SUCCESS(
                f"\nSample data ready! {place_count} places added."
            )
        )
