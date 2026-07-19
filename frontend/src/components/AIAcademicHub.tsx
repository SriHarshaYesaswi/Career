import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useCareer } from '../context/CareerContext';
import { apiUrl } from '../utils/api';
import { 
  Sparkles, 
  Brain, 
  BookOpen, 
  DollarSign, 
  TrendingUp, 
  FileText, 
  Search, 
  Plus, 
  Trash2, 
  Calendar, 
  HelpCircle, 
  Lightbulb, 
  CheckCircle, 
  Clock, 
  User, 
  ChevronRight, 
  Upload, 
  Percent, 
  Target, 
  GraduationCap, 
  BookMarked,
  ArrowRight,
  PieChart as PieIcon,
  ShieldCheck,
  Zap,
  Edit,
  Save,
  RefreshCw
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface PredictedTopic {
  topicName: string;
  probability: number;
  reason: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | string;
}

interface PredictedQuestion {
  question: string;
  weightage: number;
  markingScheme: string;
}

interface ExamPredictorResult {
  predictedFocusTopics: PredictedTopic[];
  samplePredictedQuestions: PredictedQuestion[];
  studyStrategyTip: string;
}

interface LearningPathWeek {
  weekRange: string;
  focus: string;
  tasks: string[];
  resources: string[];
}

interface LearningPathResult {
  recommendedPathName: string;
  weeks: LearningPathWeek[];
  suggestedBooks: string[];
  freeOnlineCourses: { title: string; platform: string }[];
}

interface DigitalTwinResult {
  readinessScore: number;
  strengths: string[];
  coreWeaknesses: string[];
  gapAnalysis: string;
  directRecommendations: string[];
}

interface ATSResult {
  atsScore: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  suggestionBulletPoints: string[];
}

interface ExpenseItem {
  id: string;
  title: string;
  amount: number;
  category: 'Food' | 'Transport' | 'Books' | 'Entertainment' | 'Subscriptions' | 'Rent' | 'Other';
  date: string;
}

export const AIAcademicHub: React.FC = () => {
  const { courses, projects, skills, goals, currentUser, triggerNotification } = useCareer();

  // Primary Workspace Sub-Tabs
  const [activeSegment, setActiveSegment] = useState<'twin' | 'notes' | 'tutor' | 'predictor' | 'roadmap' | 'ats' | 'finance'>('twin');

  // Loading indicator
  const [loading, setLoading] = useState(false);

  // -------------------------------------------------------------
  // 1. STUDENT DIGITAL TWIN STATE & ACTIONS
  // -------------------------------------------------------------
  const [twinData, setTwinData] = useState<DigitalTwinResult | null>(null);
  
  // Interactive Manual/Human Update overrides states
  const [isManualEdit, setIsManualEdit] = useState(false);
  const [editScore, setEditScore] = useState<number>(80);
  const [editGapAnalysis, setEditGapAnalysis] = useState<string>('');
  const [editStrengths, setEditStrengths] = useState<string[]>([]);
  const [editWeaknesses, setEditWeaknesses] = useState<string[]>([]);
  const [editRecs, setEditRecs] = useState<string[]>([]);
  
  const [newStrengthInput, setNewStrengthInput] = useState('');
  const [newWeaknessInput, setNewWeaknessInput] = useState('');
  const [newRecInput, setNewRecInput] = useState('');

  const fetchDigitalTwin = async () => {
    setLoading(true);
    try {
      const response = await fetch(apiUrl('/api/ai/digital-twin'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentProfile: currentUser,
          academics: courses,
          projects: projects,
          goals: goals,
          skills: skills
        })
      });
      const data = await response.json();
      setTwinData(data);
      localStorage.setItem('career_tracker_digital_twin_custom', JSON.stringify(data));
      triggerNotification('Digital Twin Synced', 'Successfully synchronized your AI Digital Twin state indicators.', 'success');
    } catch (e) {
      triggerNotification('Sync Failed', 'Failed to reach AI Digital Twin API endpoint.', 'warning');
    } finally {
      setLoading(false);
    }
  };

  const startManualEditing = () => {
    if (twinData) {
      setEditScore(twinData.readinessScore);
      setEditGapAnalysis(twinData.gapAnalysis);
      setEditStrengths([...twinData.strengths]);
      setEditWeaknesses([...twinData.coreWeaknesses]);
      setEditRecs([...twinData.directRecommendations]);
    } else {
      setEditScore(80);
      setEditGapAnalysis('Awaiting manual alignment gap assessment.');
      setEditStrengths([]);
      setEditWeaknesses([]);
      setEditRecs([]);
    }
    setIsManualEdit(true);
  };

  const saveManualChanges = () => {
    const updated: DigitalTwinResult = {
      readinessScore: editScore,
      gapAnalysis: editGapAnalysis,
      strengths: editStrengths,
      coreWeaknesses: editWeaknesses,
      directRecommendations: editRecs
    };
    setTwinData(updated);
    localStorage.setItem('career_tracker_digital_twin_custom', JSON.stringify(updated));
    setIsManualEdit(false);
    triggerNotification('Model Updated', 'Successfully persisted your manual twin settings.', 'success');
  };

  useEffect(() => {
    const saved = localStorage.getItem('career_tracker_digital_twin_custom');
    if (saved) {
      try {
        setTwinData(JSON.parse(saved));
      } catch (err) {
        fetchDigitalTwin();
      }
    } else {
      fetchDigitalTwin();
    }
  }, []);

  // -------------------------------------------------------------
  // 2. SMART NOTES GENERATOR STATE & ACTIONS
  // -------------------------------------------------------------
  const [notesTitle, setNotesTitle] = useState('');
  const [notesContent, setNotesContent] = useState('');
  const [notesResult, setNotesResult] = useState<{
    summary: string;
    keyConcepts: { title: string; description: string }[];
    questions: { id: string; question: string; answer: string }[];
    flashcards: { question: string; answer: string }[];
  } | null>(null);

  const handleGenerateNotes = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notesContent.trim()) return;
    setLoading(true);
    try {
      const response = await fetch(apiUrl('/api/ai/notes-generator'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: notesTitle, content: notesContent })
      });
      const data = await response.json();
      setNotesResult(data);
      triggerNotification('Notes Synthesized', 'AI has extracted actionable flashcards and key concepts!', 'success');
    } catch (err) {
      triggerNotification('Notes Generation Error', 'Could not synthesize your notes lectures.', 'warning');
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------------------------------------
  // 3. SOCRATES DOUBT SOLVER CHAT STATE & ACTIONS
  // -------------------------------------------------------------
  const [subjectContext, setSubjectContext] = useState('Computer Science');
  const [doubtQuestion, setDoubtQuestion] = useState('');
  const [chatMessages, setChatMessages] = useState<{sender: 'student' | 'socrates', text: string}[]>([
    { sender: 'socrates', text: "Salutations! I am Socrates College AI tutor. Ask me any rigorous scientific, mathematical, or coding doubt and we will solve it together." }
  ]);

  const handleAskSocrates = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!doubtQuestion.trim()) return;

    const userMsg = doubtQuestion;
    setChatMessages(prev => [...prev, { sender: 'student', text: userMsg }]);
    setDoubtQuestion('');
    setLoading(true);

    try {
      const response = await fetch(apiUrl('/api/ai/doubt-solver'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: userMsg, subjectContext })
      });
      const data = await response.json();
      setChatMessages(prev => [...prev, { sender: 'socrates', text: data.answer }]);
    } catch (err) {
      setChatMessages(prev => [...prev, { sender: 'socrates', text: "**Error**: Socrates is contemplating offline. Verify your internet link or database parameters." }]);
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------------------------------------
  // 4. EXAM PREDICTOR STATE & ACTIONS
  // -------------------------------------------------------------
  const [selectedCourseIdx, setSelectedCourseIdx] = useState(0);
  const [weightsText, setWeightsText] = useState('Focus weights: 40% midterm coding assessments, 60% complex theory compilation graphs.');
  const [prediction, setPrediction] = useState<ExamPredictorResult | null>(null);

  const handlePredictExam = async () => {
    const activeCourse = courses[selectedCourseIdx];
    if (!activeCourse) return;
    setLoading(true);
    try {
      const response = await fetch(apiUrl('/api/ai/exam-predictor'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseCode: activeCourse.code,
          courseName: activeCourse.name,
          previousWeightsText: weightsText
        })
      });
      const data = await response.json();
      setPrediction(data);
      triggerNotification('Exam Prediction Ready', 'Assessed high-probability topics for upcoming exams.', 'success');
    } catch (e) {
      triggerNotification('Assessment Failed', 'Unable to calculate syllabus weight projections.', 'warning');
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------------------------------------
  // 5. LEARNING PATH / SMART RESOURCE HUB STATE & ACTIONS
  // -------------------------------------------------------------
  const [targetGoalText, setTargetGoalText] = useState('Full Stack JavaScript Engineer & AWS Solutions Architect');
  const [targetWeaknessText, setTargetWeaknessText] = useState('Relational math and Compiler finite state automata algorithms');
  const [learningPath, setLearningPath] = useState<LearningPathResult | null>(null);

  const handleGeneratePath = async () => {
    setLoading(true);
    try {
      const skillsJoined = skills.map(s => `${s.name} (level ${s.currentLevel}/5)`).join(', ');
      const response = await fetch(apiUrl('/api/ai/learning-path'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          careerGoal: targetGoalText,
          skillsText: skillsJoined,
          weakSubjects: targetWeaknessText
        })
      });
      const data = await response.json();
      setLearningPath(data);
      triggerNotification('Path Map Crafted', 'Your custom weekly study roadmap blocks have generated.', 'success');
    } catch (err) {
      triggerNotification('Roadmap Failed', 'Could not compile custom skill milestones.', 'warning');
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------------------------------------
  // 6. ATS RESUME KEYWORD SCANNER STATE & ACTIONS
  // -------------------------------------------------------------
  const [resumePaste, setResumePaste] = useState('');
  const [targetJobRole, setTargetJobRole] = useState('Frontend Developer Co-op Intern');
  const [atsScore, setAtsScore] = useState<ATSResult | null>(null);

  const handleScanResume = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resumePaste.trim()) return;
    setLoading(true);
    try {
      const response = await fetch(apiUrl('/api/ai/resume-scanner'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeText: resumePaste, targetJobRole })
      });
      const data = await response.json();
      setAtsScore(data);
      triggerNotification('Resume Assessment Complete', 'Scanned resume items against real recruiting keywords.', 'success');
    } catch (e) {
      triggerNotification('ATS Offline', 'An error occurred during resume index scanner operations.', 'warning');
    } finally {
      setLoading(false);
    }
  };

  // Pre-fill Harsha's default details for ease of testing
  useEffect(() => {
    if (currentUser) {
      setResumePaste(`Name: ${currentUser.name}\nProfile: ${currentUser.profession}\nEducation: ${currentUser.currentEducation}\nSkills: ${currentUser.skills.join(', ')}\nProjects:\n- Student OS Tracker in React & Tailwind\n- Credentials Timeline pipeline`);
    }
  }, [currentUser]);

  // -------------------------------------------------------------
  // 7. FINANCIAL TRACKER STATE & ACTIONS
  // -------------------------------------------------------------
  const [piggyIncome, setPiggyIncome] = useState(200); // pocket money
  const [stipendIncome, setStipendIncome] = useState(1200); // internship stipend 
  const [scholarshipIncome, setScholarshipIncome] = useState(500); // stipends

  const [expenses, setExpenses] = useState<ExpenseItem[]>([
    { id: 'exp_1', title: 'Calculus Advanced Textbook', amount: 55, category: 'Books', date: new Date().toISOString().split('T')[0] },
    { id: 'exp_2', title: 'Subway Sandwich Lunch', amount: 15, category: 'Food', date: new Date().toISOString().split('T')[0] },
    { id: 'exp_3', title: 'City Metro Transit Smartcard', amount: 30, category: 'Transport', date: new Date().toISOString().split('T')[0] },
    { id: 'exp_4', title: 'Shared Server Hosting Subscription', amount: 12, category: 'Subscriptions', date: new Date().toISOString().split('T')[0] },
    { id: 'exp_5', title: 'Weekly Groceries Bulk', amount: 65, category: 'Food', date: new Date().toISOString().split('T')[0] }
  ]);

  // Expense form fields
  const [expTitle, setExpTitle] = useState('');
  const [expAmount, setExpAmount] = useState('');
  const [expCat, setExpCat] = useState<ExpenseItem['category']>('Food');

  const addExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expTitle || !expAmount) return;
    const item: ExpenseItem = {
      id: 'exp_' + Date.now(),
      title: expTitle,
      amount: parseFloat(expAmount),
      category: expCat,
      date: new Date().toISOString().split('T')[0]
    };
    const nextList = [...expenses, item];
    setExpenses(nextList);
    setExpTitle('');
    setExpAmount('');
    triggerNotification('Expense Added', `Logged $${item.amount} under ${item.category}`, 'info');
  };

  const removeExpense = (id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
  };

  const totalMonthlyIncome = piggyIncome + stipendIncome + scholarshipIncome;
  const totalMonthlySpend = expenses.reduce((sum, e) => sum + e.amount, 0);
  const remainingSavings = totalMonthlyIncome - totalMonthlySpend;

  // Aggregate stats for chart
  const categoriesList: ExpenseItem['category'][] = ['Food', 'Transport', 'Books', 'Entertainment', 'Subscriptions', 'Rent', 'Other'];
  const chartData = categoriesList.map(cat => {
    const total = expenses.filter(e => e.category === cat).reduce((sum, e) => sum + e.amount, 0);
    return { name: cat, Amount: total };
  });

  const getReadinessBadge = (score: number) => {
    if (score >= 85) return 'Enterprise Prepared';
    if (score >= 70) return 'Highly Competitive';
    return 'Building Foundations';
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 shadow-xs transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-sm">
            <Brain className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="font-display font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
              AI Academic Hub & Student OS Tools <span className="text-[10px] bg-indigo-100 dark:bg-indigo-950/40 text-indigo-805 dark:text-indigo-305 font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">Active</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Autonomous predictions, Doubt assistance, and advanced personal analytics scanners.</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5 bg-slate-100 dark:bg-slate-955 p-1.5 rounded-2xl">
          <button 
            onClick={() => setActiveSegment('twin')} 
            className={`cursor-pointer px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${activeSegment === 'twin' ? 'bg-indigo-600 dark:bg-indigo-500 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
          >
            Digital Twin
          </button>
          <button 
            onClick={() => setActiveSegment('notes')} 
            className={`cursor-pointer px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${activeSegment === 'notes' ? 'bg-indigo-600 dark:bg-indigo-500 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
          >
            Smart Notes
          </button>
          <button 
            onClick={() => setActiveSegment('tutor')} 
            className={`cursor-pointer px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${activeSegment === 'tutor' ? 'bg-indigo-600 dark:bg-indigo-500 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
          >
            Doubt Solver
          </button>
          <button 
            onClick={() => setActiveSegment('predictor')} 
            className={`cursor-pointer px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${activeSegment === 'predictor' ? 'bg-indigo-600 dark:bg-indigo-500 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
          >
            Exam Predictor
          </button>
          <button 
            onClick={() => setActiveSegment('roadmap')} 
            className={`cursor-pointer px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${activeSegment === 'roadmap' ? 'bg-indigo-600 dark:bg-indigo-500 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
          >
            Path Gen
          </button>
          <button 
            onClick={() => setActiveSegment('ats')} 
            className={`cursor-pointer px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${activeSegment === 'ats' ? 'bg-indigo-600 dark:bg-indigo-500 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
          >
            ATS Resume
          </button>
          <button 
            onClick={() => setActiveSegment('finance')} 
            className={`cursor-pointer px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${activeSegment === 'finance' ? 'bg-indigo-600 dark:bg-indigo-500 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
          >
            Cash Tracker
          </button>
        </div>
      </div>

      {loading && (
        <div className="w-full h-1 bg-indigo-100 rounded-full overflow-hidden relative">
          <div className="absolute inset-y-0 left-0 w-1/3 bg-indigo-600 rounded-full animate-infinite-loading" />
        </div>
      )}

      {/* 2. Primary Layout Segment Switcher */}
      <AnimatePresence mode="wait">
        <motion.div 
          key={activeSegment}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.15 }}
          className="grid grid-cols-1 gap-6"
        >
          
          {/* ========================================================= */}
          {/* A. STUDENT DIGITAL TWIN INTERACTIVE MODEL */}
          {/* ========================================================= */}
          {activeSegment === 'twin' && (
            <div className="space-y-6">
              
              {/* Manual/Human Update Process Toggle Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-indigo-50/65 dark:bg-indigo-950/20 border border-indigo-100/50 dark:border-indigo-900/40 rounded-2xl p-4.5 shadow-2xs">
                <div>
                  <span className="text-[10px] bg-indigo-150 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider font-mono">
                    Model Customization Mode
                  </span>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                    {isManualEdit 
                      ? "Human Customization View: Direct control over prepared indicators list items & gap assessment statement."
                      : "Dual Sync Control: Choose automated AI parsing or manually configure metrics representing your career state."}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  {!isManualEdit ? (
                    <>
                      <button
                        onClick={startManualEditing}
                        className="cursor-pointer bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-805 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                      >
                        <Edit className="w-3.5 h-3.5 text-indigo-650 dark:text-indigo-400" /> Customize Manually
                      </button>
                      <button
                        onClick={fetchDigitalTwin}
                        className="cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-4 py-2 text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm shadow-indigo-100 dark:shadow-none"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Synchronize AI Twin
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => setIsManualEdit(false)}
                        className="cursor-pointer bg-white hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-xs font-bold transition-all"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={saveManualChanges}
                        className="cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-4.5 py-2 text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm shadow-emerald-105"
                      >
                        <Save className="w-3.5 h-3.5" /> Save Overrides
                      </button>
                    </>
                  )}
                </div>
              </div>

              {!isManualEdit ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    
                    {/* Visual score block */}
                    <div className="bg-slate-900 rounded-3xl p-6 text-white flex flex-col justify-between border border-slate-850 relative overflow-hidden shadow-md">
                      <div className="absolute -right-16 -bottom-16 w-48 h-48 rounded-full bg-indigo-600/10 blur-xl pointer-events-none" />
                      <div className="space-y-3 relative z-10">
                        <span className="text-[10px] bg-indigo-600/30 text-indigo-300 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider font-mono">
                          Calculated Model Identity
                        </span>
                        <h3 className="font-display font-semibold text-lg">Student Digital Twin</h3>
                        <p className="text-xs text-slate-400">Dynamic benchmark model aggregating metrics representing college placement readiness.</p>
                      </div>
                      
                      <div className="py-6 flex justify-center relative items-center">
                        <div className="relative flex items-center justify-center w-36 h-36 rounded-full border-4 border-indigo-950">
                          <div className="text-center">
                            <span className="block font-sans font-extrabold text-4xl text-indigo-400 tracking-tight font-mono">
                              {twinData?.readinessScore || 80}%
                            </span>
                            <span className="text-[9px] uppercase tracking-widest text-slate-500 font-bold font-mono">
                              Prepared Index
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2 relative z-10">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-400">Status tier:</span>
                          <span className="text-emerald-400 font-bold">{getReadinessBadge(twinData?.readinessScore || 80)}</span>
                        </div>
                        <button 
                          onClick={fetchDigitalTwin} 
                          className="cursor-pointer w-full text-center bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-2.5 text-xs font-bold text-slate-200 transition-all flex items-center justify-center gap-1.5"
                        >
                          <Zap className="w-3.5 h-3.5" /> Synchronize Twin State
                        </button>
                      </div>
                    </div>

                    {/* Strengths & Weaknesses feedback column */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 shadow-xs md:col-span-2 space-y-5">
                      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-indigo-650 dark:text-indigo-400" />
                          <h3 className="font-display font-bold text-sm text-slate-900 dark:text-white">Career Gap & Trajectory Analysis</h3>
                        </div>
                        <span className="text-[9px] bg-slate-105 dark:bg-slate-805 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded font-mono font-bold">GEMINI COGNITIVE SCANNER</span>
                      </div>

                      {twinData ? (
                        <div className="space-y-4 text-xs">
                          <div className="bg-indigo-50/50 dark:bg-indigo-950/20 p-4 border border-indigo-100/50 dark:border-indigo-900/40 rounded-2xl">
                            <h4 className="font-bold text-indigo-900 dark:text-indigo-200 mb-1 flex items-center gap-1.5">
                              <User className="w-3.5 h-3.5" /> Comprehensive Gap Analysis
                            </h4>
                            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{twinData.gapAnalysis}</p>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2.5">
                              <span className="font-bold uppercase tracking-wider text-[10px] text-emerald-600 block">Identified Key Strengths</span>
                              <ul className="space-y-1.5">
                                {twinData.strengths.map((str, i) => (
                                  <li key={i} className="flex items-start gap-2 text-slate-600 leading-snug">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                                    <span>{str}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div className="space-y-2.5">
                              <span className="font-bold uppercase tracking-wider text-[10px] text-amber-600 block">Structural Vulnerabilities</span>
                              <ul className="space-y-1.5">
                                {twinData.coreWeaknesses.map((weak, i) => (
                                  <li key={i} className="flex items-start gap-2 text-slate-600 leading-snug">
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                                    <span>{weak}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="h-44 flex items-center justify-center text-slate-400 text-xs text-center">
                          Click "Synchronize Twin State" to parse your academics index.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Direct Recommendations cards */}
                  {twinData && (
                    <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-xs space-y-4">
                      <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                        <Target className="w-4 h-4 text-indigo-600" />
                        <h3 className="font-display font-bold text-sm text-slate-900">Digital Twin's Direct Recommendations Pipeline</h3>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {twinData.directRecommendations.map((rec, i) => (
                          <div key={i} className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex gap-3">
                            <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm font-mono shrink-0">
                              0{i + 1}
                            </div>
                            <div className="space-y-1 text-xs">
                              <span className="font-semibold text-slate-800 leading-normal block">{rec}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="grid grid-cols-1 gap-6 animate-fade-in text-slate-700">
                  <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6">
                    <div className="border-b border-slate-100 pb-3">
                      <h4 className="font-display font-bold text-sm text-slate-900">Customize Digital Twin Metrics (Human Override)</h4>
                      <p className="text-xs text-slate-500 mt-1">Specify custom performance score matrices, lists, or trajectories.</p>
                    </div>

                    <div className="space-y-4">
                      {/* Prepared Index Slider */}
                      <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase mb-2">
                          Prepared Readiness Index: <span className="font-mono text-indigo-600 font-extrabold text-sm">{editScore}%</span>
                        </label>
                        <div className="flex gap-4 items-center">
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={editScore}
                            onChange={(e) => setEditScore(Number(e.target.value))}
                            className="flex-1 accent-indigo-600 h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer"
                          />
                          <span className="text-xs text-slate-400 font-mono w-12 text-right">{getReadinessBadge(editScore)}</span>
                        </div>
                      </div>

                      {/* Comprehensive Gap Analysis text */}
                      <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">
                          Comprehensive Gap & Trajectory Analysis Statement
                        </label>
                        <textarea
                          rows={4}
                          value={editGapAnalysis}
                          onChange={(e) => setEditGapAnalysis(e.target.value)}
                          placeholder="Flesh out any specific gaps, placement indicators, or timeline alignment points..."
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-sans focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>

                      {/* Strengths and Vulnerabilities Grid Editors */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                        
                        {/* KEY STRENGTHS LIST */}
                        <div className="space-y-3.5">
                          <span className="font-bold uppercase tracking-wider text-[11px] text-emerald-600 block border-b border-slate-100 pb-1.5">
                            Identified Key Strengths Lists ({editStrengths.length})
                          </span>
                          <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                            {editStrengths.map((str, idx) => (
                              <div key={idx} className="flex gap-2 items-center bg-slate-50 p-2.5 rounded-xl border border-slate-105">
                                <input
                                  type="text"
                                  value={str}
                                  onChange={(e) => {
                                    const copy = [...editStrengths];
                                    copy[idx] = e.target.value;
                                    setEditStrengths(copy);
                                  }}
                                  className="flex-1 bg-transparent border-0 p-0 text-xs text-slate-800 focus:ring-0 focus:outline-none font-medium"
                                />
                                <button
                                  type="button"
                                  onClick={() => setEditStrengths(editStrengths.filter((_, i) => i !== idx))}
                                  className="cursor-pointer text-slate-450 hover:text-red-650 p-1"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                          
                          <div className="flex gap-1.5">
                            <input
                              type="text"
                              value={newStrengthInput}
                              onChange={(e) => setNewStrengthInput(e.target.value)}
                              placeholder="Insert a key skill strength..."
                              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-850"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  if (newStrengthInput.trim()) {
                                    setEditStrengths([...editStrengths, newStrengthInput.trim()]);
                                    setNewStrengthInput('');
                                  }
                                }
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => {
                                if (newStrengthInput.trim()) {
                                  setEditStrengths([...editStrengths, newStrengthInput.trim()]);
                                  setNewStrengthInput('');
                                }
                              }}
                              className="cursor-pointer bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-150 rounded-xl px-4 text-xs font-bold transition-all"
                            >
                              Add
                            </button>
                          </div>
                        </div>

                        {/* STRUCTURAL VULNERABILITIES LIST */}
                        <div className="space-y-3.5">
                          <span className="font-bold uppercase tracking-wider text-[11px] text-amber-600 block border-b border-slate-100 pb-1.5">
                            Structural Vulnerabilities Lists ({editWeaknesses.length})
                          </span>
                          <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                            {editWeaknesses.map((weak, idx) => (
                              <div key={idx} className="flex gap-2 items-center bg-slate-50 p-2.5 rounded-xl border border-slate-105">
                                <input
                                  type="text"
                                  value={weak}
                                  onChange={(e) => {
                                    const copy = [...editWeaknesses];
                                    copy[idx] = e.target.value;
                                    setEditWeaknesses(copy);
                                  }}
                                  className="flex-1 bg-transparent border-0 p-0 text-xs text-slate-800 focus:ring-0 focus:outline-none font-medium"
                                />
                                <button
                                  type="button"
                                  onClick={() => setEditWeaknesses(editWeaknesses.filter((_, i) => i !== idx))}
                                  className="cursor-pointer text-slate-450 hover:text-red-650 p-1"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                          
                          <div className="flex gap-1.5">
                            <input
                              type="text"
                              value={newWeaknessInput}
                              onChange={(e) => setNewWeaknessInput(e.target.value)}
                              placeholder="Insert a developmental gap..."
                              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-850"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  if (newWeaknessInput.trim()) {
                                    setEditWeaknesses([...editWeaknesses, newWeaknessInput.trim()]);
                                    setNewWeaknessInput('');
                                  }
                                }
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => {
                                if (newWeaknessInput.trim()) {
                                  setEditWeaknesses([...editWeaknesses, newWeaknessInput.trim()]);
                                  setNewWeaknessInput('');
                                }
                              }}
                              className="cursor-pointer bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-150 rounded-xl px-4 text-xs font-bold transition-all"
                            >
                              Add
                            </button>
                          </div>
                        </div>

                      </div>

                      {/* DIRECT RECOMMENDATIONS EDITOR SECTION */}
                      <div className="space-y-3.5 pt-2">
                        <span className="font-bold uppercase tracking-wider text-[11px] text-indigo-650 block border-b border-slate-100 pb-1.5">
                          Direct Recommendations List ({editRecs.length})
                        </span>
                        <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                          {editRecs.map((rec, idx) => (
                            <div key={idx} className="flex gap-2 items-center bg-slate-50 p-2.5 rounded-xl border border-slate-105">
                              <span className="w-5 h-5 rounded bg-indigo-100 text-indigo-700 font-mono text-[10px] font-bold flex items-center justify-center shrink-0">
                                {idx + 1}
                              </span>
                              <input
                                type="text"
                                value={rec}
                                onChange={(e) => {
                                  const copy = [...editRecs];
                                  copy[idx] = e.target.value;
                                  setEditRecs(copy);
                                }}
                                className="flex-1 bg-transparent border-0 p-0 text-xs text-slate-800 focus:ring-0 focus:outline-none font-medium"
                              />
                              <button
                                type="button"
                                onClick={() => setEditRecs(editRecs.filter((_, i) => i !== idx))}
                                className="cursor-pointer text-slate-450 hover:text-red-650 p-1"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                        
                        <div className="flex gap-1.5">
                          <input
                            type="text"
                            value={newRecInput}
                            onChange={(e) => setNewRecInput(e.target.value)}
                            placeholder="Insert a learning action recommendation..."
                            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-855"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                if (newRecInput.trim()) {
                                  setEditRecs([...editRecs, newRecInput.trim()]);
                                  setNewRecInput('');
                                }
                              }
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (newRecInput.trim()) {
                                setEditRecs([...editRecs, newRecInput.trim()]);
                                setNewRecInput('');
                              }
                            }}
                            className="cursor-pointer bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-150 rounded-xl px-4 text-xs font-bold transition-all"
                          >
                            Add Action
                          </button>
                        </div>
                      </div>

                    </div>

                    {/* Bottom buttons summary */}
                    <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
                      <button
                        type="button"
                        onClick={() => setIsManualEdit(false)}
                        className="cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-5 py-2.5 rounded-xl text-xs transition-all"
                      >
                        Cancel Overrides
                      </button>
                      <button
                        type="button"
                        onClick={saveManualChanges}
                        className="cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-2.5 rounded-xl text-xs transition-all shadow-sm flex items-center gap-1.5"
                      >
                        <Save className="w-4 h-4" /> Save Customized Model
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* ========================================================= */}
          {/* B. SMART NOTES GENERATOR & LECTURE SUMMARY */}
          {/* ========================================================= */}
          {activeSegment === 'notes' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
              <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-xs space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  <h3 className="font-display font-bold text-sm text-slate-900 font-bold">Lecture Text / Course Guidelines Synthesizer</h3>
                </div>
                
                <form onSubmit={handleGenerateNotes} className="space-y-4 text-xs text-slate-700">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Subject or Lecture Heading</label>
                    <input 
                      type="text" 
                      value={notesTitle} 
                      onChange={(e) => setNotesTitle(e.target.value)}
                      placeholder="e.g., Computer Networks - Sliding Window Protocol" 
                      className="w-full bg-slate-50 border border-slate-100 p-2.5 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Lecture Transcription or Textbook Material (Raw Copy/Paste)</label>
                    <textarea 
                      rows={8}
                      value={notesContent} 
                      onChange={(e) => setNotesContent(e.target.value)}
                      placeholder="Paste textbook PDF textbook extract, powerpoint slide titles or transcription records here..." 
                      className="w-full bg-slate-50 border border-slate-100 p-2.5 rounded-xl text-xs text-slate-800 font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    ></textarea>
                  </div>
                  <div className="flex justify-between items-center bg-indigo-50/50 p-2.5 rounded-xl border border-indigo-100/30 text-[10px]">
                    <span className="text-indigo-800 font-medium">Extracts: Summary, flashcards, Q&As, key academic paradigms.</span>
                    <button 
                      type="submit" 
                      className="cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-4.5 py-1.5 font-bold transition-all"
                    >
                      Process Lecture Node
                    </button>
                  </div>
                </form>
              </div>

              {/* Notes Outcome layout */}
              <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-xs space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <span className="font-display font-semibold text-xs text-slate-800 flex items-center gap-1.5">
                    <BookMarked className="w-4 h-4 text-slate-600" /> Synthesized Outcome
                  </span>
                  {notesResult && (
                    <span className="text-[9px] font-bold font-mono bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded">
                      SYNTHESIZED
                    </span>
                  )}
                </div>

                {notesResult ? (
                  <div className="space-y-4 text-xs max-h-[420px] overflow-y-auto pr-1">
                    <div className="space-y-1.5">
                      <span className="font-extrabold uppercase tracking-wider text-[10px] text-indigo-600 block">Lecture Summary</span>
                      <p className="text-slate-600 leading-relaxed bg-slate-50 border p-3 rounded-xl">{notesResult.summary}</p>
                    </div>

                    <div className="space-y-2">
                      <span className="font-extrabold uppercase tracking-wider text-[10px] text-indigo-600 block">Key Core Concepts</span>
                      <div className="grid grid-cols-1 gap-2">
                        {notesResult.keyConcepts.map((item, id) => (
                          <div key={id} className="bg-white border rounded-xl p-3 shadow-2xs">
                            <span className="font-bold text-slate-800 block text-xs mb-0.5">{item.title}</span>
                            <span className="text-slate-500 text-[11px] leading-relaxed block">{item.description}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <span className="font-extrabold uppercase tracking-wider text-[10px] text-indigo-600 block">Extracted Flashcards</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {notesResult.flashcards.map((fc, idx) => (
                          <div key={idx} className="bg-indigo-50/30 border border-indigo-100/50 rounded-xl p-3 flex flex-col justify-between">
                            <span className="font-semibold text-indigo-900 block text-xs">{fc.question}</span>
                            <span className="text-slate-500 text-[11px] mt-2 block border-t border-indigo-100/20 pt-1 leading-snug">{fc.answer}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-64 flex flex-col items-center justify-center text-slate-400 text-xs font-mono space-y-2 text-center p-4">
                    <Upload className="w-10 h-10 text-slate-300 stroke-1" />
                    <span>Paste slides transcriptions and hit run to extract lecture assets autonomously.</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* C. SOCRATES ACADEMIC DOUBT SOLVER CHAT */}
          {/* ========================================================= */}
          {activeSegment === 'tutor' && (
            <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-xs grid grid-cols-1 md:grid-cols-4 gap-6 animate-fade-in">
              
              {/* Tutoring Subject menu */}
              <div className="md:col-span-1 space-y-4">
                <span className="text-xs font-bold uppercase text-slate-400 block border-b pb-2">Academic Subject Context</span>
                <div className="space-y-1 text-xs">
                  {['Computer Science & Engineering', 'DSA Algorithms', 'Discrete Mathematics', 'Physics & Waves', 'Compiler Design', 'System Architecture'].map((sub) => (
                    <button
                      key={sub}
                      onClick={() => setSubjectContext(sub)}
                      className={`cursor-pointer w-full text-left py-2 px-3 rounded-xl transition-all ${
                        subjectContext === sub ? 'bg-indigo-50 border-l-4 border-indigo-600 text-indigo-800 font-bold' : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {sub}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chat frame */}
              <div className="md:col-span-3 flex flex-col h-[400px] justify-between">
                <div className="flex-1 overflow-y-auto space-y-4.5 pr-2 mb-4 scrollbar-thin">
                  {chatMessages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.sender === 'student' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`p-4 rounded-2xl max-w-[85%] text-xs border leading-relaxed ${
                        msg.sender === 'student' 
                          ? 'bg-indigo-600 text-white border-indigo-700 rounded-br-none' 
                          : 'bg-slate-50 text-slate-700 border-slate-100 rounded-bl-none font-mono whitespace-pre-wrap'
                      }`}>
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <span className="font-extrabold text-[10px] uppercase opacity-75">
                            {msg.sender === 'student' ? currentUser?.name || 'Student' : 'Socrates Professor'}
                          </span>
                        </div>
                        <p>{msg.text}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleAskSocrates} className="flex gap-2">
                  <input
                    type="text"
                    value={doubtQuestion}
                    onChange={(e) => setDoubtQuestion(e.target.value)}
                    placeholder="Ask a technical doubt e.g., trace LR(0) states vs LR(1)..."
                    className="flex-1 bg-slate-50 border border-slate-100 p-3 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800"
                  />
                  <button
                    type="submit"
                    className="cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition-all flex items-center gap-1"
                  >
                    Ask
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* D. EXAM PREDICTOR FORECASTS */}
          {/* ========================================================= */}
          {activeSegment === 'predictor' && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-xs grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Selector */}
                <div className="space-y-4 text-xs font-medium">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1.5">Choose Registered Class Course</label>
                    <select
                      value={selectedCourseIdx}
                      onChange={(e) => setSelectedCourseIdx(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-100 p-2.5 rounded-xl text-xs font-bold text-slate-700 focus:outline-none"
                    >
                      {courses.map((cr, idx) => (
                        <option key={cr.id} value={idx}>{cr.code} - {cr.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1.5">Midterm Topics Weights & Extra Guidelines</label>
                    <textarea
                      rows={4}
                      value={weightsText}
                      onChange={(e) => setWeightsText(e.target.value)}
                      placeholder="Paste exam syllabus outline or class weights details..."
                      className="w-full bg-slate-50 border border-slate-100 p-2.5 rounded-xl text-xs font-mono"
                    ></textarea>
                  </div>
                  <button
                    onClick={handlePredictExam}
                    className="cursor-pointer w-full text-center bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-2.5 font-bold text-xs shadow-md shadow-indigo-100 transition-all flex items-center justify-center gap-1.5"
                  >
                    Calculate Syllabus Focus Projections
                  </button>
                </div>

                <div className="md:col-span-2 space-y-4">
                  <div className="flex items-center justify-between border-b pb-2">
                    <span className="font-display font-medium text-xs text-slate-800 flex items-center gap-1">
                      <GraduationCap className="w-4 h-4 text-slate-600" /> Statistical Weight Predictions Outcomes
                    </span>
                    <span className="text-[9px] uppercase font-mono font-bold text-indigo-600">REGISTRAR TEMPLATE SCANNER</span>
                  </div>

                  {prediction ? (
                    <div className="space-y-4 text-xs">
                      {/* Topic weights list */}
                      <div className="space-y-2">
                        <span className="text-[10px] uppercase font-extrabold text-indigo-500">Predicted focus topics weights</span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {prediction.predictedFocusTopics.map((topic, id) => (
                            <div key={id} className="bg-slate-50 border border-slate-100/50 p-3.5 rounded-2xl flex flex-col justify-between">
                              <div>
                                <div className="flex justify-between items-start mb-1">
                                  <span className="font-bold text-slate-800 block text-xs">{topic.topicName}</span>
                                  <span className="text-[8px] tracking-wider uppercase bg-amber-100 border border-amber-200 font-extrabold text-amber-900 rounded px-1.5 py-0.5">
                                    {topic.difficulty}
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-500 leading-normal">{topic.reason}</p>
                              </div>
                              <div className="pt-2 font-mono flex items-center justify-between text-[11px] border-t border-slate-200/50 mt-2 text-indigo-600 font-bold">
                                <span>Exam Probability Score:</span>
                                <span>{topic.probability}%</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Sample Predicted Questions */}
                      <div className="space-y-2.5">
                        <span className="text-[10px] uppercase font-extrabold text-indigo-500">Sample High-Probability Questions</span>
                        <div className="space-y-2">
                          {prediction.samplePredictedQuestions.map((ques, id) => (
                            <div key={id} className="bg-white border rounded-xl p-3 shadow-2xs">
                              <div className="flex justify-between items-center text-xs font-bold text-slate-800 mb-1">
                                <span>Question 0{id + 1}</span>
                                <span className="text-indigo-600 font-mono text-[11px]">{ques.weightage} Marks</span>
                              </div>
                              <p className="text-slate-600 text-[11px] leading-relaxed mb-2 font-mono">{ques.question}</p>
                              <div className="bg-indigo-50/30 p-2.5 border border-indigo-100/30 rounded-lg text-[10px] text-indigo-900 leading-relaxed">
                                <span className="font-bold uppercase tracking-wider block text-[8px] text-indigo-600 mb-0.5">Marking Scheme Evaluation</span>
                                {ques.markingScheme}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="p-3 bg-indigo-50 text-indigo-950 font-medium rounded-xl border border-indigo-100 text-[11px]">
                        <span className="font-bold uppercase text-[9px] text-indigo-700 block mb-0.5">Personal study strategy prediction:</span>
                        {prediction.studyStrategyTip}
                      </div>

                    </div>
                  ) : (
                    <div className="h-44 flex items-center justify-center text-slate-400 text-xs">
                      Enter class weights and launch prognostic generator.
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* E. CAREER PATHWAY & RESOURCE HUB GENERATOR */}
          {/* ========================================================= */}
          {activeSegment === 'roadmap' && (
            <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-xs space-y-6 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Inputs */}
                <div className="space-y-4 text-xs font-medium">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1.5">Ultimate Career Target / Job Role</label>
                    <input
                      type="text"
                      value={targetGoalText}
                      onChange={(e) => setTargetGoalText(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-100 p-2.5 rounded-xl text-xs text-slate-800 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1.5">Weak Subject Matters or Struggles</label>
                    <input
                      type="text"
                      value={targetWeaknessText}
                      onChange={(e) => setTargetWeaknessText(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-100 p-2.5 rounded-xl text-xs text-slate-800 focus:outline-none"
                    />
                  </div>
                  <button
                    onClick={handleGeneratePath}
                    className="cursor-pointer w-full text-center bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-2.5 font-bold text-xs shadow-md transition-all"
                  >
                    Compile Custom Learning Path
                  </button>
                </div>

                {/* Outcomes layout */}
                <div className="md:col-span-2 space-y-4">
                  <div className="flex items-center justify-between border-b pb-2">
                    <span className="font-display font-medium text-xs text-slate-800">
                      Smart Learning Path Timeline
                    </span>
                    <span className="text-[9px] uppercase font-mono font-extrabold text-indigo-600">SYLLABUS GRAPH GENERATOR</span>
                  </div>

                  {learningPath ? (
                    <div className="space-y-4 text-xs">
                      <h4 className="font-display font-bold text-slate-900 border-l-4 border-indigo-600 pl-2">{learningPath.recommendedPathName}</h4>
                      
                      <div className="space-y-3">
                        {learningPath.weeks.map((wk, idx) => (
                          <div key={idx} className="bg-slate-50 border p-3 rounded-2xl relative">
                            <span className="absolute top-3 right-3 text-[10px] font-mono font-extrabold text-indigo-600">{wk.weekRange}</span>
                            <h5 className="font-bold text-slate-800 mb-1.5">{wk.focus}</h5>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] pt-1">
                              <div>
                                <span className="font-bold uppercase text-[8px] text-slate-400 block mb-1">Assigned Skills Milestones</span>
                                <ul className="space-y-1 list-disc pl-4 text-slate-600">
                                  {wk.tasks.map((task, id) => <li key={id}>{task}</li>)}
                                </ul>
                              </div>
                              <div>
                                <span className="font-bold uppercase text-[8px] text-indigo-400 block mb-1">Tailored Syllabus Resources</span>
                                <ul className="space-y-1 list-disc pl-4 text-indigo-950 font-semibold">
                                  {wk.resources.map((res, id) => <li key={id}>{res}</li>)}
                                </ul>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                        <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100/50">
                          <span className="font-bold uppercase text-[9px] text-indigo-700 block mb-1">Must-Read Core Books</span>
                          <ul className="space-y-1 text-slate-700 list-inside list-decimal leading-snug">
                            {learningPath.suggestedBooks.map((bk, i) => <li key={i}>{bk}</li>)}
                          </ul>
                        </div>
                        <div className="p-3 bg-emerald-50/40 rounded-xl border border-emerald-150/40">
                          <span className="font-bold uppercase text-[9px] text-emerald-800 block mb-1">Free Industry Courses Linked</span>
                          <ul className="space-y-1 list-inside list-disc text-slate-700 leading-snug">
                            {learningPath.freeOnlineCourses.map((crs, i) => (
                              <li key={i}>
                                <strong>{crs.title}</strong> ({crs.platform})
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                    </div>
                  ) : (
                    <div className="h-44 flex items-center justify-center text-slate-400 text-xs">
                      State your targets and generate a structured course outline.
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* F. ATS RESUME SCANNER & KEYWORDS MATCHING */}
          {/* ========================================================= */}
          {activeSegment === 'ats' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in block">
              <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-xs space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  <h3 className="font-display font-bold text-sm text-slate-900 font-bold">ATS Resume Scanner / Optimization Tool</h3>
                </div>
                
                <form onSubmit={handleScanResume} className="space-y-4 text-xs text-slate-700">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Target Role Category Name</label>
                    <input 
                      type="text" 
                      value={targetJobRole} 
                      onChange={(e) => setTargetJobRole(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-100 p-2.5 rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Paste Your Resume Details (Text formatting)</label>
                    <textarea 
                      rows={8}
                      value={resumePaste} 
                      onChange={(e) => setResumePaste(e.target.value)}
                      placeholder="Paste resume body copy here representing your skills, academics and credentials..." 
                      className="w-full bg-slate-50 border border-slate-100 p-2.5 rounded-xl text-xs font-mono"
                    ></textarea>
                  </div>
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-slate-500">Auto-scans technical matches, gaps, and lists direct review feedback.</span>
                    <button 
                      type="submit" 
                      className="cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-5 py-2 font-bold transition-all"
                    >
                      Scan CV Profile
                    </button>
                  </div>
                </form>
              </div>

              {/* ATS Outcomes representation */}
              <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-xs space-y-5">
                <div className="flex items-center justify-between border-b pb-3">
                  <span className="font-display font-semibold text-xs text-slate-800">
                    ATS Recruiter Review Verdict
                  </span>
                  {atsScore && (
                    <div className="flex items-center gap-2 font-mono text-xs">
                      <span className="text-indigo-600 font-extrabold">Overall Score:</span>
                      <span className="bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded font-extrabold">{atsScore.atsScore}%</span>
                    </div>
                  )}
                </div>

                {atsScore ? (
                  <div className="space-y-4 text-xs">
                    
                    <div className="space-y-2">
                      <span className="text-[10px] uppercase font-bold text-emerald-600 tracking-wider">Matched Keywords Found</span>
                      <div className="flex flex-wrap gap-1.5">
                        {atsScore.matchedKeywords.map((kw, i) => (
                          <span key={i} className="bg-emerald-50 text-emerald-800 border border-emerald-100 text-[10px] font-semibold px-2.5 py-1 rounded-lg">
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <span className="text-[10px] uppercase font-bold text-amber-600 tracking-wider">Missing Recruiter Keywords</span>
                      <div className="flex flex-wrap gap-1.5">
                        {atsScore.missingKeywords.map((kw, i) => (
                          <span key={i} className="bg-amber-50 text-amber-800 border border-amber-100 text-[10px] font-semibold px-2.5 py-1 rounded-lg">
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2 pt-1">
                      <span className="text-[10px] uppercase font-bold text-indigo-600 tracking-wider block">Actionable Optimization Tips</span>
                      <ul className="space-y-1.5 pl-4 list-decimal leading-relaxed text-slate-650">
                        {atsScore.suggestionBulletPoints.map((tip, idx) => (
                          <li key={idx} className="text-slate-600">{tip}</li>
                        ))}
                      </ul>
                    </div>

                  </div>
                ) : (
                  <div className="h-64 flex flex-col items-center justify-center text-slate-400 text-xs text-center space-y-2">
                    <ShieldCheck className="w-10 h-10 text-slate-300 stroke-1" />
                    <span>Run ATS profiles scans to verify CV benchmark compatibility.</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* G. FINANCIAL TRACKER / EXPENSES ENGINE */}
          {/* ========================================================= */}
          {activeSegment === 'finance' && (
            <div className="space-y-6 animate-fade-in block">
              
              {/* Financial Dashboard Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="bg-slate-50 border p-4 rounded-2xl">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Monthly Net Income</span>
                  <span className="text-2xl font-bold text-slate-800 font-mono">${totalMonthlyIncome}</span>
                </div>
                <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl">
                  <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wider block">Aggregate Expenditure</span>
                  <span className="text-2xl font-bold text-rose-700 font-mono">${totalMonthlySpend}</span>
                </div>
                <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl">
                  <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider block">Remaining Balance</span>
                  <span className="text-2xl font-bold text-emerald-700 font-mono">${remainingSavings}</span>
                </div>
                <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-2xl flex flex-col justify-between">
                  <span className="text-[10px] font-bold text-indigo-500 uppercase block">Saving Rate Score</span>
                  <span className="text-2xl font-extrabold text-indigo-800 font-mono">
                    {totalMonthlyIncome > 0 ? Math.round((remainingSavings / totalMonthlyIncome) * 100) : 0}%
                  </span>
                </div>
              </div>

              {/* Transactions layout */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* 1. Incomes inputs Form */}
                <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-xs space-y-4">
                  <div className="flex items-center gap-2 border-b pb-2">
                    <DollarSign className="w-4 h-4 text-emerald-500" />
                    <h4 className="font-display font-extrabold text-xs text-slate-800 uppercase">Incoming Balances scheduler</h4>
                  </div>
                  <div className="space-y-3.5 text-xs">
                    <div>
                      <label className="block text-slate-500 mb-1">Monthly Pocket Money ($)</label>
                      <input 
                        type="number" 
                        value={piggyIncome} 
                        onChange={(e) => setPiggyIncome(Number(e.target.value))}
                        className="w-full bg-slate-50 border p-2 rounded-xl text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-500 mb-1">Internship Stipends ($)</label>
                      <input 
                        type="number" 
                        value={stipendIncome} 
                        onChange={(e) => setStipendIncome(Number(e.target.value))}
                        className="w-full bg-slate-50 border p-2 rounded-xl text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-500 mb-1">Academic Scholarships ($)</label>
                      <input 
                        type="number" 
                        value={scholarshipIncome} 
                        onChange={(e) => setScholarshipIncome(Number(e.target.value))}
                        className="w-full bg-slate-50 border p-2 rounded-xl text-xs font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Expense Input + List */}
                <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-xs space-y-4">
                  <div className="flex items-center gap-2 border-b pb-2">
                    <Plus className="w-4 h-4 text-rose-500" />
                    <h4 className="font-display font-extrabold text-xs text-slate-800 uppercase">Record Student Expense</h4>
                  </div>
                  <form onSubmit={addExpense} className="space-y-3 text-xs">
                    <div>
                      <label className="block text-slate-500 mb-0.5">Item / Title</label>
                      <input 
                        type="text" 
                        value={expTitle} 
                        onChange={(e) => setExpTitle(e.target.value)}
                        placeholder="e.g., Campus Lunch Combo" 
                        className="w-full bg-slate-50 border border-slate-100 p-2 rounded-lg text-xs"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-slate-500 mb-0.5">Amount ($)</label>
                        <input 
                          type="number" 
                          value={expAmount} 
                          onChange={(e) => setExpAmount(e.target.value)}
                          placeholder="15.50"
                          className="w-full bg-slate-50 border p-2 rounded-lg text-xs font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-500 mb-0.5">Category</label>
                        <select 
                          value={expCat} 
                          onChange={(e) => setExpCat(e.target.value as any)}
                          className="w-full bg-slate-50 border p-2 rounded-lg text-xs font-semibold"
                        >
                          <option value="Food">Food</option>
                          <option value="Transport">Transport</option>
                          <option value="Books">Books</option>
                          <option value="Entertainment">Entertainment</option>
                          <option value="Subscriptions">Subscriptions</option>
                          <option value="Rent">Rent</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>
                    <button 
                      type="submit"
                      className="cursor-pointer w-full text-center bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg py-2 font-bold transition-all"
                    >
                      Log Expense
                    </button>
                  </form>
                </div>

                {/* 3. Expense Ledger details */}
                <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-xs space-y-4">
                  <div className="flex items-center gap-2 border-b pb-2">
                    <TrendingUp className="w-4 h-4 text-slate-700" />
                    <h4 className="font-display font-extrabold text-xs text-slate-800 uppercase">Expense ledger & Breakdown</h4>
                  </div>
                  
                  {/* Miniature Recharts bar display */}
                  <div className="h-32 w-full pt-1">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <XAxis dataKey="name" tick={{ fontSize: 8 }} axisLine={false} tickLine={false} />
                        <YAxis hide />
                        <Tooltip />
                        <Bar dataKey="Amount" radius={[4, 4, 0, 0]}>
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.Amount > 50 ? '#6366f1' : '#a5b4fc'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="space-y-2 max-h-[140px] overflow-y-auto text-xs pr-1">
                    {expenses.map(e => (
                      <div key={e.id} className="flex justify-between items-center bg-slate-50 p-2 rounded-xl text-[11px]">
                        <div>
                          <span className="font-bold text-slate-800 block">{e.title}</span>
                          <span className="text-slate-400 text-[10px] font-mono">{e.category} | {e.date}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-rose-600 font-mono">-${e.amount}</span>
                          <button 
                            onClick={() => removeExpense(e.id)} 
                            className="cursor-pointer text-slate-400 hover:text-rose-500 transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                </div>

              </div>
            </div>
          )}

        </motion.div>
      </AnimatePresence>

    </div>
  );
};
