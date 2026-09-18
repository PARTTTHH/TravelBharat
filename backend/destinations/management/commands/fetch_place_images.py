import json
import os
import re
import ssl
import time
import urllib.parse
import urllib.request
from django.conf import settings
from django.core.files.base import ContentFile
from django.core.management.base import BaseCommand
from destinations.models import PlaceImage, State, TouristPlace


USER_AGENT = "TravelBharat/1.0 (https://github.com/travelbharat; contact@travelbharat.local)"

EXCLUDED_EXTENSIONS = (".svg", ".ogg", ".ogv", ".webm", ".pdf", ".tif", ".tiff", ".gif")
EXCLUDED_KEYWORDS = ("icon", "logo", "map", "flag", "diagram", "plan", "symbol", "coat_of_arms", "seal")


def make_request(url):
    req = urllib.request.Request(
        url,
        headers={"User-Agent": USER_AGENT},
    )
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    with urllib.request.urlopen(req, context=ctx, timeout=15) as resp:
        return json.loads(resp.read().decode("utf-8"))


def download_bytes(url):
    req = urllib.request.Request(
        url,
        headers={"User-Agent": USER_AGENT},
    )
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    with urllib.request.urlopen(req, context=ctx, timeout=20) as resp:
        return resp.read()


def is_valid_image(title, url):
    """
    Filters out icons, flags, logos, SVGs, audio/video files.
    """
    if not url:
        return False
    lower_title = title.lower()
    lower_url = url.lower()

    for ext in EXCLUDED_EXTENSIONS:
        if lower_url.endswith(ext) or lower_title.endswith(ext):
            return False

    for kw in EXCLUDED_KEYWORDS:
        if kw in lower_title:
            return False

    return True


def search_wikipedia_primary(query):
    """
    Searches Wikipedia for the best matching article lead image.
    """
    params = {
        "action": "query",
        "generator": "search",
        "gsrsearch": query,
        "gsrlimit": "2",
        "prop": "pageimages",
        "pithumbsize": "1200",
        "format": "json",
    }
    url = f"https://en.wikipedia.org/w/api.php?{urllib.parse.urlencode(params)}"
    try:
        data = make_request(url)
        pages = data.get("query", {}).get("pages", {})
        for page_id, page in sorted(pages.items(), key=lambda x: x[1].get("index", 99)):
            thumbnail = page.get("thumbnail", {})
            source = thumbnail.get("source")
            title = page.get("title", "")
            if source and is_valid_image(title, source):
                return source
    except Exception:
        pass
    return None


def search_commons_gallery(query, max_count=5):
    """
    Searches Wikimedia Commons for a gallery of high-resolution photos matching the query.
    """
    params = {
        "action": "query",
        "generator": "search",
        "gsrsearch": query,
        "gsrnamespace": "6",  # File namespace
        "gsrlimit": str(max_count * 3),  # request extra to allow filtering
        "prop": "imageinfo",
        "iiprop": "url|size",
        "iiurlwidth": "1200",
        "format": "json",
    }
    url = f"https://commons.wikimedia.org/w/api.php?{urllib.parse.urlencode(params)}"
    results = []
    try:
        data = make_request(url)
        pages = data.get("query", {}).get("pages", {})
        for page_id, page in sorted(pages.items(), key=lambda x: x[1].get("index", 99)):
            title = page.get("title", "")
            imageinfo = page.get("imageinfo", [])
            if imageinfo:
                info = imageinfo[0]
                thumburl = info.get("thumburl") or info.get("url")
                width = info.get("thumbwidth") or info.get("width", 0)
                height = info.get("thumbheight") or info.get("height", 0)

                # Skip low-res icons
                if width and width < 400 and height and height < 400:
                    continue

                if is_valid_image(title, thumburl):
                    results.append(thumburl)
                    if len(results) >= max_count:
                        break
    except Exception:
        pass
    return results


def find_images_for_place(place, max_count=4):
    """
    Finds up to `max_count` high-quality photos for a place.
    """
    images = []
    seen = set()

    city_name = place.city.name if place.city else ""
    state_name = place.state.name if place.state else ""

    primary_query = f"{place.name} {city_name}".strip() if city_name else f"{place.name} {state_name}".strip()

    # 1. First get the primary Wikipedia article image
    primary_url = search_wikipedia_primary(primary_query) or search_wikipedia_primary(place.name)
    if primary_url:
        images.append(primary_url)
        seen.add(primary_url)

    time.sleep(0.1)

    # 2. Get additional gallery photos from Wikimedia Commons
    queries = [
        f"{place.name} {city_name}".strip() if city_name else f"{place.name} {state_name}".strip(),
        f"{place.name} {state_name}".strip(),
        place.name,
    ]

    for q in queries:
        if len(images) >= max_count:
            break
        commons_imgs = search_commons_gallery(q, max_count=max_count)
        for img in commons_imgs:
            if img not in seen:
                images.append(img)
                seen.add(img)
                if len(images) >= max_count:
                    break
        time.sleep(0.1)

    return images


