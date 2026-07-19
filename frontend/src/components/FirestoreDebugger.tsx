/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState } from 'react';
import { useCareer } from '../context/CareerContext';
import { Database, Eye, EyeOff, Search, Terminal, Copy, CheckCircle } from 'lucide-react';

export const FirestoreDebugger: React.FC = () => {
  const { currentUser, activities, goals, skills, certificates, journals, applications } = useCareer();
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeCollection, setActiveCollection] = useState<'profile' | 'activities' | 'goals' | 'skills' | 'certificates' | 'journal' | 'applications'>('profile');

  if (!currentUser) return null;

  // Format the mock Firestore database structure requested in the prompt
  const getCollectionJSON = () => {
    switch (activeCollection) {
      case 'profile':
        return currentUser;
      case 'activities':
        return activities.filter(a => a.userId === currentUser.uid);
      case 'goals':
        return goals.filter(g => g.userId === currentUser.uid);
      case 'skills':
        return skills.filter(s => s.userId === currentUser.uid);
      case 'certificates':
        return certificates.filter(c => c.userId === currentUser.uid);
      case 'journal':
        return journals.filter(j => j.userId === currentUser.uid);
      case 'applications':
        return applications.filter(a => a.userId === currentUser.uid);
    }
  };

  const copyToClipboard = () => {
    const text = JSON.stringify(getCollectionJSON(), null, 2);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-900 border-t border-slate-800 text-slate-300 font-mono text-[11px] select-text">
      {/* Drawer Toggle Bar */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between px-6 py-3 bg-slate-950 hover:bg-slate-900/90 cursor-pointer select-none transition-colors border-b border-slate-800"
      >
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-emerald-500 animate-pulse" />
          <span className="font-bold">Firestore Console Emulator</span>
          <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[9px] text-emerald-400 font-bold tracking-wider">
             SECURE OFFLINE
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[10px] text-slate-400">
            path: users/{currentUser.uid}/{activeCollection}
          </span>
          {isOpen ? (
            <div className="inline-flex items-center gap-1.5 text-rose-400 font-bold"><EyeOff className="w-3.5 h-3.5" /> Collapse Console</div>
          ) : (
            <div className="inline-flex items-center gap-1.5 text-emerald-400 font-bold"><Eye className="w-3.5 h-3.5" /> Expand Firestore JSON Document Tree</div>
          )}
        </div>
      </div>

      {isOpen && (
        <div className="p-5 grid grid-cols-1 md:grid-cols-5 gap-5 animate-in slide-in-from-bottom duration-200">
          
          {/* Left panel: Collection selectors */}
          <div className="space-y-1.5 md:col-span-1">
            <span className="text-[9px] font-bold text-slate-500 block uppercase tracking-widest pl-1">
               Collections
            </span>
            {(['profile', 'activities', 'goals', 'skills', 'certificates', 'journal', 'applications'] as const).map((col) => {
              const active = activeCollection === col;
              return (
                <button
                  key={col}
                  onClick={() => setActiveCollection(col)}
                  className={`w-full text-left p-2.5 rounded-lg border transition-all cursor-pointer font-mono font-bold flex justify-between items-center text-[10px] ${
                    active 
                      ? 'bg-emerald-950/40 border-emerald-500 text-emerald-400 shadow-sm shadow-emerald-500/5' 
                      : 'border-slate-800 bg-slate-900/40 hover:bg-slate-800 text-slate-400'
                  }`}
                >
                  <span>{col}</span>
                  <Terminal className="w-3 h-3 text-slate-500" />
                </button>
              );
            })}
          </div>

          {/* Right panel: Live JSON Tree Code container */}
          <div className="md:col-span-4 bg-slate-950 relative border border-slate-800 p-4 rounded-xl leading-relaxed">
            {/* Header copy buttons */}
            <div className="absolute top-3 right-3 flex items-center gap-2">
              <button
                onClick={copyToClipboard}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold hover:text-white rounded border border-slate-700 flex items-center gap-1 transition-all cursor-pointer"
              >
                {copied ? (
                  <>
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy JSON Payload</span>
                  </>
                )}
              </button>
            </div>

            {/* Document Path Indicator */}
            <div className="text-slate-500 text-[10px] font-bold pb-2.5 border-b border-slate-900 mb-3 select-none flex items-center gap-1.5">
              <span>db</span>
                <span>/</span>
                <span className="text-blue-400 font-semibold font-mono">users</span>
                <span>/</span>
                <span className="text-emerald-400 font-semibold font-mono">{currentUser.uid}</span>
                <span>/</span>
                <span className="text-pink-400 font-semibold font-mono">{activeCollection}</span>
            </div>

            {/* Code presentation window */}
            <div className="max-h-[220px] overflow-y-auto font-mono text-[10px] text-emerald-400/90 bg-transparent pr-1">
              <pre className="whitespace-pre-wrap">{JSON.stringify(getCollectionJSON(), null, 2)}</pre>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};
