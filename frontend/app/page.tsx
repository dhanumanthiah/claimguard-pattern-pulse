"use client";

import React, { useState } from 'react';
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import Footer from './components/layout/Footer';
import FileUpload from './components/dashboard/FileUpload';
import StatCard from './components/dashboard/StatCard';
import DataTable from './components/dashboard/DataTable';
import Charts from './components/dashboard/Charts';
import { parseCSV, detectAnomalies } from './lib/anomalyDetection';
import { FileText, AlertTriangle, CheckCircle, DollarSign } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [data, setData] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);

  const handleDataLoaded = (csvText: string) => {
    const parsedData = parseCSV(csvText);
    const { processedData, stats: newStats } = detectAnomalies(parsedData);
    setData(processedData);
    setStats(newStats);
    setActiveTab('dashboard'); // Switch to dashboard view after upload
  };

  return (
    <div className="min-h-screen bg-[#F4F7FB] font-sans text-[#1E293B]">
      <Navbar />
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="ml-[240px] mt-[56px] p-8 min-h-[calc(100vh-56px)] flex flex-col">
        <div className="flex-grow max-w-7xl mx-auto w-full">
          
          {/* Header Section */}
          <div className="mb-8 row-animate">
            <h1 className="text-3xl font-bold text-[#1B3A6B] tracking-tight">
              {activeTab === 'dashboard' && 'Dashboard Overview'}
              {activeTab === 'upload' && 'Data Ingestion'}
              {activeTab === 'anomalies' && 'Anomaly Investigation'}
              {activeTab === 'reports' && 'System Reports'}
            </h1>
            <p className="text-slate-500 mt-2">
              {activeTab === 'dashboard' && 'Monitor and analyze claims data for potential fraud and anomalies.'}
              {activeTab === 'upload' && 'Upload new synthetic claims data batches for AI analysis.'}
              {activeTab === 'anomalies' && 'Deep dive into flagged claims and investigate potential issues.'}
              {activeTab === 'reports' && 'Generate and export compliance and audit reports.'}
            </p>
          </div>

          {/* Content Area */}
          {activeTab === 'upload' && (
            <div className="row-animate" style={{ animationDelay: '0.1s' }}>
              <FileUpload onDataLoaded={handleDataLoaded} />
            </div>
          )}

          {(activeTab === 'dashboard' || activeTab === 'anomalies') && !stats && (
            <div className="bg-white rounded-2xl p-12 text-center border border-[#E2E8F0] shadow-sm row-animate">
              <div className="w-20 h-20 bg-[#1B3A6B]/5 rounded-full flex items-center justify-center mx-auto mb-6">
                <FileText size={40} className="text-[#1B3A6B]/40" />
              </div>
              <h2 className="text-2xl font-bold text-slate-700 mb-3">No Data Available</h2>
              <p className="text-slate-500 max-w-md mx-auto mb-8">
                Please upload a synthetic claims dataset to begin the anomaly detection process and view your dashboard.
              </p>
              <button 
                onClick={() => setActiveTab('upload')}
                className="bg-[#0D7377] hover:bg-[#0A5A5D] text-white px-8 py-3 rounded-xl font-semibold transition-all shadow-lg shadow-[#0D7377]/30 hover:shadow-xl hover:-translate-y-0.5"
              >
                Go to Upload
              </button>
            </div>
          )}

          {activeTab === 'dashboard' && stats && (
            <div className="space-y-8">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 row-animate" style={{ animationDelay: '0.1s' }}>
                <StatCard 
                  title="Total Claims Processed" 
                  value={stats.totalClaims.toLocaleString()} 
                  icon={FileText} 
                  color="blue"
                  trend={{ value: 12.5, isPositive: true }}
                />
                <StatCard 
                  title="Anomalies Detected" 
                  value={stats.anomalyCount.toLocaleString()} 
                  subtitle={`${stats.anomalyRate}% of total claims`}
                  icon={AlertTriangle} 
                  color="red"
                  trend={{ value: 4.2, isPositive: false }}
                />
                <StatCard 
                  title="Clean Claims" 
                  value={stats.cleanCount.toLocaleString()} 
                  icon={CheckCircle} 
                  color="teal"
                />
                <StatCard 
                  title="Flagged Amount" 
                  value={`$${stats.anomalyAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} 
                  icon={DollarSign} 
                  color="slate"
                />
              </div>

              {/* Charts */}
              <div className="row-animate" style={{ animationDelay: '0.2s' }}>
                <Charts stats={stats} />
              </div>

              {/* Data Table Preview */}
              <div className="row-animate" style={{ animationDelay: '0.3s' }}>
                <div className="flex justify-between items-end mb-4">
                  <h3 className="text-lg font-bold text-[#1B3A6B]">Recent Claims Analysis</h3>
                  <button 
                    onClick={() => setActiveTab('anomalies')}
                    className="text-sm text-[#0D7377] font-medium hover:underline"
                  >
                    View All Data →
                  </button>
                </div>
                <DataTable data={data.slice(0, 5)} />
              </div>
            </div>
          )}

          {activeTab === 'anomalies' && stats && (
            <div className="row-animate" style={{ animationDelay: '0.1s' }}>
              <DataTable data={data} />
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="bg-white rounded-2xl p-12 text-center border border-[#E2E8F0] shadow-sm row-animate">
              <div className="w-20 h-20 bg-[#0D7377]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <FileText size={40} className="text-[#0D7377]" />
              </div>
              <h2 className="text-2xl font-bold text-slate-700 mb-3">Reports Module</h2>
              <p className="text-slate-500 max-w-md mx-auto">
                The reporting module is currently in development. Soon you will be able to export detailed PDF and Excel reports of your anomaly findings.
              </p>
            </div>
          )}

        </div>
        <Footer />
      </main>
    </div>
  );
}

