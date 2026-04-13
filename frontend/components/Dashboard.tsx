"use client";

import React, { useState, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { AlertTriangle, CheckCircle, DollarSign, Activity, Search, Filter } from 'lucide-react';

interface DashboardProps {
  data: any[];
}

export default function Dashboard({ data }: DashboardProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Anomaly Detection Logic (Frontend Simulation)
  const processedData = useMemo(() => {
    if (!data || data.length === 0) return [];

    // Calculate baseline metrics for anomaly detection
    const amounts = data.map(row => parseFloat(row.ClaimAmount || row.amount || row.Amount || 0)).filter(val => !isNaN(val));
    const avgAmount = amounts.reduce((a, b) => a + b, 0) / (amounts.length || 1);
    const stdDev = Math.sqrt(amounts.reduce((sq, n) => sq + Math.pow(n - avgAmount, 2), 0) / (amounts.length || 1));
    
    // Threshold for anomaly (e.g., > 2 standard deviations)
    const threshold = avgAmount + (stdDev * 2);

    return data.map((row, index) => {
      const amount = parseFloat(row.ClaimAmount || row.amount || row.Amount || 0);
      const provider = row.Provider || row.provider || 'Unknown';
      const diagnosis = row.DiagnosisCode || row.diagnosis || 'Unknown';
      
      // Simple rule-based anomaly detection for demonstration
      let isAnomaly = false;
      let anomalyReason = '';
      let riskScore = Math.floor(Math.random() * 30); // Base risk 0-30

      // Rule 1: Unusually high amount
      if (amount > threshold) {
        isAnomaly = true;
        anomalyReason = 'Unusually high claim amount';
        riskScore += 60;
      }
      
      // Rule 2: Specific high-risk diagnosis codes (simulated)
      if (['E11.9', 'I10', 'J44.9'].includes(diagnosis) && amount > avgAmount * 1.5) {
        isAnomaly = true;
        anomalyReason = anomalyReason ? `${anomalyReason}, High-risk diagnosis pattern` : 'High-risk diagnosis pattern';
        riskScore += 40;
      }

      // Rule 3: Flagged providers (simulated)
      if (provider.includes('Clinic X') || provider.includes('Dr. Smith')) {
         // Just a simulation rule
         riskScore += 20;
         if (riskScore > 75) {
           isAnomaly = true;
           anomalyReason = anomalyReason || 'Suspicious provider pattern';
         }
      }

      // Ensure risk score is capped at 99
      riskScore = Math.min(riskScore, 99);

      // If it's marked as anomaly in the source data, respect that
      if (row.IsAnomaly === 'Yes' || row.is_anomaly === true || row.anomaly === 1) {
        isAnomaly = true;
        riskScore = Math.max(riskScore, 85);
        anomalyReason = anomalyReason || 'Flagged by source system';
      }

      return {
        id: row.ClaimID || row.id || `CLM-${10000 + index}`,
        date: row.Date || row.date || new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toISOString().split('T')[0],
        provider: provider,
        diagnosis: diagnosis,
        amount: isNaN(amount) ? 0 : amount,
        isAnomaly,
        anomalyReason,
        riskScore,
        status: isAnomaly ? 'Review Required' : 'Approved',
        originalData: row
      };
    });
  }, [data]);

  // Calculate Summary Statistics
  const stats = useMemo(() => {
    const total = processedData.length;
    const anomalies = processedData.filter(d => d.isAnomaly).length;
    const totalAmount = processedData.reduce((sum, d) => sum + d.amount, 0);
    const anomalyAmount = processedData.filter(d => d.isAnomaly).reduce((sum, d) => sum + d.amount, 0);
    
    return {
      total,
      anomalies,
      anomalyRate: total > 0 ? ((anomalies / total) * 100).toFixed(1) : '0',
      totalAmount,
      anomalyAmount
    };
  }, [processedData]);

  // Prepare Chart Data
  const chartData = useMemo(() => {
    // Group by date for trend line
    const dateMap = new Map();
    processedData.forEach(d => {
      const date = d.date;
      if (!dateMap.has(date)) {
        dateMap.set(date, { date, normal: 0, anomaly: 0 });
      }
      if (d.isAnomaly) {
        dateMap.get(date).anomaly += d.amount;
      } else {
        dateMap.get(date).normal += d.amount;
      }
    });
    
    const trendData = Array.from(dateMap.values())
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-10); // Last 10 days

    // Provider risk distribution
    const providerMap = new Map();
    processedData.filter(d => d.isAnomaly).forEach(d => {
      providerMap.set(d.provider, (providerMap.get(d.provider) || 0) + 1);
    });
    
    const providerData = Array.from(providerMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return { trendData, providerData };
  }, [processedData]);

  // Filter Data for Table
  const filteredData = useMemo(() => {
    return processedData.filter(item => {
      const matchesSearch = 
        item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.provider.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.diagnosis.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesFilter = 
        filterStatus === 'all' ? true :
        filterStatus === 'anomaly' ? item.isAnomaly :
        !item.isAnomaly;

      return matchesSearch && matchesFilter;
    });
  }, [processedData, searchTerm, filterStatus]);

  const COLORS = ['#0D7377', '#1B3A6B', '#ef4444', '#f59e0b', '#10b981'];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 text-sm font-medium">Total Claims</h3>
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <Activity size={20} className="text-blue-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-800">{stats.total.toLocaleString()}</p>
          <p className="text-sm text-gray-500 mt-2">Processed records</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 text-sm font-medium">Detected Anomalies</h3>
            <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
              <AlertTriangle size={20} className="text-red-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-red-600">{stats.anomalies.toLocaleString()}</p>
          <p className="text-sm text-red-500 mt-2 font-medium">{stats.anomalyRate}% of total claims</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 text-sm font-medium">Total Value</h3>
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
              <DollarSign size={20} className="text-green-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-800">${stats.totalAmount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
          <p className="text-sm text-gray-500 mt-2">Across all claims</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 text-sm font-medium">Value at Risk</h3>
            <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
              <AlertTriangle size={20} className="text-orange-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-orange-600">${stats.anomalyAmount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
          <p className="text-sm text-orange-500 mt-2 font-medium">Requires investigation</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">Claim Value Trends</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData.trendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} tickFormatter={(val) => `$${val/1000}k`} />
                <Tooltip 
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                  formatter={(value: number) => [`$${value.toLocaleString()}`, undefined]}
                />
                <Legend />
                <Line type="monotone" dataKey="normal" name="Normal Claims" stroke="#0D7377" strokeWidth={3} dot={false} activeDot={{r: 6}} />
                <Line type="monotone" dataKey="anomaly" name="Anomalous Claims" stroke="#ef4444" strokeWidth={3} dot={false} activeDot={{r: 6}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">Top Providers by Anomalies</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData.providerData} layout="vertical" margin={{ left: 40 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} width={100} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                />
                <Bar dataKey="count" name="Anomaly Count" fill="#1B3A6B" radius={[0, 4, 4, 0]}>
                  {chartData.providerData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="text-lg font-semibold text-gray-800">Detailed Claims Analysis</h3>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search claims..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0D7377]/20 focus:border-[#0D7377] w-full sm:w-64"
              />
            </div>
            
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="py-2 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0D7377]/20 focus:border-[#0D7377] bg-white"
            >
              <option value="all">All Claims</option>
              <option value="anomaly">Anomalies Only</option>
              <option value="normal">Normal Only</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-200">
              <tr>
                <th className="px-6 py-4">Claim ID</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Provider</th>
                <th className="px-6 py-4">Diagnosis</th>
                <th className="px-6 py-4 text-right">Amount</th>
                <th className="px-6 py-4">Risk Score</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredData.slice(0, 20).map((row, idx) => (
                <tr key={row.id} className="hover:bg-gray-50 transition-colors row-animate" style={{ animationDelay: `${idx * 0.05}s` }}>
                  <td className="px-6 py-4 font-medium text-gray-900">{row.id}</td>
                  <td className="px-6 py-4 text-gray-500">{row.date}</td>
                  <td className="px-6 py-4 text-gray-700">{row.provider}</td>
                  <td className="px-6 py-4 text-gray-500">{row.diagnosis}</td>
                  <td className="px-6 py-4 text-right font-medium text-gray-900">
                    ${row.amount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-full bg-gray-200 rounded-full h-2 max-w-[60px]">
                        <div 
                          className={`h-2 rounded-full ${
                            row.riskScore > 75 ? 'bg-red-500' : 
                            row.riskScore > 40 ? 'bg-orange-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${row.riskScore}%` }}
                        ></div>
                      </div>
                      <span className={`text-xs font-medium ${
                        row.riskScore > 75 ? 'text-red-600' : 
                        row.riskScore > 40 ? 'text-orange-600' : 'text-green-600'
                      }`}>
                        {row.riskScore}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {row.isAnomaly ? (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 text-red-700 text-xs font-medium border border-red-100">
                        <AlertTriangle size={12} />
                        Review Required
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-50 text-green-700 text-xs font-medium border border-green-100">
                        <CheckCircle size={12} />
                        Approved
                      </div>
                    )}
                    {row.anomalyReason && (
                      <p className="text-[10px] text-red-500 mt-1 max-w-[150px] truncate" title={row.anomalyReason}>
                        {row.anomalyReason}
                      </p>
                    )}
                  </td>
                </tr>
              ))}
              {filteredData.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    No claims found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {filteredData.length > 20 && (
          <div className="p-4 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-500">Showing 20 of {filteredData.length} results. Use filters to narrow down.</p>
          </div>
        )}
      </div>
    </div>
  );
}

