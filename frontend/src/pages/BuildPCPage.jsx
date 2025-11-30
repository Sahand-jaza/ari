import React, { useState, useEffect } from 'react';

export default function BuildPCPage({ products, pcBuild, setPcBuild, savePcBuildApi, addToCart, currentUser }) {
  const [discountCfg, setDiscountCfg] = useState({ global: { itemCount: 3, percent: 20 }, perItem: {} });

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const API_BASE = import.meta.env.VITE_API_URL || '';
        const res = await fetch(`${API_BASE}/api/build-discount`);
        if (res.ok) {
          const data = await res.json();
          if (mounted) setDiscountCfg(data || { global: { itemCount: 3, percent: 20 }, perItem: {} });
        }
      } catch (e) {
        // ignore - use defaults
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Listen for admin updates and update discount config in currently open pages
  useEffect(() => {
    const handler = (e) => {
      try {
        const data = e && e.detail ? e.detail : null;
        if (data) setDiscountCfg(data);
      } catch (err) {
        // ignore
      }
    };
    window.addEventListener('buildDiscountUpdated', handler);
    return () => window.removeEventListener('buildDiscountUpdated', handler);
  }, []);
  const cpuList = products.filter(p => p.category === 'cpu');
  const gpuList = products.filter(p => p.category === 'gpu');
  const ramList = products.filter(p => p.category === 'ram');
  const storageList = products.filter(p => p.category === 'storage');
  const moboList = products.filter(p => p.category === 'motherboard');
  const selectedItems = Object.values(pcBuild).filter(Boolean).map(item => ({ id: item.id, price: Number(item.build_price ?? item.price) || 0, name: item.name }));
  const total = selectedItems.reduce((sum, item) => sum + item.price, 0);
  const completeness = selectedItems.length;

  // Calculate discount based on config: per-item overrides take precedence, then global applies to highest-priced N items
  const globalCount = (discountCfg && discountCfg.global && Number(discountCfg.global.itemCount)) || 0;
  const globalPct = ((discountCfg && discountCfg.global && Number(discountCfg.global.percent)) || 0) / 100;
  const perItemMap = (discountCfg && discountCfg.perItem) || {};
  // normalize keys from backend (they may be strings) to numeric keys for easier lookup
  const perItemNormalized = {};
  Object.keys(perItemMap).forEach(k => {
    const nk = Number(k);
    if (!Number.isNaN(nk)) perItemNormalized[nk] = perItemMap[k];
  });

  let discountAmount = 0;
  if (selectedItems.length > 0) {
    // choose which items get the global discount (highest priced)
    const sorted = [...selectedItems].sort((a, b) => b.price - a.price);
    const topIds = sorted.slice(0, Math.max(0, globalCount)).map(i => i.id);
    for (const it of selectedItems) {
      const overrideExists = perItemNormalized && (perItemNormalized[it.id] != null);
      const pct = overrideExists ? (Number(perItemNormalized[it.id]) || 0) / 100 : (topIds.includes(it.id) ? globalPct : 0);
      discountAmount += it.price * pct;
    }
  }
  discountAmount = Number(discountAmount.toFixed(2));
  const finalTotal = Number((total - discountAmount).toFixed(2));
  const displayDiscountPercent = total > 0 ? Math.round((discountAmount / total) * 100) : 0;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-6xl font-extrabold text-black mb-3">PC Builder</h1>
        <p className="text-xl text-black mb-5">Build your dream PC with our powerful components</p>
        <div className="w-full bg-gray-300 rounded-full h-4">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 h-4 rounded-full transition-all" style={{ width: `${(completeness / 5) * 100}%` }}></div>
        </div>
        <p className="text-base text-black mt-3 font-semibold">{completeness}/5 components selected</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {[
            { name: 'CPU', list: cpuList, key: 'cpu', icon: '⚙️' },
            { name: 'Motherboard', list: moboList, key: 'motherboard', icon: '🖥️' },
            { name: 'GPU', list: gpuList, key: 'gpu', icon: '🎮' },
            { name: 'RAM', list: ramList, key: 'ram', icon: '💾' },
            { name: 'Storage', list: storageList, key: 'storage', icon: '📦' }
          ].map(comp => (
            <div key={comp.key} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow p-8 border-2 border-gray-100">
              <h3 className="font-extrabold text-2xl mb-5 text-black flex items-center gap-3">{comp.icon} {comp.name}</h3>
              {pcBuild[comp.key] ? (
                <div className="flex gap-6 items-center bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl">
                  <img src={pcBuild[comp.key].image || pcBuild[comp.key].image_url} alt="" className="w-28 h-28 object-cover rounded-lg shadow" />
                  <div className="flex-1">
                    <p className="font-bold text-lg text-black">{pcBuild[comp.key].name}</p>
                    <p className="text-lg text-black font-semibold">${pcBuild[comp.key].price}</p>
                    <p className="text-sm text-gray-700 mt-1">{pcBuild[comp.key].brand}</p>
                  </div>
                  <button onClick={() => setPcBuild({ ...pcBuild, [comp.key]: null })} className="text-red-600 hover:bg-red-100 px-3 py-2 rounded-lg transition text-lg">Remove</button>
                </div>
                ) : (
                <select onChange={(e) => {
                  const p = comp.list.find(x => x.id === parseInt(e.target.value));
                  if (p) setPcBuild({ ...pcBuild, [comp.key]: p });
                }} className="w-full p-4 border-2 border-gray-300 rounded-xl text-black bg-white font-semibold text-lg focus:outline-none focus:border-blue-500">
                  <option className="text-black text-lg">Select {comp.name}</option>
                  {comp.list.map(p => <option key={p.id} value={p.id} className="text-black text-lg">{p.name} - ${p.price}</option>)}
                </select>
              )}
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-2xl p-8 h-fit sticky top-24">
          <h3 className="font-extrabold text-3xl mb-6 text-white">Build Summary</h3>

          <div className="space-y-4 mb-6 bg-white bg-opacity-10 p-6 rounded-xl backdrop-blur">
              {['cpu', 'motherboard', 'gpu', 'ram', 'storage'].map(k => (
              <div key={k} className="flex justify-between text-lg items-center gap-4">
                <span className="text-white font-medium capitalize truncate" style={{maxWidth: '60%'}}>{k}</span>
                <span className="bg-white text-black font-bold text-xl text-right max-w-[120px] truncate whitespace-nowrap px-2 py-1 rounded">{pcBuild[k] ? '$' + (Number(pcBuild[k].build_price ?? pcBuild[k].price).toFixed(2)) : '-'}</span>
              </div>
            ))}
          </div>

          <div className="border-t-2 border-white border-opacity-30 pt-4 mb-6">
            <div className="flex flex-col items-start gap-2">
              <span className="text-white font-bold text-xl">Total Cost</span>
              <span className="bg-white text-black font-bold text-2xl break-words px-3 py-1 rounded">${Number(total).toFixed(2)}</span>
              {discountAmount > 0 && (
                <div className="mt-2">
                  <span className="text-sm bg-white text-black px-2 py-1 rounded">Discount ({displayDiscountPercent}%): <span className="font-bold">-${discountAmount.toFixed(2)}</span></span>
                </div>
              )}
              <div>
                <span className="bg-white text-black font-bold text-2xl mt-2 px-3 py-1 rounded">Final: <span className="">${finalTotal.toFixed(2)}</span></span>
              </div>
            </div>
            <p className="text-white text-opacity-85 text-sm mt-2">All prices in USD</p>
          </div>

          {finalTotal > 0 && (
            <button type="button" onClick={async () => {
              const uid = currentUser?.id || 1;
              const name = `Build ${new Date().toISOString()}`;
              const components = {};
              Object.keys(pcBuild).forEach(k => { if (pcBuild[k]) components[k] = { id: pcBuild[k].id, name: pcBuild[k].name, price: Number(pcBuild[k].build_price ?? pcBuild[k].price) }; });
              try {
                const res = await savePcBuildApi(uid, name, components, finalTotal);
                if (res && (res.status === 201 || res.ok)) {
                  Object.values(pcBuild).forEach(item => item && addToCart({ ...item, price: Number(item.build_price ?? item.price) }));
                  // Add a discount line item so cart totals reflect the build discount
                  if (discountAmount > 0) {
                    addToCart({ id: `build-discount-${Date.now()}`, name: `Build discount (${displayDiscountPercent}% off)`, price: -discountAmount, quantity: 1 });
                  }
                  alert('✓ Build saved and added to cart');
                } else {
                  alert('Build saved locally but could not be persisted (backend may be down)');
                }
              } catch (err) {
                Object.values(pcBuild).forEach(item => item && addToCart({ ...item, price: Number(item.build_price ?? item.price) }));
                if (discountAmount > 0) {
                  addToCart({ id: `build-discount-${Date.now()}`, name: `Build discount (${displayDiscountPercent}% off)`, price: -discountAmount, quantity: 1 });
                }
                alert('Build added to cart (could not save to backend)');
              }
            }} className="w-full py-5 bg-yellow-400 text-black rounded-2xl font-extrabold hover:bg-yellow-300 transition-colors shadow-2xl text-xl" aria-label="Save and add build to cart">
              💾 Save & Add to Cart
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
