import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Coffee, RefreshCw } from 'lucide-react';
import api from '../api/axios';

const STATUS_STEPS = ['Pending', 'Preparing', 'Out for Delivery', 'Delivered'];
const STATUS_EMOJI = {
  Pending: '🕐',
  Preparing: '☕',
  'Out for Delivery': '🛵',
  Delivered: '✅',
  Cancelled: '❌',
};

export default function ActiveOrderBar() {
  const [activeOrders, setActiveOrders] = useState([]);
  const [statuses, setStatuses] = useState({});

  // Load saved active orders from localStorage
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('brewhouse_active_orders') || '[]');
    // Filter only non-delivered/non-cancelled
    const pending = saved.filter(o => !['Delivered', 'Cancelled'].includes(o.status));
    setActiveOrders(pending);
    
    const initial = {};
    pending.forEach(o => { initial[o.id] = o.status || 'Pending'; });
    setStatuses(initial);
  }, []);

  // Poll every 6 seconds for all active orders
  useEffect(() => {
    if (activeOrders.length === 0) return;

    const poll = async () => {
      const updated = {};
      const toRemove = [];

      await Promise.all(
        activeOrders.map(async (order) => {
          try {
            const { data } = await api.get(`/orders/${order.id}`);
            updated[order.id] = data.status;
            // Once delivered or cancelled, schedule removal
            if (data.status === 'Delivered' || data.status === 'Cancelled') {
              toRemove.push(order.id);
            }
          } catch {
            // keep previous status on error
          }
        })
      );

      setStatuses(prev => ({ ...prev, ...updated }));

      // After a short delay remove delivered/cancelled orders from bar
      if (toRemove.length > 0) {
        setTimeout(() => {
          setActiveOrders(prev => {
            const remaining = prev.filter(o => !toRemove.includes(o.id));
            // Sync back to localStorage
            const saved = JSON.parse(localStorage.getItem('brewhouse_active_orders') || '[]');
            const updatedSaved = saved.map(o =>
              toRemove.includes(o.id) ? { ...o, status: updated[o.id] } : o
            );
            localStorage.setItem('brewhouse_active_orders', JSON.stringify(updatedSaved));
            return remaining;
          });
        }, 8000); // show "Delivered!" for 8 seconds before hiding
      }
    };

    poll(); // immediate first call
    const interval = setInterval(poll, 6000);
    return () => clearInterval(interval);
  }, [activeOrders]);

  const dismiss = (orderId) => {
    setActiveOrders(prev => prev.filter(o => o.id !== orderId));
    const saved = JSON.parse(localStorage.getItem('brewhouse_active_orders') || '[]');
    localStorage.setItem(
      'brewhouse_active_orders',
      JSON.stringify(saved.filter(o => o.id !== orderId))
    );
  };

  if (activeOrders.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-xs w-full">
      <AnimatePresence>
        {activeOrders.map((order) => {
          const status = statuses[order.id] || 'Pending';
          const stepIdx = STATUS_STEPS.indexOf(status);
          const isDelivered = status === 'Delivered';
          const isCancelled = status === 'Cancelled';

          return (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, x: 80, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 80, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
              className={`rounded-2xl shadow-2xl border text-white text-xs overflow-hidden ${
                isDelivered
                  ? 'bg-green-800 border-green-600'
                  : isCancelled
                  ? 'bg-red-900 border-red-700'
                  : 'bg-coffee-900 border-coffee-700'
              }`}
            >
              {/* Header */}
              <div className="flex justify-between items-center px-4 py-2.5 border-b border-white/10">
                <div className="flex items-center gap-2 font-bold">
                  <Coffee className="w-3.5 h-3.5 text-accent-400" />
                  <span className="text-coffee-100">Order #{order.id.slice(-6).toUpperCase()}</span>
                </div>
                <button
                  onClick={() => dismiss(order.id)}
                  className="text-white/50 hover:text-white transition-colors"
                  aria-label="Dismiss order bar"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Status */}
              <div className="px-4 py-3 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-base">{STATUS_EMOJI[status] || '🕐'}</span>
                  <span className={`font-black text-sm ${isDelivered ? 'text-green-300' : isCancelled ? 'text-red-300' : 'text-accent-300'}`}>
                    {status}
                  </span>
                  {!isDelivered && !isCancelled && (
                    <RefreshCw className="w-2.5 h-2.5 text-white/40 animate-spin ml-auto" />
                  )}
                </div>

                {/* Step progress bar */}
                {!isCancelled && (
                  <div className="flex gap-1 mt-1">
                    {STATUS_STEPS.map((step, i) => (
                      <div
                        key={step}
                        className={`h-1 flex-1 rounded-full transition-all duration-700 ${
                          i <= stepIdx ? (isDelivered ? 'bg-green-400' : 'bg-accent-500') : 'bg-white/20'
                        }`}
                      />
                    ))}
                  </div>
                )}

                {/* CTA link */}
                <Link
                  to={`/order-confirmation?orderId=${order.id}`}
                  className="block text-center text-[10px] font-bold text-white/60 hover:text-white transition-colors pt-1"
                >
                  View full tracking →
                </Link>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

// Utility: call this after placing an order to register it in the bar
export function registerActiveOrder(orderId) {
  const saved = JSON.parse(localStorage.getItem('brewhouse_active_orders') || '[]');
  const already = saved.find(o => o.id === orderId);
  if (!already) {
    saved.unshift({ id: orderId, status: 'Pending', placedAt: Date.now() });
    localStorage.setItem('brewhouse_active_orders', JSON.stringify(saved));
  }
}
