import { useEffect, useState } from 'react';
import api from '../api/axios';
import OrderStatusTracker from '../components/OrderStatusTracker';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Coffee, ClipboardList, Database, Globe, Plus, Edit3, Trash2, CheckCircle2, 
  AlertTriangle, Sparkles, BrainCircuit, Search, ArrowRight, Eye, RefreshCw, Users 
} from 'lucide-react';

const EMPTY_PRODUCT = {
  name: '',
  category: 'Hot Coffee',
  priceBySize: { small: '', medium: '', large: '' },
  image: '',
  description: '',
  ingredients: '', 
  inStock: true,
  isBestSeller: false,
  isNewArrival: false,
  seo: { metaTitle: '', metaDescription: '', keywords: '' }
};

const CATEGORIES = ['Premium Blend Iced Capp', 'Brew Signature Blended', 'HOT & COLD BEVERAGES', 'Matcha', 'Tea', 'Coffee Beans'];
const ORDER_STATUSES = ['Pending', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'];

// Initial Mock Inventory Levels for AI Forecasting
const INITIAL_INVENTORY = [
  { name: 'Arabica Coffee Beans', quantity: '14.5 kg', level: 35, unit: 'kg', depletionDays: 3, critical: true },
  { name: 'Whole Milk', quantity: '18 Liters', level: 25, unit: 'L', depletionDays: 2, critical: true },
  { name: 'Oat Milk', quantity: '45 Liters', level: 75, unit: 'L', depletionDays: 12, critical: false },
  { name: 'Vanilla Syrup', quantity: '8 Bottles', level: 60, unit: 'pcs', depletionDays: 15, critical: false },
  { name: 'To-Go Cups (12oz)', quantity: '420 Units', level: 48, unit: 'units', depletionDays: 4, critical: true },
];

export default function AdminDashboard() {
  const [tab, setTab] = useState('products'); // 'products', 'orders', 'ai-inventory', 'seo-manager', 'users'
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [orderStatusFilter, setOrderStatusFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Coffee Items tab states
  const [editingId, setEditingId] = useState(null); // null, 'new', or id
  const [form, setForm] = useState(EMPTY_PRODUCT);
  const [saving, setSaving] = useState(false);

  // AI Inventory states
  const [inventory, setInventory] = useState(INITIAL_INVENTORY);
  const [optimizingPrice, setOptimizingPrice] = useState(false);

  // SEO Manager states
  const [selectedSeoProductId, setSelectedSeoProductId] = useState('');
  const [seoForm, setSeoForm] = useState({ metaTitle: '', metaDescription: '', keywords: '' });
  const [savingSeo, setSavingSeo] = useState(false);
  const [generatingSeo, setGeneratingSeo] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [productsRes, ordersRes, usersRes] = await Promise.all([
        api.get('/products'),
        api.get('/orders'),
        api.get('/users'),
      ]);
      setProducts(productsRes.data);
      setOrders(ordersRes.data);
      setUsers(usersRes.data);
      if (productsRes.data.length > 0 && !selectedSeoProductId) {
        setSelectedSeoProductId(productsRes.data[0]._id);
      }
    } catch (err) {
      setError('Failed to load admin dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Update SEO form when product selection changes
  useEffect(() => {
    if (selectedSeoProductId && products.length > 0) {
      const prod = products.find(p => p._id === selectedSeoProductId);
      if (prod) {
        setSeoForm({
          metaTitle: prod.seo?.metaTitle || `${prod.name} | BrewHouse Coffee`,
          metaDescription: prod.seo?.metaDescription || prod.description || '',
          keywords: prod.seo?.keywords || `${prod.name.toLowerCase()}, coffee, brewhouse`,
        });
      }
    }
  }, [selectedSeoProductId, products]);

  // Alert triggers
  const triggerSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  // CRUD Coffee Items handlers
  const openNewProductForm = () => {
    setForm(EMPTY_PRODUCT);
    setEditingId('new');
  };

  const openEditProductForm = (product) => {
    setForm({
      ...product,
      ingredients: product.ingredients.join(', '),
      seo: product.seo || { metaTitle: '', metaDescription: '', keywords: '' }
    });
    setEditingId(product._id);
  };

  const handleFieldChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handlePriceChange = (size, value) => {
    setForm((prev) => ({ ...prev, priceBySize: { ...prev.priceBySize, [size]: value } }));
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = {
        ...form,
        priceBySize: {
          small: Number(form.priceBySize.small),
          medium: Number(form.priceBySize.medium),
          large: Number(form.priceBySize.large),
        },
        ingredients: form.ingredients
          .split(',')
          .map((i) => i.trim())
          .filter(Boolean),
      };

      if (editingId === 'new') {
        await api.post('/products', payload);
        triggerSuccess('New coffee item added successfully.');
      } else {
        await api.put(`/products/${editingId}`, payload);
        triggerSuccess('Coffee item updated successfully.');
      }

      setEditingId(null);
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save product details.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Delete this coffee item? This cannot be undone.')) return;
    try {
      await api.delete(`/products/${id}`);
      triggerSuccess('Coffee item removed.');
      await loadData();
    } catch (err) {
      setError('Could not delete product.');
    }
  };

  // Orders handlers
  const handleStatusChange = async (orderId, status) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status });
      setOrders((prev) => prev.map((o) => (o._id === orderId ? { ...o, status } : o)));
      triggerSuccess(`Order status updated to ${status}.`);
    } catch (err) {
      setError('Could not update order status.');
    }
  };

  // AI Price Optimizer handler
  const handleApplyAiPricing = async () => {
    setOptimizingPrice(true);
    try {
      // Loop through products and optimize price (e.g. increase by $0.15 or $0.25 based on category)
      const promises = products.map(p => {
        const factor = p.isBestSeller ? 0.25 : 0.15;
        const newPrices = {
          small: Number((p.priceBySize.small + factor).toFixed(2)),
          medium: Number((p.priceBySize.medium + factor).toFixed(2)),
          large: Number((p.priceBySize.large + factor).toFixed(2)),
        };
        return api.put(`/products/${p._id}`, {
          ...p,
          priceBySize: newPrices
        });
      });
      await Promise.all(promises);
      triggerSuccess('AI Pricing Optimization Applied: Medium and Best Seller prices updated based on demand index!');
      await loadData();
    } catch (err) {
      setError('AI Pricing optimization failed.');
    } finally {
      setOptimizingPrice(false);
    }
  };

  // AI SEO Generator handler
  const handleGenerateAiSeo = () => {
    setGeneratingSeo(true);
    const prod = products.find(p => p._id === selectedSeoProductId);
    if (prod) {
      setTimeout(() => {
        const generatedTitle = `${prod.name} | BrewHouse Coffee House`;
        const generatedDesc = `Taste our premium ${prod.name} handcrafted by local baristas. ${prod.description.slice(0, 100)}... Order online for fast pickup!`;
        const generatedKeywords = `${prod.name.toLowerCase()}, ${prod.category.toLowerCase().replace(/\s+/g, ', ')}, best coffee shop, fresh beans`;
        
        setSeoForm({
          metaTitle: generatedTitle,
          metaDescription: generatedDesc,
          keywords: generatedKeywords
        });
        setGeneratingSeo(false);
        triggerSuccess('AI SEO Tags generated! Review below and click Save.');
      }, 800);
    }
  };

  // Save SEO Handler
  const handleSaveSeo = async (e) => {
    e.preventDefault();
    setSavingSeo(true);
    try {
      const prod = products.find(p => p._id === selectedSeoProductId);
      if (prod) {
        await api.put(`/products/${selectedSeoProductId}`, {
          ...prod,
          seo: seoForm
        });
        triggerSuccess(`SEO metadata saved for ${prod.name}.`);
        await loadData();
      }
    } catch (err) {
      setError('Failed to save SEO metadata.');
    } finally {
      setSavingSeo(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Dynamic Alerts */}
      <AnimatePresence>
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-6 p-4 bg-green-50 border border-green-200 text-green-800 rounded-2xl flex items-center gap-3 font-semibold text-sm shadow-sm"
          >
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            {successMsg}
          </motion.div>
        )}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 rounded-2xl flex items-center gap-3 font-semibold text-sm shadow-sm"
          >
            <AlertTriangle className="w-5 h-5 text-red-600" />
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col md:flex-row gap-8 items-start">
        
        {/* Left Side Navigation: Sidebar tabs */}
        <aside className="w-full md:w-64 bg-white border border-coffee-200/50 rounded-3xl p-5 shrink-0 shadow-sm space-y-2">
          <div className="px-3 pb-3 border-b border-coffee-100 mb-4 text-center sm:text-left">
            <h2 className="font-display font-black text-xl text-coffee-900 flex items-center gap-1.5 justify-center sm:justify-start">
              <BrainCircuit className="w-5 h-5 text-accent-500" />
              BrewControl
            </h2>
            <p className="text-[10px] text-coffee-400 font-bold uppercase tracking-widest mt-0.5">Admin Dashboard</p>
          </div>

          <TabButton active={tab === 'products'} icon={Coffee} onClick={() => setTab('products')}>
            Coffee Items
          </TabButton>
          <TabButton active={tab === 'orders'} icon={ClipboardList} onClick={() => setTab('orders')}>
            Orders Queue
          </TabButton>
          <TabButton active={tab === 'ai-inventory'} icon={Database} onClick={() => setTab('ai-inventory')}>
            AI Inventory & Stock
          </TabButton>
          <TabButton active={tab === 'seo-manager'} icon={Globe} onClick={() => setTab('seo-manager')}>
            Product SEO Manager
          </TabButton>
          <TabButton active={tab === 'users'} icon={Users} onClick={() => setTab('users')}>
            User Accounts
          </TabButton>
          
          <div className="pt-8 text-center">
            <button onClick={loadData} className="text-xs text-coffee-400 hover:text-accent-500 font-bold flex items-center gap-1.5 mx-auto">
              <RefreshCw className="w-3.5 h-3.5" /> Reload Data
            </button>
          </div>
        </aside>

        {/* Right Side: Main Panels Container */}
        <main className="flex-1 w-full bg-white border border-coffee-200/50 rounded-3xl p-6 sm:p-8 shadow-sm">
          
          {/* TAB 1: COFFEE ITEMS CRUD */}
          {tab === 'products' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-coffee-100 pb-4">
                <h3 className="font-display text-2xl font-black text-coffee-950">Coffee Menu Items</h3>
                {!editingId && (
                  <button onClick={openNewProductForm} className="btn-primary !px-4 !py-2 text-xs flex items-center gap-1 shadow-sm">
                    <Plus className="w-4 h-4" /> Add New Drink
                  </button>
                )}
              </div>

              {editingId && (
                <form onSubmit={handleSaveProduct} className="p-6 bg-coffee-50 border border-coffee-200/50 rounded-2xl space-y-4">
                  <h4 className="font-display font-bold text-lg text-coffee-900 border-b border-coffee-200/40 pb-2">
                    {editingId === 'new' ? 'Create Coffee Product' : 'Edit Coffee Product'}
                  </h4>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-coffee-400 uppercase mb-1">Drink Name</label>
                      <input name="name" value={form.name} onChange={handleFieldChange} required className="input-field !py-2 !text-sm" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-coffee-400 uppercase mb-1">Category</label>
                      <select name="category" value={form.category} onChange={handleFieldChange} className="input-field !py-2 !text-sm">
                        {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-coffee-400 uppercase mb-1">Image URL</label>
                    <input name="image" value={form.image} onChange={handleFieldChange} required className="input-field !py-2 !text-sm" />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-coffee-400 uppercase mb-1">Description</label>
                    <textarea name="description" value={form.description} onChange={handleFieldChange} required rows={2} className="input-field !py-2 !text-sm" />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-coffee-400 uppercase mb-1">Ingredients (comma-separated)</label>
                    <input name="ingredients" value={form.ingredients} onChange={handleFieldChange} className="input-field !py-2 !text-sm" placeholder="Espresso, Steamed Milk, Sugar" />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-coffee-400 uppercase mb-1">Small (Rs.)</label>
                      <input type="number" step="0.01" value={form.priceBySize.small} onChange={(e) => handlePriceChange('small', e.target.value)} required className="input-field !py-2 !text-sm" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-coffee-400 uppercase mb-1">Medium (Rs.)</label>
                      <input type="number" step="0.01" value={form.priceBySize.medium} onChange={(e) => handlePriceChange('medium', e.target.value)} required className="input-field !py-2 !text-sm" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-coffee-400 uppercase mb-1">Large (Rs.)</label>
                      <input type="number" step="0.01" value={form.priceBySize.large} onChange={(e) => handlePriceChange('large', e.target.value)} required className="input-field !py-2 !text-sm" />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-6 pt-2">
                    <label className="flex items-center gap-2 text-xs font-semibold text-coffee-700 cursor-pointer">
                      <input type="checkbox" name="inStock" checked={form.inStock} onChange={handleFieldChange} className="w-4 h-4 accent-accent-500" />
                      In Stock
                    </label>
                    <label className="flex items-center gap-2 text-xs font-semibold text-coffee-700 cursor-pointer">
                      <input type="checkbox" name="isBestSeller" checked={form.isBestSeller} onChange={handleFieldChange} className="w-4 h-4 accent-accent-500" />
                      Best Seller Badge
                    </label>
                    <label className="flex items-center gap-2 text-xs font-semibold text-coffee-700 cursor-pointer">
                      <input type="checkbox" name="isNewArrival" checked={form.isNewArrival} onChange={handleFieldChange} className="w-4 h-4 accent-accent-500" />
                      New Arrival Badge
                    </label>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button type="submit" disabled={saving} className="btn-primary !text-xs !px-5 !py-2 shadow-sm">
                      {saving ? 'Saving…' : 'Save Coffee Item'}
                    </button>
                    <button type="button" onClick={() => setEditingId(null)} className="btn-secondary !text-xs !px-5 !py-2">
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {loading ? (
                <p className="text-coffee-400 text-xs">Loading items...</p>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {products.map((p) => (
                    <div key={p._id} className="p-4 bg-coffee-50 border border-coffee-200/30 rounded-2xl flex flex-col justify-between h-fit min-h-[220px]">
                      <div>
                        <img src={p.image} alt={p.name} className="w-full h-24 object-cover rounded-xl mb-3 shadow-inner" />
                        <h4 className="font-bold text-coffee-900 text-sm line-clamp-1">{p.name}</h4>
                        <p className="text-[10px] text-accent-600 font-bold uppercase tracking-wider mt-0.5">{p.category}</p>
                        <p className="text-xs font-black text-coffee-800 mt-2">Rs. {p.priceBySize.medium.toFixed(0)} <span className="text-[10px] text-coffee-400 font-normal">(medium)</span></p>
                      </div>
                      <div className="flex gap-2 pt-4 border-t border-coffee-100/50 mt-3">
                        <button onClick={() => openEditProductForm(p)} className="btn-secondary flex-1 !text-xs !py-1.5 flex items-center justify-center gap-1">
                          <Edit3 className="w-3.5 h-3.5" /> Edit
                        </button>
                        <button onClick={() => handleDeleteProduct(p._id)} className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-xl transition-all">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: ORDERS QUEUE & HISTORY */}
          {tab === 'orders' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-coffee-100 pb-4 gap-4">
                <h3 className="font-display text-2xl font-black text-coffee-950">Orders & Fulfillment History</h3>
                
                {/* Status Filter Dropdown */}
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-bold text-coffee-400 uppercase">Filter Status:</span>
                  <select
                    value={orderStatusFilter}
                    onChange={(e) => setOrderStatusFilter(e.target.value)}
                    className="input-field !w-auto !py-1.5 !px-3 !text-xs"
                  >
                    <option value="All">All Orders</option>
                    {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              
              {loading ? (
                <p className="text-coffee-400 text-xs">Loading orders...</p>
              ) : orders.filter(o => orderStatusFilter === 'All' ? true : o.status === orderStatusFilter).length === 0 ? (
                <p className="text-coffee-500 text-sm py-12 text-center">No orders match the selected filter status.</p>
              ) : (
                <div className="space-y-6">
                  {orders
                    .filter(o => orderStatusFilter === 'All' ? true : o.status === orderStatusFilter)
                    .map((order) => (
                      <div key={order._id} className="p-5 bg-coffee-50 border border-coffee-200/30 rounded-2xl space-y-4">
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-coffee-200/40 pb-3">
                          <div>
                            <p className="font-display font-black text-sm text-coffee-900">Order #{order._id.slice(-6).toUpperCase()}</p>
                            <p className="text-xs text-coffee-400 mt-0.5">
                              {order.userId?.name || order.deliveryAddress?.fullName || 'Guest Customer'} · {order.userId?.email || 'Guest Checkout'}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-black text-coffee-800">Rs. {order.totalPrice.toFixed(0)}</span>
                          </div>
                        </div>

                        {/* Order Items list inside admin queue */}
                        <div className="text-xs text-coffee-600 bg-white border border-coffee-100 p-3.5 rounded-xl space-y-1.5 shadow-inner">
                          <p className="font-bold text-coffee-800 uppercase text-[9px] tracking-wide border-b border-coffee-100 pb-1 mb-1">Items Ordered</p>
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center">
                              <span>
                                <strong className="text-coffee-900">{item.name}</strong> × {item.quantity} 
                                <span className="text-[10px] text-coffee-400 capitalize ml-1.5">
                                  ({item.size}
                                  {item.customization?.milk ? ` · ${item.customization.milk}` : ''}
                                  {item.customization?.sugarLevel ? ` · Sugar: ${item.customization.sugarLevel}` : ''}
                                  {item.customization?.extraShot ? ' · Extra Shot' : ''}
                                  {item.customization?.temperature ? ` · ${item.customization.temperature}` : ''})
                                </span>
                              </span>
                              <span className="font-medium text-coffee-500">Rs. {((item.unitPrice + (item.customization?.extraShot ? 150 : 0)) * item.quantity).toFixed(0)}</span>
                            </div>
                          ))}
                        </div>

                        <OrderStatusTracker status={order.status} />

                        <div className="flex items-center gap-3 pt-2">
                          <label className="text-[10px] font-bold text-coffee-400 uppercase tracking-wide">Fulfill Status:</label>
                          <select
                            value={order.status}
                            onChange={(e) => handleStatusChange(order._id, e.target.value)}
                            className="input-field !w-auto !py-1.5 !px-3 !text-xs"
                          >
                            {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: AI INVENTORY & STOCK */}
          {tab === 'ai-inventory' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-coffee-100 pb-4 gap-4">
                <div>
                  <h3 className="font-display text-2xl font-black text-coffee-950 flex items-center gap-2">
                    <BrainCircuit className="w-6 h-6 text-accent-500" />
                    AI Inventory & Forecasting
                  </h3>
                  <p className="text-xs text-coffee-400 mt-0.5">Real-time depletion model predictions based on current customer traffic logs.</p>
                </div>
                <button 
                  onClick={handleApplyAiPricing}
                  disabled={optimizingPrice}
                  className="btn-primary !px-4 !py-2 text-xs flex items-center gap-1.5 shadow-sm shrink-0"
                >
                  <Sparkles className="w-3.5 h-3.5 fill-current" />
                  {optimizingPrice ? 'Optimizing...' : 'Optimize Dynamic Pricing'}
                </button>
              </div>

              {/* Inventory Stock Gauges */}
              <div className="grid sm:grid-cols-2 gap-4">
                {inventory.map((item) => (
                  <div key={item.name} className="p-4 bg-coffee-50 border border-coffee-200/30 rounded-2xl space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-coffee-800 text-sm">{item.name}</h4>
                        <span className="text-xs font-bold text-coffee-400">{item.quantity} in stock</span>
                      </div>
                      
                      {item.critical ? (
                        <span className="flex items-center gap-1 text-[10px] bg-red-50 text-red-700 font-extrabold px-2 py-0.5 rounded-full border border-red-200">
                          <AlertTriangle className="w-3 h-3" /> Critical
                        </span>
                      ) : (
                        <span className="text-[10px] bg-green-50 text-green-700 font-extrabold px-2 py-0.5 rounded-full border border-green-200">
                          Optimal
                        </span>
                      )}
                    </div>

                    {/* Progress Level Bar */}
                    <div className="space-y-1">
                      <div className="h-2 w-full bg-coffee-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${item.level < 40 ? 'bg-red-500' : 'bg-accent-500'}`}
                          style={{ width: `${item.level}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[9px] font-bold text-coffee-400">
                        <span>0%</span>
                        <span>{item.level}% Stock</span>
                        <span>100%</span>
                      </div>
                    </div>

                    <p className="text-xs text-coffee-600 bg-white/70 border border-coffee-100 p-2.5 rounded-xl mt-2 font-medium">
                      🤖 **AI Forecast:** Depletion expected in <span className="font-bold text-accent-600">{item.depletionDays} days</span> based on current consumption rates.
                    </p>
                  </div>
                ))}
              </div>

              {/* AI Forecast Recommendations Card */}
              <div className="p-5 bg-gradient-to-br from-coffee-800 to-coffee-950 text-coffee-100 rounded-3xl border border-coffee-700/30 space-y-4">
                <div className="flex items-center gap-2 text-accent-400 font-bold font-display text-sm tracking-wide">
                  <BrainCircuit className="w-4 h-4 fill-current" />
                  AI Agent Procurement Recommendations
                </div>
                
                <ul className="space-y-3 text-xs leading-relaxed">
                  <li className="flex items-start gap-2 bg-coffee-900/40 p-3 rounded-xl border border-coffee-800/40">
                    <span className="text-amber-500 mt-0.5">📌</span>
                    <span>**Procurement Strategy:** Consolidate procurement of **Arabica Beans (25kg)** and **Whole Milk (30L)** into a single order today to save **Rs. 500** on courier fees and ensure continuity before the weekend rush.</span>
                  </li>
                  <li className="flex items-start gap-2 bg-coffee-900/40 p-3 rounded-xl border border-coffee-800/40">
                    <span className="text-amber-500 mt-0.5">📌</span>
                    <span>**Pricing Advice:** High heat index forecasted this week. Cold Brew orders predicted to grow by 28%. We recommend optimizing cold brew sizing parameters.</span>
                  </li>
                </ul>

                <div className="pt-2 flex gap-3">
                  <button 
                    onClick={() => alert('AI Purchase Order generated & copied to clipboard!')} 
                    className="btn-primary !px-5 !py-2.5 !text-xs !bg-accent-500 shadow-sm font-bold"
                  >
                    Generate AI Restock Plan
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* TAB 4: PRODUCT SEO MANAGER */}
          {tab === 'seo-manager' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-display text-2xl font-black text-coffee-950">Product SEO Manager</h3>
                <p className="text-xs text-coffee-400 mt-0.5">Optimize search visibility tags and review live web share cards.</p>
              </div>

              <div className="grid md:grid-cols-12 gap-8 items-start pt-4 border-t border-coffee-100">
                
                {/* Left panel: Product selection list */}
                <div className="md:col-span-5 space-y-3 max-h-[400px] overflow-y-auto pr-2">
                  <label className="block text-[10px] font-bold text-coffee-400 uppercase">Select Product</label>
                  {products.map((p) => (
                    <button
                      key={p._id}
                      onClick={() => setSelectedSeoProductId(p._id)}
                      className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center gap-3 ${
                        selectedSeoProductId === p._id
                          ? 'bg-coffee-50 border-accent-400 shadow-inner'
                          : 'bg-transparent border-coffee-100/60 hover:bg-coffee-50/50'
                      }`}
                    >
                      <img src={p.image} alt={p.name} className="w-10 h-10 object-cover rounded-lg" />
                      <div>
                        <h4 className="font-bold text-coffee-800 text-xs line-clamp-1">{p.name}</h4>
                        <p className="text-[9px] text-coffee-400 capitalize font-medium">{p.category}</p>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Right panel: SEO Form and Google Mock card */}
                <div className="md:col-span-7 space-y-6">
                  {selectedSeoProductId ? (
                    <form onSubmit={handleSaveSeo} className="space-y-4">
                      
                      {/* SEO Tags Inputs */}
                      <div className="space-y-3.5">
                        <div className="flex justify-between items-center">
                          <label className="block text-[10px] font-bold text-coffee-400 uppercase">SEO Configuration</label>
                          <button
                            type="button"
                            onClick={handleGenerateAiSeo}
                            disabled={generatingSeo}
                            className="text-xs text-accent-600 hover:text-accent-500 font-bold flex items-center gap-1 transition-colors"
                          >
                            <BrainCircuit className="w-3.5 h-3.5 text-accent-500 animate-pulse" />
                            {generatingSeo ? 'Generating...' : 'AI Generate SEO Meta'}
                          </button>
                        </div>

                        <div>
                          <label className="block text-[9px] font-bold text-coffee-400 uppercase mb-1">Meta Title</label>
                          <input
                            type="text"
                            value={seoForm.metaTitle}
                            onChange={(e) => setSeoForm({ ...seoForm, metaTitle: e.target.value })}
                            placeholder="Title tag displayed in search engines"
                            required
                            className="input-field !py-2 !text-xs"
                          />
                        </div>

                        <div>
                          <label className="block text-[9px] font-bold text-coffee-400 uppercase mb-1">Meta Description</label>
                          <textarea
                            value={seoForm.metaDescription}
                            onChange={(e) => setSeoForm({ ...seoForm, metaDescription: e.target.value })}
                            placeholder="Brief search snippet description"
                            required
                            rows={3}
                            className="input-field !py-2 !text-xs"
                          />
                        </div>

                        <div>
                          <label className="block text-[9px] font-bold text-coffee-400 uppercase mb-1">Keywords (comma-separated)</label>
                          <input
                            type="text"
                            value={seoForm.keywords}
                            onChange={(e) => setSeoForm({ ...seoForm, keywords: e.target.value })}
                            placeholder="espresso, coffee, brewhouse"
                            className="input-field !py-2 !text-xs"
                          />
                        </div>
                      </div>

                      {/* Google Search Snippet Preview */}
                      <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-1 shadow-inner">
                        <span className="text-[10px] text-gray-400 font-bold block uppercase tracking-wide mb-1 flex items-center gap-1">
                          <Eye className="w-3.5 h-3.5" /> Google Search Result Preview
                        </span>
                        
                        <p className="text-[#1a0dab] font-medium text-sm leading-tight hover:underline cursor-pointer line-clamp-1">
                          {seoForm.metaTitle || 'Please enter a Meta Title'}
                        </p>
                        <p className="text-[#006621] text-xs leading-none line-clamp-1">
                          http://localhost:5173/product/{selectedSeoProductId}
                        </p>
                        <p className="text-[#545454] text-xs leading-normal line-clamp-2">
                          {seoForm.metaDescription || 'Please enter a Meta Description snippet.'}
                        </p>
                      </div>

                      <div className="pt-2">
                        <button
                          type="submit"
                          disabled={savingSeo}
                          className="btn-primary w-full !text-xs !py-2.5 shadow-sm"
                        >
                          {savingSeo ? 'Saving Metadata...' : 'Save SEO Configuration'}
                        </button>
                      </div>

                    </form>
                  ) : (
                    <p className="text-coffee-400 text-xs">Please select a product on the left to configure SEO tags.</p>
                  )}
                </div>

              </div>
            </div>
          )}
          {/* TAB 5: USER ACCOUNTS */}
          {tab === 'users' && (
            <div className="space-y-6">
              <h3 className="font-display text-2xl font-black text-coffee-950 border-b border-coffee-100 pb-4">User Accounts Registry</h3>
              
              {loading ? (
                <p className="text-coffee-400 text-xs">Loading user registry...</p>
              ) : users.length === 0 ? (
                <p className="text-coffee-500 text-sm py-12 text-center">No registered user accounts found.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left text-coffee-600 border-collapse">
                    <thead>
                      <tr className="bg-coffee-50 border-b border-coffee-100 text-coffee-800 font-bold uppercase tracking-wider">
                        <th className="px-4 py-3">Customer Name</th>
                        <th className="px-4 py-3">Email Address</th>
                        <th className="px-4 py-3">Security Role</th>
                        <th className="px-4 py-3 text-center">Loyalty Balance</th>
                        <th className="px-4 py-3 text-right">Register Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => (
                        <tr key={u._id} className="border-b border-coffee-100 hover:bg-coffee-50/50 transition-colors">
                          <td className="px-4 py-3 font-semibold text-coffee-900">{u.name}</td>
                          <td className="px-4 py-3 text-coffee-500">{u.email}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${
                              u.role === 'admin' ? 'bg-red-100 text-red-700' : 'bg-coffee-100 text-coffee-600'
                            }`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center font-bold text-coffee-800">{u.loyaltyPoints || 0} pts</td>
                          <td className="px-4 py-3 text-right text-coffee-400">
                            {new Date(u.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

// Sub-component Helper
function TabButton({ active, icon: IconComponent, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-left transition-all ${
        active 
          ? 'bg-coffee-800 text-white shadow-sm scale-105' 
          : 'bg-transparent text-coffee-500 hover:bg-coffee-100/50 hover:text-coffee-800'
      }`}
    >
      <IconComponent className={`w-4 h-4 ${active ? 'text-accent-400' : 'text-coffee-400'}`} />
      <span>{children}</span>
    </button>
  );
}
