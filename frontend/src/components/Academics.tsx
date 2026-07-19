/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useCareer } from '../context/CareerContext';
import { CourseItem, PastSemester, ExamMetric } from '../types';
import { 
  GraduationCap, 
  Plus, 
  Trash2, 
  Check, 
  AlertTriangle, 
  BookOpen, 
  Clock, 
  Percent, 
  Sliders, 
  PlusCircle, 
  Calendar, 
  CheckSquare, 
  MoreVertical,
  SlidersHorizontal,
  ThumbsUp,
  ThumbsDown,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const Academics: React.FC = () => {
  const { 
    currentUser, 
    courses, 
    addCourse, 
    updateCourse, 
    deleteCourse, 
    logAttendance,
    pastSemesters, 
    addPastSemester, 
    deletePastSemester,
    exams, 
    addExam, 
    updateExam, 
    deleteExam, 
    toggleExamChecklist,
    triggerNotification
  } = useCareer();

  const [isAddCourseOpen, setIsAddCourseOpen] = useState(false);
  const [isAddExamOpen, setIsAddExamOpen] = useState(false);
  const [isAddPastSemOpen, setIsAddPastSemOpen] = useState(false);
  const [activeCourseMarksId, setActiveCourseMarksId] = useState<string | null>(null);

  // Form states for adding course
  const [courseCode, setCourseCode] = useState('');
  const [courseName, setCourseName] = useState('');
  const [courseCredits, setCourseCredits] = useState('3');
  const [courseGrade, setCourseGrade] = useState('');

  // Form states for adding past semester SGPA
  const [semName, setSemName] = useState('');
  const [semGpa, setSemGpa] = useState('');

  // Form states for adding exam
  const [examCourse, setExamCourse] = useState('');
  const [examDate, setExamDate] = useState('');
  const [examNotes, setExamNotes] = useState('');
  const [examChecklistText, setExamChecklistText] = useState(''); // comma-separated titles

  if (!currentUser) return null;

  // Grade scales mapping
  const GRADE_SCALE: Record<string, number> = {
    'O': 10,
    'A+': 10,
    'A': 9,
    'B+': 8,
    'B': 7,
    'C+': 6,
    'C': 5,
    'D': 4,
    'E': 4,
    'F': 0
  };

  // 1. Calculate Active Semester SGPA
  const calculateSGPA = () => {
    let totalCreditsPoints = 0;
    let gradedCreditsCount = 0;

    courses.forEach(c => {
      if (c.grade && GRADE_SCALE[c.grade.toUpperCase()] !== undefined) {
        const gp = GRADE_SCALE[c.grade.toUpperCase()];
        totalCreditsPoints += gp * c.credits;
        gradedCreditsCount += c.credits;
      }
    });

    if (gradedCreditsCount === 0) return 0;
    return Number((totalCreditsPoints / gradedCreditsCount).toFixed(2));
  };

  const activeSGPA = calculateSGPA();

  // 2. Calculate Cumulative CGPA
  const calculateCGPA = () => {
    // Collect all past semesters GPAs + current estimated SGPA if there are graded courses
    const allGPAs = pastSemesters.map(s => s.gpa);
    if (activeSGPA > 0) {
      allGPAs.push(activeSGPA);
    }

    if (allGPAs.length === 0) return 0;
    const sum = allGPAs.reduce((acc, score) => acc + score, 0);
    return Number((sum / allGPAs.length).toFixed(2));
  };

  const computedCGPA = calculateCGPA();

  // Handlers
  const handleCreateCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseCode.trim() || !courseName.trim()) {
      alert('Please fill out course identifier fields.');
      return;
    }

    addCourse({
      code: courseCode.toUpperCase().trim(),
      name: courseName.trim(),
      credits: Number(courseCredits),
      grade: courseGrade ? courseGrade.toUpperCase().trim() : undefined,
      attendancePre: 0,
      attendanceAbs: 0
    });

    // Reset Form
    setCourseCode('');
    setCourseName('');
    setCourseCredits('3');
    setCourseGrade('');
    setIsAddCourseOpen(false);
  };

  const handleCreatePastSem = (e: React.FormEvent) => {
    e.preventDefault();
    const gpaVal = Number(semGpa);
    if (!semName.trim() || isNaN(gpaVal) || gpaVal < 0 || gpaVal > 10) {
      alert('Provide a valid semester title and GPA score scale (0 - 10).');
      return;
    }

    addPastSemester({
      name: semName.trim(),
      gpa: gpaVal
    });

    setSemName('');
    setSemGpa('');
    setIsAddPastSemOpen(false);
  };

  const handleCreateExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!examCourse.trim() || !examDate) {
      alert('Please enter course code and choose a valid calendar exam date.');
      return;
    }

    const customChecklist = examChecklistText
      .split(',')
      .map((t, idx) => ({
        id: `chk_${Date.now()}_${idx}`,
        title: t.trim(),
        isCompleted: false
      }))
      .filter(item => item.title.length > 0);

    addExam({
      courseCode: examCourse.toUpperCase().trim(),
      examDate,
      notes: examNotes.trim() || undefined,
      topicsCoveredPercentage: 0,
      checklist: customChecklist.length > 0 ? customChecklist : [
        { id: `c1_${Date.now()}`, title: 'General Syllabus Chapters', isCompleted: false },
        { id: `c2_${Date.now()}`, title: 'Previous Year Exam Papers', isCompleted: false },
        { id: `c3_${Date.now()}`, title: 'Mock Test Paper Iterations', isCompleted: false }
      ]
    });

    setExamCourse('');
    setExamDate('');
    setExamNotes('');
    setExamChecklistText('');
    setIsAddExamOpen(false);
  };

  const handleUpdateMarks = (courseId: string, field: 'quiz1' | 'midTerm' | 'quiz2' | 'endSem', valString: string) => {
    const valParsed = valString === '' ? undefined : Number(valString);
    updateCourse(courseId, { [field]: valParsed });
  };

  // Helper calculation for consecutive classes needed for 75% attendance
  const computeConsecutiveNeeded = (pre: number, abs: number) => {
    const total = pre + abs;
    if (total === 0) return 0;
    const currentRate = pre / total;
    if (currentRate >= 0.75) return 0;
    // pre + consecutiveNeeded / (pre + abs + consecutiveNeeded) = 0.75
    // pre + x = 3/4 (pre + abs + x) => 4pre + 4x = 3pre + 3abs + 3x => x = 3abs - pre
    const x = (3 * abs) - pre;
    return x > 0 ? Math.ceil(x) : 0;
  };

  // humanize dates for exams
  const getExamDaysCountdown = (dateString: string) => {
    const examTime = new Date(dateString).setHours(0,0,0,0);
    const nowTime = new Date().setHours(0,0,0,0);
    const diffTime = examTime - nowTime;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return { text: 'Today 🙌', color: 'text-rose-500 font-bold', bg: 'bg-rose-50 border-rose-100' };
    if (diffDays === 1) return { text: 'Tomorrow 🔔', color: 'text-amber-600 font-semibold', bg: 'bg-amber-50 border-amber-105' };
    if (diffDays < 0) return { text: `Passed (${Math.abs(diffDays)}d ago)`, color: 'text-slate-400 font-mono', bg: 'bg-slate-50' };
    return { text: `In ${diffDays} days`, color: 'text-blue-600 font-medium', bg: 'bg-blue-50 border-blue-100' };
  };

  return (
    <div className="space-y-8 pb-12">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-600 text-white rounded-lg">
              <GraduationCap className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-display font-bold text-slate-900 tracking-tight">Academic & Semester Planner</h1>
          </div>
          <p className="text-xs text-slate-500">Track courses, attendance thresholds, internal scores and upcoming exam countdown maps.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setIsAddCourseOpen(true)}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Log Course
          </button>
          <button
            onClick={() => setIsAddExamOpen(true)}
            className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-100 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5" /> Plan Exam
          </button>
        </div>
      </div>

      {/* GPA BENTO ROW */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* CGPA CARD */}
        <div className="bg-white border border-slate-100 rounded-3xl p-5 flex flex-col justify-between shadow-xs">
          <div className="space-y-1">
            <span className="text-[9px] uppercase tracking-wider font-bold text-slate-400 font-mono block">Overall Performance Index</span>
            <h3 className="text-sm font-bold text-slate-800">Total Program CGPA</h3>
          </div>
          <div className="py-4 flex items-baseline gap-2">
            <span className="text-3xl font-black font-mono text-slate-900 tracking-tighter">
              {computedCGPA > 0 ? computedCGPA : '0.00'}
            </span>
            <span className="text-xs font-bold text-slate-400 font-mono">/ 10.00 scale</span>
          </div>
          <p className="text-[10px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-blue-500 shrink-0" />
            Calculated as an aggregate of all semesters GPA values logged.
          </p>
        </div>

        {/* ACTIVE SEMESTER SGPA CARD */}
        <div className="bg-white border border-slate-100 rounded-3xl p-5 flex flex-col justify-between shadow-xs">
          <div className="space-y-1">
            <span className="text-[9px] uppercase tracking-wider font-bold text-slate-400 font-mono block">Active Estimator</span>
            <h3 className="text-sm font-bold text-slate-800">Current Semester SGPA</h3>
          </div>
          <div className="py-4 flex items-baseline gap-2">
            <span className="text-3xl font-black font-mono text-blue-600 tracking-tighter">
              {activeSGPA > 0 ? activeSGPA : '0.00'}
            </span>
            <span className="text-xs font-bold text-blue-400 font-mono">/ Live Estimation</span>
          </div>
          <div className="text-[10px] text-slate-500 bg-blue-50/40 p-2.5 rounded-xl border border-blue-50/80 flex items-center justify-between">
            <span className="font-semibold text-blue-900">Graded Credits:</span>
            <span className="font-mono font-bold text-blue-700">
              {courses.filter(c => c.grade).reduce((sum, c) => sum + c.credits, 0)} Credits
            </span>
          </div>
        </div>

        {/* PAST SEMESTERS MANAGER CARD */}
        <div className="bg-white border border-slate-100 rounded-3xl p-5 flex flex-col justify-between shadow-xs">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[9px] uppercase tracking-wider font-bold text-slate-400 font-mono block font-sans">Historical</span>
              <h3 className="text-sm font-bold text-slate-800">Past Academic Terms</h3>
            </div>
            <button
              onClick={() => setIsAddPastSemOpen(true)}
              className="text-[10px] font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded-lg cursor-pointer"
            >
              + Add GPA
            </button>
          </div>

          <div className="my-3 max-h-[110px] overflow-y-auto space-y-1.5 pr-1 divide-y divide-slate-100">
            {pastSemesters.length === 0 ? (
              <p className="text-[10px] text-slate-400 py-4 text-center">No past semesters registered yet.</p>
            ) : (
              pastSemesters.map(sem => (
                <div key={sem.id} className="flex justify-between items-center text-[11px] pt-1.5 first:pt-0">
                  <span className="font-medium text-slate-700">{sem.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded">
                      {sem.gpa.toFixed(2)}
                    </span>
                    <button
                      onClick={() => deletePastSemester(sem.id)}
                      className="text-slate-350 hover:text-rose-500 transition-colors"
                      title="Delete profile log"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* MODALS / FLOATING FORM DRAWER SHELLS */}
      <AnimatePresence>
        {/* ADD COURSE MODAL */}
        {isAddCourseOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl border border-slate-100 p-6 w-full max-w-md shadow-2xl relative"
            >
              <h3 className="text-base font-display font-bold text-slate-900 mb-1">Add Active Course</h3>
              <p className="text-xs text-slate-400 mb-4">Register a subject for the active academic semester tracking.</p>
              
              <form onSubmit={handleCreateCourse} className="space-y-4 text-xs">
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-1 space-y-1">
                    <label className="font-bold text-slate-650">Course Code</label>
                    <input 
                      type="text" 
                      placeholder="e.g. CS-401" 
                      value={courseCode}
                      onChange={e => setCourseCode(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white"
                      required
                    />
                  </div>
                  <div className="col-span-2 space-y-1">
                    <label className="font-bold text-slate-650">Course Title</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Computer Networks" 
                      value={courseName}
                      onChange={e => setCourseName(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-650">Credits Load (1-5)</label>
                    <input 
                      type="number" 
                      min="1" 
                      max="5"
                      value={courseCredits}
                      onChange={e => setCourseCredits(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white font-mono"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-650">Optional Expected Grade</label>
                    <select
                      value={courseGrade}
                      onChange={e => setCourseGrade(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white font-mono font-bold"
                    >
                      <option value="">No Grade Yet</option>
                      <option value="O">O (Outstanding / 10)</option>
                      <option value="A+">A+ (Grade 10)</option>
                      <option value="A">A (Grade 9)</option>
                      <option value="B+">B+ (Grade 8)</option>
                      <option value="B">B (Grade 7)</option>
                      <option value="C+">C+ (Grade 6)</option>
                      <option value="C">C (Grade 5)</option>
                      <option value="F">F (Grade 0)</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddCourseOpen(false)}
                    className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-55 pointer-events-auto"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold font-sans pointer-events-auto"
                  >
                    Save Course
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* ADD HISTORIC SEMESTER GPA MODAL */}
        {isAddPastSemOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl border border-slate-100 p-6 w-full max-w-sm shadow-2xl relative"
            >
              <h3 className="text-sm font-display font-bold text-slate-900 mb-1">Log Past Term GPAs</h3>
              <p className="text-[11px] text-slate-400 mb-4">Input completed academic semester marks, used to weigh Cumulative CGPA dynamically.</p>
              
              <form onSubmit={handleCreatePastSem} className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-slate-655">Semester Name Space</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Semester 4" 
                    value={semName}
                    onChange={e => setSemName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-655">CGPA / SGPA Score (e.g. 8.76)</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    min="0" 
                    max="10" 
                    placeholder="8.50" 
                    value={semGpa}
                    onChange={e => setSemGpa(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 font-mono"
                    required
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddPastSemOpen(false)}
                    className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold"
                  >
                    Save Historical GPA
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* ADD EXAM COUNTDOWN MODAL */}
        {isAddExamOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl border border-slate-100 p-6 w-full max-w-md shadow-2xl relative"
            >
              <h3 className="text-base font-display font-bold text-slate-900 mb-1">Plan Upcoming Exams</h3>
              <p className="text-xs text-slate-400 mb-4">Set timeline parameters to measure chapter checklists and exam countdown days.</p>
              
              <form onSubmit={handleCreateExam} className="space-y-3.5 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-650">Select Course</label>
                    <select
                      value={examCourse}
                      onChange={e => setExamCourse(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50"
                      required
                    >
                      <option value="">Choose Code</option>
                      {courses.map(c => (
                        <option key={c.id} value={c.code}>{c.code} - {c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-650">Exam Date</label>
                    <input 
                      type="date" 
                      value={examDate}
                      onChange={e => setExamDate(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 font-mono"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-650">Chapters Checkpoint (Comma Separated)</label>
                  <textarea 
                    placeholder="Chapter 1: Framing, Chapter 2: Parsing Grammars, Revision" 
                    value={examChecklistText}
                    onChange={e => setExamChecklistText(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50"
                  />
                  <p className="text-[9.5px] text-slate-400">Separating topics by commas automatically constructs progress checklist boxes.</p>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-650">Pre-Exam Sticky Notes (Optional)</label>
                  <input 
                    type="text" 
                    placeholder="Prepare LALR parse trees; revise IPv6 subnets" 
                    value={examNotes}
                    onChange={e => setExamNotes(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddExamOpen(false)}
                    className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold"
                  >
                    Schedule Exam
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DETAILED ACTIVE COURSES TRACKER GRID & BUNK-METERS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT & CENTER GRIDS: COURSES LIST & BUNK METER & INTERNAL ESTIMATORS */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-xs">
            <h3 className="text-sm font-display font-bold text-slate-900 mb-4 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-blue-600" /> Active Term Courses & Live Bunk-Meters
            </h3>

            {courses.length === 0 ? (
              <div className="py-12 text-center text-slate-400 space-y-2">
                <p className="text-xs">No active courses configured in your curriculum yet.</p>
                <button
                  onClick={() => setIsAddCourseOpen(true)}
                  className="px-3 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-700 text-[10px] font-bold rounded-lg transition-all"
                >
                  Configure curriculum now
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {courses.map(course => {
                  const attendanceRate = course.attendancePre + course.attendanceAbs > 0 
                    ? (course.attendancePre / (course.attendancePre + course.attendanceAbs)) * 100
                    : 100;

                  const consecNeeded = computeConsecutiveNeeded(course.attendancePre, course.attendanceAbs);
                  const isLowAttendance = attendanceRate < 75;

                  return (
                    <div key={course.id} className="border border-slate-100 bg-slate-50/20 rounded-2xl p-4.5 space-y-4">
                      
                      {/* Course Header */}
                      <div className="flex justify-between items-start gap-2">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-mono font-bold text-xs bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded">
                              {course.code}
                            </span>
                            <h4 className="text-xs font-bold text-slate-900">{course.name}</h4>
                          </div>
                          <div className="flex gap-2 text-[10px] font-medium text-slate-400 font-mono">
                            <span>Credits: {course.credits}</span>
                            <span>•</span>
                            <span>Grade Point Target: {course.grade || 'Not assigned'}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setActiveCourseMarksId(activeCourseMarksId === course.id ? null : course.id)}
                            className="p-1 text-slate-450 hover:text-blue-600 hover:bg-blue-50 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                            title="Edit marks and expected metrics"
                          >
                            <SlidersHorizontal className="w-3.5 h-3.5" /> Est. Marks
                          </button>
                          <button
                            onClick={() => deleteCourse(course.id)}
                            className="p-1 text-slate-350 hover:text-rose-500 rounded-lg transition-colors cursor-pointer"
                            title="Remove Course curriculum"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Course Attendance Logger Row ("Bunk-Meter") */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white border border-slate-100 rounded-xl p-3 shadow-2xs items-center">
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-[11px] font-medium text-slate-700">
                            <span className="flex items-center gap-1 font-bold">
                              Class Attendance:
                              <span className={isLowAttendance ? 'text-amber-600' : 'text-emerald-600'}>
                                {attendanceRate.toFixed(0)}%
                              </span>
                            </span>
                            <span className="font-mono font-bold text-slate-400">
                              {course.attendancePre} / {course.attendancePre + course.attendanceAbs} classes
                            </span>
                          </div>

                          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-300 ${isLowAttendance ? 'bg-amber-500' : 'bg-emerald-500'}`}
                              style={{ width: `${Math.min(100, attendanceRate)}%` }}
                            />
                          </div>
                        </div>

                        {/* Interactive Present/Absent Class Increments & Danger notifications */}
                        <div className="flex items-center justify-between sm:justify-end gap-3.5 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                          <div className="text-left sm:text-right space-y-0.5">
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block font-sans">MARK SESSION</span>
                            <div className="flex gap-1.5">
                              <button
                                onClick={() => logAttendance(course.id, 'Present')}
                                className="flex items-center gap-1 bg-emerald-50 text-emerald-600 font-bold hover:bg-emerald-100 px-2 py-1 rounded-lg text-[10px] cursor-pointer"
                              >
                                <ThumbsUp className="w-3 h-3" /> Present
                              </button>
                              <button
                                onClick={() => logAttendance(course.id, 'Absent')}
                                className="flex items-center gap-1 bg-rose-50 text-rose-600 font-bold hover:bg-rose-100 px-2 py-1 rounded-lg text-[10px] cursor-pointer"
                              >
                                <ThumbsDown className="w-3 h-3" /> Absent
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Display Alert warning if attendance rate is below 75% requirements */}
                      {isLowAttendance && (
                        <div className="p-3 bg-amber-50 border border-amber-100 text-amber-800 rounded-xl text-[10.5px] items-center flex gap-2">
                          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                          <div>
                            <span className="font-bold">Currrent threshold below 75%.</span> Bunk counter alerts:{' '}
                            <span className="font-sans font-bold text-amber-950 underline">
                              You must attend the next {consecNeeded} classes consecutively
                            </span>{' '}
                            to recover 75% semester admissibility safely!
                          </div>
                        </div>
                      )}

                      {/* Expandable internal marks estimator container */}
                      {activeCourseMarksId === course.id && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="pt-2"
                        >
                          <div className="border border-blue-50 bg-blue-50/10 rounded-2xl p-4.5 space-y-3">
                            <div className="flex justify-between items-center pb-2 border-b border-blue-50/60">
                              <h5 className="text-[11px] font-bold text-blue-900 flex items-center gap-1">
                                <Percent className="w-3.5 h-3.5" /> Internal exam marks / Estimator
                              </h5>
                              <span className="text-[9px] uppercase tracking-wider font-mono text-slate-400">Values persist locally</span>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px] font-medium text-slate-700">
                              <div className="space-y-1">
                                <label className="text-slate-500 text-[10px]">Quiz 1 (max 10)</label>
                                <input 
                                  type="number" 
                                  placeholder="Quiz 1" 
                                  min="0"
                                  max="10"
                                  value={course.quiz1 !== undefined ? course.quiz1 : ''}
                                  onChange={e => handleUpdateMarks(course.id, 'quiz1', e.target.value)}
                                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-slate-500 text-[10px]">Midterm (max 50)</label>
                                <input 
                                  type="number" 
                                  placeholder="Mid" 
                                  min="0"
                                  max="50"
                                  value={course.midTerm !== undefined ? course.midTerm : ''}
                                  onChange={e => handleUpdateMarks(course.id, 'midTerm', e.target.value)}
                                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-slate-500 text-[10px]">Quiz 2 (max 10)</label>
                                <input 
                                  type="number" 
                                  placeholder="Quiz 2" 
                                  min="0"
                                  max="10"
                                  value={course.quiz2 !== undefined ? course.quiz2 : ''}
                                  onChange={e => handleUpdateMarks(course.id, 'quiz2', e.target.value)}
                                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-slate-500 text-[10px]">End Semester (max 100)</label>
                                <input 
                                  type="number" 
                                  placeholder="EndSem" 
                                  min="0"
                                  max="100"
                                  value={course.endSem !== undefined ? course.endSem : ''}
                                  onChange={e => handleUpdateMarks(course.id, 'endSem', e.target.value)}
                                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white"
                                />
                              </div>
                            </div>
                            
                            {/* Cumulative evaluation estimation */}
                            <div className="bg-white border border-blue-50 rounded-xl p-3 flex justify-between items-center text-[11px] text-blue-955 mt-2.5">
                              <span className="font-semibold text-blue-900">Current aggregate points scored:</span>
                              <span className="font-mono font-black text-blue-700 font-bold">
                                {
                                  ((course.quiz1 || 0) + (course.midTerm || 0) + (course.quiz2 || 0) + (course.endSem || 0)).toFixed(1)
                                } / 170 points
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      )}

                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT SIDEBAR: EXAMS CALENDAR COUNTDOWN & SYLLABUS CHECKPOINTS */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-xs flex flex-col justify-between">
            <div className="space-y-1 mb-4">
              <h3 className="text-sm font-display font-bold text-slate-900 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-slate-900" /> Syllabus Checklist & Exam Countdown
              </h3>
              <p className="text-[10px] text-slate-400">Organize and log upcoming examinations with task check-offs.</p>
            </div>

            {exams.length === 0 ? (
              <div className="py-12 border border-dashed border-slate-100 rounded-2xl text-center space-y-2 text-slate-400 text-xs">
                <p>No exams currently planned.</p>
                <button
                  onClick={() => setIsAddExamOpen(true)}
                  className="bg-slate-100 text-[10px] font-bold px-2 py-1 rounded hover:bg-slate-200 transition-all text-slate-700"
                >
                  Schedule one now
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {exams.map(exam => {
                  const countdown = getExamDaysCountdown(exam.examDate);
                  
                  return (
                    <div key={exam.id} className="border border-slate-100 rounded-2xl p-4 space-y-3.5 bg-slate-50/10">
                      
                      {/* Exam Heading */}
                      <div className="flex justify-between items-start gap-2">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 font-bold">
                            <span className="font-mono text-[10.5px] bg-slate-950 text-white font-black px-1.5 py-0.5 rounded">
                              {exam.courseCode}
                            </span>
                            <span className="text-[11px] text-slate-705">Final Examination</span>
                          </div>
                          <span className="text-[10px] text-slate-400 block font-mono">
                            Date: {new Date(exam.examDate).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </div>

                        <button
                          onClick={() => deleteExam(exam.id)}
                          className="p-1 text-slate-350 hover:text-rose-500 rounded transition-colors"
                          title="Cancel Exam listing"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Countdown badge */}
                      <div className={`p-2.5 rounded-xl border text-xs flex justify-between items-center ${countdown.bg}`}>
                        <span className="font-semibold text-slate-700">Days Remaining:</span>
                        <span className={countdown.color}>{countdown.text}</span>
                      </div>

                      {/* Syllabus Progress details */}
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between items-center text-[10px] font-bold text-slate-600">
                          <span>Syllabus Covered</span>
                          <span className="font-mono text-blue-600">{exam.topicsCoveredPercentage}%</span>
                        </div>
                        
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-600 rounded-full transition-all duration-300"
                            style={{ width: `${exam.topicsCoveredPercentage}%` }}
                          />
                        </div>

                        {/* Checklist items mapping */}
                        <div className="pt-2.5 space-y-1.5 border-t border-slate-100">
                          <span className="text-[9px] uppercase tracking-wider font-bold text-slate-400 font-sans block">Syllabus Milestones:</span>
                          <div className="space-y-1.5">
                            {exam.checklist.map(item => (
                              <label 
                                key={item.id} 
                                className="flex items-start gap-2 p-1.5 bg-white border border-slate-100 rounded-xl cursor-pointer hover:bg-slate-50/20 transition-all text-[11px]"
                              >
                                <input 
                                  type="checkbox"
                                  checked={item.isCompleted}
                                  onChange={() => toggleExamChecklist(exam.id, item.id)}
                                  className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-3.5 w-3.5"
                                />
                                <span className={`text-slate-600 truncate max-w-[170px] ${item.isCompleted ? 'line-through text-slate-400 font-medium' : ''}`}>
                                  {item.title}
                                </span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Exam Sticky Note */}
                      {exam.notes && (
                        <div className="p-2 bg-amber-50/30 border border-amber-50 rounded-xl text-[10px] text-amber-800 italic block">
                          💡 Notes: {exam.notes}
                        </div>
                      )}

                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
