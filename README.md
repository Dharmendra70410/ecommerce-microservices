# Ecommerce Microservices

Minimal example project demonstrating a small e-commerce system split into services:

- `backend/` — Node.js product/order/user service
- `ecommerce-api-gateway/` — API gateway service
- `frontend/` — React + Vite frontend

Getting started

1. Copy environment files and fill secrets (do NOT commit `.env.local`):

   - `backend/.env.example` -> `backend/.env`
   - `frontend/.env.example` -> `frontend/.env.local`

2. Local (Node) — from project root:

```powershell
cd backend
npm install
npm run dev

cd ../frontend
npm install
npm run dev
```

Or run everything with Docker Compose:

```powershell
docker compose up --build
```

Notes

- `.env.local` files are excluded by `.gitignore` — keep secrets out of git.
- Improve this README with deployment, architecture diagrams, and CI later.

License

MIT
About

This repository implements an e-commerce website built as a microservices system. The application runs across five services (nodes) that together provide the full shopping experience and business logic.

My Contribution

I worked on the frontend user experience and the customer flow of the e-commerce platform. My part focuses on building the interactive UI and the core shopping journey so users can browse products, manage their cart, and complete authentication securely.

Highlights of my work:

- Built the product listing UI with reusable cards for showing items clearly and attractively.
- Implemented the add-to-cart flow and cart state management so users can save products while browsing.
- Created the cart page with quantity updates, remove-item actions, and total calculation.
- Developed the checkout flow so users can review their selected items before payment.
- Built the login and signup flow with OTP-based email verification.
- Added password reset / forgot password screens to complete the authentication journey.
- Connected the frontend screens with the backend API layer so the team could integrate the service-based architecture properly.

Services

- `frontend` — React + Vite user interface that communicates with the API Gateway and handles cart, checkout, and client-side validation.
- `ecommerce-api-gateway` — Central gateway that routes requests to backend services, performs request aggregation, and proxies authentication.
- `authentication` (backend auth responsibilities in `backend/`) — Handles user signup/login, JWT issuance and verification, email verification, password reset, and role-based access control.
- `payment` (payment responsibilities in `backend/`) — Manages payment flows and integrations (sandbox Stripe/PayPal), payment validation, and webhook handling.
- `inventory` (product responsibilities in `backend/`) — Manages product catalog, stock levels, seed data in `backend/data/`, and updates stock on order placement.

Team Responsibilities

- **Frontend:** Build and maintain the user-facing UI, card-based product display, add-to-cart flow, cart page, checkout flow, and client-side form validation.
- **API Gateway:** Route and aggregate requests, enforce API-level authentication and rate-limiting, and act as the single entry point for clients.
- **Authentication:** Implement secure user authentication and authorization, JWT flows, email verification, and account management.
- **Payment Gateway:** Integrate with payment providers (sandbox), implement payment processing, handle payment webhooks, and ensure idempotency and security for transactions.
- **Inventory:** Implement product catalog APIs, manage stock updates and consistency when orders are placed, and provide endpoints for admin stock adjustments.

Notes

- The repo layout reflects the split of responsibilities; some backend code for auth/payment/inventory lives under `backend/` while the gateway and frontend are in their own folders.
- `.env.local` files are excluded by `.gitignore` — keep secrets and API keys out of git.
- I can add a diagram, map team member names to responsibilities, or create `CONTRIBUTING.md` and `ARCHITECTURE.md` if you want.
