import os
import secrets
import time
from typing import Any

from fastapi import APIRouter, HTTPException, Query

from app.models import (
    BookingCreate,
    CartItem,
    EnquiryCreate,
    LeadUnlock,
    ListingCreate,
    OtpRequest,
    OtpVerify,
    PlanChange,
    QuoteCreate,
    RequirementCreate,
    VerifiedBuyer,
)
from app.store import PLANS, mask_mobile, store

router = APIRouter()

OTP_TTL_SECONDS = 300
OTP_RESEND_SECONDS = 30
OTP_MAX_ATTEMPTS = 5
VERIFICATION_TTL_SECONDS = 1800


def otp_dev_mode() -> bool:
    """No SMS provider is configured, so in development the code is returned in the response."""
    return os.getenv("OTP_DEV_MODE", "true").lower() in {"1", "true", "yes"}


# ── Catalogue & search ───────────────────────────────────────

@router.get("/categories")
def categories():
    return list(store.categories.values())


@router.post("/listings", status_code=201)
def create_listing(payload: ListingCreate):
    if payload.supplier_id and payload.supplier_id not in store.suppliers:
        raise HTTPException(status_code=404, detail="Supplier not found")
    item = store.create(store.listings, payload.model_dump(mode="json"))
    store.listings[item["id"]]["status"] = "PENDING_APPROVAL"
    store.audit("listing.created", listing_id=item["id"])
    return {**item, "status": "PENDING_APPROVAL"}


@router.get("/search")
def search(
    category: str | None = None,
    city: str | None = None,
    q: str | None = None,
    limit: int = Query(default=20, ge=1, le=100),
):
    results = [store.public_listing(item) for item in store.listings.values() if item.get("status") == "PUBLISHED"]
    if category:
        wanted = category.strip().lower()
        results = [item for item in results if item["category"].lower() == wanted]
    if city:
        results = [item for item in results if item["city"].lower() == city.strip().lower()]
    if q:
        term = q.strip().lower()
        results = [
            item for item in results
            if term in item["title"].lower()
            or term in item["description"].lower()
            or term in item["category"].lower()
            or term in item["city"].lower()
        ]

    # Paid plan first, then verification, then rating (IndiaMART-style ranking).
    def rank(item: dict[str, Any]):
        supplier = item.get("supplier") or {}
        return (
            PLANS.get(supplier.get("plan", "FREE"), PLANS["FREE"])["rank"],
            1 if supplier.get("verified") else 0,
            item.get("rating") or 0,
        )

    results.sort(key=rank, reverse=True)
    return results[:limit]


@router.get("/listings/{listing_id}")
def get_listing(listing_id: str):
    item = store.listings.get(listing_id)
    if not item:
        raise HTTPException(status_code=404, detail="Listing not found")
    return store.public_listing(item)


# ── Suppliers & plans ────────────────────────────────────────

def public_supplier(supplier: dict[str, Any]) -> dict[str, Any]:
    plan = PLANS[supplier["plan"]]
    listings = [store.public_listing(l) for l in store.listings.values() if l.get("supplier_id") == supplier["id"] and l.get("status") == "PUBLISHED"]
    categories = sorted({l["category"] for l in listings if l["category"]})
    return {
        "id": supplier["id"],
        "business_name": supplier["business_name"],
        "city": supplier["city"],
        "about": supplier["about"],
        "plan": supplier["plan"],
        "plan_badge": plan["badge"],
        "verified": supplier["verified"],
        "gst_verified": supplier["gst_verified"],
        "years_in_business": supplier["years_in_business"],
        "response_rate": supplier["response_rate"],
        "member_since": supplier["member_since"],
        "mobile_masked": mask_mobile(supplier["mobile"]),
        "categories": categories,
        "rating": max((l.get("rating") or 0 for l in listings), default=None),
        "review_count": sum(l.get("review_count") or 0 for l in listings),
        "listings": listings,
        "demo": supplier.get("demo", False),
    }


@router.get("/plans")
def plans():
    return list(PLANS.values())


