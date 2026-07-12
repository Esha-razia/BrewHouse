import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Star, Flame, Coffee, Sparkles, Check, ChevronLeft, ArrowRight, Heart } from 'lucide-react';

const SIZES = [
  { key: 'small', label: 'Small', volume: '8 oz' },
  { key: 'medium', label: 'Medium', volume: '12 oz' },
  { key: 'large', label: 'Large', volume: '16 oz' },
];

const BEAN_SIZES = [
  { key: 'small', label: '250g', volume: 'Whole Bean' },
  { key: 'medium', label: '500g', volume: 'Whole Bean' },
  { key: 'large', label: '1kg', volume: 'Whole Bean' },
];

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [size, setSize] = useState('medium');
  const [milk, setMilk] = useState('Whole Milk');
  const [sugarLevel, setSugarLevel] = useState('Normal');
  const [extraShot, setExtraShot] = useState(false);
  const [temperature, setTemperature] = useState('Hot');
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [viewMode, setViewMode] = useState('photo'); // 'photo' or 'preview'

  useEffect(() => {
    const loadProduct = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/products/${id}`);
        setProduct(data);
        setMilk(data.customization?.milkOptions?.[0] || 'Whole Milk');
        setSugarLevel(data.customization?.sugarLevels?.[2] || 'Normal');
      } catch (err) {
        setError('This coffee could not be found.');
      } finally {
        setLoading(false);
      }
    };
    loadProduct();
  }, [id]);

  const HOT_ONLY = product?.name?.toLowerCase().includes('hot only');
  const COLD_ONLY = product?.category === 'Premium Blend Iced Capp' || product?.category === 'Brew Signature Blended' || product?.category === 'Matcha';
  const showTempToggle = product?.category === 'HOT & COLD BEVERAGES' && !HOT_ONLY;
  const isCoffeeBeans = product?.category === 'Coffee Beans';
  const isTea = product?.category?.toLowerCase() === 'tea';
  const sizeOptions = isCoffeeBeans ? BEAN_SIZES : SIZES;

  const handleAddToCart = async () => {
    setAdding(true);
    setAdded(false);
    try {
      await addToCart(product._id, size, quantity, { milk, sugarLevel, extraShot, temperature });
      setAdded(true);
      setTimeout(() => setAdded(false), 3000);
    } finally {
      setAdding(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-32 gap-3 text-coffee-400">
      <Coffee className="w-10 h-10 animate-bounce text-accent-500" />
      <p>Brewing details...</p>
    </div>
  );

  if (error || !product) {
    return (
      <div className="text-center py-24">
        <p className="text-coffee-500 mb-4">{error}</p>
        <Link to="/menu" className="text-accent-500 font-semibold flex items-center justify-center gap-1">
          <ChevronLeft className="w-4 h-4" /> Back to menu
        </Link>
      </div>
    );
  }

  const basePrice = product.priceBySize[size];
  const extraPrice = extraShot ? (product.customization?.extraShotPrice || 150) : 0;
  const totalPrice = (basePrice + extraPrice) * quantity;

  // Visual Cup Preview logic
  const productNameLower = product?.name?.toLowerCase() || '';
  const productCategoryLower = product?.category?.toLowerCase() || '';
  const isIced = productCategoryLower.includes('iced') || productCategoryLower.includes('cold') || productCategoryLower.includes('frappe') || productNameLower.includes('iced') || productNameLower.includes('cold') || productNameLower.includes('frappe') || productCategoryLower.includes('matcha');
  
  // Color map based on ingredients/category
  let liquidColor = '#24140C'; // Default espresso dark brown (black/no milk)
  
  if (productCategoryLower.includes('matcha') || productNameLower.includes('matcha')) {
    liquidColor = milk ? '#8CB37D' : '#4E7243'; // Creamy matcha latte green vs ceremonial green
  } else if (productNameLower.includes('mango')) {
    liquidColor = '#F5A623'; // Tropical mango orange-yellow
  } else if (productNameLower.includes('strawberry')) {
    liquidColor = '#E05A65'; // Strawberry pinkish-red
  } else if (productNameLower.includes('pistachio')) {
    liquidColor = '#97C197'; // Creamy pistachio light green
  } else if (productNameLower.includes('biscoff') || productNameLower.includes('lotus')) {
    liquidColor = '#C19A6B'; // Cookie butter brown
  } else if (productCategoryLower.includes('tea') || productNameLower.includes('tea')) {
    if (productNameLower.includes('green')) {
      liquidColor = '#C5E0B4'; // Translucent green tea
    } else if (productNameLower.includes('peach') || productNameLower.includes('iced tea')) {
      liquidColor = '#E59866'; // Translucent amber peach iced tea
    } else {
      liquidColor = '#A0522D'; // Translucent reddish-brown tea (Sienna)
    }
  } else {
    // Coffee/espresso beverages
    if (milk === 'Whole Milk' || milk === 'Skimmed Milk') {
      liquidColor = '#8A5E3B'; // Creamy latte beige
    } else if (milk === 'Oat Milk' || milk === 'Almond Milk') {
      liquidColor = '#B28E68'; // Slightly lighter almond/oat cream
    } else if (milk === 'Soy Milk') {
      liquidColor = '#A47D56'; // Smooth warm beige
    }
    
    if (productNameLower.includes('mocha') || productNameLower.includes('chocolate') || productNameLower.includes('cocoa')) {
      liquidColor = '#3D2516'; // Deep chocolate mocha
    } else if (productNameLower.includes('americano')) {
      liquidColor = '#1F0F07'; // Near-black americano
    } else if (productNameLower.includes('caramel')) {
      liquidColor = '#A67B5B'; // Warm caramel latte brown
    }
  }

  // Height map based on size
  const heightPercent = { small: '50%', medium: '72%', large: '94%' }[size];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {added && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 20, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-coffee-900 text-white px-6 py-3 rounded-full shadow-lg border border-accent-500/30 flex items-center gap-3 font-semibold text-sm"
          >
            <span className="bg-green-500 text-white p-1 rounded-full"><Check className="w-3.5 h-3.5" /></span>
            <span>{product.name} ({sizeOptions.find((s) => s.key === size)?.label || size}) added to your cart!</span>
            <Link to="/cart" className="text-accent-400 hover:text-accent-300 ml-2 border-b border-accent-400/50 flex items-center gap-0.5">
              Go to Cart <ArrowRight className="w-3 h-3" />
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid md:grid-cols-2 gap-10 lg:gap-16">
        
        {/* Left Side: Photo View vs Interactive Cup Customizer */}
        <div className="flex flex-col gap-4">
          <div className="flex bg-coffee-100 p-1 rounded-full w-fit mb-2">
            <button
              onClick={() => setViewMode('photo')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                viewMode === 'photo' ? 'bg-white text-coffee-800 shadow-sm' : 'text-coffee-500'
              }`}
            >
              Photo View
            </button>
            <button
              onClick={() => setViewMode('preview')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1 ${
                viewMode === 'preview' ? 'bg-white text-coffee-800 shadow-sm' : 'text-coffee-500'
              }`}
            >
              <Coffee className="w-3.5 h-3.5" /> Cup Preview
            </button>
          </div>

          <div className="relative aspect-square bg-coffee-50 border border-coffee-200/50 rounded-3xl overflow-hidden flex items-center justify-center p-6 shadow-sm min-h-[380px]">
            {viewMode === 'photo' ? (
              <motion.img
                key="photo"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                src={product.image}
                alt={product.name}
                className="w-full h-full object-contain p-4 bg-white rounded-2xl shadow-card"
              />
            ) : (
              <motion.div
                key="preview"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full h-full flex flex-col items-center justify-center relative bg-coffee-50/20"
              >
                {/* Steaming effect for Hot drinks */}
                {!isIced && (
                  <div className="absolute top-12 flex gap-3 justify-center w-full">
                    <span className="w-1.5 h-10 bg-coffee-400/20 rounded-full animate-steam-1" />
                    <span className="w-1.5 h-10 bg-coffee-400/20 rounded-full animate-steam-2" />
                    <span className="w-1.5 h-10 bg-coffee-400/20 rounded-full animate-steam-3" />
                  </div>
                )}

                {/* Cup outline & liquid fill */}
                <div className="relative w-48 h-64 border-x-4 border-b-4 border-coffee-300 rounded-b-[40px] rounded-t-[10px] overflow-hidden flex flex-col justify-end shadow-inner bg-white/40">
                  {/* Visual liquid fill */}
                  <motion.div
                    animate={{ height: heightPercent, backgroundColor: liquidColor }}
                    transition={{ type: 'spring', damping: 15 }}
                    className="w-full relative flex flex-col justify-between"
                  >
                    {/* Extra shot dark layer overlay */}
                    {extraShot && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: '24px' }}
                        className="absolute bottom-0 w-full bg-[#180A04] border-t border-accent-500/20 flex items-center justify-center"
                      >
                        <span className="text-[8px] text-white/70 font-bold uppercase tracking-widest scale-90">Extra Shot</span>
                      </motion.div>
                    )}

                    {/* Floating Ice Cubes for Iced Drinks */}
                    {isIced && (
                      <div className="absolute top-2 left-0 right-0 flex justify-around px-4 pointer-events-none">
                        <motion.span animate={{ y: [0, 4, 0] }} transition={{ repeat: Infinity, duration: 2 }} className="w-5 h-5 bg-blue-100/70 border border-blue-200/50 rounded rotate-12 flex items-center justify-center text-[10px]">🧊</motion.span>
                        <motion.span animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 2.2 }} className="w-4 h-4 bg-blue-100/70 border border-blue-200/50 rounded -rotate-12 flex items-center justify-center text-[8px]">🧊</motion.span>
                        <motion.span animate={{ y: [0, 2, 0] }} transition={{ repeat: Infinity, duration: 1.8 }} className="w-5 h-5 bg-blue-100/70 border border-blue-200/50 rounded rotate-45 flex items-center justify-center text-[10px]">🧊</motion.span>
                      </div>
                    )}

                    {/* Foam top layer */}
                    <div className="w-full h-4 bg-coffee-50/80 border-b border-coffee-100/30 flex items-center justify-center">
                      <span className="text-[9px] text-coffee-400 font-bold tracking-wider uppercase">foam</span>
                    </div>
                  </motion.div>
                </div>

                {/* Cup handle */}
                <div className="absolute right-10 top-1/2 -translate-y-4 w-8 h-20 border-4 border-coffee-300 rounded-r-3xl z-[-1]" />

                {/* Cup shadow plate */}
                <div className="w-56 h-3 bg-coffee-200/70 rounded-full mt-4 filter blur-xs" />
                <p className="text-xs text-coffee-400 mt-4 font-bold uppercase tracking-wider">Visual Customizer Preview</p>
              </motion.div>
            )}
          </div>
        </div>

        {/* Right Side: Options Customizer */}
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-extrabold tracking-widest text-accent-600 font-body bg-accent-50 px-2.5 py-1 rounded-md">
              {product.category}
            </span>
            {product.isBestSeller && (
              <span className="text-[10px] uppercase font-bold text-white bg-accent-500 px-2 py-0.5 rounded-md flex items-center gap-0.5">
                <Star className="w-3 h-3 fill-current" /> Best Seller
              </span>
            )}
          </div>

          <h1 className="text-3xl font-extrabold text-coffee-950 font-display mt-3 leading-tight">{product.name}</h1>
          
          <div className="flex items-center gap-1.5 mt-2.5 text-xs font-semibold text-coffee-400">
            <span className="text-amber-500 font-bold flex items-center gap-0.5">
              <Star className="w-3.5 h-3.5 fill-current" /> {product.ratingsAverage}
            </span>
            <span>·</span>
            <span>Customer Rating</span>
          </div>

          <p className="text-coffee-600 mt-4 text-sm sm:text-base leading-relaxed">{product.description}</p>

          <div className="mt-5 p-4 bg-coffee-100/40 rounded-2xl border border-coffee-200/20 text-xs text-coffee-600 space-y-1.5 shadow-sm">
            <p><strong>Ingredients:</strong> {product.ingredients.join(', ')}</p>
            <p><strong>Calories:</strong> {product.calories[size]} kcal ({sizeOptions.find((s) => s.key === size)?.label || size})</p>
          </div>

          {/* Customization Options Panel */}
          <div className="mt-8 space-y-6">
            
            {/* Size Selector */}
            <div>
              <h3 className="text-xs uppercase font-bold tracking-wider text-coffee-400 mb-3">{isCoffeeBeans ? 'Select Weight' : 'Select Size'}</h3>
              <div className="grid grid-cols-3 gap-3">
                {sizeOptions.map((s) => (
                  <button
                    key={s.key}
                    onClick={() => setSize(s.key)}
                    className={`flex flex-col items-center p-3 rounded-2xl border transition-all ${
                      size === s.key
                        ? 'bg-coffee-700 text-white border-coffee-700 shadow-sm scale-[1.02]'
                        : 'bg-white text-coffee-600 border-coffee-200 hover:border-coffee-300'
                    }`}
                  >
                    <span className="text-sm font-bold">{s.label}</span>
                    <span className={`text-[10px] mt-0.5 font-medium ${size === s.key ? 'text-coffee-200' : 'text-coffee-400'}`}>
                      {isTea ? `Rs. ${product.priceBySize[s.key].toFixed(0)}` : `${s.volume} · Rs. ${product.priceBySize[s.key].toFixed(0)}`}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Milk Type Options */}
            {product.customization?.milkOptions?.length > 0 && (
              <div>
                <h3 className="text-xs uppercase font-bold tracking-wider text-coffee-400 mb-3">Milk Option</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {product.customization.milkOptions.map((option) => (
                    <button
                      key={option}
                      onClick={() => setMilk(option)}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold border text-center transition-all ${
                        milk === option
                          ? 'bg-coffee-700 text-white border-coffee-700 shadow-sm'
                          : 'bg-white text-coffee-600 border-coffee-200 hover:border-coffee-300'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Sugar Levels */}
            {product.customization?.sugarLevels?.length > 0 && (
              <div>
                <h3 className="text-xs uppercase font-bold tracking-wider text-coffee-400 mb-3">Sugar Level</h3>
                <div className="flex flex-wrap gap-2">
                  {product.customization.sugarLevels.map((level) => (
                    <button
                      key={level}
                      onClick={() => setSugarLevel(level)}
                      className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                        sugarLevel === level
                          ? 'bg-coffee-700 text-white border-coffee-700 shadow-sm'
                          : 'bg-white text-coffee-600 border-coffee-200 hover:border-coffee-300'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Temperature Selector — only for HOT & COLD BEVERAGES (non-Hot Only items) */}
            {showTempToggle && (
              <div>
                <h3 className="text-xs uppercase font-bold tracking-wider text-coffee-400 mb-3">Temperature</h3>
                <div className="flex gap-3">
                  {['Hot', 'Cold'].map((temp) => (
                    <button
                      key={temp}
                      onClick={() => setTemperature(temp)}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl border font-bold text-sm transition-all ${
                        temperature === temp
                          ? 'bg-coffee-700 text-white border-coffee-700 shadow-sm scale-[1.02]'
                          : 'bg-white text-coffee-600 border-coffee-200 hover:border-coffee-300'
                      }`}
                    >
                      <span>{temp === 'Hot' ? '☕' : '🧊'}</span>
                      {temp}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Extra Shot Switch */}
            {product.customization?.allowExtraShot && (
              <div className="flex items-center justify-between p-4 bg-coffee-100/30 rounded-2xl border border-coffee-100">
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-coffee-800">Add Extra Espresso Shot</span>
                  <span className="text-xs text-coffee-400">{`Increase coffee strength (+Rs. ${(product.customization?.extraShotPrice || 150).toFixed(0)})`}</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={extraShot}
                    onChange={(e) => setExtraShot(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-coffee-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-500" />
                </label>
              </div>
            )}

            {/* Quantity and Checkout Trigger */}
            <div className="flex items-center gap-4 pt-4 border-t border-coffee-100/50">
              <div className="flex items-center border-2 border-coffee-200 rounded-full bg-white px-1 shadow-sm">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-10 h-10 text-lg font-semibold hover:bg-coffee-50 rounded-full transition-colors"
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <span className="w-8 text-center font-bold text-sm text-coffee-800">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="w-10 h-10 text-lg font-semibold hover:bg-coffee-50 rounded-full transition-colors"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>

              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleAddToCart}
                disabled={adding || !product.inStock}
                className="btn-primary flex-grow flex items-center justify-center gap-2 !py-3.5 shadow-md shadow-accent-500/25"
              >
                <ShoppingBag className="w-4 h-4" />
                {adding ? 'Adding…' : product.inStock ? `Add to Cart · Rs. ${totalPrice.toFixed(0)}` : 'Sold Out'}
              </motion.button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
