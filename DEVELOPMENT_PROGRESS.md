# Development Progress

## Foundation phase
Status: implemented foundation; external integrations and durable MongoDB persistence remain.

### Implemented
- Empty repository scaffolded into Next.js and FastAPI projects.
- Public responsive homepage, search, requirement form, customer, vendor and admin routes.
- FastAPI category, listing, search, requirement, lead, quotation, cart, order and booking operations.
- Conflict protection for repeated listing/date booking holds.
- Docker Compose skeleton with MongoDB and Redis.
- Product, architecture, API, database, security and deployment documentation.
- Focused FastAPI smoke tests.

### Not implemented by real external service
- Production MongoDB repository adapter
- OTP authentication and authorization
- Razorpay/Cashfree integration
- SMS, email, WhatsApp and push delivery
- Cloud media storage
- Full payment settlement and reconciliation
- Complete commerce and booking state machines

### Known issues
- The backend currently uses a process-local development store.
- Vendor, customer and admin dashboard data is not yet connected to protected APIs.
- No real credentials or successful payment behavior are configured.

## Demo runtime
Status: running locally with fake development data.

- Frontend: http://localhost:3000
- Backend: http://127.0.0.1:8001
- API documentation: http://127.0.0.1:8001/docs
- Seeded listings and requirements are marked with `"demo": true`.
- Fake data is in-memory and resets when the backend restarts.
- Port 8000 is already occupied by another process in this shared environment.

## Lead marketplace phase (IndiaMART-style)
Status: implemented on the development store.

- Leads now match on category AND city (previously city only).
- Buyer mobile verification via OTP for requirements and direct enquiries. No SMS provider is connected: with `OTP_DEV_MODE=true` (default) the API returns the code and the UI shows it.
- "Get best price" direct enquiries to a single listing's supplier.
- Supplier profiles (`/supplier/[id]`) with trust signals, catalogue and enquiry.
- Supplier plans (Free / Growth / Assured) with monthly lead credits; search ranks paid and verified suppliers first.
- Lead manager: suppliers spend 1 credit to unlock a buyer's contact, then send a quotation. Buyers compare and accept quotations in My enquiries.
- Admin can assign plans manually; billing is not connected, so no payment is taken.

### Still not implemented
- Real SMS delivery, sign-in and role-based authorization (vendor dashboard uses a demo supplier switcher).
- Plan billing, credit renewal schedule, and persistence (data resets on backend restart).
