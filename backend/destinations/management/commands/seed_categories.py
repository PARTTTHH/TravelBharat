from django.core.management.base import BaseCommand

from destinations.models import Category


class Command(BaseCommand):
    help = "Seed default tourist place categories"

    def handle(self, *args, **options):
        created_count = 0
        for value, label in Category.CategoryType.choices:
            _, created = Category.objects.get_or_create(
                name=value,
                defaults={"description": f"{label} destinations across India"},
            )
            if created:
                created_count += 1
                self.stdout.write(self.style.SUCCESS(f"Created category: {label}"))

        self.stdout.write(
            self.style.SUCCESS(f"Done. {created_count} new categor(ies) added.")
        )
