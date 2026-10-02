import React, { useState } from 'react';
import { Logo } from '../components/common/Logo';
import { useAuth } from '../lib/authContext';
import { User, Lock, Mail, ArrowRight, AlertCircle, Shield } from 'lucide-react';
import { NavTab } from '../components/layout/Header';

interface SignupPageProps {
  onNavigate: (tab: NavTab) => void;
}

export const SignupPage: React.FC<SignupPageProps> = ({ onNavigate }) => {
  const { signup, isLoading } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    const res = await signup(fullName, email, password);
    if (res.success) {
      onNavigate('dashboard');
    } else {
      setError(res.error || 'Failed to create account.');
    }
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
            Create VYOMIX Account
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
              Full Name / Officer Designation
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-[#8B9B8E] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Capt. Rajesh Sharma"
                className="w-full pl-9 pr-3.5 py-2.5 bg-[#07100B] border border-[#263F2B] focus:border-[#596B3A] text-[#E7E9E2] rounded-xs focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="text-[#8B9B8E] block mb-1.5 uppercase font-medium text-[11px]">
              Official Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#8B9B8E] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="r.sharma@vyomix.defense.in"
                className="w-full pl-9 pr-3.5 py-2.5 bg-[#07100B] border border-[#263F2B] focus:border-[#596B3A] text-[#E7E9E2] rounded-xs focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="text-[#8B9B8E] block mb-1.5 uppercase font-medium text-[11px]">
              Password
            </label>
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

          <div>
            <label className="text-[#8B9B8E] block mb-1.5 uppercase font-medium text-[11px]">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#8B9B8E] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
            <span>{isLoading ? 'Creating Account...' : 'CREATE ACCOUNT'}</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#B5A47A]" />
          </button>
        </form>

        <div className="text-center font-mono text-xs text-[#8B9B8E] pt-2 border-t border-[#1A2C1E]">
          Already have an account?{' '}
          <button
            onClick={() => onNavigate('login')}
            className="text-[#B5A47A] hover:underline font-semibold"
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
};