@router.get("/suppliers")
def list_suppliers():
    items = [public_supplier(s) for s in store.suppliers.values()]
    items.sort(key=lambda s: (PLANS[s["plan"]]["rank"], s["verified"]), reverse=True)
    return items


@router.get("/suppliers/{supplier_id}")
def get_supplier(supplier_id: str):
    supplier = store.suppliers.get(supplier_id)
    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")
    return public_supplier(supplier)


@router.get("/suppliers/{supplier_id}/account")
def supplier_account(supplier_id: str):
    """Supplier's own account view: plan and remaining lead credits. Requires auth once sign-in exists."""
    supplier = store.suppliers.get(supplier_id)
    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")
    return {
        "id": supplier["id"],
        "business_name": supplier["business_name"],
        "plan": PLANS[supplier["plan"]],
        "credits": supplier["credits"],
    }


def lead_view(lead: dict[str, Any]) -> dict[str, Any]:
    requirement = store.requirements.get(lead["requirement_id"], {})
    listing = store.listings.get(lead["listing_id"], {})
    buyer = requirement.get("buyer") or {}
    quote = next((q for q in store.quotations.values() if q["lead_id"] == lead["id"]), None)
    return {
        **lead,
        "listing_title": listing.get("title"),
        "category": store.category_title(listing.get("category_id")),
        "requirement": {
            "city": requirement.get("city"),
            "event_date": requirement.get("event_date"),
            "guest_count": requirement.get("guest_count"),
            "budget": requirement.get("budget"),
            "categories": requirement.get("categories", []),
            "description": requirement.get("description"),
            "verified": requirement.get("verified", False),
        },
        "buyer": {
            "name": buyer.get("name") if lead["unlocked"] else (buyer.get("name", "Buyer")[:1] + "•••••"),
            "mobile": buyer.get("mobile") if lead["unlocked"] else mask_mobile(buyer.get("mobile", "")),
        },
        "quotation": quote,
    }


@router.get("/suppliers/{supplier_id}/leads")
def supplier_leads(supplier_id: str):
    if supplier_id not in store.suppliers:
        raise HTTPException(status_code=404, detail="Supplier not found")
    leads = [lead_view(l) for l in store.leads.values() if l.get("supplier_id") == supplier_id]
    leads.sort(key=lambda l: l["created_at"], reverse=True)
    return leads


@router.post("/leads/{lead_id}/unlock")
def unlock_lead(lead_id: str, payload: LeadUnlock):
    lead = store.leads.get(lead_id)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    if lead.get("supplier_id") != payload.supplier_id:
        raise HTTPException(status_code=403, detail="This lead belongs to another supplier")
    supplier = store.suppliers[payload.supplier_id]
    with store.lock:
        if not lead["unlocked"]:
            if supplier["credits"] <= 0:
                raise HTTPException(status_code=402, detail="No lead credits left. Upgrade your plan to unlock more buy leads.")
            supplier["credits"] -= 1
            lead["unlocked"] = True
            if lead["status"] == "NEW":
                lead["status"] = "UNLOCKED"
    store.audit("lead.unlocked", lead_id=lead_id, supplier_id=payload.supplier_id)
    return {"lead": lead_view(lead), "credits": supplier["credits"]}


@router.post("/admin/suppliers/{supplier_id}/plan")
def change_plan(supplier_id: str, payload: PlanChange):
    """Administrative plan assignment. No payment is taken here; billing is not connected."""
    supplier = store.suppliers.get(supplier_id)
    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")
    if payload.plan not in PLANS:
        raise HTTPException(status_code=422, detail=f"Unknown plan. Choose one of {', '.join(PLANS)}")
    with store.lock:
        supplier["plan"] = payload.plan
        supplier["credits"] = max(supplier["credits"], PLANS[payload.plan]["credits"])
        if payload.plan != "FREE":
            supplier["verified"] = True
    store.audit("supplier.plan_changed", supplier_id=supplier_id, plan=payload.plan)
    return public_supplier(supplier)


# ── Buyer verification (OTP) ─────────────────────────────────

