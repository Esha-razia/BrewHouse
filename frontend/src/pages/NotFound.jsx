import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="text-center py-32">
      <h1 className="text-6xl font-display font-bold text-coffee-300 mb-4">404</h1>
      <p className="text-coffee-500 mb-6">This page must have gotten lost brewing somewhere.</p>
      <Link to="/" className="btn-primary">Back to Home</Link>
    </div>
  );
}
