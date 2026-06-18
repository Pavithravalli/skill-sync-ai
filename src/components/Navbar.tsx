import React from 'react';
import { UserProfile } from '../types';
import { LogOut, Sliders, CheckCircle2, Award, Zap } from 'lucide-react';

interface NavbarProps {
  user: UserProfile;
  onLogout: () => void;
  aiConnected: boolean;
}

export function Navbar({ user, onLogout, aiConnected }: NavbarProps) {
  return (
    <nav className="bg-white border-b border-blue-100 sticky top-0 z-50 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo & title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center text-white shadow-md shadow-blue-200">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <span className="font-sans font-bold text-xl tracking-tight text-slate-800">
                Skill Sync <span className="text-blue-600">AI</span>
              </span>
              <div className="flex items-center space-x-1.5 text-xs text-slate-400 font-mono">
                <span>v1.0.0</span>
                <span>•</span>
                <span className={`inline-block w-1.5 h-1.5 rounded-full ${aiConnected ? 'bg-emerald-500' : 'bg-amber-400'}`}></span>
                <span>{aiConnected ? 'Gemini Engine Active' : 'Offline Backup'}</span>
              </div>
            </div>
          </div>

          {/* User profile & Action */}
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-sm font-semibold text-slate-800">{user.fullName}</span>
              <span className="text-xs text-blue-500 font-medium">
                {user.currentRole} → <span className="font-semibold text-indigo-600">{user.targetRole}</span>
              </span>
            </div>

            <div className="h-8 w-px bg-slate-200"></div>

            <button
              onClick={onLogout}
              className="p-2 text-slate-400 hover:text-red-500 transition-colors duration-200 rounded-lg hover:bg-red-50 flex items-center space-x-1.5 text-sm"
              title="Sign Out"
            >
              <LogOut className="w-5 h-5" />
              <span className="hidden sm:inline font-medium">Log Out</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
