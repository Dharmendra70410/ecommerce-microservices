import { useMemo } from 'react';
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

export default function ProfilePage() {
  const { user } = useAuth();
  const orders = useMemo(() => getStoredUserOrders(user), [user]);

  return (
    <div className="home-container">
      <section className="panel profile-panel">
        <div className="panel-head">
          <h2>User Profile</h2>
          <span>Role based access enabled</span>
        </div>

        <div className="profile-grid">
          <article className="profile-row">
            <p>Username</p>
            <strong>{user?.username || 'N/A'}</strong>
          </article>
          <article className="profile-row">
            <p>Email</p>
            <strong>{user?.email || 'N/A'}</strong>
          </article>
          <article className="profile-row">
            <p>Role</p>
            <strong>{user?.role || 'user'}</strong>
          </article>
        </div>

        <div className="profile-orders-section">
          <div className="panel-head" style={{ marginBottom: '0.75rem' }}>
            <h2>Orders</h2>
            <span>{orders.length} order{orders.length === 1 ? '' : 's'}</span>
          </div>

          <div className="checkout-actions" style={{ justifyContent: 'flex-start', marginBottom: '0.9rem' }}>
            <Link to="/profile/orders" className="buy-btn" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>
              Open Orders Page
            </Link>
          </div>

          {orders.length === 0 ? (
            <div className="catalog-empty">
              <h3>No orders yet</h3>
              <p>Your confirmed orders will appear here after payment success.</p>
            </div>
          ) : (
            <div className="profile-orders-list">
              {orders.map((order) => (
                <ProfileOrderCard key={order.id} order={order} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function ProfileOrderCard({ order }) {
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
    </article>
  );
}
