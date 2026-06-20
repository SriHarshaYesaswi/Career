/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useCareer } from '../context/CareerContext';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  BarChart, 
  Bar, 
  AreaChart, 
  Area, 
  PieChart, 
  Pie, 
  Cell
} from 'recharts';
import { TrendingUp, Clock, Target, Calendar, Award, BarChart3, PieChartIcon } from 'lucide-react';

export const Analytics: React.FC = () => {
  const { activities, skills, goals, currentUser } = useCareer();

  if (!currentUser) return null;

  // 1. DATA SEEDING & PREPARATION FOR LINECHART (Daily Productivity Scores)
  // We compute scores for the last 7 days based on activity statuses
  const getProductivityHistory = () => {
    const dates = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dates.push(d.toISOString().split('T')[0]);
    }

    return dates.map(dateStr => {
      const dayActs = activities.filter(a => a.date === dateStr);
      const compl = dayActs.filter(a => a.status === 'Completed').length;
      
      // Calculate realistic scores
      let score = 50; // default baseline
      if (dayActs.length > 0) {
        score = Math.round((compl / dayActs.length) * 45) + 35;
      } else {
        // baseline variance depending on name initials or day-index
        score = 65 + (new Date(dateStr).getDay() * 3); 
      }
      
      // Override today's score with current user's live calculated score
      if (dateStr === new Date().toISOString().split('T')[0]) {
        score = currentUser.productivityScore;
      }

      const formattedLabel = new Date(dateStr).toLocaleDateString([], { weekday: 'short', month: 'numeric', day: 'numeric' });

      return {
        dateName: formattedLabel,
        score: score
      };
    });
  };

  const productivityData = getProductivityHistory();

  // 2. DATA PREPARATION FOR BARCHART (Weekly focus hours per category)
  const getCategoryHours = () => {
    const list = ['DSA', 'Coding', 'Project Development', 'Research', 'Placement Preparation', 'Education'];
    return list.map(cat => {
      const hours = activities
        .filter(a => a.category === cat)
        .reduce((sum, a) => sum + (a.hoursSpent || 1.5), 0);
      return {
        category: cat,
        hours: Number(hours.toFixed(1))
      };
    });
  };

  const categoryHoursData = getCategoryHours();

  // 3. DATA PREPARATION FOR SKILLS RADAR / BAR CHART (Current Level vs Target Level)
  const skillProfileData = skills.map(s => ({
    name: s.name,
    'Current Star Rating': s.currentLevel,
    'Target Objective': s.targetLevel
  }));

  // 4. DATA PREPARATION FOR GOAL COMPLETION RATE PIE CHART
  const totalGoals = goals.length;
  const completedGoalsCount = goals.filter(g => g.isCompleted).length;
  const pendingGoalsCount = totalGoals - completedGoalsCount;

  const goalPieData = [
    { name: 'Completed Vision Milestones', value: completedGoalsCount || 1, color: '#10b981' },
    { name: 'On-Going Target Progress', value: pendingGoalsCount || 2, color: '#3b82f6' }
  ];

  // Colors for bar chart elements
  const BAR_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#6366f1', '#ec4899', '#14b8a6'];

  return (
    <div className="space-y-6">
      
      {/* 2x2 Bento grid configuration of high-productivity charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Card 1: LineChart - Daily score trends */}
        <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-xs space-y-4">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <h3 className="text-sm font-display font-bold text-slate-900 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-blue-600" /> Daily Productivity Trend
              </h3>
              <p className="text-[10px] text-slate-500">Evaluated score scaling over the past 7 days</p>
            </div>
            <div className="text-right font-mono">
              <span className="text-[9px] block font-bold text-slate-400">CURRENT LIVE RATING</span>
              <span className="text-blue-600 font-bold text-sm">{currentUser.productivityScore}/100</span>
            </div>
          </div>

          <div className="h-[210px] w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={productivityData} margin={{ top: 5, right: 10, left: -25, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="dateName" stroke="#94a3b8" tick={{ fontSize: 9 }} />
                <YAxis stroke="#94a3b8" domain={[0, 100]} tick={{ fontSize: 9 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', color: '#fff', borderRadius: '12px', fontSize: '10px' }}
                  labelStyle={{ fontWeight: 'bold' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#2563eb" 
                  strokeWidth={2.8} 
                  dot={{ r: 4, stroke: '#2563eb', strokeWidth: 1, fill: '#fff' }}
                  activeDot={{ r: 6 }} 
                  name="Score Index"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Card 2: BarChart - Category focused hours */}
        <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-xs space-y-4">
          <div className="space-y-1">
            <h3 className="text-sm font-display font-bold text-slate-900 flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4 text-blue-600" /> Weekly Hours Allocation per Focus Category
            </h3>
            <p className="text-[10px] text-slate-500">Aggregated duration metrics tracked across subjects</p>
          </div>

          <div className="h-[210px] w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryHoursData} margin={{ top: 5, right: 10, left: -25, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="category" stroke="#94a3b8" tick={{ fontSize: 8 }} />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 9 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', color: '#fff', borderRadius: '12px', fontSize: '10px' }}
                />
                <Bar dataKey="hours" name="Hours Invested" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                  {categoryHoursData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Card 3: Dual BarChart - Skill star calibration */}
        <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-xs space-y-4">
          <div className="space-y-1">
            <h3 className="text-sm font-display font-bold text-slate-900 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-blue-600" /> Skill Calibration Star Rating Overview
            </h3>
            <p className="text-[10px] text-slate-500">Comparing current technical levels with planned targets</p>
          </div>

          <div className="h-[210px] w-full text-xs">
            {skillProfileData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400">
                To calibrate skill comparisons, track some skills, then write training hours inside.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={skillProfileData} margin={{ top: 5, right: 10, left: -25, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 9 }} />
                  <YAxis stroke="#94a3b8" domain={[0, 5]} tick={{ fontSize: 9 }} />
                  <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '10px' }} />
                  <Legend wrapperStyle={{ fontSize: '10px' }} />
                  <Bar dataKey="Current Star Rating" fill="#f59e0b" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="Target Objective" fill="#2563eb" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Card 4: PieChart - Career Goal status splits */}
        <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-xs space-y-4">
          <div className="space-y-1">
            <h3 className="text-sm font-display font-bold text-slate-900 flex items-center gap-1.5">
              <PieChartIcon className="w-4 h-4 text-blue-600" /> Goal Achievement Rate distribution
            </h3>
            <p className="text-[10px] text-slate-500">Distribution proportion of accomplished vs pending career sights</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
            {/* Pie render */}
            <div className="h-[200px] md:col-span-3 text-xs relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={goalPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {goalPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ fontSize: '10px', borderRadius: '10px' }} />
                </PieChart>
              </ResponsiveContainer>

              {/* Absolute center details */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                <span className="text-lg font-bold font-mono text-slate-800 tracking-tight">
                  {Math.round((completedGoalsCount / (totalGoals || 1)) * 100)}%
                </span>
                <span className="text-[8px] uppercase tracking-wider block text-slate-400 font-bold">Goals Met</span>
              </div>
            </div>

            {/* Custom Pie legend right */}
            <div className="space-y-2.5 md:col-span-2 text-[10px] text-slate-600 font-sans">
              {goalPieData.map((item, idx) => (
                <div key={idx} className="p-2 border border-slate-50 rounded-xl bg-slate-50/20 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold">
                    <div className="w-2.5 h-2.5 rounded-xs" style={{ backgroundColor: item.color }} />
                    <span className="truncate max-w-[120px]">{item.name}</span>
                  </div>
                  <div className="pl-4 text-[11px] font-mono font-bold text-slate-800">
                    {idx === 0 ? completedGoalsCount : pendingGoalsCount} Goals logged
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
