import React, { useState } from 'react';
import { Sparkles, Mail, Lock, User, Briefcase, RefreshCw, Star, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

interface AuthLayoutProps {
  onLogin: (email: string, pass: string) => Promise<void>;
  onRegister: (data: {
    email: string;
    fullName: string;
    pass: string;
    currentRole: string;
    targetRole: string;
    primaryFocus: string;
  }) => Promise<void>;
}

export function AuthLayout({ onLogin, onRegister }: AuthLayoutProps) {
  const [isLogin, setIsLogin] = useState(true);
  
  // General inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [currentRole, setCurrentRole] = useState('Frontend Developer');
  const [targetRole, setTargetRole] = useState('Full Stack AI Architect');
  const [primaryFocus, setPrimaryFocus] = useState('React, Node, generative AI integration');

  const [errorCode, setErrorCode] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Quick Demo account trigger
  const handleQuickDemo = async () => {
    setEmail('pavithravalli0903@gmail.com');
    setPassword('Password123!');
    setSubmitting(true);
    setErrorCode('');
    try {
      await onLogin('pavithravalli0903@gmail.com', 'Password123!');
    } catch (err: any) {
      setErrorCode(err.message || 'Error executing quick sign in.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorCode('Email and password must be supplied.');
      return;
    }
    setSubmitting(true);
    setErrorCode('');

    try {
      if (isLogin) {
        await onLogin(email.trim(), password);
      } else {
        if (!fullName.trim() || !currentRole.trim() || !targetRole.trim()) {
          setErrorCode('Please complete all profile details to continue.');
          setSubmitting(false);
          return;
        }
        await onRegister({
          email: email.trim(),
          pass: password,
          fullName: fullName.trim(),
          currentRole: currentRole.trim(),
          targetRole: targetRole.trim(),
          primaryFocus: primaryFocus.trim()
        });
      }
    } catch (err: any) {
      setErrorCode(err.message || 'Something went wrong. Please check credentials and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 py-12 md:py-20">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(59,130,246,0.15),rgba(255,255,255,0))] z-0"></div>
      
      <div className="z-10 max-w-md w-full">
        {/* Brand Banner */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-blue-200 mb-4 animate-bounce">
            <Sparkles className="w-6 h-6 fill-white/10" />
          </div>
          <h1 className="font-sans font-black text-2xl md:text-3xl tracking-tight text-slate-800 leading-tight">
            Skill Sync <span className="text-blue-600">AI</span>
          </h1>
          <p className="text-xs text-slate-500 mt-2 max-w-xs mx-auto">
            Synchronize, trace, and elevate your technical capabilities with Gemini-guided skill gap transition roadmaps.
          </p>
        </div>

        {/* Card Frame */}
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-xl overflow-hidden">
          {/* Segmented Controller Tab */}
          <div className="flex bg-slate-50 border border-slate-100 p-1.5 rounded-2xl mb-6">
            <button
              onClick={() => { setIsLogin(true); setErrorCode(''); }}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isLogin 
                  ? 'bg-blue-600 text-white shadow-xs' 
                  : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setIsLogin(false); setErrorCode(''); }}
              className={`flex-1 py-1 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                !isLogin 
                  ? 'bg-blue-600 text-white shadow-xs' 
                  : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              Transition Registry
            </button>
          </div>

          {errorCode && (
            <div className="bg-red-50 text-red-650 border border-red-100 rounded-xl p-3 text-xs font-semibold mb-4 text-left">
              {errorCode}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            {/* Full Name for register */}
            {!isLogin && (
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Your Full Name</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Pavithra Valli"
                    className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-blue-500 text-slate-800 focus:bg-white"
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-blue-500 text-slate-800 focus:bg-white"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Secure Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-blue-500 text-slate-800 focus:bg-white"
                />
              </div>
            </div>

            {/* Role configs for registration */}
            {!isLogin && (
              <div className="space-y-4 pt-1.5 border-t border-dashed border-slate-100 mt-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Core Skill Transition Matrix</span>
                
                <div className="grid grid-cols-2 gap-3">
                  {/* Current title */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Current Role</label>
                    <input
                      type="text"
                      required
                      value={currentRole}
                      onChange={(e) => setCurrentRole(e.target.value)}
                      placeholder="Frontend Developer"
                      className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-500 text-slate-800"
                    />
                  </div>

                  {/* Target title */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Target Dream Role</label>
                    <input
                      type="text"
                      required
                      value={targetRole}
                      onChange={(e) => setTargetRole(e.target.value)}
                      placeholder="CTO / AI Architect"
                      className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-500 text-slate-800"
                    />
                  </div>
                </div>

                {/* Primary focus keywords */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Primary Technological Domains</label>
                  <input
                    type="text"
                    value={primaryFocus}
                    onChange={(e) => setPrimaryFocus(e.target.value)}
                    placeholder="React, AWS Cloud, LangChain pipelines"
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-500 text-slate-800"
                  />
                  <span className="text-[9px] text-slate-400 block mt-1 leading-normal italic">Helping Gemini contextualize critical tech skill gaps.</span>
                </div>
              </div>
            )}

            {/* Action buttons */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-700 hover:opacity-95 text-white text-sm font-bold rounded-xl shadow-md cursor-pointer flex items-center justify-center space-x-1 shadow-blue-200 mt-6"
            >
              {submitting && <RefreshCw className="w-4 h-4 animate-spin mr-1.5" />}
              <span>{isLogin ? 'Sign In Securely' : 'Complete Transition Setup'}</span>
            </button>
          </form>

          {/* Instant preseeded exploration option */}
          <div className="mt-6 border-t border-slate-100 pt-5">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50/50 border border-blue-100 rounded-2xl p-4 text-center">
              <div className="flex items-center space-x-1.5 justify-center text-blue-600 font-bold text-xs mb-1">
                <Star className="w-4 h-4 fill-blue-50" />
                <span>Pre-Seeded Demo Exploration</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-normal mb-3 text-center">
                Want to bypass typing? Standard credentials of <strong className="text-slate-700">pavithravalli0903@gmail.com</strong> are preloaded with active skill progress details.
              </p>
              <button
                type="button"
                onClick={handleQuickDemo}
                disabled={submitting}
                className="w-full bg-white hover:bg-slate-50 border border-blue-200 text-blue-600 font-semibold py-1.5 px-3 rounded-lg text-xs transition-all cursor-pointer flex items-center justify-center space-x-1"
              >
                <span>Instant Demo Access</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
