import React, { useState } from 'react';
import { Logo } from '../components/common/Logo';
import { useAuth } from '../lib/authContext';
import { Mail, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { NavTab } from '../components/layout/Header';

interface ForgotPasswordPageProps {
  onNavigate: (tab: NavTab) => void;
}

export const ForgotPasswordPage: React.FC<ForgotPasswordPageProps> = ({ onNavigate }) => {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    await resetPassword(email);
    setIsSending(false);
    setSubmitted(true);
  };

  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#101B13] border border-[#263F2B] rounded-sm p-8 shadow-2xl tactical-border space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-2">
            <Logo size="lg" showText={false} />
          </div>
          <h1 className="font-tactical font-bold text-2xl text-[#E7E9E2] tracking-wider uppercase">
            Reset Password
          </h1>
          <p className="font-mono text-xs text-[#8B9B8E]">
            Enter your official email to receive password reset instructions
          </p>
        </div>

        {submitted ? (
          <div className="p-4 bg-[rgba(63,163,77,0.12)] border border-[#3FA34D]/40 rounded-xs space-y-3 font-mono text-xs">
            <div className="flex items-center gap-2 text-[#4ade80] font-semibold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Reset Link Dispatched</span>
            </div>
            <p className="text-[#8B9B8E] leading-relaxed">
              If an account exists for <strong className="text-[#E7E9E2]">{email}</strong>, a password reset link has been sent.
            </p>
            <button
              onClick={() => onNavigate('login')}
              className="mt-2 text-[#B5A47A] hover:underline flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Sign In</span>
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
            <div>
              <label className="text-[#8B9B8E] block mb-1.5 uppercase font-medium text-[11px]">
                Email Address
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

            <button
              type="submit"
              disabled={isSending}
              className="w-full py-2.5 bg-[#263F2B] hover:bg-[#325338] text-[#E7E9E2] border border-[#596B3A] font-tactical font-bold text-xs tracking-wider uppercase rounded-xs transition-colors shadow-md flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              <span>{isSending ? 'Sending...' : 'SEND RESET LINK'}</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#B5A47A]" />
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => onNavigate('login')}
                className="text-[#8B9B8E] hover:text-[#E7E9E2] text-xs font-mono"
              >
                Back to Sign In
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
