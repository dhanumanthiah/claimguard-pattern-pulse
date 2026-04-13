"use client";

import React, { useState, useRef } from 'react';
import { UploadCloud, File, X, CheckCircle, AlertCircle, Download } from 'lucide-react';
import { generateSampleCSV } from '@/lib/anomalyDetection';

interface FileUploadProps {
  onDataLoaded: (csvText: string) => void;
}

export default function FileUpload({ onDataLoaded }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const processFile = (selectedFile: File) => {
    if (!selectedFile.name.endsWith('.csv')) {
      setError('Please upload a valid CSV file.');
      return;
    }

    setError(null);
    setFile(selectedFile);
    setIsProcessing(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setTimeout(() => {
        onDataLoaded(text);
        setIsProcessing(false);
      }, 1500); // Artificial delay for effect
    };
    reader.onerror = () => {
      setError('Failed to read file');
      setIsProcessing(false);
    };
    reader.readAsText(selectedFile);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const downloadSample = () => {
    const sampleData = generateSampleCSV();
    const blob = new Blob([sampleData], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample_claims_data.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-2xl p-8 shadow-sm border border-[#E2E8F0]">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-[#1B3A6B]">Upload Claims Data</h2>
          <p className="text-sm text-slate-500 mt-1">Upload your synthetic claims data in CSV format for anomaly detection.</p>
        </div>
        <button 
          onClick={downloadSample}
          className="flex items-center gap-2 text-sm text-[#0D7377] hover:text-[#1B3A6B] font-medium transition-colors bg-[#0D7377]/10 px-4 py-2 rounded-lg"
        >
          <Download size={16} />
          Download Sample CSV
        </button>
      </div>

      <div 
        className={`relative border-2 border-dashed rounded-xl p-10 text-center transition-all duration-300 ${
          isDragging 
            ? 'border-[#0D7377] bg-[#0D7377]/5' 
            : 'border-slate-300 hover:border-[#1B3A6B]/50 hover:bg-slate-50'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input 
          type="file" 
          accept=".csv" 
          className="hidden" 
          ref={fileInputRef}
          onChange={handleFileInput}
        />
        
        {!file ? (
          <div className="flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-[#1B3A6B]/5 rounded-full flex items-center justify-center mb-4">
              <UploadCloud size={32} className="text-[#1B3A6B]" />
            </div>
            <h3 className="text-lg font-semibold text-slate-700 mb-2">Drag & Drop your CSV here</h3>
            <p className="text-sm text-slate-500 mb-6">or click to browse from your computer</p>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="bg-[#1B3A6B] hover:bg-[#0D7377] text-white px-6 py-2.5 rounded-lg font-medium transition-colors shadow-md shadow-[#1B3A6B]/20"
            >
              Browse Files
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center">
            {isProcessing ? (
              <>
                <div className="w-16 h-16 border-4 border-[#0D7377]/20 border-t-[#0D7377] rounded-full animate-spin mb-4"></div>
                <h3 className="text-lg font-semibold text-slate-700 mb-2">Processing Data...</h3>
                <p className="text-sm text-slate-500">Running AI anomaly detection models</p>
              </>
            ) : (
              <>
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle size={32} className="text-emerald-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-700 mb-2">{file.name}</h3>
                <p className="text-sm text-slate-500 mb-6">{(file.size / 1024).toFixed(2)} KB • Upload Complete</p>
                <button 
                  onClick={() => setFile(null)}
                  className="text-slate-500 hover:text-red-500 text-sm font-medium flex items-center gap-1 transition-colors"
                >
                  <X size={16} /> Remove and upload another
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3 text-red-700">
          <AlertCircle size={20} className="shrink-0 mt-0.5" />
          <p className="text-sm">{error}</p>
        </div>
      )}
    </div>
  );
}

