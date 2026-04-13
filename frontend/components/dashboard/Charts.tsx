"use client";

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

interface ChartsProps {
  stats: any;
}

export default function Charts({ stats }: ChartsProps) {
  if (!stats) return null;

  const pieData = [
    { name: 'Clean Claims', value: stats.cleanCount, color: '#10B981' },
    { name: 'Anomalies', value: stats.anomalyCount, color: '#EF4444' },
  ];

  // Mock data for the bar chart based on the stats
  const barData = [
    { name: 'Mon', clean: Math.floor(stats.cleanCount * 0.15), anomalies: Math.floor(stats.anomalyCount * 0.1) },
    { name: 'Tue', clean: Math.floor(stats.cleanCount * 0.2), anomalies: Math.floor(stats.anomalyCount * 0.3) },
    { name: 'Wed', clean: Math.floor(stats.cleanCount * 0.25), anomalies: Math.floor(stats.anomalyCount * 0.15) },
    { name: 'Thu', clean: Math.floor(stats.cleanCount * 0.15), anomalies: Math.floor(stats.anomalyCount * 0.25) },
    { name: 'Fri', clean: Math.floor(stats.cleanCount * 0.25), anomalies: Math.floor(stats.anomalyCount * 0.2) },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#E2E8F0]">
        <h3 className="text-lg font-bold text-[#1B3A6B] mb-6">Anomaly Distribution</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={80}
                outerRadius={110}
                paddingAngle={5}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#E2E8F0]">
        <h3 className="text-lg font-bold text-[#1B3A6B] mb-6">Claims Volume (Weekly)</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={barData}
              margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748B' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B' }} />
              <Tooltip 
                cursor={{ fill: '#F1F5F9' }}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Legend />
              <Bar dataKey="clean" name="Clean Claims" stackId="a" fill="#10B981" radius={[0, 0, 4, 4]} />
              <Bar dataKey="anomalies" name="Anomalies" stackId="a" fill="#EF4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

