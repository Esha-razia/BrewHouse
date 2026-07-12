import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Coffee, Clock, ShieldCheck, ArrowRight, RefreshCw, Clipboard } from 'lucide-react';
import api from '../api/axios';
import OrderStatusTracker from '../components/OrderStatusTracker';

export default function OrderQueue() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [queue, setQueue] = useState([]);
  const [loadingQueue, setLoadingQueue] = useState(true);
  const [pollError, setPollError] = useState('');
  
  // Track specific order state
  const trackIdParam = searchParams.get('track') || '';
  const [trackIdInput, setTrackIdInput] = useState(trackIdParam);
  const [trackedOrder, setTrackedOrder] = useState(null);
  const [loadingTrack, setLoadingTrack] = useState(false);
  const [trackError, setTrackError] = useState('');
  
  // Recent orders list from localStorage
  const [recentOrders, setRecentOrders] = useState([]);

  // Load recent local orders
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('brewhouse_active_orders') || '[]');
    setRecentOrders(saved);
  }, [trackIdParam]);

  // Fetch all active queue orders
  const fetchQueue = async () => {
    try {
      const { data } = await api.get('/orders/public-queue');
      setQueue(data);
      setPollError('');
    } catch (err) {
      setPollError('Failed to fetch the kitchen order queue.');
    } finally {
      setLoadingQueue(false);
    }
  };

  useEffect(() => {
    fetchQueue();
    const interval = setInterval(fetchQueue, 7000);
    return () => clearInterval(interval);
  }, []);

  // Track specific order by ID
  const fetchTrackedOrder = async (id) => {
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      setTrackError('Please enter a valid 24-character Order ID.');
      setTrackedOrder(null);
      return;
    }
    setLoadingTrack(true);
    setTrackError('');
    try {
      const { data } = await api.get(`/orders/${id}`);
      setTrackedOrder(data);
    } catch (err) {
      setTrackError('Order not found. Please double-check your Order ID.');
      setTrackedOrder(null);
    } finally {
      setLoadingTrack(false);
    }
  };

  useEffect(() => {
    if (trackIdParam) {
      fetchTrackedOrder(trackIdParam);
    } else {
      setTrackedOrder(null);
    }
  }, [trackIdParam]);

  const handleTrackSubmit = (e) => {
    e.preventDefault();
    const cleanId = trackIdInput.trim();
    if (cleanId) {
      setSearchParams({ track: cleanId });
    } else {
      setSearchParams({});
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Order ID copied!');
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-3 sm:px-6 py-6 sm:py-10 space-y-8">
      
      {/* Page Header */}
      <div className="text-center space-y-3">
        <span className="text-accent-600 text-xs font-bold uppercase tracking-widest bg-accent-50 px-3 py-1 rounded-full">
          Real-Time Tracking
        </span>
        <h1 className="text-2xl sm:text-4xl font-black text-coffee-950 font-display">
          Track Your Order
        </h1>
        <p className="text-coffee-600 text-sm px-2">
          Enter your order ID below to trace the preparation progress of your cup.
        </p>
      </div>

      {/* Track Specific Order */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-coffee-100 p-4 sm:p-8 shadow-sm space-y-5">
        <h2 className="text-lg sm:text-xl font-bold text-coffee-900 flex items-center gap-2">
          <Clock className="w-5 h-5 text-accent-500 shrink-0" />
          Track My Order
        </h2>

        {/* Search Form — stacks on mobile */}
        <form onSubmit={handleTrackSubmit} className="flex flex-col sm:flex-row gap-2 w-full">
          <input
            type="text"
            placeholder="Enter your 24-character Order ID"
            value={trackIdInput}
            onChange={(e) => setTrackIdInput(e.target.value)}
            className="input-field w-full min-w-0"
          />
          <button
            type="submit"
            className="btn-primary !rounded-xl !px-5 flex items-center justify-center gap-1.5 shrink-0 w-full sm:w-auto"
          >
            <Search className="w-4 h-4" />
            Track
          </button>
        </form>

        {/* Error Message */}
        {trackError && (
          <p className="text-xs text-red-600 font-semibold bg-red-50 p-3 rounded-xl border border-red-100">
            ⚠️ {trackError}
          </p>
        )}

        {/* Tracked Order Result */}
        <AnimatePresence mode="wait">
          {loadingTrack ? (
            <div className="py-10 flex flex-col items-center gap-2 text-coffee-400">
              <RefreshCw className="w-6 h-6 animate-spin text-accent-500" />
              <p className="text-xs">Locating your order...</p>
            </div>
          ) : trackedOrder ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-5 pt-2 border-t border-coffee-100/60"
            >
              {/* Order ID + Status row — stacks on small screens */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-coffee-50 p-4 rounded-2xl border border-coffee-100">
                <div className="min-w-0">
                  <p className="text-[10px] text-coffee-400 font-bold uppercase tracking-wider mb-1">Order ID</p>
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="font-mono text-[11px] font-bold text-coffee-800 break-all leading-snug">
                      {trackedOrder._id}
                    </span>
                    <button
                      onClick={() => copyToClipboard(trackedOrder._id)}
                      className="p-1 hover:bg-coffee-200 rounded text-coffee-500 transition-colors shrink-0"
                      title="Copy ID"
                    >
                      <Clipboard className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <div className="sm:text-right shrink-0">
                  <p className="text-[10px] text-coffee-400 font-bold uppercase tracking-wider mb-1">Status</p>
                  <span className={`inline-block text-xs font-bold px-3 py-1 rounded-full ${
                    trackedOrder.status === 'Pending' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                    trackedOrder.status === 'Preparing' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                    trackedOrder.status === 'Out for Delivery' ? 'bg-purple-100 text-purple-700 border border-purple-200' :
                    trackedOrder.status === 'Delivered' ? 'bg-green-100 text-green-700 border border-green-200' :
                    'bg-gray-100 text-gray-700 border border-gray-200'
                  }`}>
                    {trackedOrder.status}
                  </span>
                </div>
              </div>

              {/* Order Status Tracker Stepper */}
              <OrderStatusTracker status={trackedOrder.status} />

              {/* Order Summary */}
              <div className="bg-coffee-50/50 p-4 sm:p-5 rounded-2xl border border-coffee-100 space-y-3">
                <p className="text-xs font-bold uppercase text-coffee-400 tracking-wider">Order Summary</p>
                <div className="space-y-2">
                  {trackedOrder.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-start gap-2 text-sm text-coffee-800">
                      <div className="min-w-0">
                        <span className="font-bold break-words">{item.name}</span>
                        <span className="text-xs text-coffee-500 capitalize ml-1.5">({item.size})</span>
                      </div>
                      <span className="shrink-0">x{item.quantity}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-coffee-200/50 pt-2 flex justify-between items-center text-sm font-bold text-coffee-900">
                  <span>Total Paid</span>
                  <span className="text-accent-600">Rs. {trackedOrder.totalPrice.toFixed(0)}</span>
                </div>
              </div>
            </motion.div>
          ) : (
            trackIdParam && !trackError && (
              <p className="text-sm text-coffee-500 text-center py-6">Please check the ID and try again.</p>
            )
          )}
        </AnimatePresence>
      </div>

      {/* Local Active Orders Quick Access */}
      {recentOrders.length > 0 && (
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-coffee-100 p-4 sm:p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-coffee-800 uppercase tracking-wider">Your Recent Orders</h3>
          <div className="grid gap-2">
            {recentOrders.map((order) => (
              <div
                key={order.id}
                onClick={() => {
                  setTrackIdInput(order.id);
                  setSearchParams({ track: order.id });
                }}
                className={`p-3.5 rounded-xl border border-coffee-100 hover:border-accent-400 hover:bg-coffee-50/30 cursor-pointer flex items-center justify-between gap-3 transition-all ${
                  trackIdParam === order.id ? 'bg-accent-50/20 border-accent-300' : 'bg-white'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-coffee-100 flex items-center justify-center text-lg shrink-0">☕</div>
                  <div className="min-w-0">
                    <p className="font-mono text-xs font-bold text-coffee-800 truncate">ID: {order.id.slice(0, 12)}...</p>
                    <p className="text-[10px] text-coffee-400">Rs. {order.totalPrice}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-xs font-semibold text-coffee-500 capitalize">{order.status || 'Active'}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-coffee-400" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
