from copy import deepcopy
from datetime import datetime, timezone
from threading import Lock
from typing import Any
from uuid import uuid4

# Supplier subscription plans (IndiaMART-style lead model).
# `rank` drives search ordering; `credits` is the monthly allowance of lead unlocks.
PLANS: dict[str, dict[str, Any]] = {
    "FREE": {
        "code": "FREE",
        "title": "Free listing",
        "rank": 0,
        "credits": 3,
        "badge": None,
        "features": [
            "Business profile and catalogue",
            "3 buy-lead unlocks per month",
            "Direct enquiries from buyers",
        ],
    },
    "GROWTH": {
        "code": "GROWTH",
        "title": "Growth",
        "rank": 1,
        "credits": 30,
        "badge": "Growth seller",
        "features": [
            "Everything in Free",
            "30 buy-lead unlocks per month",
            "Higher placement in search",
            "Verified business badge",
        ],
    },
    "ASSURED": {
        "code": "ASSURED",
        "title": "Assured",
        "rank": 2,
        "credits": 100,
        "badge": "Wedlock Assured",
        "features": [
            "Everything in Growth",
            "100 buy-lead unlocks per month",
            "Top placement in search and categories",
            "Wedlock Assured trust seal",
        ],
    },
}


def mask_mobile(mobile: str) -> str:
    return f"{mobile[:2]}XXXXXX{mobile[-2:]}" if len(mobile) >= 4 else "XXXXXXXXXX"


