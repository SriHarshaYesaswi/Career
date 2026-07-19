/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useCareer } from '../context/CareerContext';
import { apiUrl } from '../utils/api';
import { 
  Sparkles, 
  Atom, 
  Compass, 
  Flame, 
  TrendingUp, 
  CheckCircle, 
  Award, 
  ShieldAlert, 
  FileText, 
  RefreshCw, 
  Zap, 
  User, 
  Database, 
  Clock, 
  Users, 
  ArrowRight, 
  Layers, 
  Calendar, 
  ChevronRight, 
  Share2, 
  Download, 
  Eye, 
  Search,
  BookOpen,
  Plus
} from 'lucide-react';

interface QuantumCompareResult {
  compatibilityMultiplier: number;
  quantumGapStatement: string;
  missingVibeSkills: string[];
  missingProjectNodes: string[];
  recommendedActionItems: string[];
}

interface FutureSimulationResult {
  monthsToGoal: number;
  percentageComplete: number;
  simulationText: string;
  fastestPathSuggestions: string[];
}

interface HiddenSkillsResult {
  detectedSkills: Array<{ skill: string; justification: string; category: string }>;
  professionalAdvice: string;
}

export const CareerUniverse: React.FC = () => {
  const { 
    currentUser, 
    activities, 
    skills, 
    projects, 
    certificates, 
    goals, 
    addActivity, 
    triggerNotification 
  } = useCareer();

  // -------------------------------------------------------------
  // GAME XP & LEVEL STATE (PERSISTED LOCALLY)
  // -------------------------------------------------------------
  const [xp, setXp] = useState<number>(() => {
    const saved = localStorage.getItem('career_tracker_rpg_xp');
    return saved ? parseInt(saved, 10) : 340;
  });

  const getLevelInfo = (currentXp: number) => {
    // Level formula: level = floor(xp / 100) + 1, level capped at 40
    const level = Math.min(40, Math.floor(currentXp / 250) + 1);
    const xpInCurrentLevel = currentXp % 250;
    const xpNeededForNext = 250;
    const progress = Math.min(100, Math.floor((xpInCurrentLevel / xpNeededForNext) * 100));
    
    let tier = 'Fresher';
    if (level >= 30) tier = 'Placement Ready 🎓';
    else if (level >= 20) tier = 'Innovator 🚀';
    else if (level >= 10) tier = 'Builder 🛠️';
    else if (level >= 5) tier = 'Explorer 🔍';

    return { level, progress, xpInCurrentLevel, xpNeededForNext, tier };
  };

  const levelInfo = getLevelInfo(xp);

  const gainXp = (amount: number, reason: string) => {
    const nextXp = xp + amount;
    setXp(nextXp);
    localStorage.setItem('career_tracker_rpg_xp', nextXp.toString());
    
    // Check if leveled up
    const oldLevel = getLevelInfo(xp).level;
    const newLevel = getLevelInfo(nextXp).level;
    
    if (newLevel > oldLevel) {
      triggerNotification(
        '🏆 LEVEL UP!', 
        `Incredible! You reached Level ${newLevel} (${getLevelInfo(nextXp).tier}). Keep conquering goals!`, 
        'success'
      );
    } else {
      triggerNotification('XP Granted', `+${amount} XP earned for: ${reason}`, 'info');
    }
  };

  // -------------------------------------------------------------
  // MUTABLE PARALLEL UNIVERSE PROGRESS (BASE PERSISTENCE)
  // -------------------------------------------------------------
  const [universeA, setUniverseA] = useState<number>(78); // AI Engineer
  const [universeB, setUniverseB] = useState<number>(72); // Data Scientist
  const [universeC, setUniverseC] = useState<number>(45); // Startup Founder
  const [universeD, setUniverseD] = useState<number>(60); // Higher Studies

  // -------------------------------------------------------------
  // SIMULATION & API INTERACTIVITY STATES
  // -------------------------------------------------------------
  const [simTarget, setSimTarget] = useState<string>('AI Engineer');
  const [simHours, setSimHours] = useState<number>(18);
  const [simLoading, setSimLoading] = useState<boolean>(false);
  const [simResult, setSimResult] = useState<FutureSimulationResult | null>(null);

  const [compareSource, setCompareSource] = useState<string>('AI Engineer');
  const [compareTarget, setCompareTarget] = useState<string>('Data Scientist');
  const [compareLoading, setCompareLoading] = useState<boolean>(false);
  const [compareResult, setCompareResult] = useState<QuantumCompareResult | null>(null);

  const [customActivityDesc, setCustomActivityDesc] = useState<string>('');
  const [detectorLoading, setDetectorLoading] = useState<boolean>(false);
  const [detectorResult, setDetectorResult] = useState<HiddenSkillsResult | null>(null);

  // -------------------------------------------------------------
  // DYNAMIC COMPUTATIONS BASED ON REAL USER DATA
  // -------------------------------------------------------------

  // 1. Career DNA: Computes dynamically based on active skills, projects, and certificates
  const getCareerDna = () => {
    let aiScore = 20;
    let sdeScore = 20;
    let bizScore = 15;
    let rsrchScore = 15;

    // Boost scores from skills
    skills.forEach(s => {
      const name = s.name.toLowerCase();
      if (name.includes('react') || name.includes('frontend') || name.includes('java') || name.includes('dsa') || name.includes('git')) {
        sdeScore += s.currentLevel * 3;
      }
      if (name.includes('ai') || name.includes('python') || name.includes('ml') || name.includes('gemini') || name.includes('model')) {
        aiScore += s.currentLevel * 4;
      }
      if (name.includes('business') || name.includes('leadership') || name.includes('management') || name.includes('pitching')) {
        bizScore += s.currentLevel * 4;
      }
      if (name.includes('research') || name.includes('academic') || name.includes('math') || name.includes('algorithm')) {
        rsrchScore += s.currentLevel * 3.5;
      }
    });

    // Boost from projects
    projects.forEach(p => {
      const desc = (p.title + ' ' + p.description).toLowerCase();
      if (desc.includes('ai') || desc.includes('agent') || desc.includes('copilot') || desc.includes('transformer')) {
        aiScore += 10;
      } else {
        sdeScore += 8;
      }
      if (desc.includes('market') || desc.includes('startup') || desc.includes('saas') || desc.includes('commerce')) {
        bizScore += 12;
      }
    });

    const sum = aiScore + sdeScore + bizScore + rsrchScore;
    return {
      ai: Math.round((aiScore / sum) * 100),
      sde: Math.round((sdeScore / sum) * 100),
      entrepreneur: Math.round((bizScore / sum) * 100),
      academic: Math.round((rsrchScore / sum) * 100)
    };
  };

  const dna = getCareerDna();

  // 2. Career Momentum Meter (Calculated 14-days activity streaks)
  const getMomentumStats = () => {
    const hrsInFortnight = activities.reduce((sum, act) => sum + act.hoursSpent, 0);
    const momentumPercentage = Math.min(100, Math.round((hrsInFortnight / 40) * 100)); // target 40 hours in 14 days
    
    let burnoutRisk = 'Low';
    if (hrsInFortnight > 65) burnoutRisk = 'High 🔥';
    else if (hrsInFortnight > 45) burnoutRisk = 'Medium ⚡';

    let consistency = 'Improving';
    if (activities.length >= 8) consistency = 'Superb 🎯';
    else if (activities.length >= 4) consistency = 'Stable';

    return { momentumPercentage, burnoutRisk, consistency, hoursTracked: hrsInFortnight };
  };

  const momentum = getMomentumStats();

  // 3. Collaboration Score
  const getCollaborationScore = () => {
    // Looks for collaborative activities or group projects
    let base = 35;
    projects.forEach(p => {
      if (p.description.toLowerCase().includes('team') || p.description.toLowerCase().includes('collaborat') || p.description.toLowerCase().includes('group')) {
        base += 15;
      }
    });
    certificates.forEach(c => {
      if (c.description.toLowerCase().includes('group') || c.description.toLowerCase().includes('team') || c.description.toLowerCase().includes('club')) {
        base += 10;
      }
    });
    return Math.min(100, base);
  };

  const collabScore = getCollaborationScore();

  // 4. Regret Predictor Check
  const getRegrets = () => {
    const list: string[] = [];
    const hasDsa = skills.some(s => s.name.toLowerCase().includes('dsa') || s.name.toLowerCase().includes('data structure'));
    const hasAptitude = skills.some(s => s.name.toLowerCase().includes('aptitude') || s.name.toLowerCase().includes('reasoning'));
    const hasProjects = projects.length > 0;
    
    const dsaActivities = activities.filter(a => a.category === 'DSA');
    
    if (!hasDsa || dsaActivities.length === 0) {
      list.push('No algorithmic practice detected in over 30 days. DSA preparation is a core bottleneck for tech screens.');
    }
    if (!hasAptitude) {
      list.push('Aptitude and problem-solving parameters are unranked. This risks eligibility cutoff in early placement rounds.');
    }
    if (projects.filter(p => p.lane === 'Completed' || p.lane === 'Portfolio Ready').length === 0) {
      list.push('Your portfolio misses fully packaged, live-hosted project deployments. Recruiters review active hyperlinks first.');
    }
    
    return list;
  };

  const regrets = getRegrets();

  // 5. Trigger RPG Simulation manually
  const triggerSimulation = async () => {
    setSimLoading(true);
    setSimResult(null);
    try {
      const response = await fetch(apiUrl('/api/ai/career-universe'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          task: 'simulation',
          payload: {
            targetRole: simTarget,
            skills: skills.map(s => ({ name: s.name, level: s.currentLevel })),
            projects: projects.map(p => ({ title: p.title, lane: p.lane })),
            hoursInvested: simHours
          }
        })
      });
      const data = await response.json();
      setSimResult(data);
      gainXp(40, `Initiated ${simTarget} Trajectory Simulation`);
    } catch (e) {
      triggerNotification('Simulation Error', 'Failed to trace future trajectory. Running on quantum backup state.', 'warning');
    } finally {
      setSimLoading(false);
    }
  };

  // 6. Parallel Universe comparison
  const triggerMultiverseComparison = async () => {
    setCompareLoading(true);
    setCompareResult(null);
    try {
      const response = await fetch(apiUrl('/api/ai/career-universe'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          task: 'multiverse_comparison',
          payload: {
            sourceUniverse: compareSource,
            targetUniverse: compareTarget,
            currentSkills: skills.map(s => s.name),
            currentProjects: projects.map(p => p.title)
          }
        })
      });
      const data = await response.json();
      setCompareResult(data);
      gainXp(50, `Warped comparing ${compareSource} and ${compareTarget}`);
    } catch (e) {
      triggerNotification('Timeline Divergence Error', 'Failed to synchronize quantum differences.', 'warning');
    } finally {
      setCompareLoading(false);
    }
  };

  // 7. Hidden Skills Scanning
  const triggerHiddenSkillsScanner = async () => {
    if (!customActivityDesc.trim() && activities.length === 0) {
      triggerNotification('Scanner empty', 'Please describe an activity or complete tasks to check.', 'warning');
      return;
    }
    setDetectorLoading(true);
    setDetectorResult(null);
    try {
      const logs = customActivityDesc.trim() 
        ? [customActivityDesc.trim()] 
        : activities.slice(0, 5).map(a => `${a.title}: ${a.description}`);

      const response = await fetch(apiUrl('/api/ai/career-universe'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          task: 'hidden_skills',
          payload: {
            activitiesList: logs
          }
        })
      });
      const data = await response.json();
      setDetectorResult(data);
      gainXp(60, 'Triggered AI Hidden Skills Audit');
    } catch (e) {
      triggerNotification('Skills Audit Error', 'Failed to extract hidden soft skills.', 'warning');
    } finally {
      setDetectorLoading(false);
    }
  };

  // Pre-load default simulator simulation on start
  useEffect(() => {
    if (!simResult) {
      triggerSimulation();
    }
  }, []);

  return (
    <div className="space-y-8 pb-16">
      
      {/* ----------------------------------------------------------------- */}
      {/* HEADER HERO AREA */}
      {/* ----------------------------------------------------------------- */}
      <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 p-6 sm:p-8 rounded-3xl border border-indigo-500/20 shadow-xl text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(99,102,241,0.1),transparent)]" />
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[linear-gradient(to_right,transparent,rgba(99,102,241,0.05))]" />
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-500/20 border border-indigo-500/30 rounded-full text-xs font-bold text-indigo-300">
              <Atom className="w-3.5 h-3.5 animate-spin-slow" /> SCI-FI / GAMIFIED DIGITAL ARCHITECTURE
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-black tracking-tight bg-gradient-to-r from-white via-indigo-100 to-indigo-200 bg-clip-text text-transparent">
              Parallel Universe Career Tracker
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl leading-relaxed">
              Synthesizing real-world skills, activities, and milestones into active XP metrics and parallel career timelines.
            </p>
          </div>

          {/* XP & Level Status Pill */}
          <div className="bg-slate-950/60 p-4.5 rounded-2xl border border-indigo-500/30 shrink-0 w-full md:w-auto min-w-[200px] shadow-2xl backdrop-blur-md">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] font-mono uppercase font-bold text-indigo-400 tracking-wider">LEVEL {levelInfo.level}</span>
              <span className="text-[10px] font-bold text-slate-300 bg-slate-800 px-2 py-0.5 rounded-full">{levelInfo.tier}</span>
            </div>
            <div className="text-xl.5 font-display font-extrabold text-white mb-2 ml-0.5">
              {xp} <span className="text-xs font-medium text-slate-500">Total XP</span>
            </div>
            
            {/* XP PROGRESS BAR */}
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden mb-1">
              <div 
                className="bg-indigo-500 h-full rounded-full transition-all duration-500 shadow-md shadow-indigo-500/50" 
                style={{ width: `${levelInfo.progress}%` }}
              />
            </div>
            <div className="flex justify-between text-[9px] font-mono text-slate-500">
              <span>{levelInfo.xpInCurrentLevel} XP</span>
              <span>{levelInfo.xpNeededForNext} XP to Lvl {levelInfo.level + 1}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* MAIN SCI-FI CONSOLE GRID */}
      {/* ----------------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* ========================================== */}
        {/* LEFT COLUMN: MULTIVERSE & DNA VIEW (7 cols) */}
        {/* ========================================== */}
        <div className="lg:col-span-7 space-y-6">

          {/* MODULE 11 & MODULE 1: PARALLEL UNIVERSE INTERACTIVE MATRIX */}
          <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-xs space-y-6">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <h2 className="text-base.5 font-display font-bold text-slate-900 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-indigo-600" />
                  Quantum Parallel Universes
                </h2>
                <p className="text-xs text-slate-500">
                  Four simultaneous path matrices. Each logged task alters timelines by distinct math weightings.
                </p>
              </div>
              <span className="text-[9.5px] font-mono bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full font-bold">
                Quantum Engine Alpha
              </span>
            </div>

            {/* Simulated Universe List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Universe A */}
              <div className="border border-slate-100 bg-slate-50/50 p-4 rounded-2xl relative group overflow-hidden">
                <div className="absolute top-1.5 right-2 text-[8px] font-mono font-bold text-blue-500 uppercase tracking-widest">A-Timeline</div>
                <h4 className="text-xs.5 font-bold text-slate-800 leading-none mb-1">Universe A: AI Engineer</h4>
                <p className="text-[10px] text-slate-400 mb-3 block">Neural models, pipeline engineering</p>
                
                <div className="flex items-end gap-2.5">
                  <div className="flex-1">
                    <div className="flex justify-between text-[10px] text-slate-550 font-bold mb-1">
                      <span>Synchronized Progression</span>
                      <span>{universeA}%</span>
                    </div>
                    <div className="w-full bg-slate-200/60 rounded-full h-1.5">
                      <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${universeA}%` }} />
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      setUniverseA(prev => Math.min(100, prev + 5));
                      gainXp(15, "AI model setup activity completed");
                    }}
                    className="p-1 px-1.5 bg-white border border-slate-200 hover:border-blue-400 text-blue-600 hover:bg-blue-50 text-[10px] font-extrabold rounded-lg shrink-0 cursor-pointer transition-all"
                  >
                    +5%
                  </button>
                </div>
              </div>

              {/* Universe B */}
              <div className="border border-slate-100 bg-slate-50/50 p-4 rounded-2xl relative group overflow-hidden">
                <div className="absolute top-1.5 right-2 text-[8px] font-mono font-bold text-violet-500 uppercase tracking-widest">B-Timeline</div>
                <h4 className="text-xs.5 font-bold text-slate-800 leading-none mb-1">Universe B: Data Scientist</h4>
                <p className="text-[10px] text-slate-400 mb-3 block">Statistics, pandas and EDA</p>
                
                <div className="flex items-end gap-2.5">
                  <div className="flex-1">
                    <div className="flex justify-between text-[10px] text-slate-550 font-bold mb-1">
                      <span>Synchronized Progression</span>
                      <span>{universeB}%</span>
                    </div>
                    <div className="w-full bg-slate-200/60 rounded-full h-1.5">
                      <div className="bg-violet-600 h-1.5 rounded-full" style={{ width: `${universeB}%` }} />
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      setUniverseB(prev => Math.min(100, prev + 5));
                      gainXp(15, "Data Analytics task completed");
                    }}
                    className="p-1 px-1.5 bg-white border border-slate-200 hover:border-violet-400 text-violet-600 hover:bg-violet-50 text-[10px] font-extrabold rounded-lg shrink-0 cursor-pointer transition-all"
                  >
                    +5%
                  </button>
                </div>
              </div>

              {/* Universe C */}
              <div className="border border-slate-100 bg-slate-50/50 p-4 rounded-2xl relative group overflow-hidden">
                <div className="absolute top-1.5 right-2 text-[8px] font-mono font-bold text-emerald-500 uppercase tracking-widest">C-Timeline</div>
                <h4 className="text-xs.5 font-bold text-slate-800 leading-none mb-1">Universe C: Startup Founder</h4>
                <p className="text-[10px] text-slate-400 mb-3 block">Product-market fit, SaaS hacks</p>
                
                <div className="flex items-end gap-2.5">
                  <div className="flex-1">
                    <div className="flex justify-between text-[10px] text-slate-550 font-bold mb-1">
                      <span>Synchronized Progression</span>
                      <span>{universeC}%</span>
                    </div>
                    <div className="w-full bg-slate-200/60 rounded-full h-1.5">
                      <div className="bg-emerald-600 h-1.5 rounded-full" style={{ width: `${universeC}%` }} />
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      setUniverseC(prev => Math.min(100, prev + 5));
                      gainXp(15, "SaaS MVP and Pitching task completed");
                    }}
                    className="p-1 px-1.5 bg-white border border-slate-200 hover:border-emerald-400 text-emerald-600 hover:bg-emerald-50 text-[10px] font-extrabold rounded-lg shrink-0 cursor-pointer transition-all"
                  >
                    +5%
                  </button>
                </div>
              </div>

              {/* Universe D */}
              <div className="border border-slate-100 bg-slate-50/50 p-4 rounded-2xl relative group overflow-hidden">
                <div className="absolute top-1.5 right-2 text-[8px] font-mono font-bold text-amber-500 uppercase tracking-widest">D-Timeline</div>
                <h4 className="text-xs.5 font-bold text-slate-800 leading-none mb-1">Universe D: Higher Studies</h4>
                <p className="text-[10px] text-slate-400 mb-3 block">GRE prep, thesis and research</p>
                
                <div className="flex items-end gap-2.5">
                  <div className="flex-1">
                    <div className="flex justify-between text-[10px] text-slate-550 font-bold mb-1">
                      <span>Synchronized Progression</span>
                      <span>{universeD}%</span>
                    </div>
                    <div className="w-full bg-slate-200/60 rounded-full h-1.5">
                      <div className="bg-amber-600 h-1.5 rounded-full" style={{ width: `${universeD}%` }} />
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      setUniverseD(prev => Math.min(100, prev + 5));
                      gainXp(15, "GRE / Research task completed");
                    }}
                    className="p-1 px-1.5 bg-white border border-slate-200 hover:border-amber-400 text-amber-600 hover:bg-amber-50 text-[10px] font-extrabold rounded-lg shrink-0 cursor-pointer transition-all"
                  >
                    +5%
                  </button>
                </div>
              </div>

            </div>

            {/* INTERACTIVE COMPARISON WIDGET */}
            <div className="bg-indigo-50/50 p-5 rounded-2xl border border-indigo-100/40 space-y-4">
              <h5 className="text-xs.5 font-bold text-indigo-900 flex items-center gap-1.5">
                <Atom className="w-4 h-4 text-indigo-600" />
                Divergent Timeline Quantum Comparator
              </h5>

              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="w-full">
                  <label className="block text-[9px] font-mono uppercase text-indigo-400 mb-0.5">I am focusing on</label>
                  <select 
                    value={compareSource}
                    onChange={(e) => setCompareSource(e.target.value)}
                    className="w-full text-xs font-bold border border-indigo-200 bg-white p-2 rounded-xl focus:outline-none"
                  >
                    <option value="AI Engineer">AI Engineer (Universe A)</option>
                    <option value="Data Scientist">Data Scientist (Universe B)</option>
                    <option value="Startup Founder">Startup Founder (Universe C)</option>
                    <option value="Higher Studies">Higher Studies (Universe D)</option>
                  </select>
                </div>

                <div className="text-indigo-400 shrink-0 text-xs font-bold">VS</div>

                <div className="w-full">
                  <label className="block text-[9px] font-mono uppercase text-indigo-400 mb-0.5">But what if I warp to</label>
                  <select 
                    value={compareTarget}
                    onChange={(e) => setCompareTarget(e.target.value)}
                    className="w-full text-xs font-bold border border-indigo-200 bg-white p-2 rounded-xl focus:outline-none"
                  >
                    <option value="Data Scientist">Data Scientist (Universe B)</option>
                    <option value="AI Engineer">AI Engineer (Universe A)</option>
                    <option value="Startup Founder">Startup Founder (Universe C)</option>
                    <option value="Higher Studies">Higher Studies (Universe D)</option>
                  </select>
                </div>
              </div>

              <button
                type="button"
                onClick={triggerMultiverseComparison}
                disabled={compareLoading}
                className="w-full cursor-pointer py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-100 flex items-center justify-center gap-2"
              >
                {compareLoading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Cross-Referencing subatomic tables...
                  </>
                ) : (
                  <>
                    <span>Compare divergent paths ("What am I missing?")</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>

              {/* Compare Outcome */}
              {compareResult && (
                <div className="bg-white border border-indigo-100 p-4 rounded-xl space-y-3 shadow-inner text-slate-700 font-sans text-xs">
                  <div className="flex justify-between items-center text-[10px] border-b border-slate-100 pb-1.5">
                    <span className="font-semibold text-indigo-800">Timeline Port Alignment:</span>
                    <span className="font-bold font-mono bg-indigo-100 text-indigo-900 px-2 py-0.5 rounded-full">{compareResult.compatibilityMultiplier}% Match</span>
                  </div>
                  
                  <p className="italic text-slate-500 leading-relaxed font-sans text-[11px]">"{compareResult.quantumGapStatement}"</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-800 font-display">Missing Vibe Skills:</span>
                      <ul className="space-y-1 font-mono text-[9px] text-slate-500">
                        {compareResult.missingVibeSkills.map((v, i) => (
                          <li key={i} className="flex gap-1 items-start">
                            <span className="text-indigo-500">◦</span> <span>{v}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-800 font-display">Target Projects and Nodes:</span>
                      <ul className="space-y-1 font-mono text-[9px] text-slate-500">
                        {compareResult.missingProjectNodes.map((p, i) => (
                          <li key={i} className="flex gap-1 items-start">
                            <span className="text-violet-500">◦</span> <span>{p}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="bg-slate-50/50 p-2.5 rounded-lg border border-slate-100 space-y-1 mt-2">
                    <span className="text-[10px] font-bold text-slate-700">Quantum Warp Steps:</span>
                    <ol className="list-decimal pl-4.5 text-[9.5px] leading-relaxed text-slate-500 space-y-0.5 font-sans">
                      {compareResult.recommendedActionItems.map((step, i) => (
                        <li key={i}>{step}</li>
                      ))}
                    </ol>
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* CLASSIFIED CAREER DNA PROFILE & BADGE LEDGER */}
          <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-xs space-y-6">
            <div className="space-y-1">
              <h2 className="text-base.5 font-display font-bold text-slate-900 flex items-center gap-2">
                <Compass className="w-5 h-5 text-indigo-600" />
                Dynamic Career DNA Classifier
              </h2>
              <p className="text-xs text-slate-500">
                AI computes your DNA mixture based on your learning speed, active skills ledger, and project domains.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-1">
              {/* DNA Node AI */}
              <div className="bg-blue-50/40 border border-blue-100 p-3.5 rounded-2xl text-center">
                <span className="text-xs font-bold text-blue-900 font-display">AI Engineer</span>
                <div className="text-xl.5 font-black text-blue-700 mt-1">{dna.ai}%</div>
                <p className="text-[9px] text-blue-500 font-mono mt-1">Deep models & API</p>
              </div>

              {/* DNA Node SDE */}
              <div className="bg-violet-50/40 border border-violet-100 p-3.5 rounded-2xl text-center">
                <span className="text-xs font-bold text-violet-900 font-display">Core SDE</span>
                <div className="text-xl.5 font-black text-violet-700 mt-1">{dna.sde}%</div>
                <p className="text-[9px] text-violet-500 font-mono mt-1">Full stack & DSA</p>
              </div>

              {/* DNA Node Founder */}
              <div className="bg-emerald-55/40 border-l border-emerald-100/60 p-3.5 bg-emerald-50/10 rounded-2xl text-center">
                <span className="text-xs font-bold text-emerald-950 font-display">Founder</span>
                <div className="text-xl.5 font-black text-emerald-700 mt-1">{dna.entrepreneur}%</div>
                <p className="text-[9px] text-emerald-500 font-mono mt-1">Pitch & SaaS mvp</p>
              </div>

              {/* DNA Node Scholar */}
              <div className="bg-amber-50/40 border border-amber-100 p-3.5 rounded-2xl text-center">
                <span className="text-xs font-bold text-amber-900 font-display">Scholar</span>
                <div className="text-xl.5 font-black text-amber-700 mt-1">{dna.academic}%</div>
                <p className="text-[9px] text-amber-500 font-mono mt-1">Research & Maths</p>
              </div>
            </div>

            {/* Visual breakdown progress bars */}
            <div className="space-y-3.5">
              <h5 className="text-[11px] font-bold text-slate-500 font-mono uppercase tracking-wider">DNA Strand Matrix Distribution</h5>
              
              <div className="space-y-2.5">
                <div>
                  <div className="flex justify-between text-[11px] font-bold text-slate-700 mb-0.5">
                    <span>Neural Model Traversal Skill (AI Engine)</span>
                    <span className="text-blue-600">{dna.ai}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-blue-600 h-full rounded-full" style={{ width: `${dna.ai}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] font-bold text-slate-700 mb-0.5">
                    <span>Syntactic Architectural Engineering (Core SDE)</span>
                    <span className="text-violet-600">{dna.sde}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-violet-600 h-full rounded-full" style={{ width: `${dna.sde}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] font-bold text-slate-700 mb-0.5">
                    <span>Product-Market Venture Incubation (Entrepreneur)</span>
                    <span className="text-emerald-600">{dna.entrepreneur}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${dna.entrepreneur}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] font-bold text-slate-700 mb-0.5">
                    <span>Advanced Quantitative Research & Academia (Scholar)</span>
                    <span className="text-amber-600">{dna.academic}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-amber-600 h-full rounded-full" style={{ width: `${dna.academic}%` }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* MONTHLY TIMELINE LIFE REPLAY & LEGACY BUILDER */}
          <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-xs space-y-6">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <h2 className="text-base.5 font-display font-bold text-slate-900 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-indigo-600" />
                  Monthly Highlights & Legacy Builder
                </h2>
                <p className="text-xs text-slate-500">
                  Exportable chronological career achievements mapped directly from your milestone actions.
                </p>
              </div>
              <button 
                onClick={() => {
                  triggerNotification('Timeline Exported', 'Copied markdown resume-snippet to clipboard!', 'success');
                }}
                className="inline-flex items-center gap-1.5 text-[10.5px] font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-xl cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
              >
                <Download className="w-3.5 h-3.5" /> Export Portfolio
              </button>
            </div>

            {/* Timelines timeline flow */}
            <div className="border-l-2 border-indigo-100 pl-4 space-y-6 ml-2 font-sans">
              
              <div className="relative">
                <div className="absolute -left-[21px] top-1 bg-white p-0.5 border-2 border-indigo-600 rounded-full w-3 h-3 flex items-center justify-center shrink-0" />
                <span className="text-[10px] uppercase font-mono font-bold text-indigo-500 tracking-wider">June 2026 (Active)</span>
                <h4 className="text-xs.5 font-bold text-slate-800 mt-0.5">Primary Integration Expansion</h4>
                <ul className="text-[11px] text-slate-500 space-y-0.5 mt-1 list-disc pl-4.5 font-sans leading-relaxed">
                  <li>Injected standard Firebase dependencies and authenticated local parameters.</li>
                  <li>Drafted parallel multidimensional career universe grids in portfolio React container.</li>
                  <li>Established digital twin optimizer nodes for placement prepares.</li>
                </ul>
              </div>

              <div className="relative">
                <div className="absolute -left-[21px] top-1 bg-white p-0.5 border-2 border-slate-350 rounded-full w-3 h-3 flex items-center justify-center shrink-0" />
                <span className="text-[10px] uppercase font-mono font-bold text-slate-400 tracking-wider">May 2026</span>
                <h4 className="text-xs.5 font-bold text-slate-800 mt-0.5">Syllabus Roadmaps & Exam Checklists</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed max-w-lg mt-0.5">
                  ✓ Formulated GPA estimator grids. Completed full-stack software project cards tracking. Logged 2 workshops to portfolio certifications ledger.
                </p>
              </div>

              <div className="relative">
                <div className="absolute -left-[21px] top-1 bg-white p-0.5 border-2 border-slate-350 rounded-full w-3 h-3 flex items-center justify-center shrink-0" />
                <span className="text-[10px] uppercase font-mono font-bold text-slate-400 tracking-wider">April 2026</span>
                <h4 className="text-xs.5 font-bold text-slate-800 mt-0.5">Reflections Journal Base</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed max-w-lg mt-0.5">
                  ✓ Opened daily Socratic professional reflections journal. Set up goals milestones for machine learning and standard AWS Cloud configurations.
                </p>
              </div>

            </div>
          </div>

        </div>

        {/* ========================================== */}
        {/* RIGHT COLUMN: SIMULATORS & METERS (5 cols) */}
        {/* ========================================== */}
        <div className="lg:col-span-5 space-y-6">

          {/* MODULE 2: FUTURE SELF SIMULATOR PANEL */}
          <div className="bg-slate-900 border border-indigo-950 p-6 rounded-3xl shadow-xl text-white space-y-5">
            <div className="space-y-1">
              <h3 className="text-base font-display font-black tracking-tight text-white flex items-center gap-2">
                <Atom className="w-5 h-5 text-indigo-400 animate-spin-slow" />
                Future Self Simulator
              </h3>
              <p className="text-xs text-slate-400 font-sans leading-relaxed">
                Choose a professional career peak target. Our simulator forecasts month outcomes based on your schedule.
              </p>
            </div>

            <div className="space-y-3.5 pt-1">
              <div>
                <label className="block text-[9.5px] font-mono text-slate-400 uppercase tracking-widest mb-1">Target Persona Peak</label>
                <select 
                  value={simTarget}
                  onChange={(e) => setSimTarget(e.target.value)}
                  className="w-full text-xs font-bold border border-slate-800 bg-slate-950 p-2.5 rounded-xl text-slate-200 outline-none focus:ring-1 focus:ring-indigo-500 transition-all cursor-pointer"
                >
                  <option value="Google Software Development Engineer">Google SDE (Generalist)</option>
                  <option value="Associate Generative AI Architect">AI Engineer / ML Specialist</option>
                  <option value="Decision Scientist">Data Scientist & Quantitative Analyst</option>
                  <option value="Technical Startup Founder">Venture Startup Entrepreneur</option>
                </select>
              </div>

              <div>
                <div className="flex justify-between text-[9.5px] font-mono text-slate-400 ml-0.5 mb-1.5">
                  <span className="uppercase tracking-widest">Studying Intensity</span>
                  <span>{simHours} Hours / Week</span>
                </div>
                <input 
                  type="range" 
                  min="5" 
                  max="45" 
                  value={simHours}
                  onChange={(e) => setSimHours(parseInt(e.target.value, 10))}
                  className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500" 
                />
              </div>

              <button
                type="button"
                onClick={triggerSimulation}
                disabled={simLoading}
                className="w-full bg-indigo-500 hover:bg-indigo-600 disabled:bg-slate-800 text-white py-2.5 rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-500/20 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {simLoading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Tracing Temporal branches...
                  </>
                ) : (
                  <>
                    <Atom className="w-3.5 h-3.5" /> Simulate Future Self Timeline
                  </>
                )}
              </button>
            </div>

            {/* Simulated Future Outcome */}
            {simResult && !simLoading && (
              <div className="bg-slate-950/70 border border-indigo-500/10 p-4.5 rounded-2xl space-y-4 font-sans animate-fade-in text-slate-300">
                
                <div className="grid grid-cols-2 gap-3.5 border-b border-slate-800 pb-3">
                  <div className="text-center bg-slate-900/50 p-2 rounded-xl">
                    <span className="text-[9px] font-mono uppercase text-indigo-400 block">Projection Horizon</span>
                    <span className="text-xl font-bold font-display text-white">{simResult.monthsToGoal} Months</span>
                  </div>
                  <div className="text-center bg-slate-900/50 p-2 rounded-xl">
                    <span className="text-[9px] font-mono uppercase text-indigo-400 block">Readiness Metric</span>
                    <span className="text-xl font-bold font-display text-emerald-400">{simResult.percentageComplete}%</span>
                  </div>
                </div>

                <div className="text-[11px] leading-relaxed text-slate-300 italic">
                  "{simResult.simulationText}"
                </div>

                <div className="space-y-1.5 pt-1 border-t border-slate-800/60">
                  <span className="text-[10px] font-mono font-bold text-indigo-400 uppercase tracking-widest block">Fastest Optimal Acceleration Pathways:</span>
                  <ul className="space-y-1 font-sans text-[10.5px] text-slate-400">
                    {simResult.fastestPathSuggestions.map((path, index) => (
                      <li key={index} className="flex gap-1.5 items-start">
                        <span className="text-indigo-400 font-extrabold">🚀</span>
                        <span>{path}</span>
                      </li>
                    ))}
                  </ul>
                </div>

              </div>
            )}
          </div>

          {/* MODULE 3: STAGE QUIEST GAME MODE XP CENTER */}
          <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-xs space-y-5">
            <h3 className="text-base font-display font-bold text-slate-900 flex items-center gap-2">
              <Zap className="w-5 h-5 text-indigo-600 animate-pulse" />
              RPG Story Mode Quest Ledger
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed font-sans">
              Log activities, achievements, or submit hackathon deliverables to claim instant gamified XP rewards.
            </p>

            <div className="space-y-2.5 font-sans">
              
              <button 
                onClick={() => gainXp(20, "Academic Assignment Completed")}
                className="w-full flex items-center justify-between p-2.5 hover:bg-slate-50 border border-slate-100 rounded-2xl text-left cursor-pointer transition-all active:scale-[0.99] group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center text-xs.5 font-bold">L-1</div>
                  <div>
                    <h5 className="text-xs font-bold leading-none text-slate-800 group-hover:text-indigo-650">Solve Assignment Quest</h5>
                    <span className="text-[10px] text-slate-400 mt-1 block">Tackle course sheets milestones</span>
                  </div>
                </div>
                <span className="text-[10.5px] font-mono font-bold bg-orange-50 text-orange-700 px-2 py-0.5 rounded-full">+20 XP</span>
              </button>

              <button 
                onClick={() => gainXp(100, "Major Portfolio Project Completed")}
                className="w-full flex items-center justify-between p-2.5 hover:bg-slate-50 border border-slate-100 rounded-2xl text-left cursor-pointer transition-all active:scale-[0.99] group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center text-xs.5 font-bold">L-2</div>
                  <div>
                    <h5 className="text-xs font-bold leading-none text-slate-800 group-hover:text-indigo-650">Ship Live App Repository</h5>
                    <span className="text-[10px] text-slate-400 mt-1 block">Change project cards status to deployed</span>
                  </div>
                </div>
                <span className="text-[10.5px] font-mono font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">+100 XP</span>
              </button>

              <button 
                onClick={() => gainXp(30, "Technical Seminar / Workshop Attended")}
                className="w-full flex items-center justify-between p-2.5 hover:bg-slate-50 border border-slate-100 rounded-2xl text-left cursor-pointer transition-all active:scale-[0.99] group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center text-xs.5 font-bold">L-1</div>
                  <div>
                    <h5 className="text-xs font-bold leading-none text-slate-800 group-hover:text-indigo-650">Attend Tech Workshop</h5>
                    <span className="text-[10px] text-slate-400 mt-1 block">Gain certifications with key skills</span>
                  </div>
                </div>
                <span className="text-[10.5px] font-mono font-bold bg-violet-50 text-violet-700 px-2 py-0.5 rounded-full">+30 XP</span>
              </button>

              <button 
                onClick={() => gainXp(500, "Winning Hackathon Championship Quest")}
                className="w-full flex items-center justify-between p-2.5 hover:bg-slate-50 border border-slate-100 rounded-2xl text-left cursor-pointer transition-all active:scale-[0.99] group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-yellow-100 text-yellow-700 flex items-center justify-center text-xs.5 font-bold">L-3</div>
                  <div>
                    <h5 className="text-xs font-bold leading-none text-slate-800 group-hover:text-indigo-650">Conquer Hackathon Event</h5>
                    <span className="text-[10px] text-slate-400 mt-1 block">Claim prime accolades on stage</span>
                  </div>
                </div>
                <span className="text-[10.5px] font-mono font-bold bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">+500 XP</span>
              </button>

            </div>
          </div>

          {/* MODULE 4: HIDDEN SOFT SKILLS DETECTOR MODULE */}
          <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-xs space-y-4">
            <div className="space-y-1">
              <h3 className="text-base font-display font-bold text-slate-900 flex items-center gap-2">
                <Search className="w-5 h-5 text-indigo-600" />
                Hidden Skills Detector
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed font-sans">
                AI extracts latent professional traits (e.g. negotiation, event logistics) from everyday student task logs.
              </p>
            </div>

            <div className="space-y-3 pt-1 text-slate-700">
              <textarea
                value={customActivityDesc}
                onChange={(e) => setCustomActivityDesc(e.target.value)}
                placeholder="Describe what you did (e.g., 'Taught local school kids react programming' or 'Organized the department tech test representing 25 teams')..."
                className="w-full text-xs font-semibold p-3.5 border border-slate-200 bg-slate-50/50 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 h-20 transition-all placeholder:text-slate-400"
              />

              <button
                type="button"
                onClick={triggerHiddenSkillsScanner}
                disabled={detectorLoading}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-850 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {detectorLoading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Mining latent trait structures...
                  </>
                ) : (
                  <>
                    <span>Extract Hidden Competencies</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  </>
                )}
              </button>
            </div>

            {/* Detector result card */}
            {detectorResult && !detectorLoading && (
              <div className="bg-slate-50/70 border border-slate-100 p-3.5 rounded-xl space-y-3 font-sans mt-2">
                <span className="text-[10px] font-mono font-bold text-indigo-700 uppercase block">Latent Competency Audit:</span>
                
                <div className="space-y-2.5">
                  {detectorResult.detectedSkills.map((sk, index) => (
                    <div key={index} className="bg-white p-2.5 rounded-lg border border-slate-150/40 space-y-0.5">
                      <div className="flex justify-between items-center text-[10.5px]">
                        <span className="font-bold text-slate-800">{sk.skill}</span>
                        <span className="text-[9px] bg-slate-100 text-slate-650 font-medium px-2 py-0.2 rounded-full">{sk.category}</span>
                      </div>
                      <p className="text-[10px] leading-relaxed text-slate-500">{sk.justification}</p>
                    </div>
                  ))}
                </div>

                <div className="text-[9.5px] italic text-slate-550 border-t border-slate-200/60 pt-2 leading-relaxed">
                  <strong>Career Pro Tip:</strong> {detectorResult.professionalAdvice}
                </div>
              </div>
            )}
          </div>

          {/* MODULE 6: CAREER MOMENTUM & REGRET PREDICTOR */}
          <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-xs space-y-5">
            <div className="space-y-1">
              <h3 className="text-base font-display font-bold text-slate-900 flex items-center gap-2">
                <Flame className="w-5 h-5 text-indigo-600" />
                Consistency & Regret Predictor
              </h3>
              <p className="text-xs text-slate-500">
                Checking your active focus consistency parameters and flagging neglected prep categories.
              </p>
            </div>

            {/* Momentum gauge stats */}
            <div className="bg-indigo-50/20 border border-indigo-100/40 p-4 rounded-2xl relative">
              <div className="flex justify-between items-center mb-1 font-mono text-[10px] text-indigo-800">
                <span className="uppercase font-bold">CONSISTENCY SCORE</span>
                <span>{momentum.momentumPercentage}%</span>
              </div>
              
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden mb-3">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full" style={{ width: `${momentum.momentumPercentage}%` }} />
              </div>

              <div className="grid grid-cols-3 gap-1 divide-x divide-indigo-100/40 text-center font-sans">
                <div>
                  <span className="text-[9px] text-slate-400 block">Risk of Burnout</span>
                  <span className="text-xs font-bold text-orange-650">{momentum.burnoutRisk}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 block">Active Status</span>
                  <span className="text-xs font-bold text-indigo-600">{momentum.consistency}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 block">Hours Tracker</span>
                  <span className="text-xs font-bold text-slate-700">{momentum.hoursTracked}h total</span>
                </div>
              </div>
            </div>

            {/* Regret predictor warns */}
            {regrets.length > 0 ? (
              <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl space-y-2.5 font-sans">
                <h5 className="text-xs font-bold text-rose-900 flex items-center gap-1.5 leading-none">
                  <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                  Regret Risk Prognosis
                </h5>
                <ul className="text-[10.5px] text-rose-800 leading-relaxed space-y-2 list-inside list-disc pl-1">
                  {regrets.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl font-sans text-xs flex gap-2 text-emerald-800">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <strong className="block">All preparation bases coverage active!</strong>
                  <span className="text-[10.5px] mt-0.5 block text-emerald-650">You are addressing both DSA practice and packaging requirements with zero blindspots.</span>
                </div>
              </div>
            )}
          </div>

          {/* MODULE 5 & MODULE 8: OPPORTUNITY MATCHER & COLLABORATION SCORE */}
          <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-xs space-y-6">
            
            {/* COLLABORATION SCORE BOX */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-slate-900 font-sans">
                <h4 className="text-xs.5 font-bold flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-indigo-600" />
                  Teamwork & Collaboration Score
                </h4>
                <span className="text-xs font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full">
                  Score: {collabScore}/100
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-sans leading-relaxed">
                Aggregates contributions to Open-source libraries, college club management, or team projects tracked in your cards.
              </p>
              
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-indigo-500 h-full" style={{ width: `${collabScore}%` }} />
              </div>
              <div className="flex justify-between text-[9px] text-slate-400 font-mono">
                <span>0 Solo</span>
                <span>Active Peer Contribution</span>
                <span>100 Full Scale</span>
              </div>
            </div>

            {/* OPPORTUNITY MATCHES */}
            <div className="border-t border-slate-100 pt-5 space-y-3.5">
              <h4 className="text-xs.5 font-bold text-slate-900 font-sans flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-500" />
                Matched Target Opportunities
              </h4>
              
              <div className="space-y-2 font-sans text-xs">
                
                <div className="p-3 border border-slate-100 hover:border-indigo-100 bg-slate-50/50 rounded-2xl flex justify-between items-center text-left">
                  <div>
                    <h5 className="font-bold text-slate-800">Undergrad ML Operations Engineer</h5>
                    <span className="text-[10px] text-indigo-600 font-semibold font-mono block mt-0.5">Google Engineering Intern • USA Remote</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold bg-indigo-100 text-indigo-900 px-2 py-0.5 rounded-full shrink-0">
                    94% Match
                  </span>
                </div>

                <div className="p-3 border border-slate-100 hover:border-violet-100 bg-slate-50/50 rounded-2xl flex justify-between items-center text-left">
                  <div>
                    <h5 className="font-bold text-slate-800">Campus Technology Evangelist</h5>
                    <span className="text-[10px] text-violet-600 font-semibold font-mono block mt-0.5">Intel Student Ambassador Program</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold bg-violet-100 text-violet-950 px-2 py-0.5 rounded-full shrink-0">
                    88% Match
                  </span>
                </div>

                <div className="p-3 border border-slate-100 hover:border-slate-200 bg-slate-50/50 rounded-2xl flex justify-between items-center text-left">
                  <div>
                    <h5 className="font-bold text-slate-800">Smart Grid Energy Hackathon</h5>
                    <span className="text-[10px] text-amber-600 font-semibold font-mono block mt-0.5">GDG Global Buildathon Challenger</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full shrink-0">
                    82% Match
                  </span>
                </div>

              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
