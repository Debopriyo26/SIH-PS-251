import React, { useState, useEffect } from 'react';
import { Logo } from '../components/common/Logo';
import { useAuth } from '../lib/authContext';
import { Lock, Mail, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { NavTab } from '../components/layout/Header';

interface LoginPageProps {
  onNavigate: (tab: NavTab) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const msg = localStorage.getItem('vyomix_login_message');
    if (msg) {
      setSuccessMessage(msg);
      localStorage.removeItem('vyomix_login_message');
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const res = await login(email, password);
    if (res.success) {
      onNavigate('dashboard');
    } else {
      setError(res.error || 'Authentication failed. Please verify credentials.');
    }
  };

  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center p-4 bg-[#F7F8F4]">
      <div className="w-full max-w-md bg-white border border-[#D8DFD5] rounded-sm p-8 shadow-sm space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-2">
            <Logo size="lg" showText={false} />
          </div>
          <h1 className="font-tactical font-black text-2xl text-[#1F2933] tracking-wider uppercase">
            Sign In to VYOMIX
          </h1>
          <p className="font-mono text-xs text-[#52606D]">
            Predictive Logistics Intelligence Platform
          </p>
        </div>

        {successMessage && (
          <div className="p-3 bg-[#E8F5E9] border border-[#A5D6A7] rounded-xs flex items-center gap-2 text-xs font-mono text-[#2F6B3C]">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-[#2F6B3C]" />
            <span>{successMessage}</span>
          </div>
        )}

        {error && (
          <div className="p-3 bg-[#FEE4E2] border border-[#FDA29B] rounded-xs flex items-center gap-2 text-xs font-mono text-[#B42318]">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
          <div>
            <label className="text-[#52606D] block mb-1.5 uppercase font-semibold text-[11px]">
              Officer / User Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#52606D] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="officer@vyomix.defense.in"
                className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-[#D8DFD5] focus:border-[#355E3B] text-[#1F2933] rounded-xs focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-[#52606D] uppercase font-semibold text-[11px]">
                Password
              </label>
              <button
                type="button"
                onClick={() => onNavigate('forgot-password')}
                className="text-[11px] text-[#355E3B] hover:underline font-semibold cursor-pointer"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#52606D] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-[#D8DFD5] focus:border-[#355E3B] text-[#1F2933] rounded-xs focus:outline-hidden"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 bg-[#355E3B] hover:bg-[#1F3D27] text-white border border-[#1F3D27] font-tactical font-bold text-xs tracking-wider uppercase rounded-xs transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer mt-3"
          >
            <span>{isLoading ? 'Authenticating...' : 'SIGN IN'}</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#B5A47A]" />
          </button>
        </form>

        <div className="text-center font-mono text-xs text-[#52606D] pt-4 border-t border-[#F0F4EE]">
          Don't have an account?{' '}
          <button
            onClick={() => onNavigate('signup')}
            className="text-[#355E3B] hover:underline font-bold cursor-pointer"
          >
            Create Account
          </button>
        </div>

        {/* Demo credentials hint for testing actual Supabase authentication */}
        <div className="bg-[#F0F4EE] border border-[#D8DFD5] p-3 rounded-xs font-mono text-[11px] text-[#52606D] space-y-2">
          <span className="font-bold text-[#1F2933] block uppercase text-[10px] tracking-wider">
            Quick Authorized Demonstration Credentials:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              type="button"
              onClick={async () => {
                setEmail('main.head@vyomix.gov.in');
                setPassword('Password@123!');
                await login('main.head@vyomix.gov.in', 'Password@123!');
                onNavigate('dashboard');
              }}
              className="text-left p-2.5 bg-white hover:bg-[#E8EEE5] border border-[#CAD3C8] rounded-xs transition-colors cursor-pointer group"
            >
              <div className="font-bold text-[#355E3B] flex items-center justify-between">
                <span>★ MAIN HEAD (1-Click Login)</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#355E3B]" />
              </div>
              <div className="text-[10px] text-[#52606D] truncate">main.head@vyomix.gov.in</div>
            </button>

            <button
              type="button"
              onClick={async () => {
                setEmail('srinagar.head@vyomix.gov.in');
                setPassword('Password@123!');
                await login('srinagar.head@vyomix.gov.in', 'Password@123!');
                onNavigate('dashboard');
              }}
              className="text-left p-2.5 bg-white hover:bg-[#E8EEE5] border border-[#CAD3C8] rounded-xs transition-colors cursor-pointer group"
            >
              <div className="font-bold text-[#6B7444] flex items-center justify-between">
                <span>⚑ ZONAL HEAD (1-Click Login)</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#6B7444]" />
              </div>
              <div className="text-[10px] text-[#52606D] truncate">srinagar.head@vyomix.gov.in</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
