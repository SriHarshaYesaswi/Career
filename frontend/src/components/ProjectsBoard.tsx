/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useCareer } from '../context/CareerContext';
import { ProjectCard } from '../types';
import { 
  Plus, 
  Trash2, 
  Github, 
  ExternalLink, 
  ChevronLeft, 
  ChevronRight, 
  Tag, 
  Briefcase, 
  Layers, 
  ArrowRight,
  PlusCircle,
  Sparkles,
  Link2,
  FolderCode
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const ProjectsBoard: React.FC = () => {
  const { 
    currentUser, 
    projects, 
    addProject, 
    updateProject, 
    deleteProject, 
    moveProject 
  } = useCareer();

  const [isAddProjOpen, setIsAddProjOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newLane, setNewLane] = useState<ProjectCard['lane']>('Planned');
  const [newTechString, setNewTechString] = useState(''); // Comma-separated tech
  const [newGithub, setNewGithub] = useState('');
  const [newLive, setNewLive] = useState('');

  if (!currentUser) return null;

  // Lane configurations
  const LANES: { id: ProjectCard['lane']; name: string; color: string; border: string; bg: string }[] = [
    { id: 'Planned', name: 'Brainstorm/Planned', color: 'text-violet-605 bg-violet-60 border-violet-100', border: 'border-t-4 border-t-violet-400', bg: 'bg-violet-50/10' },
    { id: 'In Progress', name: 'Coding & Syncing', color: 'text-amber-605 bg-amber-60 border-amber-100', border: 'border-t-4 border-t-amber-400', bg: 'bg-amber-50/10' },
    { id: 'Completed', name: 'Completed Builds', color: 'text-emerald-650 bg-emerald-60 border-emerald-100', border: 'border-t-4 border-t-emerald-400', bg: 'bg-emerald-50/10' },
    { id: 'Portfolio Ready', name: 'Portfolio Deployed 🚀', color: 'text-blue-650 bg-blue-60 border-blue-100', border: 'border-t-4 border-t-blue-500', bg: 'bg-blue-50/15' }
  ];

  // Colors for Tech tags
  const getTagColor = (tech: string) => {
    const t = tech.toLowerCase().trim();
    if (['react', 'typescript', 'js', 'html5', 'css3'].includes(t)) {
      return 'bg-blue-50 text-blue-600 border border-blue-100';
    }
    if (['firebase', 'cloudsql', 'firestore', 'supabase'].includes(t)) {
      return 'bg-amber-50 text-amber-600 border border-amber-100';
    }
    if (['python', 'django', 'fastapi'].includes(t)) {
      return 'bg-emerald-50 text-emerald-600 border border-emerald-100';
    }
    if (['java', 'cpp', 'rust', 'go'].includes(t)) {
      return 'bg-rose-50 text-rose-600 border border-rose-100';
    }
    return 'bg-slate-100 text-slate-550 border border-slate-150';
  };

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDesc.trim()) {
      alert('Please fill out project heading details.');
      return;
    }

    const tags = newTechString
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    addProject({
      title: newTitle.trim(),
      description: newDesc.trim(),
      lane: newLane,
      techStack: tags,
      githubLink: newGithub.trim() || undefined,
      liveLink: newLive.trim() || undefined
    });

    // Reset fields
    setNewTitle('');
    setNewDesc('');
    setNewLane('Planned');
    setNewTechString('');
    setNewGithub('');
    setNewLive('');
    setIsAddProjOpen(false);
  };

  // Drag and Shift Helpers
  const shiftLane = (id: string, currentLane: ProjectCard['lane'], direction: 'left' | 'right') => {
    const laneSequence: ProjectCard['lane'][] = ['Planned', 'In Progress', 'Completed', 'Portfolio Ready'];
    const idx = laneSequence.indexOf(currentLane);
    let nextIdx = idx + (direction === 'left' ? -1 : 1);
    
    if (nextIdx >= 0 && nextIdx < laneSequence.length) {
      moveProject(id, laneSequence[nextIdx]);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* HEADER ROW */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-violet-600 text-white rounded-lg">
              <FolderCode className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-display font-bold text-slate-900 tracking-tight">Active Portfolio Board</h1>
          </div>
          <p className="text-xs text-slate-500">A Kanban pipeline to organize your engineering works from conceptual drafts to public live hostings.</p>
        </div>
        <button
          onClick={() => { setNewLane('Planned'); setIsAddProjOpen(true); }}
          className="px-4 py-1.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 self-start cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add Project Draft
        </button>
      </div>

      {/* KANBAN GRID CHASSIS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4.5">
        {LANES.map(lane => {
          const laneProjects = projects.filter(p => p.lane === lane.id);
          
          return (
            <div 
              key={lane.id} 
              className={`rounded-3xl border border-slate-100 flex flex-col min-h-[500px] p-4.5 ${lane.border} ${lane.bg}`}
            >
              
              {/* Lane Header */}
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${
                    lane.id === 'Planned' ? 'bg-violet-400' :
                    lane.id === 'In Progress' ? 'bg-amber-400' :
                    lane.id === 'Completed' ? 'bg-emerald-400' : 'bg-blue-500'
                  }`} />
                  {lane.name}
                </h3>
                <span className="font-mono text-[10px] bg-white border border-slate-100 text-slate-500 font-bold px-2 py-0.5 rounded-full">
                  {laneProjects.length}
                </span>
              </div>

              {/* Lane Cards List (Draggable Emulator) */}
              <div className="flex-1 space-y-4 overflow-y-auto max-h-[480px] pr-0.5 scrollbar-thin">
                {laneProjects.length === 0 ? (
                  <div className="h-44 border border-dashed border-slate-150 rounded-2xl flex flex-col items-center justify-center p-4 text-center text-slate-350">
                    <span className="text-[10px] font-medium mb-1">No items logged</span>
                    <button
                      onClick={() => { setNewLane(lane.id); setIsAddProjOpen(true); }}
                      className="text-[9px] text-violet-600 hover:underline cursor-pointer"
                    >
                      + Create entry
                    </button>
                  </div>
                ) : (
                  laneProjects.map(proj => (
                    <motion.div
                      layout
                      initial={{ scale: 0.98, opacity: 0.9 }}
                      animate={{ scale: 1, opacity: 1 }}
                      key={proj.id}
                      className="bg-white border border-slate-100 rounded-2xl p-4 shadow-3xs flex flex-col justify-between hover:shadow-2xs transition-shadow relative group"
                    >
                      <div className="space-y-2.5">
                        <div className="flex justify-between items-start gap-1">
                          <h4 className="text-xs font-bold text-slate-900 leading-snug group-hover:text-violet-600 transition-colors">
                            {proj.title}
                          </h4>
                          <button
                            onClick={() => deleteProject(proj.id)}
                            className="text-slate-300 hover:text-rose-500 transition-colors cursor-pointer"
                            title="Remove project draft"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        
                        <p className="text-[11px] text-slate-500 leading-relaxed font-sans font-medium line-clamp-3">
                          {proj.description}
                        </p>

                        {/* Tech stack badge tags */}
                        {proj.techStack && proj.techStack.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-1">
                            {proj.techStack.map((tech, i) => (
                              <span key={i} className={`text-[8.5px] font-mono px-1.5 py-0.5 rounded-md font-semibold tracking-wide ${getTagColor(tech)}`}>
                                {tech}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Bottom row: Links and Shifter trigger buttons */}
                      <div className="flex items-center justify-between mt-4.5 pt-3.5 border-t border-slate-50">
                        {/* URL Links */}
                        <div className="flex gap-2">
                          {proj.githubLink && (
                            <a 
                              href={proj.githubLink}
                              target="_blank" 
                              rel="noreferrer" 
                              className="p-1 rounded-lg border border-slate-100 text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                              title="View Github codebase"
                            >
                              <Github className="w-3.5 h-3.5" />
                            </a>
                          )}
                          {proj.liveLink && (
                            <a 
                              href={proj.liveLink}
                              target="_blank" 
                              rel="noreferrer" 
                              className="p-1 rounded-lg border border-slate-100 text-slate-500 hover:bg-slate-50 hover:text-slate-950 transition-colors"
                              title="Visit hosted deployment"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                          {!proj.githubLink && !proj.liveLink && (
                            <span className="text-[9px] font-mono text-slate-350 italic">No connections set</span>
                          )}
                        </div>

                        {/* Card Lane Shifter Actions */}
                        <div className="flex items-center gap-1">
                          {lane.id !== 'Planned' && (
                            <button
                              onClick={() => shiftLane(proj.id, proj.lane, 'left')}
                              className="p-1 hover:bg-slate-100 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer transition-colors"
                              title="Shift lane left"
                            >
                              <ChevronLeft className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {lane.id !== 'Portfolio Ready' && (
                            <button
                              onClick={() => shiftLane(proj.id, proj.lane, 'right')}
                              className="p-1 hover:bg-slate-100 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer transition-colors"
                              title="Shift lane right"
                            >
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                    </motion.div>
                  ))
                )}
              </div>

            </div>
          );
        })}
      </div>

      {/* DETAILED PROJECT MODAL POPUP */}
      <AnimatePresence>
        {isAddProjOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl border border-slate-100 p-6 w-full max-w-md shadow-2xl relative"
            >
              <h3 className="text-base font-display font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-violet-650" /> Draft Project Entry
              </h3>
              <p className="text-xs text-slate-400 mb-4">Structure project milestones, tech badges, and repositories for display.</p>

              <form onSubmit={handleCreateProject} className="space-y-4 text-xs">
                
                <div className="space-y-1">
                  <label className="font-bold text-slate-650">Project Heading</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Student OS Workspace" 
                    value={newTitle}
                    onChange={e => setNewTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-650">Detailed Narrative Description</label>
                  <textarea 
                    placeholder="Outline key technical functionalities, architectural goals, and system elements..." 
                    value={newDesc}
                    onChange={e => setNewDesc(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white leading-relaxed font-medium text-slate-700"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-650">Active Lane Location</label>
                    <select
                      value={newLane}
                      onChange={e => setNewLane(e.target.value as ProjectCard['lane'])}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white font-semibold text-slate-705"
                    >
                      <option value="Planned">Brainstorm/Planned</option>
                      <option value="In Progress">Coding & Syncing</option>
                      <option value="Completed">Completed Builds</option>
                      <option value="Portfolio Ready">Portfolio Deployed 🚀</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-650">Programming/Tech tags</label>
                    <input 
                      type="text" 
                      placeholder="e.g. React, Node, Tailwind" 
                      value={newTechString}
                      onChange={e => setNewTechString(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-600 flex items-center gap-1.5"><Github className="w-3.5 h-3.5" /> Repository URL</label>
                    <input 
                      type="url" 
                      placeholder="https://github.com/..." 
                      value={newGithub}
                      onChange={e => setNewGithub(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-600 flex items-center gap-1.5"><Link2 className="w-3.5 h-3.5" /> Live Hosting URL</label>
                    <input 
                      type="url" 
                      placeholder="https://..." 
                      value={newLive}
                      onChange={e => setNewLive(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 font-mono"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-50">
                  <button
                    type="button"
                    onClick={() => setIsAddProjOpen(false)}
                    className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-bold"
                  >
                    Add Project Card
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
