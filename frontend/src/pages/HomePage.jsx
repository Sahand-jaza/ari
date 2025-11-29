import React from 'react';
import ProductCard from '../components/ProductCard';

export default function HomePage({ products, setCurrentPage, wishlist, toggleWishlist, addToCart }) {
  return (
    <div className="space-y-16">
      <div className="bg-gradient-to-r from-blue-900 to-blue-800 rounded-3xl p-16 text-white" style={{ minHeight: '500px' }}>
        <h1 className="text-5xl font-bold mb-6">Build Your Dream Setup</h1>
        <p className="text-xl mb-8">Premium computer components at unbeatable prices</p>
        <div className="flex gap-4">
          <button onClick={() => setCurrentPage('store')} className="bg-white text-blue-900 px-8 py-4 rounded-xl font-bold hover:bg-gray-100">Explore Store</button>
          <button onClick={() => setCurrentPage('buildpc')} className="border-2 border-white text-white px-8 py-4 rounded-xl font-bold hover:bg-white/10">Build Your PC</button>
        </div>
      </div>
      <section>
        <h2 className="text-4xl font-bold mb-8">Featured Products</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.slice(0, 4).map(product => <ProductCard key={product.id} product={product} wishlist={wishlist} toggleWishlist={toggleWishlist} addToCart={addToCart} />)}
        </div>
      </section>
    </div>
  );
}
