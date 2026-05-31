import axios from "axios";

const baseURL = import.meta.env.VITE_API_GATEWAY_URL || "http://localhost:8080";
const timeout = Number(import.meta.env.VITE_API_TIMEOUT_MS) || 15000;
const catalogBaseURL = import.meta.env.VITE_PRODUCTS_API_URL || "http://localhost:8080";

const client = axios.create({
  baseURL,
  timeout
});

const catalogClient = axios.create({
  baseURL: catalogBaseURL,
  timeout
});

function resolveImageUrl(value) {
  const raw = String(value || "").trim();
  if (!raw) {
    return "";
  }

  if (/^(data:|blob:|https?:\/\/)/i.test(raw)) {
    return raw;
  }

  const gatewayOrigin = (() => {
    try {
      return new URL(baseURL, window.location.origin).origin;
    } catch (_error) {
      return window.location.origin;
    }
  })();

  return raw.startsWith("/") ? `${gatewayOrigin}${raw}` : `${gatewayOrigin}/${raw}`;
}

client.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken") || localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

async function safeGet(path, fallbackValue) {
  try {
    const { data } = await client.get(path);
    return data;
  } catch (error) {
    return fallbackValue;
  }
}

export async function getOrders() {
  const data = await safeGet("/orders", []);
  return Array.isArray(data) ? data : data.orders || [];
}

export async function placeOrder(items) {
  const toGatewayProductId = (value) => {
    const raw = String(value ?? "").trim();
    const direct = Number(raw);
    if (Number.isFinite(direct) && direct > 0) {
      return direct;
    }

    const prodMatch = /^PROD-(\d+)$/i.exec(raw);
    if (prodMatch) {
      return Number(prodMatch[1]);
    }

    return raw;
  };

  const normalizedItems = Array.isArray(items)
    ? items.map((item) => ({
        productId: toGatewayProductId(item.productId),
        quantity: Number(item.quantity)
      }))
    : [];

  if (!normalizedItems.length) {
    throw new Error("At least one order item is required");
  }

  const { data } = await client.post("/order", normalizedItems);
  return data;
}

function getOrderStorageKey(user) {
  const identifier = String(user?.id || user?.email || user?.username || "guest").trim().toLowerCase();
  return `userOrders:${identifier}`;
}

