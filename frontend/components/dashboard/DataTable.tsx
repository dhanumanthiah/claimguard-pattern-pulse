"use client";

import React, { useState } from 'react';
import { AlertTriangle, CheckCircle2, Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';

interface DataTableProps {
  data: any[];
}

export default function DataTable({ data }: DataTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'anomalies' | 'clean'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  if (!data || data.length === 0) return null;

  // Extract headers (excluding our internal fields)
  const headers = Object.keys(data[0]).filter(h => !h.startsWith('_'));

  // Filter data
  const filteredData = data.filter(row => {
    // Apply anomaly filter
    if (filter === 'anomalies' && !row._isAnomaly) return false;
    if (filter === 'clean' && row._isAnomaly) return false;

    // Apply search
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return headers.some(h => String(row[h]).toLowerCase().includes(searchLower));
    }

    return true;
  });

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] overflow-hidden">
      <div className="p-6 border-b border-[#E2E8F0] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-[#1B3A6B]">Claims Analysis Results</h2>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search claims..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0D7377]/50 focus:border-[#0D7377] w-full sm:w-64"
            />
          </div>
          
          <div className="flex bg-slate-100 p-1 rounded-lg">
            <button 
              onClick={() => { setFilter('all'); setCurrentPage(1); }}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${filter === 'all' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
            >
              All
            </button>
            <button 
              onClick={() => { setFilter('anomalies'); setCurrentPage(1); }}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1 ${filter === 'anomalies' ? 'bg-white shadow-sm text-red-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <AlertTriangle size={12} /> Anomalies
            </button>
            <button 
              onClick={() => { setFilter('clean'); setCurrentPage(1); }}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1 ${filter === 'clean' ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <CheckCircle2 size={12} /> Clean
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#1B3A6B] text-white">
              <th className="py-3 px-4 text-xs font-semibold tracking-wider uppercase">Status</th>
              {headers.map(header => (
                <th key={header} className="py-3 px-4 text-xs font-semibold tracking-wider uppercase whitespace-nowrap">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginatedData.length > 0 ? (
              paginatedData.map((row, idx) => (
                <tr 
                  key={row._id || idx} 
                  className={`hover:bg-slate-50 transition-colors row-animate ${row._isAnomaly ? 'bg-red-50/30' : ''}`}
                  style={{ animationDelay: `${idx * 0.05}s` }}
                >
                  <td className="py-3 px-4">
                    {row._isAnomaly ? (
                      <div className="group relative inline-block">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 border border-red-200 cursor-help">
                          <AlertTriangle size={12} /> Flagged
                        </span>
                        <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-48 p-2 bg-slate-800 text-white text-xs rounded shadow-lg z-10">
                          <p className="font-semibold mb-1">Anomaly Reasons:</p>
                          <ul className="list-disc pl-4 space-y-1">
                            {row._anomalyReasons.map((reason: string, i: number) => (
                              <li key={i}>{reason}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 size={12} /> Clean
                      </span>
                    )}
                  </td>
                  {headers.map(header => (
                    <td key={`${row._id}-${header}`} className="py-3 px-4 text-sm text-slate-600 whitespace-nowrap">
                      {row[header]}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={headers.length + 1} className="py-12 text-center text-slate-500">
                  No claims found matching your criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="p-4 border-t border-[#E2E8F0] flex items-center justify-between bg-slate-50">
          <p className="text-xs text-slate-500">
            Showing <span className="font-medium text-slate-700">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-medium text-slate-700">{Math.min(currentPage * itemsPerPage, filteredData.length)}</span> of <span className="font-medium text-slate-700">{filteredData.length}</span> results
          </p>
          <div className="flex gap-1">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded border border-slate-200 bg-white text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100"
            >
              <ChevronLeft size={16} />
            </button>
            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded border border-slate-200 bg-white text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

