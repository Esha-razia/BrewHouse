import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Coffee, Send, Star, ArrowRight, ChevronDown, ChevronUp, PenLine } from 'lucide-react';
import api from '../api/axios';

// Social media SVG icons (lucide-react doesn't export Instagram/Facebook/Twitter/WhatsApp)
const IconInstagram = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);
const IconFacebook = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);
const IconTwitterX = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);
const IconWhatsApp = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
  </svg>
);


export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [expandedReview, setExpandedReview] = useState(null);

  // --- Dynamic Reviews State ---
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({ name: '', rating: 5, text: '' });
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [hoverRating, setHoverRating] = useState(0);

  // Fetch reviews from API
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const { data } = await api.get('/reviews');
        setReviews(data);
      } catch {
        // fall back gracefully
      } finally {
        setReviewsLoading(false);
      }
    };
    fetchReviews();
  }, []);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewError('');
    setReviewSubmitting(true);
    try {
      const { data } = await api.post('/reviews', reviewForm);
      setReviews(prev => [data, ...prev]);
      setReviewSuccess(true);
      setReviewForm({ name: '', rating: 5, text: '' });
      setTimeout(() => {
        setReviewSuccess(false);
        setShowReviewForm(false);
      }, 3000);
    } catch (err) {
      setReviewError(err.response?.data?.message || 'Failed to submit review. Please try again.');
    } finally {
      setReviewSubmitting(false);
    }
  };

  // Helper: get initials from name
  const getInitials = (name) => name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  // Helper: format date
  const formatDate = (iso) => new Date(iso).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

  // Average rating from fetched reviews
  const avgRating = reviews.length > 0
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : '5.0';

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
    }
  };

  const SOCIALS = [
    { icon: IconInstagram, label: 'Instagram', href: '#', color: 'hover:bg-pink-600' },
    { icon: IconFacebook, label: 'Facebook', href: '#', color: 'hover:bg-blue-600' },
    { icon: IconTwitterX, label: 'X / Twitter', href: '#', color: 'hover:bg-sky-500' },
    { icon: IconWhatsApp, label: 'WhatsApp', href: '#', color: 'hover:bg-green-500' },
  ];

  return (
    <>
      {/* === REVIEWS SECTION === */}
      <section className="bg-coffee-50 border-t border-coffee-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-accent-600 text-xs font-bold uppercase tracking-widest bg-accent-50 px-3 py-1 rounded-full">Customer Love</span>
            <h2 className="font-display text-3xl sm:text-4xl font-black text-coffee-950 mt-4">What Our Customers Say</h2>
            <p className="text-coffee-400 text-sm mt-2">Real sips, real stories — from our community 🇵🇰</p>

            {/* Star Rating Summary */}
            <div className="flex items-center justify-center gap-2 mt-4">
              {[1,2,3,4,5].map(i => (
                <Star key={i} className="w-5 h-5 fill-accent-500 text-accent-500" />
              ))}
              <span className="font-display font-black text-coffee-800 text-lg ml-1">{avgRating}</span>
              <span className="text-coffee-400 text-sm">({reviews.length} reviews)</span>
            </div>

            {/* Write a Review Button */}
            <button
              onClick={() => setShowReviewForm(prev => !prev)}
              className="mt-5 inline-flex items-center gap-2 bg-coffee-900 text-white text-xs font-bold px-5 py-2.5 rounded-full hover:bg-coffee-800 transition-colors shadow-md"
            >
              <PenLine className="w-3.5 h-3.5" />
              {showReviewForm ? 'Close Form' : 'Write a Review'}
            </button>
          </div>

          {/* --- Review Submission Form --- */}
          <AnimatePresence>
            {showReviewForm && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className="max-w-2xl mx-auto mb-12 bg-white border border-coffee-200 rounded-3xl p-7 shadow-lg"
              >
                {reviewSuccess ? (
                  <div className="text-center py-6 space-y-2">
                    <p className="text-3xl">☕</p>
                    <p className="font-display font-black text-coffee-950 text-xl">Thank you for your review!</p>
                    <p className="text-coffee-400 text-sm">Your feedback means the world to us.</p>
                  </div>
                ) : (
                  <form onSubmit={handleReviewSubmit} className="space-y-5">
                    <h3 className="font-display font-black text-coffee-950 text-lg">Share Your Experience</h3>

                    {/* Name */}
                    <div>
                      <label className="block text-xs font-bold text-coffee-600 mb-1.5 uppercase tracking-wider">Your Name</label>
                      <input
                        type="text"
                        required
                        maxLength={40}
                        value={reviewForm.name}
                        onChange={e => setReviewForm(p => ({ ...p, name: e.target.value }))}
                        placeholder="e.g. Fatima A."
                        className="w-full border border-coffee-200 rounded-xl px-4 py-2.5 text-sm text-coffee-800 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                      />
                    </div>

                    {/* Star Rating Picker */}
                    <div>
                      <label className="block text-xs font-bold text-coffee-600 mb-2 uppercase tracking-wider">Your Rating</label>
                      <div className="flex gap-1.5">
                        {[1, 2, 3, 4, 5].map(star => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setReviewForm(p => ({ ...p, rating: star }))}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            className="transition-transform hover:scale-125"
                          >
                            <Star
                              className={`w-7 h-7 transition-colors ${
                                star <= (hoverRating || reviewForm.rating)
                                  ? 'fill-accent-500 text-accent-500'
                                  : 'text-coffee-200'
                              }`}
                            />
                          </button>
                        ))}
                        <span className="ml-2 text-xs text-coffee-400 self-center">
                          {reviewForm.rating === 5 ? 'Excellent!' : reviewForm.rating === 4 ? 'Great!' : reviewForm.rating === 3 ? 'Good' : reviewForm.rating === 2 ? 'Fair' : 'Poor'}
                        </span>
                      </div>
                    </div>

                    {/* Review Text */}
                    <div>
                      <label className="block text-xs font-bold text-coffee-600 mb-1.5 uppercase tracking-wider">Your Review</label>
                      <textarea
                        required
                        minLength={10}
                        maxLength={300}
                        rows={4}
                        value={reviewForm.text}
                        onChange={e => setReviewForm(p => ({ ...p, text: e.target.value }))}
                        placeholder="Tell us about your experience — which drink did you love? How was the delivery?"
                        className="w-full border border-coffee-200 rounded-xl px-4 py-3 text-sm text-coffee-800 resize-none focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                      />
                      <p className="text-[10px] text-coffee-400 mt-1 text-right">{reviewForm.text.length}/300</p>
                    </div>

                    {reviewError && (
                      <p className="text-red-500 text-xs bg-red-50 border border-red-200 rounded-xl px-4 py-2">{reviewError}</p>
                    )}

                    <button
                      type="submit"
                      disabled={reviewSubmitting}
                      className="btn-primary w-full !py-3 flex items-center justify-center gap-2 shadow-md"
                    >
                      <Send className="w-4 h-4" />
                      {reviewSubmitting ? 'Submitting...' : 'Submit Review'}
                    </button>
                  </form>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Reviews Grid */}
          {reviewsLoading ? (
            <div className="flex justify-center py-12">
              <div className="w-6 h-6 border-2 border-accent-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-12 text-coffee-400 text-sm">
              No reviews yet. Be the first to share your experience! ☕
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {reviews.slice(0, 8).map((rev, idx) => (
                <motion.div
                  key={rev._id || idx}
                  whileHover={{ y: -6, scale: 1.01 }}
                  transition={{ duration: 0.25 }}
                  className="bg-white border border-coffee-100 rounded-3xl p-6 shadow-sm flex flex-col gap-4 relative overflow-hidden cursor-pointer"
                  onClick={() => setExpandedReview(expandedReview === idx ? null : idx)}
                >
                  {/* Decorative bg blob */}
                  <div className="absolute -top-6 -right-6 w-20 h-20 bg-coffee-50 rounded-full opacity-60" />

                  {/* Stars */}
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-3.5 h-3.5 ${ i < rev.rating ? 'fill-accent-500 text-accent-500' : 'text-coffee-200'}`} />
                    ))}
                  </div>

                  <p className={`text-coffee-600 text-sm leading-relaxed ${expandedReview === idx ? '' : 'line-clamp-3'}`}>
                    "{rev.text}"
                  </p>

                  {rev.text.length > 100 && (
                    <button className="text-[10px] text-accent-500 font-bold flex items-center gap-0.5 self-start">
                      {expandedReview === idx ? <><ChevronUp className="w-3 h-3" /> Less</> : <><ChevronDown className="w-3 h-3" /> More</>}
                    </button>
                  )}

                  <div className="flex items-center gap-3 mt-auto pt-2 border-t border-coffee-50">
                    <div className={`w-8 h-8 ${rev.avatarColor || 'bg-accent-500'} rounded-full flex items-center justify-center text-[10px] font-black text-white shrink-0`}>
                      {getInitials(rev.name)}
                    </div>
                    <div>
                      <p className="font-bold text-coffee-800 text-xs">{rev.name}</p>
                      <p className="text-[9px] text-coffee-400">{formatDate(rev.createdAt)}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* === JOIN OUR LIST / EMAIL SIGNUP === */}
      <section className="bg-coffee-900 py-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-accent-500 to-transparent" />
        <div className="relative max-w-2xl mx-auto px-4 text-center space-y-6">
          <div className="w-12 h-12 bg-accent-500/20 rounded-2xl flex items-center justify-center mx-auto">
            <Coffee className="w-6 h-6 text-accent-400" />
          </div>
          <h2 className="font-display text-3xl font-black text-white">Join Our Coffee List</h2>
          <p className="text-coffee-300 text-sm leading-relaxed">
            Be the first to know about new flavors, exclusive offers, and community updates — straight to your inbox.
          </p>

          <AnimatePresence mode="wait">
            {subscribed ? (
              <motion.div
                key="thanks"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-green-900/50 border border-green-700/50 text-green-400 rounded-2xl px-6 py-4 font-semibold text-sm"
              >
                ☕ You're on the list! Welcome to the BrewHouse family.
              </motion.div>
            ) : (
              <motion.form
                key="form"
                onSubmit={handleSubscribe}
                className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
              >
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="flex-1 bg-coffee-800 border border-coffee-700 text-white placeholder-coffee-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent-500 transition-colors"
                />
                <button
                  type="submit"
                  className="btn-primary !px-6 !py-3 flex items-center gap-2 shadow-lg shadow-accent-500/20 shrink-0"
                >
                  <Send className="w-4 h-4" />
                  Subscribe
                </button>
              </motion.form>
            )}
          </AnimatePresence>

          <p className="text-coffee-500 text-[10px]">No spam, ever. Unsubscribe anytime.</p>
        </div>
      </section>

      {/* === MAIN FOOTER === */}
      <footer className="bg-coffee-950 text-coffee-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 grid grid-cols-1 md:grid-cols-4 gap-10">
          
          {/* Brand */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center gap-2">
              <Coffee className="w-6 h-6 text-accent-400" />
              <h3 className="font-display text-xl font-black text-coffee-800">BrewHouse</h3>
            </div>
            <p className="text-sm text-coffee-400 leading-relaxed">
              Small-batch roasted, brewed with care, delivered warm to your door.
            </p>

            {/* Social Icons */}
            <div className="flex gap-2.5 pt-1">
              {SOCIALS.map(({ icon: Icon, label, href, color }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  title={label}
                  className={`w-9 h-9 bg-coffee-800 rounded-xl flex items-center justify-center transition-all duration-200 ${color} hover:text-white hover:scale-110`}
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Menu Links */}
          <div>
            <h4 className="font-bold text-coffee-800 mb-4 text-sm uppercase tracking-wider">Menu</h4>
            <ul className="text-sm space-y-2.5 text-coffee-400">
              {[
                { label: 'Premium Blend Iced Capp', cat: 'Premium Blend Iced Capp' },
                { label: 'Brew Signature Blended', cat: 'Brew Signature Blended' },
                { label: 'HOT & COLD BEVERAGES', cat: 'HOT & COLD BEVERAGES' },
                { label: 'Matcha', cat: 'Matcha' },
                { label: 'Tea', cat: 'Tea' },
                { label: 'Coffee Beans', cat: 'Coffee Beans' },
              ].map(({ label, cat }) => (
                <li key={cat}>
                  <Link to={`/menu?category=${encodeURIComponent(cat)}`} className="hover:text-accent-400 transition-colors flex items-center gap-1 group">
                    <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-coffee-800 mb-4 text-sm uppercase tracking-wider">Quick Links</h4>
            <ul className="text-sm space-y-2.5 text-coffee-400">
              {[
                { label: 'Full Menu', to: '/menu' },
                { label: 'Your Cart', to: '/cart' },
                { label: 'Track Order', to: '/order-queue' },
                { label: 'Login', to: '/login' },
                { label: 'Sign Up', to: '/signup' },
              ].map(({ label, to }) => (
                <li key={to}>
                  <Link to={to} className="hover:text-accent-400 transition-colors flex items-center gap-1 group">
                    <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Visit / Contact */}
          <div>
            <h4 className="font-bold text-coffee-800 mb-4 text-sm uppercase tracking-wider">Visit Us</h4>
            <div className="text-sm text-coffee-400 space-y-2.5">
              <p>🕗 Open daily, 8am – 1pm Mon-Fri</p>
              <p>📍 Lahore, Pakistan</p>
              <p>
                <a href="mailto:hello@brewhouse.coffee" className="hover:text-accent-400 transition-colors">
                  ✉️ hello@brewhouse.coffee
                </a>
              </p>
              <p>
                <a href="https://wa.me/1234567890" className="hover:text-accent-400 transition-colors">
                  💬 WhatsApp Us
                </a>
              </p>
            </div>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="border-t border-coffee-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-coffee-500">
            <p>© {new Date().getFullYear()} BrewHouse Coffee Co. All rights reserved.</p>
            <div className="flex items-center gap-1">
              <span>Made with</span>
              <span className="text-accent-500">☕</span>
              <span>and care</span>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
