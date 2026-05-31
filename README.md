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

This repository is a student project demonstrating a microservices-based e-commerce platform built for a distributed computing course. The system separates responsibilities into services so the team can develop, test, and deploy components independently.

Team Responsibilities

- **Payment gateway:** Service integration and payment flow design (sandbox/test integrations with Stripe/PayPal). Handles payment requests, validations, and webhook processing.
- **Authentication:** User signup/login, session management, JWT-based auth, email verification, password reset, and role-based access control for admin vs. users.
- **Inventory:** Product catalog, stock management, seed data in `backend/data/`, endpoints for stock adjustments, and consistency when orders are placed.
- **API Gateway:** Request routing, authentication proxying, and aggregation of responses from backend services.

If you want, I can expand these sections with architecture diagrams, team member names and tasks, or add a CONTRIBUTING.md and CODE_OF_CONDUCT.
