import React, { useState, useEffect } from 'react';
import { 
  Database, AlertTriangle, LayoutDashboard, ChevronRight, 
  CheckCircle, MapPin, Clock, ShieldAlert, Activity, Zap
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
    procedureDesc: "Office Visit - Established Patient, Low Complexity",
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
    procedureDesc: "Office Visit - Established Patient, Moderate Complexity",
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
    procedureDesc: "Office Visit - Established Patient, High Complexity",
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
      { date: "2022-11-08", provider: "Dr. Lisa Park - PCP", code: "99213", diagnosis: "Z00.00", desc: "Routine General Medical Exam", flagged: false },
      { date: "2023-02-14", provider: "Dr. Lisa Park - PCP", code: "99213", diagnosis: "Z12.11", desc: "Screening for Colon Cancer", flagged: false },
      { date: "2023-06-21", provider: "Dr. Lisa Park - PCP", code: "99213", diagnosis: "Z00.00", desc: "Routine General Medical Exam", flagged: false },
      { date: "2023-09-05", provider: "Dr. Lisa Park - PCP", code: "99213", diagnosis: "R73.09", desc: "Other Abnormal Glucose (borderline - NOT HCC)", flagged: false },
      { date: "2023-11-30", provider: "Dr. Lisa Park - PCP", code: "99213", diagnosis: "Z00.00", desc: "Routine General Medical Exam", flagged: false },
      { date: "2024-03-12", provider: "Dr. Lisa Park - PCP", code: "99213", diagnosis: "Z12.11", desc: "Screening for Colon Cancer", flagged: false },
      { date: "2024-07-18", provider: "Dr. Lisa Park - PCP", code: "99213", diagnosis: "Z00.00", desc: "Routine General Medical Exam", flagged: false },
      { date: "2024-12-02", provider: "Dr. Marcus Bell - Endocrinology", code: "99215", diagnosis: "E11.649", desc: "Type 2 Diabetes with Hypoglycemia (HCC 18) - FLAGGED", flagged: true }
    ]
  }
];

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

  // --- INLINE STYLES FOR PREMIUM UI ---
  const styles = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
    
    .claimguard-app {
      font-family: 'Inter', sans-serif;
      background-color: #F4F7FB;
      color: #1E293B;
      overflow-x: hidden;
    }
    
    /* Premium Glassmorphism & Shadows */
    .glass-card {
      background: rgba(255, 255, 255, 0.85);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid rgba(255, 255, 255, 0.5);
      box-shadow: 0 10px 40px -10px rgba(27, 58, 107, 0.08), 0 1px 3px rgba(27, 58, 107, 0.05);
    }

    .glass-nav {
      background: rgba(27, 58, 107, 0.95);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .glass-sidebar {
      background: linear-gradient(180deg, rgba(27, 58, 107, 0.98) 0%, rgba(15, 32, 59, 0.98) 100%);
      backdrop-filter: blur(12px);
      border-right: 1px solid rgba(255, 255, 255, 0.05);
    }

    /* AI Terminal Effect */
    .ai-terminal {
      background: linear-gradient(145deg, #0f172a, #1e293b);
      box-shadow: inset 0 2px 10px rgba(0,0,0,0.5);
      position: relative;
      overflow: hidden;
    }
    .ai-terminal::before {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      background: linear-gradient(rgba(13, 115, 119, 0.05) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(13, 115, 119, 0.05) 1px, transparent 1px);
      background-size: 20px 20px;
      pointer-events: none;
    }

    /* Glowing Badges */
    .glow-red { box-shadow: 0 0 12px rgba(220, 38, 38, 0.4); }
    .glow-amber { box-shadow: 0 0 12px rgba(245, 158, 11, 0.4); }
    .glow-green { box-shadow: 0 0 12px rgba(5, 150, 105, 0.4); }
    .glow-teal { box-shadow: 0 0 20px rgba(13, 115, 119, 0.5); }

    /* Text Gradients */
    .text-gradient-navy {
      background: linear-gradient(135deg, #1B3A6B 0%, #0D7377 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    /* Typing Animation */
    .typing-cursor::after {
      content: '█';
      color: #0D7377;
      animation: blink 1s step-start infinite;
      margin-left: 4px;
    }
    .typing-cursor-hidden::after { display: none; }

    /* Donut Chart */
    .donut-chart {
      background: conic-gradient(
        #DC2626 0% 50%,
        #F59E0B 50% 75%,
        #059669 75% 100%
      );
      border-radius: 50%;
      box-shadow: 0 10px 30px -10px rgba(0,0,0,0.2);
      transition: transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    .donut-chart:hover { transform: scale(1.05) rotate(5deg); }

    /* Animations */
    @keyframes blink { 50% { opacity: 0; } }
    
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(12px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in-up {
      animation: fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      opacity: 0;
    }

    @keyframes pulse-teal {
      0% { box-shadow: 0 0 0 0 rgba(13, 115, 119, 0.6); }
      70% { box-shadow: 0 0 0 15px rgba(13, 115, 119, 0); }
      100% { box-shadow: 0 0 0 0 rgba(13, 115, 119, 0); }
    }
    .animate-pulse-teal { animation: pulse-teal 2s infinite; }

    @keyframes scanline {
      0% { transform: translateY(-100%); }
      100% { transform: translateY(100vh); }
    }
    .scanner-line {
      position: absolute;
      top: 0; left: 0; right: 0; height: 4px;
      background: #0D7377;
      box-shadow: 0 0 20px 5px rgba(13, 115, 119, 0.8);
      animation: scanline 2s linear infinite;
      z-index: 101;
    }
  `;

  // --- BACKGROUND MESH ---
  const BackgroundMesh = () => (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#CADCFC]/40 blur-[100px]"></div>
      <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] rounded-full bg-[#0D7377]/10 blur-[120px]"></div>
      <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] rounded-full bg-[#1B3A6B]/5 blur-[80px]"></div>
    </div>
  );

  // --- SCREEN COMPONENTS ---

  const IngestionScreen = () => {
    const [visibleRows, setVisibleRows] = useState(0);
    const [showOverlay, setShowOverlay] = useState(false);
    const [overlayState, setOverlayState] = useState<'scanning' | 'complete'>('scanning');

    useEffect(() => {
      const timers = CLAIMS.map((_, i) => 
        setTimeout(() => setVisibleRows(prev => prev + 1), i * 200)
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
        }, 1200);
      }, 2500);
    };

    return (
      <div className="animate-fade-in-up relative z-10">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gradient-navy tracking-tight mb-1">Claims Ingestion Pipeline</h1>
            <p className="text-[#64748B] font-medium flex items-center gap-2">
              <Database size={16} className="text-[#0D7377]" /> 4 claims loaded for AI analysis
            </p>
          </div>
        </div>

        <div className="glass-card rounded-2xl overflow-hidden mb-10">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] text-left text-sm">
              <thead className="bg-[#1B3A6B]/5 text-[#1B3A6B] font-semibold border-b border-[#E2E8F0]/50">
                <tr>
                  <th className="px-6 py-5">CLAIM ID</th>
                  <th className="px-6 py-5">MEMBER NAME</th>
                  <th className="px-6 py-5">AGE/GENDER</th>
                  <th className="px-6 py-5">FACILITY</th>
                  <th className="px-6 py-5">SERVICE DATE</th>
                  <th className="px-6 py-5">PROC CODE</th>
                  <th className="px-6 py-5">DIAG CODE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]/50">
                {CLAIMS.map((claim, idx) => (
                  <tr 
                    key={claim.id} 
                    className={`transition-all duration-500 hover:bg-white/50 ${idx < visibleRows ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                  >
                    <td className="px-6 py-5 font-bold text-[#1B3A6B]">{claim.id}</td>
                    <td className="px-6 py-5 font-medium text-[#1E293B]">{claim.memberName}</td>
                    <td className="px-6 py-5 text-[#64748B] bg-[#F4F7FB]/50 rounded-md m-2 inline-block px-3 py-1 mt-4">{claim.age} / {claim.gender}</td>
                    <td className="px-6 py-5">
                      <div className="font-medium text-[#1E293B]">{claim.facility}</div>
                      <div className="text-[11px] text-[#64748B] uppercase tracking-wider mt-0.5">{claim.city}, {claim.state}</div>
                    </td>
                    <td className="px-6 py-5 text-[#64748B] font-medium">{claim.serviceDate}</td>
                    <td className="px-6 py-5"><span className="bg-[#0D7377]/10 text-[#0D7377] px-2 py-1 rounded font-mono text-xs font-bold">{claim.procedureCode}</span></td>
                    <td className="px-6 py-5"><span className="bg-[#1B3A6B]/10 text-[#1B3A6B] px-2 py-1 rounded font-mono text-xs font-bold">{claim.diagnosisCode}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {visibleRows === CLAIMS.length && (
          <div className="flex justify-center animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
            <button 
              onClick={handleAnalyze}
              className="bg-gradient-to-r from-[#0D7377] to-[#11999E] text-white px-10 py-4 rounded-xl font-bold text-lg flex items-center gap-3 animate-pulse-teal hover:scale-105 transition-all duration-300 shadow-xl shadow-[#0D7377]/30"
            >
              <Zap size={20} className="fill-white" /> Run ClaimGuard AI Analysis <ChevronRight size={20} />
            </button>
          </div>
        )}

        {showOverlay && (
          <div className="fixed inset-0 bg-[#0f172a]/90 backdrop-blur-xl z-[100] flex flex-col items-center justify-center transition-opacity duration-500">
            {overlayState === 'scanning' && <div className="scanner-line"></div>}
            
            {overlayState === 'scanning' ? (
              <div className="flex flex-col items-center animate-fade-in-up">
                <div className="relative w-24 h-24 mb-8">
                  <div className="absolute inset-0 border-4 border-[#0D7377]/20 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-[#0D7377] rounded-full border-t-transparent animate-spin"></div>
                  <ShieldAlert size={32} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[#0D7377]" />
                </div>
                <h2 className="text-3xl font-bold text-white tracking-tight">ClaimGuard AI Engine Active</h2>
                <p className="text-[#0D7377] mt-3 font-mono text-sm uppercase tracking-widest animate-pulse">Scanning for anomaly patterns...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center animate-fade-in-up">
                <div className="w-24 h-24 bg-gradient-to-br from-[#0D7377] to-[#11999E] rounded-full flex items-center justify-center mb-8 glow-teal shadow-2xl">
                  <CheckCircle size={48} className="text-white" />
                </div>
                <h2 className="text-4xl font-bold text-white tracking-tight mb-2">Analysis Complete</h2>
                <p className="text-[#0D7377] text-xl font-medium">3 anomalies detected across 4 claims</p>
              </div>
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
      <div className="animate-fade-in-up relative z-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gradient-navy tracking-tight mb-1">Anomaly Report</h1>
          <p className="text-[#64748B] font-medium">ClaimGuard detected 3 anomalies across 4 ingested claims</p>
        </div>

        <div className="grid grid-cols-4 gap-6 mb-10">
          {[
            { count: countTotal, label: "Total Ingested", color: "#1B3A6B", bg: "bg-[#1B3A6B]/5" },
            { count: countCleared, label: "Auto-Cleared", color: "#059669", bg: "bg-[#059669]/5" },
            { count: countFlagged, label: "Flagged for Review", color: "#DC2626", bg: "bg-[#DC2626]/5" },
            { count: countPending, label: "Pending Review", color: "#0D7377", bg: "bg-[#0D7377]/5" }
          ].map((stat, i) => (
            <div key={i} className="glass-card rounded-2xl p-6 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
              <div className={`absolute top-0 left-0 w-full h-1`} style={{ backgroundColor: stat.color }}></div>
              <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full blur-2xl opacity-50 transition-opacity group-hover:opacity-80 ${stat.bg}`}></div>
              <div className="text-[42px] font-black leading-none mb-2" style={{ color: stat.color }}>{stat.count}</div>
              <div className="text-[12px] text-[#64748B] uppercase tracking-wider font-bold">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="px-8 py-5 border-b border-[#E2E8F0]/50 bg-white/50 flex items-center gap-3">
            <AlertTriangle size={20} className="text-[#DC2626]" />
            <h2 className="font-bold text-[#1E293B] text-lg">Flagged Claims Queue</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-[#64748B] font-semibold text-xs uppercase tracking-wider border-b border-[#E2E8F0]/50">
                <tr>
                  <th className="px-8 py-5 w-[140px]">CLAIM ID</th>
                  <th className="px-8 py-5 w-[150px]">MEMBER NAME</th>
                  <th className="px-8 py-5 w-[160px]">ANOMALY TYPE</th>
                  <th className="px-8 py-5 w-[100px]">RISK</th>
                  <th className="px-8 py-5 w-[220px]">AI SIGNAL</th>
                  <th className="px-8 py-5 w-[130px]">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]/30">
                {CLAIMS.map((claim, idx) => {
                  const isLow = claim.riskLevel === 'LOW';
                  const isRed = claim.riskColor === 'red';
                  const isAmber = claim.riskColor === 'amber';
                  
                  let borderClass = 'border-l-[#059669]';
                  let bgClass = 'bg-gradient-to-r from-[#F0FDF4] to-transparent';
                  let badgeClass = 'bg-[#059669] text-white glow-green';
                  
                  if (isRed) {
                    borderClass = 'border-l-[#DC2626]';
                    bgClass = 'bg-gradient-to-r from-[#FEF2F2] to-transparent';
                    badgeClass = 'bg-[#DC2626] text-white glow-red';
                  } else if (isAmber) {
                    borderClass = 'border-l-[#F59E0B]';
                    bgClass = 'bg-gradient-to-r from-[#FFFBEB] to-transparent';
                    badgeClass = 'bg-[#F59E0B] text-white glow-amber';
                  }

                  return (
                    <tr 
                      key={claim.id} 
                      onClick={() => handleRowClick(claim)}
                      className={`cursor-pointer hover:bg-white/80 transition-all duration-300 border-l-[4px] ${borderClass} ${!isLow ? bgClass : ''} animate-fade-in-up`}
                      style={{ animationDelay: `${idx * 0.1}s` }}
                    >
                      <td className="px-8 py-5 font-bold text-[#1B3A6B]">{claim.id}</td>
                      <td className="px-8 py-5 font-medium text-[#1E293B]">{claim.memberName}</td>
                      <td className="px-8 py-5 font-medium text-[#64748B]">{claim.anomalyType}</td>
                      <td className="px-8 py-5">
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black tracking-wider ${badgeClass}`}>
                          {claim.riskLevel}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-[#64748B]">{claim.signal}</td>
                      <td className="px-8 py-5">
                        <span className={`text-xs font-bold ${isLow ? 'text-[#059669]' : 'text-[#1B3A6B]'}`}>
                          {claim.status}
                        </span>
                      </td>
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
      <div className="animate-fade-in-up relative z-10">
        <div className="mb-6 text-sm font-medium text-[#64748B] flex items-center gap-2 cursor-pointer hover:text-[#0D7377] transition-colors w-fit" onClick={() => navigate('/anomaly-report')}>
          <ChevronRight size={16} className="rotate-180" /> Back to Anomaly Report
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LEFT COLUMN */}
          <div className="lg:col-span-7 space-y-8">
            <div className="glass-card rounded-2xl p-8 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#DC2626] to-[#ef4444]"></div>
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-[#DC2626]/5 rounded-full blur-3xl"></div>
              
              <div className="flex justify-between items-start mb-8 mt-2">
                <div>
                  <h2 className="text-3xl font-black text-[#1E293B] tracking-tight">{claim.id}</h2>
                  <p className="text-[#64748B] font-medium mt-1 flex items-center gap-2">
                    <Clock size={14} /> Service Date: {claim.serviceDate}
                  </p>
                </div>
                <span className="bg-[#DC2626] text-white px-5 py-2 rounded-full text-xs font-black tracking-widest glow-red shadow-lg">
                  HIGH RISK
                </span>
              </div>

              <div className="grid grid-cols-2 gap-y-6 gap-x-8 text-sm">
                <div className="bg-[#F4F7FB]/50 p-4 rounded-xl border border-[#E2E8F0]/50">
                  <p className="text-[#64748B] text-[10px] font-bold uppercase tracking-wider mb-1">Member Profile</p>
                  <p className="font-bold text-[#1E293B] text-base">{claim.memberName}</p>
                  <p className="text-[#64748B] mt-1">{claim.memberId} • {claim.age} yrs • {claim.gender}</p>
                </div>
                <div className="bg-[#F4F7FB]/50 p-4 rounded-xl border border-[#E2E8F0]/50">
                  <p className="text-[#64748B] text-[10px] font-bold uppercase tracking-wider mb-1">Provider Details</p>
                  <p className="font-bold text-[#1E293B] text-base">{claim.providerName}</p>
                  <p className="text-[#64748B] mt-1">{claim.specialty}</p>
                </div>
                <div className="col-span-2 bg-[#F4F7FB]/50 p-4 rounded-xl border border-[#E2E8F0]/50">
                  <p className="text-[#64748B] text-[10px] font-bold uppercase tracking-wider mb-1">Facility Location</p>
                  <p className="font-bold text-[#1E293B] text-base">{claim.facility}</p>
                  <p className="text-[#64748B] mt-1 flex items-center gap-1"><MapPin size={14}/> {claim.city}, {claim.state}</p>
                </div>
                <div className="col-span-2 bg-gradient-to-br from-[#1B3A6B]/5 to-transparent p-5 rounded-xl border border-[#1B3A6B]/10">
                  <div className="flex gap-8">
                    <div>
                      <p className="text-[#1B3A6B]/70 text-[10px] font-bold uppercase tracking-wider mb-1">Procedure</p>
                      <p className="font-mono font-bold text-[#1B3A6B] text-lg">{claim.procedureCode}</p>
                    </div>
                    <div>
                      <p className="text-[#1B3A6B]/70 text-[10px] font-bold uppercase tracking-wider mb-1">Diagnosis</p>
                      <p className="font-mono font-bold text-[#1B3A6B] text-lg">{claim.diagnosisCode}</p>
                    </div>
                  </div>
                  <p className="text-[#1E293B] font-medium mt-3">{claim.procedureDesc}</p>
                </div>
              </div>
            </div>

            <div className="glass-card rounded-2xl p-8">
              <h3 className="font-bold text-[#1E293B] text-lg mb-6 flex items-center gap-2">
                <MapPin size={20} className="text-[#DC2626]" /> Spatial Impossibility Analysis
              </h3>
              <div className="relative bg-[#0f172a] rounded-xl p-6 overflow-hidden border border-[#1e293b] shadow-inner">
                {/* Grid background for map */}
                <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                
                <svg viewBox="0 0 400 200" className="w-full h-56 relative z-10 drop-shadow-xl">
                  {/* Glowing line */}
                  <path d="M 80 100 Q 200 20 320 120" fill="none" stroke="rgba(220, 38, 38, 0.3)" strokeWidth="8" strokeLinecap="round" />
                  <path d="M 80 100 Q 200 20 320 120" fill="none" stroke="#DC2626" strokeWidth="2" strokeDasharray="6,6" className="animate-[dash_20s_linear_infinite]" />
                  
                  {/* Pin 1 */}
                  <circle cx="80" cy="100" r="16" fill="rgba(13, 115, 119, 0.2)" className="animate-pulse" />
                  <circle cx="80" cy="100" r="6" fill="#0D7377" />
                  <rect x="30" y="125" width="100" height="40" rx="6" fill="rgba(15, 23, 42, 0.8)" border="1px solid rgba(255,255,255,0.1)" />
                  <text x="80" y="142" textAnchor="middle" className="text-[11px] font-bold fill-white">Denver, CO</text>
                  <text x="80" y="156" textAnchor="middle" className="text-[10px] font-mono fill-[#0D7377]">9:00 AM</text>
                  
                  {/* Pin 2 */}
                  <circle cx="320" cy="120" r="24" fill="rgba(220, 38, 38, 0.2)" className="animate-pulse" style={{ animationDelay: '0.5s' }} />
                  <circle cx="320" cy="120" r="6" fill="#DC2626" />
                  <rect x="270" y="145" width="100" height="40" rx="6" fill="rgba(15, 23, 42, 0.8)" />
                  <text x="320" y="162" textAnchor="middle" className="text-[11px] font-bold fill-white">Tampa, FL</text>
                  <text x="320" y="176" textAnchor="middle" className="text-[10px] font-mono fill-[#DC2626]">11:30 AM</text>
                  
                  {/* Distance Badge */}
                  <rect x="160" y="45" width="80" height="24" rx="12" fill="#DC2626" />
                  <text x="200" y="61" textAnchor="middle" className="text-[11px] font-black tracking-wider fill-white">1,698 MI</text>
                </svg>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="lg:col-span-5 space-y-8">
            <div className="glass-card rounded-2xl overflow-hidden shadow-xl shadow-[#1B3A6B]/10 border border-[#1B3A6B]/20">
              <div className="bg-gradient-to-r from-[#1B3A6B] to-[#0f203b] px-6 py-5 border-b border-white/10">
                <h2 className="text-white font-bold flex items-center gap-3 text-lg tracking-wide">
                  <ShieldAlert size={20} className="text-[#0D7377]" /> AI Anomaly Engine
                </h2>
              </div>
              <div className="p-1 bg-[#0f172a]">
                <div className="ai-terminal p-6 rounded-xl min-h-[280px] flex flex-col">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-3 h-3 rounded-full bg-[#DC2626] glow-red"></div>
                    <div className="text-[#DC2626] font-mono text-xs font-bold tracking-widest uppercase">Location Conflict Detected</div>
                  </div>
                  <div className="text-[#e2e8f0] font-mono text-sm leading-relaxed flex-1">
                    <span className={!isComplete ? "typing-cursor" : "typing-cursor-hidden"}>
                      {displayedText}
                    </span>
                  </div>
                  {isComplete && (
                    <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between animate-fade-in-up">
                      <span className="text-[#64748B] font-mono text-[10px]">CONFIDENCE SCORE</span>
                      <span className="text-[#0D7377] font-mono font-bold text-lg glow-teal">99.8%</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="glass-card rounded-2xl p-8">
              <h3 className="font-bold text-[#1E293B] text-lg mb-6">Reviewer Action Required</h3>
              <div className="flex flex-col gap-4">
                <button onClick={() => logDecision(claim.id, 'Escalate to SIU')} className="w-full bg-gradient-to-r from-[#DC2626] to-[#b91c1c] hover:from-[#b91c1c] hover:to-[#991b1b] text-white py-4 rounded-xl text-sm font-bold tracking-wide transition-all shadow-lg shadow-[#DC2626]/30 hover:shadow-[#DC2626]/50 hover:-translate-y-0.5 flex items-center justify-center gap-2">
                  <ShieldAlert size={18} /> Escalate to SIU
                </button>
                <div className="grid grid-cols-2 gap-4">
                  <button onClick={() => logDecision(claim.id, 'Flag as Data Error')} className="bg-white hover:bg-[#FFFBEB] text-[#F59E0B] border-2 border-[#F59E0B]/20 hover:border-[#F59E0B] py-3 rounded-xl text-sm font-bold transition-all">
                    Data Error
                  </button>
                  <button onClick={() => logDecision(claim.id, 'Mark as Valid')} className="bg-white hover:bg-[#F0FDF4] text-[#059669] border-2 border-[#059669]/20 hover:border-[#059669] py-3 rounded-xl text-sm font-bold transition-all">
                    Mark Valid
                  </button>
                </div>
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
      <div className="animate-fade-in-up relative z-10">
        <div className="mb-6 text-sm font-medium text-[#64748B] flex items-center gap-2 cursor-pointer hover:text-[#0D7377] transition-colors w-fit" onClick={() => navigate('/anomaly-report')}>
          <ChevronRight size={16} className="rotate-180" /> Back to Anomaly Report
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LEFT COLUMN */}
          <div className="lg:col-span-7 space-y-8">
            <div className="glass-card rounded-2xl p-8 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#F59E0B] to-[#fbbf24]"></div>
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-[#F59E0B]/5 rounded-full blur-3xl"></div>
              
              <div className="flex justify-between items-start mb-8 mt-2">
                <div>
                  <h2 className="text-3xl font-black text-[#1E293B] tracking-tight">{claim.id}</h2>
                  <p className="text-[#64748B] font-medium mt-1 flex items-center gap-2">
                    <Clock size={14} /> Service Date: {claim.serviceDate}
                  </p>
                </div>
                <span className="bg-[#F59E0B] text-white px-5 py-2 rounded-full text-xs font-black tracking-widest glow-amber shadow-lg">
                  HIGH RISK
                </span>
              </div>

              <div className="grid grid-cols-2 gap-y-6 gap-x-8 text-sm">
                <div className="bg-[#F4F7FB]/50 p-4 rounded-xl border border-[#E2E8F0]/50">
                  <p className="text-[#64748B] text-[10px] font-bold uppercase tracking-wider mb-1">Member Profile</p>
                  <p className="font-bold text-[#1E293B] text-base">{claim.memberName}</p>
                  <p className="text-[#64748B] mt-1">{claim.memberId} • {claim.age} yrs • {claim.gender}</p>
                </div>
                <div className="bg-[#F4F7FB]/50 p-4 rounded-xl border border-[#E2E8F0]/50">
                  <p className="text-[#64748B] text-[10px] font-bold uppercase tracking-wider mb-1">Provider Details</p>
                  <p className="font-bold text-[#1E293B] text-base">{claim.providerName}</p>
                  <p className="text-[#64748B] mt-1">{claim.specialty}</p>
                </div>
                <div className="col-span-2 bg-gradient-to-br from-[#1B3A6B]/5 to-transparent p-5 rounded-xl border border-[#1B3A6B]/10">
                  <div className="flex gap-8">
                    <div>
                      <p className="text-[#1B3A6B]/70 text-[10px] font-bold uppercase tracking-wider mb-1">Procedure</p>
                      <p className="font-mono font-bold text-[#1B3A6B] text-lg">{claim.procedureCode}</p>
                    </div>
                    <div>
                      <p className="text-[#1B3A6B]/70 text-[10px] font-bold uppercase tracking-wider mb-1">Diagnosis</p>
                      <p className="font-mono font-bold text-[#1B3A6B] text-lg">{claim.diagnosisCode}</p>
                    </div>
                  </div>
                  <p className="text-[#1E293B] font-medium mt-3">{claim.diagnosisDesc}</p>
                </div>
              </div>
            </div>

            <div className="glass-card rounded-2xl p-8">
              <h3 className="font-bold text-[#1E293B] text-lg mb-8 flex items-center gap-2">
                <Activity size={20} className="text-[#F59E0B]" /> Longitudinal Clinical History
              </h3>
              <div className="relative border-l-2 border-[#E2E8F0] ml-4 space-y-8">
                {claim.memberHistory?.map((h, i) => (
                  <div key={i} className="relative pl-8 group">
                    <div className={`absolute -left-[11px] top-1 w-5 h-5 rounded-full border-4 border-white shadow-sm transition-transform group-hover:scale-125 ${h.flagged ? 'bg-[#F59E0B] glow-amber' : 'bg-[#94A3B8]'}`}></div>
                    <div className={`p-4 rounded-xl transition-all duration-300 ${h.flagged ? 'bg-gradient-to-r from-[#FFFBEB] to-transparent border border-[#F59E0B]/30 shadow-md' : 'bg-white border border-[#E2E8F0] hover:border-[#CBD5E1] hover:shadow-sm'}`}>
                      <div className="flex justify-between items-start mb-2">
                        <div className="text-xs font-bold text-[#64748B] tracking-wider uppercase">{h.date}</div>
                        <div className="text-xs font-medium text-[#64748B] bg-[#F4F7FB] px-2 py-1 rounded">{h.provider}</div>
                      </div>
                      <div className={`text-base font-bold mb-1 ${h.flagged ? 'text-[#F59E0B]' : 'text-[#1E293B]'}`}>
                        <span className="font-mono mr-2">{h.code}</span> {h.diagnosis}
                      </div>
                      <div className={`text-sm ${h.flagged ? 'text-[#B45309] font-medium' : 'text-[#64748B]'}`}>{h.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="lg:col-span-5 space-y-8">
            <div className="glass-card rounded-2xl overflow-hidden shadow-xl shadow-[#1B3A6B]/10 border border-[#1B3A6B]/20">
              <div className="bg-gradient-to-r from-[#1B3A6B] to-[#0f203b] px-6 py-5 border-b border-white/10">
                <h2 className="text-white font-bold flex items-center gap-3 text-lg tracking-wide">
                  <ShieldAlert size={20} className="text-[#0D7377]" /> AI Anomaly Engine
                </h2>
              </div>
              <div className="p-1 bg-[#0f172a]">
                <div className="ai-terminal p-6 rounded-xl min-h-[280px] flex flex-col">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-3 h-3 rounded-full bg-[#F59E0B] glow-amber"></div>
                    <div className="text-[#F59E0B] font-mono text-xs font-bold tracking-widest uppercase">HCC Upcoding Detected</div>
                  </div>
                  <div className="text-[#e2e8f0] font-mono text-sm leading-relaxed flex-1">
                    <span className={!isComplete ? "typing-cursor" : "typing-cursor-hidden"}>
                      {displayedText}
                    </span>
                  </div>
                  {isComplete && (
                    <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between animate-fade-in-up">
                      <span className="text-[#64748B] font-mono text-[10px]">CONFIDENCE SCORE</span>
                      <span className="text-[#0D7377] font-mono font-bold text-lg glow-teal">94.2%</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-[#FFFBEB] to-white rounded-2xl border border-[#F59E0B]/30 p-6 shadow-lg shadow-[#F59E0B]/5 flex items-center gap-5">
              <div className="w-12 h-12 rounded-full bg-[#F59E0B]/10 flex items-center justify-center shrink-0">
                <AlertTriangle size={24} className="text-[#F59E0B]" />
              </div>
              <div>
                <h3 className="text-[10px] font-bold text-[#B45309] uppercase tracking-wider mb-1">Provider Risk Metric</h3>
                <p className="text-[#1E293B] font-black text-lg">{claim.providerHCCRate}</p>
              </div>
            </div>

            <div className="glass-card rounded-2xl p-8">
              <h3 className="font-bold text-[#1E293B] text-lg mb-6">Reviewer Action Required</h3>
              <div className="flex flex-col gap-4">
                <button onClick={() => logDecision(claim.id, 'Escalate to SIU')} className="w-full bg-gradient-to-r from-[#DC2626] to-[#b91c1c] hover:from-[#b91c1c] hover:to-[#991b1b] text-white py-4 rounded-xl text-sm font-bold tracking-wide transition-all shadow-lg shadow-[#DC2626]/30 hover:shadow-[#DC2626]/50 hover:-translate-y-0.5 flex items-center justify-center gap-2">
                  <ShieldAlert size={18} /> Escalate to SIU
                </button>
                <div className="grid grid-cols-2 gap-4">
                  <button onClick={() => logDecision(claim.id, 'Flag as Data Error')} className="bg-white hover:bg-[#FFFBEB] text-[#F59E0B] border-2 border-[#F59E0B]/20 hover:border-[#F59E0B] py-3 rounded-xl text-sm font-bold transition-all">
                    Data Error
                  </button>
                  <button onClick={() => logDecision(claim.id, 'Mark as Valid')} className="bg-white hover:bg-[#F0FDF4] text-[#059669] border-2 border-[#059669]/20 hover:border-[#059669] py-3 rounded-xl text-sm font-bold transition-all">
                    Mark Valid
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const DashboardScreen = () => {
    return (
      <div className="animate-fade-in-up relative z-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gradient-navy tracking-tight mb-1">Review Dashboard</h1>
          <p className="text-[#64748B] font-medium">Batch: November–December 2024 | Live Updates Active</p>
        </div>

        <div className="grid grid-cols-4 gap-6 mb-10">
          {[
            { count: dashboardCounts.totalIngested, label: "Total Ingested", color: "#1B3A6B", bg: "bg-[#1B3A6B]/5" },
            { count: dashboardCounts.autoCleared, label: "Auto-Cleared", color: "#059669", bg: "bg-[#059669]/5" },
            { count: dashboardCounts.escalatedToSIU, label: "Escalated to SIU", color: "#DC2626", bg: "bg-[#DC2626]/5" },
            { count: dashboardCounts.dataError, label: "Data Errors", color: "#F59E0B", bg: "bg-[#F59E0B]/5" }
          ].map((stat, i) => (
            <div key={i} className="glass-card rounded-2xl p-6 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
              <div className={`absolute top-0 left-0 w-full h-1`} style={{ backgroundColor: stat.color }}></div>
              <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full blur-2xl opacity-50 transition-opacity group-hover:opacity-80 ${stat.bg}`}></div>
              <div className="text-[42px] font-black leading-none mb-2" style={{ color: stat.color }}>{stat.count}</div>
              <div className="text-[12px] text-[#64748B] uppercase tracking-wider font-bold">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
          <div className="glass-card rounded-2xl p-8">
            <h3 className="font-bold text-[#1E293B] text-lg mb-10">Anomaly Breakdown</h3>
            <div className="flex items-center justify-center gap-16">
              <div className="w-56 h-56 donut-chart relative flex items-center justify-center">
                <div className="w-40 h-40 bg-white rounded-full flex flex-col items-center justify-center shadow-inner z-10">
                  <span className="text-4xl font-black text-[#1B3A6B]">4</span>
                  <span className="text-xs text-[#64748B] font-bold uppercase tracking-wider mt-1">Total Claims</span>
                </div>
              </div>
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-5 h-5 rounded-full bg-[#DC2626] glow-red"></div>
                  <div>
                    <div className="text-base font-bold text-[#1E293B]">Location Conflict</div>
                    <div className="text-sm text-[#64748B] font-medium">50% (2 claims)</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-5 h-5 rounded-full bg-[#F59E0B] glow-amber"></div>
                  <div>
                    <div className="text-base font-bold text-[#1E293B]">HCC Anomaly</div>
                    <div className="text-sm text-[#64748B] font-medium">25% (1 claim)</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-5 h-5 rounded-full bg-[#059669] glow-green"></div>
                  <div>
                    <div className="text-base font-bold text-[#1E293B]">Clean</div>
                    <div className="text-sm text-[#64748B] font-medium">25% (1 claim)</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-8 flex flex-col h-[400px]">
            <h3 className="font-bold text-[#1E293B] text-lg mb-6">Reviewer Activity Feed</h3>
            <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar">
              {decisions.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-[#64748B] text-sm text-center px-8 opacity-60">
                  <Activity size={32} className="mb-3" />
                  <p>No decisions logged yet.<br/>Review flagged claims to populate this feed.</p>
                </div>
              ) : (
                <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-[#E2E8F0] before:to-transparent">
                  {decisions.map((d, i) => {
                    const isEscalate = d.decision === 'Escalate to SIU';
                    const isError = d.decision === 'Flag as Data Error';
                    
                    return (
                      <div key={i} className="relative flex items-start gap-6 animate-fade-in-up">
                        <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-white shrink-0 shadow-md z-10 ${
                          isEscalate ? 'bg-[#DC2626] text-white glow-red' : 
                          isError ? 'bg-[#F59E0B] text-white glow-amber' : 'bg-[#059669] text-white glow-green'
                        }`}>
                          {isEscalate ? <ShieldAlert size={16} /> : isError ? <AlertTriangle size={16} /> : <CheckCircle size={16} />}
                        </div>
                        <div className="flex-1 bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-bold text-[#1B3A6B]">{d.claimId}</span>
                            <span className="text-[10px] font-bold text-[#64748B] bg-[#F4F7FB] px-2 py-1 rounded-md">
                              {new Date(d.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </span>
                          </div>
                          <div className={`text-sm font-bold ${
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

        <div className="bg-gradient-to-r from-[#0D7377] to-[#11999E] text-white rounded-2xl p-5 text-center shadow-xl shadow-[#0D7377]/20 flex items-center justify-center gap-3">
          <Zap size={20} className="fill-white/50" />
          <p className="font-semibold tracking-wide">ClaimGuard feedback loop active — reviewer decisions will improve future anomaly detection accuracy.</p>
        </div>
      </div>
    );
  };

  // --- RENDERER ---

  return (
    <div className="claimguard-app min-h-screen flex flex-col relative">
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <BackgroundMesh />
      
      <nav className="glass-nav fixed top-0 left-0 right-0 h-[64px] flex items-center justify-between px-8 z-50">
        <div className="text-white font-black text-[20px] tracking-tight flex items-center gap-2">
          <ShieldAlert size={24} className="text-[#0D7377]" /> ClaimGuard Pattern Pulse
        </div>
        <div className="bg-white/10 border border-white/20 text-[#CADCFC] px-4 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase shadow-inner">
          Demo Mode
        </div>
      </nav>
      
      <div className="flex flex-1 pt-[64px]">
        <aside className="glass-sidebar fixed top-[64px] left-0 w-[260px] h-[calc(100vh-64px)] py-8 z-40 flex flex-col">
          <div className="px-6 mb-4 text-[10px] font-bold text-[#CADCFC]/50 uppercase tracking-widest">Main Menu</div>
          <div className="space-y-2 px-4">
            {[
              { id: '/ingestion', label: 'Ingestion', icon: Database },
              { id: '/anomaly-report', label: 'Anomaly Report', icon: AlertTriangle },
              { id: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = currentRoute === item.id || currentRoute.startsWith(item.id + '/');
              return (
                <button
                  key={item.id}
                  onClick={() => navigate(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                    isActive 
                      ? 'bg-gradient-to-r from-[#0D7377] to-[#11999E] text-white shadow-lg shadow-[#0D7377]/30 translate-x-1' 
                      : 'text-[#CADCFC]/70 hover:bg-white/5 hover:text-white hover:translate-x-1'
                  }`}
                >
                  <Icon size={18} className={isActive ? 'text-white' : 'text-[#CADCFC]/50'} />
                  {item.label}
                </button>
              );
            })}
          </div>
        </aside>
        
        <main className="flex-1 ml-[260px] p-10 min-h-[calc(100vh-64px)] relative z-10">
          <div className="max-w-6xl mx-auto">
            {currentRoute === '/ingestion' && <IngestionScreen />}
            {currentRoute === '/anomaly-report' && <AnomalyReportScreen />}
            {currentRoute === '/claim/CG-2024-00587A' && <ClaimLocationScreen />}
            {currentRoute === '/claim/CG-2024-00934' && <ClaimHCCScreen />}
            {currentRoute === '/dashboard' && <DashboardScreen />}
          </div>
        </main>
      </div>
      
      <footer className="bg-[#0f203b] text-[#CADCFC]/60 text-[11px] font-medium tracking-wide text-center py-4 mt-auto z-50 relative border-t border-white/5">
        ClaimGuard Pattern Pulse | AI PM Bootcamp — Marily Nika | Demo Day 2026
      </footer>
      
      {toast && (
        <div className="fixed top-24 right-8 bg-[#059669] text-white px-5 py-4 rounded-xl shadow-2xl shadow-[#059669]/30 flex items-center gap-3 z-50 animate-fade-in-up border border-white/20">
          <CheckCircle size={20} />
          <span className="text-sm font-bold tracking-wide">{toast}</span>
        </div>
      )}
    </div>
  );
}

