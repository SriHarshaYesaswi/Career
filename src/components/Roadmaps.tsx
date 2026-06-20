/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useCareer } from '../context/CareerContext';
import { CareerRoadmap, RoadmapNode } from '../types';
import { 
  GitBranch, 
  Trash2, 
  Plus, 
  X, 
  CheckCircle2, 
  Circle, 
  ChevronRight, 
  Compass, 
  Sparkles,
  Map,
  BookOpen
} from 'lucide-react';

export const Roadmaps: React.FC = () => {
  const { roadmaps, addRoadmap, toggleRoadmapStep, deleteRoadmap } = useCareer();
  const [selectedRoadmapId, setSelectedRoadmapId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form Fields
  const [pathName, setPathName] = useState('Frontend Developer');
  const [description, setDescription] = useState('');
  const [stepsInput, setStepsInput] = useState<string[]>(['HTML5, CSS3 & Responsive Design', 'Modern JavaScript (ES6+)', 'SPA Architecture (React or Vue)']);

  const roadPresets = [
    'Frontend Developer',
    'Backend Developer',
    'Full Stack Developer',
    'Data Scientist',
    'AI Engineer',
    'Cybersecurity Engineer'
  ];

  const handleAddStepInput = () => {
    setStepsInput([...stepsInput, '']);
  };

  const handleRemoveStepInput = (index: number) => {
    setStepsInput(stepsInput.filter((_, idx) => idx !== index));
  };

  const handleStepInputChange = (index: number, val: string) => {
    const nextSteps = [...stepsInput];
    nextSteps[index] = val;
    setStepsInput(nextSteps);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description) return;

    const filteredSteps = stepsInput.filter(s => s.trim().length > 0);
    addRoadmap({
      pathName,
      description,
      steps: filteredSteps
    });

    // Reset fields
    setDescription('');
    setStepsInput(['HTML5, CSS3 & Responsive Design', 'Modern JavaScript (ES6+)', 'SPA Architecture (React or Vue)']);
    setIsModalOpen(false);
  };

  // Pre-load active roadmap ID on initialization
  React.useEffect(() => {
    if (roadmaps.length > 0 && !selectedRoadmapId) {
      setSelectedRoadmapId(roadmaps[0].id);
    }
  }, [roadmaps, selectedRoadmapId]);

  const activeRoadMap = roadmaps.find(r => r.id === selectedRoadmapId) || (roadmaps.length > 0 ? roadmaps[0] : null);

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs transition-colors">
        <div>
          <h1 className="text-xl font-display font-bold text-slate-900 dark:text-white">Career Roadmap Planner</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">Visualize structure, track study checkpoints, and formulate specialized developer syllabus paths</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer shrink-0 transition-all"
        >
          <Plus className="w-4 h-4" /> Custom Path
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left side list selector */}
        <div className="space-y-4 lg:col-span-1">
          <span className="text-[10px] block uppercase font-bold tracking-wider text-slate-400">
            Selected Career Roads
          </span>

          <div className="flex flex-row overflow-x-auto lg:overflow-x-visible lg:flex-col gap-2 pb-2 lg:pb-0">
            {roadmaps.map((r) => {
              const isActive = r.id === selectedRoadmapId;
              return (
                <button
                  key={r.id}
                  onClick={() => setSelectedRoadmapId(r.id)}
                  className={`w-full text-left p-3.5 rounded-2xl border transition-all flex flex-col justify-between shrink-0 sm:shrink lg:shrink-0 gap-2 cursor-pointer ${
                    isActive 
                      ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/10' 
                      : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-305 hover:border-slate-200 dark:hover:border-slate-700'
                  }`}
                  style={{ minWidth: isActive ? '180px' : '150px' }}
                >
                  <div>
                    <h3 className="text-xs font-bold font-display line-clamp-1">{r.pathName}</h3>
                    <p className={`text-[9px] line-clamp-1 ${isActive ? 'text-blue-100' : 'text-slate-400 dark:text-slate-500'}`}>
                      {r.description}
                    </p>
                  </div>

                  <div className="flex justify-between items-center text-[10px] w-full pt-1.5 border-t border-dashed border-white/10">
                    <span className={isActive ? 'text-blue-200' : 'text-slate-550'}>Chapters Done</span>
                    <span className="font-bold font-mono">{r.completionPercentage}%</span>
                  </div>
                </button>
              );
            })}

            {roadmaps.length === 0 && (
              <p className="text-xs text-slate-400 text-center py-6 block w-full bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 transition-colors">
                 No roadmaps configured.
              </p>
            )}
          </div>
        </div>

        {/* Right side active node visual planner */}
        <div className="lg:col-span-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-6 transition-colors">
          {activeRoadMap ? (
            <>
              {/* Header inside visualization column */}
              <div className="flex justify-between items-start gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
                    <GitBranch className="w-5 h-5" />
                    <h2 className="text-lg font-display font-bold text-slate-900 dark:text-white">
                      {activeRoadMap.pathName} Milestone Path
                    </h2>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-2xl">{activeRoadMap.description}</p>
                </div>

                <button 
                  onClick={() => {
                    deleteRoadmap(activeRoadMap.id);
                    setSelectedRoadmapId(null);
                  }}
                  className="p-2 border border-slate-150 dark:border-slate-800 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/20 text-slate-400 dark:text-slate-550 hover:text-rose-600 dark:hover:text-rose-450 cursor-pointer transition-colors"
                  title="Remove Roadmap config"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* STYLISH VISUAL ROADMAP PIPELINE NODES */}
              <div className="relative pl-6 space-y-8 py-2">
                {/* Visual pipeline stem */}
                <div className="absolute left-[13px] top-4 bottom-4 w-1 bg-gradient-to-b from-blue-500 via-indigo-400 to-sky-300 rounded-full" />

                {activeRoadMap.nodes
                  .sort((a,b) => a.order - b.order)
                  .map((node) => {
                    const isDone = node.isCompleted;
                    return (
                      <div key={node.id} className="relative group/node">
                        {/* Timeline Circle point */}
                        <button
                          onClick={() => toggleRoadmapStep(activeRoadMap.id, node.id)}
                          className={`absolute -left-[31px] top-1.5 z-10 w-5 h-5 rounded-full border-4 bg-white dark:bg-slate-950 flex items-center justify-center transition-all cursor-pointer ${
                            isDone 
                              ? 'border-blue-600 dark:border-blue-500 scale-110 shadow-md shadow-blue-500/20' 
                              : 'border-slate-300 dark:border-slate-700 hover:border-blue-500'
                          }`}
                        >
                          {isDone && <div className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400" />}
                        </button>

                        {/* Interactive Chapter Container info */}
                        <div 
                          onClick={() => toggleRoadmapStep(activeRoadMap.id, node.id)}
                          className={`p-4 rounded-2xl border text-left transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer relative overflow-hidden ${
                            isDone 
                              ? 'bg-blue-50/20 dark:bg-blue-950/10 border-blue-100 dark:border-blue-900/40 hover:bg-blue-50/30' 
                              : 'bg-slate-50/40 dark:bg-slate-950/10 border-slate-100 dark:border-slate-800/80 hover:bg-slate-50/70'
                          }`}
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold font-mono text-blue-600 dark:text-blue-450 uppercase tracking-widest">
                                Chapter 0{node.order}
                              </span>
                              {isDone && (
                                <span className="text-[9px] bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-305 px-2 py-0.5 rounded-full font-semibold">
                                  Complete ✓
                                </span>
                              )}
                            </div>
                            <h4 className={`font-display font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-200 ${isDone ? 'text-slate-900 dark:text-white' : ''}`}>
                              {node.title}
                            </h4>
                            <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed max-w-xl">{node.description}</p>
                          </div>

                          <div className="flex items-center gap-2 font-semibold shrink-0">
                            {isDone ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-450 shrink-0" />
                            ) : (
                              <Circle className="w-5 h-5 text-slate-300 dark:text-slate-700 shrink-0" />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>

              {/* Progress summary card */}
              <div className="bg-slate-50 border border-slate-100 dark:bg-slate-950/40 dark:border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row justify-between sm:items-center gap-4 text-xs transition-colors">
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-800 dark:text-slate-205">Dynamic Syllabus Complete Percentage</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Includes all sequential modules calibrated above</p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-bold font-mono text-lg text-blue-600 dark:text-blue-400">
                    {activeRoadMap.completionPercentage}% Complete
                  </span>
                  <div className="w-24 bg-slate-200 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden shrink-0">
                    <div className="bg-blue-600 h-full rounded-full transition-all duration-300" style={{ width: `${activeRoadMap.completionPercentage}%` }} />
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-20 text-slate-400 dark:text-slate-600">
               No structured Roadmaps created. Click + Custom Path to design your targets.
            </div>
          )}
        </div>
      </div>

      {/* POPUP MODAL DIALOG */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full border border-slate-150 dark:border-slate-800 shadow-2xl p-6 relative transition-colors">
            
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-350 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-display font-bold text-base text-slate-900 dark:text-white mb-4 flex items-center gap-1.5">
              <GitBranch className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Syllabus Path Architect
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Profession Track preset
                </label>
                <select
                  value={pathName}
                  onChange={(e) => setPathName(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 bg-slate-50 rounded-lg focus:outline-none"
                >
                  {roadPresets.map(preset => (
                    <option key={preset} value={preset}>{preset}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Roadmap Focus Description
                </label>
                <textarea
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Mastery scope spanning frontend components, SQL caching databases..."
                  rows={2}
                  className="w-full text-xs px-3 py-2 border border-slate-200 bg-slate-50 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* DYNAMIC KEY STEPS INPUTS */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Syllabus Chapters
                  </label>
                  <button
                    type="button"
                    onClick={handleAddStepInput}
                    className="text-[10px] font-bold text-blue-600 flex items-center gap-1 hover:underline"
                  >
                    <Plus className="w-3 h-3" /> Add Chapter
                  </button>
                </div>

                <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
                  {stepsInput.map((val, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <span className="text-[10px] font-mono text-slate-400 font-bold">0{idx + 1}</span>
                      <input
                        type="text"
                        value={val}
                        onChange={(e) => handleStepInputChange(idx, e.target.value)}
                        placeholder={`e.g. Section Title ${idx + 1}`}
                        className="flex-1 text-xs px-3 py-1.5 border border-slate-200 bg-slate-50 rounded-lg focus:outline-none"
                      />
                      {stepsInput.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveStepInput(idx)}
                          className="p-1 hover:bg-slate-100 text-rose-500 rounded-md"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-lg text-xs font-semibold text-slate-600 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-xs font-semibold text-white transition-all cursor-pointer"
                >
                  Deploy Syllabus
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
