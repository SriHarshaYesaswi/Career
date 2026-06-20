/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useCareer } from '../context/CareerContext';
import { 
  Sparkles, 
  Mail, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle,
  Github,
  KeyRound,
  Compass,
  ArrowLeft,
  Sun,
  Moon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { isFirebaseConfigured } from '../firebase';

export const Auth: React.FC = () => {
  const { 
    login, 
    signup, 
    googleSignIn, 
    githubSignIn, 
    resetPassword,
    triggerNotification,
    theme,
    toggleTheme
  } = useCareer();

  // Auth Modes: 'sign_in' | 'sign_up' | 'forgot'
  const [authMode, setAuthMode] = useState<'sign_in' | 'sign_up' | 'forgot'>('sign_in');
  
  // Form values
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  // UI States
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Password strength computation
  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { score: 0, label: 'None', color: 'bg-slate-200' };
    let score = 0;
    if (pwd.length >= 8) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;
    
    if (score <= 1) return { score: 25, label: 'Weak ⚠️', color: 'bg-rose-500' };
    if (score === 2) return { score: 50, label: 'Fair ⚡', color: 'bg-amber-400' };
    if (score === 3) return { score: 75, label: 'Good ✨', color: 'bg-blue-500' };
    return { score: 100, label: 'Strong 💪', color: 'bg-emerald-500' };
  };

  const strength = getPasswordStrength(password);

  const handleSocialSignIn = async (provider: 'google' | 'github') => {
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      if (provider === 'google') {
        await googleSignIn();
      } else {
        await githubSignIn();
      }
      setSuccessMsg('Successfully logged in! Setting up your campus lounge...');
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || `An error occurred during ${provider} sign-in.`);
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (authMode === 'forgot') {
      if (!email.trim()) {
        setErrorMsg('Please specify your registered email address.');
        return;
      }
      setLoading(true);
      try {
        await resetPassword(email);
        setSuccessMsg('A password recovery transmission has been dispatched to your email.');
        setEmail('');
      } catch (err: any) {
        setErrorMsg(err.message || 'Failure to dispatch reset credentials.');
      } finally {
        setLoading(false);
      }
      return;
    }

    if (authMode === 'sign_up') {
      if (!fullName.trim()) {
        setErrorMsg('Please enter your full name.');
        return;
      }
      if (!email.trim() || !password) {
        setErrorMsg('All credential fields are required.');
        return;
      }
      if (password.length < 8) {
        setErrorMsg('Password must consist of at least 8 characters.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg('Values do not match. Please verify confirmed password.');
        return;
      }
      
      setLoading(true);
      try {
        await signup(
          fullName, 
          email, 
          'Software Engineer Intern & CS Student', 
          'B.Tech in Computer Science', 
          password
        );
        setSuccessMsg('Account registered successfully! Prepare for dynamic onboarding.');
      } catch (err: any) {
        setErrorMsg(err.message || 'Registration has failed. Please check credentials.');
      } finally {
        setLoading(false);
      }
    } else {
      if (!email.trim() || !password) {
        setErrorMsg('Please supply a valid email and password combo.');
        return;
      }
      setLoading(true);
      try {
        const result = await login(email, password);
        if (result) {
          setSuccessMsg('Access approved. Welcome back to the campus control deck.');
        } else {
          setErrorMsg('Access denied. No record found matching this email handle in offline storage.');
        }
      } catch (err: any) {
        setErrorMsg(err.message || 'Invalid authorization credentials. Please verify keys.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col lg:flex-row text-slate-900 dark:text-slate-100 relative overflow-hidden transition-colors duration-300">
      
      {/* THEME SELECTOR - FLOATING */}
      <div className="absolute top-4 right-4 z-50">
        <button
          type="button"
          onClick={toggleTheme}
          className="p-3 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-650 dark:text-amber-400 hover:scale-[1.05] active:scale-[0.98] transition-all cursor-pointer shadow-lg hover:shadow-xl hover:border-slate-350 dark:hover:border-slate-700 flex items-center justify-center font-sans font-bold"
          title={theme === 'dark' ? "Switch to Bright Mode" : "Switch to Dark Mode"}
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-indigo-650" />
          )}
        </button>
      </div>

      {/* BACKGROUND DECORATIVE GLOWS */}
      <div className="absolute top-0 left-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-500/5 dark:bg-indigo-500/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-blue-500/5 dark:bg-blue-500/10 blur-3xl pointer-events-none" />

      {/* LEFT SPLIT-SCREEN: BRAND & MOTIVATIONAL ILLUSTRATION */}
      <div className="flex-1 bg-slate-100/60 dark:bg-slate-900/40 border-b lg:border-b-0 lg:border-r border-slate-205 dark:border-slate-800 flex flex-col justify-between p-8 lg:p-14 relative z-10 overflow-hidden">
        {/* LOGO AREA */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 via-rose-500 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-rose-500/25">
            <Sparkles className="w-5 h-5 text-white animate-pulse" />
          </div>
          <span className="text-xl font-display font-extrabold tracking-tight text-slate-900 dark:text-white">Nexora</span>
        </div>

        {/* ILLUSTRATION HERO */}
        <div className="my-10 lg:my-0 flex-1 flex flex-col justify-center max-w-lg mx-auto">
          <div className="relative w-full h-48 lg:h-72 mb-8 flex items-center justify-center">
            {/* Compass Orbit circles */}
            <div className="absolute w-44 h-44 lg:w-64 lg:h-64 rounded-full border-2 border-slate-200 dark:border-slate-800/80 animate-[spin_50s_linear_infinite] flex items-center justify-center">
              <div className="absolute w-4 h-4 rounded-full bg-blue-500 -top-2" />
              <div className="absolute w-3 h-3 rounded-full bg-indigo-500 -bottom-1.5" />
            </div>
            
            <div className="absolute w-32 h-32 lg:w-48 lg:h-48 rounded-full border border-indigo-550/20 dark:border-indigo-550/30 animate-[spin_30s_linear_infinite] flex items-center justify-center">
              <div className="absolute w-3 h-3 rounded-full bg-purple-500 -left-1.5" />
            </div>

            <div className="absolute w-20 h-20 lg:w-32 lg:h-32 rounded-full border border-dashed border-sky-450/40 dark:border-sky-505/45 animate-[spin_15s_linear_infinite] flex items-center justify-center" />

            {/* Glowing active core */}
            <div className="relative z-10 w-16 h-16 lg:w-24 lg:h-24 rounded-3xl bg-indigo-650/10 dark:bg-indigo-605/20 backdrop-blur-md border border-indigo-550/30 dark:border-indigo-550/50 flex items-center justify-center shadow-2xl shadow-indigo-550/20 dark:shadow-indigo-500/40">
              <Compass className="w-10 h-10 lg:w-12 lg:h-12 text-indigo-600 dark:text-indigo-400 animate-[pulse_2s_infinite]" />
            </div>

            {/* Floating nodes */}
            <div className="absolute top-4 left-6 lg:left-12 bg-white dark:bg-slate-805/90 border border-slate-205 dark:border-slate-705/80 px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-[10px] font-mono tracking-wider font-bold text-slate-600 dark:text-slate-350">75% AI ENGINEER</span>
            </div>

            <div className="absolute bottom-4 right-6 lg:right-12 bg-white dark:bg-slate-805/90 border border-slate-205 dark:border-slate-705/80 px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-md bg-amber-500" />
              <span className="text-[10px] font-mono tracking-wider font-bold text-slate-600 dark:text-slate-350">Future Self Level 20</span>
            </div>
          </div>

          <h1 className="text-3xl lg:text-4.5xl font-display font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight mb-4">
            Track. Build.<br />
            <span className="text-indigo-600 dark:text-indigo-400">Achieve</span> Your Dream Career.
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-xs.5 leading-relaxed">
            Unleash your professional potential with the digital companion built for career progression. 
            Calibrate skills, simulates future milestones, map educational steps, and unlock hidden expertise.
          </p>
        </div>

        {/* SECURITY PROMISE AT BOTTOM */}
        <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono flex items-center gap-4">
          <span>PROJECT BASE: CAMPUS CORE</span>
          <span>•</span>
          <span>SECURE OAUTH v2</span>
        </div>
      </div>

      {/* RIGHT SPLIT-SCREEN: GLASSMORPHISM AUTH CARD */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 lg:p-14 relative z-10">
        <div className="w-full max-w-md">
          
          {/* CARD CONTAINER */}
          <div className="bg-white dark:bg-slate-900/40 backdrop-blur-xl border border-slate-205 dark:border-slate-800/80 rounded-3xl p-6 sm:p-9 shadow-2xl relative overflow-hidden">
            
            {/* FIREBASE CONFIG STATE METRIC */}
            {!isFirebaseConfigured && (
              <div className="absolute top-0 inset-x-0 bg-amber-500/10 border-b border-amber-500/20 px-4 py-1 flex items-center justify-between">
                <span className="text-[9.5px] font-semibold text-amber-600 dark:text-amber-300 tracking-wide select-none">
                  ⚡ OFFLINE LOCAL ACCOUNT MODE
                </span>
                <span className="text-[8.5px] text-slate-500 dark:text-slate-400 font-mono">Simulated Persistence</span>
              </div>
            )}

            <div className="pt-2">
              {/* HEADER CONTAINER */}
              <div className="text-center mb-6">
                <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white tracking-tight">
                  {authMode === 'sign_in' && 'Welcome Back'}
                  {authMode === 'sign_up' && 'Create Account'}
                  {authMode === 'forgot' && 'Reset Password'}
                </h2>
                <p className="text-xs text-slate-550 dark:text-slate-400 mt-1.5">
                  {authMode === 'sign_in' && "Access your personal academic control board."}
                  {authMode === 'sign_up' && "Begin crafting your Student Digital Twin profile."}
                  {authMode === 'forgot' && "Provide account email to recover login password."}
                </p>
              </div>

              {/* MESSAGES */}
              <AnimatePresence mode="wait">
                {errorMsg && (
                  <motion.div 
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="mb-4 bg-rose-500/10 border border-rose-500/20 p-3.5 rounded-xl text-rose-650 dark:text-rose-300 text-xs flex items-start gap-2"
                  >
                    <AlertCircle className="w-4 h-4 text-rose-500 dark:text-rose-455 shrink-0 mt-0.5" />
                    <span>{errorMsg}</span>
                  </motion.div>
                )}

                {successMsg && (
                  <motion.div 
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="mb-4 bg-emerald-500/10 border border-emerald-500/20 p-3.5 rounded-xl text-emerald-650 dark:text-emerald-300 text-xs flex items-start gap-2"
                  >
                    <CheckCircle className="w-4 h-4 text-emerald-550 dark:text-emerald-450 shrink-0 mt-0.5" />
                    <span>{successMsg}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* SOCIAL BUTTONS FOR ACTIVE MODES */}
              {authMode !== 'forgot' && (
                <div className="space-y-2.5 mb-5.5">
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => handleSocialSignIn('google')}
                    className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl text-xs.5 font-bold transition-all border border-slate-205 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-850 hover:border-slate-350 dark:hover:border-slate-700 active:scale-[0.99] cursor-pointer text-slate-700 dark:text-slate-200"
                  >
                    {/* Google Icon SVG */}
                    <svg viewBox="0 0 24 24" className="w-4 h-4" xmlns="http://www.w3.org/2000/svg">
                      <path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.275 1.564-1.852 4.593-6.887 4.593-4.34 0-7.876-3.593-7.876-8s3.536-8 7.876-8c2.466 0 4.12 1.025 5.06 1.93l3.224-3.1C18.423 1.91 15.613 1 12.24 1 5.922 1 1.01 5.922 1.01 12.24s4.922 11.24 11.24 11.24c6.6 0 11-4.636 11-11.24 0-.756-.08-1.334-.18-1.955H12.24z" />
                    </svg>
                    Continue with Google
                  </button>

                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => handleSocialSignIn('github')}
                    className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl text-xs.5 font-bold transition-all border border-slate-205 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-850 hover:border-slate-350 dark:hover:border-slate-700 active:scale-[0.99] cursor-pointer text-slate-700 dark:text-slate-200"
                  >
                    <Github className="w-4 h-4 text-slate-700 dark:text-white" />
                    Continue with GitHub
                  </button>

                  <div className="flex items-center gap-3 my-4">
                    <div className="flex-1 h-[1px] bg-slate-200 dark:bg-slate-800" />
                    <span className="text-[10px] uppercase font-bold tracking-wider font-mono text-slate-400 dark:text-slate-505">
                      Or Authorized Mail
                    </span>
                    <div className="flex-1 h-[1px] bg-slate-200 dark:bg-slate-800" />
                  </div>
                </div>
              )}

              {/* AUTH CREDENTIALS FORM */}
              <form onSubmit={handleFormSubmit} className="space-y-4">
                
                {/* 1. NAME FIELD (REGISTER MODE ONLY) */}
                {authMode === 'sign_up' && (
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-550 dark:text-slate-400 mb-1.5">
                      Full Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-450 dark:text-slate-500">
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Harsha Dev"
                        className="block w-full pl-10 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl text-xs.5 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium"
                      />
                    </div>
                  </div>
                )}

                {/* 2. EMAIL ADDRESS HARSHA FIELD */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-555 dark:text-slate-400 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-450 dark:text-slate-500">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="alexis@edu.com"
                      className="block w-full pl-10 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl text-xs.5 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-505 focus:ring-1 focus:ring-indigo-500 transition-all font-medium"
                    />
                  </div>
                </div>

                {/* 3. PASSWORD FIELD */}
                {authMode !== 'forgot' && (
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Password
                      </label>
                      {authMode === 'sign_in' && (
                        <button
                          type="button"
                          onClick={() => {
                            setAuthMode('forgot');
                            setErrorMsg('');
                            setSuccessMsg('');
                          }}
                          className="text-[10px] font-bold text-indigo-650 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 focus:outline-none transition-colors"
                        >
                          Forgot Password?
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-455 dark:text-slate-500">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="block w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl text-xs.5 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-450 dark:text-slate-500 hover:text-slate-650 dark:hover:text-slate-350 cursor-pointer animate-none"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* PASSWORD STRENGTH BAR */}
                    {authMode === 'sign_up' && password.length > 0 && (
                      <div className="mt-2 text-xs">
                        <div className="flex justify-between items-center text-[10px] font-bold text-slate-550 dark:text-slate-400 mb-1">
                          <span>Password Strength</span>
                          <span className="font-mono text-xs font-bold">{strength.label}</span>
                        </div>
                        <div className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-350 ${strength.color}`} 
                            style={{ width: `${strength.score}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 4. CONFIRM PASSWORD (REGISTER MODE ONLY) */}
                {authMode === 'sign_up' && (
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-550 dark:text-slate-400 mb-1.5">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-450 dark:text-slate-500">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="block w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl text-xs.5 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-455 dark:text-slate-500 hover:text-slate-655 dark:hover:text-slate-350 cursor-pointer"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                )}

                {/* 5. REMEMBER ME WORKBOX (SIGN IN ONLY) */}
                {authMode === 'sign_in' && (
                  <div className="flex items-center">
                    <input
                      id="remember_me"
                      name="remember_me"
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="h-4 w-4 bg-slate-55 bg-slate-50 dark:bg-slate-955 dark:bg-slate-950 border-slate-300 dark:border-slate-800 text-indigo-600 focus:ring-indigo-500/50 rounded-md transition-all cursor-pointer"
                    />
                    <label htmlFor="remember_me" className="ml-2 block text-xs font-semibold text-slate-500 dark:text-slate-400 select-none cursor-pointer">
                      Keep me logged in session
                    </label>
                  </div>
                )}

                {/* SUBMIT PROCESS ACTIONS */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs.5 font-bold transition-all text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-600/50 disabled:cursor-not-allowed shadow-lg shadow-indigo-600/10 active:scale-[0.99] cursor-pointer"
                  >
                    {loading ? (
                      <div className="w-4.5 h-4.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>
                          {authMode === 'sign_in' && 'Secure Sign In'}
                          {authMode === 'sign_up' && 'Initialize Profile'}
                          {authMode === 'forgot' && 'Send Security Link'}
                        </span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* FOOTER SWITCH ACTIONS */}
              <div className="mt-6 pt-5 border-t border-slate-205 dark:border-slate-800 text-center flex flex-col items-center gap-3">
                {authMode === 'sign_in' && (
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    New academic researcher?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('sign_up');
                        setErrorMsg('');
                        setSuccessMsg('');
                      }}
                      className="font-bold text-indigo-650 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 focus:outline-none transition-colors ml-1"
                    >
                      Sign Up Free
                    </button>
                  </p>
                )}

                {authMode === 'sign_up' && (
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Existing active account?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('sign_in');
                        setErrorMsg('');
                        setSuccessMsg('');
                      }}
                      className="font-bold text-indigo-655 dark:text-indigo-400 hover:text-indigo-555 dark:hover:text-indigo-300 focus:outline-none transition-colors ml-1"
                    >
                      Sign In Here
                    </button>
                  </p>
                )}

                {authMode === 'forgot' && (
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('sign_in');
                      setErrorMsg('');
                      setSuccessMsg('');
                    }}
                    className="text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-705 dark:hover:text-slate-200 transition-all flex items-center gap-1.5 focus:outline-none shrink-0"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Back to Authorization Hub
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>

    </div>
  );
};
