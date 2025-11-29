import React from 'react';
import { Heart, Star } from 'lucide-react';

export default function ProductCard({ product, wishlist, toggleWishlist, addToCart }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl overflow-hidden group transform hover:-translate-y-1 transition-all">
      <div className="relative h-64 overflow-hidden bg-gray-100">
        <img src={product.image || product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-4">
          <div className="text-white text-sm bg-black/50 px-3 py-1 rounded backdrop-blur">{product.brand}</div>
          <div className="flex gap-2">
            <button onClick={() => addToCart(product)} className="bg-yellow-400 text-black px-3 py-2 rounded-lg font-semibold">Add</button>
            <button onClick={() => toggleWishlist(product)} className="bg-white/90 p-2 rounded-full shadow">
              <Heart className={`w-5 h-5 ${wishlist.find(x => x.id === product.id) ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
            </button>
          </div>
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-lg text-black truncate">{product.name}</h3>
          <div className="text-sm font-bold text-blue-900">${product.price}</div>
        </div>
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-yellow-400">
            {Array.from({ length: Math.round(product.rating || 4) }).map((_, i) => <Star key={i} className="w-4 h-4" />)}
            <span className="text-sm text-gray-600">({product.reviews})</span>
          </div>
          <div className="text-sm text-gray-500">{product.stock > 0 ? <span className="text-green-600 font-semibold">In stock</span> : <span className="text-red-500">Out</span>}</div>
        </div>
      </div>
    </div>
  );
}
