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
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center p-4 bg-[#F7F8F4]">
      <div className="w-full max-w-md bg-white border border-[#D8DFD5] rounded-sm p-8 shadow-sm space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-2">
            <Logo size="lg" showText={false} />
          </div>
          <h1 className="font-tactical font-black text-2xl text-[#1F2933] tracking-wider uppercase">
            Reset Password
          </h1>
          <p className="font-mono text-xs text-[#52606D]">
            Enter your official email to receive password reset instructions
          </p>
        </div>

        {submitted ? (
          <div className="p-4 bg-[#E8F5E9] border border-[#A5D6A7] rounded-xs space-y-3 font-mono text-xs">
            <div className="flex items-center gap-2 text-[#2F6B3C] font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Reset Link Dispatched</span>
            </div>
            <p className="text-[#52606D] leading-relaxed">
              If an account exists for <strong className="text-[#1F2933]">{email}</strong>, a password reset link has been sent.
            </p>
            <button
              onClick={() => onNavigate('login')}
              className="mt-2 text-[#355E3B] hover:underline font-bold flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Sign In</span>
            </button>
          </div>
        ) : (
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

            <button
              type="submit"
              disabled={isSending}
              className="w-full py-2.5 bg-[#355E3B] hover:bg-[#1F3D27] text-white border border-[#1F3D27] font-tactical font-bold text-xs tracking-wider uppercase rounded-xs transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer mt-3"
            >
              <span>{isSending ? 'Transmitting...' : 'SEND INSTRUCTIONS'}</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#B5A47A]" />
            </button>

            <button
              type="button"
              onClick={() => onNavigate('login')}
              className="w-full py-2 text-center text-[#52606D] hover:text-[#1F2933] font-semibold text-xs transition-colors cursor-pointer"
            >
              Cancel and Return to Sign In
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
