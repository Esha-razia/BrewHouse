import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import ProductCard from '../components/ProductCard';

const CATEGORIES = [
  'All',
  'Premium Blend Iced Capp',
  'Brew Signature Blended',
  'HOT & COLD BEVERAGES',
  'Matcha',
  'Tea',
  'Coffee Beans',
];

export default function Menu() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const activeCategory = searchParams.get('category') || 'All';
  const searchTerm = searchParams.get('search') || '';

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      setError('');
      try {
        const params = {};
        if (activeCategory !== 'All') params.category = activeCategory;
        if (searchTerm) params.search = searchTerm;
        const { data } = await api.get('/products', { params });
        setProducts(data);
      } catch (err) {
        setError('Could not load the menu right now. Please try again shortly.');
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, [activeCategory, searchTerm]);

  const handleCategoryClick = (category) => {
    const next = new URLSearchParams(searchParams);
    if (category === 'All') next.delete('category');
    else next.set('category', category);
    setSearchParams(next);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold mb-2">Our Menu</h1>
      <p className="text-coffee-500 mb-8">
        {searchTerm ? `Showing results for "${searchTerm}"` : 'Handcrafted coffee for every mood.'}
      </p>

      {/* Category filter chips */}
      <div className="flex flex-wrap gap-2 mb-8">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => handleCategoryClick(cat)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeCategory === cat
                ? 'bg-coffee-700 text-white'
                : 'bg-white border border-coffee-200 text-coffee-600 hover:border-coffee-400'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading && <p className="text-coffee-400">Loading menu…</p>}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && !error && products.length === 0 && (
        <p className="text-coffee-400">No coffees match your search. Try a different term or category.</p>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
        {products.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </div>
  );
}
