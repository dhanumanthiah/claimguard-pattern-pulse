"use client";

import React, { useState, useEffect, createContext, useContext } from 'react';
import { 
  Database, AlertTriangle, LayoutDashboard, ChevronRight, 
  CheckCircle, MapPin, Clock, ShieldAlert, Activity, Zap,
  Upload, File, X, Bell, FileText, AlertCircle, Check, Plus
} from 'lucide-react';

// --- HARDCODED DATA ---
const CLAIMS = [
  {
    id: "CG-2024-00142",
    memberId: "M-88421",
    memberName: "Robert Harmon",
    age: 71, gender: "M",
    providerId: "PRV-3301",
    providerName: "Dr. Sarah Nguyen",
    specialty: "Primary Care",
    facility: "Riverside Family Medicine",
    city: "Austin", state: "TX",
    serviceDate: "2024-10-03",
    serviceTime: "10:00 AM",
    procedureCode: "99213",
    procedureDesc: "Office Visit - Established Patient Low Complexity",
    diagnosisCode: "Z00.00",
    diagnosisDesc: "Routine General Medical Examination",
    anomalyType: "NONE",
    riskLevel: "LOW",
    status: "AUTO-CLEARED",
    flagReason: null,
    signal: "No anomalies detected",
    memberHistory: []
  },
  {
    id: "CG-2024-00587A",
    memberId: "M-44219",
    memberName: "Gloria Esteves",
    age: 68, gender: "F",
    providerId: "PRV-1142",
    providerName: "Dr. James Polk",
    specialty: "Cardiology",
    facility: "Lakewood Heart Center",
    city: "Denver", state: "CO",
    serviceDate: "2024-11-14",
    serviceTime: "9:00 AM",
    procedureCode: "93000",
    procedureDesc: "Electrocardiogram (ECG)",
    diagnosisCode: "I10",
    diagnosisDesc: "Essential Hypertension",
    anomalyType: "LOCATION CONFLICT",
    riskLevel: "HIGH",
    riskColor: "red",
    status: "PENDING REVIEW",
    signal: "Same-day location impossibility",
    pairedClaimId: "CG-2024-00587B",
    distanceMiles: 1698,
    location1: { label: "9:00 AM — Lakewood Heart Center", city: "Denver", state: "CO", lat: 39.7, lng: -104.9 },
    location2: { label: "11:30 AM — Suncoast Medical Group", city: "Tampa", state: "FL", lat: 27.9, lng: -82.4 },
    flagReason: "Member M-44219 has two claims on the same date from facilities 1,698 miles apart with a 2.5-hour service window. Physical presence at both locations is not clinically possible. Flagged for reviewer investigation.",
    memberHistory: []
  },
  {
    id: "CG-2024-00587B",
    memberId: "M-44219",
    memberName: "Gloria Esteves",
    age: 68, gender: "F",
    providerId: "PRV-2278",
    providerName: "Dr. Anita Reyes",
    specialty: "Internal Medicine",
    facility: "Suncoast Medical Group",
    city: "Tampa", state: "FL",
    serviceDate: "2024-11-14",
    serviceTime: "11:30 AM",
    procedureCode: "99214",
    procedureDesc: "Office Visit Established Patient Moderate Complexity",
    diagnosisCode: "I10",
    diagnosisDesc: "Essential Hypertension",
    anomalyType: "LOCATION CONFLICT",
    riskLevel: "HIGH",
    riskColor: "red",
    status: "PENDING REVIEW",
    signal: "Paired location conflict claim",
    pairedClaimId: "CG-2024-00587A",
    flagReason: "Paired claim to CG-2024-00587A. Same member, same date, second location Tampa FL. Reviewed together as a location conflict cluster.",
    memberHistory: []
  },
  {
    id: "CG-2024-00934",
    memberId: "M-61033",
    memberName: "David Kwan",
    age: 74, gender: "M",
    providerId: "PRV-4455",
    providerName: "Dr. Marcus Bell",
    specialty: "Endocrinology",
    facility: "Pinecrest Specialty Clinic",
    city: "Nashville", state: "TN",
    serviceDate: "2024-12-02",
    serviceTime: "2:15 PM",
    procedureCode: "99215",
    procedureDesc: "Office Visit Established Patient High Complexity",
    diagnosisCode: "E11.649",
    diagnosisDesc: "Type 2 Diabetes with Hypoglycemia (HCC 18)",
    anomalyType: "HCC ANOMALY",
    riskLevel: "HIGH",
    riskColor: "amber",
    status: "PENDING REVIEW",
    signal: "Unsupported HCC 18 submission",
    providerHCCRate: "4.2x above peer average",
    flagReason: "Diagnosis code E11.649 (Type 2 Diabetes with Hypoglycemia) submitted for member M-61033 is not supported by 24 months of longitudinal claim history. No prior diabetes diagnosis, A1C labs, or endocrinology encounters on record. Submitting provider HCC 18/19 rate is 4.2x above peer cohort average. Flagged for medical record review before encounter submission.",
    memberHistory: [
      { date: "2022-11-08", provider: "Dr. Lisa Park - PCP", diagnosis: "Z00.00", desc: "Routine General Medical Exam", flagged: false },
      { date: "2023-02-14", provider: "Dr. Lisa Park - PCP", diagnosis: "Z12.11", desc: "Screening for Colon Cancer", flagged: false },
      { date: "2023-06-21", provider: "Dr. Lisa Park - PCP", diagnosis: "Z00.00", desc: "Routine General Medical Exam", flagged: false },
      { date: "2023-09-05", provider: "Dr. Lisa Park - PCP", diagnosis: "R73.09", desc: "Other Abnormal Glucose borderline NOT HCC", flagged: false },
      { date: "2023-11-30", provider: "Dr. Lisa Park - PCP", diagnosis: "Z00.00", desc: "Routine General Medical Exam", flagged: false },
      { date: "2024-03-12", provider: "Dr. Lisa Park - PCP", diagnosis: "Z12.11", desc: "Screening for Colon Cancer", flagged: false },
      { date: "2024-07-18", provider: "Dr. Lisa Park - PCP", diagnosis: "Z00.00", desc: "Routine General Medical Exam", flagged: false },
      { date: "2024-12-02", provider: "Dr. Marcus Bell - Endocrinology", diagnosis: "E11.649", desc: "Type 2 Diabetes with Hypoglycemia (HCC 18) - FLAGGED", flagged: true }
    ]
  }
];

