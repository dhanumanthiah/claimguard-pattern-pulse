"use client";

import React, { useState } from 'react';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import Footer from '../components/layout/Footer';
import FileUpload from '../components/FileUpload';
import Dashboard from '../components/Dashboard';

export default function App() {
  const [activeTab, setActiveTab] = useState('upload');
  const [appData, setAppData] = useState<{ claims: any[]; members: any[] } | null>(null);

  const handleDataLoaded = (data: { claims: any[]; members: any[] }) => {
    setAppData(data);
    setActiveTab('dashboard');
  };

  return (
    <div className="min-h-screen bg-[#F4F7FB] flex flex-col">
      <Navbar />
      
      <div className="flex flex-1 pt-14">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        
        <main className="flex-1 ml-[240px] p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <header className="mb-8">
              <h1 className="text-3xl font-bold text-[#1B3A6B] tracking-tight">
                {activeTab === 'dashboard' && 'Analytics Dashboard'}
                {activeTab === 'upload' && 'Data Ingestion'}
                {activeTab === 'anomalies' && 'Anomaly Investigation'}
                {activeTab === 'reports' && 'System Reports'}
              </h1>
              <p className="text-gray-500 mt-1">
                {activeTab === 'dashboard' && 'Overview of claims processing and detected anomalies.'}
                {activeTab === 'upload' && 'Upload synthetic claims and member data for AI analysis.'}
                {activeTab === 'anomalies' && 'Detailed view of flagged claims requiring review.'}
                {activeTab === 'reports' && 'Generate and export compliance and audit reports.'}
              </p>
            </header>

            <div className="min-h-[60vh]">
              {activeTab === 'upload' && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                  <FileUpload onDataLoaded={handleDataLoaded} />
                </div>
              )}

              {activeTab === 'dashboard' && (
                appData ? (
                  <Dashboard data={appData} />
                ) : (
                  <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Data Available</h3>
                    <p className="text-gray-500 mb-6">Please upload both Claims and Member CSV files to view the dashboard analytics.</p>
                    <button 
                      onClick={() => setActiveTab('upload')}
                      className="bg-[#0D7377] text-white px-6 py-2 rounded-lg font-medium hover:bg-[#0D7377]/90 transition-colors"
                    >
                      Go to Upload
                    </button>
                  </div>
                )
              )}

              {(activeTab === 'anomalies' || activeTab === 'reports') && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 text-blue-500 mb-4">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">Module Under Construction</h2>
                  <p className="text-gray-500 max-w-md mx-auto">
                    The {activeTab} module is currently being developed. Please check back in the next release.
                  </p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
      
      <Footer />
    </div>
  );
}

