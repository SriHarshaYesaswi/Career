/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useCareer } from '../context/CareerContext';
import { ProfessionalJournal } from '../types';
import { 
  BookOpen, 
  Trash2, 
  Plus, 
  X, 
  Search, 
  Calendar, 
  Compass, 
  FileText,
  ExternalLink,
  MessageSquare
} from 'lucide-react';

export const Journal: React.FC = () => {
  const { journals, addJournal, deleteJournal, updateJournal } = useCareer();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDateFilter, setSelectedDateFilter] = useState('');
  const [activeJournalId, setActiveJournalId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form Fields State
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [whatILearned, setWhatILearned] = useState('');
  const [challengesFaced, setChallengesFaced] = useState('');
  const [achievements, setAchievements] = useState('');
  const [nextDayPlan, setNextDayPlan] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !whatILearned) return;

    addJournal({
      title,
      date,
      whatILearned,
      challengesFaced,
      achievements,
      nextDayPlan
    });

    // Reset fields
    setTitle('');
    setDate(new Date().toISOString().split('T')[0]);
    setWhatILearned('');
    setChallengesFaced('');
    setAchievements('');
    setNextDayPlan('');
    setIsModalOpen(false);
  };

  // Pre-load active journal id
  React.useEffect(() => {
    if (journals.length > 0 && !activeJournalId) {
      setActiveJournalId(journals[0].id);
    }
  }, [journals, activeJournalId]);

  const filteredJournals = journals.filter((j) => {
    const matchesSearch = j.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          j.whatILearned.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          j.challengesFaced.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDate = !selectedDateFilter || j.date === selectedDateFilter;
    return matchesSearch && matchesDate;
  }).sort((a,b) => b.date.localeCompare(a.date));

  const activeEntry = journals.find(j => j.id === activeJournalId) || (journals.length > 0 ? journals[0] : null);

  return (
    <div className="space-y-6">
      {/* Upper header controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs transition-colors">
        <div>
          <h1 className="text-xl font-display font-bold text-slate-900 dark:text-white">Professional Reflections Journal</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">Deconstruct challenges faced, daily achievements, and plan upcoming micro-sprints</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer shrink-0 transition-all"
        >
          <Plus className="w-4 h-4" /> Log Reflection
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Reflections Directory Filters & List */}
        <div className="space-y-4 lg:col-span-1">
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 shadow-xs space-y-3 transition-colors">
            <span className="text-[10px] block uppercase font-bold tracking-wider text-slate-400 dark:text-slate-550">
              Directories Filter
            </span>

            {/* Keyword Search */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search notes keywords..."
                className="pl-8 pr-3 py-1.5 text-xs border border-slate-200 dark:border-slate-705 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-200 w-full rounded-lg focus:outline-none"
              />
            </div>

            {/* Date filter pick */}
            <div className="relative">
              <input
                type="date"
                value={selectedDateFilter}
                onChange={(e) => setSelectedDateFilter(e.target.value)}
                className="py-1.5 px-3 text-xs border border-slate-200 dark:border-slate-705 bg-slate-50 dark:bg-slate-950 w-full rounded-lg focus:outline-none focus:ring-1 text-slate-600 dark:text-slate-300"
              />
              {selectedDateFilter && (
                <button 
                  onClick={() => setSelectedDateFilter('')}
                  className="absolute right-2 top-2 text-[10px] bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-300"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Chronological list cabinet */}
          <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
            {filteredJournals.map((j) => {
              const isActive = j.id === activeJournalId;
              return (
                <button
                  key={j.id}
                  onClick={() => setActiveJournalId(j.id)}
                  className={`w-full text-left p-3.5 rounded-2xl border transition-all space-y-1.5 cursor-pointer ${
                    isActive 
                      ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/10' 
                      : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-305 hover:border-slate-200 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex justify-between items-start text-[9px] w-full font-mono">
                    <span className={isActive ? 'text-blue-200' : 'text-slate-400 dark:text-slate-500'}>
                      Log ID: {j.id.slice(-5)}
                    </span>
                    <span className={`flex items-center gap-0.5 ${isActive ? 'text-blue-100 font-bold' : 'text-slate-500'}`}>
                      <Calendar className="w-3 h-3" /> {j.date}
                    </span>
                  </div>

                  <h3 className="text-xs font-bold font-display line-clamp-1">{j.title}</h3>
                  <p className={`text-[11px] line-clamp-2 ${isActive ? 'text-blue-100/90' : 'text-slate-500 dark:text-slate-400'}`}>
                    {j.whatILearned}
                  </p>
                </button>
              );
            })}

            {filteredJournals.length === 0 && (
              <p className="text-xs text-slate-400 text-center py-6 bg-slate-50 dark:bg-slate-950/20 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                 No logs conform to parameters.
              </p>
            )}
          </div>
        </div>

        {/* Right Side: Active entry details workspace */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xs p-6 space-y-5 transition-colors">
          {activeEntry ? (
            <>
              {/* Active journal header */}
              <div className="flex justify-between items-start gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
                    <BookOpen className="w-5 h-5 animate-pulse" />
                    <h2 className="text-base font-display font-bold text-slate-900 dark:text-white leading-snug">
                      {activeEntry.title}
                    </h2>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-400 font-mono">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Reflection Logged on: {activeEntry.date}</span>
                    <span>•</span>
                    <span>Active User Reflected</span>
                  </div>
                </div>

                <button 
                  onClick={() => {
                    deleteJournal(activeEntry.id);
                    setActiveJournalId(null);
                  }}
                  className="p-1.5 border border-slate-100 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 cursor-pointer transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* 4 prompts layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* 1. What I learned */}
                <div className="p-4 bg-slate-50/55 rounded-2xl border border-slate-100 space-y-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 flex items-center gap-1">
                    📖 What I Learned Today
                  </span>
                  <div className="text-xs font-sans text-slate-700 leading-relaxed text-slate-600">
                    {activeEntry.whatILearned}
                  </div>
                </div>

                {/* 2. Challenges */}
                <div className="p-4 bg-rose-50/20 rounded-2xl border border-rose-100/40 space-y-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-rose-500 flex items-center gap-1">
                    ⚠️ Challenges Faced & Obstacles
                  </span>
                  <div className="text-xs font-sans text-slate-700 leading-relaxed text-slate-600">
                    {activeEntry.challengesFaced || 'No specific technical speedbumps faced today. Progress was smooth.'}
                  </div>
                </div>

                {/* 3. Achievements */}
                <div className="p-4 bg-emerald-50/20 rounded-2xl border border-emerald-100/40 space-y-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-600 flex items-center gap-1">
                    🏆 Milestones Logged
                  </span>
                  <div className="text-xs font-sans text-slate-700 leading-relaxed text-slate-600">
                    {activeEntry.achievements || 'Accomplished standard continuous scheduled assignments.'}
                  </div>
                </div>

                {/* 4. Next day plan */}
                <div className="p-4 bg-blue-50/20 rounded-2xl border border-blue-100/40 space-y-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-blue-600 flex items-center gap-1">
                    🚀 Next Day Sprints & Scheduling
                  </span>
                  <div className="text-xs font-sans text-slate-700 leading-relaxed text-slate-600">
                    {activeEntry.nextDayPlan}
                  </div>
                </div>

              </div>
            </>
          ) : (
            <div className="text-center py-20 text-slate-400">
               No reflections recorded. Choose "Log Reflection" to write notes on study barriers!
            </div>
          )}
        </div>
      </div>

      {/* POPUP MODAL DIALOG */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full border border-slate-150 dark:border-slate-800 shadow-2xl p-6 relative transition-colors">
            
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-350 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-display font-bold text-base text-slate-900 dark:text-white mb-4 flex items-center gap-1.5">
              <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Write Reflection Notes
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                    Reflection Heading
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Cleared technical DSA roadblock"
                    className="w-full text-xs px-3 py-2 border border-slate-200 bg-slate-50 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Calendar Date
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full text-xs px-2 py-2 border border-slate-200 bg-slate-50 rounded-lg focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                    📖 What I Learned Today
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={whatILearned}
                    onChange={(e) => setWhatILearned(e.target.value)}
                    placeholder="Describe libraries, frameworks or algorithms learned..."
                    className="w-full text-xs px-3 py-2 border border-slate-200 bg-slate-50 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 font-sans"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                    ⚠️ Challenges Faced
                  </label>
                  <textarea
                    rows={3}
                    value={challengesFaced}
                    onChange={(e) => setChallengesFaced(e.target.value)}
                    placeholder="Encountered memory leaks? State synchronization errors?..."
                    className="w-full text-xs px-3 py-2 border border-slate-200 bg-slate-50 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 font-sans"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                    🏆 Achievements & Outcomes
                  </label>
                  <textarea
                    rows={3}
                    value={achievements}
                    onChange={(e) => setAchievements(e.target.value)}
                    placeholder="Solved 10 Leetcode? Finished Section 5 course?..."
                    className="w-full text-xs px-3 py-2 border border-slate-200 bg-slate-50 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 font-sans"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                    🚀 Next Day Plan
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={nextDayPlan}
                    onChange={(e) => setNextDayPlan(e.target.value)}
                    placeholder="What assignments should be scheduled tomorrow?..."
                    className="w-full text-xs px-3 py-2 border border-slate-200 bg-slate-50 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 font-sans"
                  />
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
                  Commit Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
