import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { motion } from 'framer-motion';
import { Star, Sparkles, ShoppingBag, Eye } from 'lucide-react';

const SIZES = [
  { key: 'small', label: 'S' },
  { key: 'medium', label: 'M' },
  { key: 'large', label: 'L' },
];

export default function ProductCard({ product }) {
  const [size, setSize] = useState('medium');
  const [adding, setAdding] = useState(false);
  const { user } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const handleAddToCart = async (e) => {
    e.preventDefault(); // don't follow the card's link
    setAdding(true);
    try {
      await addToCart(product._id, size, 1, {});
    } finally {
      setAdding(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="card group flex flex-col h-full bg-white relative overflow-hidden"
    >
      {/* Top badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1">
        {product.isBestSeller && (
          <span className="flex items-center gap-1 bg-accent-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
            <Star className="w-3 h-3 fill-current" />
            Best Seller
          </span>
        )}
        {product.isNewArrival && (
          <span className="flex items-center gap-1 bg-coffee-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
            <Sparkles className="w-3 h-3 fill-current" />
            New
          </span>
        )}
        {!product.inStock && (
          <span className="bg-gray-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
            Sold Out
          </span>
        )}
      </div>

      {/* Image container */}
      <Link to={`/product/${product._id}`} className="relative h-40 sm:h-56 overflow-hidden bg-coffee-50 block flex-shrink-0">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-coffee-950/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <span className="bg-white/90 text-coffee-800 text-xs font-semibold px-4 py-2 rounded-full shadow-md flex items-center gap-1.5 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
            <Eye className="w-3.5 h-3.5" /> View Details
          </span>
        </div>
      </Link>


      {/* Product info */}
      <div className="p-3 sm:p-5 flex flex-col flex-grow">
        <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-wider text-accent-600 font-body">
          {product.category}
        </span>
        <Link to={`/product/${product._id}`}>
          <h3 className="font-display text-sm sm:text-lg font-bold text-coffee-800 mt-1 hover:text-accent-500 transition-colors line-clamp-1">
            {product.name}
          </h3>
        </Link>
        <p className="text-xs text-coffee-500 mt-1.5 leading-relaxed line-clamp-2 flex-grow hidden sm:block">
          {product.description}
        </p>
        
        {/* Size Selection Chips */}
        <div className="flex items-center gap-1 mt-3" onClick={(e) => e.preventDefault()}>
          {SIZES.map((s) => (
            <button
              key={s.key}
              onClick={() => setSize(s.key)}
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full text-[10px] sm:text-xs font-bold transition-all border ${
                size === s.key
                  ? 'bg-coffee-700 text-white border-coffee-700 shadow-sm scale-105'
                  : 'bg-coffee-50 text-coffee-600 border-coffee-100 hover:border-coffee-300 hover:bg-white'
              }`}
              aria-pressed={size === s.key}
              aria-label={`Size ${s.label}`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Price and Cart Button */}
        <div className="flex flex-col xs:flex-row xs:items-center justify-between mt-4 pt-3 border-t border-coffee-100/50 gap-2">
          <div className="flex flex-col">
            <span className="text-[9px] sm:text-[10px] text-coffee-400 font-semibold uppercase">Price</span>
            <span className="font-display text-base sm:text-xl font-black text-coffee-800">
              Rs. {product.priceBySize[size]}
            </span>
          </div>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleAddToCart}
            disabled={adding || !product.inStock}
            className="btn-primary !px-3 sm:!px-4.5 !py-2 text-[10px] sm:text-xs flex items-center justify-center gap-1 shadow-sm w-full xs:w-auto"
          >
            <ShoppingBag className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
            <span>{adding ? 'Adding…' : 'Add'}</span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
