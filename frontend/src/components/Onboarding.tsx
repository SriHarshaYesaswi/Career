/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useCareer } from '../context/CareerContext';
import { 
  Sparkles, 
  GraduationCap, 
  Target, 
  Cpu, 
  ChevronRight, 
  ChevronLeft,
  Check,
  Zap,
  Tag,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const Onboarding: React.FC = () => {
  const { currentUser, updateProfile, triggerNotification } = useCareer();
  const [step, setStep] = useState(1);

  // Form states matching user onboarding fields
  const [collegeName, setCollegeName] = useState('');
  const [degree, setDegree] = useState('');
  const [yearOfStudy, setYearOfStudy] = useState('Sophomore (Year 2)');
  const [careerInterest, setCareerInterest] = useState('');
  const [targetRole, setTargetRole] = useState('AI Engineer');
  const [skillsStr, setSkillsStr] = useState('');

  // Skill tag presets
  const [chosenSkills, setChosenSkills] = useState<string[]>(['React', 'Firebase', 'Data Structures']);

  const handleTogglePresetSkill = (sk: string) => {
    if (chosenSkills.includes(sk)) {
      setChosenSkills(prev => prev.filter(item => item !== sk));
    } else {
      setChosenSkills(prev => [...prev, sk]);
    }
  };

  const handleAddCustomSkill = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const clean = skillsStr.replace(/,/g, '').trim();
      if (clean && !chosenSkills.includes(clean)) {
        setChosenSkills(prev => [...prev, clean]);
      }
      setSkillsStr('');
    }
  };

  const handleRemoveSkill = (sk: string) => {
    setChosenSkills(prev => prev.filter(item => item !== sk));
  };

  const skipOnboarding = () => {
    updateProfile({
      onboarded: true
    });
    triggerNotification('Welcome Aboard!', 'You can customize your career profile parameters anytime from settings.', 'success');
  };

  const saveOnboarding = () => {
    // Process form
    const parsedSkills = [...chosenSkills];
    const cleanSkillsInput = skillsStr.trim();
    if (cleanSkillsInput && !parsedSkills.includes(cleanSkillsInput)) {
      parsedSkills.push(cleanSkillsInput);
    }

    updateProfile({
      collegeName: collegeName.trim() || 'Unspecified University',
      degree: degree.trim() || 'CS & IT Degree',
      yearOfStudy,
      targetRole: targetRole || 'Software Dev',
      careerInterests: careerInterest.trim() ? [careerInterest.trim()] : ['Frontend', 'Fullstack', 'Artificial Intelligence'],
      skills: parsedSkills,
      onboarded: true
    });

    triggerNotification(
      'Profile Calibrated! 🎯', 
      `Setup complete. Your dynamic digital twin has calibrated for target role: ${targetRole || 'FullStack Engineer'}.`, 
      'success'
    );
  };

  const totalSteps = 3;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center items-center p-4 text-slate-900 dark:text-slate-100 relative overflow-hidden transition-colors duration-300">
      
      {/* Background radial highlight */}
      <div className="absolute top-[20%] left-[50%] -translate-x-[50%] w-[500px] h-[550px] rounded-full bg-indigo-500/10 dark:bg-indigo-600/15 blur-[120px] pointer-events-none" />

      {/* Main glass card */}
      <div className="w-full max-w-lg bg-white dark:bg-slate-900/40 backdrop-blur-xl border border-slate-205 dark:border-slate-800/80 rounded-3xl p-6 sm:p-9 shadow-2xl relative">
        
        {/* TOP SKIP CONTROLLER */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-violet-600 via-rose-500 to-amber-500 flex items-center justify-center text-white shadow-xs">
              <Sparkles className="w-4.5 h-4.5 text-white animate-pulse" />
            </div>
            <span className="text-xs.5 font-bold text-slate-550 dark:text-slate-355 tracking-wide font-mono">Calibrating Profile</span>
          </div>

          <button
            type="button"
            onClick={skipOnboarding}
            className="text-xs font-bold text-slate-550 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors bg-slate-100 hover:bg-slate-200 dark:bg-slate-950/20 dark:hover:bg-slate-950/40 px-3.5 py-1.5 rounded-full border border-slate-200 dark:border-slate-800"
          >
            Skip Setup
          </button>
        </div>

        {/* PROGRESS METER */}
        <div className="mb-7">
          <div className="flex justify-between items-center text-[10.5px] font-bold text-slate-500 dark:text-slate-400 mb-2 font-mono">
            <span>STEP {step} OF {totalSteps}</span>
            <span>{Math.round((step / totalSteps) * 100)}% COMPLETE</span>
          </div>
          <div className="w-full h-1 bg-slate-200 dark:bg-slate-850 rounded-full overflow-hidden flex gap-0.5">
            {[1, 2, 3].map((val) => (
              <div 
                key={val}
                className={`h-full flex-1 transition-all duration-350 ${
                  step >= val ? 'bg-indigo-550 shadow-[0_0_8px_rgba(99,102,241,0.5)]' : 'bg-slate-200 dark:bg-slate-800'
                }`}
              />
            ))}
          </div>
        </div>

        {/* STEPS SWAP */}
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4.5"
            >
              <div>
                <h3 className="text-xl font-display font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <GraduationCap className="text-indigo-600 dark:text-indigo-400 w-5.5 h-5.5" />
                  Your Academic Base
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Provide your current college and education parameters for performance calibration.</p>
              </div>

              <div className="space-y-3.5 pt-2">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                    College / University Name
                  </label>
                  <input
                    type="text"
                    value={collegeName}
                    onChange={(e) => setCollegeName(e.target.value)}
                    placeholder="e.g. Stanford University"
                    className="block w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl text-xs.5 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-550 transition-all font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                    Degree & Specialization
                  </label>
                  <input
                    type="text"
                    value={degree}
                    onChange={(e) => setDegree(e.target.value)}
                    placeholder="e.g. B.S. in Computer Science"
                    className="block w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl text-xs.5 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-550 transition-all font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-505 dark:text-slate-404 mb-1.5">
                    Current Year of Study
                  </label>
                  <select
                    value={yearOfStudy}
                    onChange={(e) => setYearOfStudy(e.target.value)}
                    className="block w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl text-xs.5 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-550 transition-all font-medium cursor-pointer"
                  >
                    <option value="Freshman (Year 1)">Freshman (Year 1)</option>
                    <option value="Sophomore (Year 2)">Sophomore (Year 2)</option>
                    <option value="Junior (Year 3)">Junior (Year 3)</option>
                    <option value="Senior (Year 4)">Senior (Year 4)</option>
                    <option value="Graduate / PG Study">Graduate / PG Study</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4.5"
            >
              <div>
                <h3 className="text-xl font-display font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Target className="text-indigo-650 dark:text-indigo-400 w-5.5 h-5.5" />
                  Your Career Focus
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Let the simulator build your roadmap and calculate compatibility milestones.</p>
              </div>

              <div className="space-y-3.5 pt-2">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                    Target Role
                  </label>
                  <select
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    className="block w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl text-xs.5 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-550 transition-all font-medium cursor-pointer"
                  >
                    {[
                      'AI Engineer',
                      'Full-Stack Developer',
                      'Google SDE Spec',
                      'Data Scientist',
                      'Product Manager',
                      'Cloud / DevOps Engineer',
                      'Technical Founder'
                    ].map((role) => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-505 dark:text-slate-400 mb-1.5">
                    What primary technical interest drives you?
                  </label>
                  <input
                    type="text"
                    value={careerInterest}
                    onChange={(e) => setCareerInterest(e.target.value)}
                    placeholder="e.g. Machine Learning, Distributed Systems, UX Design"
                    className="block w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl text-xs.5 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-550 transition-all font-medium"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4.5"
            >
              <div>
                <h3 className="text-xl font-display font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Cpu className="text-indigo-650 dark:text-indigo-400 w-5.5 h-5.5" />
                  Your Core Skills
                </h3>
                <p className="text-xs text-slate-550 dark:text-slate-400 mt-1">Input your current skills. Hit <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-500/10 px-1 py-0.5 rounded">Enter</span> or comma to add tags dynamically.</p>
              </div>

              <div className="space-y-3.5 pt-2">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                    Dynamic Skill Points Tagging
                  </label>
                  <input
                    type="text"
                    value={skillsStr}
                    onChange={(e) => setSkillsStr(e.target.value)}
                    onKeyDown={handleAddCustomSkill}
                    placeholder="Type skill and click enter..."
                    className="block w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl text-xs.5 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-550 transition-all font-medium"
                  />
                </div>

                {/* Tags lists */}
                {chosenSkills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto bg-slate-50 dark:bg-slate-955/40 p-2.5 rounded-xl border border-slate-200 dark:border-slate-850">
                    {chosenSkills.map(sk => (
                      <span 
                        key={sk} 
                        className="inline-flex items-center gap-1 bg-indigo-600/10 text-indigo-600 dark:text-indigo-300 text-[10px] font-bold px-2 py-1 rounded-full border border-indigo-500/20 font-sans"
                      >
                        {sk}
                        <button 
                          type="button" 
                          onClick={() => handleRemoveSkill(sk)}
                          className="hover:text-red-500 text-indigo-450 shrink-0 font-bold"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Skill point presets */}
                <div>
                  <label className="block text-[9.5px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Suggested presets
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      'Python',
                      'TypeScript',
                      'AWS Cloud',
                      'Docker',
                      'Algorithms',
                      'MySQL',
                      'Machine Learning'
                    ].map(preset => {
                      const isChosen = chosenSkills.includes(preset);
                      return (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => handleTogglePresetSkill(preset)}
                          className={`text-[9.5px] font-bold px-2.5 py-1 rounded-full transition-all border cursor-pointer ${
                            isChosen 
                              ? 'bg-indigo-650 border-indigo-500 text-white' 
                              : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-305 dark:hover:border-slate-700 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          {preset}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* BOTTOM CONTROLS */}
        <div className="flex items-center justify-between mt-8 pt-5 border-t border-slate-200 dark:border-slate-805/80">
          <div>
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep(prev => prev - 1)}
                className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-650 dark:text-slate-450 hover:text-slate-900 dark:hover:text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all font-sans cursor-pointer border border-slate-200 dark:border-slate-800"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous Set
              </button>
            )}
          </div>

          <div>
            {step < totalSteps ? (
              <button
                type="button"
                onClick={() => setStep(prev => prev + 1)}
                className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-xs.5 font-bold transition-all shadow-md shadow-indigo-600/10 cursor-pointer"
              >
                Next Section
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={saveOnboarding}
                className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl text-xs.5 font-bold transition-all shadow-md shadow-emerald-600/10 cursor-pointer"
              >
                Complete Onboarding
                <Check className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
