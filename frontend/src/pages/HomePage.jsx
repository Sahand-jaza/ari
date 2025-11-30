import React from 'react';
import ProductCard from '../components/ProductCard';

export default function HomePage({ products, setCurrentPage, wishlist, toggleWishlist, addToCart }) {
  return (
    <div className="space-y-16">
      <div className="relative overflow-hidden bg-[#0B1120] rounded-3xl text-white isolate">
        {/* Background effects for depth */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
          <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-blue-600/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-72 h-72 bg-purple-600/10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 flex flex-col items-start justify-center min-h-[500px] p-8 md:p-12 lg:p-20 max-w-7xl mx-auto">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight tracking-tight">
            Build Your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
              Dream Setup
            </span>
          </h1>

          <p className="text-lg md:text-xl text-gray-300 mb-10 max-w-xl leading-relaxed">
            Experience gaming like never before with our premium selection of computer components at unbeatable prices.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <button
              onClick={() => setCurrentPage('store')}
              className="px-8 py-4 bg-white text-[#0B1120] rounded-xl font-bold text-lg hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg hover:shadow-white/20"
            >
              Explore Store
            </button>
            <button
              onClick={() => setCurrentPage('buildpc')}
              className="px-8 py-4 bg-white/5 backdrop-blur-md border border-white/10 text-white rounded-xl font-bold text-lg hover:bg-white/10 transition-all hover:border-white/30"
            >
              Build Your PC
            </button>
          </div>
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