// --- GLOBAL STATE CONTEXT ---
type Decision = { claimId: string, decision: string, timestamp: string };
type GlobalState = {
  totalIngested: number;
  autoCleared: number;
  flagged: number;
  pendingReview: number;
  escalatedToSIU: number;
  dataError: number;
  valid: number;
  reviewerDecisions: Decision[];
  notificationPanel: { visible: boolean; claimId: string | null };
};

type GlobalContextType = {
  state: GlobalState;
  logDecision: (claimId: string, decision: 'Escalate to SIU' | 'Flag as Data Error' | 'Mark as Valid') => void;
  closeNotification: () => void;
  showToast: (msg: string, type: 'green' | 'amber' | 'red') => void;
};

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

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
  const [toast, setToast] = useState<{msg: string, type: 'green' | 'amber' | 'red'} | null>(null);
  
  const [globalState, setGlobalState] = useState<GlobalState>({
    totalIngested: 4,
    autoCleared: 1,
    flagged: 3,
    pendingReview: 3,
    escalatedToSIU: 0,
    dataError: 0,
    valid: 0,
    reviewerDecisions: [],
    notificationPanel: { visible: false, claimId: null }
  });

  const navigate = (route: string) => {
    window.scrollTo(0, 0);
    setCurrentRoute(route);
  };

  const showToast = (msg: string, type: 'green' | 'amber' | 'red' = 'green') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const logDecision = (claimId: string, decision: 'Escalate to SIU' | 'Flag as Data Error' | 'Mark as Valid') => {
    setGlobalState(prev => {
      const newState = { ...prev };
      
      // Only decrement pending if this claim hasn't been reviewed yet
      const alreadyReviewed = prev.reviewerDecisions.some(d => d.claimId === claimId);
      if (!alreadyReviewed && newState.pendingReview > 0) {
        newState.pendingReview -= 1;
      }

      newState.reviewerDecisions = [
        { claimId, decision, timestamp: new Date().toISOString() },
        ...prev.reviewerDecisions
      ];

      if (decision === 'Escalate to SIU') {
        newState.escalatedToSIU += 1;
        showToast("Claim escalated to SIU", "red");
        setTimeout(() => {
          setGlobalState(s => ({ ...s, notificationPanel: { visible: true, claimId } }));
        }, 500);
      } else if (decision === 'Flag as Data Error') {
        newState.dataError += 1;
        showToast("Claim flagged as data error", "amber");
      } else if (decision === 'Mark as Valid') {
        newState.valid += 1;
        showToast("Claim marked as valid", "green");
      }

      return newState;
    });
  };

  const closeNotification = () => {
    setGlobalState(prev => ({ ...prev, notificationPanel: { visible: false, claimId: null } }));
  };

  // --- INLINE STYLES ---
  const styles = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
    
    .claimguard-app {
      font-family: 'Inter', sans-serif;
      background-color: #F4F7FB;
      color: #1E293B;
      overflow-x: hidden;
    }
    
    .glass-card {
      background: #FFFFFF;
      border-radius: 10px;
      border: 1px solid #E2E8F0;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }

    .typing-cursor::after {
      content: '█';
      color: #0D7377;
      animation: blink 1s step-start infinite;
      margin-left: 4px;
    }
    .typing-cursor-hidden::after { display: none; }

    .donut-chart {
      background: conic-gradient(
        #DC2626 0% 50%,
        #F59E0B 50% 75%,
        #059669 75% 100%
      );
      border-radius: 50%;
    }

    @keyframes blink { 50% { opacity: 0; } }
    
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in-up {
      animation: fadeInUp 0.3s ease forwards;
      opacity: 0;
    }

    @keyframes slideInRight {
      from { transform: translateX(100%); }
      to { transform: translateX(0); }
    }
    .animate-slide-in-right {
      animation: slideInRight 0.3s ease forwards;
    }

    @keyframes pulse-teal {
      0% { box-shadow: 0 0 0 0 rgba(13, 115, 119, 0.4); }
      70% { box-shadow: 0 0 0 10px rgba(13, 115, 119, 0); }
      100% { box-shadow: 0 0 0 0 rgba(13, 115, 119, 0); }
    }
    .animate-pulse-teal { animation: pulse-teal 2s infinite; }
  `;

  // --- COMPONENTS ---

  const NotificationPanel = () => {
    const { visible, claimId } = globalState.notificationPanel;
    
    if (!visible || !claimId) return null;
    
    const claim = CLAIMS.find(c => c.id === claimId);
    if (!claim) return null;

    const isLocation = claim.anomalyType === 'LOCATION CONFLICT';

    return (
      <div className="fixed top-0 right-0 w-[380px] h-full bg-white border-l-4 border-l-[#1B3A6B] shadow-[-10px_0_30px_rgba(0,0,0,0.1)] z-[9998] animate-slide-in-right flex flex-col">
        <div className="bg-[#1B3A6B] text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold">
            <Bell size={18} />
            {isLocation ? 'SIU Alert Sent' : 'Compliance Alert Sent'}
            <span className="text-xs font-normal opacity-70 ml-2">{new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
          </div>
          <button onClick={closeNotification} className="text-white/70 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 flex-1 overflow-y-auto">
          <div className="space-y-4 text-sm">
            <div>
              <span className="text-[#64748B] font-semibold w-20 inline-block">To:</span>
              <span className="font-medium text-[#1E293B]">{isLocation ? 'SIU Investigation Team' : 'Coding Review Team + Compliance'}</span>
            </div>
            {isLocation && (
              <div>
                <span className="text-[#64748B] font-semibold w-20 inline-block">From:</span>
                <span className="font-medium text-[#1E293B]">ClaimGuard Pattern Pulse</span>
              </div>
            )}
            {isLocation && (
              <div>
                <span className="text-[#64748B] font-semibold w-20 inline-block">Priority:</span>
                <span className="font-bold text-[#DC2626]">HIGH</span>
              </div>
            )}
            {isLocation && (
              <div>
                <span className="text-[#64748B] font-semibold w-20 inline-block">Claim:</span>
                <span className="font-medium text-[#1E293B]">{claim.id}</span>
              </div>
            )}
            {isLocation && (
              <div>
                <span className="text-[#64748B] font-semibold w-20 inline-block">Member:</span>
                <span className="font-medium text-[#1E293B]">{claim.memberName} — {claim.memberId}</span>
              </div>
            )}
            <div>
              <span className="text-[#64748B] font-semibold w-20 inline-block">Anomaly:</span>
              <span className="font-medium text-[#1E293B]">{isLocation ? 'Location Conflict' : 'HCC Anomaly — RAF Integrity Risk'}</span>
            </div>
            <div>
              <span className="text-[#64748B] font-semibold w-20 inline-block">Signal:</span>
              <span className="font-medium text-[#1E293B]">{isLocation ? '1,698 miles, 2.5-hour window' : 'Provider HCC 18/19 rate 4.2x peer avg'}</span>
            </div>
            
            <div className="mt-6 bg-[#F4F7FB] p-4 rounded-lg border border-[#E2E8F0] text-[#1E293B] leading-relaxed">
              {isLocation ? (
                "This claim has been escalated for SIU investigation. ClaimGuard detected a same-day location conflict that is not clinically possible. Please review member M-44219 and paired claim CG-2024-00587B."
              ) : (
                "Medical record review required before encounter submission. Diagnosis E11.649 (HCC 18) is not supported by 24-month member history. Encounter file hold recommended pending documentation review."
              )}
            </div>
          </div>
        </div>
        
        <div className="p-6 border-t border-[#E2E8F0] space-y-3">
          {isLocation && (
            <button 
              onClick={() => showToast("Full alert view coming in Phase 2", "green")}
              className="w-full border-2 border-[#0D7377] text-[#0D7377] font-bold py-2.5 rounded-lg hover:bg-[#0D7377]/5 transition-colors"
            >
              View Full Alert
            </button>
          )}
          <button 
            onClick={closeNotification}
            className="w-full bg-[#1B3A6B] text-white font-bold py-2.5 rounded-lg hover:bg-[#152d53] transition-colors"
          >
            Dismiss
          </button>
        </div>
      </div>
    );
  };

  const ToastComponent = () => {
    if (!toast) return null;
    
    const bgColors = {
      green: 'bg-[#059669]',
      amber: 'bg-[#F59E0B]',
      red: 'bg-[#DC2626]'
    };

    return (
      <div className={`fixed top-20 right-6 ${bgColors[toast.type]} text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 z-[9999] animate-slide-in-right`}>
        {toast.type === 'green' ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
        <span className="text-sm font-medium">{toast.msg}</span>
      </div>
    );
  };

  // --- SCREEN COMPONENTS ---

  const IngestionScreen = () => {
    const [uploadState, setUploadState] = useState<'initial' | 'uploading' | 'loaded'>('initial');
    const [visibleRows, setVisibleRows] = useState(0);
    const [showOverlay, setShowOverlay] = useState(false);
    const [overlayState, setOverlayState] = useState<'scanning' | 'complete'>('scanning');

    // Simulated file upload handler
    const handleSimulatedUpload = () => {
      setUploadState('uploading');
      setTimeout(() => {
        setUploadState('loaded');
        // Start row animation after "upload" completes
        const timers = CLAIMS.map((_, i) => 
          setTimeout(() => setVisibleRows(prev => prev + 1), i * 300)
        );
        return () => timers.forEach(clearTimeout);
      }, 1500);
    };

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
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#1B3A6B]">Claims Ingestion — Batch Upload</h1>
            <p className="text-[#64748B]">
              {uploadState === 'loaded' ? '4 claims loaded for analysis' : 'No claims loaded'}
            </p>
          </div>
          {uploadState === 'initial' && (
            <button 
              onClick={handleSimulatedUpload}
              className="bg-[#0D7377] text-white px-6 py-2.5 rounded-lg font-semibold flex items-center gap-2 hover:bg-[#0a5c5f] transition-colors shadow-sm"
            >
              <Plus size={18} /> Add Claims
            </button>
          )}
        </div>

        {uploadState === 'initial' && (
          <div className="glass-card p-16 flex flex-col items-center justify-center text-center border-2 border-dashed border-[#E2E8F0] mb-8">
            <div className="w-16 h-16 bg-[#F4F7FB] rounded-full flex items-center justify-center mb-4">
              <Database size={28} className="text-[#64748B]" />
            </div>
            <h3 className="text-lg font-bold text-[#1E293B] mb-2">No Data Ingested</h3>
            <p className="text-[#64748B] text-sm max-w-md">
              Click the "Add Claims" button above to load the latest batch of Medicare Advantage claims and member demographics for AI analysis.
            </p>
          </div>
        )}

        {uploadState === 'uploading' && (
          <div className="glass-card p-16 flex flex-col items-center justify-center mb-8 animate-fade-in-up">
            <div className="w-12 h-12 border-4 border-[#0D7377]/20 border-t-[#0D7377] rounded-full animate-spin mb-4"></div>
            <h3 className="text-lg font-bold text-[#1E293B] mb-2">Processing Datasets...</h3>
            <p className="text-[#64748B] text-sm">Cross-referencing claims with member history.</p>
          </div>
        )}

        {uploadState === 'loaded' && (
          <>
            <div className="glass-card overflow-x-auto mb-8 animate-fade-in-up">
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
                      className={`transition-all duration-300 ${idx < visibleRows ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}
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
              <div className="flex justify-center animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
                <button 
                  onClick={handleAnalyze}
                  className="bg-[#0D7377] text-white px-8 py-3 rounded-lg font-semibold flex items-center gap-2 animate-pulse-teal hover:bg-[#0a5c5f] transition-colors"
                >
                  Run ClaimGuard Analysis <ChevronRight size={18} />
                </button>
              </div>
            )}
          </>
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
    const countPending = useCountUp(globalState.pendingReview);

    const handleRowClick = (claim: any) => {
      if (claim.riskLevel === 'LOW') {
        showToast("This claim was auto-cleared — no action required", "green");
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
          <div className="glass-card p-6 border-t-4 border-t-[#1B3A6B]">
            <div className="text-[36px] font-bold text-[#1E293B] leading-none mb-1">{countTotal}</div>
            <div className="text-[12px] text-[#64748B] uppercase tracking-wide font-medium">Total Claims Ingested</div>
          </div>
          <div className="glass-card p-6 border-t-4 border-t-[#059669]">
            <div className="text-[36px] font-bold text-[#059669] leading-none mb-1">{countCleared}</div>
            <div className="text-[12px] text-[#64748B] uppercase tracking-wide font-medium">Auto-Cleared</div>
          </div>
          <div className="glass-card p-6 border-t-4 border-t-[#DC2626]">
            <div className="text-[36px] font-bold text-[#DC2626] leading-none mb-1">{countFlagged}</div>
            <div className="text-[12px] text-[#64748B] uppercase tracking-wide font-medium">Flagged for Review</div>
          </div>
          <div className="glass-card p-6 border-t-4 border-t-[#0D7377]">
            <div className="text-[36px] font-bold text-[#0D7377] leading-none mb-1">{countPending}</div>
            <div className="text-[12px] text-[#64748B] uppercase tracking-wide font-medium">Pending Review</div>
          </div>
        </div>

        <div className="glass-card overflow-hidden">
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
            <div className="glass-card p-6 relative overflow-hidden">
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

            <div className="glass-card p-6">
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
            <div className="glass-card overflow-hidden">
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

            <div className="glass-card p-6">
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
            <div className="glass-card p-6 relative overflow-hidden">
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

            <div className="glass-card p-6">
              <h3 className="font-semibold text-[#1E293B] mb-6 flex items-center gap-2">
                <Clock size={18} className="text-[#64748B]" /> Member Longitudinal History
              </h3>
              <div className="relative border-l-2 border-[#E2E8F0] ml-3 space-y-6">
                {claim.memberHistory?.map((h, i) => (
                  <div key={i} className="relative pl-6">
                    <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 border-white ${h.flagged ? 'bg-[#DC2626]' : 'bg-[#64748B]'}`}></div>
                    <div className={`p-3 rounded-lg ${h.flagged ? 'bg-[#FEF2F2] border border-[#DC2626]/20' : 'bg-[#F4F7FB] border border-[#E2E8F0]'}`}>
                      <div className="text-xs text-[#64748B] mb-1">{h.date} • {h.provider}</div>
                      <div className={`text-sm font-medium ${h.flagged ? 'text-[#DC2626]' : 'text-[#1E293B]'}`}>{h.diagnosis}</div>
                      <div className={`text-xs mt-1 ${h.flagged ? 'text-[#DC2626] font-semibold' : 'text-[#64748B]'}`}>{h.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-6">
            <div className="glass-card overflow-hidden">
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

            <div className="bg-[#FFFBEB] rounded-[10px] border border-[#F59E0B]/30 p-6 flex items-start gap-4">
              <AlertTriangle size={24} className="text-[#F59E0B] shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-[#1E293B] mb-1">Provider HCC 18/19 Rate</h3>
                <p className="text-[#F59E0B] font-medium">{claim.providerHCCRate}</p>
              </div>
            </div>

            <div className="glass-card p-6">
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
          <div className="glass-card p-6 border-t-4 border-t-[#1B3A6B]">
            <div className="text-[36px] font-bold text-[#1E293B] leading-none mb-1">{globalState.totalIngested}</div>
            <div className="text-[12px] text-[#64748B] uppercase tracking-wide font-medium">Total Ingested</div>
          </div>
          <div className="glass-card p-6 border-t-4 border-t-[#059669]">
            <div className="text-[36px] font-bold text-[#059669] leading-none mb-1">{globalState.autoCleared}</div>
            <div className="text-[12px] text-[#64748B] uppercase tracking-wide font-medium">Auto-Cleared</div>
          </div>
          <div className="glass-card p-6 border-t-4 border-t-[#DC2626]">
            <div className="text-[36px] font-bold text-[#DC2626] leading-none mb-1">{globalState.escalatedToSIU}</div>
            <div className="text-[12px] text-[#64748B] uppercase tracking-wide font-medium">Escalated to SIU</div>
          </div>
          <div className="glass-card p-6 border-t-4 border-t-[#F59E0B]">
            <div className="text-[36px] font-bold text-[#F59E0B] leading-none mb-1">{globalState.dataError}</div>
            <div className="text-[12px] text-[#64748B] uppercase tracking-wide font-medium">Data Errors</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="glass-card p-6">
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

          <div className="glass-card p-6 flex flex-col h-[320px]">
            <h3 className="font-semibold text-[#1E293B] mb-4">Reviewer Activity Feed</h3>
            <div className="flex-1 overflow-y-auto pr-2">
              {globalState.reviewerDecisions.length === 0 ? (
                <div className="h-full flex items-center justify-center text-[#64748B] text-sm italic text-center px-8">
                  No decisions logged yet — review flagged claims to see outcomes here.
                </div>
              ) : (
                <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
                  {globalState.reviewerDecisions.map((d, i) => {
                    const isEscalate = d.decision === 'Escalate to SIU';
                    const isError = d.decision === 'Flag as Data Error';
                    
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

  const ComplianceScreen = () => {
    return (
      <div className="animate-fade-in-up">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#1B3A6B]">Compliance Dashboard — Payment Integrity Overview</h1>
          <p className="text-[#64748B]">Medicare Advantage | Batch: November–December 2024</p>
        </div>

        {/* Row 1: KPIs */}
        <div className="grid grid-cols-4 gap-6 mb-6">
          <div className="glass-card p-6 border-t-4 border-t-[#1B3A6B]">
            <div className="text-[32px] font-bold text-[#1E293B] leading-none mb-2">$23.67B</div>
            <div className="text-[11px] text-[#64748B] uppercase tracking-wide font-medium">MA Improper Payments 2025 (Industry)</div>
          </div>
          <div className="glass-card p-6 border-t-4 border-t-[#DC2626]">
            <div className="text-[32px] font-bold text-[#DC2626] leading-none mb-2">$47,200</div>
            <div className="text-[11px] text-[#64748B] uppercase tracking-wide font-medium">Estimated RAF Risk Exposure — This Batch</div>
          </div>
          <div className="glass-card p-6 border-t-4 border-t-[#F59E0B]">
            <div className="text-[32px] font-bold text-[#F59E0B] leading-none mb-2">3</div>
            <div className="text-[11px] text-[#64748B] uppercase tracking-wide font-medium">Claims Requiring Review Before Submission</div>
          </div>
          <div className="glass-card p-6 border-t-4 border-t-[#059669]">
            <div className="text-[32px] font-bold text-[#059669] leading-none mb-2">1</div>
            <div className="text-[11px] text-[#64748B] uppercase tracking-wide font-medium">Claims Cleared — No Action Needed</div>
          </div>
        </div>

        {/* Row 2: Provider Alert & Risk Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="glass-card p-6 border-l-4 border-l-[#DC2626]">
            <h2 className="text-lg font-bold text-[#DC2626] mb-4">Provider Anomaly Alert</h2>
            <div className="space-y-3 text-sm">
              <div className="font-medium text-[#1E293B] text-base">Dr. Marcus Bell — Endocrinology — Nashville TN</div>
              <div className="flex justify-between border-b border-[#E2E8F0] pb-2">
                <span className="text-[#64748B]">HCC 18/19 Rate:</span>
                <span className="font-bold text-[#F59E0B]">4.2x above specialty peer average</span>
              </div>
              <div className="flex justify-between border-b border-[#E2E8F0] pb-2">
                <span className="text-[#64748B]">Flagged Claims:</span>
                <span className="font-medium text-[#1E293B]">1 (CG-2024-00934)</span>
              </div>
              <div className="flex justify-between border-b border-[#E2E8F0] pb-2">
                <span className="text-[#64748B]">Status:</span>
                <span className="bg-[#FFFBEB] text-[#F59E0B] px-2 py-0.5 rounded text-xs font-bold">UNDER REVIEW</span>
              </div>
              <div className="bg-[#FEF2F2] text-[#DC2626] p-3 rounded-lg text-xs mt-4">
                <strong>Note:</strong> Medical record review initiated. Encounter file hold recommended pending documentation validation.
              </div>
              <button 
                onClick={() => navigate('/claim/CG-2024-00934')}
                className="w-full mt-4 bg-[#0D7377] text-white py-2 rounded-lg font-medium hover:bg-[#0a5c5f] transition-colors"
              >
                View Claim Detail
              </button>
            </div>
          </div>

          <div className="glass-card p-6">
            <h2 className="text-lg font-bold text-[#1E293B] mb-4">RAF Integrity Risk Summary</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-3 h-3 rounded-full bg-[#DC2626] mt-1 shrink-0"></div>
                <div className="text-sm">
                  <span className="font-bold text-[#1E293B]">Location Conflict Risk — 2 claims</span>
                  <p className="text-[#64748B]">Member M-44219 — Same-day impossibility confirmed</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-3 h-3 rounded-full bg-[#F59E0B] mt-1 shrink-0"></div>
                <div className="text-sm">
                  <span className="font-bold text-[#1E293B]">HCC Anomaly Risk — 1 claim</span>
                  <p className="text-[#64748B]">Member M-61033 — Unsupported HCC 18 submission</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-3 h-3 rounded-full bg-[#059669] mt-1 shrink-0"></div>
                <div className="text-sm">
                  <span className="font-bold text-[#1E293B]">Clean Claims — 1 claim</span>
                  <p className="text-[#64748B]">Member M-88421 — No anomalies detected</p>
                </div>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-[#E2E8F0]">
              <div className="text-sm font-bold text-[#DC2626]">RADV Audit Risk: HIGH</div>
              <div className="text-xs text-[#64748B]">3 of 4 claims require pre-submission review</div>
            </div>
          </div>
        </div>

        {/* Row 3: Audit Readiness */}
        <div className="glass-card p-6 mb-6">
          <h2 className="text-lg font-bold text-[#1E293B] mb-4">Audit Readiness — RADV Preparation Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="flex items-start gap-3 bg-[#F0FDF4] p-3 rounded-lg border border-[#059669]/20">
              <Check className="text-[#059669] shrink-0 mt-0.5" size={18} />
              <div className="text-sm text-[#059669]">
                <strong>Reviewer Decisions Logged</strong> — All flagged claims have documented reviewer decisions
              </div>
            </div>
            <div className="flex items-start gap-3 bg-[#F0FDF4] p-3 rounded-lg border border-[#059669]/20">
              <Check className="text-[#059669] shrink-0 mt-0.5" size={18} />
              <div className="text-sm text-[#059669]">
                <strong>Explanation Trail</strong> — Plain-English reason codes generated for all flags
              </div>
            </div>
            <div className="flex items-start gap-3 bg-[#FFFBEB] p-3 rounded-lg border border-[#F59E0B]/20">
              <AlertTriangle className="text-[#F59E0B] shrink-0 mt-0.5" size={18} />
              <div className="text-sm text-[#F59E0B]">
                <strong>Medical Record Review</strong> — Pending for CG-2024-00934
              </div>
            </div>
            <div className="flex items-start gap-3 bg-[#FFFBEB] p-3 rounded-lg border border-[#F59E0B]/20">
              <AlertTriangle className="text-[#F59E0B] shrink-0 mt-0.5" size={18} />
              <div className="text-sm text-[#F59E0B]">
                <strong>Encounter File Status</strong> — Hold recommended for 2 claims pending SIU review
              </div>
            </div>
          </div>
          <div className="bg-[#1B3A6B]/5 border-l-4 border-[#1B3A6B] p-4 rounded-r-lg text-sm text-[#1B3A6B]">
            <strong>CMS has announced RADV audits for all MA contracts PY2018-2024.</strong> Estimated extrapolation exposure if HCC 18 unsupported: $47,200+
          </div>
        </div>

        {/* Row 4: Banner */}
        <div className="bg-[#0D7377] text-white rounded-[10px] p-5 flex items-center justify-between shadow-md">
          <div className="font-medium">ClaimGuard Pattern Pulse — Protecting your RAF integrity before CMS submission</div>
          <div className="flex gap-3">
            <button onClick={() => showToast("This feature coming in Phase 2", "green")} className="px-4 py-2 border border-white rounded-lg text-sm font-medium hover:bg-white/10 transition-colors">
              Export Report
            </button>
            <button onClick={() => showToast("This feature coming in Phase 2", "green")} className="px-4 py-2 bg-white text-[#0D7377] rounded-lg text-sm font-bold hover:bg-gray-100 transition-colors">
              Schedule Review
            </button>
          </div>
        </div>
      </div>
    );
  };

  // --- RENDERER ---

  return (
    <div className="claimguard-app min-h-screen flex flex-col relative">
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      
      <nav className="fixed top-0 left-0 right-0 h-[56px] bg-[#1B3A6B] flex items-center justify-between px-6 z-50">
        <div className="text-white font-bold text-[18px]">ClaimGuard Pattern Pulse</div>
        <div className="bg-white/10 text-[#CADCFC] px-3 py-1 rounded-full text-xs font-medium">
          Demo Mode
        </div>
      </nav>
      
      <div className="flex flex-1 pt-[56px]">
        <aside className="fixed top-[56px] left-0 w-[240px] h-[calc(100vh-56px)] bg-[#1B3A6B] py-6 z-40">
          <div className="space-y-1">
            {[
              { id: '/ingestion', label: 'Ingestion', icon: Database },
              { id: '/anomaly-report', label: 'Anomaly Report', icon: AlertTriangle },
              { id: '/dashboard', label: 'Reviewer Dashboard', icon: LayoutDashboard },
              { id: '/compliance', label: 'Compliance Dashboard', icon: ShieldAlert },
            ].map((item) => {
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
        
        <main className="flex-1 ml-[240px] p-[28px] min-h-[calc(100vh-56px)] relative z-10">
          <div className="max-w-6xl mx-auto">
            {currentRoute === '/ingestion' && <IngestionScreen />}
            {currentRoute === '/anomaly-report' && <AnomalyReportScreen />}
            {currentRoute === '/claim/CG-2024-00587A' && <ClaimLocationScreen />}
            {currentRoute === '/claim/CG-2024-00934' && <ClaimHCCScreen />}
            {currentRoute === '/dashboard' && <DashboardScreen />}
            {currentRoute === '/compliance' && <ComplianceScreen />}
          </div>
        </main>
      </div>
      
      <footer className="bg-[#1B3A6B] text-[#CADCFC] text-[11px] text-center py-3 mt-auto z-50 relative">
        ClaimGuard Pattern Pulse | AI PM Bootcamp — Marily Nika | Demo Day 2026
      </footer>
      
      <ToastComponent />
      <NotificationPanel />
    </div>
  );
}

