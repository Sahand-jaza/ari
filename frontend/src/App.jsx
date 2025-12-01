import React, { useState, useEffect } from 'react';
import { ShoppingCart, X, Star, Heart, Plus, Minus, Menu } from 'lucide-react';
import HomePageNew from './pages/HomePage';
import StorePageNew from './pages/StorePage';
import BuildPCPageNew from './pages/BuildPCPage';
import CartPageNew from './pages/CartPage';
import LoginPageNew from './pages/LoginPage';
import AdminDashboardNew from './pages/AdminDashboard';
import Footer from './components/Footer';

const ARITechnologyStore = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [pcBuild, setPcBuild] = useState({ cpu: null, motherboard: null, gpu: null, ram: null, storage: null });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [products, setProducts] = useState([
    { id: 1, name: 'Gaming Laptop Pro X1', category: 'laptops', brand: 'TechPro', price: 1299, build_price: 1299, rating: 4.8, reviews: 245, image: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=500&h=500&fit=crop', stock: 15, description: 'High-performance gaming laptop with RTX 4060' },
    { id: 2, name: 'UltraWide Monitor 34"', category: 'monitors', brand: 'ViewMax', price: 599, build_price: 599, rating: 4.6, reviews: 189, image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500&h=500&fit=crop', stock: 23, description: '34-inch curved ultrawide display' },
    { id: 3, name: 'Mechanical Keyboard RGB', category: 'keyboards', brand: 'KeyMaster', price: 149, build_price: 149, rating: 4.9, reviews: 567, image: 'https://images.unsplash.com/photo-1595225476474-87563907a212?w=500&h=500&fit=crop', stock: 45, description: 'Cherry MX mechanical switches' },
    { id: 4, name: 'Wireless Gaming Mouse', category: 'mouse', brand: 'ClickPro', price: 79, build_price: 79, rating: 4.7, reviews: 423, image: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=500&h=500&fit=crop', stock: 67, description: '25,000 DPI wireless' },
    { id: 5, name: 'Premium Headset 7.1', category: 'headsets', brand: 'SoundWave', price: 199, build_price: 199, rating: 4.5, reviews: 312, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop', stock: 34, description: 'Virtual 7.1 surround' },
    { id: 6, name: 'Intel Core i9-14900K', category: 'cpu', brand: 'Intel', price: 589, build_price: 589, rating: 4.9, reviews: 178, image: 'https://images.unsplash.com/photo-1555617981-dac3880eac6e?w=500&h=500&fit=crop', stock: 12, description: '24-core flagship processor', socket: 'LGA1700' },
    { id: 7, name: 'RTX 4090 Graphics Card', category: 'gpu', brand: 'NVIDIA', price: 1599, build_price: 1599, rating: 4.8, reviews: 234, image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=500&h=500&fit=crop', stock: 8, description: 'Ultimate gaming graphics card' },
    { id: 8, name: 'DDR5 32GB RAM Kit', category: 'ram', brand: 'Corsair', price: 179, build_price: 179, rating: 4.7, reviews: 456, image: 'https://images.unsplash.com/photo-1541336032412-2048a678540d?w=500&h=500&fit=crop', stock: 56, description: '32GB DDR5-6000MHz kit' },
    { id: 9, name: 'NVMe SSD 2TB', category: 'storage', brand: 'Samsung', price: 199, build_price: 199, rating: 4.8, reviews: 389, image: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=500&h=500&fit=crop', stock: 41, description: 'Gen4 NVMe SSD' },
    { id: 10, name: 'Z790 Motherboard', category: 'motherboard', brand: 'ASUS', price: 349, build_price: 349, rating: 4.6, reviews: 167, image: 'https://images.unsplash.com/photo-1591370874773-6702e8f12fd8?w=500&h=500&fit=crop', stock: 19, description: 'ATX gaming motherboard', socket: 'LGA1700' },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [discountCfg, setDiscountCfg] = useState({ global: { itemCount: 0, percent: 0 }, perItem: {} });

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const handleLogin = (email, password) => {
    // Attempt server-side login
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/login`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (!res.ok) {
          if (data && data.error && data.error.toLowerCase().includes('not verified')) {
            // prompt verification flow
            setCurrentPage('login');
            // pass pending verify email via localStorage so UI can pick it up
            try { localStorage.setItem('pendingVerifyEmail', email); } catch (e) { }
            alert('Email not verified. A verification code has been sent. Please verify your email.');
            return;
          }
          alert(data && data.error ? data.error : 'Invalid credentials');
          return;
        }

        // on success data contains user info
        setIsLoggedIn(true);
        setCurrentUser(data);
        setIsAdmin(data.role === 'admin');
        try { localStorage.setItem('currentUser', JSON.stringify(data)); } catch (e) { }
        setCurrentPage(data.role === 'admin' ? 'admin' : 'home');
      } catch (err) {
        console.error('Login failed', err);
        alert('Login failed: ' + err.message);
      }
    })();
    return true;
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setIsAdmin(false);
    setCurrentUser(null);
    try { localStorage.removeItem('currentUser'); } catch (e) { }
    setCurrentPage('home');
  };

  const addToCart = (product) => {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      setCart(cart.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  // Load products from backend (or demo data) on mount
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/products`);
        if (!res.ok) throw new Error('Failed to fetch products');
        const data = await res.json();
        // Normalize image URLs returned from backend (make absolute if they are relative)
        const normalized = data.map(p => {
          const copy = { ...p };
          if (copy.image_url && copy.image_url.startsWith('/')) copy.image_url = `${API_BASE}${copy.image_url}`;
          if (copy.image && copy.image.startsWith('/')) copy.image = `${API_BASE}${copy.image}`;
          // prefer image field for components that reference it
          if (!copy.image && copy.image_url) copy.image = copy.image_url;
          // ensure build_price exists for builder (fallback to store price)
          if (copy.build_price == null) copy.build_price = copy.price;
          return copy;
        });
        setProducts(normalized);
      } catch (err) {
        console.debug('loadProducts error:', err.message);
      }
    };
    loadProducts();
    // load discounts (per-item overrides)
    (async () => {
      try {
        const r = await fetch(`${API_BASE}/api/build-discount`);
        if (r.ok) {
          const d = await r.json();
          const per = {};
          if (d && d.perItem) {
            Object.keys(d.perItem).forEach(k => {
              const nk = Number(k);
              if (!Number.isNaN(nk)) per[nk] = d.perItem[k];
            });
          }
          setDiscountCfg({ global: (d && d.global) || { itemCount: 0, percent: 0 }, perItem: per });
        }
      } catch (e) {
        // ignore
      }
    })();
  }, []);

  // Update discount configuration when admin saves new settings (cross-tab/window in same origin)
  useEffect(() => {
    const handler = (e) => {
      try {
        const d = e && e.detail ? e.detail : null;
        if (!d) return;
        const per = {};
        if (d.perItem) {
          Object.keys(d.perItem).forEach(k => {
            const nk = Number(k);
            if (!Number.isNaN(nk)) per[nk] = d.perItem[k];
          });
        }
        setDiscountCfg({ global: (d.global) || { itemCount: 0, percent: 0 }, perItem: per });
      } catch (err) {
        // ignore malformed event
      }
    };
    window.addEventListener('buildDiscountUpdated', handler);
    return () => window.removeEventListener('buildDiscountUpdated', handler);
  }, []);

  const fetchWishlistApi = async (userId) => {
    try {
      const res = await fetch(`${API_BASE}/api/users/${userId}/wishlist`);
      if (!res.ok) throw new Error('Failed to fetch wishlist');
      const data = await res.json();
      setWishlist(data.map(item => ({ id: item.product_id, ...item })));
    } catch (err) {
      console.debug('fetchWishlistApi error:', err.message);
    }
  };

  const addToWishlistApi = async (userId, productId) => {
    try {
      const res = await fetch(`${API_BASE}/api/wishlist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, product_id: productId })
      });
      if (res.status === 201) {
        // update local wishlist
        const prod = products.find(p => p.id === productId);
        setWishlist(w => {
          if (w.find(x => x.id === productId)) return w;
          return [...w, { id: productId, product_id: productId, name: prod?.name, price: prod?.price, image_url: prod?.image }];
        });
      }
      return res;
    } catch (err) {
      console.debug('addToWishlistApi error:', err.message);
      throw err;
    }
  };

  const removeFromWishlistApi = async (userId, productId) => {
    try {
      const res = await fetch(`${API_BASE}/api/wishlist`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, product_id: productId })
      });
      if (res.ok) {
        setWishlist(w => w.filter(x => x.id !== productId));
      }
      return res;
    } catch (err) {
      console.debug('removeFromWishlistApi error:', err.message);
      throw err;
    }
  };

  const savePcBuildApi = async (userId, name, components, total_price) => {
    try {
      const res = await fetch(`${API_BASE}/api/pc_builds`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, name, components, total_price })
      });
      if (!res.ok) {
        const text = await res.text().catch(() => null);
        return { ok: false, status: res.status, body: text };
      }
      const body = await res.json().catch(() => null);
      return { ok: true, status: res.status, body };
    } catch (err) {
      console.debug('savePcBuildApi error:', err.message);
      return { ok: false, error: err.message };
    }
  };

  // Retry any locally saved builds when backend becomes available
  const flushUnsavedBuilds = async () => {
    const pendingRaw = localStorage.getItem('unsaved_builds');
    if (!pendingRaw) return;
    let pending;
    try { pending = JSON.parse(pendingRaw); } catch (e) { localStorage.removeItem('unsaved_builds'); return; }
    if (!Array.isArray(pending) || pending.length === 0) return;

    const remaining = [];
    for (const b of pending) {
      try {
        const res = await savePcBuildApi(b.user_id, b.name, b.components, b.total_price);
        if (!res || !res.ok) {
          remaining.push(b);
        }
      } catch (e) {
        remaining.push(b);
      }
    }

    if (remaining.length > 0) {
      localStorage.setItem('unsaved_builds', JSON.stringify(remaining));
    } else {
      localStorage.removeItem('unsaved_builds');
    }
  };

  // Attempt to flush pending builds on app start
  useEffect(() => {
    flushUnsavedBuilds().catch(() => { });
  }, []);

  // Toggle wishlist from UI (prefers API, falls back to local)
  const toggleWishlist = async (product) => {
    const uid = currentUser?.id || 1; // fallback to 1 for demo
    const exists = wishlist.find(x => x.id === product.id);
    try {
      if (exists) {
        await removeFromWishlistApi(uid, product.id);
      } else {
        await addToWishlistApi(uid, product.id);
      }
    } catch (err) {
      alert('Could not update wishlist (is backend running?)');
    }
  };

  useEffect(() => {
    if (currentUser && currentUser.id) fetchWishlistApi(currentUser.id);
  }, [currentUser]);

  if (!isLoggedIn && currentPage === 'login') return <LoginPageNew handleLogin={handleLogin} setCurrentPage={setCurrentPage} />;

  if (isAdmin && isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <header className="bg-white shadow-lg sticky top-0 z-40 border-b-4 border-blue-600">
          <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
            <h1 className="text-3xl font-bold text-black">🛡️ ARI TECHNOLOGY Admin Portal</h1>
            <button onClick={handleLogout} className="px-6 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-colors">Logout</button>
          </div>
        </header>
        <div className="max-w-7xl mx-auto px-4 py-8"><AdminDashboardNew products={products} setProducts={setProducts} API_BASE={API_BASE} wishlist={wishlist} /></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button onClick={() => { setCurrentPage('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); setIsMobileMenuOpen(false); }} className="text-2xl font-extrabold text-blue-900">ARI TECHNOLOGY</button>
            <nav className="hidden md:flex gap-4 text-sm">
              {['home', 'store', 'buildpc', 'cart'].map(p => (
                <button
                  key={p}
                  onClick={() => setCurrentPage(p)}
                  className={`font-semibold px-3 py-1 rounded-full transition ${currentPage === p ? 'bg-blue-100 text-blue-900 shadow' : 'text-gray-600 hover:text-blue-900'}`}
                >
                  {p === 'buildpc' ? 'Build PC' : p.charAt(0).toUpperCase() + p.slice(1)}
                </button>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={() => setCurrentPage('cart')} className="relative p-2 rounded-lg bg-gray-100">
              <ShoppingCart className="w-6 h-6 text-gray-700" />
              {cart.length > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">{cart.reduce((s, i) => s + i.quantity, 0)}</span>}
            </button>

            {isLoggedIn ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-700 hidden sm:inline">{currentUser?.name}</span>
                <button onClick={handleLogout} className="px-4 py-2 bg-gray-200 rounded-lg">Logout</button>
              </div>
            ) : (
              <button onClick={() => setCurrentPage('login')} className="px-4 py-2 bg-blue-900 text-white rounded-lg">Login</button>
            )}

            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden p-2 rounded-lg bg-gray-100 text-gray-700"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 absolute w-full left-0 shadow-lg animate-in slide-in-from-top-5 duration-200">
            <div className="p-4 flex flex-col gap-2">
              {['home', 'store', 'buildpc', 'cart'].map(p => (
                <button
                  key={p}
                  onClick={() => { setCurrentPage(p); setIsMobileMenuOpen(false); }}
                  className={`text-left font-semibold px-4 py-3 rounded-xl transition ${currentPage === p ? 'bg-blue-50 text-blue-900' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  {p === 'buildpc' ? 'Build PC' : p.charAt(0).toUpperCase() + p.slice(1)}
                </button>
              ))}
              {isLoggedIn && (
                <div className="border-t pt-2 mt-2">
                  <div className="px-4 py-2 text-sm text-gray-500">Signed in as {currentUser?.name}</div>
                  <button onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }} className="w-full text-left font-semibold px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition">
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 flex-1">
        {currentPage === 'home' && <HomePageNew products={products} setCurrentPage={setCurrentPage} wishlist={wishlist} toggleWishlist={toggleWishlist} addToCart={addToCart} />}
        {currentPage === 'store' && <StorePageNew products={products} searchQuery={searchQuery} setSearchQuery={setSearchQuery} selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} wishlist={wishlist} toggleWishlist={toggleWishlist} addToCart={addToCart} />}
        {currentPage === 'buildpc' && <BuildPCPageNew products={products} pcBuild={pcBuild} setPcBuild={setPcBuild} savePcBuildApi={savePcBuildApi} addToCart={addToCart} currentUser={currentUser} />}
        {currentPage === 'cart' && <CartPageNew cart={cart} setCart={setCart} currentUser={currentUser} setCurrentPage={setCurrentPage} />}
      </main>

      <Footer />
    </div>
  );
};

export default ARITechnologyStore;