@router.post("/otp/request")
def request_otp(payload: OtpRequest):
    now = time.time()
    existing = store.otp_requests.get(payload.mobile)
    if existing and now - existing["sent_at"] < OTP_RESEND_SECONDS:
        wait = int(OTP_RESEND_SECONDS - (now - existing["sent_at"])) + 1
        raise HTTPException(status_code=429, detail=f"Please wait {wait}s before requesting another code")
    code = f"{secrets.randbelow(1_000_000):06d}"
    store.otp_requests[payload.mobile] = {"code": code, "sent_at": now, "expires_at": now + OTP_TTL_SECONDS, "attempts": 0}
    store.audit("otp.requested", mobile=mask_mobile(payload.mobile))
    response: dict[str, Any] = {"sent": True, "expires_in": OTP_TTL_SECONDS}
    if otp_dev_mode():
        response["dev_code"] = code
    return response


@router.post("/otp/verify")
def verify_otp(payload: OtpVerify):
    record = store.otp_requests.get(payload.mobile)
    now = time.time()
    if not record or now > record["expires_at"]:
        raise HTTPException(status_code=400, detail="Code expired. Request a new one.")
    if record["attempts"] >= OTP_MAX_ATTEMPTS:
        raise HTTPException(status_code=429, detail="Too many attempts. Request a new code.")
    record["attempts"] += 1
    if not secrets.compare_digest(record["code"], payload.code):
        raise HTTPException(status_code=400, detail="Incorrect code")
    del store.otp_requests[payload.mobile]
    token = secrets.token_urlsafe(24)
    store.verifications[token] = {"mobile": payload.mobile, "expires_at": now + VERIFICATION_TTL_SECONDS}
    return {"verification_token": token, "expires_in": VERIFICATION_TTL_SECONDS}


def require_verified(payload: VerifiedBuyer) -> None:
    record = store.verifications.get(payload.verification_token)
    if not record or record["mobile"] != payload.mobile or time.time() > record["expires_at"]:
        raise HTTPException(status_code=401, detail="Mobile number is not verified. Please verify with the OTP again.")


# ── Requirements, enquiries & leads ──────────────────────────

@router.post("/requirements", status_code=201)
def create_requirement(payload: RequirementCreate):
    require_verified(payload)
    data = payload.model_dump(exclude={"buyer_name", "mobile", "verification_token"})
    requirement = store.create(store.requirements, {
        **data,
        "buyer": {"name": payload.buyer_name, "mobile": payload.mobile},
        "verified": True,
        "source": "REQUIREMENT",
        "status": "OPEN",
    })
    matches = store.match_listings(payload.city, payload.categories)
    for listing in matches:
        store.create_lead(requirement, listing, "REQUIREMENT")
    store.requirements[requirement["id"]]["lead_count"] = len(matches)
    store.audit("requirement.created", requirement_id=requirement["id"], leads=len(matches))
    return {**requirement, "lead_count": len(matches), "buyer": {"name": payload.buyer_name}}


@router.post("/enquiries", status_code=201)
def create_enquiry(payload: EnquiryCreate):
    """Direct 'Get best price' enquiry to a single listing's supplier."""
    require_verified(payload)
    listing = store.listings.get(payload.listing_id)
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    requirement = store.create(store.requirements, {
        "city": listing["city"],
        "event_date": payload.event_date or "",
        "guest_count": payload.guest_count or 0,
        "budget": 0,
        "categories": [store.category_title(listing.get("category_id"))],
        "description": payload.message,
        "buyer": {"name": payload.buyer_name, "mobile": payload.mobile},
        "verified": True,
        "source": "ENQUIRY",
        "listing_id": listing["id"],
        "status": "OPEN",
        "lead_count": 1,
    })
    lead = store.create_lead(requirement, listing, "ENQUIRY")
    store.audit("enquiry.created", requirement_id=requirement["id"], listing_id=listing["id"])
    return {"id": requirement["id"], "lead_id": lead["id"], "supplier": store.supplier_summary(listing.get("supplier_id"))}


