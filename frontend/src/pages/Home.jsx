import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { getCatalogProducts } from '../services/api';

const accentClasses = ['aurora-one', 'aurora-two', 'aurora-three', 'aurora-four', 'aurora-five', 'aurora-six'];
const hiddenCategories = new Set(['beauty']);

function toTitleCase(value) {
  return value
    .split(/[-\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function normalizeCategory(rawCategory, productName) {
  const category = String(rawCategory || 'general').trim().toLowerCase();
  const name = String(productName || '').toLowerCase();

  if (hiddenCategories.has(category) || category.includes('women') || name.includes('women')) {
    return null;
  }

  const isElectronics =
    category.includes('laptop') ||
    category.includes('smartphone') ||
    category.includes('mobile') ||
    category.includes('tablet') ||
    category.includes('electronics') ||
    category.includes('mobile-accessories') ||
    name.includes('laptop') ||
    name.includes('smartphone') ||
    name.includes('mobile') ||
    name.includes('tablet');

  if (isElectronics) {
    return 'Electronics';
  }

  return toTitleCase(category);
}

function createFallbackImage(label, categoryName = 'General') {
  const normalizedCategory = String(categoryName || 'General').trim() || 'General';

  return (
    'data:image/svg+xml;utf8,' +
    encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 360">
        <defs>
          <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#2f5b5f" />
            <stop offset="100%" stop-color="#122025" />
          </linearGradient>
        </defs>
        <rect width="640" height="360" rx="34" fill="url(#bg)" />
        <rect x="48" y="48" width="544" height="264" rx="26" fill="rgba(255,255,255,0.08)" />
        <text x="50%" y="46%" text-anchor="middle" font-family="Segoe UI, sans-serif" font-size="34" font-weight="800" fill="#ffffff">${normalizedCategory}</text>
        <text x="50%" y="60%" text-anchor="middle" font-family="Segoe UI, sans-serif" font-size="22" font-weight="600" fill="rgba(255,255,255,0.9)">${label.slice(0, 38)}</text>
      </svg>
    `)
  );
}

function createRelatedProductImage(name, categoryName, brand, productId) {
  return createFallbackImage(name || 'Product', categoryName || 'General');
}

function handleBrokenImage(event, product) {
  event.currentTarget.onerror = null;
  event.currentTarget.src = createFallbackImage(product.name || 'Product', product.categoryName || 'General');
}

function createBadge(product) {
  if (product.discount >= 35) {
    return `${product.discount}% OFF`;
  }
  if (product.rating >= 4.6) {
    return 'Top Rated';
  }
  if (product.stock <= 10) {
    return 'Limited';
  }
  if (product.stock >= 60) {
    return 'In Demand';
  }
  return 'Featured';
}

function normalizeCatalogProduct(product, index) {
  const price = Number(product.price) || 0;
  const mrp = Math.max(Number(product.mrp) || 0, price);
  const categoryName = normalizeCategory(product.categoryName, product.name);

  if (!categoryName) {
    return null;
  }

  return {
    ...product,
    id: String(product.id),
    name: product.name || 'Untitled Product',
    categoryName,
    brand: product.brand || 'Marketplace',
    image: createFallbackImage(product.name || 'Product', categoryName),
    price,
    mrp,
    rating: Number(product.rating) || 0,
    reviews: Number(product.reviews) || 0,
    discount: Math.max(0, Number(product.discount) || Math.round(((mrp - price) / Math.max(1, mrp)) * 100)),
    stock: Number(product.stock) || 0,
    badge: createBadge(product),
    accent: accentClasses[index % accentClasses.length]
  };
}

function formatPrice(value) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(value);
}

export default function Home() {
  const { user } = useAuth();
  const { addToCart, cartCount } = useCart();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('relevance');
  const [isSortOpen, setIsSortOpen] = useState(false);

  const sortOptions = useMemo(
    () => [
      { value: 'relevance', label: 'Relevance' },
      { value: 'price-low', label: 'Price: Low to High' },
      { value: 'price-high', label: 'Price: High to Low' },
      { value: 'rating', label: 'Top Rating' },
      { value: 'discount', label: 'Highest Discount' }
    ],
    []
  );

  const selectedSortLabel = useMemo(() => {
    return sortOptions.find((option) => option.value === sortBy)?.label || 'Relevance';
  }, [sortBy, sortOptions]);

  const loadProducts = useCallback(async () => {
    setIsLoading(true);
    setFetchError('');

    try {
      const result = await getCatalogProducts();
      const normalized = result
        .map((product, index) => normalizeCatalogProduct(product, index))
        .filter(Boolean);
      setProducts(normalized);

      if (!normalized.length) {
        setFetchError('Could not load catalog right now. Please retry.');
      }
    } catch (error) {
      setFetchError('Could not load catalog right now. Please retry.');
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    const handleDocumentClick = () => setIsSortOpen(false);
    document.addEventListener('click', handleDocumentClick);
    return () => document.removeEventListener('click', handleDocumentClick);
  }, []);

  const categories = useMemo(() => {
    const allCategories = new Set(products.map((product) => product.categoryName));
    const sorted = Array.from(allCategories).sort((a, b) => {
      if (a === 'Electronics') {
        return -1;
      }
      if (b === 'Electronics') {
        return 1;
      }
      return a.localeCompare(b);
    });

    return ['All', ...sorted];
  }, [products]);

  useEffect(() => {
    if (!categories.includes(selectedCategory)) {
      setSelectedCategory('All');
    }
  }, [categories, selectedCategory]);

  const selectedProducts = useMemo(
    () => {
      const byCategory =
        selectedCategory === 'All'
          ? products
          : products.filter((product) => product.categoryName === selectedCategory);

      const query = searchQuery.trim().toLowerCase();
      const byQuery = query
        ? byCategory.filter((product) => {
            const searchableText = `${product.name} ${product.brand} ${product.categoryName}`.toLowerCase();
            return searchableText.includes(query);
          })
        : byCategory;

      const sorted = [...byQuery];
      if (sortBy === 'price-low') {
        sorted.sort((a, b) => a.price - b.price);
      } else if (sortBy === 'price-high') {
        sorted.sort((a, b) => b.price - a.price);
      } else if (sortBy === 'rating') {
        sorted.sort((a, b) => b.rating - a.rating);
      } else if (sortBy === 'discount') {
        sorted.sort((a, b) => b.discount - a.discount);
      }

      return sorted;
    },
    [products, searchQuery, selectedCategory, sortBy]
  );

  const handleAddToCart = (product) => {
    addToCart(product);
  };

  const handleBuyNow = (product) => {
    addToCart(product);
    navigate('/checkout');
  };

  return (
    <div className="home-container storefront-page">
      <section className="catalog-intro">
        <p className="section-kicker">Welcome, {user?.username || 'User'}</p>
        <div className="catalog-intro-row">
          <div>
            <h1>Shop now, keep items in cart, and order later</h1>
            <p className="catalog-intro-text">Add products from this homepage and continue browsing. Your cart is saved so you can come back and place the order later.</p>
          </div>
          <button type="button" className="buy-btn cart-summary-btn" onClick={() => navigate('/cart')}>
            View Cart ({cartCount})
          </button>
        </div>
        
      </section>

      <section className="catalog-toolbar">
        <label className="catalog-search" htmlFor="catalog-search">
          <span>Search</span>
          <input
            id="catalog-search"
            type="search"
            placeholder="Search by product, brand, category"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
        </label>

        <div className="catalog-sort" onClick={(event) => event.stopPropagation()}>
          <span>Sort By</span>
          <button
            type="button"
            className="sort-trigger"
            aria-haspopup="listbox"
            aria-expanded={isSortOpen}
            onClick={() => setIsSortOpen((current) => !current)}
          >
            <span>{selectedSortLabel}</span>
            <span className="sort-caret">⌄</span>
          </button>
          {isSortOpen ? (
            <div className="sort-menu" role="listbox" aria-label="Sort products by">
              {sortOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`sort-option ${sortBy === option.value ? 'sort-option-active' : ''}`}
                  onClick={() => {
                    setSortBy(option.value);
                    setIsSortOpen(false);
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </section>

      <section className="category-strip">
        {categories.map((category) => (
          <button
            key={category}
            type="button"
            className={`category-pill ${selectedCategory === category ? 'category-pill-active' : ''}`}
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </button>
        ))}
      </section>

      <section className="products-section catalog-section">
        <div className="section-heading">
          <div>
            <p className="section-kicker">{selectedCategory}</p>
            <h2>{selectedCategory} Picks</h2>
          </div>
          <p className="section-note">
            {isLoading
              ? 'Loading catalog...'
              : selectedCategory === 'All'
                ? `Showing ${selectedProducts.length} products from all categories.`
                : `Showing ${selectedProducts.length} ${selectedCategory.toLowerCase()} products.`}
          </p>
        </div>

        {fetchError && !isLoading ? (
          <div className="catalog-error" role="alert">
            <p>{fetchError}</p>
            <button type="button" className="ghost-btn" onClick={loadProducts}>Retry</button>
          </div>
        ) : null}

        {isLoading ? (
          <div className="catalog-grid">
            {Array.from({ length: 8 }).map((_, index) => (
              <article key={index} className="product-card skeleton-card">
                <div className="product-image skeleton-box" />
                <div className="product-body">
                  <div className="skeleton-line" />
                  <div className="skeleton-line short" />
                  <div className="skeleton-line" />
                </div>
              </article>
            ))}
          </div>
        ) : selectedProducts.length === 0 ? (
          <div className="catalog-empty">
            <h3>No products found</h3>
            <p>Try a different category or search keyword.</p>
          </div>
        ) : (
          <div className="catalog-grid">
            {selectedProducts.map((product) => (
              <article key={product.id} className={`product-card ${product.accent}`}>
                <div className="product-image">
                  <span className="product-badge">{product.badge}</span>
                  <img
                    className="product-photo"
                    src={product.image}
                    alt={product.name}
                    loading="lazy"
                    onError={(event) => handleBrokenImage(event, product)}
                  />
                </div>

                <div className="product-body">
                  <p className="section-kicker product-brand">{product.brand}</p>
                  <h3>{product.name}</h3>
                  <div className="product-rating">★ {product.rating.toFixed(1)} ({product.reviews})</div>
                  <div className="product-pricing">
                    <span className="sale-price">{formatPrice(product.price)}</span>
                    <span className="mrp">{formatPrice(product.mrp)}</span>
                  </div>
                  <p className="product-save">You save {formatPrice(product.mrp - product.price)} ({product.discount}% off)</p>
                  <p className="stock-note">{product.stock > 0 ? `${product.stock} left in stock` : 'Currently unavailable'}</p>

                  <div className="product-actions">
                    <button
                      type="button"
                      className="buy-btn"
                      onClick={() => handleBuyNow(product)}
                      disabled={product.stock <= 0}
                    >
                      Buy Now
                    </button>
                    <button
                      type="button"
                      className="ghost-btn"
                      onClick={() => handleAddToCart(product)}
                      disabled={product.stock <= 0}
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="info-section marketplace-note">
        <h2>How this will work in distributed setup</h2>
        <ol className="steps-list">
          <li><strong>Browse:</strong> User sees product cards in this frontend.</li>
          <li><strong>Click:</strong> Product request is sent to backend service later.</li>
          <li><strong>Route:</strong> Backend can run on another laptop or machine.</li>
          <li><strong>Process:</strong> Orders, inventory, and payment can be split across services.</li>
        </ol>
      </section>
    </div>
  );
}
