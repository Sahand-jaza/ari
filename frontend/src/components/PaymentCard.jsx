import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

export default function PaymentCard({ amount = 0, onPay, publishableKey = null, items = [], currentUser = null }) {
  const [name, setName] = useState('');
  const [number, setNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [billing, setBilling] = useState('');
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [stripeLoaded, setStripeLoaded] = useState(false);
  const [stripePromise, setStripePromise] = useState(null);
  const [useStripeElements, setUseStripeElements] = useState(false);

  const sanitizeNumber = (v) => v.replace(/[^0-9]/g, '');

  const validate = () => {
    setError('');
    if (!name.trim()) return setError('Cardholder name is required');
    if (!billing.trim() || billing.trim().length < 6) return setError('Billing address is required');
    const num = sanitizeNumber(number);
    if (num.length < 13 || num.length > 19) return setError('Card number looks invalid');
    // expiry MM/YY or MM/YYYY
    const m = expiry.replace(/\s/g, '');
    const parts = m.split('/');
    if (parts.length !== 2) return setError('Expiry must be MM/YY');
    const mm = parseInt(parts[0], 10);
    let yy = parseInt(parts[1], 10);
    if (isNaN(mm) || mm < 1 || mm > 12) return setError('Expiry month invalid');
    const now = new Date();
    let year = yy < 100 ? 2000 + yy : yy;
    const exp = new Date(year, mm - 1, 1);
    // set to last day of month
    exp.setMonth(exp.getMonth() + 1);
    if (exp <= now) return setError('Card is expired');
    if (!/^[0-9]{3,4}$/.test(cvv)) return setError('CVV must be 3 or 4 digits');
    if (!agree) return setError('You must agree to the terms before paying');
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    // If using Stripe Elements, the stripe-confirm flow is handled inside StripeCheckout component
    if (useStripeElements) {
      // The StripeElements child will handle confirmation and call onPay
      setLoading(false);
      return;
    }

    // Fallback: Tokenize card locally (simulation) - DO NOT send raw card data to server in production
    const digits = sanitizeNumber(number);
    const last4 = digits.slice(-4);
    const token = `tok_sim_${Date.now()}`;
    const payload = {
      name: name.trim(),
      billing: billing.trim(),
      amount: Number(amount) || 0,
      payment: {
        method: 'card',
        token,
        last4,
      }
    };
    setTimeout(() => {
      setLoading(false);
      if (typeof onPay === 'function') onPay(payload);
    }, 900);
  };

  useEffect(() => {
    // Use publishable key passed as prop (CartPage fetches /api/config)
    try {
      const wk = publishableKey || window.__STRIPE_PUBLISHABLE__;
      if (wk) {
        setStripePromise(loadStripe(wk));
        setUseStripeElements(true);
        setStripeLoaded(true);
      }
    } catch (e) {}
  }, [publishableKey]);

  // If Stripe Elements will be used, render the Elements provider and child
  if (useStripeElements && stripePromise) {
    return (
      <Elements stripe={stripePromise}>
        <StripeCheckout amount={amount} onSuccess={onPay} setError={(v) => setError(v)} items={items} currentUser={currentUser} />
      </Elements>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow p-6 text-black w-full max-w-md mx-auto">
      <h3 className="text-xl font-bold mb-4">Payment</h3>
      <p className="text-sm text-gray-600 mb-4">Payable amount: <span className="font-bold">${Number(amount).toFixed(2)}</span></p>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-sm font-medium">Cardholder name</label>
          <input value={name} onChange={e => setName(e.target.value)} className="mt-1 w-full p-2 border rounded bg-gray-700 text-white" placeholder="Full name" />
        </div>

        <div>
          <label className="block text-sm font-medium">Card number</label>
          <input value={number} onChange={e => setNumber(e.target.value.replace(/[^0-9\s]/g, ''))} maxLength={23} className="mt-1 w-full p-2 border rounded bg-gray-700 text-white" placeholder="1234 5678 9012 3456" />
        </div>

        <div className="flex gap-3">
          <div className="flex-1">
            <label className="block text-sm font-medium">Expiry (MM/YY)</label>
            <input value={expiry} onChange={e => setExpiry(e.target.value)} className="mt-1 w-full p-2 border rounded bg-gray-700 text-white" placeholder="MM/YY" />
          </div>
          <div style={{width: '100px'}}>
            <label className="block text-sm font-medium">CVV</label>
            <input value={cvv} onChange={e => setCvv(e.target.value.replace(/[^0-9]/g, ''))} maxLength={4} className="mt-1 w-full p-2 border rounded bg-gray-700 text-white" placeholder="123" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium">Billing Address</label>
          <input value={billing} onChange={e => setBilling(e.target.value)} className="mt-1 w-full p-2 border rounded bg-gray-700 text-white" placeholder="Street, City, Country" />
        </div>

        <div className="flex items-center gap-2">
          <input id="agree" type="checkbox" checked={agree} onChange={e => setAgree(e.target.checked)} className="w-4 h-4" />
          <label htmlFor="agree" className="text-sm text-white">I agree to the terms and confirm payment details are correct</label>
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <div className="flex gap-3 items-center">
          <button type="submit" disabled={loading} className="flex-1 py-2 px-4 bg-blue-600 text-white rounded font-semibold hover:bg-blue-700 disabled:opacity-60">
            {loading ? 'Processing...' : `Pay $${Number(amount).toFixed(2)}`}
          </button>
        </div>
      </form>
    </div>
  );
}

  // StripeElements inner component
  function StripeCheckout({ amount, onSuccess, setError, items = [], currentUser = null }) {
    const stripe = useStripe();
    const elements = useElements();
    const [processing, setProcessing] = useState(false);
    const [name, setName] = useState('');
    const [billing, setBilling] = useState('');

    const handleSubmit = async (e) => {
      e.preventDefault();
      setError('');
      if (!stripe || !elements) return setError('Payment system not ready');
      if (!name.trim()) return setError('Cardholder name required');
      if (!billing.trim()) return setError('Billing address required');

      setProcessing(true);
      try {
        // ask server for a PaymentIntent client secret
        const body = { user_id: currentUser?.id || null, items };
        const r = await fetch('/api/create-payment-intent', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
        const j = await r.json();
        if (!r.ok) { setProcessing(false); return setError(j.error || 'Failed to create payment intent'); }

        const clientSecret = j.clientSecret;
        const card = elements.getElement(CardElement);
        const result = await stripe.confirmCardPayment(clientSecret, {
          payment_method: { card, billing_details: { name, address: { line1: billing } } }
        });

        if (result.error) {
          setProcessing(false);
          setError(result.error.message || 'Payment failed');
          return;
        }

        if (result.paymentIntent && result.paymentIntent.status === 'succeeded') {
          // return payment info to caller, server will still need to create order record after webhook or separate call
          onSuccess({ payment: { method: 'stripe', id: result.paymentIntent.id }, billing, amount });
        } else {
          setError('Payment did not succeed');
        }
      } catch (err) {
        console.error('Stripe checkout error', err);
        setError(err.message || 'Payment error');
      } finally { setProcessing(false); }
    };

    return (
      <div className="bg-white rounded-2xl shadow p-6 text-black w-full max-w-md mx-auto">
        <h3 className="text-xl font-bold mb-4">Secure Payment</h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-medium">Cardholder name</label>
            <input value={name} onChange={e => setName(e.target.value)} className="mt-1 w-full p-2 border rounded bg-gray-100 text-black" placeholder="Full name" />
          </div>
          <div>
            <label className="block text-sm font-medium">Card</label>
            <div className="mt-1 p-3 border rounded bg-white"><CardElement /></div>
          </div>
          <div>
            <label className="block text-sm font-medium">Billing Address</label>
            <input value={billing} onChange={e => setBilling(e.target.value)} className="mt-1 w-full p-2 border rounded bg-gray-100 text-black" placeholder="Street, City" />
          </div>
          <div>
            <button type="submit" disabled={processing || !stripe} className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold">{processing ? 'Processing...' : `Pay $${Number(amount).toFixed(2)}`}</button>
          </div>
        </form>
      </div>
    );
  }
