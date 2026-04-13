"use client";

import React, { useState, useCallback } from 'react';
import { Upload, File, X, CheckCircle, AlertCircle, ArrowRight, Database } from 'lucide-react';

interface FileUploadProps {
  onDataLoaded: (data: { claims: any[]; members: any[] }) => void;
}

export default function FileUpload({ onDataLoaded }: FileUploadProps) {
  const [claimsFile, setClaimsFile] = useState<File | null>(null);
  const [memberFile, setMemberFile] = useState<File | null>(null);
  
  const [claimsData, setClaimsData] = useState<any[] | null>(null);
  const [memberData, setMemberData] = useState<any[] | null>(null);
  
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Custom lightweight CSV parser
  const parseCSV = (text: string) => {
    const lines = text.split('\n').filter(line => line.trim() !== '');
    if (lines.length === 0) return [];

    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    const result = [];
    
    for (let i = 1; i < lines.length; i++) {
      // Basic split by comma (note: doesn't handle commas inside quotes perfectly, but works for standard synthetic data)
      const currentLine = lines[i].split(',');
      
      if (currentLine.length === headers.length) {
        const obj: any = {};
        for (let j = 0; j < headers.length; j++) {
          let val = currentLine[j].trim().replace(/^"|"$/g, '');
          if (!isNaN(Number(val)) && val !== '') {
            obj[headers[j]] = Number(val);
          } else {
            obj[headers[j]] = val;
          }
        }
        result.push(obj);
      }
    }
    return result;
  };

  const processFile = (selectedFile: File, type: 'claims' | 'members') => {
    if (!selectedFile.name.endsWith('.csv')) {
      setError(`Please upload a valid CSV file for ${type} data.`);
      return;
    }

    setError(null);
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const data = parseCSV(text);
        
        if (data.length === 0) {
          setError(`The ${type} CSV file appears to be empty or invalid.`);
          return;
        }

        if (type === 'claims') {
          setClaimsFile(selectedFile);
          setClaimsData(data);
        } else {
          setMemberFile(selectedFile);
          setMemberData(data);
        }
      } catch (err) {
        setError(`Error parsing ${type} CSV file. Please check the format.`);
      }
    };

    reader.onerror = () => {
      setError(`Error reading ${type} file.`);
    };

    reader.readAsText(selectedFile);
  };

  const handleAnalyze = () => {
    if (!claimsData || !memberData) {
      setError('Both Claims and Member data are required.');
      return;
    }
    
    setIsProcessing(true);
    
    // Simulate processing time
    setTimeout(() => {
      onDataLoaded({ claims: claimsData, members: memberData });
      setIsProcessing(false);
    }, 1500);
  };

  const FileDropzone = ({ type, file, title, description }: { type: 'claims' | 'members', file: File | null, title: string, description: string }) => {
    const [isDragging, setIsDragging] = useState(false);

    const handleDrop = useCallback((e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        processFile(e.dataTransfer.files[0], type);
      }
    }, [type]);

    return (
      <div className="flex-1">
        <h3 className="text-lg font-semibold text-[#1B3A6B] mb-1">{title}</h3>
        <p className="text-sm text-gray-500 mb-4">{description}</p>
        
        {!file ? (
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 h-64 flex flex-col items-center justify-center ${
              isDragging 
                ? 'border-[#0D7377] bg-[#0D7377]/5 scale-[1.02]' 
                : 'border-gray-300 hover:border-[#1B3A6B] hover:bg-gray-50'
            }`}
          >
            <div className="w-16 h-16 bg-[#1B3A6B]/10 rounded-full flex items-center justify-center mb-4">
              <Upload size={24} className="text-[#1B3A6B]" />
            </div>
            <p className="text-sm font-medium text-gray-800 mb-1">Drag & Drop CSV</p>
            <p className="text-xs text-gray-500 mb-4">or click to browse</p>
            
            <label className="cursor-pointer bg-white border border-gray-200 hover:border-[#0D7377] hover:text-[#0D7377] text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm">
              Select File
              <input 
                type="file" 
                className="hidden" 
                accept=".csv" 
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    processFile(e.target.files[0], type);
                  }
                }}
              />
            </label>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-green-200 p-6 shadow-sm h-64 flex flex-col justify-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-green-500"></div>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                  <File size={20} className="text-green-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 truncate max-w-[180px]" title={file.name}>{file.name}</h4>
                  <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
              <button 
                onClick={() => type === 'claims' ? (setClaimsFile(null), setClaimsData(null)) : (setMemberFile(null), setMemberData(null))}
                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 p-3 rounded-lg mt-auto">
              <CheckCircle size={16} />
              <span className="font-medium">Ready for analysis</span>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-[#1B3A6B]/10 rounded-2xl mb-4">
          <Database size={32} className="text-[#1B3A6B]" />
        </div>
        <h2 className="text-2xl font-bold text-[#1B3A6B] mb-2">Data Ingestion Pipeline</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          To perform accurate anomaly detection, please upload both your Claims dataset and the corresponding Member dataset. The AI engine will cross-reference these files.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-start gap-3 mb-6 max-w-3xl mx-auto">
          <AlertCircle size={20} className="shrink-0 mt-0.5" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-6 mb-8">
        <FileDropzone 
          type="claims" 
          file={claimsFile} 
          title="1. Claims Data" 
          description="Upload the primary claims transactions (CSV)."
        />
        <FileDropzone 
          type="members" 
          file={memberFile} 
          title="2. Member Data" 
          description="Upload the member/patient demographics (CSV)."
        />
      </div>

      <div className="flex justify-center border-t border-gray-100 pt-8">
        <button
          onClick={handleAnalyze}
          disabled={!claimsFile || !memberFile || isProcessing}
          className={`flex items-center gap-2 px-8 py-3 rounded-xl font-semibold text-white transition-all duration-300 shadow-lg ${
            !claimsFile || !memberFile
              ? 'bg-gray-300 cursor-not-allowed shadow-none'
              : isProcessing
              ? 'bg-[#0D7377]/80 cursor-wait'
              : 'bg-[#0D7377] hover:bg-[#0D7377]/90 hover:shadow-[#0D7377]/30 hover:-translate-y-0.5'
          }`}
        >
          {isProcessing ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              Analyzing Datasets...
            </>
          ) : (
            <>
              Run Anomaly Detection
              <ArrowRight size={18} />
            </>
          )}
        </button>
      </div>
    </div>
  );
}

