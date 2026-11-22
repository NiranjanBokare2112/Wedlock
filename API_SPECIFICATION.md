# API Specification

FastAPI exposes interactive OpenAPI documentation at `/docs`.

## Implemented prefixes
- `GET /api/v1/categories`
- `POST /api/v1/listings`
- `GET /api/v1/search`
- `GET /api/v1/listings/{listing_id}`
- `POST /api/v1/requirements`
- `GET /api/v1/requirements`
- `GET /api/v1/leads`
- `POST /api/v1/quotations`
- `POST /api/v1/cart/{customer_id}`
- `POST /api/v1/orders`
- `POST /api/v1/bookings`
- `GET /api/v1/admin/summary`
- `GET /health`

## Error behavior
404 for missing resources, 409 for booking conflicts and 422 for Pydantic validation failures.
