import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Coffee, ShoppingCart, User, Search, Menu as HamburgerIcon, X, LogOut, ShieldAlert } from 'lucide-react';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const { itemCount } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [allProducts, setAllProducts] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const navigate = useNavigate();

  const loadAllProducts = async () => {
    if (allProducts.length > 0) return;
    try {
      const { data } = await api.get('/products');
      setAllProducts(data);
    } catch (err) {
      console.error('Failed to load products list for autocomplete', err);
    }
  };

  const handleSearchChange = (val) => {
    setSearch(val);
    if (!val.trim()) {
      setSuggestions([]);
      return;
    }
    const q = val.toLowerCase().trim();
    const filtered = allProducts.filter(p => {
      const name = p.name.toLowerCase();
      const category = p.category.toLowerCase();
      
      if (name.includes(q) || category.includes(q)) return true;
      
      const nameWords = name.split(/\s+/);
      const hasOverlap = nameWords.some(w => {
        let matches = 0;
        const checkLen = Math.min(w.length, q.length);
        for (let i = 0; i < checkLen; i++) {
          if (w[i] === q[i]) matches++;
        }
        return matches >= Math.max(3, q.length - 1);
      });
      return hasOverlap;
    });
    setSuggestions(filtered.slice(0, 5));
  };

  const handleSelectSuggestion = (id) => {
    navigate(`/product/${id}`);
    setSuggestions([]);
    setSearch('');
    setMenuOpen(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/menu?search=${encodeURIComponent(search.trim())}`);
      setSuggestions([]);
      setMenuOpen(false);
    }
  };

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/menu', label: 'Menu' },
  ];

  return (
    <header className="sticky top-0 z-40 glassmorphic text-coffee-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 group font-display text-2xl font-bold tracking-tight text-accent-400">
            <motion.div
              whileHover={{ rotate: 15, scale: 1.1 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <Coffee className="w-7 h-7 text-accent-500" />
            </motion.div>
            <span className="bg-gradient-to-r from-accent-400 to-accent-500 bg-clip-text text-transparent group-hover:to-accent-300 transition-all">
              BrewHouse
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-sm font-medium hover:text-accent-400 transition-colors relative py-1 group"
              >
                {link.label}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-accent-500 transition-all duration-300 group-hover:w-full" />
              </Link>
            ))}
          </nav>

          {/* Desktop Search Bar */}
          <form onSubmit={handleSearch} className="hidden md:flex items-center flex-1 max-w-xs mx-6 relative">
            <input
              type="search"
              value={search}
              onFocus={loadAllProducts}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search coffee..."
              aria-label="Search coffee by name or category"
              className="w-full pl-4 pr-10 py-1.5 rounded-full bg-coffee-900/50 border border-coffee-700/60 text-coffee-100 text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 focus:bg-coffee-950 transition-all placeholder-coffee-400"
            />
            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-coffee-400 hover:text-accent-400 transition-colors">
              <Search className="w-4 h-4" />
            </button>

            {/* Suggestions Dropdown overlay */}
            {suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-coffee-200 rounded-2xl shadow-xl overflow-hidden z-50 text-coffee-800 text-xs">
                {suggestions.map((p) => (
                  <div
                    key={p._id}
                    onClick={() => handleSelectSuggestion(p._id)}
                    className="px-4 py-3 hover:bg-coffee-50 cursor-pointer flex justify-between items-center border-b border-coffee-50 last:border-b-0"
                  >
                    <div>
                      <p className="font-bold text-coffee-850">{p.name}</p>
                      <p className="text-[9px] text-coffee-400 capitalize">{p.category}</p>
                    </div>
                    <span className="font-display font-bold text-accent-600">Rs. {p.priceBySize.medium}</span>
                  </div>
                ))}
              </div>
            )}
          </form>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/cart" className="relative p-2 text-coffee-200 hover:text-accent-400 transition-colors" aria-label="View cart">
              <ShoppingCart className="w-5.5 h-5.5" />
              <AnimatePresence>
                {itemCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    key={itemCount}
                    className="absolute -top-1 -right-1 bg-accent-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-coffee-800"
                  >
                    {itemCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>

            {user ? (
              <div className="flex items-center gap-4">
                {isAdmin && (
                  <Link to="/admin" className="flex items-center gap-1 text-xs text-accent-400 hover:text-accent-300 border border-accent-500/30 rounded-full px-3 py-1 bg-accent-500/5">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    Admin
                  </Link>
                )}
                <Link to="/profile" className="flex items-center gap-1.5 text-sm hover:text-accent-400 transition-colors font-medium">
                  <User className="w-4 h-4 text-accent-400" />
                  {user.name.split(' ')[0]}
                </Link>
                <button
                  onClick={logout}
                  className="flex items-center gap-1 text-xs bg-coffee-700/50 hover:bg-red-950/40 text-coffee-200 hover:text-red-400 border border-coffee-600/40 hover:border-red-900/40 px-3 py-1.5 rounded-full transition-all"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Logout
                </button>
              </div>
            ) : (
              <Link to="/login" className="btn-primary !px-5 !py-2 text-xs shadow-sm">
                Login
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-coffee-200 hover:text-accent-400 transition-colors"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X className="w-6 h-6" /> : <HamburgerIcon className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden border-t border-coffee-700/50 bg-coffee-900/95 overflow-hidden px-4 pb-6 space-y-4"
          >
            <form onSubmit={handleSearch} className="pt-4 relative">
              <input
                type="search"
                value={search}
                onFocus={loadAllProducts}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search coffee..."
                className="w-full pl-4 pr-10 py-2 rounded-full bg-coffee-950 text-coffee-100 text-sm border border-coffee-800 focus:outline-none focus:ring-2 focus:ring-accent-500"
              />
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 mt-2 text-coffee-400">
                <Search className="w-4 h-4" />
              </button>

              {/* Suggestions Dropdown overlay for mobile */}
              {suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-coffee-200 rounded-2xl shadow-xl overflow-hidden z-50 text-coffee-800 text-xs">
                  {suggestions.map((p) => (
                    <div
                      key={p._id}
                      onClick={() => handleSelectSuggestion(p._id)}
                      className="px-4 py-3 hover:bg-coffee-50 cursor-pointer flex justify-between items-center border-b border-coffee-50 last:border-b-0"
                    >
                      <div>
                        <p className="font-bold text-coffee-850">{p.name}</p>
                        <p className="text-[9px] text-coffee-400 capitalize">{p.category}</p>
                      </div>
                      <span className="font-display font-bold text-accent-600">Rs. {p.priceBySize.medium}</span>
                    </div>
                  ))}
                </div>
              )}
            </form>

            <div className="flex flex-col gap-3 font-medium">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="block py-2 text-coffee-200 hover:text-accent-400 transition-colors border-b border-coffee-800/30"
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                to="/cart"
                className="flex items-center justify-between py-2 text-coffee-200 hover:text-accent-400 transition-colors border-b border-coffee-800/30"
                onClick={() => setMenuOpen(false)}
              >
                <span>Cart</span>
                <span className="bg-accent-500 text-white text-xs px-2.5 py-0.5 rounded-full font-bold">
                  {itemCount}
                </span>
              </Link>
              {isAdmin && (
                <Link
                  to="/admin"
                  className="block py-2 text-accent-400 hover:text-accent-300 border-b border-coffee-800/30"
                  onClick={() => setMenuOpen(false)}
                >
                  Admin Panel
                </Link>
              )}
              {user ? (
                <>
                  <Link
                    to="/profile"
                    className="block py-2 text-coffee-200 hover:text-accent-400 border-b border-coffee-800/30"
                    onClick={() => setMenuOpen(false)}
                  >
                    Profile ({user.name})
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setMenuOpen(false);
                    }}
                    className="w-full text-left py-2 text-red-400 hover:text-red-300 flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="block text-center btn-primary !py-2.5 mt-2"
                  onClick={() => setMenuOpen(false)}
                >
                  Login
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
