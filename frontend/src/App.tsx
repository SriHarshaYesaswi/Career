/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { CareerProvider, useCareer } from './context/CareerContext';
import { Auth } from './components/Auth';
import { Onboarding } from './components/Onboarding';
import { Dashboard } from './components/Dashboard';
import { Activities } from './components/Activities';
import { Goals } from './components/Goals';
import { Skills } from './components/Skills';
import { Certificates } from './components/Certificates';
import { Roadmaps } from './components/Roadmaps';
import { Journal } from './components/Journal';
import { Analytics } from './components/Analytics';
import { IntegrationProfile } from './components/IntegrationProfile';
import { NotificationBar } from './components/NotificationBar';
import { StudyStation } from './components/StudyStation';
import { Academics } from './components/Academics';
import { ProjectsBoard } from './components/ProjectsBoard';
import { AIAcademicHub } from './components/AIAcademicHub';
import { CareerUniverse } from './components/CareerUniverse';
import { OAuthCallback } from './components/OAuthCallback';

import { 
  Home, 
  Calendar, 
  Target, 
  Cpu, 
  Award, 
  BookOpen, 
  TrendingUp, 
  Briefcase, 
  Bell, 
  LogOut, 
  Menu, 
  X, 
  GitBranch,
  Settings,
  Sparkles,
  Timer,
  GraduationCap,
  FolderCode,
  Brain,
  Sun,
  Moon
} from 'lucide-react';

