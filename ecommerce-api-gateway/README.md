# E-commerce API Gateway + Authentication Service

Production-ready Node.js API gateway with built-in authentication.

## Features
- `/auth/register`, `/auth/verify-email`, `/auth/login`, and `/login`
- MySQL-backed users table with verified-email gating
- Redis-backed OTP storage and rate limiting
- JWT Bearer auth forwarded to downstream services as `x-user-id`
- Public-IP service routing via environment variables only
- Gateway health endpoint and upstream proxy support
- Password strength validation and bcrypt hashing

## Folder Structure

- [src/app.js](src/app.js)
- [src/routes/gatewayRoutes.js](src/routes/gatewayRoutes.js)
- [src/middleware/authMiddleware.js](src/middleware/authMiddleware.js)
- [src/middleware/rateLimiter.js](src/middleware/rateLimiter.js)
- [src/middleware/errorHandler.js](src/middleware/errorHandler.js)
- [src/middleware/validateRequest.js](src/middleware/validateRequest.js)
- [src/services/proxyService.js](src/services/proxyService.js)
- [src/config/serviceRegistry.js](src/config/serviceRegistry.js)
- [src/controllers/authController.js](src/controllers/authController.js)
- [src/routes/authRoutes.js](src/routes/authRoutes.js)
- [src/config/db.js](src/config/db.js)
- [src/config/redisClient.js](src/config/redisClient.js)
- [src/utils/emailSender.js](src/utils/emailSender.js)
- [.env](.env)
- [Dockerfile](Dockerfile)
- [package.json](package.json)

## Setup

1. Install dependencies:
```bash
npm install mysql2 redis jsonwebtoken bcryptjs nodemailer uuid
```

2. Configure environment:
```bash
cp .env .env.local
# edit .env (or .env.local and adapt loader if preferred)
```

3. Start service:
```bash
npm run dev
# or
npm start
```

Server runs on `PORT` (default `8080`).

## Environment Variables

Core:
- `PORT`
- `HOST`
- `MAX_PAYLOAD_SIZE`
- `PROXY_TIMEOUT_MS`

JWT:
- `JWT_SECRET` (min 32 chars required)
- `JWT_EXPIRES_IN`

MySQL:
- `DB_HOST`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`
- `DB_PORT`

Redis:
- `REDIS_URL` or `REDIS_HOST` / `REDIS_PORT` / `REDIS_PASSWORD`

Service URLs:
- `ORDER_SERVICE_URL` (example: `http://<order-service-ip>:5001`)
- `INVENTORY_SERVICE_URL` (example: `http://<inventory-service-ip>:5002`)

Circuit breaker:
- `CIRCUIT_BREAKER_FAILURE_THRESHOLD`
- `CIRCUIT_BREAKER_COOLDOWN_MS`

Email:
- `SMTP_HOST` (for Gmail: `smtp.gmail.com`)
- `SMTP_PORT` (for Gmail TLS upgrade: `587`)
- `SMTP_SECURE` (for Gmail on 587: `false`)
- `SMTP_USER` (your Gmail address)
- `SMTP_PASS` (Gmail App Password)
- `EMAIL_USER`
- `EMAIL_PASS`
- `EMAIL_HOST` (optional)
- `EMAIL_PORT` (optional)
- `EMAIL_SECURE` (optional)
- `EMAIL_SERVICE` (optional)

Token TTLs:
- `EMAIL_VERIFY_TOKEN_TTL_SECONDS`
- `PASSWORD_RESET_TOKEN_TTL_SECONDS`

Optional runtime reload:
- `ENABLE_ENV_RELOAD`
- `ENV_RELOAD_INTERVAL_MS`

## API Endpoints

### Auth
- `POST /auth/register`
- `POST /auth/verify-email`
- `POST /auth/login`
- `POST /login`

### Gateway
- `GET /health`
- `POST /api/v1/*` (JWT required)
- `POST /order/*` (JWT required)
- `POST /inventory/*` (JWT required)

## Request/Response Samples (curl)

Register:
```bash
curl -X POST http://<gateway-ip>:8080/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"Strong@123"}'
```

Verify email:
```bash
curl -X POST http://<gateway-ip>:8080/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","otp":"123456"}'
```

Login:
```bash
curl -X POST http://<gateway-ip>:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"Strong@123"}'
```

Direct gateway login:
```bash
curl -X POST http://<gateway-ip>:8080/login \
  -H "Content-Type: application/json" \
  -d '{"email":"customer@example.com","password":"StrongPassword123!"}'
```

Create order:
```bash
curl -X POST http://<gateway-ip>:8080/order/create-order \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <access-token>" \
  -d '{"userId":"u1","items":[{"sku":"sku-1","qty":1}]}'
```

Health:
```bash
curl http://<gateway-ip>:8080/health
```

## Error Handling Coverage
- `401`: missing/invalid/expired JWT
- `400`: invalid request bodies or weak passwords
- `429`: rate limit exceeded
- `503`: upstream unavailable/connection errors/circuit open
- `504`: upstream timeout
- `404`: unknown route
- `413`: payload too large (Express body limit)

## Distributed Networking Notes
- No hardcoded IPs.
- Set external service addresses in env (`http://<ip>:<port>`).
- MySQL and Redis credentials are required for secure remote deployment.
- Downstream services receive the authenticated user id via `x-user-id`.

## Docker

Build image:
```bash
docker build -t ecommerce-api-gateway .
```

Run container:
```bash
docker run --rm -p 8080:8080 --env-file .env ecommerce-api-gateway
```
