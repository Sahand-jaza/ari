import React, { useState } from 'react';
import PaymentCard from '../components/PaymentCard';

export default function CartPage({ cart, setCart, currentUser, setCurrentPage }) {
  const total = cart.reduce((s, i) => s + (Number(i?.price) || 0) * (Number(i?.quantity) || 0), 0);

  const [showPayment, setShowPayment] = useState(false);
  const [stripeKey, setStripeKey] = useState(null);

  // Load runtime config (contains stripe publishable key)
  React.useEffect(() => {
    (async () => {
      try {
        const API_BASE = import.meta.env.VITE_API_URL || '';
        const r = await fetch(`${API_BASE}/api/config`);
        if (!r.ok) return;
        const j = await r.json();
        if (j && j.stripePublishableKey) setStripeKey(j.stripePublishableKey);
      } catch (e) {}
    })();
  }, []);

  return (
    <div className="text-black">
      <h1 className="text-4xl font-bold mb-8">Shopping Cart</h1>
      {cart.length ? (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {cart.map(item => {
              const price = Number(item?.price) || 0;
              const quantity = Number(item?.quantity) || 0;
              const lineTotal = price * quantity;
              return (
                <div key={item.id} className="bg-white rounded-xl shadow p-6 flex gap-6 text-black">
                  <img src={item.image || item.image_url} alt={item.name} className="w-24 h-24 object-cover rounded" />
                  <div className="flex-1">
                    <h3 className="font-bold text-black">{item.name}</h3>
                    <div className="flex gap-2 items-center mt-2">
                      <button onClick={() => setCart(cart.map(i => i.id === item.id ? { ...i, quantity: Math.max(1, (Number(i.quantity) || 1) - 1) } : i))} className="p-2 bg-gray-200">-</button>
                      <span>{quantity}</span>
                      <button onClick={() => setCart(cart.map(i => i.id === item.id ? { ...i, quantity: (Number(i.quantity) || 0) + 1 } : i))} className="p-2 bg-gray-200">+</button>
                    </div>
                  </div>
                  <p className="font-bold text-2xl text-black max-w-[140px] text-right truncate whitespace-nowrap">${lineTotal.toFixed(2)}</p>
                </div>
              );
            })}
          </div>
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="font-bold text-xl mb-6">Total</h3>
            <p className="text-3xl font-bold text-blue-900 max-w-[220px] text-right truncate whitespace-nowrap">${total.toFixed(2)}</p>
            <div className="mt-4">
              <button onClick={() => {
                if (!currentUser) {
                  alert('Please login to proceed to checkout');
                  if (typeof setCurrentPage === 'function') setCurrentPage('login');
                  return;
                }
                // extra server-side readiness checks
                if (!currentUser.id) { alert('Invalid user session. Please login again.'); return; }
                setShowPayment(s => !s);
              }} className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700">{showPayment ? 'Hide Payment' : 'Proceed to Checkout'}</button>
            </div>
            {showPayment && (
              <div className="mt-6">
                <PaymentCard publishableKey={stripeKey} amount={total} items={cart} currentUser={currentUser} onPay={async (payload) => {
                  try {
                    // Build items payload: only include real product items (exclude negative discount lines)
                    const items = cart
                      .filter(i => Number(i.price) >= 0)
                      .map(i => ({ product_id: i.product_id || i.id, quantity: Number(i.quantity) || 1, is_build: !!i.is_build }));

                    const body = {
                      user_id: currentUser?.id || null,
                      items,
                      amount: Number(total).toFixed(2),
                      shipping_address: payload.billing || null,
                      payment: payload.payment || null
                    };

                    const API_BASE = import.meta.env.VITE_API_URL || '';
                    const res = await fetch(`${API_BASE}/api/orders`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(body)
                    });

                    const data = await res.json();
                    if (!res.ok) {
                      alert('Payment failed: ' + (data.error || JSON.stringify(data)));
                      return;
                    }

                    alert('Payment successful! Order ID: ' + data.order_id + '\nTotal charged: $' + (data.total || body.amount));
                    setCart([]);
                    setShowPayment(false);
                  } catch (err) {
                    console.error('Payment error', err);
                    alert('Payment error: ' + err.message);
                  }
                }} />
              </div>
            )}
          </div>
        </div>
      ) : (
        <p className="text-center text-gray-600">Cart is empty</p>
      )}
    </div>
  );
}
