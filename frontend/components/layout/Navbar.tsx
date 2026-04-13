"use client";

import React from 'react';
import { ShieldAlert, Bell, User } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 h-14 bg-[#1B3A6B] flex items-center justify-between px-6 z-[100] shadow-md">
      <div className="flex items-center gap-3">
        <div className="bg-gradient-to-br from-[#0D7377] to-[#1B3A6B] p-1.5 rounded-lg border border-white/10">
          <ShieldAlert size={20} className="text-white" />
        </div>
        <span className="text-lg font-bold text-white tracking-wide">ClaimsGuard AI</span>
        <span className="text-[11px] text-[#CADCFC] bg-white/10 px-2.5 py-1 rounded-full ml-2 font-medium border border-white/5">
          BETA
        </span>
      </div>
      
      <div className="flex items-center gap-4">
        <button className="relative p-2 text-[#CADCFC] hover:text-white hover:bg-white/10 rounded-full transition-colors">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-[#1B3A6B]"></span>
        </button>
        <div className="h-6 w-px bg-white/20"></div>
        <button className="flex items-center gap-2 text-sm text-white hover:bg-white/10 py-1.5 px-3 rounded-full transition-colors">
          <div className="w-7 h-7 bg-[#0D7377] rounded-full flex items-center justify-center border border-white/20">
            <User size={14} />
          </div>
          <span className="font-medium hidden sm:block">Admin</span>
        </button>
      </div>
    </nav>
  );
}