class Command(BaseCommand):
    help = "Automatically fetches multi-photo galleries (3-5 images) for tourist destinations via Wikipedia/Wikimedia Commons"

    def add_arguments(self, parser):
        parser.add_argument(
            "--count",
            type=int,
            default=4,
            help="Number of images per place gallery (default: 4)",
        )
        parser.add_argument(
            "--state",
            type=str,
            help="Limit fetching to places in a specific state slug (e.g. rajasthan, goa, kerala)",
        )
        parser.add_argument(
            "--featured",
            action="store_true",
            help="Only process featured destinations",
        )
        parser.add_argument(
            "--limit",
            type=int,
            default=0,
            help="Limit the number of places to process (0 = all)",
        )
        parser.add_argument(
            "--force",
            action="store_true",
            help="Overwrite / replace existing images",
        )
        parser.add_argument(
            "--download",
            action="store_true",
            help="Download images locally to media folder instead of storing direct URLs",
        )

    def handle(self, *args, **options):
        count = options.get("count") or 4
        state_slug = options.get("state")
        featured_only = options.get("featured")
        limit = options.get("limit")
        force = options.get("force")
        download_local = options.get("download")

        places_qs = TouristPlace.objects.select_related("state", "city").prefetch_related("images")

        if state_slug:
            places_qs = places_qs.filter(state__slug=state_slug)
        if featured_only:
            places_qs = places_qs.filter(is_featured=True)

        places = list(places_qs.order_by("state__name", "name"))
        if limit and limit > 0:
            places = places[:limit]

        total = len(places)
        self.stdout.write(self.style.NOTICE(f"Found {total} places to process (target: {count} images each)."))

        success_count = 0
        skipped_count = 0
        failed_count = 0

        for idx, place in enumerate(places, start=1):
            existing_imgs = list(place.images.all())

            # Skip if already has >= count images and not force
            if len(existing_imgs) >= count and not force:
                self.stdout.write(f"[{idx}/{total}] Skipping (already has {len(existing_imgs)} images): {place.name}")
                skipped_count += 1
                continue

            self.stdout.write(f"[{idx}/{total}] Fetching gallery for: {place.name} ({place.state.name})...")
            found_urls = find_images_for_place(place, max_count=count)

            if not found_urls:
                self.stdout.write(self.style.WARNING(f"  [!] No images found on Wikimedia for: {place.name}"))
                failed_count += 1
                time.sleep(0.2)
                continue

            if force:
                place.images.all().delete()

            existing_urls = {img.image_url for img in place.images.all() if img.image_url}
            saved_for_this_place = place.images.count()

            for order_idx, img_url in enumerate(found_urls):
                if saved_for_this_place >= count:
                    break
                if img_url in existing_urls:
                    continue

                is_primary = (saved_for_this_place == 0)
                caption = f"{place.name}, {place.state.name}" if is_primary else f"{place.name} - View {saved_for_this_place + 1}"

                new_img = PlaceImage(
                    place=place,
                    image_url=img_url,
                    caption=caption,
                    is_primary=is_primary,
                    order=saved_for_this_place,
                )

                if download_local:
                    try:
                        img_bytes = download_bytes(img_url)
                        filename = f"{place.slug}-{saved_for_this_place + 1}.jpg"
                        new_img.image.save(filename, ContentFile(img_bytes), save=False)
                    except Exception as e:
                        self.stdout.write(self.style.WARNING(f"    Download failed ({e}), using direct URL."))

                new_img.save()
                existing_urls.add(img_url)
                saved_for_this_place += 1

            self.stdout.write(
                self.style.SUCCESS(
                    f"  + Added gallery for {place.name} (Total photos: {saved_for_this_place})"
                )
            )
            success_count += 1
            time.sleep(0.3)  # Rate limiting respect for MediaWiki API

        self.stdout.write(
            self.style.SUCCESS(
                f"\nFinished Gallery Fetch! Processed: {total} | Enhanced: {success_count} | Skipped: {skipped_count} | Failed: {failed_count}"
            )
        )
