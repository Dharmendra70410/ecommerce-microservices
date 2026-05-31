# E-commerce API Gateway - Code Explanation for Viva

This file explains how the gateway works, which functions are implemented, and what each one does. It is written in simple presentation-friendly language so you can use it for a viva or project explanation.

## 1) Overall Architecture

This project is a Node.js API gateway built with Express. It has two major responsibilities:

1. **Authentication service**
   - Register a user
   - Verify email with OTP
   - Login with JWT

2. **Gateway routing service**
   - Check health status
   - Protect routes using JWT
   - Forward requests to downstream services like order and inventory

The app starts from `src/app.js`, which loads middleware, connects to MySQL and Redis, then mounts the routes.

---

## 2) Startup Flow

### File: `src/app.js`

#### `bootstrap()`
This is the main startup function.

**What it does:**
- Calls `initDatabase()` to create the `users` table if it does not exist.
- Calls `connectRedis()` to connect the Redis client.
- Starts the Express server on the configured host and port.

**Why it is important:**
- It makes sure the database and cache are ready before the server begins accepting requests.
- It prevents the application from starting in a broken state.

#### Middleware used in `app.js`
- `helmet()` adds security-related HTTP headers.
- `cors()` allows cross-origin requests.
- `morgan('combined')` logs incoming requests.
- `express.json()` and `express.urlencoded()` parse request bodies.
- `sanitizeRequest` cleans suspicious input.
- `notFoundHandler` handles unknown routes.
- `errorHandler` returns a proper error response.

#### Route mounting
- `/auth` → authentication routes
- `/login` → direct gateway login route
- `/` → gateway and proxy routes

---

## 3) Authentication Routes

### File: `src/routes/authRoutes.js`

This file connects HTTP endpoints to validation, rate limiting, and controller functions.

#### `router.post('/register', ...)`
**Flow:**
1. `rateLimiter` limits repeated requests.
2. `registerValidation` checks email and password format.
3. `validateRequest` returns validation errors if any.
4. `authController.register` creates the account.

#### `router.post('/verify-email', ...)`
**Flow:**
1. `rateLimiter` protects the endpoint.
2. `verifyEmailValidation` checks email and OTP format.
3. `validateRequest` confirms the input is valid.
4. `authController.verifyEmail` verifies the OTP and activates the user.

#### `router.post('/login', ...)`
This route is also exposed at the gateway root path as `POST /login`.

**Flow:**
1. `rateLimiter` prevents abuse.
2. `loginValidation` checks the input.
3. `validateRequest` blocks invalid payloads.
4. `authController.login` checks credentials and returns a JWT.

---

## 4) Authentication Controller

### File: `src/controllers/authController.js`

This file contains the business logic for registration, email verification, and login.

#### `normalizeEmail(email)`
Converts email to lowercase and removes extra spaces.

**Purpose:**
- Ensures consistent email storage and lookup.
- Prevents duplicate accounts with different casing.

#### `requireJwtSecret()`
Checks whether `JWT_SECRET` exists and is at least 32 characters long.

**Purpose:**
- Ensures tokens are signed with a secure secret.
- Throws a server error if the secret is missing.

#### `createOtp()`
Generates a 6-digit OTP.

**Purpose:**
- Used during email verification after registration.

#### `register(req, res, next)`
This function creates a new user account.

**How it works:**
- Reads `email` and `password` from the request body.
- Rejects missing fields.
- Checks password strength using a regex.
- Looks in MySQL to see if the email already exists.
- Hashes the password using `bcrypt`.
- Inserts the user into the `users` table.
- Generates an OTP and stores it in Redis with a 15-minute expiry.
- Sends the OTP by email using `sendOtpEmail()`.

**Response:**
- Returns `201 Created` when registration succeeds.

#### `verifyEmail(req, res, next)`
This function confirms the OTP and marks the user as verified.

**How it works:**
- Reads `email` and `otp` from the request body.
- Checks if the OTP exists in Redis.
- Compares the stored OTP with the user-provided OTP.
- Updates the MySQL user record to set `is_verified = TRUE`.
- Deletes the OTP from Redis after success.

**Response:**
- Returns `200 OK` when email verification succeeds.

#### `login(req, res, next)`
This function authenticates the user and issues a JWT.

**How it works:**
- Reads `email` and `password`.
- Searches the user in MySQL.
- Rejects login if the email is not verified.
- Compares the password with the stored bcrypt hash.
- Creates a JWT token with the user id and email.

**Response:**
- Returns `200 OK` with `token` and `message`.

---

## 5) Input Validation and Sanitization

### File: `src/middleware/validateRequest.js`

This file contains request validation and sanitization logic.

