"use client";

import React from 'react';
import { LayoutDashboard, Upload, AlertTriangle, FileText, Settings, HelpCircle } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'upload', label: 'Upload Data', icon: Upload },
    { id: 'anomalies', label: 'Anomalies', icon: AlertTriangle },
    { id: 'reports', label: 'Reports', icon: FileText },
  ];

  const bottomItems = [
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'help', label: 'Help & Support', icon: HelpCircle },
  ];

  return (
    <aside className="fixed top-14 left-0 w-[240px] h-[calc(100vh-56px)] bg-[#1B3A6B] py-6 z-[99] flex flex-col justify-between border-r border-white/5 shadow-xl">
      <div className="space-y-1 px-3">
        <div className="px-4 mb-4 text-xs font-semibold text-[#CADCFC]/60 uppercase tracking-wider">
          Main Menu
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive 
                  ? 'bg-[#0D7377]/30 text-white border-l-4 border-[#0D7377] shadow-inner' 
                  : 'text-white/70 hover:bg-white/5 hover:text-white border-l-4 border-transparent'
              }`}
            >
              <Icon size={18} className={isActive ? 'text-[#0D7377]' : 'text-white/50'} />
              {item.label}
            </button>
          );
        })}
      </div>

      <div className="space-y-1 px-3">
        <div className="px-4 mb-4 text-xs font-semibold text-[#CADCFC]/60 uppercase tracking-wider">
          System
        </div>
        {bottomItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-white/70 hover:bg-white/5 hover:text-white transition-all duration-200 border-l-4 border-transparent"
            >
              <Icon size={18} className="text-white/50" />
              {item.label}
            </button>
          );
        })}
      </div>
    </aside>
  );
}

