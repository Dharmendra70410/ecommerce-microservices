import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";
import { initiateMockPayment, placeOrder, saveUserOrder } from "../services/api";

const RAZORPAY_TEST_KEY = String(import.meta.env.VITE_RAZORPAY_TEST_KEY || "").trim();

function formatPrice(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(value);
}

function toOrderPayload(items) {
  return items.map((item) => ({
    productId: item.id,
    quantity: item.quantity
  }));
}

function toStoredOrderItems(items) {
  return items.map((item) => ({
    id: item.id,
    name: item.name,
    quantity: item.quantity,
    price: item.price,
    image: item.image || "",
    accent: item.accent || ""
  }));
}

function loadRazorpayCheckoutScript() {
  if (window.Razorpay) {
    return Promise.resolve(true);
  }

  return new Promise((resolve) => {
    const existingScript = document.querySelector("script[data-razorpay='checkout']");
    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(true), { once: true });
      existingScript.addEventListener("error", () => resolve(false), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.dataset.razorpay = "checkout";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

async function runRazorpayTestCheckout({ amount, user }) {
  if (!RAZORPAY_TEST_KEY) {
    throw new Error("Missing VITE_RAZORPAY_TEST_KEY. Add a Razorpay test key to use this option.");
  }

  const isScriptLoaded = await loadRazorpayCheckoutScript();
  if (!isScriptLoaded || !window.Razorpay) {
    throw new Error("Unable to load Razorpay checkout script.");
  }

  return new Promise((resolve, reject) => {
    const instance = new window.Razorpay({
      key: RAZORPAY_TEST_KEY,
      amount: Math.round(Number(amount) * 100),
      currency: "INR",
      name: "Distributed Commerce",
      description: "Test payment only. No real money is charged.",
      prefill: {
        name: user?.username || "Test User",
        email: user?.email || ""
      },
      theme: {
        color: "#ff8b3d"
      },
      handler: (response) => {
        resolve({
          status: "success",
          gateway: "razorpay",
          transactionId: response.razorpay_payment_id || "rzp_test_txn"
        });
      },
      modal: {
        ondismiss: () => reject(new Error("Razorpay checkout was closed before completing payment."))
      }
    });

    instance.on("payment.failed", (event) => {
      reject(new Error(event?.error?.description || "Razorpay test payment failed."));
    });

    instance.open();
  });
}

export default function PaymentPage() {
  const { items, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [method, setMethod] = useState("upi");
  const [upiId, setUpiId] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [paymentState, setPaymentState] = useState("idle");
  const [paymentStatusMessage, setPaymentStatusMessage] = useState("");

  const deliveryFee = items.length ? 99 : 0;
  const payable = cartTotal + deliveryFee;

  const paymentOptions = useMemo(
    () => [
      { id: "upi", label: "UPI" },
      { id: "card", label: "Card" },
      { id: "razorpay", label: "Razorpay (Test)" }
    ],
    []
  );

  const validatePaymentInput = () => {
    if (!items.length) {
      throw new Error("Your cart is empty. Add products before making payment.");
    }

    if (method === "upi") {
      const upiRegex = /^[a-zA-Z0-9._-]{2,}@[a-zA-Z]{2,}$/;
      if (!upiRegex.test(upiId.trim())) {
        throw new Error("Please enter a valid UPI ID (example: user@bank).");
      }
    }

    if (method === "card") {
      const normalizedNumber = cardNumber.replace(/\s+/g, "");
      if (!cardName.trim()) {
        throw new Error("Card holder name is required.");
      }
      if (!/^\d{16}$/.test(normalizedNumber)) {
        throw new Error("Enter a valid 16-digit test card number.");
      }
      if (!/^(0[1-9]|1[0-2])\/(\d{2})$/.test(cardExpiry)) {
        throw new Error("Use expiry in MM/YY format.");
      }
      if (!/^\d{3}$/.test(cardCvv)) {
        throw new Error("CVV must be 3 digits.");
      }
    }
  };

  const handlePayAndPlaceOrder = async () => {
    setError("");
    setSuccess("");
    setPaymentState("idle");
    setPaymentStatusMessage("");
    setIsProcessing(true);

    try {
      validatePaymentInput();

      const paymentRequest = {
        amount: payable,
        currency: "INR",
        method,
        isTestPayment: true,
        notes: {
          email: user?.email || "",
          items: items.length
        }
      };

      let paymentResult;

      if (method === "razorpay") {
        paymentResult = await runRazorpayTestCheckout({ amount: payable, user });
      } else {
        paymentResult = await initiateMockPayment(paymentRequest);
      }

      setPaymentState("processing");
      setPaymentStatusMessage("Payment is processing. Sending order to gateway and waiting for order service response...");

      const transactionId = paymentResult?.transactionId || paymentResult?.id || "TEST_TXN";

      await placeOrder(toOrderPayload(items));
      saveUserOrder(user, {
        status: "Order confirmed",
        total: payable,
        paymentMethod: method,
        transactionId,
        items: toStoredOrderItems(items)
      });
      clearCart();

      setSuccess(`Payment successful (${transactionId}). Order completed successfully.`);
      setPaymentStatusMessage(`Payment successful (${transactionId}). Your order was confirmed by the backend services.`);
      setPaymentState("success");
    } catch (err) {
      const statusCode = err.response?.status;
      let message;

      if (statusCode === 401) {
        message = "Session expired or unauthorized. Please login again.";
      } else if (statusCode === 503) {
        message = "Order failed because downstream service is temporarily unavailable.";
      } else {
        message = err.response?.data?.message || err.message || "Order failed after payment attempt.";
      }

      setError(message);
      setPaymentStatusMessage(message);
      setPaymentState("failed");
    } finally {
      setIsProcessing(false);
    }
  };

  const closeStatusWindow = () => {
    setPaymentState("idle");
    setPaymentStatusMessage("");
  };

  return (
    <div className="home-container checkout-page">
      <section className="products-section">
        <div className="section-heading">
          <div>
            <p className="section-kicker">Payment</p>
            <h2>Choose Payment Method</h2>
          </div>
          <p className="section-note">Fake payment flow for testing. No real money involved.</p>
        </div>

        {error ? <div className="error-message">{error}</div> : null}
        {success ? <div className="success-message">{success}</div> : null}

        {items.length === 0 ? (
          <div>
            <p className="section-note" style={{ textAlign: "left" }}>No items found for payment. Go to cart and add products first.</p>
            <div className="checkout-actions" style={{ marginTop: "1rem" }}>
              <button type="button" className="buy-btn" onClick={() => navigate("/")}>Continue Shopping</button>
            </div>
          </div>
        ) : (
          <div className="payment-layout">
            <div className="payment-box">
              <div className="payment-method-tabs">
                {paymentOptions.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    className={`payment-method-tab ${method === option.id ? "payment-method-tab-active" : ""}`}
                    onClick={() => setMethod(option.id)}
                    disabled={isProcessing}
                  >
                    {option.label}
                  </button>
                ))}
              </div>

              {method === "upi" ? (
                <div className="form-group">
                  <label htmlFor="upiId">UPI ID</label>
                  <input
                    id="upiId"
                    type="text"
                    placeholder="name@bank"
                    value={upiId}
                    onChange={(event) => setUpiId(event.target.value)}
                    disabled={isProcessing}
                  />
                </div>
              ) : null}

              {method === "card" ? (
                <>
                  <div className="form-group">
                    <label htmlFor="cardName">Card Holder Name</label>
                    <input
                      id="cardName"
                      type="text"
                      placeholder="Full name"
                      value={cardName}
                      onChange={(event) => setCardName(event.target.value)}
                      disabled={isProcessing}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="cardNumber">Card Number (Test)</label>
                    <input
                      id="cardNumber"
                      type="text"
                      inputMode="numeric"
                      maxLength={19}
                      placeholder="4111111111111111"
                      value={cardNumber}
                      onChange={(event) => setCardNumber(event.target.value)}
                      disabled={isProcessing}
                    />
                  </div>
                  <div className="payment-inline-fields">
                    <div className="form-group">
                      <label htmlFor="cardExpiry">Expiry</label>
                      <input
                        id="cardExpiry"
                        type="text"
                        maxLength={5}
                        placeholder="MM/YY"
                        value={cardExpiry}
                        onChange={(event) => setCardExpiry(event.target.value)}
                        disabled={isProcessing}
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="cardCvv">CVV</label>
                      <input
                        id="cardCvv"
                        type="password"
                        inputMode="numeric"
                        maxLength={3}
                        placeholder="123"
                        value={cardCvv}
                        onChange={(event) => setCardCvv(event.target.value)}
                        disabled={isProcessing}
                      />
                    </div>
                  </div>
                </>
              ) : null}

              {method === "razorpay" ? (
                <div className="payment-note-box">
                  <p>Razorpay test mode enabled.</p>
                  <p>Use test credentials only. No real-money transaction is made.</p>
                  {!RAZORPAY_TEST_KEY ? <p>Missing VITE_RAZORPAY_TEST_KEY in frontend env.</p> : null}
                </div>
              ) : null}

              <div className="checkout-actions">
                <button type="button" className="ghost-btn" onClick={() => navigate("/checkout")} disabled={isProcessing}>
                  Back to Checkout
                </button>
                <button type="button" className="buy-btn" onClick={handlePayAndPlaceOrder} disabled={isProcessing}>
                  {isProcessing ? "Processing..." : `Pay ${formatPrice(payable)} & Place Order`}
                </button>
              </div>
            </div>

            <aside className="payment-summary-box">
              <h3>Order Summary</h3>
              <div className="summary-row">
                <span>Items Total</span>
                <strong>{formatPrice(cartTotal)}</strong>
              </div>
              <div className="summary-row">
                <span>Delivery</span>
                <strong>{formatPrice(deliveryFee)}</strong>
              </div>
              <div className="summary-row summary-total">
                <span>Payable</span>
                <strong>{formatPrice(payable)}</strong>
              </div>
              <p className="payment-summary-meta">Method selected: {paymentOptions.find((option) => option.id === method)?.label}</p>
            </aside>
          </div>
        )}
      </section>

      {paymentState !== "idle" ? (
        <div className="payment-status-overlay" role="dialog" aria-modal="true" aria-live="polite">
          <div className="payment-status-window">
            <p className="section-kicker">Payment Status</p>
            {paymentState === "processing" ? <h3>Payment is processing</h3> : null}
            {paymentState === "success" ? <h3>Payment Successful</h3> : null}
            {paymentState === "failed" ? <h3>Order Failed</h3> : null}
            <p>{paymentStatusMessage}</p>

            <div className="checkout-actions">
              {paymentState === "success" ? (
                <button type="button" className="buy-btn" onClick={() => navigate("/")}>Continue Shopping</button>
              ) : null}
              {paymentState === "failed" ? (
                <button type="button" className="buy-btn" onClick={handlePayAndPlaceOrder} disabled={isProcessing}>Try Again</button>
              ) : null}
              <button type="button" className="ghost-btn" onClick={closeStatusWindow} disabled={isProcessing}>Close</button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
