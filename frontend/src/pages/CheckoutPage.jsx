import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../contexts/CartContext";

function formatPrice(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(value);
}

export default function CheckoutPage() {
  const { items, cartTotal } = useCart();
  const navigate = useNavigate();
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (!notice) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      navigate("/payment");
    }, 900);

    return () => window.clearTimeout(timeoutId);
  }, [notice, navigate]);

  const handleProceedToPayment = () => {
    setNotice("Redirecting to payment methods...");
  };

  return (
    <div className="home-container checkout-page">
      <section className="products-section">
        <div className="section-heading">
          <div>
            <p className="section-kicker">Checkout</p>
            <h2>Review and Place Order</h2>
          </div>
        </div>

        {notice ? <div className="success-message">{notice}</div> : null}

        {items.length === 0 ? (
          <div>
            <p className="section-note">No items in checkout. Add products first.</p>
            <div className="checkout-actions" style={{ marginTop: "1rem" }}>
              <button type="button" className="buy-btn" onClick={() => navigate("/")}>Continue Shopping</button>
            </div>
          </div>
        ) : (
          <>
            <div className="checkout-list">
              {items.map((item) => (
                <div key={item.id} className="checkout-row">
                  <span className="checkout-item-meta">
                    <span className={`checkout-thumb ${item.accent}`}>
                      {item.image ? <img src={item.image} alt={item.name} loading="lazy" /> : item.name?.slice(0, 1) || 'P'}
                    </span>
                    <span>{item.name} x {item.quantity}</span>
                  </span>
                  <strong>{formatPrice(item.price * item.quantity)}</strong>
                </div>
              ))}
            </div>

            <div className="checkout-total">
              <span>Total</span>
              <strong>{formatPrice(cartTotal + 99)}</strong>
            </div>

            <div className="checkout-actions">
              <button type="button" className="ghost-btn" onClick={() => navigate("/cart")}>Back to Cart</button>
              <button type="button" className="buy-btn" onClick={handleProceedToPayment}>
                Continue to Payment
              </button>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
  