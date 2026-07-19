/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useCareer } from '../context/CareerContext';
import { DailyActivity, ActivityCategory, PriorityLevel, ActivityStatus } from '../types';
import { 
  Search, 
  Filter, 
  Trash2, 
  Edit3, 
  Calendar, 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle, 
  Plus, 
  SlidersHorizontal,
  X,
  PlusCircle,
  FileSpreadsheet
} from 'lucide-react';

export const Activities: React.FC = () => {
  const { activities, addActivity, updateActivity, deleteActivity } = useCareer();
  
  // View states
  const [activeSubTab, setActiveSubTab] = useState<'list' | 'calendar'>('list');
  const [calendarView, setCalendarView] = useState<'month' | 'week' | 'day'>('month');
  
  // Search and Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedPriority, setSelectedPriority] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  // Modal / Form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<DailyActivity | null>(null);

  // Form Field states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ActivityCategory>('Coding');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('11:00');
  const [priority, setPriority] = useState<PriorityLevel>('Medium');
  const [status, setStatus] = useState<ActivityStatus>('Pending');

  // Calendar operational states
  const [currentCalendarDate, setCurrentCalendarDate] = useState(new Date());

  // Available Categories (From Specs)
  const categories: ActivityCategory[] = [
    'Education',
    'Coding',
    'Internship',
    'Placement Preparation',
    'DSA',
    'Project Development',
    'Personal Development',
    'Networking',
    'Health & Fitness',
    'Reading',
    'Research'
  ];

  const priorities: PriorityLevel[] = ['Low', 'Medium', 'High', 'Urgent'];

  // 1. Filtered activities for the table list
  const filteredActivities = activities.filter(act => {
    const matchesSearch = act.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          act.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || act.category === selectedCategory;
    const matchesPriority = selectedPriority === 'All' || act.priority === selectedPriority;
    const matchesStatus = selectedStatus === 'All' || act.status === selectedStatus;
    return matchesSearch && matchesCategory && matchesPriority && matchesStatus;
  }).sort((a, b) => {
    const dateA = new Date(`${a.date}T${a.startTime}`).getTime();
    const dateB = new Date(`${b.date}T${b.startTime}`).getTime();
    return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
  });

  // Calculate hoursSpent helper
  const calculateHoursSpent = (start: string, end: string) => {
    try {
      const [sh, sm] = start.split(':').map(Number);
      const [eh, em] = end.split(':').map(Number);
      const diffMs = (eh * 60 + em) - (sh * 60 + sm);
      return diffMs > 0 ? Number((diffMs / 60).toFixed(2)) : 1.0;
    } catch {
      return 1.0;
    }
  };

  // Handle Add/Edit Form submission
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    const hrs = calculateHoursSpent(startTime, endTime);

    if (editingActivity) {
      updateActivity(editingActivity.id, {
        title,
        description,
        category,
        date,
        startTime,
        endTime,
        priority,
        status,
        hoursSpent: hrs
      });
    } else {
      addActivity({
        title,
        description,
        category,
        date,
        startTime,
        endTime,
        priority,
        status,
        hoursSpent: hrs
      });
    }
    
    // reset states
    handleCloseModal();
  };

  const handleOpenAddModal = (initialDate = new Date().toISOString().split('T')[0]) => {
    setEditingActivity(null);
    setTitle('');
    setDescription('');
    setCategory('Coding');
    setDate(initialDate);
    setStartTime('09:00');
    setEndTime('11:00');
    setPriority('Medium');
    setStatus('Pending');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (act: DailyActivity) => {
    setEditingActivity(act);
    setTitle(act.title);
    setDescription(act.description);
    setCategory(act.category);
    setDate(act.date);
    setStartTime(act.startTime);
    setEndTime(act.endTime);
    setPriority(act.priority);
    setStatus(act.status);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingActivity(null);
  };

  const toggleActivityStatus = (act: DailyActivity) => {
    const nextStatus: ActivityStatus = act.status === 'Completed' ? 'Pending' : 'Completed';
    updateActivity(act.id, { status: nextStatus });
  };

  // CALENDAR COMPUTATION HELPERS
  const startOfMonth = new Date(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth(), 1);
  const endOfMonth = new Date(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth() + 1, 0);
  const prevMonthEnd = new Date(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth(), 0);

  const daysInMonth = endOfMonth.getDate();
  const startDayOfWeek = startOfMonth.getDay(); // Sunday is 0

  const calendarDays: { dateString: string; dayNum: number; currentMonth: boolean }[] = [];

  // Previous month trailing days
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const d = prevMonthEnd.getDate() - i;
    const mStr = String(prevMonthEnd.getMonth() + 1).padStart(2, '0');
    const yStr = prevMonthEnd.getFullYear();
    const dStr = String(d).padStart(2, '0');
    calendarDays.push({
      dateString: `${yStr}-${mStr}-${dStr}`,
      dayNum: d,
      currentMonth: false
    });
  }

  // Active month days
  for (let d = 1; d <= daysInMonth; d++) {
    const mStr = String(currentCalendarDate.getMonth() + 1).padStart(2, '0');
    const yStr = currentCalendarDate.getFullYear();
    const dStr = String(d).padStart(2, '0');
    calendarDays.push({
      dateString: `${yStr}-${mStr}-${dStr}`,
      dayNum: d,
      currentMonth: true
    });
  }

  // Next month leading days to fill calendar grid (6 rows * 7 days = 42 cells)
  const remainingCells = 42 - calendarDays.length;
  for (let d = 1; d <= remainingCells; d++) {
    const nextMonth = new Date(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth() + 1, 1);
    const mStr = String(nextMonth.getMonth() + 1).padStart(2, '0');
    const yStr = nextMonth.getFullYear();
    const dStr = String(d).padStart(2, '0');
    calendarDays.push({
      dateString: `${yStr}-${mStr}-${dStr}`,
      dayNum: d,
      currentMonth: false
    });
  }

  const changeCalendarMonth = (val: number) => {
    setCurrentCalendarDate(new Date(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth() + val, 1));
  };

  const getPriorityColor = (p: PriorityLevel) => {
    switch (p) {
      case 'Urgent': return 'bg-rose-500 text-white';
      case 'High': return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'Medium': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Low': return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  // Filter activities matching a specific date for Calendar rendering
  const getActivitiesForDate = (dateStr: string) => {
    return activities.filter(a => a.date === dateStr);
  };

  return (
    <div className="space-y-6">
      {/* Tab Switcher & Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
        <div>
          <h1 className="text-xl font-display font-bold text-slate-900">Activity Logger & Scheduler</h1>
          <p className="text-xs text-slate-500">Track and log client-side workspace assignments and study blocks</p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="bg-slate-100 p-1 rounded-xl flex gap-1 w-full sm:w-auto">
            <button
              onClick={() => setActiveSubTab('list')}
              className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                activeSubTab === 'list' 
                  ? 'bg-white text-slate-900 shadow-xs' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              List Ledger
            </button>
            <button
              onClick={() => setActiveSubTab('calendar')}
              className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                activeSubTab === 'calendar' 
                  ? 'bg-white text-slate-900 shadow-xs' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Interactive Calendar
            </button>
          </div>
          <button 
            onClick={() => handleOpenAddModal()}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-2 px-3.5 rounded-xl flex items-center gap-1 cursor-pointer transition-all shrink-0"
          >
            <Plus className="w-4 h-4" /> Schedule
          </button>
        </div>
      </div>

      {activeSubTab === 'list' ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
          {/* List parameters filter dashboard */}
          <div className="p-4 bg-slate-50/50 border-b border-slate-100 grid grid-cols-1 md:grid-cols-5 gap-3">
            
            {/* Search Input */}
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search description, title or assignment..."
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 bg-white rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Category Select */}
            <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl px-2">
              <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full text-xs font-medium py-2 bg-transparent border-none focus:outline-none text-slate-600"
              >
                <option value="All">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Priority Select */}
            <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl px-2">
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="w-full text-xs font-medium py-2 bg-transparent border-none focus:outline-none text-slate-600"
              >
                <option value="All">All Priorities</option>
                {priorities.map((pri) => (
                  <option key={pri} value={pri}>{pri} Priority</option>
                ))}
              </select>
            </div>

            {/* Sort Logic */}
            <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl px-2">
              <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as 'newest' | 'oldest')}
                className="w-full text-xs font-medium py-2 bg-transparent border-none focus:outline-none text-slate-600"
              >
                <option value="newest">Newest Activity First</option>
                <option value="oldest">Oldest Activity First</option>
              </select>
            </div>
          </div>

          {/* Mobile Card View (< md) */}
          <div className="block md:hidden divide-y divide-slate-100">
            {filteredActivities.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-sm">
                No matching daily learning activities saved. Try clearing filter settings.
              </div>
            ) : (
              filteredActivities.map((act) => (
                <div key={act.id} className={`p-4 space-y-2 hover:bg-slate-50/50 transition-all ${
                  act.status === 'Completed' ? 'bg-emerald-50/20' : ''
                }`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2 flex-1">
                      <button
                        onClick={() => toggleActivityStatus(act)}
                        className={`w-5 h-5 mt-0.5 rounded-md border flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                          act.status === 'Completed'
                            ? 'bg-blue-600 border-blue-600 text-white'
                            : 'border-slate-300 hover:border-blue-500'
                        }`}
                      >
                        {act.status === 'Completed' && <CheckCircle className="w-3.5 h-3.5" />}
                      </button>
                      <div>
                        <div className="font-semibold text-slate-900 text-xs">{act.title}</div>
                        <p className="text-slate-500 text-[10px] line-clamp-1 mt-0.5">{act.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => handleOpenEditModal(act)} className="p-1 rounded hover:bg-slate-100 text-slate-500 cursor-pointer">
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => deleteActivity(act.id)} className="p-1 rounded hover:bg-rose-50 text-slate-400 hover:text-rose-600 cursor-pointer">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5 pl-7">
                    <span className="px-2 py-0.5 bg-blue-50 rounded text-blue-800 text-[10px] font-semibold">{act.category}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${getPriorityColor(act.priority)}`}>{act.priority}</span>
                    <span className="text-[10px] text-slate-400 font-mono flex items-center gap-0.5">
                      <Calendar className="w-3 h-3" />{act.date}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">{act.hoursSpent}h</span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Desktop Table View (>= md) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[10px] uppercase font-bold tracking-wider text-slate-400 border-b border-slate-100">
                  <th className="py-3 px-4 w-10">Done</th>
                  <th className="py-3 px-4">Activity Name & Focus</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Schedule Metric</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4 text-center">Settings</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {filteredActivities.map((act) => (
                  <tr 
                    key={act.id} 
                    className={`hover:bg-slate-50/50 transition-all ${
                      act.status === 'Completed' ? 'bg-emerald-50/11' : ''
                    }`}
                  >
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => toggleActivityStatus(act)}
                        className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all cursor-pointer ${
                          act.status === 'Completed'
                            ? 'bg-blue-600 border-blue-600 text-white'
                            : 'border-slate-300 hover:border-blue-500'
                        }`}
                      >
                        {act.status === 'Completed' && <CheckCircle className="w-3.5 h-3.5" />}
                      </button>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {act.title}
                      </div>
                      <p className="text-slate-500 text-[11px] line-clamp-1 mt-0.5">{act.description}</p>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-600">
                      <span className="px-2 py-0.5 bg-blue-50 rounded text-blue-800 text-[10px] font-semibold">
                        {act.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{act.date}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${getPriorityColor(act.priority)}`}>
                        {act.priority}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono">
                      <div className="text-slate-800 font-semibold">{act.hoursSpent} hrs</div>
                      <div className="text-[10px] text-slate-400">{act.startTime} - {act.endTime}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => handleOpenEditModal(act)}
                          className="p-1 rounded hover:bg-slate-100 text-slate-500 hover:text-slate-800 cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => deleteActivity(act.id)}
                          className="p-1 rounded hover:bg-rose-50 text-slate-400 hover:text-rose-600 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredActivities.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-slate-400">
                      No matching daily learning activities saved. Try clearing filter settings.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* PROFESSIONAL CALENDAR COMPONENT INTERFACE */
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Grid left */}
          <div className="lg:col-span-3 bg-white border border-slate-100 rounded-3xl p-5 shadow-xs">
            {/* Header calendar navigation */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4 text-slate-800">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                <h3 className="font-display font-bold text-base">
                  {currentCalendarDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button 
                  onClick={() => changeCalendarMonth(-1)}
                  className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer text-slate-600"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setCurrentCalendarDate(new Date())}
                  className="px-2.5 py-1 rounded-lg border border-slate-200 text-xs font-semibold hover:bg-slate-50 cursor-pointer text-slate-600"
                >
                  Today
                </button>
                <button 
                  onClick={() => changeCalendarMonth(1)}
                  className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer text-slate-600"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Monthly Calendar Grid */}
            <div className="grid grid-cols-7 gap-1 text-center">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                <div key={d} className="py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">{d}</div>
              ))}

              {calendarDays.map((cell, idx) => {
                const dayActs = getActivitiesForDate(cell.dateString);
                const hasPending = dayActs.some(a => a.status !== 'Completed');
                const isToday = cell.dateString === new Date().toISOString().split('T')[0];

                return (
                  <div 
                    key={idx} 
                    onClick={() => handleOpenAddModal(cell.dateString)}
                    className={`min-h-[75px] p-1.5 border border-slate-50 text-left rounded-xl transition-all cursor-pointer flex flex-col justify-between group relative overflow-hidden ${
                      cell.currentMonth ? 'bg-white hover:bg-blue-50/20' : 'bg-slate-50/50 opacity-40'
                    } ${isToday ? 'ring-1 ring-blue-500' : ''}`}
                  >
                    <div className="flex justify-between items-center text-[10px] font-semibold text-slate-500">
                      <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full ${
                        isToday ? 'bg-blue-600 text-white font-bold' : ''
                      }`}>
                        {cell.dayNum}
                      </span>
                      {dayActs.length > 0 && (
                        <span className={`w-1.5 h-1.5 rounded-full ${hasPending ? 'bg-amber-400' : 'bg-emerald-500'}`} />
                      )}
                    </div>

                    <div className="space-y-0.5 mt-1 overflow-hidden max-h-[42px]">
                      {dayActs.slice(0, 2).map(a => (
                        <div 
                          key={a.id} 
                          title={a.title}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenEditModal(a);
                          }}
                          className={`px-1.5 py-0.5 text-[8px] font-medium leading-tight rounded-md truncate border text-left ${
                            a.status === 'Completed' 
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-100' 
                              : 'bg-amber-50 text-amber-800 border-amber-100'
                          }`}
                        >
                          {a.title}
                        </div>
                      ))}
                      {dayActs.length > 2 && (
                        <div className="text-[7px] text-slate-400 text-center font-bold">
                          +{dayActs.length - 2} more assignments
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right sidebar schedule analytics */}
          <div className="bg-slate-900 text-white border border-slate-800 rounded-3xl p-5 space-y-4">
            <div>
              <h4 className="font-display font-bold text-sm">Deadline & Checklist Tracking</h4>
              <p className="text-[10px] text-slate-400">Scheduled activities for active calendar month</p>
            </div>

            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
              {activities
                .filter(a => {
                  const actDate = new Date(a.date);
                  return actDate.getMonth() === currentCalendarDate.getMonth() && 
                         actDate.getFullYear() === currentCalendarDate.getFullYear();
                })
                .sort((a,b) => b.date.localeCompare(a.date))
                .map(a => (
                  <div key={a.id} className="p-3 bg-slate-800 rounded-xl border border-slate-700/60 text-xs space-y-2">
                    <div className="flex justify-between items-start gap-1">
                      <span className="font-semibold text-slate-200 line-clamp-1">{a.title}</span>
                      <span className={`px-1.5 py-0.5 text-[8px] rounded-full shrink-0 ${
                        a.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                      }`}>
                        {a.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
                      <Calendar className="w-3 h-3 text-blue-400" />
                      <span>{a.date}</span>
                      <span>•</span>
                      <span>{a.startTime}</span>
                    </div>
                  </div>
                ))}

              {activities.length === 0 && (
                <div className="text-center py-10 text-slate-500 text-xs">
                  No assignments scheduled.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL LIGHTBOX - Add/Edit Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-100 shadow-2xl p-6 relative">
            <button 
              onClick={handleCloseModal}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-display font-bold text-base text-slate-900 mb-4 flex items-center gap-2">
              <PlusCircle className="text-blue-600 w-5 h-5" />
              {editingActivity ? 'Modify Growth Log' : 'New Assignment Scheduler'}
            </h3>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Activity Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Code Leetcode premium graphs"
                  className="w-full text-xs px-3 py-2 border border-slate-200 bg-slate-50 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Description / Bullet notes
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Include links, resources studied, outcome met..."
                  rows={2}
                  className="w-full text-xs px-3 py-2 border border-slate-200 bg-slate-50 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                    Category Range
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ActivityCategory)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 bg-slate-50 rounded-lg focus:outline-none"
                  >
                    {categories.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                    Priority Escalation
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as PriorityLevel)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 bg-slate-50 rounded-lg focus:outline-none"
                  >
                    {priorities.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                    Assign Date
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full text-xs px-2 py-2 border border-slate-200 bg-slate-50 rounded-lg focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                    Start Metric
                  </label>
                  <input
                    type="time"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full text-xs px-2 py-2 border border-slate-200 bg-slate-50 rounded-lg focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                    End Metric
                  </label>
                  <input
                    type="time"
                    required
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full text-xs px-2 py-2 border border-slate-200 bg-slate-50 rounded-lg focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Task Logging Status
                </label>
                <div className="flex gap-2">
                  {['Pending', 'In Progress', 'Completed'].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setStatus(s as ActivityStatus)}
                      className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${
                        status === s 
                          ? 'bg-blue-600 border-blue-600 text-white' 
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-lg text-xs font-semibold text-slate-600 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-xs font-semibold text-white transition-all cursor-pointer"
                >
                  {editingActivity ? 'Save Parameters' : 'Deploy Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