const LayoutShell: React.FC = () => {
  const { currentUser, isCheckingAuth, logout, notifications, theme, toggleTheme } = useCareer();
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLogoHovered, setIsLogoHovered] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  // Consolidated subtab states for nested navigation options
  const [academicsSubTab, setAcademicsSubTab] = useState<'ai_hub' | 'courses' | 'projects'>('ai_hub');
  const [skillsSubTab, setSkillsSubTab] = useState<'career' | 'skills' | 'goals' | 'roadmaps' | 'certificates'>('career');
  const [logsSubTab, setLogsSubTab] = useState<'focus' | 'activities' | 'journal' | 'analytics' | 'leads'>('focus');

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center justify-center gap-4">
          <Sparkles className="w-8 h-8 text-indigo-500 animate-spin" />
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Verifying session...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <Auth />;
  }

  if (currentUser.onboarded === false) {
    return <Onboarding />;
  }

  const unreadNotifCount = notifications.filter(n => !n.isRead).length;

  // Sidebar Menu Paths definition - Lean, 4 primary centers matching user intent
  const menuItems = [
    { id: 'dashboard', name: 'Dashboard View', icon: <Home className="w-4 h-4" /> },
    { id: 'academics', name: 'Academic & AI Hub', icon: <GraduationCap className="w-4 h-4" /> },
    { id: 'skills', name: 'Career RPG & Skills', icon: <Sparkles className="w-4 h-4 animate-pulse" /> },
    { id: 'integrations', name: 'Focus & Daily Logs', icon: <Timer className="w-4 h-4" /> }
  ];

  // Map deep clicks/programmatic redirection triggers smoothly
  const handleSetActiveTab = (tabId: string) => {
    if (tabId === 'studystation' || tabId === 'focus') {
      setActiveTab('integrations');
      setLogsSubTab('focus');
    } else if (tabId === 'roadmaps') {
      setActiveTab('skills');
      setSkillsSubTab('roadmaps');
    } else if (tabId === 'skills') {
      setActiveTab('skills');
      setSkillsSubTab('skills');
    } else if (tabId === 'goals') {
      setActiveTab('skills');
      setSkillsSubTab('goals');
    } else if (tabId === 'career_universe' || tabId === 'career') {
      setActiveTab('skills');
      setSkillsSubTab('career');
    } else if (tabId === 'certificates') {
      setActiveTab('skills');
      setSkillsSubTab('certificates');
    } else if (tabId === 'ai_hub') {
      setActiveTab('academics');
      setAcademicsSubTab('ai_hub');
    } else if (tabId === 'courses') {
      setActiveTab('academics');
      setAcademicsSubTab('courses');
    } else if (tabId === 'projects') {
      setActiveTab('academics');
      setAcademicsSubTab('projects');
    } else if (tabId === 'activities') {
      setActiveTab('integrations');
      setLogsSubTab('activities');
    } else if (tabId === 'journal') {
      setActiveTab('integrations');
      setLogsSubTab('journal');
    } else if (tabId === 'analytics') {
      setActiveTab('integrations');
      setLogsSubTab('analytics');
    } else if (tabId === 'leads' || tabId === 'integrations') {
      setActiveTab('integrations');
      setLogsSubTab('leads');
    } else {
      setActiveTab(tabId);
    }
  };

  const renderActiveTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard setActiveTab={handleSetActiveTab} onOpenQuickActivity={() => { handleSetActiveTab('activities'); }} />;
      
      case 'academics':
        return (
          <div className="space-y-6">
            <div className="flex flex-wrap bg-slate-100 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 p-1 rounded-xl max-w-md transition-colors">
              <button
                onClick={() => setAcademicsSubTab('ai_hub')}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold font-sans transition-all cursor-pointer whitespace-nowrap ${
                  academicsSubTab === 'ai_hub' 
                    ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs' 
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                AI Student Twin
              </button>
              <button
                onClick={() => setAcademicsSubTab('courses')}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold font-sans transition-all cursor-pointer whitespace-nowrap ${
                  academicsSubTab === 'courses' 
                    ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs' 
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                Academics & SGPA
              </button>
              <button
                onClick={() => setAcademicsSubTab('projects')}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold font-sans transition-all cursor-pointer whitespace-nowrap ${
                  academicsSubTab === 'projects' 
                    ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs' 
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                Projects Board
              </button>
            </div>
            <div>
              {academicsSubTab === 'ai_hub' ? <AIAcademicHub /> :
               academicsSubTab === 'courses' ? <Academics /> : <ProjectsBoard />}
            </div>
          </div>
        );

      case 'skills':
        return (
          <div className="space-y-6">
            <div className="flex flex-wrap bg-slate-100 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 p-1 rounded-xl max-w-2xl transition-colors">
              <button
                onClick={() => setSkillsSubTab('career')}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold font-sans transition-all cursor-pointer whitespace-nowrap ${
                  skillsSubTab === 'career' 
                    ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs' 
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                Career RPG
              </button>
              <button
                onClick={() => setSkillsSubTab('skills')}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold font-sans transition-all cursor-pointer whitespace-nowrap ${
                  skillsSubTab === 'skills' 
                    ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs' 
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                Skill Matrices
              </button>
              <button
                onClick={() => setSkillsSubTab('goals')}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold font-sans transition-all cursor-pointer whitespace-nowrap ${
                  skillsSubTab === 'goals' 
                    ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs' 
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                Goal Vision Track
              </button>
              <button
                onClick={() => setSkillsSubTab('roadmaps')}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold font-sans transition-all cursor-pointer whitespace-nowrap ${
                  skillsSubTab === 'roadmaps' 
                    ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs' 
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                Syllabus Roadmaps
              </button>
              <button
                onClick={() => setSkillsSubTab('certificates')}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold font-sans transition-all cursor-pointer whitespace-nowrap ${
                  skillsSubTab === 'certificates' 
                    ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs' 
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                Achievements
              </button>
            </div>
            <div>
              {skillsSubTab === 'career' ? <CareerUniverse /> :
               skillsSubTab === 'skills' ? <Skills /> : 
               skillsSubTab === 'goals' ? <Goals /> : 
               skillsSubTab === 'roadmaps' ? <Roadmaps /> : <Certificates />}
            </div>
          </div>
        );

      case 'integrations':
        return (
          <div className="space-y-6">
            <div className="flex flex-wrap bg-slate-100 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 p-1 rounded-xl max-w-2xl transition-colors">
              <button
                onClick={() => setLogsSubTab('focus')}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold font-sans transition-all cursor-pointer whitespace-nowrap ${
                  logsSubTab === 'focus' 
                    ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs' 
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                Study Focus
              </button>
              <button
                onClick={() => setLogsSubTab('activities')}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold font-sans transition-all cursor-pointer whitespace-nowrap ${
                  logsSubTab === 'activities' 
                    ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs' 
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                Activity Logger
              </button>
              <button
                onClick={() => setLogsSubTab('journal')}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold font-sans transition-all cursor-pointer whitespace-nowrap ${
                  logsSubTab === 'journal' 
                    ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs' 
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                Reflections Journal
              </button>
              <button
                onClick={() => setLogsSubTab('analytics')}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold font-sans transition-all cursor-pointer whitespace-nowrap ${
                  logsSubTab === 'analytics' 
                    ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs' 
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                Analytics Metrics
              </button>
              <button
                onClick={() => setLogsSubTab('leads')}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold font-sans transition-all cursor-pointer whitespace-nowrap ${
                  logsSubTab === 'leads' 
                    ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs' 
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                Profile & Careers
              </button>
            </div>
            <div>
              {logsSubTab === 'focus' ? <StudyStation /> :
               logsSubTab === 'activities' ? <Activities /> : 
               logsSubTab === 'journal' ? <Journal /> : 
               logsSubTab === 'analytics' ? <Analytics /> : <IntegrationProfile />}
            </div>
          </div>
        );

      default:
        return <Dashboard setActiveTab={handleSetActiveTab} onOpenQuickActivity={() => { handleSetActiveTab('activities'); }} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col text-slate-850 dark:text-slate-100 transition-colors duration-300">
      <div className="flex-grow flex flex-row">
        
        {/* UNIFIED COLLAPSIBLE SIDEBAR NAVIGATION (DRAWER FOR MAIN & MOBILE SCREENS) */}
        {isSidebarOpen && (
          <div 
            id="sidebar-backdrop"
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 z-50 flex bg-slate-950/60 backdrop-blur-xs transition-opacity duration-305 animate-fade-in"
          >
            <div 
              id="sidebar-panel"
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-900 w-72 max-w-[85vw] p-5 flex flex-col justify-between text-slate-300 h-full shadow-2xl relative animate-in slide-in-from-left duration-250 border-r border-slate-850"
            >
              <div className="space-y-6 flex-grow overflow-y-auto pr-1">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 via-rose-500 to-amber-500 flex items-center justify-center text-white shadow-md shadow-rose-500/20">
                      <Sparkles className="w-4.5 h-4.5 text-white animate-pulse" />
                    </div>
                    <div>
                      <span className="text-sm font-display font-bold tracking-tight text-white block">Nexora</span>
                      <span className="text-[9.5px] uppercase tracking-wider font-extrabold text-slate-550 font-mono">Student Workspace</span>
                    </div>
                  </div>
                  {/* Close button inside sidebar */}
                  <button 
                    id="sidebar-close-trigger"
                    onClick={() => setIsSidebarOpen(false)}
                    className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer border border-transparent hover:border-slate-700"
                    title="Close Sidebar"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <nav className="space-y-1">
                  {menuItems.map((item) => {
                    const isActive = item.id === activeTab;
                    return (
                      <button
                        key={item.id}
                        id={`sidemenu-item-${item.id}`}
                        onClick={() => { handleSetActiveTab(item.id); setIsSidebarOpen(false); }}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer border-l-4 ${
                          isActive 
                            ? 'bg-blue-600/10 border-blue-600 text-blue-400 font-bold' 
                            : 'hover:bg-slate-850 hover:text-white border-transparent text-slate-400'
                        }`}
                      >
                        <span className={isActive ? 'text-blue-500' : 'text-slate-405'}>
                          {item.icon}
                        </span>
                        <span>{item.name}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* User footer profile details session switch */}
              <div className="space-y-3.5 pt-4 border-t border-slate-800 mt-auto">
                <div className="flex items-center gap-3 px-2">
                  <div className="w-8 h-8 rounded-full bg-blue-600 overflow-hidden text-blue-100 flex items-center justify-center font-bold text-xs border border-blue-500/10">
                    {currentUser.photoUrl ? (
                      <img src={currentUser.photoUrl} alt={currentUser.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      currentUser.name.slice(0, 1).toUpperCase()
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-bold text-white truncate leading-none">{currentUser.name}</h4>
                    <p className="text-[9px] text-slate-500 truncate mt-1">{currentUser.email}</p>
                  </div>
                </div>

                <button
                  id="sidebar-session-logout"
                  onClick={() => { logout(); setIsSidebarOpen(false); }}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 hover:bg-slate-850 rounded-xl text-xs font-bold text-rose-500 hover:text-rose-450 cursor-pointer transition-all border border-slate-850"
                >
                  <LogOut className="w-3.5 h-3.5" /> Close Session
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MAIN APP WORKSPACE CONTAINER */}
        <main className="flex-1 flex flex-col min-w-0 bg-slate-50 dark:bg-slate-950 transition-colors">
          
          {/* Top Header Navbar */}
          <header className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 py-3.5 px-6 flex items-center justify-between shadow-xs transition-colors">
            <div className="flex items-center gap-3">
              {/* Logo / Nav Bar Button Triggers Nav Drawer - Uniformly styled, changes to Menu only on hover */}
              <button 
                id="header-nav-trigger"
                onClick={() => setIsSidebarOpen(true)}
                onMouseEnter={() => setIsLogoHovered(true)}
                onMouseLeave={() => setIsLogoHovered(false)}
                className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 via-rose-500 to-amber-500 hover:scale-[1.05] active:scale-95 flex items-center justify-center text-white shadow-md shadow-rose-500/20 transition-all duration-205 cursor-pointer"
                title="Open Navigation"
              >
                {isLogoHovered ? (
                  <Menu className="w-4.5 h-4.5 text-white animate-in fade-in duration-200" />
                ) : (
                  <Sparkles className="w-4.5 h-4.5 text-white animate-pulse" />
                )}
              </button>

              <div className="flex items-center gap-1.5 font-sans">
                <span className="text-xs font-semibold text-slate-752 dark:text-slate-250 bg-slate-100 dark:bg-slate-800 border border-slate-150 dark:border-slate-700 rounded px-2.5 py-0.5 shadow-2xs">
                   Calibration Workspace: Active
                </span>
              </div>
            </div>

            {/* Notification alert count & settings */}
            <div className="flex items-center gap-3 relative">
              
              {/* THEME TOGGLE BUTTON */}
              <button
                type="button"
                onClick={toggleTheme}
                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-amber-400 flex items-center justify-center cursor-pointer transition-all"
                title={theme === 'dark' ? "Switch to Bright Mode" : "Switch to Dark Mode"}
              >
                {theme === 'dark' ? (
                  <Sun className="w-4 h-4 text-amber-450" />
                ) : (
                  <Moon className="w-4 h-4 text-slate-600" />
                )}
              </button>

              <div className="relative">
                <button
                  onClick={() => setIsNotifOpen(!isNotifOpen)}
                  className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-655 dark:text-slate-300 flex items-center justify-center relative cursor-pointer"
                >
                  <Bell className="w-4 h-4" />
                  {unreadNotifCount > 0 && (
                    <span className="absolute -top-1.5 -right-1 text-[8px] bg-rose-500 border-2 border-white dark:border-slate-900 text-white font-mono font-bold rounded-full w-4 h-4 flex items-center justify-center">
                      {unreadNotifCount}
                    </span>
                  )}
                </button>

                {/* Reminders Panel absolute dropdown */}
                <NotificationBar isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />
              </div>

              {/* Connected student profile pill */}
              <div 
                onClick={() => { handleSetActiveTab('leads'); }}
                className="p-1 px-3 border border-slate-200 dark:border-slate-700 hover:border-blue-200 dark:hover:border-blue-800 bg-slate-50/60 dark:bg-slate-800/60 text-slate-800 dark:text-slate-100 rounded-xl flex items-center gap-2 cursor-pointer hover:bg-white dark:hover:bg-slate-800 transition-all text-xs"
              >
                <div className="w-6 h-6 rounded-full bg-blue-600 overflow-hidden text-white font-bold inline-flex items-center justify-center text-[10px]">
                  {currentUser.photoUrl ? (
                    <img src={currentUser.photoUrl} alt={currentUser.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    currentUser.name.slice(0,1).toUpperCase()
                  )}
                </div>
                <div className="hidden sm:block text-left">
                  <h4 className="font-bold text-[11px] leading-tight text-slate-800 dark:text-slate-100">{currentUser.name}</h4>
                  <p className="text-[9px] text-slate-400 dark:text-slate-500 capitalize">{currentUser.profession.split(' ')[0]}</p>
                </div>
              </div>
            </div>
          </header>

          {/* Active Screen Tab Area */}
          <div className="flex-grow p-6 sm:p-8 max-w-7xl mx-auto w-full">
            {renderActiveTabContent()}
          </div>
          
        </main>
      </div>
    </div>
  );
};

export default function App() {
  // Simple router for OAuth callback
  if (window.location.pathname === '/auth/callback') {
    return (
      <CareerProvider>
        <OAuthCallback />
      </CareerProvider>
    );
  }

  return (
    <CareerProvider>
      <LayoutShell />
    </CareerProvider>
  );
}
