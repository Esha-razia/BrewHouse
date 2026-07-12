import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import ProductCard from '../components/ProductCard';
import { motion, AnimatePresence } from 'framer-motion';
import { Coffee, Flame, Heart, ArrowRight, Award, Zap, ShieldCheck, HelpCircle } from 'lucide-react';

const INTERACTIVE_CRAFT_STEPS = [
  {
    title: 'Sourcing specialty beans',
    desc: 'We purchase 100% Arabica beans directly from sustainable partner farms in Ethiopia and Colombia, paying 35% above fair-trade standards.',
    img: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400',
    stat: 'Direct Sourced'
  },
  {
    title: 'Micro-Batch Roasting',
    desc: 'Our beans are roasted daily in small batches under 10kg. This precision control locks in the natural floral and chocolatey flavor profiles.',
    img: 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=400',
    stat: 'Roast Daily'
  },
  {
    title: 'Precision Brewing',
    desc: 'Every espresso pull is calibrated for temperature, grind coarseness, and extraction time (exactly 26 seconds) to guarantee the perfect cup.',
    img: '/latte.png',
    stat: 'Barista Calibrated'
  }
];

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const loadFeatured = async () => {
      try {
        const { data } = await api.get('/products', { params: { badge: 'bestseller' } });
        setFeatured(data.slice(0, 4));
      } catch (err) {
        console.error('Failed to load featured coffees', err);
      } finally {
        setLoading(false);
      }
    };
    loadFeatured();
  }, []);

  return (
    <div className="overflow-hidden bg-coffee-50">
      
      {/* 1. HERO SECTION: Redesigned with premium generated hero interior image */}
      <section className="relative min-h-[92vh] flex items-center bg-coffee-950 text-coffee-50 overflow-hidden py-24 sm:py-32">
        <div className="absolute inset-0 opacity-85">
          <img
            src="https://i.pinimg.com/1200x/01/77/53/01775386fd20777c83f06a3c25781a77.jpg"
            alt="BrewHouse Premium Coffee Shop"
            className="w-full h-full object-cover scale-100"
          />
        </div>
        
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-black/55" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full grid lg:grid-cols-12 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.85, ease: 'easeOut' }}
            className="lg:col-span-8 space-y-6"
          >
            
            <h1 className="font-display text-4xl sm:text-6xl md:text-7xl font-black text-white leading-[1.05] tracking-tight drop-shadow-md">
              Where Coffee Craft <br />
              <span className="bg-gradient-to-r from-accent-400 via-amber-400 to-accent-300 bg-clip-text text-transparent">
                Meets Daily Comfort
              </span> <br />at BrewHouse
            </h1>
            
            <p className="max-w-xl text-coffee-100 text-sm sm:text-base leading-relaxed drop-shadow-sm font-medium">
              Once a bar, now a beacon of ambition — BrewHouse is a unique & eclectic café revitalizing the neighborhood through community, careers, and coffee. Open 8am – 1pm Monday-Friday.
            </p>
            
            <div className="flex flex-wrap gap-4 pt-2">
              <Link to="/menu" className="btn-primary !px-8 !py-4 shadow-lg shadow-accent-500/25 flex items-center gap-2">
                Order Ahead
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/menu" className="btn-secondary !bg-white/10 !text-white hover:!bg-white/20 border border-white/10 !px-8 !py-4">
                Our Menu
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. FEATURED SPECIAL: Serving up Something for Everyone */}
      <section className="py-24 bg-white border-b border-coffee-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-12 gap-12 items-center">
          <div className="md:col-span-6 space-y-6">
            <span className="text-accent-600 text-xs font-bold uppercase tracking-widest bg-accent-50 px-3 py-1 rounded-full">
              Featured Special
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-coffee-950 font-display leading-tight">
              Serving up Something <br />for Everyone.
            </h2>
            <p className="text-coffee-600 text-sm leading-relaxed">
              From bold brews to sweet sips, every drink at BrewHouse is crafted with care and community in mind. Whether you’re grabbing your go-to latte or trying something new like our signature in-house roasted beans, or delicious pastries, there’s something on the menu to make everyone feel at home.
            </p>
            <div className="pt-2">
              <Link to="/menu" className="btn-primary !px-7 !py-3 flex items-center gap-2 w-fit">
                Start a Pickup Order
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Signature Latte Highlight Card using the new premium latte pour image */}
          <div className="md:col-span-6">
            <motion.div
              whileHover={{ y: -6 }}
              className="p-6 sm:p-8 bg-coffee-50 border border-coffee-200/50 rounded-3xl shadow-sm flex flex-col sm:flex-row items-center gap-6"
            >
              <div className="w-32 h-32 shrink-0 rounded-2xl overflow-hidden border border-coffee-100 shadow-inner">
                <img src="https://i.pinimg.com/736x/8f/8a/56/8f8a564d29d298bfdf3b79e154473736.jpg" alt="BrewHouse Signature Latte Art" className="w-full h-full object-cover scale-105" />
              </div>
              <div className="space-y-2 text-center sm:text-left">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h3 className="font-display text-lg sm:text-xl font-bold text-coffee-950">
                    The "BrewHouse Favorite" Signature Latte
                  </h3>
                  <span className="font-display text-xl font-black text-accent-600 shrink-0">Rs. 1,090</span>
                </div>
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <span className="text-[10px] bg-coffee-200 text-coffee-700 font-bold px-2 py-0.5 rounded-md">
                    Caffeine Level 100 mg
                  </span>
                </div>
                <p className="text-xs text-coffee-500 leading-relaxed pt-1">
                  Our strong latte with any available syrup. Rich espresso combined with textured hot milk. We got you.
                </p>
                <div className="pt-2">
                  <Link to="/menu?category=Brew%20Signature%20Blended" className="text-xs font-bold text-accent-600 hover:text-accent-500 flex items-center gap-1 justify-center sm:justify-start">
                    Order Ahead <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 3. INTERACTIVE timelime: How We Brew Better (highly engaging) */}
      <section className="py-24 bg-coffee-100/50 border-b border-coffee-200/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-16">
            <span className="text-accent-600 text-xs font-bold uppercase tracking-widest bg-accent-50 px-3 py-1 rounded-full">
              Our Process Stepper
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-coffee-950 font-display mt-4">
              Explore Our Coffee Journey
            </h2>
            <p className="text-xs text-coffee-400 mt-2">Click each stage to discover how we prepare the premium cups served daily.</p>
          </div>

          <div className="grid lg:grid-cols-12 gap-8 items-center">
            
            {/* Left buttons selectors */}
            <div className="lg:col-span-5 space-y-3.5">
              {INTERACTIVE_CRAFT_STEPS.map((step, idx) => {
                const isActive = activeStep === idx;
                return (
                  <button
                    key={step.title}
                    onClick={() => setActiveStep(idx)}
                    className={`w-full text-left p-5 rounded-2xl border transition-all flex items-start gap-4 ${
                      isActive
                        ? 'bg-white border-accent-400 shadow-md scale-[1.02]'
                        : 'bg-transparent border-transparent hover:bg-coffee-100 hover:border-coffee-200'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 transition-colors ${
                      isActive ? 'bg-accent-500 text-white' : 'bg-coffee-200 text-coffee-600'
                    }`}>
                      {idx + 1}
                    </div>
                    <div>
                      <h4 className="font-bold text-coffee-800 text-sm sm:text-base">{step.title}</h4>
                      <span className="text-[10px] text-coffee-400 font-bold uppercase tracking-wider">{step.stat}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Right details frame */}
            <div className="lg:col-span-7 bg-white rounded-3xl border border-coffee-100/60 p-6 sm:p-10 shadow-sm min-h-[300px] flex items-center relative overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="grid sm:grid-cols-12 gap-6 items-center"
                >
                  <div className="sm:col-span-7 space-y-4">
                    <span className="inline-block bg-accent-50 text-accent-700 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-md">
                      Stage {activeStep + 1} details
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black text-coffee-950 font-display">
                      {INTERACTIVE_CRAFT_STEPS[activeStep].title}
                    </h3>
                    <p className="text-coffee-600 leading-relaxed text-xs sm:text-sm">
                      {INTERACTIVE_CRAFT_STEPS[activeStep].desc}
                    </p>
                    <div className="flex items-center gap-1.5 text-xs text-green-700 font-semibold pt-1">
                      <ShieldCheck className="w-4 h-4" /> Barista Grade Quality Checked
                    </div>
                  </div>
                  
                  <div className="sm:col-span-5 aspect-[4/3] rounded-2xl overflow-hidden border border-coffee-100">
                    <img 
                      src={INTERACTIVE_CRAFT_STEPS[activeStep].img} 
                      alt={INTERACTIVE_CRAFT_STEPS[activeStep].title} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

          </div>
        </div>
      </section>

      {/* 4. RETAIL: Grab a Bag of our Best Brew */}
      <section className="py-24 bg-white border-b border-coffee-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-12 gap-12 items-center">
          <div className="md:col-span-5 relative flex justify-center">
            {/* Bag outline mock */}
            <div className="w-56 bg-coffee-800 text-coffee-50 p-6 rounded-3xl shadow-lg border border-coffee-700 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-accent-500" />
              <Coffee className="w-12 h-12 text-accent-400 mx-auto mt-4" />
              <p className="font-display font-black text-xl text-white mt-4 tracking-wide">BREWHOUSE</p>
              <p className="text-[9px] uppercase tracking-widest text-accent-400 font-bold mt-1">Specialty Roast</p>
              <div className="w-16 h-0.5 bg-coffee-600 mx-auto my-4" />
              <p className="text-[10px] text-coffee-300">100% Arabica Beans</p>
              <p className="text-[9px] text-coffee-400 mt-0.5">Medium Dark Roast</p>
              <div className="bg-coffee-950/60 py-2.5 px-4 rounded-xl mt-6 text-xs text-coffee-200 font-semibold border border-coffee-800">
                12 oz · Freshly Roasted
              </div>
            </div>
            {/* Decorative spark */}
            <span className="absolute -top-3 right-12 text-3xl">✨</span>
          </div>

          <div className="md:col-span-7 space-y-5">
            <span className="text-accent-600 text-xs font-bold uppercase tracking-widest bg-accent-50 px-3 py-1 rounded-full">
              In-House Roasted
            </span>
            <h2 className="text-3xl font-extrabold text-coffee-950 font-display leading-tight">
              Grab a Bag of our Best Brew!
            </h2>
            <p className="text-coffee-600 text-sm leading-relaxed">
              Take a piece of BrewHouse home with you. Every 12oz bag of our in-house roasted signature coffee fuels more than your morning — it powers job training, mentorship, and hope right here in the heart of our community. Brew boldly. Give generously.
            </p>
            <div className="pt-2">
              <Link to="/menu?category=Coffee%20Beans" className="btn-primary !px-7 !py-3 shadow-sm">
                Order Today
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 5. COMMUNITY STORY: Committed to Reinvesting in Community */}
      <section className="py-24 bg-coffee-100/30 border-b border-coffee-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-12 gap-12 items-center">
          <div className="md:col-span-5">
            <div className="relative rounded-3xl overflow-hidden shadow-sm">
              <img
                src="https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=600"
                alt="Roasting beans at BrewHouse roastery"
                className="w-full h-80 object-cover"
              />
            </div>
          </div>

          <div className="md:col-span-7 space-y-6">
            <span className="text-accent-600 text-xs font-bold uppercase tracking-widest bg-accent-50 px-3 py-1 rounded-full">
              Our Mission
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-coffee-950 font-display leading-tight">
              Committed to Reinvesting in Community
            </h2>
            <p className="text-lg font-semibold text-coffee-800">
              Stronger Jobs Start Here.
            </p>
            <p className="text-coffee-600 text-sm leading-relaxed">
              Behind the counter, there’s more than just coffee brewing. Our youth job training program equips young adults in the Buckeye-Shaker neighborhood with the tools to thrive—on the job and in life. From learning customer service and leadership to building confidence and purpose, every shift is a step toward something bigger. We’re brewing confidence, purpose, and life skills.
            </p>
            <div className="pt-2">
              <Link to="/menu" className="btn-primary !px-7 !py-3 flex items-center gap-1.5 w-fit shadow-sm">
                Read Our Story <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 6. BLOG / THE DRIP FEED */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-16">
            <span className="text-accent-600 text-xs font-bold uppercase tracking-widest bg-accent-50 px-3 py-1 rounded-full">
              The Drip Blog
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold font-display text-coffee-950 mt-4">
              Latest from the Espresso Feed
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            
            {/* Article 1 */}
            <motion.article whileHover={{ y: -6 }} className="bg-coffee-50/50 border border-coffee-100 rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm">
              <div className="inline-block bg-accent-50 text-accent-700 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-md">
                Coffee Culture
              </div>
              <h3 className="font-display text-xl sm:text-2xl font-bold text-coffee-950 hover:text-accent-600 transition-colors">
                The Simple Joy of Coffee: More Than Just a Drink
              </h3>
              <p className="text-coffee-600 text-sm leading-relaxed line-clamp-3">
                For many of us, coffee is more than a beverage—it’s a ritual, a comfort, and sometimes the spark that gets our day moving. From the aroma that greets us in the morning to the conversations it inspires in cozy cafés, coffee has a way of bringing us closer...
              </p>
              <div className="pt-2">
                <span className="text-xs font-bold text-accent-600 hover:underline cursor-pointer flex items-center gap-1">
                  Read more <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </motion.article>

            {/* Article 2 */}
            <motion.article whileHover={{ y: -6 }} className="bg-coffee-50/50 border border-coffee-100 rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm">
              <div className="inline-block bg-accent-50 text-accent-700 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-md">
                Coffee Shop Life
              </div>
              <h3 className="font-display text-xl sm:text-2xl font-bold text-coffee-950 hover:text-accent-600 transition-colors">
                Why Morning People Have It Made (and How to Fake It...)
              </h3>
              <p className="text-coffee-600 text-sm leading-relaxed line-clamp-3">
                Ever wonder what your coffee choice says about your vibe? Whether you’re a bold Cold Brew boss or a cozy Cappuccino dreamer, your favorite drink might be spilling your secrets. Let’s decode your go-to order—just for fun.
              </p>
              <div className="pt-2">
                <span className="text-xs font-bold text-accent-600 hover:underline cursor-pointer flex items-center gap-1">
                  Read more <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </motion.article>

          </div>
        </div>
      </section>

    </div>
  );
}
