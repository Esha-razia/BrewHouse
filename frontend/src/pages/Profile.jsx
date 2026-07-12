import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import OrderStatusTracker from '../components/OrderStatusTracker';
import { motion } from 'framer-motion';
import { Coffee, User, MapPin, Mail, Sparkles, Award, ClipboardList, PenTool, CheckCircle, RefreshCcw } from 'lucide-react';

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const highlightedOrderId = searchParams.get('orderId');

  const [form, setForm] = useState({
    name: user?.name || '',
    line1: user?.address?.line1 || '',
    city: user?.address?.city || '',
    state: user?.address?.state || '',
    postalCode: user?.address?.postalCode || '',
    country: user?.address?.country || '',
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  const loadOrders = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/orders/myorders');
      setOrders(data);
    } catch (err) {
      console.error('Failed to load orders', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setSaveMessage('');
    try {
      await updateProfile({
        name: form.name,
        address: {
          line1: form.line1,
          city: form.city,
          state: form.state,
          postalCode: form.postalCode,
          country: form.country,
        },
      });
      setSaveMessage('Profile updated successfully.');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (err) {
      setSaveMessage('Could not save changes. Please try again.');
    } finally {
      setSavingProfile(false);
    }
  };

  // Loyalty Card calculations
  const totalPoints = user?.loyaltyPoints || 0;
  const stamps = totalPoints % 8; // Card has 8 slots
  const freeDrinksEarned = Math.floor(totalPoints / 8);
  const remainingStamps = 8 - stamps;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10"
    >
      <div className="grid md:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Loyalty Card & Profile Forms */}
        <div className="md:col-span-4 space-y-6">
          
          {/* Digital Loyalty Card */}
          <div className="relative overflow-hidden bg-gradient-to-br from-coffee-800 to-coffee-950 text-coffee-50 p-6 rounded-3xl shadow-card border border-coffee-700/40">
            <div className="absolute top-0 right-0 w-24 h-24 bg-accent-500/10 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-1.5">
                <Coffee className="w-5 h-5 text-accent-400" />
                <span className="font-display font-bold text-sm tracking-widest uppercase">Brew Club</span>
              </div>
              <span className="text-[10px] bg-accent-500 text-white font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5 uppercase">
                <Sparkles className="w-2.5 h-2.5" /> VIP
              </span>
            </div>

            <p className="text-xl font-display font-black text-white mt-1">Loyalty Card</p>
            <p className="text-xs text-coffee-300 mt-0.5">Collect 8 stamps to get a free drink!</p>

            {/* Stamp Slots Grid (8 Slots) */}
            <div className="grid grid-cols-4 gap-3 my-5">
              {Array.from({ length: 8 }).map((_, idx) => {
                const isStamped = idx < stamps;
                return (
                  <motion.div
                    key={idx}
                    initial={isStamped ? { scale: 0.8, opacity: 0 } : false}
                    animate={isStamped ? { scale: 1, opacity: 1 } : false}
                    transition={{ type: 'spring', delay: idx * 0.05 }}
                    className={`aspect-square rounded-full flex items-center justify-center border-2 transition-all relative ${
                      isStamped
                        ? 'bg-accent-500 border-accent-500 text-white shadow-md'
                        : 'bg-coffee-900/30 border-coffee-700/50 text-coffee-600'
                    }`}
                  >
                    {isStamped ? (
                      <Coffee className="w-5 h-5 fill-current" />
                    ) : (
                      <span className="text-xs font-bold text-coffee-700">{idx + 1}</span>
                    )}
                    {isStamped && (
                      <span className="absolute -top-1 -right-1 bg-white text-accent-600 p-0.5 rounded-full border border-accent-500">
                        <CheckCircle className="w-2 h-2 fill-current" />
                      </span>
                    )}
                  </motion.div>
                );
              })}
            </div>

            {/* Card Footer Statistics */}
            <div className="pt-3 border-t border-coffee-800/80 flex justify-between items-center text-xs">
              <div>
                <p className="text-[10px] text-coffee-400 font-bold uppercase tracking-wide">Earned Free Drinks</p>
                <p className="text-sm font-black text-accent-400 mt-0.5">{freeDrinksEarned} Drinks</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-coffee-400 font-bold uppercase tracking-wide">Next Reward</p>
                <p className="text-xs font-medium text-coffee-200 mt-0.5">
                  {remainingStamps} stamp{remainingStamps > 1 ? 's' : ''} left
                </p>
              </div>
            </div>
          </div>

          {/* Profile & Address info */}
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-4">
              <User className="w-5 h-5 text-accent-500" />
              <h2 className="text-lg font-bold text-coffee-900 font-display">My Details</h2>
            </div>
            
            <p className="text-xs text-coffee-400 mb-5 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5" />
              {user?.email}
            </p>

            <form onSubmit={handleSaveProfile} className="space-y-3.5">
              <div>
                <label className="block text-[10px] font-bold text-coffee-400 uppercase mb-1">Full Name</label>
                <input name="name" value={form.name} onChange={handleChange} className="input-field !py-2 !text-sm" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-coffee-400 uppercase mb-1">Address Line</label>
                <input name="line1" value={form.line1} onChange={handleChange} className="input-field !py-2 !text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input name="city" value={form.city} onChange={handleChange} placeholder="City" className="input-field !py-2 !text-sm" />
                <input name="state" value={form.state} onChange={handleChange} placeholder="State" className="input-field !py-2 !text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input name="postalCode" value={form.postalCode} onChange={handleChange} placeholder="Postal Code" className="input-field !py-2 !text-sm" />
                <input name="country" value={form.country} onChange={handleChange} placeholder="Country" className="input-field !py-2 !text-sm" />
              </div>
              
              <button type="submit" disabled={savingProfile} className="btn-secondary w-full !text-xs !py-2 mt-2 shadow-sm">
                {savingProfile ? 'Saving Changes…' : 'Save Changes'}
              </button>
              
              {saveMessage && (
                <p className="text-xs font-semibold text-center text-accent-600 mt-2 bg-accent-50 p-2 rounded-lg border border-accent-100">
                  {saveMessage}
                </p>
              )}
            </form>
          </div>
        </div>

        {/* Right Column: Order History List */}
        <div className="md:col-span-8 space-y-6">
          <div className="flex items-center justify-between border-b border-coffee-200 pb-3">
            <h2 className="text-xl font-extrabold text-coffee-950 font-display flex items-center gap-2">
              <ClipboardList className="w-5.5 h-5.5 text-accent-500" />
              Order History
            </h2>
            <button
              onClick={loadOrders}
              className="text-xs text-coffee-500 hover:text-accent-500 flex items-center gap-1 transition-colors"
            >
              <RefreshCcw className="w-3.5 h-3.5" /> Refresh List
            </button>
          </div>

          {loading && (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-coffee-400">
              <Coffee className="w-8 h-8 animate-spin text-accent-500" />
              <p className="text-sm">Loading your orders...</p>
            </div>
          )}

          {!loading && orders.length === 0 && (
            <div className="text-center py-20 bg-white border border-coffee-100 rounded-3xl p-6">
              <Coffee className="w-12 h-12 text-coffee-300 mx-auto mb-3" />
              <h3 className="font-bold text-coffee-800">No Orders Found</h3>
              <p className="text-xs text-coffee-500 mt-1 max-w-xs mx-auto">You haven't ordered any delicious coffee yet. Head over to our Menu page to place your first order!</p>
            </div>
          )}

          {!loading && orders.length > 0 && (
            <div className="space-y-6">
              {orders.map((order) => (
                <motion.div
                  key={order._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`card p-6 bg-white relative overflow-hidden transition-all duration-300 ${
                    highlightedOrderId === order._id ? 'ring-2 ring-accent-500/80 shadow-md' : 'hover:border-coffee-200'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-5 pb-3 border-b border-coffee-100/50">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-display font-black text-base text-coffee-800">
                          Order #{order._id.slice(-6).toUpperCase()}
                        </span>
                        <span className="text-[10px] bg-coffee-100 text-coffee-600 font-bold px-2.5 py-0.5 rounded">
                          {order.paymentMethod}
                        </span>
                      </div>
                      <p className="text-xs text-coffee-400 mt-0.5">
                        {new Date(order.createdAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-coffee-400 font-bold block uppercase tracking-wide">Grand Total</span>
                      <span className="font-display text-xl font-black text-coffee-800">Rs. {order.totalPrice.toFixed(0)}</span>
                    </div>
                  </div>

                  {/* Real-time Interactive Brewing Simulator */}
                  <OrderStatusTracker status={order.status} />

                  {/* Address Summary */}
                  <div className="mt-5 p-3.5 bg-coffee-50 rounded-2xl border border-coffee-100/30 text-xs text-coffee-600">
                    <p className="font-bold text-coffee-800 mb-1 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-accent-500" /> Delivery Address:
                    </p>
                    <p>{order.deliveryAddress.fullName} · {order.deliveryAddress.phone}</p>
                    <p className="text-coffee-500 mt-0.5">
                      {order.deliveryAddress.line1}, {order.deliveryAddress.city}, {order.deliveryAddress.state} {order.deliveryAddress.postalCode}
                    </p>
                  </div>

                  {/* Order Items */}
                  <div className="mt-4 pt-3.5 border-t border-coffee-100/40">
                    <p className="text-[10px] font-bold text-coffee-400 uppercase tracking-wide mb-2">Items Ordered</p>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-3 bg-white p-2 rounded-xl border border-coffee-100/40">
                          <img src={item.image} alt={item.name} className="w-10 h-10 object-cover rounded-lg" />
                          <div>
                            <p className="text-xs font-bold text-coffee-800">{item.name} × {item.quantity}</p>
                            <p className="text-[10px] text-coffee-500 capitalize">
                              Size: {item.size} {item.customization?.milk ? `· ${item.customization.milk}` : ''}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </motion.div>
              ))}
            </div>
          )}
        </div>

      </div>
    </motion.div>
  );
}
