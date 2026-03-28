import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Lock, Loader2 } from 'lucide-react';

export default function AdminLogin() {
  const navigate = useNavigate();
  const { login, isAuthenticated, isAdmin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      navigate('/admin-dashboard');
    }
  }, [isAuthenticated, isAdmin, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const user = await login(email, password);
      if (user.role === 'admin') {
        navigate('/admin-dashboard');
      } else {
        setError('Admin access required');
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050508] flex items-center justify-center p-6" data-testid="admin-login-page">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mx-auto mb-4">
            <Lock size={24} className="text-gray-400" />
          </div>
          <h1 className="text-xl font-semibold text-white">Admin Login</h1>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4" data-testid="login-form">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-400 text-sm text-center" data-testid="login-error">
              {error}
            </div>
          )}

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="Email"
            className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-white/20 outline-none"
            data-testid="login-email"
          />

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Password"
            className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-white/20 outline-none"
            data-testid="login-password"
          />

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-lg bg-white text-black font-medium hover:bg-gray-100 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            data-testid="login-submit"
          >
            {isLoading ? <Loader2 className="animate-spin" size={18} /> : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
