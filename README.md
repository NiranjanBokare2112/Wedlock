# Wedlock: wedding marketplace

Wedlock is an IndiaMART-style marketplace for Indian weddings. Couples, families and planners
find suppliers of services and products, post one requirement and receive quotations from many
suppliers. Suppliers receive buy leads, unlock buyer contacts with lead credits and send quotes.

## Deploy on Vercel

1. In Vercel, choose **Add New → Project** and import this repository.
2. Keep the defaults (framework **Next.js**, root directory `./`, build command `next build`).
3. Click **Deploy**.

No environment variables, database or backend are needed. This is a self-contained demo:

- Suppliers, listings and categories ship with the app (`src/lib/demo/data.ts`).
- Everything visitors do (requirements, enquiries, unlocked leads, quotations, plan changes) is
  saved in their own browser (localStorage). Try the buyer and supplier sides in the same browser
  to see each other's actions. **Reset demo data** on My enquiries, the vendor dashboard or the
  admin console restores the starting data.
- Mobile verification shows the one-time code on screen because no SMS provider is connected.

## Run locally

Requires Node.js 20.9 or newer.

```sh
npm install
npm run dev      # http://localhost:3000
npm run build    # production build, as run by Vercel
npm start        # serve the production build
```

## What you can try

| Page | What it does |
|------|--------------|
| `/` | Search, categories, quick "get free quotes" form, featured suppliers |
| `/search` | Filter by keyword, category and city; paid and verified suppliers rank first |
| `/supplier/[id]` | Supplier profile with trust signals, catalogue and "Get best price" enquiry |
| `/requirements` | Post a buy requirement with OTP mobile verification; matched by category and city |
| `/customer` | My enquiries: requirements, enquiries and quotations, accept a quote |
| `/vendor` | Lead manager: switch supplier, unlock contacts with credits, send quotations, plans |
| `/admin` | Marketplace figures and manual supplier plan assignment |

## Project structure

- `src/app`: pages (Next.js App Router)
- `src/components`: UI components; `src/components/views`: client views for data-driven pages
- `src/lib/demo/data.ts`: seed data and marketplace rules (matching, OTP, credits, quotes, ranking)
- `src/lib/demo/client.ts`: browser storage, live updates and the `apiSend` action entry point
- `public/images`: photography (see `public/images/README.md`)

## Moving beyond the demo

To share data between visitors, replace the browser store with a database behind API routes.
The rule functions in `src/lib/demo/data.ts` take a state object and can be reused on the server.
