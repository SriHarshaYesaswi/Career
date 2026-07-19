/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useCareer } from '../context/CareerContext';
import { SkillItem } from '../types';
import { 
  Cpu, 
  Trash2, 
  Plus, 
  X, 
  Star, 
  TrendingUp, 
  Clock, 
  Award,
  Sparkles,
  BookOpen
} from 'lucide-react';

export const Skills: React.FC = () => {
  const { skills, addSkill, updateSkill, addLearningHours, deleteSkill } = useCareer();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form Fields
  const [name, setName] = useState('');
  const [currentLevel, setCurrentLevel] = useState(1);
  const [targetLevel, setTargetLevel] = useState(5);
  const [learningHours, setLearningHours] = useState(1);
  const [category, setCategory] = useState('Frontend');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    addSkill({
      name,
      currentLevel,
      targetLevel,
      learningHours,
      category
    });

    // Reset fields
    setName('');
    setCurrentLevel(1);
    setTargetLevel(5);
    setLearningHours(1);
    setIsModalOpen(false);
  };

  const incrementHours = (skillId: string, h: number) => {
    addLearningHours(skillId, h);
  };

  const handleLevelChange = (skill: SkillItem, level: number) => {
    updateSkill(skill.id, { currentLevel: level });
  };

  // Helper to render Star Ratings
  const renderLevelStars = (current: number, target: number, onUpdate?: (l: number) => void) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((s) => {
          const isCurrent = s <= current;
          const isTarget = s <= target;
          return (
            <button
               type="button"
               key={s}
               onClick={() => onUpdate && onUpdate(s)}
               disabled={!onUpdate}
               className={`transition-all ${onUpdate ? 'cursor-pointer hover:scale-110' : ''}`}
            >
              <Star 
                className={`w-3.5 h-3.5 ${
                  isCurrent 
                    ? 'fill-amber-400 text-amber-400' 
                    : isTarget 
                      ? 'text-amber-200 fill-amber-100/10' 
                      : 'text-slate-200'
                }`} 
              />
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Visual Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
        <div>
          <h1 className="text-xl font-display font-bold text-slate-900">Professional Skill Matrices</h1>
          <p className="text-xs text-slate-500">Log training hours, increment subject proficiencies, and evaluate target levels</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer shrink-0 transition-all"
        >
          <Plus className="w-4 h-4" /> Track Skill
        </button>
      </div>

      {/* Grid of Skill Targets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {skills.map((s) => {
          return (
            <div 
              key={s.id} 
              className="bg-white rounded-2xl border border-slate-100 shadow-xs p-5 flex flex-col justify-between gap-4 transition-all hover:border-blue-100 relative group overflow-hidden"
            >
              {/* Card headers */}
              <div className="space-y-3">
                <div className="flex justify-between items-start gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                      <Cpu className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-display font-bold text-slate-900 leading-snug">{s.name}</h3>
                      <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                        {s.category || 'Competence'}
                      </span>
                    </div>
                  </div>

                  <button 
                    onClick={() => deleteSkill(s.id)}
                    className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer flex-shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Level Matrices */}
                <div className="space-y-1.5 p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider mb-0.5">Rating Calibration</span>
                    {renderLevelStars(s.currentLevel, s.targetLevel, (l) => handleLevelChange(s, l))}
                  </div>

                  <div className="text-right font-mono">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider mb-0.5">Objective</span>
                    <span className="text-slate-800 font-bold">Level {s.currentLevel}</span>
                    <span className="text-slate-400 text-[10px]">/{s.targetLevel}</span>
                  </div>
                </div>

                {/* Hours Metric */}
                <div className="flex justify-between items-center text-xs pt-1.5">
                  <span className="text-slate-500 font-semibold flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-indigo-500" /> Total Study Logged
                  </span>
                  <span className="font-bold text-slate-800 font-mono inline-flex items-center gap-0.5">
                    {s.learningHours} <span className="text-[10px] text-slate-400 font-normal">hrs</span>
                  </span>
                </div>
              </div>

              {/* Study accelerator buttons */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <span className="text-[10px] block uppercase font-bold tracking-wider text-slate-400">
                  ⚡ Log Incremental Study Time
                </span>
                
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => incrementHours(s.id, 1)}
                    className="py-1 px-1.5 bg-slate-50 hover:bg-blue-50 border border-slate-100 hover:border-blue-200 text-slate-700 hover:text-blue-700 text-[10px] font-bold rounded-lg cursor-pointer transition-all text-center"
                  >
                    +1 Hr
                  </button>
                  <button
                    onClick={() => incrementHours(s.id, 5)}
                    className="py-1 px-1.5 bg-slate-50 hover:bg-blue-50 border border-slate-100 hover:border-blue-200 text-slate-700 hover:text-blue-700 text-[10px] font-bold rounded-lg cursor-pointer transition-all text-center"
                  >
                    +5 Hrs
                  </button>
                  <button
                    onClick={() => {
                      const additional = prompt('Enter customized study hours:', '10');
                      if (additional && !isNaN(Number(additional))) {
                        incrementHours(s.id, Number(additional));
                      }
                    }}
                    className="py-1 px-1.5 bg-slate-50 hover:bg-blue-50 border border-slate-100 hover:border-blue-200 text-slate-700 hover:text-blue-700 text-[10px] font-bold rounded-lg cursor-pointer transition-all text-center"
                  >
                    Custom
                  </button>
                </div>
              </div>

              {/* Progress visual slider tracker bar */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-slate-400 font-semibold">Goal Achievement rate</span>
                  <span className="font-bold text-blue-600 font-mono">{s.progressPercentage}%</span>
                </div>
                <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                  <div className="bg-blue-600 h-full rounded-full" style={{ width: `${Math.min(s.progressPercentage, 100)}%` }} />
                </div>
              </div>
            </div>
          );
        })}

        {skills.length === 0 && (
          <div className="col-span-3 text-center py-16 bg-white rounded-3xl border border-slate-100 text-slate-400 font-medium">
             No technical skills added yet. Click Track Skill to start formulating your profile competencies!
          </div>
        )}
      </div>

      {/* POPUP MODAL DIALOG */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full border border-slate-100 shadow-2xl p-6 relative">
            
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-display font-bold text-base text-slate-900 mb-4 flex items-center gap-1.5">
              <Cpu className="w-5 h-5 text-blue-600" />
              Add Technical Skill
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Competency Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. NextJS framework/React Native"
                  className="w-full text-xs px-3 py-2 border border-slate-200 bg-slate-50 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Category Tag
                </label>
                <input
                  type="text"
                  required
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g. Frontend / Tooling"
                  className="w-full text-xs px-3 py-2 border border-slate-200 bg-slate-50 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                    Initial Level (1-5)
                  </label>
                  <select
                    value={currentLevel}
                    onChange={(e) => setCurrentLevel(Number(e.target.value))}
                    className="w-full text-xs px-3 py-2 border border-slate-200 bg-slate-50 rounded-lg focus:outline-none"
                  >
                    {[1,2,3,4,5].map(n => (
                      <option key={n} value={n}>Level {n}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                    Target Level (1-5)
                  </label>
                  <select
                    value={targetLevel}
                    onChange={(e) => setTargetLevel(Number(e.target.value))}
                    className="w-full text-xs px-3 py-2 border border-slate-200 bg-slate-50 rounded-lg focus:outline-none"
                  >
                    {[1,2,3,4,5].map(n => (
                      <option key={n} value={n}>Level {n}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Bootstrap Learning Hours Spent
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  value={learningHours}
                  onChange={(e) => setLearningHours(Number(e.target.value))}
                  placeholder="Initial study log"
                  className="w-full text-xs px-3 py-2 border border-slate-200 bg-slate-50 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
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
                  Confirm Track
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
