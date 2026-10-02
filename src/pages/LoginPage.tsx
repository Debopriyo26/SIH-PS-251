import React, { useState } from 'react';
import { Logo } from '../components/common/Logo';
import { useAuth } from '../lib/authContext';
import { Shield, Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react';
import { NavTab } from '../components/layout/Header';

interface LoginPageProps {
  onNavigate: (tab: NavTab) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const { login, loginDemo, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

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

  const handleDemoSignIn = () => {
    loginDemo();
    onNavigate('dashboard');
  };

  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#101B13] border border-[#263F2B] rounded-sm p-8 shadow-2xl tactical-border space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-2">
            <Logo size="lg" showText={false} />
          </div>
          <h1 className="font-tactical font-bold text-2xl text-[#E7E9E2] tracking-wider uppercase">
            Sign In to VYOMIX
          </h1>
          <p className="font-mono text-xs text-[#8B9B8E]">
            Predictive Logistics Intelligence Platform
          </p>
        </div>

        {error && (
          <div className="p-3 bg-[rgba(196,60,60,0.15)] border border-[#C43C3C]/50 rounded-xs flex items-center gap-2 text-xs font-mono text-[#f87171]">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
          <div>
            <label className="text-[#8B9B8E] block mb-1.5 uppercase font-medium text-[11px]">
              Officer / User Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#8B9B8E] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="officer@vyomix.defense.in"
                className="w-full pl-9 pr-3.5 py-2.5 bg-[#07100B] border border-[#263F2B] focus:border-[#596B3A] text-[#E7E9E2] rounded-xs focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-[#8B9B8E] uppercase font-medium text-[11px]">
                Password
              </label>
              <button
                type="button"
                onClick={() => onNavigate('forgot-password')}
                className="text-[11px] text-[#B5A47A] hover:underline"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#8B9B8E] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-9 pr-3.5 py-2.5 bg-[#07100B] border border-[#263F2B] focus:border-[#596B3A] text-[#E7E9E2] rounded-xs focus:outline-hidden"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 bg-[#263F2B] hover:bg-[#325338] text-[#E7E9E2] border border-[#596B3A] font-tactical font-bold text-xs tracking-wider uppercase rounded-xs transition-colors shadow-md flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            <span>{isLoading ? 'Authenticating...' : 'SIGN IN'}</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#B5A47A]" />
          </button>
        </form>

        <div className="relative border-t border-[#1A2C1E] pt-4 text-center">
          <span className="text-[11px] font-mono text-[#8B9B8E]">Or access demo environment:</span>
          <button
            type="button"
            onClick={handleDemoSignIn}
            className="mt-2 w-full py-2 bg-[#101B13] hover:bg-[#1A2C1E] text-[#B5A47A] border border-[#263F2B] hover:border-[#596B3A] font-mono text-xs rounded-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Shield className="w-3.5 h-3.5 text-[#3FA34D]" />
            <span>Instant Demo Access (Logistics Officer)</span>
          </button>
        </div>

        <div className="text-center font-mono text-xs text-[#8B9B8E] pt-2">
          Don't have an account?{' '}
          <button
            onClick={() => onNavigate('signup')}
            className="text-[#B5A47A] hover:underline font-semibold"
          >
            Create Account
          </button>
        </div>
      </div>
    </div>
  );
};
