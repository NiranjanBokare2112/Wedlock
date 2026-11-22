# Wedlock Wedding Marketplace

Wedlock is a modular, India-focused wedding marketplace for vendors, products, requirements, quotations, bookings and wedding planning.

## Stack
- Frontend: Next.js 16, React 19, TypeScript, Tailwind CSS
- Backend: FastAPI, Pydantic
- Development data: isolated in-memory store
- Data path for deployment: MongoDB Atlas/local MongoDB
- Containers: Docker Compose

## Run locally
```powershell
cd backend
python -m venv .venv
.\\.venv\\Scripts\\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

```powershell
cd frontend
npm install
npm run dev
```

Open http://localhost:3000.

## Current implementation
- Public marketplace homepage and category discovery
- Search results backed by the FastAPI API
- Multi-category requirement submission and vendor lead creation
- Vendor and customer dashboard shells
- Administrator summary
- Listing, quote, cart, order and booking API operations
- Double-booking prevention by listing and event date
- Health and API documentation endpoints

The development store is intentionally non-persistent. It must be replaced or bridged to MongoDB before production use.
