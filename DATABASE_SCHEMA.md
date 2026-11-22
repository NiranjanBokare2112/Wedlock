# Database Schema

## Development store
The current development implementation uses thread-safe in-memory dictionaries and is reset on restart.

## Required MongoDB collections
users, user_sessions, customer_profiles, vendor_profiles, vendor_staff, vendor_verifications, categories, category_attributes, listings, listing_media, listing_variants, inventory, service_packages, service_availability, wedding_projects, wedding_events, requirements, requirement_items, lead_matches, leads, quotations, conversations, messages, carts, orders, seller_orders, bookings, booking_holds, payments, refunds, commissions, settlements, reviews, wishlists, guest_lists, wedding_tasks, budget_items, subscriptions, promotions, notifications, support_tickets, disputes and audit_logs.

## Core rules
- Use MongoDB ObjectIds or UUIDs consistently.
- Use timestamps on every document.
- Use references for independently managed entities.
- Keep growing collections outside unbounded document arrays.
- Create indexes for category, city, status, listing, requirement and lead queries.
- Run inventory and booking changes atomically.