#### `validateRequest(req, res, next)`
Checks the results of `express-validator`.

**Purpose:**
- If validation errors exist, the request is rejected with `400 Bad Request`.
- If there are no errors, the request continues.

#### `sanitizeValue(value)`
Recursively cleans input values.

**What it does:**
- Trims strings.
- Rejects suspicious patterns like script tags or SQL injection-like input.
- Processes arrays and nested objects recursively.

**Purpose:**
- Adds a basic security layer against unsafe input.

#### `sanitizeRequest(req, res, next)`
Applies sanitization to `body`, `query`, and `params`.

**Purpose:**
- Runs before routes so unsafe request content is blocked early.

#### Validation rules
- `registerValidation` → validates email and strong password
- `loginValidation` → validates email and password
- `verifyEmailValidation` → validates email and 6-digit OTP
- `forgotPasswordValidation` and `resetPasswordValidation` are prepared for future use

---

## 6) Rate Limiting

### File: `src/middleware/rateLimiter.js`

#### `rateLimiter(req, res, next)`
This middleware limits requests using Redis.

**How it works:**
- Uses the client IP as an identifier.
- Creates a Redis key per IP and time window.
- Increments the request count in Redis.
- Sets limit headers such as:
  - `X-RateLimit-Limit`
  - `X-RateLimit-Remaining`
  - `X-RateLimit-Reset`
- Returns `429 Too Many Requests` when the limit is exceeded.

**Purpose:**
- Prevents abuse and brute-force attacks.

---

## 7) JWT Authentication Middleware

### File: `src/middleware/authMiddleware.js`

#### `getJwtSecret()`
Loads and validates the JWT secret.

#### `authenticateToken(req, res, next)`
Protects private routes.

**How it works:**
- Reads the `Authorization` header.
- Checks for `Bearer <token>` format.
- Verifies the token with `jwt.verify()`.
- Extracts `userId` from the token payload.
- Stores the decoded token in `req.user`.
- Adds `x-user-id` to request headers so downstream services know the authenticated user.

**Purpose:**
- Ensures only logged-in users can access protected routes.
- Passes identity to downstream services in a simple way.

---

## 8) Gateway and Proxy Routes

### File: `src/routes/gatewayRoutes.js`

This file handles health checks and forwarding to backend services.

#### `protectedHandlers()`
Returns the middleware chain used on protected routes.

**Current chain:**
- `authenticateToken`
- `rateLimiter`

**Purpose:**
- Keeps route setup clean and reusable.

#### `forwardTo(serviceEnvKey)`
Creates a forwarding handler for a specific service.

**Purpose:**
- Used for routes like `/order` and `/inventory`.
- Sends the request to the correct downstream service.

#### `forwardByApiVersion(req, res, next)`
Forwards `/api/v1` requests to the correct service.

**How it works:**
- If the path starts with `/inventory`, it uses `INVENTORY_SERVICE_URL`.
- Otherwise, it uses `ORDER_SERVICE_URL`.

#### `router.get('/health', ...)`
Returns gateway health information.

**It includes:**
- Gateway status
- Timestamp
- Redis health from `getRedisHealth()`
- Service URLs from `getAllServiceUrls()`

#### Protected proxy routes
- `/api/v1` → forwarded dynamically
- `/order` → forwarded to order service
- `/inventory` → forwarded to inventory service

---

## 9) Proxy Service

### File: `src/services/proxyService.js`

This is one of the most important files because it forwards requests to other services.

#### `CircuitBreaker` class
This class protects the gateway from repeated downstream failures.

**Properties:**
- `state` → `CLOSED`, `OPEN`, or `HALF_OPEN`
- `failureCount` → number of recent failures
- `nextAttempt` → when to try again
- `failureThreshold` → failure limit before opening the breaker
- `cooldownMs` → wait time before retrying

**Methods:**
- `canRequest()` → checks whether requests are allowed
- `onSuccess()` → resets failure tracking
- `onFailure()` → increases failure count and opens the breaker when needed

#### `getBreaker(serviceName)`
Returns a circuit breaker instance for a specific service.

**Purpose:**
- Each downstream service gets its own breaker.

#### `filterResponseHeaders(headers)`
Removes unsafe hop-by-hop headers before sending responses back to clients.

**Purpose:**
- Keeps proxy responses clean and safe.

#### Cache helpers
- `cacheGet(key)` → reads from Redis
- `cacheSet(key, value, ttlSeconds)` → writes to Redis
- `cacheSetNx(key, value, ttlSeconds)` → writes only if the key does not already exist
- `cacheDel(key)` → deletes a Redis key

#### `proxyToService(req, res, options)`
This is the main proxy function.

