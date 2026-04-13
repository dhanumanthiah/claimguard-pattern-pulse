"use client";

import React, { useState, useCallback } from 'react';
import { Upload, File, X, CheckCircle, AlertCircle } from 'lucide-react';

interface FileUploadProps {
  onDataLoaded: (data: any[]) => void;
}

export default function FileUpload({ onDataLoaded }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  // Custom lightweight CSV parser
  const parseCSV = (text: string) => {
    const lines = text.split('\n').filter(line => line.trim() !== '');
    if (lines.length === 0) return [];

    // Parse headers
    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    
    const result = [];
    for (let i = 1; i < lines.length; i++) {
      // Handle basic CSV parsing (doesn't handle commas inside quotes perfectly, but good enough for simple data)
      const currentLine = lines[i].split(',');
      
      if (currentLine.length === headers.length) {
        const obj: any = {};
        for (let j = 0; j < headers.length; j++) {
          let val = currentLine[j].trim().replace(/^"|"$/g, '');
          // Try to convert to number if possible
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

  const processFile = (selectedFile: File) => {
    if (!selectedFile.name.endsWith('.csv')) {
      setError('Please upload a valid CSV file.');
      return;
    }

    setFile(selectedFile);
    setError(null);
    setIsProcessing(true);

    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const data = parseCSV(text);
        
        if (data.length === 0) {
          setError('The CSV file appears to be empty or invalid.');
          setIsProcessing(false);
          return;
        }

        // Simulate processing time for effect
        setTimeout(() => {
          onDataLoaded(data);
          setIsProcessing(false);
        }, 1500);
      } catch (err) {
        setError('Error parsing CSV file. Please check the format.');
        setIsProcessing(false);
      }
    };

    reader.onerror = () => {
      setError('Error reading file.');
      setIsProcessing(false);
    };

    reader.readAsText(selectedFile);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const clearFile = () => {
    setFile(null);
    setError(null);
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[#1B3A6B] mb-2">Upload Claims Data</h2>
        <p className="text-gray-600">Upload your synthetic claims data in CSV format to begin anomaly detection.</p>
      </div>

      {!file ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${
            isDragging 
              ? 'border-[#0D7377] bg-[#0D7377]/5 scale-[1.02]' 
              : 'border-gray-300 hover:border-[#1B3A6B] hover:bg-gray-50'
          }`}
        >
          <div className="w-20 h-20 mx-auto bg-[#1B3A6B]/10 rounded-full flex items-center justify-center mb-6">
            <Upload size={32} className="text-[#1B3A6B]" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Drag & Drop your CSV file here</h3>
          <p className="text-gray-500 mb-6">or click to browse from your computer</p>
          
          <label className="cursor-pointer bg-[#0D7377] hover:bg-[#0D7377]/90 text-white px-6 py-3 rounded-xl font-medium transition-colors shadow-lg shadow-[#0D7377]/20 inline-flex items-center gap-2">
            <File size={18} />
            Select File
            <input 
              type="file" 
              className="hidden" 
              accept=".csv" 
              onChange={handleFileInput}
            />
          </label>
          
          <div className="mt-8 text-xs text-gray-400 flex items-center justify-center gap-4">
            <span>Supported format: CSV</span>
            <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
            <span>Max size: 50MB</span>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#1B3A6B]/10 rounded-xl flex items-center justify-center">
                <File size={24} className="text-[#1B3A6B]" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-800">{file.name}</h4>
                <p className="text-sm text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            </div>
            {!isProcessing && (
              <button 
                onClick={clearFile}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            )}
          </div>

          {isProcessing ? (
            <div className="space-y-3">
              <div className="flex justify-between text-sm font-medium text-[#0D7377]">
                <span>Processing data...</span>
                <span className="animate-pulse">Analyzing</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-[#0D7377] w-full animate-[pulse_1.5s_ease-in-out_infinite] origin-left"></div>
              </div>
            </div>
          ) : error ? (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-start gap-3">
              <AlertCircle size={20} className="shrink-0 mt-0.5" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          ) : (
            <div className="bg-green-50 text-green-700 p-4 rounded-xl flex items-center gap-3">
              <CheckCircle size={20} />
              <p className="text-sm font-medium">File processed successfully!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

