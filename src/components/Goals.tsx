/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useCareer } from '../context/CareerContext';
import { CareerGoal } from '../types';
import { 
  Target, 
  Trash2, 
  Plus, 
  X, 
  CheckSquare, 
  Square, 
  Calendar, 
  Compass, 
  Flag,
  Award,
  CheckCircle,
  Clock
} from 'lucide-react';

export const Goals: React.FC = () => {
  const { goals, addGoal, deleteGoal, toggleMilestone, updateGoal } = useCareer();
  const [filterType, setFilterType] = useState<'All' | 'Long-Term' | 'Short-Term'>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isLongTerm, setIsLongTerm] = useState(false);
  const [deadline, setDeadline] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState('Full Stack Development');
  const [milestoneInputs, setMilestoneInputs] = useState<string[]>(['']);

  const handleAddMilestoneInput = () => {
    setMilestoneInputs([...milestoneInputs, '']);
  };

  const handleRemoveMilestoneInput = (index: number) => {
    setMilestoneInputs(milestoneInputs.filter((_, idx) => idx !== index));
  };

  const handleMilestoneInputChange = (index: number, val: string) => {
    const nextInputs = [...milestoneInputs];
    nextInputs[index] = val;
    setMilestoneInputs(nextInputs);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    // Filter out blank milestones
    const cleanMilestones = milestoneInputs.filter(m => m.trim().length > 0);

    addGoal({
      title,
      description,
      isLongTerm,
      deadline,
      category,
      milestones: cleanMilestones
    });

    // Reset fields
    setTitle('');
    setDescription('');
    setIsLongTerm(false);
    setDeadline(new Date().toISOString().split('T')[0]);
    setCategory('Full Stack Development');
    setMilestoneInputs(['']);
    setIsModalOpen(false);
  };

  const filteredGoals = goals.filter(g => {
    if (filterType === 'Long-Term') return g.isLongTerm;
    if (filterType === 'Short-Term') return !g.isLongTerm;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Upper header action area */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
        <div>
          <h1 className="text-xl font-display font-bold text-slate-900">Career Goal & Objective Dashboard</h1>
          <p className="text-xs text-slate-500">Formulate long-term visions and short-term courses to keep track of development milestones</p>
        </div>

        <div className="flex gap-2 items-center w-full sm:w-auto">
          <div className="bg-slate-100 p-1 rounded-xl flex gap-1 w-full sm:w-auto">
            {(['All', 'Long-Term', 'Short-Term'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                  filterType === t 
                    ? 'bg-white text-slate-900 shadow-xs' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer shrink-0 transition-all"
          >
            <Plus className="w-4 h-4" /> Add Goal
          </button>
        </div>
      </div>

      {/* Grid cabinet of Goals */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredGoals.map((g) => {
          const completedCount = g.milestones.filter(m => m.isCompleted).length;
          return (
            <div 
              key={g.id} 
              className={`bg-white rounded-2xl border p-5 shadow-xs flex flex-col justify-between gap-5 transition-all relative ${
                g.isCompleted 
                  ? 'border-emerald-200 bg-emerald-50/10' 
                  : 'border-slate-100 hover:border-blue-100'
              }`}
            >
              {/* Card headers */}
              <div className="space-y-3">
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-1">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                      g.isLongTerm 
                        ? 'bg-indigo-100 text-indigo-800 border-indigo-200' 
                        : 'bg-sky-100 text-sky-800 border-sky-200'
                    }`}>
                      {g.isLongTerm ? 'Long-Term Vision' : 'Short-Term Target'}
                    </span>
                    <h3 className="text-sm font-display font-bold text-slate-900 leading-snug">
                      {g.title}
                    </h3>
                  </div>

                  <button 
                    onClick={() => deleteGoal(g.id)}
                    className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer flex-shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {g.description && (
                  <p className="text-xs text-slate-500">{g.description}</p>
                )}

                <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono">
                  <span className="flex items-center gap-0.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Target: {g.deadline}</span>
                  </span>
                  <span>•</span>
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                    {g.category}
                  </span>
                </div>
              </div>

              {/* Milestones and checklist checklist */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <div className="flex justify-between items-center text-xs text-slate-500">
                  <span className="font-semibold flex items-center gap-1">
                    <Flag className="w-3.5 h-3.5 text-blue-500" />
                    Milestones Progression
                  </span>
                  <span className="font-bold font-mono">
                    {completedCount}/{g.milestones.length} Met
                  </span>
                </div>

                <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
                  {g.milestones.map((m) => (
                    <div 
                      key={m.id}
                      onClick={() => toggleMilestone(g.id, m.id)}
                      className={`p-2.5 rounded-lg border text-[11px] font-medium flex items-center gap-2.5 cursor-pointer transition-all ${
                        m.isCompleted 
                          ? 'bg-emerald-50/40 border-emerald-100/70 text-emerald-800 line-through decoration-emerald-200' 
                          : 'bg-slate-50 border-slate-100 text-slate-700 hover:bg-slate-100/50'
                      }`}
                    >
                      {m.isCompleted ? (
                        <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-400 shrink-0" />
                      )}
                      <span>{m.title}</span>
                    </div>
                  ))}
                  {g.milestones.length === 0 && (
                    <p className="text-[11px] text-slate-400 text-center py-2">
                       No sub-milestones specified for this goal.
                    </p>
                  )}
                </div>
              </div>

              {/* Accumulate ProgressBar */}
              <div className="space-y-1.5 pt-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-medium text-slate-500">Progress rate completed</span>
                  <span className="font-bold font-mono text-blue-600">{g.progressPercentage}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      g.isCompleted ? 'bg-emerald-500' : 'bg-blue-600'
                    }`} 
                    style={{ width: `${g.progressPercentage}%` }} 
                  />
                </div>
              </div>
            </div>
          );
        })}

        {filteredGoals.length === 0 && (
          <div className="col-span-2 text-center py-16 bg-white rounded-3xl border border-slate-100 text-slate-400 font-medium">
            No customized goals tracked in this subsection.
          </div>
        )}
      </div>

      {/* POPUP MODAL DIALOG */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-100 shadow-2xl p-6 relative">
            
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-display font-bold text-base text-slate-900 mb-4 flex items-center gap-1.5">
              <Target className="w-5 h-5 text-blue-600" />
              Establish Career Goal
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Goal Title or Vision Objective
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Acquire Google CSE Internship"
                  className="w-full text-xs px-3 py-2 border border-slate-200 bg-slate-50 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Visions Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What will this unlock in your professional trajectory?"
                  rows={2}
                  className="w-full text-xs px-3 py-2 border border-slate-200 bg-slate-50 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                    Goal Lifespan
                  </label>
                  <select
                    value={isLongTerm ? 'long' : 'short'}
                    onChange={(e) => setIsLongTerm(e.target.value === 'long')}
                    className="w-full text-xs px-3 py-2 border border-slate-200 bg-slate-50 rounded-lg focus:outline-none"
                  >
                    <option value="short">Short-Term (Weeks/Months)</option>
                    <option value="long">Long-Term (1+ Year Vision)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                    Category Filter
                  </label>
                  <input
                    type="text"
                    required
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g. Placement / Coding"
                    className="w-full text-xs px-3 py-2 border border-slate-200 bg-slate-50 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Milestone Targets Deadline
                </label>
                <input
                  type="date"
                  required
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 bg-slate-50 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* NESTED MILESTONES CHECKBOXES GENERATOR */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Milestones & Subtasks Setup
                  </label>
                  <button
                    type="button"
                    onClick={handleAddMilestoneInput}
                    className="text-[10px] font-bold text-blue-600 flex items-center gap-1 hover:underline"
                  >
                    <Plus className="w-3 h-3" /> Append Milestone
                  </button>
                </div>

                <div className="space-y-2 max-h-[120px] overflow-y-auto pr-1">
                  {milestoneInputs.map((val, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <input
                        type="text"
                        value={val}
                        onChange={(e) => handleMilestoneInputChange(idx, e.target.value)}
                        placeholder={`Sub-milestone ${idx + 1}`}
                        className="flex-1 text-xs px-3 py-1.5 border border-slate-200 bg-slate-50 rounded-lg focus:outline-none"
                      />
                      {milestoneInputs.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveMilestoneInput(idx)}
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
                  Create Vision Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