**How it works:**
- Reads the target service URL from `serviceRegistry`.
- Checks the circuit breaker before forwarding.
- Optionally supports idempotency through Redis.
- Copies request headers and forwards the original HTTP method, body, and query.
- Uses `axios` to call the downstream service.
- Records success or failure in the circuit breaker.
- Returns the downstream response to the client.
- Handles timeout and connection failures with proper status codes.

**Important behavior:**
- `504` for timeout
- `503` for service unavailable or circuit open
- Caches idempotent responses for 24 hours when enabled

---

## 10) Database Setup

### File: `src/config/db.js`

#### `requireDatabaseConfig()`
Validates the MySQL environment variables.

**Purpose:**
- Ensures `DB_HOST`, `DB_USER`, `DB_PASSWORD`, and `DB_NAME` are available.
- Throws an error if configuration is incomplete.

#### `pool`
Creates a MySQL connection pool.

**Purpose:**
- Improves performance by reusing connections.

#### `initDatabase()`
Creates the `users` table if it does not exist.

**Users table fields:**
- `id`
- `email`
- `password_hash`
- `is_verified`
- `created_at`

**Purpose:**
- Ensures the application has the needed database structure on startup.

---

## 11) Redis Setup

### File: `src/config/redisClient.js`

#### `buildRedisOptions()`
Builds Redis connection settings from environment variables.

**Supports:**
- `REDIS_URL`
- or `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`

#### `redisClient`
Creates the Redis client instance.

**Purpose:**
- Used for OTP storage, rate limiting, health checks, and idempotency support.

#### `connectRedis()`
Connects the Redis client only once and reuses the promise.

#### `getRedisHealth()`
Checks whether Redis is ready and responding.

**Purpose:**
- Used by `/health` to show cache status.

---

## 12) Service Registry

### File: `src/config/serviceRegistry.js`

#### `reloadEnvFile()`
Reloads values from `.env` when runtime reload is enabled.

#### `getRuntimeEnv()`
Returns the environment values, optionally reloading them from `.env`.

#### `getServiceUrl(serviceEnvKey)`
Gets the downstream service URL from environment variables.

**Purpose:**
- Used by proxy code to locate order and inventory services.

#### `getAllServiceUrls()`
Returns both configured service URLs for health reporting.

---

## 13) Email Utility

### File: `src/utils/emailSender.js`

#### `createTransporter()`
Creates and caches the Nodemailer transporter.

**Purpose:**
- Connects to the email provider using `EMAIL_USER`, `EMAIL_PASS`, and optional host/service settings.

#### `sendOtpEmail({ to, otp })`
Sends the verification email containing the OTP.

**Purpose:**
- Used after registration to verify the user’s email address.

---

## 14) Request Flow Example

### Register flow
1. Client sends `POST /auth/register`
2. `rateLimiter` checks traffic
3. `registerValidation` validates input
4. `validateRequest` blocks invalid data
5. `register()` stores the user in MySQL
6. OTP is saved in Redis
7. Email with OTP is sent

### Verify email flow
1. Client sends `POST /auth/verify-email`
2. Input is validated
3. OTP is checked from Redis
4. MySQL user record is updated
5. OTP key is removed

### Login flow
1. Client sends `POST /auth/login`
2. Input is validated
3. User is found in MySQL
4. Password is checked with bcrypt
5. JWT token is returned

### Protected order/inventory flow
1. Client sends a request with Bearer token
2. `authenticateToken` verifies the token
3. `x-user-id` is attached
4. `rateLimiter` applies request control
5. `proxyToService()` forwards the request to the correct backend

---

## 15) Viva Short Summary

If you need a short explanation in the viva, you can say:

> This project is an Express-based API gateway. It handles user registration, OTP email verification, and login with JWT. It also protects downstream order and inventory services by verifying tokens, rate limiting traffic, and forwarding requests using a proxy service. MySQL stores users, Redis stores OTPs and rate-limit counters, and Nodemailer sends verification emails.

---

## 16) Main Files to Mention

- `src/app.js` → server startup and middleware setup
- `src/routes/authRoutes.js` → auth endpoints
- `src/controllers/authController.js` → register, verify email, login logic
- `src/middleware/validateRequest.js` → validation and sanitization
- `src/middleware/authMiddleware.js` → JWT protection
- `src/middleware/rateLimiter.js` → rate limiting
- `src/routes/gatewayRoutes.js` → health and proxy routes
- `src/services/proxyService.js` → downstream forwarding and circuit breaker
- `src/config/db.js` → MySQL setup
- `src/config/redisClient.js` → Redis setup
- `src/config/serviceRegistry.js` → service URL lookup
- `src/utils/emailSender.js` → OTP email sending
