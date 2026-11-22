from fastapi.testclient import TestClient

from app.main import app
from app.store import store

client = TestClient(app)


def verify(mobile: str) -> str:
    sent = client.post("/api/v1/otp/request", json={"mobile": mobile})
    assert sent.status_code == 200, sent.text
    code = sent.json()["dev_code"]
    verified = client.post("/api/v1/otp/verify", json={"mobile": mobile, "code": code})
    assert verified.status_code == 200, verified.text
    return verified.json()["verification_token"]


def supplier_of(title: str) -> dict:
    listing = next(l for l in store.listings.values() if l["title"] == title)
    return store.suppliers[listing["supplier_id"]]


def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_category_and_search():
    assert client.get("/api/v1/categories").status_code == 200
    response = client.get("/api/v1/search", params={"city": "Mumbai"})
    assert response.status_code == 200
    assert all(item["city"] == "Mumbai" for item in response.json())


def test_search_filters_by_category_and_ranks_paid_plans_first():
    venues = client.get("/api/v1/search", params={"category": "venues"}).json()
    assert venues and all(item["category"] == "Venues" for item in venues)
    everything = client.get("/api/v1/search", params={"limit": 100}).json()
    ranks = [{"FREE": 0, "GROWTH": 1, "ASSURED": 2}[item["supplier"]["plan"]] for item in everything]
    assert ranks == sorted(ranks, reverse=True)


def test_otp_rejects_wrong_code_and_invalid_mobile():
    assert client.post("/api/v1/otp/request", json={"mobile": "12345"}).status_code == 422
    code = client.post("/api/v1/otp/request", json={"mobile": "9000000001"}).json()["dev_code"]
    wrong = "000000" if code != "000000" else "111111"
    assert client.post("/api/v1/otp/verify", json={"mobile": "9000000001", "code": wrong}).status_code == 400
    assert client.post("/api/v1/otp/request", json={"mobile": "9000000001"}).status_code == 429  # resend cooldown
    assert client.post("/api/v1/otp/verify", json={"mobile": "9000000001", "code": code}).status_code == 200


def test_requirement_requires_verified_mobile():
    response = client.post("/api/v1/requirements", json={
        "city": "Mumbai", "event_date": "2027-02-15", "guest_count": 700, "budget": 1500000,
        "categories": ["Venues"], "description": "Wedding celebration for 700 guests",
        "buyer_name": "Test Buyer", "mobile": "9000000002", "verification_token": "not-a-real-token",
    })
    assert response.status_code == 401


def test_requirement_matches_by_category_and_city():
    token = verify("9000000003")
    response = client.post("/api/v1/requirements", json={
        "city": "Mumbai", "event_date": "2027-02-15", "guest_count": 700, "budget": 1500000,
        "categories": ["venues", "catering"], "description": "Wedding celebration for 700 guests",
        "buyer_name": "Test Buyer", "mobile": "9000000003", "verification_token": token,
    })
    assert response.status_code == 201, response.text
    requirement_id = response.json()["id"]
    leads = [l for l in store.leads.values() if l["requirement_id"] == requirement_id]
    titles = {store.listings[l["listing_id"]]["title"] for l in leads}
    # Royal Garden Venue is the only Mumbai venue; Mumbai beauty/decor suppliers must not get the lead.
    assert titles == {"Royal Garden Venue"}


def test_enquiry_unlock_quote_and_accept_flow():
    supplier = supplier_of("Marigold Mandap Works")
    listing = next(l for l in store.listings.values() if l["supplier_id"] == supplier["id"])
    token = verify("9000000004")
    enquiry = client.post("/api/v1/enquiries", json={
        "listing_id": listing["id"], "message": "Need a floral mandap for March",
        "buyer_name": "Meera", "mobile": "9000000004", "verification_token": token,
    })
    assert enquiry.status_code == 201, enquiry.text
    lead_id = enquiry.json()["lead_id"]

    leads = client.get(f"/api/v1/suppliers/{supplier['id']}/leads").json()
    locked = next(l for l in leads if l["id"] == lead_id)
    assert locked["buyer"]["mobile"] == "90XXXXXX04"

    # Quoting before unlocking is refused
    quote = {"lead_id": lead_id, "vendor_id": supplier["id"], "amount": 60000, "terms": "Includes setup"}
    assert client.post("/api/v1/quotations", json=quote).status_code == 409

    credits_before = supplier["credits"]
    unlocked = client.post(f"/api/v1/leads/{lead_id}/unlock", json={"supplier_id": supplier["id"]})
    assert unlocked.status_code == 200
    assert unlocked.json()["lead"]["buyer"]["mobile"] == "9000000004"
    assert unlocked.json()["credits"] == credits_before - 1
    # Unlocking again is free
    assert client.post(f"/api/v1/leads/{lead_id}/unlock", json={"supplier_id": supplier["id"]}).json()["credits"] == credits_before - 1

    sent = client.post("/api/v1/quotations", json=quote)
    assert sent.status_code == 201
    accepted = client.post(f"/api/v1/quotations/{sent.json()['id']}/accept")
    assert accepted.json()["status"] == "ACCEPTED"


def test_unlock_fails_without_credits_and_for_other_suppliers():
    supplier = supplier_of("Gulmohar Bridal Glam")
    other = supplier_of("Royal Garden Venue")
    listing = next(l for l in store.listings.values() if l["supplier_id"] == supplier["id"])
    token = verify("9000000005")
    lead_id = client.post("/api/v1/enquiries", json={
        "listing_id": listing["id"], "message": "Bridal makeup for two functions",
        "buyer_name": "Isha", "mobile": "9000000005", "verification_token": token,
    }).json()["lead_id"]
    assert client.post(f"/api/v1/leads/{lead_id}/unlock", json={"supplier_id": other["id"]}).status_code == 403
    supplier["credits"] = 0
    assert client.post(f"/api/v1/leads/{lead_id}/unlock", json={"supplier_id": supplier["id"]}).status_code == 402


def test_admin_plan_change_tops_up_credits():
    supplier = supplier_of("Savory Wedding Table")
    response = client.post(f"/api/v1/admin/suppliers/{supplier['id']}/plan", json={"plan": "GROWTH"})
    assert response.status_code == 200
    assert response.json()["plan"] == "GROWTH"
    assert store.suppliers[supplier["id"]]["credits"] >= 30
    assert client.post(f"/api/v1/admin/suppliers/{supplier['id']}/plan", json={"plan": "GOLD"}).status_code == 422


def test_duplicate_booking_rejected():
    listing_id = next(iter(store.listings))
    booking = {"listing_id": listing_id, "customer_id": "c1", "event_date": "2027-05-05"}
    assert client.post("/api/v1/bookings", json=booking).status_code == 201
    assert client.post("/api/v1/bookings", json=booking).status_code == 409
