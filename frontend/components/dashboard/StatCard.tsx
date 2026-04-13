"use client";

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color: 'blue' | 'teal' | 'red' | 'slate';
}

export default function StatCard({ title, value, subtitle, icon: Icon, trend, color }: StatCardProps) {
  const colorStyles = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    teal: 'bg-[#0D7377]/10 text-[#0D7377] border-[#0D7377]/20',
    red: 'bg-red-50 text-red-600 border-red-100',
    slate: 'bg-slate-50 text-slate-600 border-slate-100',
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E2E8F0] hover:shadow-md transition-shadow duration-300">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-slate-800">{value}</h3>
          
          {subtitle && (
            <p className="text-xs text-slate-400 mt-2">{subtitle}</p>
          )}
          
          {trend && (
            <div className={`flex items-center mt-2 text-xs font-medium ${trend.isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
              <span className={`inline-block mr-1 ${trend.isPositive ? 'rotate-[-45deg]' : 'rotate-[45deg]'}`}>
                →
              </span>
              {Math.abs(trend.value)}% from last batch
            </div>
          )}
        </div>
        
        <div className={`p-3 rounded-xl border ${colorStyles[color]}`}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
}

