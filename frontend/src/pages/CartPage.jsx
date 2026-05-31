import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../contexts/CartContext";

function formatPrice(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(value);
}

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, cartTotal } = useCart();
  const navigate = useNavigate();

  return (
    <div className="home-container cart-page">
      <section className="cart-shell">
        <div className="cart-main">
          <div className="section-heading">
            <div>
              <p className="section-kicker">Your Cart</p>
              <h2>Shopping Cart</h2>
            </div>
          </div>

          {items.length === 0 ? (
            <div className="empty-cart">
              <h3>Your cart is empty</h3>
              <p>Add products from the home page to see them here.</p>
              <Link to="/" className="hero-action-btn">Continue Shopping</Link>
            </div>
          ) : (
            <div className="cart-list">
              {items.map((item) => (
                <article key={item.id} className="cart-item">
                  <div className={`cart-thumb ${item.accent}`}>
                    {item.image ? (
                      <img className="cart-thumb-image" src={item.image} alt={item.name} loading="lazy" />
                    ) : (
                      <span>{item.name?.slice(0, 1) || 'P'}</span>
                    )}
                  </div>

                  <div className="cart-item-content">
                    <h3>{item.name}</h3>
                    <p className="cart-price">{formatPrice(item.price)}</p>
                    <div className="qty-controls">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      >
                        -
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="cart-item-actions">
                    <strong>{formatPrice(item.price * item.quantity)}</strong>
                    <button type="button" className="ghost-btn" onClick={() => removeFromCart(item.id)}>
                      Remove
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        <aside className="cart-summary">
          <h3>Price Details</h3>
          <div className="summary-row">
            <span>Items Total</span>
            <strong>{formatPrice(cartTotal)}</strong>
          </div>
          <div className="summary-row">
            <span>Delivery</span>
            <strong>{formatPrice(99)}</strong>
          </div>
          <div className="summary-row summary-total">
            <span>Total Amount</span>
            <strong>{formatPrice(cartTotal + (items.length ? 99 : 0))}</strong>
          </div>
          <button
            type="button"
            className="buy-btn checkout-btn"
            disabled={!items.length}
            onClick={() => navigate("/checkout")}
          >
            Proceed to Checkout
          </button>
        </aside>
      </section>
    </div>
  );
}