def public_requirement(requirement: dict[str, Any]) -> dict[str, Any]:
    quotes = [quote_view(q) for q in store.quotations.values() if q["requirement_id"] == requirement["id"]]
    return {
        **{k: v for k, v in requirement.items() if k != "buyer"},
        "buyer_name": (requirement.get("buyer") or {}).get("name"),
        "quotations": quotes,
    }


@router.get("/requirements")
def list_requirements():
    items = [public_requirement(r) for r in store.requirements.values()]
    items.sort(key=lambda r: r["created_at"], reverse=True)
    return items


@router.get("/leads")
def list_leads():
    return [lead_view(l) for l in store.leads.values()]


# ── Quotations ───────────────────────────────────────────────

def quote_view(quote: dict[str, Any]) -> dict[str, Any]:
    listing = store.listings.get(quote.get("listing_id", ""), {})
    return {**quote, "listing_title": listing.get("title"), "supplier": store.supplier_summary(quote.get("vendor_id"))}


@router.post("/quotations", status_code=201)
def create_quote(payload: QuoteCreate):
    lead = store.leads.get(payload.lead_id)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    if lead.get("supplier_id") != payload.vendor_id:
        raise HTTPException(status_code=403, detail="This lead belongs to another supplier")
    if not lead["unlocked"]:
        raise HTTPException(status_code=409, detail="Unlock the lead before sending a quotation")
    if any(q["lead_id"] == lead["id"] for q in store.quotations.values()):
        raise HTTPException(status_code=409, detail="A quotation was already sent for this lead")
    quote = store.create(store.quotations, {
        **payload.model_dump(),
        "requirement_id": lead["requirement_id"],
        "listing_id": lead["listing_id"],
        "status": "SENT",
    })
    lead["status"] = "QUOTATION_SENT"
    store.audit("quotation.created", quotation_id=quote["id"])
    return quote_view(quote)


@router.post("/quotations/{quotation_id}/accept")
def accept_quote(quotation_id: str):
    quote = store.quotations.get(quotation_id)
    if not quote:
        raise HTTPException(status_code=404, detail="Quotation not found")
    with store.lock:
        quote["status"] = "ACCEPTED"
        requirement = store.requirements.get(quote["requirement_id"])
        if requirement:
            requirement["status"] = "QUOTE_ACCEPTED"
        for lead in store.leads.values():
            if lead["id"] == quote["lead_id"]:
                lead["status"] = "WON"
    store.audit("quotation.accepted", quotation_id=quotation_id)
    return quote_view(quote)


# ── Commerce & bookings (hybrid model, payments not connected) ─

@router.post("/cart/{customer_id}")
def update_cart(customer_id: str, items: list[CartItem]):
    for item in items:
        if item.listing_id not in store.listings:
            raise HTTPException(status_code=404, detail=f"Listing {item.listing_id} not found")
    return store.create(store.carts, {"customer_id": customer_id, "items": [item.model_dump() for item in items]})


@router.post("/orders", status_code=201)
def create_order(customer_id: str, cart_id: str):
    cart = store.carts.get(cart_id)
    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")
    return store.create(store.orders, {"customer_id": customer_id, "cart_id": cart_id, "status": "PENDING_PAYMENT"})


@router.post("/bookings", status_code=201)
def create_booking(payload: BookingCreate):
    listing = store.listings.get(payload.listing_id)
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    for booking in store.bookings.values():
        if booking["listing_id"] == payload.listing_id and booking["event_date"] == payload.event_date:
            raise HTTPException(status_code=409, detail="The listing is already booked on this date")
    return store.create(store.bookings, {**payload.model_dump(), "status": "HOLD"})


# ── Admin ────────────────────────────────────────────────────

@router.get("/admin/summary")
def admin_summary():
    leads = list(store.leads.values())
    return {
        "suppliers": len(store.suppliers),
        "listings": len(store.listings),
        "requirements": len([r for r in store.requirements.values() if r.get("source") != "ENQUIRY"]),
        "enquiries": len([r for r in store.requirements.values() if r.get("source") == "ENQUIRY"]),
        "leads": len(leads),
        "leads_unlocked": len([l for l in leads if l["unlocked"]]),
        "quotations": len(store.quotations),
        "bookings": len(store.bookings),
    }
