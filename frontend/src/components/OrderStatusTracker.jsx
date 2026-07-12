import { motion } from 'framer-motion';
import { Coffee, Bike, CheckCircle2, Flame, Loader2, Sparkles } from 'lucide-react';

const STEPS = ['Pending', 'Preparing', 'Out for Delivery', 'Delivered'];

export default function OrderStatusTracker({ status }) {
  if (status === 'Cancelled') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 text-red-700">
        <span className="text-xl">⚠️</span>
        <div>
          <p className="font-bold text-sm">This order was cancelled.</p>
          <p className="text-xs text-red-500">Please contact support or try placing a new order.</p>
        </div>
      </div>
    );
  }

  const currentIndex = STEPS.indexOf(status);

  return (
    <div className="flex flex-col gap-6 w-full bg-coffee-50/50 border border-coffee-100 rounded-2xl p-5 shadow-sm">
      
      {/* Dynamic Brewing Simulator Console */}
      <div className="flex flex-col items-center justify-center py-4 bg-white border border-coffee-100/60 rounded-xl shadow-inner relative overflow-hidden h-36">
        
        {/* Grinding State */}
        {status === 'Pending' && (
          <div className="flex flex-col items-center text-center px-4 animate-grind">
            <motion.div
              animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
              transition={{ repeat: Infinity, duration: 0.5 }}
              className="text-4xl"
            >
              🫘
            </motion.div>
            <p className="text-sm font-bold text-coffee-800 mt-2 flex items-center gap-1.5 justify-center">
              <Loader2 className="w-4 h-4 animate-spin text-accent-500" />
              Grinding Fresh Arabica...
            </p>
            <p className="text-xs text-coffee-500 mt-1">Our baristas are preparing your batch.</p>
          </div>
        )}

        {/* Preparing (Brewing) State */}
        {status === 'Preparing' && (
          <div className="flex flex-col items-center justify-center text-center relative px-4">
            {/* Steam rising */}
            <div className="absolute -top-6 flex gap-1 justify-center w-full">
              <span className="w-1.5 h-6 bg-coffee-300/30 rounded-full animate-steam-1" />
              <span className="w-1.5 h-6 bg-coffee-300/30 rounded-full animate-steam-2" />
              <span className="w-1.5 h-6 bg-coffee-300/30 rounded-full animate-steam-3" />
            </div>

            {/* Coffee machine extraction */}
            <div className="flex flex-col items-center">
              <div className="relative">
                <Coffee className="w-12 h-12 text-coffee-700" />
                {/* Coffee drip */}
                <div className="absolute left-1/2 -translate-x-1/2 bottom-0 w-1 h-8 bg-coffee-600 rounded-full origin-top animate-drip" />
              </div>
              <p className="text-sm font-bold text-coffee-800 mt-4 flex items-center gap-1.5 justify-center">
                <Flame className="w-4 h-4 text-accent-500 animate-pulse" />
                Extracting Rich Espresso...
              </p>
              <p className="text-xs text-coffee-500 mt-1">Steaming milk and infusing flavors.</p>
            </div>
          </div>
        )}

        {/* Out for Delivery State */}
        {status === 'Out for Delivery' && (
          <div className="flex flex-col items-center justify-center text-center w-full px-6 overflow-hidden">
            <div className="relative w-full flex items-center justify-center h-12">
              {/* Bike riding */}
              <motion.div
                animate={{ x: [-100, 100] }}
                transition={{ repeat: Infinity, duration: 4, ease: 'linear' }}
                className="animate-bike absolute text-accent-500 flex flex-col items-center"
              >
                <Bike className="w-10 h-10" />
                <span className="text-[10px] bg-accent-500 text-white font-bold px-1.5 py-0.5 rounded-md -mt-1 shadow-sm">HOT</span>
              </motion.div>
              
              {/* Road line */}
              <div className="absolute bottom-0 w-full h-0.5 bg-coffee-200" />
            </div>
            
            <p className="text-sm font-bold text-coffee-800 mt-4">Out for Delivery!</p>
            <p className="text-xs text-coffee-500 mt-1">Our delivery rider is speeding to your location.</p>
          </div>
        )}

        {/* Delivered State */}
        {status === 'Delivered' && (
          <div className="flex flex-col items-center text-center px-4">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', damping: 10 }}
              className="bg-green-100 p-3 rounded-full text-green-600 mb-2"
            >
              <CheckCircle2 className="w-8 h-8" />
            </motion.div>
            <p className="text-sm font-bold text-green-800 flex items-center gap-1">
              <Sparkles className="w-4 h-4 text-accent-500" />
              Delivered & Enjoyed!
            </p>
            <p className="text-xs text-coffee-500 mt-1">We hope you loved your BrewHouse experience.</p>
          </div>
        )}
      </div>

      {/* Standard Progress bar */}
      <div className="flex items-center w-full px-0 sm:px-2 overflow-hidden">
        {STEPS.map((step, i) => (
          <div key={step} className="flex items-center flex-1 last:flex-none min-w-0">
            <div className="flex flex-col items-center min-w-0">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: i <= currentIndex ? 1.05 : 1 }}
                className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all relative shrink-0 ${
                  i <= currentIndex ? 'bg-accent-500 text-white shadow-sm' : 'bg-coffee-100 text-coffee-400'
                }`}
              >
                {i <= currentIndex ? (
                  <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                ) : (
                  <span className="text-[10px] sm:text-xs">{i + 1}</span>
                )}
              </motion.div>
              <span
                className={`text-[8px] sm:text-[10px] font-bold mt-1 text-center w-10 sm:w-16 uppercase tracking-tight sm:tracking-wider leading-tight ${
                  i <= currentIndex ? 'text-coffee-800' : 'text-coffee-400'
                }`}
              >
                {step}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className="flex-1 h-1 mx-1 sm:mx-2 mb-5 sm:mb-6 rounded-full bg-coffee-100 overflow-hidden">
                <motion.div
                  initial={{ width: '0%' }}
                  animate={{ width: i < currentIndex ? '100%' : '0%' }}
                  transition={{ duration: 0.5 }}
                  className="h-full bg-accent-500"
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
