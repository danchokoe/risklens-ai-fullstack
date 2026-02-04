
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const Login: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (email: string, password: string) => {
    setError('');
    setLoading(true);
    
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 selection:bg-blue-500 selection:text-white">
      <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        
        {/* Left Side: Branding */}
        <div className="hidden lg:block space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl font-black text-white tracking-tighter leading-none">
              <span className="text-blue-500">Risk</span>Lens AI
            </h1>
            <p className="text-xl text-slate-400 font-medium">Enterprise Risk, Governance & Compliance Intelligence.</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
              <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Infrastructure</p>
              <p className="text-xs text-slate-300">Bank-grade encryption and secure document vaulting.</p>
            </div>
            <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
              <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">AI Engine</p>
              <p className="text-xs text-slate-300">Local AI processing with complete data privacy.</p>
            </div>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="bg-white rounded-[3rem] p-12 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -mr-16 -mt-16" />
          
          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Authorized Access</h2>
            <p className="text-slate-500 text-xs font-bold mt-2 uppercase tracking-[0.2em]">Secure Database Authentication</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Corporate Email</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@risklens.ai"
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 outline-none transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 outline-none transition-all"
                required
              />
            </div>

            {error && <p className="text-[10px] font-bold text-red-500 uppercase text-center">{error}</p>}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white py-5 rounded-2xl font-black shadow-2xl shadow-blue-500/20 transition-all uppercase text-xs tracking-[0.2em]"
            >
              {loading ? 'Authenticating...' : 'Authenticate'}
            </button>
          </form>

          <div className="mt-12 space-y-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
              <div className="relative flex justify-center text-[10px] uppercase font-black tracking-widest"><span className="px-4 bg-white text-slate-400">Quick Access</span></div>
            </div>

            <div className="grid grid-cols-1 gap-2">
              <button 
                onClick={() => handleQuickLogin('admin@risklens.ai', 'admin123')}
                disabled={loading}
                className="flex items-center justify-between p-3 rounded-xl border border-slate-50 hover:border-blue-200 hover:bg-blue-50/30 transition-all text-left group disabled:opacity-50"
              >
                <div>
                  <p className="text-[10px] font-black text-slate-800 uppercase leading-none">System Administrator</p>
                  <p className="text-[9px] text-slate-400 mt-1 uppercase tracking-tighter">Full Access • admin@risklens.ai</p>
                </div>
                <span className="text-[8px] font-black text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">QUICK LOGIN →</span>
              </button>
              
              <button 
                onClick={() => handleQuickLogin('john.smith@company.com', 'password123')}
                disabled={loading}
                className="flex items-center justify-between p-3 rounded-xl border border-slate-50 hover:border-blue-200 hover:bg-blue-50/30 transition-all text-left group disabled:opacity-50"
              >
                <div>
                  <p className="text-[10px] font-black text-slate-800 uppercase leading-none">John Smith</p>
                  <p className="text-[9px] text-slate-400 mt-1 uppercase tracking-tighter">CRO • john.smith@company.com</p>
                </div>
                <span className="text-[8px] font-black text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">QUICK LOGIN →</span>
              </button>
            </div>
            
            <div className="text-center">
              <p className="text-[9px] text-slate-400 uppercase tracking-widest">
                Database: SQLite • AI: Local Ollama • Privacy: Complete
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;
