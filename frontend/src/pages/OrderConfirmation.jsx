import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Coffee, Home, RefreshCw } from 'lucide-react';
import api from '../api/axios';
import OrderStatusTracker from '../components/OrderStatusTracker';
import { registerActiveOrder } from '../components/ActiveOrderBar';

export default function OrderConfirmation() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  // Register this order in the global floating bar (localStorage)
  useEffect(() => {
    if (orderId) registerActiveOrder(orderId);
  }, [orderId]);

  useEffect(() => {
    if (!orderId) return;

    const fetchOrder = async () => {
      try {
        const { data } = await api.get(`/orders/${orderId}`);
        setOrder(data);
      } catch (err) {
        console.error('Failed to load order details', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
    // Poll for real-time changes every 5 seconds
    const pollInterval = setInterval(fetchOrder, 5000);
    return () => clearInterval(pollInterval);
  }, [orderId]);

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-coffee-50/50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="max-w-xl w-full text-center space-y-6 bg-white border border-coffee-100 rounded-3xl p-6 sm:p-10 shadow-lg"
      >
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-green-50 border border-green-200 rounded-full flex items-center justify-center">
            <CheckCircle className="w-9 h-9 text-green-500" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="font-display text-3xl font-black text-coffee-950">Order Placed!</h1>
          <p className="text-coffee-500 text-sm leading-relaxed max-w-md mx-auto">
            Thank you for ordering with BrewHouse! Your order has been registered and is being prepared with fresh premium beans.
          </p>
        </div>

        {orderId && (
          <div className="bg-coffee-50 border border-coffee-100 rounded-2xl px-5 py-3.5 text-sm w-fit mx-auto min-w-[200px]">
            <p className="text-coffee-400 font-bold uppercase text-[9px] tracking-widest">Order Reference</p>
            <p className="font-display font-black text-coffee-800 text-base mt-1">#{orderId.slice(-8).toUpperCase()}</p>
          </div>
        )}

        {/* Live Order Status Simulator Section */}
        {orderId && (
          <div className="border border-coffee-100 rounded-2xl p-5 bg-white shadow-sm space-y-4">
            <div className="flex justify-between items-center text-xs border-b border-coffee-100 pb-2">
              <span className="font-bold text-coffee-400 uppercase tracking-wider flex items-center gap-1.5">
                <RefreshCw className="w-3.5 h-3.5 text-accent-500 animate-spin" /> Live Order Tracking
              </span>
              <span className="font-bold text-accent-600 bg-accent-50 px-2 py-0.5 rounded-full capitalize">
                Status: {order ? order.status : 'Fetching...'}
              </span>
            </div>

            {loading && !order ? (
              <p className="text-xs text-coffee-400 py-3">Connecting to roastery queue...</p>
            ) : order ? (
              <div className="space-y-4">
                <OrderStatusTracker status={order.status} />
                
                {/* Delivery details display for reassurance */}
                <div className="text-left text-xs bg-coffee-50/50 p-3 rounded-xl border border-coffee-100 space-y-1">
                  <p className="font-bold text-coffee-800">Delivering to:</p>
                  <p>{order.deliveryAddress?.fullName} · {order.deliveryAddress?.phone}</p>
                  <p className="text-coffee-400 mt-0.5">{order.deliveryAddress?.line1}, {order.deliveryAddress?.city}</p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-red-500">Could not retrieve order details. Please check connection.</p>
            )}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 pt-2 max-w-sm mx-auto">
          <Link to="/menu" className="btn-primary flex-1 flex items-center justify-center gap-2 !py-3">
            <Coffee className="w-4 h-4" /> Order More
          </Link>
          <Link to="/" className="btn-secondary flex-1 flex items-center justify-center gap-2 !py-3">
            Home
          </Link>
        </div>
        
        <p className="text-[10px] text-coffee-300">
          This tracking page will auto-update in real time as our baristas process your order.
        </p>
      </motion.div>
    </div>
  );
}
