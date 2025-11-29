import React from 'react';
import ProductCard from '../components/ProductCard';

export default function StorePage({ products, searchQuery, setSearchQuery, selectedCategory, setSelectedCategory, wishlist, toggleWishlist, addToCart }) {
  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h1 className="text-4xl font-bold">Our Store</h1>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search products..." className="w-full md:w-80 p-3 border rounded-lg bg-white text-black" />
          <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)} className="p-3 border rounded-lg">
            <option value="all">All Categories</option>
            {[...new Set(products.map(p => p.category))].map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.filter(p => (selectedCategory === 'all' || p.category === selectedCategory) && p.name.toLowerCase().includes(searchQuery.toLowerCase())).map(product => <ProductCard key={product.id} product={product} wishlist={wishlist} toggleWishlist={toggleWishlist} addToCart={addToCart} />)}
      </div>
    </div>
  );
}
