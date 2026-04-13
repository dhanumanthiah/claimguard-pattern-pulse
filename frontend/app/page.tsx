"use client";

import React, { useState, useEffect, useRef } from 'react';
import { CLAIMS } from '../lib/data';
import { 
  Database, AlertTriangle, LayoutDashboard, ChevronRight, 
  CheckCircle, XCircle, AlertCircle, MapPin, Clock, User, FileText, ShieldAlert
} from 'lucide-react';

// --- CUSTOM HOOKS ---

function useTypingEffect(text: string, speed = 18) {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (!text) return;
    setDisplayedText('');
    setIsComplete(false);
    let i = 0;
    const interval = setInterval(() => {
      setDisplayedText(text.substring(0, i + 1));
      i++;
      if (i >= text.length) {
        clearInterval(interval);
        setIsComplete(true);
      }
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed]);

  return { displayedText, isComplete };
}

function useCountUp(end: number, duration = 1000) {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    let startTime: number | null = null;
    let animationFrame: number;
    
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) {
        animationFrame = window.requestAnimationFrame(step);
      }
    };
    
    animationFrame = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(animationFrame);
  }, [end, duration]);
  
  return count;
}

// --- MAIN APP COMPONENT ---

export default function ClaimGuardApp() {
  const [currentRoute, setCurrentRoute] = useState('/ingestion');
  const [decisions, setDecisions] = useState<{claimId: string, decision: string, timestamp: string}[]>([]);
  const [toast, setToast] = useState<string | null>(null);

  const navigate = (route: string) => {
    window.scrollTo(0, 0);
    setCurrentRoute(route);
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const logDecision = (claimId: string, decision: string) => {
    setDecisions(prev => [{ claimId, decision, timestamp: new Date().toISOString() }, ...prev]);
    showToast("Reviewer decision logged successfully");
  };

  const dashboardCounts = {
    totalIngested: 4,
    autoCleared: 1,
    flagged: 3,
    pendingReview: 3 - decisions.length,
    escalatedToSIU: decisions.filter(d => d.decision === 'Escalate to SIU').length,
    dataError: decisions.filter(d => d.decision === 'Flag as Data Error').length,
    valid: decisions.filter(d => d.decision === 'Mark as Valid').length
  };

  // --- LAYOUT COMPONENTS ---

  const Navbar = () => (
    <nav className="fixed top-0 left-0 right-0 h-[56px] bg-[#1B3A6B] flex items-center justify-between px-6 z-50">
      <div className="text-white font-bold text-[18px]">ClaimGuard Pattern Pulse</div>
      <div className="bg-white/10 text-[#CADCFC] px-3 py-1 rounded-full text-xs font-medium">
        Demo Mode
      </div>
    </nav>
  );

  const Sidebar = () => {
    const navItems = [
      { id: '/ingestion', label: 'Ingestion', icon: Database },
      { id: '/anomaly-report', label: 'Anomaly Report', icon: AlertTriangle },
      { id: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    ];

    return (
      <aside className="fixed top-[56px] left-0 w-[240px] h-[calc(100vh-56px)] bg-[#1B3A6B] py-6 z-40">
        <div className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentRoute === item.id || currentRoute.startsWith(item.id + '/');
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.id)}
                className={`w-full flex items-center gap-3 px-6 py-3 text-sm transition-colors ${
                  isActive 
                    ? 'bg-[#0D7377]/30 text-white border-l-[3px] border-[#0D7377]' 
                    : 'text-white/70 hover:bg-white/5 hover:text-white border-l-[3px] border-transparent'
                }`}
              >
                <Icon size={18} />
                {item.label}
              </button>
            );
          })}
        </div>
      </aside>
    );
  };

  const Footer = () => (
    <footer className="bg-[#1B3A6B] text-[#CADCFC] text-[11px] text-center py-3 mt-auto">
      ClaimGuard Pattern Pulse | AI PM Bootcamp — Marily Nika | Demo Day 2026
    </footer>
  );

  const Toast = () => {
    if (!toast) return null;
    return (
      <div className="fixed top-20 right-6 bg-[#059669] text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50 animate-fade-in-up">
        <CheckCircle size={18} />
        <span className="text-sm font-medium">{toast}</span>
      </div>
    );
  };

  // --- SCREEN COMPONENTS ---

  const IngestionScreen = () => {
    const [visibleRows, setVisibleRows] = useState(0);
    const [showOverlay, setShowOverlay] = useState(false);
    const [overlayState, setOverlayState] = useState<'scanning' | 'complete'>('scanning');

    useEffect(() => {
      const timers = CLAIMS.map((_, i) => 
        setTimeout(() => setVisibleRows(prev => prev + 1), i * 300)
      );
      return () => timers.forEach(clearTimeout);
    }, []);

    const handleAnalyze = () => {
      setShowOverlay(true);
      setTimeout(() => {
        setOverlayState('complete');
        setTimeout(() => {
          setShowOverlay(false);
          navigate('/anomaly-report');
        }, 1000);
      }, 2500);
    };

    return (
      <div className="animate-fade-in-up">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#1B3A6B]">Claims Ingestion — Batch Upload</h1>
          <p className="text-[#64748B]">4 claims loaded for analysis</p>
        </div>

        <div className="bg-white rounded-[10px] border border-[#E2E8F0] shadow-sm overflow-x-auto mb-8">
          <table className="w-full min-w-[1000px] text-left text-sm">
            <thead className="bg-[#F4F7FB] text-[#64748B] font-medium border-b border-[#E2E8F0]">
              <tr>
                <th className="px-6 py-4">CLAIM ID</th>
                <th className="px-6 py-4">MEMBER NAME</th>
                <th className="px-6 py-4">AGE/GENDER</th>
                <th className="px-6 py-4">FACILITY</th>
                <th className="px-6 py-4">SERVICE DATE</th>
                <th className="px-6 py-4">PROC CODE</th>
                <th className="px-6 py-4">DIAG CODE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {CLAIMS.map((claim, idx) => (
                <tr 
                  key={claim.id} 
                  className={`transition-opacity duration-300 ${idx < visibleRows ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}
                >
                  <td className="px-6 py-4 font-medium text-[#1E293B]">{claim.id}</td>
                  <td className="px-6 py-4 text-[#1E293B]">{claim.memberName}</td>
                  <td className="px-6 py-4 text-[#64748B]">{claim.age} / {claim.gender}</td>
                  <td className="px-6 py-4">
                    <div className="text-[#1E293B]">{claim.facility}</div>
                    <div className="text-[11px] text-[#64748B]">{claim.city}, {claim.state}</div>
                  </td>
                  <td className="px-6 py-4 text-[#64748B]">{claim.serviceDate}</td>
                  <td className="px-6 py-4 text-[#64748B]">{claim.procedureCode}</td>
                  <td className="px-6 py-4 text-[#64748B]">{claim.diagnosisCode}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {visibleRows === CLAIMS.length && (
          <div className="flex justify-center animate-fade-in-up">
            <button 
              onClick={handleAnalyze}
              className="bg-[#0D7377] text-white px-8 py-3 rounded-lg font-semibold flex items-center gap-2 animate-pulse-teal hover:bg-[#0a5c5f] transition-colors"
            >
              Run ClaimGuard Analysis <ChevronRight size={18} />
            </button>
          </div>
        )}

        {showOverlay && (
          <div className="fixed inset-0 bg-[#1B3A6B] z-[100] flex flex-col items-center justify-center transition-opacity duration-500">
            {overlayState === 'scanning' ? (
              <>
                <div className="w-16 h-16 border-4 border-[#0D7377]/30 border-t-[#0D7377] rounded-full animate-spin mb-6"></div>
                <h2 className="text-2xl font-medium text-white">ClaimGuard is scanning for anomaly patterns...</h2>
              </>
            ) : (
              <>
                <div className="w-16 h-16 bg-[#0D7377] rounded-full flex items-center justify-center mb-6 animate-fade-in-up">
                  <CheckCircle size={32} className="text-white" />
                </div>
                <h2 className="text-2xl font-bold text-[#0D7377] animate-fade-in-up">Analysis complete — 3 anomalies detected ✓</h2>
              </>
            )}
          </div>
        )}
      </div>
    );
  };

  const AnomalyReportScreen = () => {
    const countTotal = useCountUp(4);
    const countCleared = useCountUp(1);
    const countFlagged = useCountUp(3);
    const countPending = useCountUp(3);

    const handleRowClick = (claim: any) => {
      if (claim.riskLevel === 'LOW') {
        showToast("This claim was auto-cleared — no action required");
      } else {
        navigate(`/claim/${claim.id}`);
      }
    };

    return (
      <div className="animate-fade-in-up">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#1B3A6B]">Anomaly Report — Batch Analysis</h1>
          <p className="text-[#64748B]">ClaimGuard detected 3 anomalies across 4 ingested claims</p>
        </div>

        <div className="grid grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-[10px] border border-[#E2E8F0] p-6 shadow-sm border-t-4 border-t-[#1B3A6B]">
            <div className="text-[36px] font-bold text-[#1E293B] leading-none mb-1">{countTotal}</div>
            <div className="text-[12px] text-[#64748B] uppercase tracking-wide font-medium">Total Claims Ingested</div>
          </div>
          <div className="bg-white rounded-[10px] border border-[#E2E8F0] p-6 shadow-sm border-t-4 border-t-[#059669]">
            <div className="text-[36px] font-bold text-[#059669] leading-none mb-1">{countCleared}</div>
            <div className="text-[12px] text-[#64748B] uppercase tracking-wide font-medium">Auto-Cleared</div>
          </div>
          <div className="bg-white rounded-[10px] border border-[#E2E8F0] p-6 shadow-sm border-t-4 border-t-[#DC2626]">
            <div className="text-[36px] font-bold text-[#DC2626] leading-none mb-1">{countFlagged}</div>
            <div className="text-[12px] text-[#64748B] uppercase tracking-wide font-medium">Flagged for Review</div>
          </div>
          <div className="bg-white rounded-[10px] border border-[#E2E8F0] p-6 shadow-sm border-t-4 border-t-[#0D7377]">
            <div className="text-[36px] font-bold text-[#0D7377] leading-none mb-1">{countPending}</div>
            <div className="text-[12px] text-[#64748B] uppercase tracking-wide font-medium">Pending Review</div>
          </div>
        </div>

        <div className="bg-white rounded-[10px] border border-[#E2E8F0] shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-[#E2E8F0] bg-[#F4F7FB]">
            <h2 className="font-semibold text-[#1E293B]">Flagged Claims</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-[#64748B] font-medium border-b border-[#E2E8F0]">
                <tr>
                  <th className="px-6 py-4 w-[140px]">CLAIM ID</th>
                  <th className="px-6 py-4 w-[130px]">MEMBER NAME</th>
                  <th className="px-6 py-4 w-[150px]">ANOMALY TYPE</th>
                  <th className="px-6 py-4 w-[100px]">RISK</th>
                  <th className="px-6 py-4 w-[220px]">SIGNAL</th>
                  <th className="px-6 py-4 w-[130px]">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {CLAIMS.map((claim) => {
                  const isLow = claim.riskLevel === 'LOW';
                  const isRed = claim.riskColor === 'red';
                  const isAmber = claim.riskColor === 'amber';
                  
                  let borderClass = 'border-l-[#059669]';
                  let bgClass = 'bg-[#F0FDF4]';
                  let badgeClass = 'bg-[#059669] text-white';
                  
                  if (isRed) {
                    borderClass = 'border-l-[#DC2626]';
                    bgClass = 'bg-[#FEF2F2]';
                    badgeClass = 'bg-[#DC2626] text-white';
                  } else if (isAmber) {
                    borderClass = 'border-l-[#F59E0B]';
                    bgClass = 'bg-[#FFFBEB]';
                    badgeClass = 'bg-[#F59E0B] text-white';
                  }

                  return (
                    <tr 
                      key={claim.id} 
                      onClick={() => handleRowClick(claim)}
                      className={`cursor-pointer hover:bg-[#E8F4F5] transition-colors border-l-[4px] ${borderClass} ${!isLow ? bgClass : ''}`}
                    >
                      <td className="px-6 py-4 font-medium text-[#1E293B]">{claim.id}</td>
                      <td className="px-6 py-4 text-[#1E293B]">{claim.memberName}</td>
                      <td className="px-6 py-4 text-[#64748B]">{claim.anomalyType}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-[20px] text-[11px] font-bold uppercase ${badgeClass}`}>
                          {claim.riskLevel}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-[#64748B]">{claim.signal}</td>
                      <td className="px-6 py-4 text-[#64748B] font-medium">{claim.status}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const ClaimLocationScreen = () => {
    const claim = CLAIMS.find(c => c.id === 'CG-2024-00587A')!;
    const { displayedText, isComplete } = useTypingEffect(claim.flagReason || '', 18);

    return (
      <div className="animate-fade-in-up">
        <div className="mb-6 text-sm text-[#64748B] flex items-center gap-2 cursor-pointer" onClick={() => navigate('/anomaly-report')}>
          <span className="hover:text-[#1B3A6B]">Anomaly Report</span> <ChevronRight size={14} /> <span className="text-[#1E293B] font-medium">{claim.id}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* LEFT COLUMN */}
          <div className="space-y-6">
            <div className="bg-white rounded-[10px] border border-[#E2E8F0] p-6 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-[#DC2626]"></div>
              <div className="flex justify-between items-start mb-6 mt-2">
                <div>
                  <h2 className="text-xl font-bold text-[#1E293B]">{claim.id}</h2>
                  <p className="text-[#64748B] text-sm">Service Date: {claim.serviceDate}</p>
                </div>
                <span className="bg-[#DC2626] text-white px-4 py-1.5 rounded-[20px] text-[11px] font-bold uppercase tracking-wider">
                  HIGH RISK
                </span>
              </div>

              <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
                <div>
                  <p className="text-[#64748B] text-xs uppercase mb-1">Member</p>
                  <p className="font-medium text-[#1E293B]">{claim.memberName} ({claim.memberId})</p>
                  <p className="text-[#64748B]">{claim.age} yrs • {claim.gender}</p>
                </div>
                <div>
                  <p className="text-[#64748B] text-xs uppercase mb-1">Provider</p>
                  <p className="font-medium text-[#1E293B]">{claim.providerName}</p>
                  <p className="text-[#64748B]">{claim.specialty}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-[#64748B] text-xs uppercase mb-1">Facility</p>
                  <p className="font-medium text-[#1E293B]">{claim.facility}</p>
                  <p className="text-[#64748B]">{claim.city}, {claim.state}</p>
                </div>
                <div className="col-span-2 bg-[#F4F7FB] p-3 rounded-lg border border-[#E2E8F0]">
                  <div className="flex gap-4">
                    <div>
                      <p className="text-[#64748B] text-xs uppercase mb-1">Procedure</p>
                      <p className="font-medium text-[#1E293B]">{claim.procedureCode}</p>
                    </div>
                    <div>
                      <p className="text-[#64748B] text-xs uppercase mb-1">Diagnosis</p>
                      <p className="font-medium text-[#1E293B]">{claim.diagnosisCode}</p>
                    </div>
                  </div>
                  <p className="text-[#64748B] text-xs mt-2">{claim.procedureDesc}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[10px] border border-[#E2E8F0] p-6 shadow-sm">
              <h3 className="font-semibold text-[#1E293B] mb-4 flex items-center gap-2">
                <MapPin size={18} className="text-[#64748B]" /> Location Analysis
              </h3>
              <svg viewBox="0 0 400 200" className="w-full h-48 bg-[#F4F7FB] rounded-lg border border-[#E2E8F0]">
                <path d="M 100 100 Q 200 50 300 120" fill="none" stroke="#DC2626" strokeWidth="2" strokeDasharray="5,5" />
                
                <circle cx="100" cy="100" r="6" fill="#1B3A6B" />
                <text x="100" y="80" textAnchor="middle" className="text-[11px] font-semibold fill-[#1E293B]">Denver, CO</text>
                <text x="100" y="120" textAnchor="middle" className="text-[10px] fill-[#64748B]">9:00 AM</text>
                
                <circle cx="300" cy="120" r="6" fill="#DC2626" />
                <text x="300" y="100" textAnchor="middle" className="text-[11px] font-semibold fill-[#1E293B]">Tampa, FL</text>
                <text x="300" y="140" textAnchor="middle" className="text-[10px] fill-[#64748B]">11:30 AM</text>
                
                <rect x="160" y="60" width="80" height="20" rx="10" fill="white" stroke="#DC2626" strokeWidth="1" />
                <text x="200" y="74" textAnchor="middle" className="text-[10px] font-bold fill-[#DC2626]">1,698 miles</text>
              </svg>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-6">
            <div className="bg-white rounded-[10px] border border-[#E2E8F0] shadow-sm overflow-hidden">
              <div className="bg-[#0D7377] px-6 py-4">
                <h2 className="text-white font-semibold flex items-center gap-2">
                  <ShieldAlert size={18} /> ClaimGuard Anomaly Explanation
                </h2>
              </div>
              <div className="p-6">
                <div className="inline-block bg-[#FEF2F2] text-[#DC2626] border border-[#DC2626]/20 px-3 py-1 rounded-md text-xs font-bold mb-4">
                  LOCATION CONFLICT
                </div>
                <div className="bg-[#1E293B] text-[#CADCFC] p-4 rounded-lg font-mono text-sm leading-relaxed min-h-[120px]">
                  <span className={!isComplete ? "typing-cursor" : "typing-cursor-hidden"}>
                    {displayedText}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[10px] border border-[#E2E8F0] p-6 shadow-sm">
              <h3 className="font-semibold text-[#1E293B] mb-4">Reviewer Action</h3>
              <div className="flex gap-3">
                <button onClick={() => logDecision(claim.id, 'Mark as Valid')} className="flex-1 bg-[#F0FDF4] hover:bg-[#dcfce7] text-[#059669] border border-[#059669]/30 py-2.5 rounded-lg text-sm font-semibold transition-colors">
                  Mark as Valid
                </button>
                <button onClick={() => logDecision(claim.id, 'Flag as Data Error')} className="flex-1 bg-[#FFFBEB] hover:bg-[#fef3c7] text-[#F59E0B] border border-[#F59E0B]/30 py-2.5 rounded-lg text-sm font-semibold transition-colors">
                  Flag as Data Error
                </button>
                <button onClick={() => logDecision(claim.id, 'Escalate to SIU')} className="flex-1 bg-[#DC2626] hover:bg-[#b91c1c] text-white py-2.5 rounded-lg text-sm font-semibold transition-colors shadow-sm">
                  Escalate to SIU
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const ClaimHCCScreen = () => {
    const claim = CLAIMS.find(c => c.id === 'CG-2024-00934')!;
    const { displayedText, isComplete } = useTypingEffect(claim.flagReason || '', 18);

    return (
      <div className="animate-fade-in-up">
        <div className="mb-6 text-sm text-[#64748B] flex items-center gap-2 cursor-pointer" onClick={() => navigate('/anomaly-report')}>
          <span className="hover:text-[#1B3A6B]">Anomaly Report</span> <ChevronRight size={14} /> <span className="text-[#1E293B] font-medium">{claim.id}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* LEFT COLUMN */}
          <div className="space-y-6">
            <div className="bg-white rounded-[10px] border border-[#E2E8F0] p-6 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-[#F59E0B]"></div>
              <div className="flex justify-between items-start mb-6 mt-2">
                <div>
                  <h2 className="text-xl font-bold text-[#1E293B]">{claim.id}</h2>
                  <p className="text-[#64748B] text-sm">Service Date: {claim.serviceDate}</p>
                </div>
                <span className="bg-[#F59E0B] text-white px-4 py-1.5 rounded-[20px] text-[11px] font-bold uppercase tracking-wider">
                  HIGH RISK
                </span>
              </div>

              <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
                <div>
                  <p className="text-[#64748B] text-xs uppercase mb-1">Member</p>
                  <p className="font-medium text-[#1E293B]">{claim.memberName} ({claim.memberId})</p>
                  <p className="text-[#64748B]">{claim.age} yrs • {claim.gender}</p>
                </div>
                <div>
                  <p className="text-[#64748B] text-xs uppercase mb-1">Provider</p>
                  <p className="font-medium text-[#1E293B]">{claim.providerName}</p>
                  <p className="text-[#64748B]">{claim.specialty}</p>
                </div>
                <div className="col-span-2 bg-[#F4F7FB] p-3 rounded-lg border border-[#E2E8F0]">
                  <div className="flex gap-4">
                    <div>
                      <p className="text-[#64748B] text-xs uppercase mb-1">Procedure</p>
                      <p className="font-medium text-[#1E293B]">{claim.procedureCode}</p>
                    </div>
                    <div>
                      <p className="text-[#64748B] text-xs uppercase mb-1">Diagnosis</p>
                      <p className="font-medium text-[#1E293B]">{claim.diagnosisCode}</p>
                    </div>
                  </div>
                  <p className="text-[#64748B] text-xs mt-2">{claim.diagnosisDesc}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[10px] border border-[#E2E8F0] p-6 shadow-sm">
              <h3 className="font-semibold text-[#1E293B] mb-6 flex items-center gap-2">
                <Clock size={18} className="text-[#64748B]" /> Member Longitudinal History
              </h3>
              <div className="relative border-l-2 border-[#E2E8F0] ml-3 space-y-6">
                {claim.memberHistory?.map((h, i) => (
                  <div key={i} className="relative pl-6">
                    <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 border-white ${h.flagged ? 'bg-[#DC2626]' : 'bg-[#64748B]'}`}></div>
                    <div className={`p-3 rounded-lg ${h.flagged ? 'bg-[#FEF2F2] border border-[#DC2626]/20' : 'bg-[#F4F7FB] border border-[#E2E8F0]'}`}>
                      <div className="text-xs text-[#64748B] mb-1">{h.date} • {h.provider}</div>
                      <div className={`text-sm font-medium ${h.flagged ? 'text-[#DC2626]' : 'text-[#1E293B]'}`}>{h.code} - {h.diagnosis}</div>
                      <div className={`text-xs mt-1 ${h.flagged ? 'text-[#DC2626] font-semibold' : 'text-[#64748B]'}`}>{h.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-6">
            <div className="bg-white rounded-[10px] border border-[#E2E8F0] shadow-sm overflow-hidden">
              <div className="bg-[#0D7377] px-6 py-4">
                <h2 className="text-white font-semibold flex items-center gap-2">
                  <ShieldAlert size={18} /> ClaimGuard Anomaly Explanation
                </h2>
              </div>
              <div className="p-6">
                <div className="inline-block bg-[#FFFBEB] text-[#F59E0B] border border-[#F59E0B]/20 px-3 py-1 rounded-md text-xs font-bold mb-4">
                  HCC ANOMALY
                </div>
                <div className="bg-[#1E293B] text-[#CADCFC] p-4 rounded-lg font-mono text-sm leading-relaxed min-h-[160px]">
                  <span className={!isComplete ? "typing-cursor" : "typing-cursor-hidden"}>
                    {displayedText}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-[#FFFBEB] rounded-[10px] border border-[#F59E0B]/30 p-6 shadow-sm flex items-start gap-4">
              <AlertTriangle size={24} className="text-[#F59E0B] shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-[#1E293B] mb-1">Provider HCC 18/19 Rate</h3>
                <p className="text-[#F59E0B] font-medium">{claim.providerHCCRate}</p>
              </div>
            </div>

            <div className="bg-white rounded-[10px] border border-[#E2E8F0] p-6 shadow-sm">
              <h3 className="font-semibold text-[#1E293B] mb-4">Reviewer Action</h3>
              <div className="flex gap-3">
                <button onClick={() => logDecision(claim.id, 'Mark as Valid')} className="flex-1 bg-[#F0FDF4] hover:bg-[#dcfce7] text-[#059669] border border-[#059669]/30 py-2.5 rounded-lg text-sm font-semibold transition-colors">
                  Mark as Valid
                </button>
                <button onClick={() => logDecision(claim.id, 'Flag as Data Error')} className="flex-1 bg-[#FFFBEB] hover:bg-[#fef3c7] text-[#F59E0B] border border-[#F59E0B]/30 py-2.5 rounded-lg text-sm font-semibold transition-colors">
                  Flag as Data Error
                </button>
                <button onClick={() => logDecision(claim.id, 'Escalate to SIU')} className="flex-1 bg-[#DC2626] hover:bg-[#b91c1c] text-white py-2.5 rounded-lg text-sm font-semibold transition-colors shadow-sm">
                  Escalate to SIU
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const DashboardScreen = () => {
    return (
      <div className="animate-fade-in-up">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#1B3A6B]">ClaimGuard Pattern Pulse — Review Dashboard</h1>
          <p className="text-[#64748B]">Batch: November–December 2024 | Last updated: just now</p>
        </div>

        <div className="grid grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-[10px] border border-[#E2E8F0] p-6 shadow-sm border-t-4 border-t-[#1B3A6B]">
            <div className="text-[36px] font-bold text-[#1E293B] leading-none mb-1">{dashboardCounts.totalIngested}</div>
            <div className="text-[12px] text-[#64748B] uppercase tracking-wide font-medium">Total Ingested</div>
          </div>
          <div className="bg-white rounded-[10px] border border-[#E2E8F0] p-6 shadow-sm border-t-4 border-t-[#059669]">
            <div className="text-[36px] font-bold text-[#059669] leading-none mb-1">{dashboardCounts.autoCleared}</div>
            <div className="text-[12px] text-[#64748B] uppercase tracking-wide font-medium">Auto-Cleared</div>
          </div>
          <div className="bg-white rounded-[10px] border border-[#E2E8F0] p-6 shadow-sm border-t-4 border-t-[#DC2626]">
            <div className="text-[36px] font-bold text-[#DC2626] leading-none mb-1">{dashboardCounts.escalatedToSIU}</div>
            <div className="text-[12px] text-[#64748B] uppercase tracking-wide font-medium">Escalated to SIU</div>
          </div>
          <div className="bg-white rounded-[10px] border border-[#E2E8F0] p-6 shadow-sm border-t-4 border-t-[#F59E0B]">
            <div className="text-[36px] font-bold text-[#F59E0B] leading-none mb-1">{dashboardCounts.dataError}</div>
            <div className="text-[12px] text-[#64748B] uppercase tracking-wide font-medium">Data Errors</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-[10px] border border-[#E2E8F0] p-6 shadow-sm">
            <h3 className="font-semibold text-[#1E293B] mb-8">Anomaly Breakdown</h3>
            <div className="flex items-center justify-center gap-12">
              <div className="w-48 h-48 donut-chart relative flex items-center justify-center shadow-inner">
                <div className="w-32 h-32 bg-white rounded-full flex flex-col items-center justify-center shadow-sm">
                  <span className="text-3xl font-bold text-[#1B3A6B]">4</span>
                  <span className="text-xs text-[#64748B] font-medium">Total Claims</span>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded bg-[#DC2626]"></div>
                  <div>
                    <div className="text-sm font-semibold text-[#1E293B]">Location Conflict</div>
                    <div className="text-xs text-[#64748B]">50% (2 claims)</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded bg-[#F59E0B]"></div>
                  <div>
                    <div className="text-sm font-semibold text-[#1E293B]">HCC Anomaly</div>
                    <div className="text-xs text-[#64748B]">25% (1 claim)</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded bg-[#059669]"></div>
                  <div>
                    <div className="text-sm font-semibold text-[#1E293B]">Clean</div>
                    <div className="text-xs text-[#64748B]">25% (1 claim)</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[10px] border border-[#E2E8F0] p-6 shadow-sm flex flex-col h-[320px]">
            <h3 className="font-semibold text-[#1E293B] mb-4">Reviewer Activity Feed</h3>
            <div className="flex-1 overflow-y-auto pr-2">
              {decisions.length === 0 ? (
                <div className="h-full flex items-center justify-center text-[#64748B] text-sm italic text-center px-8">
                  No decisions logged yet — review flagged claims to see outcomes here.
                </div>
              ) : (
                <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
                  {decisions.map((d, i) => {
                    const isEscalate = d.decision === 'Escalate to SIU';
                    const isError = d.decision === 'Flag as Data Error';
                    const isValid = d.decision === 'Mark as Valid';
                    
                    return (
                      <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                        <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-white shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10 ${
                          isEscalate ? 'bg-[#DC2626] text-white' : 
                          isError ? 'bg-[#F59E0B] text-white' : 'bg-[#059669] text-white'
                        }`}>
                          {isEscalate ? <ShieldAlert size={16} /> : isError ? <AlertTriangle size={16} /> : <CheckCircle size={16} />}
                        </div>
                        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-[#F4F7FB] p-3 rounded border border-[#E2E8F0] shadow-sm">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-[#1E293B] text-sm">{d.claimId}</span>
                            <span className="text-[10px] text-[#64748B]">{new Date(d.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                          </div>
                          <div className={`text-xs font-medium ${
                            isEscalate ? 'text-[#DC2626]' : isError ? 'text-[#F59E0B]' : 'text-[#059669]'
                          }`}>
                            {d.decision}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-[#0D7377] text-white rounded-[10px] p-4 text-center shadow-md">
          <p className="font-medium text-sm">ClaimGuard feedback loop active — reviewer decisions will improve future anomaly detection accuracy.</p>
        </div>
      </div>
    );
  };

  // --- RENDERER ---

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 ml-[240px] mt-[56px] p-[28px] bg-[#F4F7FB] min-h-[calc(100vh-56px)]">
          {currentRoute === '/ingestion' && <IngestionScreen />}
          {currentRoute === '/anomaly-report' && <AnomalyReportScreen />}
          {currentRoute === '/claim/CG-2024-00587A' && <ClaimLocationScreen />}
          {currentRoute === '/claim/CG-2024-00934' && <ClaimHCCScreen />}
          {currentRoute === '/dashboard' && <DashboardScreen />}
        </main>
      </div>
      <Footer />
      <Toast />
    </div>
  );
}

