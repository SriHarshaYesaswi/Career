/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useCareer } from '../context/CareerContext';
import { ApplicationTracker, ApplicationStatus } from '../types';
import { 
  Briefcase, 
  Trash2, 
  Plus, 
  X, 
  Linkedin, 
  Github, 
  FileText, 
  Calendar, 
  DollarSign, 
  CheckCircle,
  Clock,
  Sparkles,
  Link,
  Shield,
  UploadCloud,
  ArrowUpRight,
  Download,
  FileSpreadsheet,
  FileJson,
  Printer,
  LogOut,
  Camera
} from 'lucide-react';
import { downloadCSV, downloadJSON, triggerPDFReport } from '../utils/exportUtils';

export const IntegrationProfile: React.FC = () => {
  const { 
    currentUser, 
    updateProfile, 
    logout,
    applications, 
    addApplication, 
    updateApplication, 
    deleteApplication,
    activities,
    goals,
    skills,
    certificates,
    roadmaps,
    journals,
    courses,
    pastSemesters,
    exams,
    projects,
    badges
  } = useCareer();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [profileEditMode, setProfileEditMode] = useState(false);

  // Profile Form States
  const [profName, setProfName] = useState(currentUser?.name || '');
  const [profTitle, setProfTitle] = useState(currentUser?.profession || '');
  const [profEducation, setProfEducation] = useState(currentUser?.currentEducation || '');
  const [profLinkedin, setProfLinkedin] = useState(currentUser?.linkedinUrl || '');
  const [profGithub, setProfGithub] = useState(currentUser?.githubUrl || '');
  const [profPhotoUrl, setProfPhotoUrl] = useState(currentUser?.photoUrl || '');

  // Synchronize when current user profile changes
  useEffect(() => {
    if (currentUser) {
      setProfName(currentUser.name || '');
      setProfTitle(currentUser.profession || '');
      setProfEducation(currentUser.currentEducation || '');
      setProfLinkedin(currentUser.linkedinUrl || '');
      setProfGithub(currentUser.githubUrl || '');
      setProfPhotoUrl(currentUser.photoUrl || '');
    }
  }, [currentUser]);

  // Application tracker Form fields
  const [companyName, setCompanyName] = useState('');
  const [role, setRole] = useState('');
  const [type, setType] = useState<'Internship' | 'Full-Time Placement'>('Internship');
  const [status, setStatus] = useState<ApplicationStatus>('Applied');
  const [dateApplied, setDateApplied] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [salary, setSalary] = useState('');
  const [jobLink, setJobLink] = useState('');

  const resumeUploaderPlaceholder = () => {
    const fn = prompt('Mock CV File Upload! Enter simulated resume filename:', 'Harsha_Fullstack_Dev_2026.pdf');
    if (fn && currentUser) {
      updateProfile({
        resumeFileName: fn,
        resumeUrl: `https://career-tracker.offline/resumes/${fn}`
      });
    }
  };

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name: profName,
      profession: profTitle,
      currentEducation: profEducation,
      linkedinUrl: profLinkedin,
      githubUrl: profGithub,
      photoUrl: profPhotoUrl
    });
    setProfileEditMode(false);
  };

  const handleAppSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName || !role) return;

    addApplication({
      companyName,
      role,
      type,
      status,
      dateApplied,
      notes,
      salary,
      link: jobLink
    });

    // Reset fields
    setCompanyName('');
    setRole('');
    setNotes('');
    setSalary('');
    setJobLink('');
    setIsModalOpen(false);
  };

  const handleStatusShift = (appId: string, current: ApplicationStatus) => {
    const statuses: ApplicationStatus[] = ['Wishlist', 'Applied', 'In Interview', 'Offer', 'Rejected'];
    const idx = statuses.indexOf(current);
    const nextStatus = statuses[(idx + 1) % statuses.length];
    updateApplication(appId, { status: nextStatus });
  };

  const getStatusStyle = (s: ApplicationStatus) => {
    switch (s) {
      case 'Wishlist': return 'bg-slate-100 text-slate-800 border-slate-200';
      case 'Applied': return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'In Interview': return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'Offer': return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'Rejected': return 'bg-rose-50 text-rose-800 border-rose-200';
    }
  };

  if (!currentUser) return null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 1 Col: Student Profile details card config */}
        <div className="space-y-6 lg:col-span-1">
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 shadow-xs space-y-4 transition-colors">
          <div className="text-center space-y-2 pb-4 border-b border-slate-100 dark:border-slate-850 relative">
            <span className="absolute top-1 right-1 px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-900 dark:text-blue-300 border border-blue-200 dark:border-blue-900 text-[8px] font-bold tracking-wider">
               PERSISTENT ACCOUNT
            </span>
            {/* User portrait */}
            <div className="w-20 h-20 rounded-full bg-slate-900 overflow-hidden text-white font-display font-bold text-2xl flex items-center justify-center mx-auto shadow-md shadow-blue-100 dark:shadow-none border-4 border-white dark:border-slate-850">
              {currentUser.photoUrl ? (
                <img src={currentUser.photoUrl} alt={currentUser.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                currentUser.name.slice(0, 2).toUpperCase()
              )}
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-slate-900 dark:text-white leading-snug">{currentUser.name}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-405">{currentUser.profession}</p>
            </div>
          </div>

          {profileEditMode ? (
            <form onSubmit={handleProfileSave} className="space-y-3.5 text-xs text-slate-600 dark:text-slate-350">
              {/* Picture Upload (Any format support) */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold uppercase text-slate-400">Profile Photo (Any Image Format)</label>
                <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-100 dark:border-slate-850">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-800 flex items-center justify-center shrink-0 border border-slate-300 dark:border-slate-750">
                    {profPhotoUrl ? (
                      <img src={profPhotoUrl} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <Camera className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <label className="cursor-pointer bg-slate-950 hover:bg-slate-850 dark:bg-slate-800 dark:hover:bg-slate-750 text-white font-semibold text-[10px] px-2.5 py-1.5 rounded-lg inline-flex items-center gap-1.5 transition-colors">
                      <Camera className="w-3 h-3" />
                      Select Device Pic
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setProfPhotoUrl(reader.result as string);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="hidden" 
                      />
                    </label>
                    <p className="text-[8.5px] text-slate-400 dark:text-slate-500 mt-1">PNG, JPG, BMP, WEBP, GIF, SVG, etc.</p>
                  </div>
                  {profPhotoUrl && (
                    <button 
                      type="button" 
                      onClick={() => setProfPhotoUrl('')}
                      className="text-rose-500 hover:text-rose-600 text-[10px] font-bold cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <input 
                  type="text" 
                  value={profPhotoUrl}
                  onChange={(e) => setProfPhotoUrl(e.target.value)}
                  placeholder="Or paste direct image URL address..."
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 p-2 rounded-xl text-[11px] placeholder-slate-400 dark:text-white dark:border-slate-800 mt-1 focus:outline-none" 
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Name</label>
                <input 
                  type="text" 
                  value={profName} 
                  onChange={(e) => setProfName(e.target.value)} 
                  className="w-full bg-slate-50 border p-2 rounded-lg text-xs" 
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Profession</label>
                <input 
                  type="text" 
                  value={profTitle} 
                  onChange={(e) => setProfTitle(e.target.value)} 
                  className="w-full bg-slate-50 border p-2 rounded-lg text-xs" 
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Education Group</label>
                <input 
                  type="text" 
                  value={profEducation} 
                  onChange={(e) => setProfEducation(e.target.value)} 
                  className="w-full bg-slate-50 border p-2 rounded-lg text-xs" 
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-2">Social Sync Integration</label>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Linkedin className="w-4 h-4 text-slate-400" />
                    <input 
                      type="text" 
                      value={profLinkedin} 
                      onChange={(e) => setProfLinkedin(e.target.value)} 
                      placeholder="LinkedIn URL"
                      className="flex-1 bg-slate-50 border p-1 rounded-md text-[11px]" 
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Github className="w-4 h-4 text-slate-400" />
                    <input 
                      type="text" 
                      value={profGithub} 
                      onChange={(e) => setProfGithub(e.target.value)} 
                      placeholder="GitHub URL"
                      className="flex-1 bg-slate-50 border p-1 rounded-md text-[11px]" 
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button 
                  type="button" 
                  onClick={() => setProfileEditMode(false)}
                  className="px-2.5 py-1.5 border hover:bg-slate-50 text-[11px] rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold rounded-lg cursor-pointer shadow-xs"
                >
                  Save
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4 text-xs text-slate-650">
              <div className="space-y-2 border-b border-slate-100 pb-3">
                <div className="flex justify-between">
                  <span className="text-slate-450 font-semibold text-[10px] uppercase tracking-wider">Education</span>
                  <span className="text-slate-700 font-medium text-right leading-relaxed">{currentUser.currentEducation}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-450 font-semibold text-[10px] uppercase tracking-wider">Email</span>
                  <span className="text-slate-700 font-mono text-right">{currentUser.email}</span>
                </div>
              </div>

              {/* INTEGRATIONS SYNC LINKS */}
              <div className="space-y-2.5 border-b border-slate-100 pb-3">
                <span className="text-slate-450 font-semibold text-[10px] uppercase tracking-wider block">Connected Accounts</span>
                
                <div className="flex items-center justify-between p-2.5 bg-slate-50/70 border border-slate-100 rounded-xl hover:border-blue-100 transition-all">
                  <div className="flex items-center gap-2">
                    <Linkedin className="w-4 h-4 text-blue-600" />
                    <div>
                      <h4 className="font-bold text-[11px]">LinkedIn integration</h4>
                      <p className="text-[9px] text-slate-400">Validated professional networks</p>
                    </div>
                  </div>
                  {currentUser.linkedinUrl ? (
                    <a href={currentUser.linkedinUrl} target="_blank" rel="noopener noreferrer" className="p-1 rounded bg-white border border-slate-200 hover:bg-slate-50 text-slate-500">
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </a>
                  ) : (
                    <span className="text-[10px] text-slate-400 font-semibold opacity-60">Disconnected</span>
                  )}
                </div>

                <div className="flex items-center justify-between p-2.5 bg-slate-50/70 border border-slate-100 rounded-xl hover:border-blue-100 transition-all">
                  <div className="flex items-center gap-2">
                    <Github className="w-4 h-4 text-slate-900" />
                    <div>
                      <h4 className="font-bold text-[11px]">GitHub commits sync</h4>
                      <p className="text-[9px] text-slate-400">Repositories, stars & coding</p>
                    </div>
                  </div>
                  {currentUser.githubUrl ? (
                    <a href={currentUser.githubUrl} target="_blank" rel="noopener noreferrer" className="p-1 rounded bg-white border border-slate-200 hover:bg-slate-50 text-slate-500">
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </a>
                  ) : (
                    <span className="text-[10px] text-slate-400 font-semibold opacity-60">Disconnected</span>
                  )}
                </div>
              </div>

              {/* RESUME UPLOAD TRACKER */}
              <div className="space-y-2.5">
                <span className="text-slate-450 font-semibold text-[10px] uppercase tracking-wider block">Resume Track Status</span>
                
                <div className="p-3 bg-blue-50/30 border border-blue-100 rounded-xl flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <div className="w-8 h-8 rounded-lg bg-blue-600/10 text-blue-600 flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="overflow-hidden">
                      <h4 className="font-bold text-[11px] truncate">
                        {currentUser.resumeFileName || 'Primary_Resume_Academic.pdf'}
                      </h4>
                      <p className="text-[9px] text-slate-400">Synced to offline database</p>
                    </div>
                  </div>

                  <button 
                    onClick={resumeUploaderPlaceholder}
                    className="p-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 shrink-0 cursor-pointer"
                    title="Upload simulated CV"
                  >
                    <UploadCloud className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <button 
                onClick={() => setProfileEditMode(true)}
                className="w-full py-1.5 bg-slate-950 dark:bg-slate-800 text-white font-bold rounded-lg hover:bg-slate-800 dark:hover:bg-slate-700 transition-all text-xs cursor-pointer"
              >
                Modify Portfolio Credentials
              </button>

              <div className="border-t border-slate-100 dark:border-slate-805/40 pt-3 mt-1.5">
                <button 
                  onClick={() => logout()}
                  className="w-full py-1.5 bg-rose-50/80 hover:bg-rose-100/90 dark:bg-rose-950/20 dark:hover:bg-rose-950/35 border border-rose-100 dark:border-rose-950/30 text-rose-600 dark:text-rose-400 font-bold rounded-lg transition-all text-xs flex items-center justify-center gap-2 cursor-pointer"
                  id="btn_profile_logout_action"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out from Nexora
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Data Portability and Offline Exports Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-105 dark:border-slate-800 rounded-3xl p-5 shadow-xs space-y-4 transition-colors">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="font-display font-bold text-xs sm:text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Download className="w-4 h-4 text-blue-650 dark:text-blue-400" /> Data Portability & Backup
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Export full personal metrics, academic standings, and job pipeline records offline.</p>
          </div>
          
          <div className="space-y-2.5">
            {/* EXCEL SPREADSHEET */}
            <button
              onClick={() => downloadCSV({
                profile: currentUser,
                activities,
                goals,
                skills,
                certificates,
                roadmaps,
                journals,
                applications,
                courses,
                pastSemesters,
                exams,
                projects,
                badges
              })}
              className="w-full flex items-center justify-between p-2.5 bg-emerald-50/20 hover:bg-emerald-55/40 border border-emerald-100 dark:border-emerald-950/60 rounded-xl transition-all text-left cursor-pointer group"
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-[11px] text-slate-800 dark:text-slate-100">Excel Spreadsheet (.csv)</h4>
                  <p className="text-[9px] text-slate-400 dark:text-slate-500">Structured tables ready for Excel/Sheets</p>
                </div>
              </div>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-450 group-hover:text-emerald-500 transition-all" />
            </button>

            {/* VECTOR PRINT PDF REPORT */}
            <button
              onClick={() => triggerPDFReport({
                profile: currentUser,
                activities,
                goals,
                skills,
                certificates,
                roadmaps,
                journals,
                applications,
                courses,
                pastSemesters,
                exams,
                projects,
                badges
              })}
              className="w-full flex items-center justify-between p-2.5 bg-blue-50/20 hover:bg-blue-55/40 border border-blue-100 dark:border-blue-950/60 rounded-xl transition-all text-left cursor-pointer group"
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <Printer className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-[11px] text-slate-800 dark:text-slate-100">Vector PDF Portfolio Report</h4>
                  <p className="text-[9px] text-slate-400 dark:text-slate-500">Pristine printable document audit dossier</p>
                </div>
              </div>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-455 group-hover:text-blue-500 transition-all" />
            </button>

            {/* MACHINE PORTABLE JSON */}
            <button
              onClick={() => downloadJSON({
                profile: currentUser,
                activities,
                goals,
                skills,
                certificates,
                roadmaps,
                journals,
                applications,
                courses,
                pastSemesters,
                exams,
                projects,
                badges
              })}
              className="w-full flex items-center justify-between p-2.5 bg-purple-50/20 hover:bg-purple-55/40 border border-purple-100 dark:border-purple-950/60 rounded-xl transition-all text-left cursor-pointer group"
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                  <FileJson className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-[11px] text-slate-800 dark:text-slate-100">Machine Backup (.json)</h4>
                  <p className="text-[9px] text-slate-400 dark:text-slate-500">Full system metadata state export</p>
                </div>
              </div>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-455 group-hover:text-purple-500 transition-all" />
            </button>
          </div>
        </div>
      </div>

      {/* Right 2 Cols: Internship & Recruitment tracker board */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-6 shadow-xs space-y-4 transition-colors">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-lg font-display font-bold text-slate-900 dark:text-white">Internship & Placement Pipeline</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Log job leads, schedule recruiting rounds, and keep tabs on interview responses</p>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer transition-all"
            >
              <Plus className="w-3.5 h-3.5" /> New Lead
            </button>
          </div>

          <div className="space-y-3.5">
            {applications.map((ap) => {
              const theme = getStatusStyle(ap.status);
              return (
                <div 
                  key={ap.id} 
                  className="p-4 rounded-2xl border border-slate-100 hover:border-blue-100 hover:bg-slate-50/20 shadow-xs space-y-3 transition-all relative group"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-display font-bold text-slate-900 text-xs sm:text-sm">
                          {ap.companyName}
                        </h4>
                        <span className="text-slate-300">•</span>
                        <span className="text-[11px] text-slate-500">{ap.role}</span>
                      </div>
                      
                      <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Applied: {ap.dateApplied}</span>
                        {ap.salary && (
                          <>
                            <span>•</span>
                            <span className="flex items-center font-semibold text-slate-700">
                              <DollarSign className="w-3 h-3 text-slate-500" /> {ap.salary}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {/* Interactive toggle Status block */}
                      <button 
                        onClick={() => handleStatusShift(ap.id, ap.status)}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border cursor-pointer hover:scale-[1.03] transition-all ${theme}`}
                        title="Click to shift status state"
                      >
                        {ap.status}
                      </button>

                      <button 
                        onClick={() => deleteApplication(ap.id)}
                        className="p-1.5 border border-slate-100 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-600 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {ap.notes && (
                    <p className="text-xs text-slate-550 leading-relaxed p-2.5 bg-slate-50 border border-slate-100/60 rounded-xl">
                      {ap.notes}
                    </p>
                  )}

                  {ap.link && (
                    <a 
                      href={ap.link} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-[10px] font-semibold text-blue-600 hover:underline flex items-center gap-0.5 w-fit"
                    >
                      <Link className="w-3 h-3" /> Visit Company Careers Portal
                    </a>
                  )}
                </div>
              );
            })}

            {applications.length === 0 && (
              <p className="text-xs text-slate-400 text-center py-10 bg-slate-50/50 border border-dashed rounded-2xl">
                 No active job/internship applications logged. Click New Lead to append tracking logs.
              </p>
            )}
          </div>
        </div>

      </div>

      {/* POPUP MODAL DIALOG */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-sm w-full border border-slate-150 dark:border-slate-800 shadow-2xl p-6 relative transition-colors">
            
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-350 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-display font-bold text-base text-slate-900 dark:text-white mb-4 flex items-center gap-1.5">
              <Briefcase className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Log Recruiting Pipeline
            </h3>

            <form onSubmit={handleAppSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Company Name
                </label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Google India / Stripe"
                  className="w-full text-xs px-3 py-2 border border-slate-200 bg-slate-50 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Target Role Title
                </label>
                <input
                  type="text"
                  required
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g. Summer SDE Intern"
                  className="w-full text-xs px-3 py-2 border border-slate-200 bg-slate-50 rounded-lg focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                    recruitment contract
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as 'Internship' | 'Full-Time Placement')}
                    className="w-full text-xs px-3 py-2 border border-slate-200 bg-slate-50 rounded-lg focus:outline-none"
                  >
                    <option value="Internship">Internship Track</option>
                    <option value="Full-Time Placement">Full-Time Placement</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                    Application Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as ApplicationStatus)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 bg-slate-50 rounded-lg focus:outline-none"
                  >
                    <option value="Wishlist">Wishlist</option>
                    <option value="Applied">Applied</option>
                    <option value="In Interview">In Interview</option>
                    <option value="Offer">Recruiting Offer</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                    Submission Date
                  </label>
                  <input
                    type="date"
                    required
                    value={dateApplied}
                    onChange={(e) => setDateApplied(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 bg-slate-50 rounded-lg focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                    Salary Compensation (optional)
                  </label>
                  <input
                    type="text"
                    value={salary}
                    onChange={(e) => setSalary(e.target.value)}
                    placeholder="e.g. $7,500/mo"
                    className="w-full text-xs px-3 py-2 border border-slate-200 bg-slate-50 rounded-lg focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Careers Page Link (optional)
                </label>
                <input
                  type="text"
                  value={jobLink}
                  onChange={(e) => setJobLink(e.target.value)}
                  placeholder="https://company.com/careers"
                  className="w-full text-xs px-3 py-2 border border-slate-200 bg-slate-50 rounded-lg focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Recruiter Contact & Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Solved OA graphs chapter. Coding phone test on June 5th."
                  rows={2}
                  className="w-full text-xs px-3 py-2 border border-slate-200 bg-slate-50 rounded-lg focus:outline-none"
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
                  Deploy Tracking Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
