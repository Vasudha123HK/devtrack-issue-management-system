import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Code2, ShieldCheck, CheckCircle2, Zap } from 'lucide-react';

export const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Glow Circles */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-500/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center mb-8">
        <Link to="/login" className="inline-flex items-center space-x-3 group">
          <div className="w-12 h-12 rounded-xl bg-brand-600 flex items-center justify-center text-white shadow-xl shadow-brand-500/30 group-hover:scale-105 transition-transform">
            <Code2 className="w-7 h-7 stroke-[2.2]" />
          </div>
          <div className="text-left">
            <h1 className="text-2xl font-black text-white tracking-tight leading-none">
              DevTrack
            </h1>
            <p className="text-xs text-brand-300 font-medium tracking-wider uppercase mt-1">
              Issue & Task Management
            </p>
          </div>
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-2xl rounded-2xl border border-slate-100 animate-fade-in">
          <Outlet />
        </div>

        {/* Feature Badges Footer */}
        <div className="mt-8 grid grid-cols-3 gap-2 text-center text-xs text-slate-400 font-medium">
          <div className="flex items-center justify-center space-x-1">
            <ShieldCheck className="w-3.5 h-3.5 text-brand-400" />
            <span>JWT Auth</span>
          </div>
          <div className="flex items-center justify-center space-x-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>RBAC Roles</span>
          </div>
          <div className="flex items-center justify-center space-x-1">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>REST API</span>
          </div>
        </div>
      </div>
    </div>
  );
};
