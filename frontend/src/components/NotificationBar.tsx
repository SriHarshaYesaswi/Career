/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useCareer } from '../context/CareerContext';
import { Bell, Check, Trash2, X, AlertTriangle, ShieldCheck, Info } from 'lucide-react';

export const NotificationBar: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { notifications, markNotificationRead, clearNotifications } = useCareer();

  if (!isOpen) return null;

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getIcon = (type: string) => {
    switch (type) {
      case 'warning':
      case 'deadline':
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case 'success':
        return <ShieldCheck className="w-4 h-4 text-emerald-500" />;
      default:
        return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-2xl rounded-2xl z-50 overflow-hidden text-slate-800 dark:text-slate-200 animate-in fade-in-50 duration-200">
      {/* Header bar */}
      <div className="p-4 bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-850 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <h4 className="font-display font-bold text-xs text-slate-800 dark:text-slate-100">Recruiting & Goal Advisories</h4>
          {unreadCount > 0 && (
            <span className="bg-rose-500 text-white font-bold font-mono text-[9px] rounded-full px-1.5 py-0.5">
              {unreadCount} New
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {notifications.length > 0 && (
            <button
              onClick={clearNotifications}
              className="text-[10px] text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-450 hover:underline cursor-pointer flex items-center gap-0.5"
            >
              <Trash2 className="w-3 h-3" /> Dismiss All
            </button>
          )}
          <button 
            onClick={onClose}
            className="p-1 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Notifications list */}
      <div className="max-h-[300px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-850">
        {notifications.map((n) => {
          return (
            <div 
              key={n.id} 
              onClick={() => markNotificationRead(n.id)}
              className={`p-3.5 hover:bg-slate-50 dark:hover:bg-slate-950/40 transition-colors flex items-start gap-3 cursor-pointer ${
                !n.isRead ? 'bg-blue-50/10 dark:bg-blue-950/10' : ''
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {getIcon(n.type)}
              </div>

              <div className="space-y-1 flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h5 className={`text-[11px] font-bold truncate leading-none ${!n.isRead ? 'text-slate-900 dark:text-white' : 'text-slate-550 dark:text-slate-450'}`}>
                    {n.title}
                  </h5>
                  <span className="text-[8px] font-mono text-slate-400 dark:text-slate-500 shrink-0">{n.date}</span>
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-[10px] sm:text-[11px] leading-relaxed break-words font-sans">
                  {n.message}
                </p>
              </div>

              {!n.isRead && (
                <button 
                  onClick={(e) => { e.stopPropagation(); markNotificationRead(n.id); }}
                  className="p-1 rounded hover:bg-blue-100/30 text-blue-650 dark:text-blue-400 flex-shrink-0"
                  title="Mark as Read"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          );
        })}

        {notifications.length === 0 && (
          <div className="text-center py-10 text-slate-400 dark:text-slate-600 text-xs font-medium">
             No recent career advisor reminders. You are up-to-date!
          </div>
        )}
      </div>
    </div>
  );
};
