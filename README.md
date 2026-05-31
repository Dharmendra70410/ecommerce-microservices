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