export function getStoredUserOrders(user) {
  try {
    const raw = localStorage.getItem(getOrderStorageKey(user));
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (_error) {
    return [];
  }
}

export function saveUserOrder(user, order) {
  const currentOrders = getStoredUserOrders(user);
  const nextOrders = [
    {
      id: order.id || order.orderId || order.transactionId || `order_${Date.now()}`,
      status: order.status || "Order confirmed",
      createdAt: order.createdAt || new Date().toISOString(),
      total: Number(order.total) || 0,
      paymentMethod: order.paymentMethod || "unknown",
      transactionId: order.transactionId || "",
      items: Array.isArray(order.items) ? order.items : []
    },
    ...currentOrders
  ];

  localStorage.setItem(getOrderStorageKey(user), JSON.stringify(nextOrders));
  return nextOrders;
}

export function getOrderStatusSnapshot(order, now = Date.now()) {
  const stages = ["Processing", "Order confirmed", "Delivered"];
  const createdAtMs = Number(new Date(order?.createdAt || Date.now()));
  const ageMs = Math.max(0, now - createdAtMs);

  let activeStageIndex = 1;

  if (ageMs < 60 * 1000) {
    activeStageIndex = 0;
  } else if (ageMs >= 5 * 60 * 1000) {
    activeStageIndex = 2;
  }

  const statusLabel = stages[activeStageIndex];

  return {
    statusLabel,
    activeStageIndex,
    stages: stages.map((stage, index) => ({
      label: stage,
      completed: index < activeStageIndex,
      active: index === activeStageIndex
    }))
  };
}

export async function initiateMockPayment(payload) {
  const endpointCandidates = [
    "/payment/mock",
    "/payments/mock",
    "/api/v1/payment/mock"
  ];

  let lastError = null;

  for (const endpoint of endpointCandidates) {
    try {
      const { data } = await client.post(endpoint, payload);
      return data;
    } catch (error) {
      if (error.response?.status === 404) {
        lastError = error;
        continue;
      }
      throw error;
    }
  }

  if (lastError) {
    throw new Error("Mock payment endpoint is not available on the gateway.");
  }

  throw new Error("Unable to process mock payment right now. Please try again.");
}

export async function getSystemHealth() {
  return safeGet("/health", {
    gateway: "unknown",
    orderService: "unknown",
    inventoryService: "unknown",
    paymentWorker: "unknown",
    redis: "unknown",
    updatedAt: new Date().toISOString()
  });
}

export async function getLogs() {
  const data = await safeGet("/logs", []);
  return Array.isArray(data) ? data : data.logs || [];
}

function normalizeBackendProducts(response) {
  const items = response?.products;
  if (!Array.isArray(items)) {
    return [];
  }

  return items.map((item) => {
    const price = Number(item.price) || 0;
    const mrp = Math.max(Number(item.mrp) || 0, price);
    const discount = Math.max(0, Math.round(((mrp - price) / Math.max(1, mrp)) * 100));
    const image = resolveImageUrl(item.images?.[0] || item.image || item.imageUrl || item.thumbnail);

    return {
      id: String(item.productId || item.id || item._id),
      name: item.name || "Untitled Product",
      categoryName: item.category || "General",
      brand: item.brand || "Generic",
      image,
      price,
      mrp,
      rating: Number(item.ratingAverage) || 0,
      reviews: Number(item.ratingCount) || 0,
      discount,
      stock: Number(item.stock) || 0
    };
  });
}

export async function getCatalogProducts() {
  try {
    const { data } = await catalogClient.get("/products?limit=200");
    const products = normalizeBackendProducts(data);
    if (products.length) {
      return products;
    }
  } catch (error) {
    // Fall through to empty response.
  }

  return [];
}

export async function loginUser(credentials) {
  const { data } = await client.post("/auth/login", credentials);
  return data;
}

export async function signupUser(payload) {
  const { data } = await client.post("/auth/register", payload);
  return data;
}

export async function verifyEmail(payload) {
  try {
    const { data } = await client.post("/auth/verify-email", payload);
    return data;
  } catch (error) {
    // Compatibility fallback for deployments exposing verify endpoint at root path.
    if (error.response?.status === 404) {
      const { data } = await client.post("/verify-email", payload);
      return data;
    }
    throw error;
  }
}

export async function resendVerificationOtp(payload) {
  const endpointCandidates = [
    "/auth/resend-otp",
    "/auth/resend-verification-otp",
    "/auth/resend-email-otp",
    "/resend-otp"
  ];

  let lastError = null;

  for (const endpoint of endpointCandidates) {
    try {
      const { data } = await client.post(endpoint, payload);
      return data;
    } catch (error) {
      if (error.response?.status === 404) {
        lastError = error;
        continue;
      }
      throw error;
    }
  }

  if (lastError) {
    throw new Error("Resend OTP endpoint is not available on the gateway.");
  }

  throw new Error("Unable to resend OTP right now. Please try again.");
}

export async function forgotPassword(payload) {
  const endpointCandidates = [
    "/auth/forgot-password",
    "/forgot-password",
    "/api/auth/forgot-password",
    "/auth/forgotPassword",
    "/forgotPassword"
  ];

  let lastError = null;

  for (const endpoint of endpointCandidates) {
    try {
      const { data } = await client.post(endpoint, payload);
      return data;
    } catch (error) {
      if (error.response?.status === 404) {
        lastError = error;
        continue;
      }
      throw error;
    }
  }

  if (lastError) {
    throw new Error("Forgot password is not available on the gateway yet. Ask the gateway team to add the endpoint.");
  }

  throw new Error("Unable to process forgot password right now. Please try again.");
}

export async function resetPassword(payload) {
  const endpointCandidates = [
    "/auth/reset-password",
    "/reset-password",
    "/api/auth/reset-password",
    "/auth/resetPassword",
    "/resetPassword"
  ];

  let lastError = null;

  for (const endpoint of endpointCandidates) {
    try {
      const { data } = await client.post(endpoint, payload);
      return data;
    } catch (error) {
      if (error.response?.status === 404) {
        lastError = error;
        continue;
      }
      throw error;
    }
  }

  if (lastError) {
    throw new Error("Reset password is not available on the gateway yet. Ask the gateway team to add the endpoint.");
  }

  throw new Error("Unable to reset password right now. Please try again.");
}

export function getGatewayBaseUrl() {
  return baseURL;
}
