# System Architecture

## Initial architecture
A modular monolith is used for the FastAPI backend. Next.js owns public rendering and API integration.

```text
Browser
  -> Next.js
  -> FastAPI REST API
  -> Store/MongoDB adapter
  -> Redis/task integration (future)
  -> External providers (payments, SMS, email, storage)
```

## Modules
auth, users, vendors, categories, listings, search, requirements, leads, quotations, cart, orders, bookings, payments, weddings and admin.
