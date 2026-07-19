import React, { useEffect } from 'react';
import { useCareer } from '../context/CareerContext';
import { Sparkles } from 'lucide-react';

export const OAuthCallback: React.FC = () => {

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    
    if (token) {
      localStorage.setItem('auth_token', token);
      localStorage.setItem('token', token); // For user requirement

      const API_URL = import.meta.env.VITE_API_BASE_URL || '';
      fetch(`${API_URL}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then(res => res.json())
      .then(data => {
        if (data.ok && data.user) {
          window.location.href = '/dashboard';
        } else {
          window.location.href = '/login?error=auth_failed';
        }
      })
      .catch(() => {
        window.location.href = '/login?error=auth_failed';
      });
    } else {
      window.location.href = '/login?error=auth_failed';
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
      <div className="flex flex-col items-center justify-center gap-4">
        <Sparkles className="w-8 h-8 text-indigo-500 animate-spin" />
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Authenticating with provider...</p>
      </div>
    </div>
  );
};
