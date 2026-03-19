import { useState } from 'react';
import { Ship, AlertCircle, Loader2 } from 'lucide-react';
import { signIn, signUp } from '../lib/authService';

interface LoginScreenProps {
  onLogin: (shipData: any) => void;
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    try {
      if (mode === 'signup') {
        // Sign up new user
        await signUp(email, password, fullName);
        setError('Account created! Please check your email to confirm, then login.');
        setMode('login');
      } else {
        // Sign in existing user
        const { user } = await signIn(email, password);
        
        // Mock ship data (will be replaced with vessel from database)
        const shipData = {
          userId: user?.id,
          email: user?.email,
          imo: '9234567',
          name: 'MV NAVIGEN',
          mmsi: '257123456',
          position: { lat: 78.2232, lng: 15.6267 }, // Longyearbyen, Svalbard
          type: 'Cruise',
          flag: 'NOR',
          length: 180,
          beam: 28,
          draft: 8.5
        };
        
        onLogin(shipData);
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-slate-800 to-slate-900">
      <div className="bg-slate-800 p-8 rounded-lg shadow-2xl w-full max-w-md border border-slate-700">
        <div className="flex items-center justify-center mb-6">
          <Ship className="w-16 h-16 text-cyan-400" />
        </div>
        
        <h1 className="text-2xl text-white text-center mb-2">
          NAVIGEN
        </h1>
        <p className="text-slate-400 text-center mb-6 text-sm">
          Maritime Compliance Platform
        </p>
        
        {error && (
          <div className="mb-4 p-3 bg-red-900/20 border border-red-500/50 rounded flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-red-200 text-sm">{error}</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="block text-slate-300 mb-2 text-sm">
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Captain Name"
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
          )}
          
          <div>
            <label className="block text-slate-300 mb-2 text-sm">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="captain@vessel.com"
              required
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>
          
          <div>
            <label className="block text-slate-300 mb-2 text-sm">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="w-5 h-5 animate-spin" />}
            {mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>
        
        <div className="mt-4 text-center">
          <button
            onClick={() => {
              setMode(mode === 'login' ? 'signup' : 'login');
              setError(null);
            }}
            className="text-cyan-400 hover:text-cyan-300 text-sm"
          >
            {mode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
}