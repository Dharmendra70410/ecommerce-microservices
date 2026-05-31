import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getOrderStatusSnapshot, getStoredUserOrders } from '../services/api';

function formatPrice(value) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(value || 0);
}

export default function UserOrdersPage() {
  const { user } = useAuth();
  const orders = useMemo(() => getStoredUserOrders(user), [user]);
  const [selectedOrderId, setSelectedOrderId] = useState(() => orders[0]?.id || null);

  const selectedOrder = useMemo(
    () => orders.find((order) => order.id === selectedOrderId) || null,
    [orders, selectedOrderId]
  );

  return (
    <div className="home-container">
      <section className="panel profile-panel">
        <div className="panel-head">
          <div>
            <h2>My Orders</h2>
            <span>Track your confirmed orders</span>
          </div>
          <Link to="/profile" className="ghost-btn">Back to Profile</Link>
        </div>

        {orders.length === 0 ? (
          <div className="catalog-empty">
            <h3>No orders yet</h3>
            <p>Your confirmed orders will appear here after payment success.</p>
          </div>
        ) : (
          <div className="profile-orders-list">
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} onTrack={() => setSelectedOrderId(order.id)} />
            ))}
          </div>
        )}
      </section>

      {selectedOrder ? (
        <OrderTrackerModal
          order={selectedOrder}
          onClose={() => setSelectedOrderId(null)}
        />
      ) : null}
    </div>
  );
}

function OrderCard({ order, onTrack }) {
  const snapshot = getOrderStatusSnapshot(order);

  return (
    <article className="profile-order-card">
      <div className="profile-order-top">
        <div>
          <p>Order ID</p>
          <strong>{order.id}</strong>
        </div>
        <span className={`status-badge status-${snapshot.statusLabel.toLowerCase().replace(/\s+/g, '-')}`}>
          {snapshot.statusLabel}
        </span>
      </div>

      <div className="order-timeline">
        {snapshot.stages.map((stage) => (
          <div key={stage.label} className={`order-timeline-step ${stage.completed ? 'order-timeline-step-completed' : ''} ${stage.active ? 'order-timeline-step-active' : ''}`}>
            <span className="order-timeline-dot" />
            <span>{stage.label}</span>
          </div>
        ))}
      </div>

      <div className="profile-order-meta">
        <span>{new Date(order.createdAt).toLocaleString()}</span>
        <span>{order.paymentMethod || 'unknown'}</span>
        <span>{order.transactionId || 'test_txn'}</span>
      </div>

      <div className="profile-order-summary">
        <strong>{formatPrice(order.total)}</strong>
        <p>{order.items?.length || 0} item{(order.items?.length || 0) === 1 ? '' : 's'}</p>
      </div>

      <div className="profile-order-items">
        {order.items?.map((item) => (
          <div key={`${order.id}-${item.id}`} className="profile-order-item">
            <span>{item.name}</span>
            <span>x {item.quantity}</span>
            <strong>{formatPrice(item.price * item.quantity)}</strong>
          </div>
        ))}
      </div>

      <div className="checkout-actions" style={{ justifyContent: 'flex-start', marginTop: '0.9rem' }}>
        <button type="button" className="buy-btn" onClick={onTrack}>
          Track Order
        </button>
      </div>
    </article>
  );
}

function OrderTrackerModal({ order, onClose }) {
  const snapshot = getOrderStatusSnapshot(order);

  return (
    <div className="payment-status-overlay" role="dialog" aria-modal="true" aria-live="polite">
      <div className="payment-status-window order-tracker-window">
        <div className="panel-head" style={{ marginBottom: '0.75rem' }}>
          <div>
            <p className="section-kicker">Order Tracker</p>
            <h3 style={{ margin: 0 }}>Live status overview</h3>
          </div>
          <button type="button" className="ghost-btn" onClick={onClose}>Close</button>
        </div>

        <div className="profile-order-top">
          <div>
            <p>Order ID</p>
            <strong>{order.id}</strong>
          </div>
          <span className={`status-badge status-${snapshot.statusLabel.toLowerCase().replace(/\s+/g, '-')}`}>
            {snapshot.statusLabel}
          </span>
        </div>

        <div className="order-timeline">
          {snapshot.stages.map((stage) => (
            <div key={stage.label} className={`order-timeline-step ${stage.completed ? 'order-timeline-step-completed' : ''} ${stage.active ? 'order-timeline-step-active' : ''}`}>
              <span className="order-timeline-dot" />
              <span>{stage.label}</span>
            </div>
          ))}
        </div>

        <div className="profile-order-meta">
          <span>{new Date(order.createdAt).toLocaleString()}</span>
          <span>{order.paymentMethod || 'unknown'}</span>
          <span>{order.transactionId || 'test_txn'}</span>
        </div>

        <div className="profile-order-summary">
          <strong>{formatPrice(order.total)}</strong>
          <p>{order.items?.length || 0} item{(order.items?.length || 0) === 1 ? '' : 's'}</p>
        </div>

        <div className="profile-order-items">
          {order.items?.map((item) => (
            <div key={`${order.id}-${item.id}`} className="profile-order-item">
              <span>{item.name}</span>
              <span>x {item.quantity}</span>
              <strong>{formatPrice(item.price * item.quantity)}</strong>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
