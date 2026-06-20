/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { useCareer } from '../context/CareerContext';
import { ActivityCategory, PriorityLevel } from '../types';
import { 
  Timer as TimerIcon, 
  Play, 
  Pause, 
  RotateCcw, 
  SkipForward, 
  CheckCircle2, 
  BookOpen, 
  Plus, 
  Trash2, 
  Copy, 
  RotateCw, 
  Award,
  Sparkles,
  Layers,
  ChevronRight,
  Bookmark,
  Check,
  AlertCircle
} from 'lucide-react';

interface Flashcard {
  id: string;
  category: string;
  question: string;
  answer: string;
  status: 'Mastered' | 'Needs Practice' | 'Unstudied';
}

interface StickyNote {
  id: string;
  text: string;
  color: 'yellow' | 'blue' | 'emerald' | 'lavender' | 'rose';
  createdAt: string;
}

const PRE_SEEDED_FLASHCARDS: Flashcard[] = [
  {
    id: 'fc_1',
    category: 'Data Structures & Alg.',
    question: 'What is the runtime and space complexity of Quick Sort, and what is its worst-case scenario?',
    answer: 'Average: O(N log N) time, O(log N) space. Worst Case: O(N²) time when pivot choice results in highly unbalanced splits (e.g. sorted arrays when choosing first/last element as pivot). Can be mitigated using Randomized pivot selection.',
    status: 'Unstudied'
  },
  {
    id: 'fc_2',
    category: 'React & Frontend',
    question: 'How does React 18 Concurrent Rendering and Fiber architecture optimize UI updates?',
    answer: 'Fiber splits render work into small workspaces chunked across animation frames. It allows React to pause, discard, or resume render cycles, ensuring heavy CPU operations do not block user typing/interactions (Prioritizing high-priority user actions).',
    status: 'Unstudied'
  },
  {
    id: 'fc_3',
    category: 'System Design & DB',
    question: 'Explain the CAP Theorem and how databases choose between consistency and availability.',
    answer: 'CAP states a distributed service can guarantee at most two of: Consistency (all nodes see identical data), Availability (every request receives a non-error reply), or Partition Tolerance (survives network drops). Under partition splits, a DB chooses CP or AP.',
    status: 'Unstudied'
  },
  {
    id: 'fc_4',
    category: 'System Design & DB',
    question: 'What is the purpose of database indexes, and how does a B+ Tree index optimize disk reads?',
    answer: 'Indexes provide faster lookups. B+ Trees store keys/pointers in interior nodes and actual records in leaf nodes connected by a linked list. This supports O(log N) range queries with flat levels, matching filesystem block transfer size perfectly.',
    status: 'Unstudied'
  },
  {
    id: 'fc_5',
    category: 'React & Frontend',
    question: 'Describe the virtual DOM and reconciliation algorithm in simple terms.',
    answer: 'The virtual DOM is an in-memory replica of page nodes. When state updates, React creates a new tree, differences it against the old tree (diffing), and carries out minimum required actual DOM modifications. Batching helps performance.',
    status: 'Unstudied'
  }
];