class Store:
    def __init__(self) -> None:
        self.lock = Lock()
        self.users: dict[str, dict[str, Any]] = {}
        self.categories: dict[str, dict[str, Any]] = {}
        self.suppliers: dict[str, dict[str, Any]] = {}
        self.listings: dict[str, dict[str, Any]] = {}
        self.requirements: dict[str, dict[str, Any]] = {}
        self.leads: dict[str, dict[str, Any]] = {}
        self.quotations: dict[str, dict[str, Any]] = {}
        self.carts: dict[str, dict[str, Any]] = {}
        self.orders: dict[str, dict[str, Any]] = {}
        self.bookings: dict[str, dict[str, Any]] = {}
        self.otp_requests: dict[str, dict[str, Any]] = {}
        self.verifications: dict[str, dict[str, Any]] = {}
        self.audit_logs: list[dict[str, Any]] = []
        self.seed()

    def now(self) -> str:
        return datetime.now(timezone.utc).isoformat()

    def create(self, collection: dict[str, dict[str, Any]], data: dict[str, Any]) -> dict[str, Any]:
        item = {"id": str(uuid4()), "created_at": self.now(), **deepcopy(data)}
        with self.lock:
            collection[item["id"]] = item
        return deepcopy(item)

    def audit(self, action: str, user_id: str | None = None, **details: Any) -> None:
        with self.lock:
            self.audit_logs.append({
                "id": str(uuid4()),
                "created_at": self.now(),
                "action": action,
                "user_id": user_id,
                "details": details,
            })

    # ── Helpers ──────────────────────────────────────────────

    def category_title(self, category_id: str | None) -> str:
        category = self.categories.get(category_id or "")
        return category["title"] if category else ""

    def supplier_summary(self, supplier_id: str | None) -> dict[str, Any] | None:
        supplier = self.suppliers.get(supplier_id or "")
        if not supplier:
            return None
        plan = PLANS[supplier["plan"]]
        return {
            "id": supplier["id"],
            "business_name": supplier["business_name"],
            "city": supplier["city"],
            "plan": supplier["plan"],
            "plan_badge": plan["badge"],
            "verified": supplier["verified"],
            "years_in_business": supplier["years_in_business"],
            "response_rate": supplier["response_rate"],
        }

    def public_listing(self, listing: dict[str, Any]) -> dict[str, Any]:
        return {
            **listing,
            "category": self.category_title(listing.get("category_id")),
            "supplier": self.supplier_summary(listing.get("supplier_id")),
        }

    def match_listings(self, city: str, categories: list[str]) -> list[dict[str, Any]]:
        """Listings whose category is requested AND which serve the requirement's city."""
        wanted = {c.strip().lower() for c in categories}
        return [
            listing for listing in self.listings.values()
            if listing.get("status") == "PUBLISHED"
            and listing["city"].lower() == city.strip().lower()
            and self.category_title(listing.get("category_id")).lower() in wanted
        ]

    def create_lead(self, requirement: dict[str, Any], listing: dict[str, Any], source: str, demo: bool = False) -> dict[str, Any]:
        return self.create(self.leads, {
            "requirement_id": requirement["id"],
            "listing_id": listing["id"],
            "supplier_id": listing.get("supplier_id"),
            "source": source,
            "status": "NEW",
            "unlocked": False,
            **({"demo": True} if demo else {}),
        })

    # ── Seed data (development only) ─────────────────────────

    def seed(self) -> None:
        seed_categories = [
            ("Venues", "Wedding venues"),
            ("Photography", "Wedding photographers"),
            ("Catering", "Wedding catering"),
            ("Decoration", "Decoration and rentals"),
            ("Beauty", "Makeup and grooming"),
            ("Planning", "Wedding planners"),
        ]
        category_ids: dict[str, str] = {}
        for title, description in seed_categories:
            item = self.create(self.categories, {"title": title, "description": description, "active": True, "demo": True})
            category_ids[title.lower()] = item["id"]

        # title, category, city, price, description, plan, years, response %, rating, reviews
        seed_listings = [
            ("Royal Garden Venue", "venues", "Mumbai", 85000, "Grand lawns and elegant indoor halls for 100 to 1,500 guests.", "ASSURED", 14, 98, 4.8, 126),
            ("Studio Shagun", "photography", "Jaipur", 65000, "Candid wedding films, portraits and destination ceremonies.", "GROWTH", 8, 94, 4.7, 88),
            ("Savory Wedding Table", "catering", "Pune", 850, "Vegetarian and regional menus for intimate to grand celebrations.", "FREE", 6, 81, 4.5, 37),
            ("Ivory Decor Studio", "decoration", "Delhi", 75000, "Complete mandap, floral and reception decor concepts.", "GROWTH", 11, 92, 4.6, 64),
            ("Gulmohar Bridal Glam", "beauty", "Mumbai", 18000, "Bridal makeup, hairstyling and family beauty services.", "FREE", 5, 86, 4.6, 52),
            ("Aangan Wedding Co.", "planning", "Jaipur", 125000, "Full-service planning, vendor coordination and wedding day management.", "ASSURED", 12, 97, 4.9, 141),
            ("Lakeview Resort", "venues", "Udaipur", 220000, "Destination wedding resort with ceremony lawns and guest rooms.", "ASSURED", 18, 95, 4.8, 203),
            ("Frame Story Films", "photography", "Pune", 95000, "Cinematic films, drone coverage and live streaming.", "GROWTH", 7, 90, 4.7, 71),
            ("Mehfil Catering", "catering", "Delhi", 1100, "Awadhi, Mughlai and pan-Indian wedding menus.", "GROWTH", 20, 89, 4.6, 98),
            ("Marigold Mandap Works", "decoration", "Mumbai", 55000, "Traditional and contemporary mandap installations.", "FREE", 4, 78, 4.4, 29),
        ]
        for i, (title, category_key, city, price, description, plan, years, response, rating, reviews) in enumerate(seed_listings):
            supplier = self.create(self.suppliers, {
                "business_name": title,
                "owner_name": "Demo owner",
                "city": city,
                "about": f"{title} is a {city}-based wedding {self.category_title(category_ids[category_key]).lower()} business. {description}",
                "plan": plan,
                "credits": PLANS[plan]["credits"],
                "verified": plan != "FREE" or i % 2 == 0,
                "gst_verified": plan != "FREE",
                "years_in_business": years,
                "response_rate": response,
                "member_since": 2026 - min(years, 6),
                "mobile": f"98{(20000000 + i * 1111111) % 100000000:08d}",
                "demo": True,
            })
            self.create(self.listings, {
                "title": title,
                "description": description,
                "category_id": category_ids[category_key],
                "supplier_id": supplier["id"],
                "transaction_type": "PRICE_PER_PLATE" if category_key == "catering" else "SERVICE_BOOKING",
                "city": city,
                "starting_price": price,
                "status": "PUBLISHED",
                "verification": "VERIFIED" if supplier["verified"] else "PENDING",
                "demo": True,
                "rating": rating,
                "review_count": reviews,
            })

        demo_requirements = [
            ("Mumbai", "2027-02-15", 700, 1500000, ["Venues", "Catering", "Photography"], "Wedding at a Mumbai venue with a 700 guest dinner.", "Priya S.", "9876501234"),
            ("Jaipur", "2027-11-20", 350, 2400000, ["Venues", "Planning", "Photography"], "Three-day destination wedding in Jaipur with haldi, sangeet and pheras.", "Rohan M.", "9812304567"),
            ("Pune", "2027-01-08", 250, 900000, ["Photography", "Catering"], "Intimate garden wedding, need candid photography and a vegetarian menu.", "Ananya K.", "9900112233"),
            ("Delhi", "2027-03-02", 900, 3500000, ["Decoration", "Catering"], "Large reception with floral mandap and live counters.", "Kabir A.", "9765432109"),
        ]
        for city, event_date, guests, budget, categories, description, name, mobile in demo_requirements:
            requirement = self.create(self.requirements, {
                "city": city, "event_date": event_date, "guest_count": guests, "budget": budget,
                "categories": categories, "description": description,
                "buyer": {"name": name, "mobile": mobile}, "verified": True,
                "source": "REQUIREMENT", "status": "OPEN", "demo": True,
            })
            matches = self.match_listings(city, categories)
            for listing in matches:
                self.create_lead(requirement, listing, "REQUIREMENT", demo=True)
            self.requirements[requirement["id"]]["lead_count"] = len(matches)


store = Store()
