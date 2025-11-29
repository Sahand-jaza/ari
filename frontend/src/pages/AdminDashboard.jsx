import React, { useState, useEffect } from 'react';

export default function AdminDashboard({ products, setProducts, API_BASE, wishlist }) {
  const [editing, setEditing] = useState(null);
  const [discountCfg, setDiscountCfg] = useState({ global: { itemCount: 3, percent: 20 }, perItem: {} });
  const [form, setForm] = useState({ name: '', category: '', brand: '', price: '', build_price: '', stock: '', description: '', image_url: '' });
  const [preview, setPreview] = useState(null);
  const [uploadError, setUploadError] = useState(null);

  const startEdit = (p) => {
    setEditing(p);
    setForm({ name: p.name || '', category: p.category || '', brand: p.brand || '', price: p.price || '', build_price: p.build_price || p.price || '', stock: p.stock || '', description: p.description || '', image_url: p.image_url || p.image || '' });
    setPreview(p.image || p.image_url || null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setEditing(null);
    setForm({ name: '', category: '', brand: '', price: '', build_price: '', stock: '', description: '', image_url: '' });
    setPreview(null);
    setUploadError(null);
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/build-discount`);
        if (res.ok) {
          const data = await res.json();
          if (mounted) setDiscountCfg(data || { global: { itemCount: 3, percent: 20 }, perItem: {} });
        }
      } catch (e) {
        // ignore - keep default
      }
    })();
    return () => { mounted = false; };
  }, [API_BASE]);

  const updateDiscountField = (path, value) => {
    if (path === 'global.itemCount') setDiscountCfg(prev => ({ ...prev, global: { ...prev.global, itemCount: Number(value) } }));
    if (path === 'global.percent') setDiscountCfg(prev => ({ ...prev, global: { ...prev.global, percent: Number(value) } }));
  };

  const updatePerItem = (productId, percent) => {
    setDiscountCfg(prev => {
      const per = { ...(prev.perItem || {}) };
      if (percent === '' || percent === null) {
        delete per[productId];
      } else {
        per[productId] = Number(percent);
      }
      return { ...prev, perItem: per };
    });
  };

  const saveDiscountCfg = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/build-discount`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(discountCfg) });
      if (res.ok || res.status === 201) {
        // Try to read back the saved config from the server and update local state
        try {
          const data = await res.json();
          setDiscountCfg(data || discountCfg);
          // Notify other open pages/tabs in this window to refresh their discount state
          try { window.dispatchEvent(new CustomEvent('buildDiscountUpdated', { detail: data })); } catch (e) {}
        } catch (e) {
          // fallback: nothing
        }
        alert('Build discount configuration saved');
      } else {
        alert('Saved locally (backend may be down)');
      }
    } catch (err) {
      alert('Failed to save build discount configuration');
    }
  };

  const saveProduct = async (e) => {
    e.preventDefault();
    let imageUrl = form.image_url;
        if (form.image_file) {
      try {
        const file = form.image_file;
        const toBase64 = file => new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = error => reject(error);
          reader.readAsDataURL(file);
        });
        const dataUrl = await toBase64(file);
        const base64 = dataUrl.split(',')[1];
        const up = await fetch(`${API_BASE}/api/upload`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ filename: file.name, data: base64 }) });
        if (up.ok) {
          const d = await up.json();
          imageUrl = d.image_url || imageUrl;
          // normalize relative paths to absolute
          if (imageUrl && imageUrl.startsWith('/')) imageUrl = `${API_BASE}${imageUrl}`;
              // update preview to uploaded image
              setPreview(imageUrl);
              setUploadError(null);
        }
            else {
              setUploadError('Image upload failed');
            }
      } catch (err) {
            console.debug('admin upload error', err.message);
            setUploadError(err.message || 'Upload error');
      }
    }
    const payload = { name: form.name, category: form.category, brand: form.brand, price: parseFloat(form.price) || 0, build_price: form.build_price ? parseFloat(form.build_price) : (parseFloat(form.price) || 0), description: form.description, stock: parseInt(form.stock) || 0, image_url: imageUrl, specs: {} };
    try {
      if (editing) {
        const res = await fetch(`${API_BASE}/api/products/${editing.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        if (res.ok) {
          const img = payload.image_url && payload.image_url.startsWith('/') ? `${API_BASE}${payload.image_url}` : payload.image_url;
          setProducts(prev => prev.map(p => p.id === editing.id ? { ...p, ...payload, image_url: payload.image_url, image: img } : p));
          resetForm();
          alert('Product updated');
        } else {
          const img = payload.image_url && payload.image_url.startsWith('/') ? `${API_BASE}${payload.image_url}` : payload.image_url;
          setProducts(prev => prev.map(p => p.id === editing.id ? { ...p, ...payload, image_url: payload.image_url, image: img } : p));
          resetForm();
          alert('Product updated locally (backend unavailable)');
        }
      } else {
        const res = await fetch(`${API_BASE}/api/products`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        if (res.status === 201) {
          const data = await res.json();
          const newId = data.id || (Math.max(0, ...products.map(p => p.id)) + 1);
          const img = payload.image_url && payload.image_url.startsWith('/') ? `${API_BASE}${payload.image_url}` : payload.image_url;
          setProducts(prev => [{ id: newId, ...payload, image_url: payload.image_url, image: img }, ...prev]);
          resetForm();
          alert('Product added');
        } else {
          const newId = Math.max(0, ...products.map(p => p.id)) + 1;
          const img = payload.image_url && payload.image_url.startsWith('/') ? `${API_BASE}${payload.image_url}` : payload.image_url;
          setProducts(prev => [{ id: newId, ...payload, image_url: payload.image_url, image: img }, ...prev]);
          resetForm();
          alert('Product added locally (backend unavailable)');
        }
      }
    } catch (err) {
      const newId = Math.max(0, ...products.map(p => p.id)) + 1;
      setProducts(prev => [{ id: newId, ...payload }, ...prev]);
      resetForm();
      alert('Product added locally (error)');
    }
  };

  const removeProduct = async (id) => {
    if (!confirm('Delete this product?')) return;
    try {
      const res = await fetch(`${API_BASE}/api/products/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setProducts(prev => prev.filter(p => p.id !== id));
        alert('Product deleted');
      } else {
        setProducts(prev => prev.filter(p => p.id !== id));
        alert('Product removed locally (backend unavailable)');
      }
    } catch (err) {
      setProducts(prev => prev.filter(p => p.id !== id));
      alert('Product removed locally (error)');
    }
  };

  return (
    <div className="text-black bg-white">
      <div className="mb-8">
        <h1 className="text-5xl font-bold text-black mb-2">📊 Admin Dashboard</h1>
        <p className="text-black text-lg">Welcome back, Administrator. Manage products below.</p>
      </div>

      <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-200">
          <h2 className="text-xl font-bold mb-3">Build Discount (global)</h2>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <label className="text-sm text-gray-700">Items to discount</label>
            <input type="number" min={0} className="p-2 border rounded bg-gray-700 text-white" value={discountCfg.global.itemCount} onChange={e => updateDiscountField('global.itemCount', e.target.value)} />
            <label className="text-sm text-gray-700">Discount percent</label>
            <div className="flex items-center gap-2">
              <input type="number" min={0} max={100} step="0.1" className="p-2 border rounded bg-gray-700 text-white" value={discountCfg.global.percent} onChange={e => updateDiscountField('global.percent', e.target.value)} />
              <span className="text-sm">%</span>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={saveDiscountCfg} className="px-4 py-2 bg-blue-600 text-white rounded">Save Discount</button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-200">
          <h2 className="text-xl font-bold mb-3">Per-Item Overrides</h2>
          <p className="text-sm text-gray-600 mb-3">Set a custom discount percent for specific products (leave blank to use global).</p>
          <div className="space-y-2 max-h-56 overflow-auto pr-2">
            {products.map(p => (
              <div key={p.id} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img src={p.image || p.image_url} alt="" className="w-10 h-10 object-cover rounded" />
                  <div className="text-sm">
                    <div className="font-medium text-black">{p.name}</div>
                    <div className="text-xs text-gray-600">${Number(p.price).toFixed(2)}</div>
                  </div>
                </div>
                <input placeholder="%" className="w-24 p-2 border rounded text-right bg-gray-700 text-white" value={discountCfg.perItem && discountCfg.perItem[p.id] != null ? discountCfg.perItem[p.id] : ''} onChange={e => updatePerItem(p.id, e.target.value === '' ? '' : Number(e.target.value))} />
              </div>
            ))}
          </div>
          <div className="mt-3">
            <button onClick={saveDiscountCfg} className="px-4 py-2 bg-blue-600 text-white rounded">Save Overrides</button>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-gray-200">
          <h2 className="text-2xl font-bold text-black mb-6">Products Management</h2>
          <div className="space-y-4">
            {products.slice(0, 20).map(p => (
              <div key={p.id} className="flex items-center justify-between p-4 bg-white rounded-xl">
                <div className="flex items-center gap-4">
                  <img src={p.image || p.image_url} alt={p.name} className="w-16 h-16 object-cover rounded" />
                  <div>
                    <p className="font-bold text-black">{p.name}</p>
                    <p className="text-sm text-black">{p.brand} — {p.category}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <p className="font-semibold text-lg text-black">${Number(p.price).toFixed(2)}</p>
                  <button onClick={() => startEdit(p)} className="px-3 py-1 bg-yellow-300 rounded-lg">Edit</button>
                  <button onClick={() => removeProduct(p.id)} className="px-3 py-1 bg-red-500 text-white rounded-lg">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-gray-200">
          <h2 className="text-2xl font-bold text-black mb-4">{editing ? 'Edit Product' : 'Add Product'}</h2>
          <form onSubmit={saveProduct} className="space-y-3">
            <input className="w-full p-3 border rounded-lg bg-gray-700 text-white" placeholder="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
            <input className="w-full p-3 border rounded-lg bg-gray-700 text-white" placeholder="Category" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} required />
            <input className="w-full p-3 border rounded-lg bg-gray-700 text-white" placeholder="Brand" value={form.brand} onChange={e => setForm({ ...form, brand: e.target.value })} required />
            <div className="grid grid-cols-3 gap-3">
              <input className="p-3 border rounded-lg bg-gray-700 text-white" placeholder="Store Price" type="number" step="0.01" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} required />
              <input className="p-3 border rounded-lg bg_gray-700 text-white" placeholder="Build Price" type="number" step="0.01" value={form.build_price} onChange={e => setForm({ ...form, build_price: e.target.value })} />
              <input className="p-3 border rounded-lg bg-gray-700 text-white" placeholder="Stock" type="number" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-black">Image (URL or upload)</label>
              <input className="w-full p-3 border rounded-lg bg-gray-700 text-white mb-2" placeholder="Image URL" value={form.image_url} onChange={e => { setForm({ ...form, image_url: e.target.value }); setPreview(e.target.value || null); }} />
              <input type="file" accept="image/*" onChange={e => { const f = e.target.files && e.target.files[0]; setForm({ ...form, image_file: f }); if (f) setPreview(URL.createObjectURL(f)); }} className="w-full p-3 border rounded-lg bg-gray-700 text-white" />
              {preview && (
                <div className="mt-3">
                  <p className="text-sm text-gray-700 mb-1">Preview:</p>
                  <img src={preview} alt="preview" className="w-48 h-48 object-cover rounded" />
                </div>
              )}
              {uploadError && <p className="text-sm text-red-600 mt-2">Upload error: {uploadError}</p>}
            </div>
            <textarea className="w-full p-3 border rounded-lg bg-gray-700 text-white" placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={4} />
            <div className="flex gap-3">
              <button type="submit" className="px-6 py-3 bg-blue-600 text-white rounded-lg font-bold">{editing ? 'Save Changes' : 'Add Product'}</button>
              {editing && <button type="button" onClick={resetForm} className="px-6 py-3 bg-gray-200 rounded-lg">Cancel</button>}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