export const StudyStation: React.FC = () => {
  const { addActivity, triggerNotification } = useCareer();

  // Active Sub-tab inside Study Station
  const [activeSubTab, setActiveSubTab] = useState<'timer' | 'flashcards' | 'notes'>('timer');

  // ==========================================
  // 1. FOCUS SESSION TIMER VARIABLES
  // ==========================================
  const [timerMinutes, setTimerMinutes] = useState(25);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerTask, setTimerTask] = useState('DSA Practice & Revision');
  const [timerCategory, setTimerCategory] = useState<ActivityCategory>('DSA');
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Timer presets
  const selectPreset = (m: number) => {
    setTimerMinutes(m);
    setTimeLeft(m * 60);
    setTimerRunning(false);
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
  };

  // Timer run effect
  useEffect(() => {
    if (timerRunning) {
      timerIntervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [timerRunning]);

  const toggleTimer = () => {
    setTimerRunning(!timerRunning);
  };

  const resetTimer = () => {
    setTimerRunning(false);
    setTimeLeft(timerMinutes * 60);
  };

  const handleTimerComplete = () => {
    setTimerRunning(false);
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);

    // Calculate hours spent
    const hrsSpent = Number((timerMinutes / 60).toFixed(2));
    
    // Automatically log daily growth activity for the student
    addActivity({
      title: `Focus Study: ${timerTask || 'Technical Focus'}`,
      description: `Automated Log: Completed a focus-timed study block successfully. Preset duration: ${timerMinutes} mins.`,
      category: timerCategory,
      date: new Date().toISOString().split('T')[0],
      startTime: new Date(Date.now() - timerMinutes * 60 * 1000).toTimeString().slice(0, 5),
      endTime: new Date().toTimeString().slice(0, 5),
      priority: 'High',
      status: 'Completed',
      hoursSpent: hrsSpent || 0.4
    });

    triggerNotification(
      '🎯 Focus Session Completed!',
      `Incredible! You completed a ${timerMinutes}-minute focus block on "${timerTask}". An active trace log has been automatically added to your calendar tracker logs files.`,
      'success'
    );

    alert(`🎉 Awesome job! You completed ${timerMinutes} minutes of focused study. This has been logged into your career tracker files automatically!`);
    resetTimer();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // ==========================================
  // 2. RETRIEVAL FLASHCARDS VARIABLES
  // ==========================================
  const [flashcards, setFlashcards] = useState<Flashcard[]>(() => {
    const saved = localStorage.getItem('career_tracker_flashcards');
    return saved ? JSON.parse(saved) : PRE_SEEDED_FLASHCARDS;
  });
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [newCardQuest, setNewCardQuest] = useState('');
  const [newCardAns, setNewCardAns] = useState('');
  const [newCardCat, setNewCardCat] = useState('Data Structures & Alg.');
  const [isAddingCard, setIsAddingCard] = useState(false);

  useEffect(() => {
    localStorage.setItem('career_tracker_flashcards', JSON.stringify(flashcards));
  }, [flashcards]);

  const rankCard = (id: string, status: 'Mastered' | 'Needs Practice') => {
    setFlashcards((prev) => 
      prev.map((f) => (f.id === id ? { ...f, status } : f))
    );
    setIsFlipped(false);
    
    // Auto shift to next index after a short delay
    setTimeout(() => {
      setCurrentIdx((prevIdx) => (prevIdx + 1) % flashcards.length);
    }, 150);
  };

  const handleCreateCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCardQuest || !newCardAns) return;

    const added: Flashcard = {
      id: `fc_${Date.now()}`,
      category: newCardCat,
      question: newCardQuest,
      answer: newCardAns,
      status: 'Unstudied'
    };

    setFlashcards([added, ...flashcards]);
    setNewCardQuest('');
    setNewCardAns('');
    setIsAddingCard(false);

    triggerNotification(
      '📚 Flashcard Registered',
      `Custom study reference card added under "${newCardCat}" directory successfully.`,
      'info'
    );
  };

  const progressPct = Math.round(
    (flashcards.filter((f) => f.status === 'Mastered').length / flashcards.length) * 100
  );

  // ==========================================
  // 3. STICKY NOTES WORKSPACE VARIABLES
  // ==========================================
  const [notesList, setNotesList] = useState<StickyNote[]>(() => {
    const saved = localStorage.getItem('career_tracker_stickies');
    return saved ? JSON.parse(saved) : [
      { id: '1', text: 'Important: Next job recruitment coding tests happen at 11:00 AM on Monday.', color: 'emerald', createdAt: 'May 31, 2026' },
      { id: '2', text: 'Commands to remember:\nnpx tsx server.ts\nnpm run lint', color: 'blue', createdAt: 'May 31, 2026' },
      { id: '3', text: 'Useful DSA Patterns:\n- Sliding Window\n- Slow Fast pointers\n- Depth First Search recursive stacks', color: 'lavender', createdAt: 'May 31, 2026' }
    ];
  });
  const [noteInput, setNoteInput] = useState('');
  const [noteColor, setNoteColor] = useState<StickyNote['color']>('yellow');

  useEffect(() => {
    localStorage.setItem('career_tracker_stickies', JSON.stringify(notesList));
  }, [notesList]);

  const handleAddNote = () => {
    if (!noteInput.trim()) return;
    const added: StickyNote = {
      id: `sn_${Date.now()}`,
      text: noteInput,
      color: noteColor,
      createdAt: new Date().toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
    };

    setNotesList([added, ...notesList]);
    setNoteInput('');
  };

  const handleDeleteNote = (id: string) => {
    setNotesList(notesList.filter((n) => n.id !== id));
  };

  const getStickyColorClasses = (col: StickyNote['color']) => {
    switch (col) {
      case 'yellow': return 'bg-amber-50 border-amber-200 text-amber-900 shadow-amber-100/30';
      case 'blue': return 'bg-blue-50 border-blue-200 text-blue-900 shadow-blue-100/30';
      case 'emerald': return 'bg-emerald-50 border-emerald-200 text-emerald-900 shadow-emerald-100/30';
      case 'lavender': return 'bg-purple-50 border-purple-200 text-purple-950 shadow-purple-100/30';
      case 'rose': return 'bg-rose-50 border-rose-250 text-rose-950 shadow-rose-100/30';
    }
  };

  // Percentage visual of Pomodoro circle path offset
  const pctRemaining = timeLeft / (timerMinutes * 60);
  const strokeDashoffset = 339.292 * (1 - pctRemaining);

  return (
    <div className="space-y-6">
      {/* Upper header controls and subtab selectors */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-105 dark:border-slate-800 shadow-xs transition-colors">
        <div>
          <h1 className="text-xl font-display font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            <TimerIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" /> Focus Study Station
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">Autonomous workflow accelerators created deliberately for placement preparing academic scholars</p>
        </div>

        {/* Dynamic Navigation Subtabs */}
        <div className="flex items-center gap-1 sm:gap-2 p-1 bg-slate-100 dark:bg-slate-955 rounded-xl w-full md:w-auto">
          <button
            onClick={() => setActiveSubTab('timer')}
            className={`flex-1 md:flex-none px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'timer' ? 'bg-white dark:bg-slate-900 text-blue-650 dark:text-blue-400 shadow-xs' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Timer Focus
          </button>
          <button
            onClick={() => setActiveSubTab('flashcards')}
            className={`flex-1 md:flex-none px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'flashcards' ? 'bg-white dark:bg-slate-900 text-blue-650 dark:text-blue-400 shadow-xs' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Recall Cards
          </button>
          <button
            onClick={() => setActiveSubTab('notes')}
            className={`flex-1 md:flex-none px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'notes' ? 'bg-white dark:bg-slate-900 text-blue-650 dark:text-blue-400 shadow-xs' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Scratch Stickies
          </button>
        </div>
      </div>

      {/* ==========================================
          SUBTAB 1: TIMER FOCUS
          ========================================== */}
      {activeSubTab === 'timer' && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          
          {/* Left panel: Custom task configure configuration details */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-6 space-y-4 shadow-xs transition-colors">
            <span className="text-[10px] block uppercase font-bold tracking-wider text-slate-400 dark:text-slate-550">
               Session Calibration Parameters
            </span>

            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">
                   Topic Focus Target
                </label>
                <input
                  type="text"
                  value={timerTask}
                  onChange={(e) => setTimerTask(e.target.value)}
                  placeholder="e.g. Mastered Dynamic Programming patterns"
                  className="w-full text-xs px-3.5 py-2.5 border border-slate-205 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-slate-100 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 font-sans transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">
                   Activity Category Tag
                </label>
                <select
                  value={timerCategory}
                  onChange={(e) => setTimerCategory(e.target.value as ActivityCategory)}
                  className="w-full text-xs px-3 py-2.5 border border-slate-201 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-slate-100 rounded-xl focus:outline-none transition-colors"
                >
                  <option value="DSA">DSA Practice / Exercises</option>
                  <option value="Coding">Coding Sandbox Practice</option>
                  <option value="Project Development">Live Project Engineering</option>
                  <option value="Research">Academic Research / Thesis</option>
                  <option value="Placement Preparation">Aptitude & Interview prep</option>
                  <option value="Education">Regular Textbook Studies</option>
                </select>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                     Adjust Focus Duration
                  </label>
                  <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold">Editable Minutes</span>
                </div>
                
                {/* User timer controller: Direct editable duration input */}
                <div className="flex gap-2.5 items-center mb-4">
                  <input
                    type="number"
                    min="1"
                    max="180"
                    value={timerMinutes}
                    onChange={(e) => {
                      const val = Math.max(1, Math.min(180, Number(e.target.value) || 1));
                      setTimerMinutes(val);
                      if (!timerRunning) {
                        setTimeLeft(val * 60);
                      }
                    }}
                    className="w-24 text-xs px-3 py-2 border border-slate-205 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-slate-100 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono text-center transition-colors font-bold"
                  />
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-sans font-medium">Minutes</span>
                  
                  {/* Slider option for even smoother control */}
                  <input 
                    type="range"
                    min="1"
                    max="120"
                    value={timerMinutes}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setTimerMinutes(val);
                      if (!timerRunning) {
                        setTimeLeft(val * 60);
                      }
                    }}
                    className="flex-1 accent-blue-600 cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none"
                  />
                </div>

                <label className="block text-[11px] font-bold text-slate-405 dark:text-slate-500 uppercase tracking-wide mb-2">
                   Or Choose Fast Presets
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => selectPreset(15)}
                    className={`py-2 px-3 border rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      timerMinutes === 15 
                        ? 'bg-blue-600 border-blue-600 text-white shadow-sm' 
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-350 dark:hover:border-slate-600 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800'
                    }`}
                  >
                     15m Sprint
                  </button>
                  <button
                    onClick={() => selectPreset(25)}
                    className={`py-2 px-3 border rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      timerMinutes === 25 
                        ? 'bg-blue-600 border-blue-600 text-white shadow-sm' 
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-350 dark:hover:border-slate-600 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800'
                    }`}
                  >
                     25m Pomodoro
                  </button>
                  <button
                    onClick={() => selectPreset(50)}
                    className={`py-2 px-3 border rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      timerMinutes === 50 
                        ? 'bg-blue-600 border-blue-600 text-white shadow-sm' 
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-350 dark:hover:border-slate-600 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800'
                    }`}
                  >
                     50m Deep Session
                  </button>
                </div>
              </div>

              <div className="p-3 bg-blue-50/50 dark:bg-blue-950/20 rounded-2xl border border-blue-100 dark:border-blue-900/50 text-[11px] text-blue-800 dark:text-blue-300 leading-relaxed space-y-1 transition-colors">
                <div className="font-bold flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> Convenience Autotracking active
                </div>
                <p className="text-slate-600 dark:text-slate-400">
                  Completing this cycle automatically binds a study block to your career trace directories, logs hours spent and alerts your study mentor feed, saving you recording overhead.
                </p>
              </div>
            </div>
          </div>

          {/* Right panel: Digital clock with interactive controls progress circle */}
          <div className="lg:col-span-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-xs flex flex-col items-center justify-center space-y-6 min-h-[380px] transition-colors">
            <div className="relative w-48 h-48 flex items-center justify-center">
              {/* Svg countdown circle ring */}
              <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                {/* Background path rim */}
                <circle
                  cx="96"
                  cy="96"
                  r="78"
                  className="stroke-slate-100 dark:stroke-slate-800"
                  strokeWidth="6"
                  fill="transparent"
                />
                
                {/* Running active blue progress track */}
                <circle
                  cx="96"
                  cy="96"
                  r="78"
                  className="stroke-blue-600 transition-all duration-1000"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray="490.088"
                  strokeDashoffset={strokeDashoffset * 490.088 / 339.292}
                  strokeLinecap="round"
                />
              </svg>

              {/* Central counter numbers */}
              <div className="text-center z-10 space-y-0.5">
                <span className="text-4xl font-mono font-bold tracking-tight text-slate-900 dark:text-white select-all">
                  {formatTime(timeLeft)}
                </span>
                <span className="block text-[9px] uppercase tracking-widest text-slate-450 dark:text-slate-500 font-bold">
                  {timerRunning ? 'Session Live' : 'Paused'}
                </span>
              </div>
            </div>

            {/* Controller elements row */}
            <div className="flex gap-4 items-center">
              <button
                onClick={resetTimer}
                className="p-3 border border-slate-205 dark:border-slate-700 rounded-full hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 cursor-pointer transition-all"
                title="Reset counter"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                onClick={toggleTimer}
                className={`py-3.5 px-8 rounded-full font-bold text-sm tracking-wide shadow-md transition-all cursor-pointer flex items-center gap-1.5 ${
                  timerRunning 
                    ? 'bg-amber-500 text-white hover:bg-amber-600 shadow-amber-500/10' 
                    : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-500/15'
                }`}
              >
                {timerRunning ? (
                  <>
                    <Pause className="w-4 h-4" /> Pause Focus
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-white" /> Start Session
                  </>
                )}
              </button>

              <button
                onClick={handleTimerComplete}
                className="p-3 border border-slate-205 rounded-full hover:bg-blue-50 hover:border-blue-200 text-blue-600 cursor-pointer transition-all"
                title="Skip to end / Complete log"
              >
                <SkipForward className="w-4 h-4" />
              </button>
            </div>

            <div className="text-center">
              <h4 className="text-xs font-semibold text-slate-800 leading-none">TARGET: {timerTask}</h4>
              <p className="text-[10px] text-slate-400 mt-1 font-mono">Category Code Identifier: {timerCategory}</p>
            </div>
          </div>

        </div>
      )}

      {/* ==========================================
          SUBTAB 2: RECALL FLASHCARDS
          ========================================== */}
      {activeSubTab === 'flashcards' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-blue-50/20 p-4 border border-blue-100/50 rounded-2xl">
            <div>
              <h3 className="text-xs font-bold text-slate-800">Placement Concepts Mastery Engine</h3>
              <p className="text-[11.5px] text-slate-500">Practice rapid recall queries to retain complex technical algorithms easily</p>
            </div>

            <div className="flex items-center gap-3 shrink-0 text-xs">
              <span className="font-bold text-blue-605">Progress: {progressPct}% Mastered</span>
              <div className="w-24 bg-slate-200 h-2 rounded-full overflow-hidden shrink-0">
                <div className="bg-emerald-500 h-full transition-all" style={{ width: `${progressPct}%` }} />
              </div>

              <button
                onClick={() => setIsAddingCard(!isAddingCard)}
                className="px-3.5 py-1.5 bg-blue-650 hover:bg-blue-700 text-white rounded-xl font-bold font-sans cursor-pointer transition-all"
              >
                 + Custom Card
              </button>
            </div>
          </div>

          {/* Form setup for appending custom cards */}
          {isAddingCard && (
            <form onSubmit={handleCreateCard} className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4 max-w-lg mx-auto">
              <h4 className="font-bold font-display text-xs text-slate-800">Add Revision Revision Card</h4>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Concept Category</label>
                  <select
                    value={newCardCat}
                    onChange={(e) => setNewCardCat(e.target.value)}
                    className="w-full text-xs p-2 border border-slate-200 bg-slate-50 rounded-lg focus:outline-none"
                  >
                    <option value="Data Structures & Alg.">DSA</option>
                    <option value="React & Frontend">React & JavaScript</option>
                    <option value="System Design & DB">System Design & Databases</option>
                    <option value="Core OS & Networks">OS & Linux Networks</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Question / Topic Heading</label>
                <input
                  type="text"
                  required
                  value={newCardQuest}
                  onChange={(e) => setNewCardQuest(e.target.value)}
                  placeholder="e.g. Difference between process and thread?"
                  className="w-full text-xs p-2.5 border border-slate-200 bg-slate-50 rounded-lg focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Correct Recall Answer Explanation</label>
                <textarea
                  required
                  rows={3}
                  value={newCardAns}
                  onChange={(e) => setNewCardAns(e.target.value)}
                  placeholder="Provide precise concept definition and code patterns if necessary..."
                  className="w-full text-xs p-2.5 border border-slate-200 bg-slate-50 rounded-lg focus:outline-none font-sans"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingCard(false)}
                  className="px-3.5 py-1.5 border hover:bg-slate-50 rounded-lg text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold cursor-pointer"
                >
                  Save Card
                </button>
              </div>
            </form>
          )}

          {/* Core Interactive flip elements container */}
          {flashcards.length > 0 && (
            <div className="max-w-xl mx-auto space-y-6">
              
              {/* Flipped Card Component */}
              <div 
                onClick={() => setIsFlipped(!isFlipped)}
                className={`relative w-full min-h-[230px] rounded-3xl border cursor-pointer select-none transition-all duration-500 bg-linear-to-br transform ${
                  isFlipped 
                    ? 'border-indigo-200 bg-linear-to-b from-slate-50 to-indigo-50/30' 
                    : 'border-slate-100 bg-linear-to-b from-white to-slate-50/20 hover:border-blue-100/80 shadow-xs'
                }`}
              >
                
                {/* Visual badge top */}
                <div className="p-4 flex justify-between items-center bg-transparent border-b border-slate-50">
                  <span className="text-[10px] uppercase font-mono font-bold text-blue-605 tracking-wide bg-blue-50 px-2.5 py-1 rounded-md">
                    {flashcards[currentIdx].category}
                  </span>

                  <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                    flashcards[currentIdx].status === 'Mastered' ? 'bg-emerald-100 text-emerald-800' :
                    flashcards[currentIdx].status === 'Needs Practice' ? 'bg-amber-100 text-amber-800' :
                    'bg-slate-100 text-slate-500'
                  }`}>
                    {flashcards[currentIdx].status}
                  </span>
                </div>

                {/* Question Face or Answer Face */}
                <div className="p-6 sm:p-8 flex items-center justify-center text-center">
                  {!isFlipped ? (
                    <div className="space-y-4">
                      <h4 className="font-display font-bold text-slate-900 text-sm sm:text-base leading-relaxed max-w-md mx-auto">
                        "{flashcards[currentIdx].question}"
                      </h4>
                      <p className="text-[10px] text-slate-400 font-bold flex items-center justify-center gap-1">
                        <RotateCw className="w-3.5 h-3.5" /> CLICK OR TOUCH TO REVEAL CONCEPT EXPLANATION
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <p className="font-sans text-xs sm:text-sm text-slate-700 leading-relaxed max-w-lg mx-auto text-left">
                        {flashcards[currentIdx].answer}
                      </p>
                      <p className="text-[10px] text-slate-400 font-bold flex items-center justify-center gap-1">
                        <RotateCw className="w-3.5 h-3.5" /> CLICK CARD BODY AG COMPANION SIDE
                      </p>
                    </div>
                  )}
                </div>

                {/* Index tracking label list */}
                <div className="absolute bottom-4 left-0 right-0 text-center text-[10px] font-mono text-slate-450 select-none">
                  Recall Card {currentIdx + 1} of {flashcards.length}
                </div>
              </div>

              {/* Assessment buttons (Only show when flipped for active evaluation) */}
              {isFlipped ? (
                <div className="flex gap-3 justify-center max-w-sm mx-auto animate-in fade-in zoom-in duration-200">
                  <button
                    onClick={() => rankCard(flashcards[currentIdx].id, 'Needs Practice')}
                    className="flex-1 py-2.5 px-4 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-xs rounded-xl flex items-center justify-center gap-1 cursor-pointer transition-all border border-amber-200/50"
                  >
                     Needs Practice ⚠️
                  </button>
                  <button
                    onClick={() => rankCard(flashcards[currentIdx].id, 'Mastered')}
                    className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1 cursor-pointer transition-all"
                  >
                     Mastered ✓
                  </button>
                </div>
              ) : (
                <div className="flex gap-2 justify-center">
                  <button
                    onClick={() => {
                      setIsFlipped(false);
                      setCurrentIdx((prevIdx) => (prevIdx - 1 + flashcards.length) % flashcards.length);
                    }}
                    className="px-5 py-2 hover:bg-slate-100 text-slate-650 font-bold text-xs rounded-xl border border-slate-200 bg-white cursor-pointer transition-all"
                  >
                     Previous Card
                  </button>
                  <button
                    onClick={() => {
                      setIsFlipped(false);
                      setCurrentIdx((prevIdx) => (prevIdx + 1) % flashcards.length);
                    }}
                    className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl cursor-pointer transition-all"
                  >
                     Next Card
                  </button>
                </div>
              )}

            </div>
          )}

          {flashcards.length === 0 && (
            <div className="text-center py-20 bg-slate-50 border border-slate-200 rounded-3xl text-slate-400 text-xs">
               Empty revision list. Click + Custom Card above to compile mock syllabus questions!
            </div>
          )}
        </div>
      )}

      {/* ==========================================
          SUBTAB 3: SCRATCH NOTES
          ========================================== */}
      {activeSubTab === 'notes' && (
        <div className="space-y-6">
          <div className="bg-slate-900/90 text-white p-5 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border border-slate-800">
            <div className="space-y-1">
              <h3 className="text-sm font-semibold flex items-center gap-1.5 leading-none">
                <Bookmark className="w-4 h-4 text-emerald-450" /> Sticky Scratchpad Scrapbook
              </h3>
              <p className="text-xs text-slate-400">Instantly register quick links, command lines, or interview insights during live learning loops</p>
            </div>

            {/* Note creation bar */}
            <div className="flex gap-2 w-full md:w-auto items-center">
              <input
                type="text"
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
                placeholder="Clip notes text..."
                className="flex-1 md:w-64 bg-slate-800 border border-slate-705 p-2 rounded-xl text-xs text-white focus:outline-none"
                onKeyDown={(e) => { if (e.key === 'Enter') handleAddNote(); }}
              />

              {/* Color dot picker */}
              <div className="flex gap-1 items-center shrink-0">
                {(['yellow', 'blue', 'emerald', 'lavender', 'rose'] as const).map((color) => (
                  <button
                    key={color}
                    onClick={() => setNoteColor(color)}
                    className={`w-4 h-4 rounded-full transition-all border ${
                      color === 'yellow' ? 'bg-amber-400 border-amber-500' :
                      color === 'blue' ? 'bg-blue-400 border-blue-500' :
                      color === 'emerald' ? 'bg-emerald-400 border-emerald-500' :
                      color === 'lavender' ? 'bg-purple-400 border-purple-500' :
                      'bg-rose-450 border-rose-500'
                    } ${noteColor === color ? 'ring-2 ring-white ring-offset-2 scale-110' : 'opacity-85'}`}
                  />
                ))}
              </div>

              <button
                onClick={handleAddNote}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-all shrink-0"
              >
                  Clip Item
              </button>
            </div>
          </div>

          {/* Sticky Notes grid layout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {notesList.map((note) => {
              const bgClass = getStickyColorClasses(note.color);
              return (
                <div 
                  key={note.id} 
                  className={`p-4 rounded-2xl border flex flex-col justify-between gap-3 shadow-md border-b-4 ${bgClass} transition-all hover:scale-[1.01]`}
                >
                  <p className="text-xs leading-relaxed font-sans font-medium whitespace-pre-wrap select-all">
                    {note.text}
                  </p>

                  <div className="flex justify-between items-center text-[9px] pt-1 border-t border-slate-900/5 text-slate-500 font-mono">
                    <span>Clipped: {note.createdAt}</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(note.text);
                          alert('Notes clipped string copied successfully!');
                        }}
                        className="p-1 hover:bg-black/5 rounded-md text-slate-650"
                        title="Copy content"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleDeleteNote(note.id)}
                        className="p-1 hover:bg-black/5 rounded-md text-rose-650"
                        title="Discard scratch card"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {notesList.length === 0 && (
              <div className="col-span-3 text-center py-16 text-slate-400 text-xs">
                 No scratch notes clipped. Type brief study keywords or links in the input above.
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
