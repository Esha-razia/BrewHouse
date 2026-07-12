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
    alert('Order ID copied to clipboard!');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      
      {/* Page Header */}
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <span className="text-accent-600 text-xs font-bold uppercase tracking-widest bg-accent-50 px-3 py-1 rounded-full">
          Live Kitchen Dashboard
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-coffee-950 font-display">
          BrewHouse Order Queue
        </h1>
        <p className="text-coffee-600 text-sm">
          Track the live status of all active orders in our kitchen, or enter your order ID to trace your specific cup.
        </p>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Track Specific Order */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-3xl border border-coffee-100 p-6 sm:p-8 shadow-sm space-y-6">
            <h2 className="text-xl font-bold text-coffee-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-accent-500" />
              Track My Order (No Login Required)
            </h2>

            <form onSubmit={handleTrackSubmit} className="flex gap-2">
              <input
                type="text"
                placeholder="Enter 24-character Order ID (e.g. 64b2d1...)"
                value={trackIdInput}
                onChange={(e) => setTrackIdInput(e.target.value)}
                className="input-field flex-1"
              />
              <button type="submit" className="btn-primary !rounded-xl !px-6 flex items-center gap-1.5">
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
                <div className="py-12 flex flex-col items-center gap-2 text-coffee-400">
                  <RefreshCw className="w-6 h-6 animate-spin text-accent-500" />
                  <p className="text-xs">Locating your order...</p>
                </div>
              ) : trackedOrder ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6 pt-2 border-t border-coffee-100/60"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 bg-coffee-50 p-4 rounded-2xl border border-coffee-100">
                    <div>
                      <p className="text-[10px] text-coffee-400 font-bold uppercase tracking-wider">Order ID</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="font-mono text-xs font-bold text-coffee-800">{trackedOrder._id}</span>
                        <button 
                          onClick={() => copyToClipboard(trackedOrder._id)}
                          className="p-1 hover:bg-coffee-200 rounded text-coffee-500 transition-colors"
                          title="Copy ID"
                        >
                          <Clipboard className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-coffee-400 font-bold uppercase tracking-wider">Status</p>
                      <span className={`inline-block mt-1 text-xs font-bold px-3 py-1 rounded-full ${
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

                  {/* Order Status Tracker Stepper Component */}
                  <OrderStatusTracker status={trackedOrder.status} />

                  {/* Order Summary details */}
                  <div className="bg-coffee-50/50 p-5 rounded-2xl border border-coffee-100 space-y-3">
                    <p className="text-xs font-bold uppercase text-coffee-400 tracking-wider">Order Summary</p>
                    <div className="space-y-2">
                      {trackedOrder.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center text-sm text-coffee-800">
                          <div>
                            <span className="font-bold">{item.name}</span>
                            <span className="text-xs text-coffee-500 capitalize ml-1.5">({item.size})</span>
                          </div>
                          <span>x{item.quantity}</span>
                        </div>
                      ))}
                    </div>
                    <div className="border-t border-coffee-200/50 pt-2 flex justify-between items-center text-sm font-bold text-coffee-900">
                      <span>Total Amount Paid</span>
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
            <div className="bg-white rounded-3xl border border-coffee-100 p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-coffee-800 uppercase tracking-wider">Your Recent Active Orders</h3>
              <div className="grid gap-2">
                {recentOrders.map((order) => (
                  <div 
                    key={order.id}
                    onClick={() => {
                      setTrackIdInput(order.id);
                      setSearchParams({ track: order.id });
                    }}
                    className={`p-3.5 rounded-xl border border-coffee-100 hover:border-accent-400 hover:bg-coffee-50/30 cursor-pointer flex items-center justify-between transition-all ${
                      trackIdParam === order.id ? 'bg-accent-50/20 border-accent-300' : 'bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-coffee-100 flex items-center justify-center text-lg">☕</div>
                      <div>
                        <p className="font-mono text-xs font-bold text-coffee-800">Order ID: {order.id.slice(0, 8)}...</p>
                        <p className="text-[10px] text-coffee-400">Total: Rs. {order.totalPrice}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-coffee-500 capitalize">{order.status || 'Active'}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-coffee-400" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Live Kitchen Queue List */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl border border-coffee-100 p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-coffee-950 flex items-center gap-2 font-display">
                <Coffee className="w-5 h-5 text-accent-600 animate-pulse" />
                Live Preparation Queue
              </h2>
              <button 
                onClick={fetchQueue}
                className="p-1.5 text-coffee-400 hover:text-accent-500 rounded-lg hover:bg-coffee-50 transition-colors"
                title="Refresh Queue"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            {loadingQueue ? (
              <div className="py-12 flex justify-center text-coffee-400">
                <RefreshCw className="w-6 h-6 animate-spin text-accent-500" />
              </div>
            ) : pollError ? (
              <p className="text-xs text-red-500 text-center py-6">{pollError}</p>
            ) : queue.length === 0 ? (
              <div className="text-center py-10 space-y-3">
                <div className="text-3xl">☕✨</div>
                <p className="text-sm font-semibold text-coffee-800">All caught up!</p>
                <p className="text-xs text-coffee-400">There are no orders currently being prepared in the kitchen. Order yours now!</p>
                <Link to="/menu" className="btn-primary !px-5 !py-2 text-xs inline-block">Order Now</Link>
              </div>
            ) : (
              <div className="space-y-3.5">
                {queue.map((item, idx) => (
                  <div 
                    key={item._id}
                    className="p-4 rounded-2xl border border-coffee-100 bg-coffee-50/30 flex items-start justify-between gap-4 relative overflow-hidden"
                  >
                    {/* Position tag */}
                    <div className="absolute top-0 left-0 bg-coffee-700 text-white text-[9px] font-bold px-2 py-0.5 rounded-br-lg shadow-sm">
                      #{idx + 1}
                    </div>

                    <div className="space-y-1.5 pt-1">
                      <p className="text-xs font-bold text-coffee-900 mt-1">Customer: {item.customerName}</p>
                      <div className="space-y-1">
                        {item.items.map((itemDetail, itemIdx) => (
                          <p key={itemIdx} className="text-[11px] text-coffee-500 leading-normal">
                            <span className="font-semibold text-coffee-700">{itemDetail.name}</span> ({itemDetail.size}) x{itemDetail.quantity}
                          </p>
                        ))}
                      </div>
                    </div>

                    <div className="text-right flex flex-col items-end gap-1 pt-1">
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider ${
                        item.status === 'Pending' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                        item.status === 'Preparing' ? 'bg-blue-100 text-blue-700 border border-blue-200 animate-pulse' :
                        'bg-purple-100 text-purple-700 border border-purple-200'
                      }`}>
                        {item.status}
                      </span>
                      <span className="text-[9px] text-coffee-400 font-semibold mt-1">
                        {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
