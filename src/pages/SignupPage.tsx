import React, { useState } from 'react';
import { Logo } from '../components/common/Logo';
import { useAuth } from '../lib/authContext';
import { User, Lock, Mail, ArrowRight, AlertCircle, Shield, MapPin, Check } from 'lucide-react';
import { NavTab } from '../components/layout/Header';
import { UserRole, LogisticsZone } from '../types';

interface SignupPageProps {
  onNavigate: (tab: NavTab) => void;
}

export const SignupPage: React.FC<SignupPageProps> = ({ onNavigate }) => {
  const { signup, isLoading } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole>('ZONAL_HEAD');
  const [zone, setZone] = useState<LogisticsZone>('Srinagar');
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

    const res = await signup(
      fullName, 
      email, 
      password, 
      role, 
      role === 'MAIN_HEAD' ? null : zone
    );

    if (res.success) {
      localStorage.setItem('vyomix_login_message', 'Account created successfully. Please sign in to continue.');
      onNavigate('login');
    } else {
      setError(res.error || 'Failed to create account.');
    }
  };

  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center p-4 bg-[#F7F8F4]">
      <div className="w-full max-w-lg bg-white border border-[#D8DFD5] rounded-sm p-8 shadow-sm space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-2">
            <Logo size="lg" showText={false} />
          </div>
          <h1 className="font-tactical font-black text-2xl text-[#1F2933] tracking-wider uppercase">
            Create VYOMIX Account
          </h1>
          <p className="font-mono text-xs text-[#52606D]">
            Multi-Tier Logistics Communication & Command Platform
          </p>
        </div>

        {error && (
          <div className="p-3 bg-[#FEE4E2] border border-[#FDA29B] rounded-xs flex items-center gap-2 text-xs font-mono text-[#B42318]">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
          {/* ACCOUNT TYPE (Requirement 3) */}
          <div className="space-y-1.5">
            <label className="text-[#1F2933] block uppercase font-bold text-[11px] tracking-wider">
              ACCOUNT TYPE
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Main Head */}
              <label
                onClick={() => setRole('MAIN_HEAD')}
                className={`p-3.5 rounded-xs border cursor-pointer transition-all flex items-start gap-3 ${
                  role === 'MAIN_HEAD'
                    ? 'bg-[#F0F4EE] border-[#355E3B] shadow-xs'
                    : 'bg-white border-[#D8DFD5] hover:border-[#CAD3C8]'
                }`}
              >
                <input
                  type="radio"
                  name="account_type"
                  checked={role === 'MAIN_HEAD'}
                  onChange={() => setRole('MAIN_HEAD')}
                  className="mt-0.5 accent-[#355E3B] cursor-pointer"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <Shield className={`w-3.5 h-3.5 ${role === 'MAIN_HEAD' ? 'text-[#355E3B]' : 'text-[#52606D]'}`} />
                    <span className="font-tactical font-bold text-xs uppercase text-[#1F2933]">
                      Main Head
                    </span>
                  </div>
                  <p className="text-[10px] text-[#52606D] mt-1 leading-relaxed">
                    Full cross-zone oversight across all 4 zones. Directs replenishments & acknowledges zonal requests.
                  </p>
                </div>
              </label>

              {/* Zonal Head */}
              <label
                onClick={() => setRole('ZONAL_HEAD')}
                className={`p-3.5 rounded-xs border cursor-pointer transition-all flex items-start gap-3 ${
                  role === 'ZONAL_HEAD'
                    ? 'bg-[#F0F4EE] border-[#355E3B] shadow-xs'
                    : 'bg-white border-[#D8DFD5] hover:border-[#CAD3C8]'
                }`}
              >
                <input
                  type="radio"
                  name="account_type"
                  checked={role === 'ZONAL_HEAD'}
                  onChange={() => setRole('ZONAL_HEAD')}
                  className="mt-0.5 accent-[#355E3B] cursor-pointer"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className={`w-3.5 h-3.5 ${role === 'ZONAL_HEAD' ? 'text-[#355E3B]' : 'text-[#52606D]'}`} />
                    <span className="font-tactical font-bold text-xs uppercase text-[#1F2933]">
                      Zonal Head
                    </span>
                  </div>
                  <p className="text-[10px] text-[#52606D] mt-1 leading-relaxed">
                    Dedicated regional commander strictly isolated to single assigned sector. Submits support requests.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* ZONE SELECTOR: Shown ONLY when ZONAL_HEAD is selected (Phase 1) */}
          {role === 'ZONAL_HEAD' && (
            <div className="p-3.5 bg-[#F0F4EE] border border-[#CAD3C8] rounded-xs space-y-2">
              <label className="text-[#1F2933] block uppercase font-bold text-[11px] tracking-wider flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#355E3B]" />
                <span>SELECT OPERATIONAL ZONE</span>
              </label>
              <select
                value={zone}
                onChange={(e) => setZone(e.target.value as LogisticsZone)}
                className="w-full px-3.5 py-2.5 bg-white border border-[#D8DFD5] focus:border-[#355E3B] text-[#1F2933] font-bold text-xs rounded-xs focus:outline-hidden cursor-pointer shadow-xs"
              >
                <option value="Srinagar">Srinagar (Mountain/Cold Sector)</option>
                <option value="Jaisalmer">Jaisalmer (Desert/Arid Sector)</option>
                <option value="Ahmedabad">Ahmedabad (Central Railhead Hub)</option>
                <option value="Kutch">Kutch (Coastal Marsh Sector)</option>
              </select>
            </div>
          )}

          <div>
            <label className="text-[#52606D] block mb-1 uppercase font-semibold text-[11px]">
              Full Name / Officer Designation
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-[#52606D] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={role === 'MAIN_HEAD' ? 'Maj. Gen. A. Singhal' : `Col. K. Verma (${zone})`}
                className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-[#D8DFD5] focus:border-[#355E3B] text-[#1F2933] rounded-xs focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="text-[#52606D] block mb-1 uppercase font-semibold text-[11px]">
              Official Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#52606D] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={role === 'MAIN_HEAD' ? 'main.head@vyomix.gov.in' : `${zone.toLowerCase()}.head@vyomix.gov.in`}
                className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-[#D8DFD5] focus:border-[#355E3B] text-[#1F2933] rounded-xs focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[#52606D] block mb-1 uppercase font-semibold text-[11px]">
                Password
              </label>
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

            <div>
              <label className="text-[#52606D] block mb-1 uppercase font-semibold text-[11px]">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#52606D] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-[#D8DFD5] focus:border-[#355E3B] text-[#1F2933] rounded-xs focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 bg-[#355E3B] hover:bg-[#1F3D27] text-white border border-[#1F3D27] font-tactical font-bold text-xs tracking-wider uppercase rounded-xs transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer mt-3"
          >
            <span>{isLoading ? 'Registering Officer...' : 'CREATE ACCOUNT'}</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#B5A47A]" />
          </button>
        </form>

        <div className="text-center font-mono text-xs text-[#52606D] pt-4 border-t border-[#F0F4EE]">
          Already have an account?{' '}
          <button
            onClick={() => onNavigate('login')}
            className="text-[#355E3B] hover:underline font-bold cursor-pointer"
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
};

