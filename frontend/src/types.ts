/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  photoUrl?: string;
  profession: string;
  currentEducation: string;
  skills: string[];
  careerInterests: string[];
  resumeUrl?: string;
  resumeFileName?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  streakCount: number;
  lastActiveDate?: string;
  productivityScore: number;
  cgpa?: number;
  hoursInvested?: number;
  
  // Onboarding & profile enrichment fields
  authProvider?: string;
  collegeName?: string;
  degree?: string;
  yearOfStudy?: string;
  targetRole?: string;
  createdAt?: string;
  lastLogin?: string;
  careerScore?: number;
  level?: number;
  xp?: number;
  onboarded?: boolean;
}

export type ActivityCategory =
  | 'Education'
  | 'Coding'
  | 'Internship'
  | 'Placement Preparation'
  | 'DSA'
  | 'Project Development'
  | 'Personal Development'
  | 'Networking'
  | 'Health & Fitness'
  | 'Reading'
  | 'Research';

export type PriorityLevel = 'Low' | 'Medium' | 'High' | 'Urgent';

export type ActivityStatus = 'Pending' | 'In Progress' | 'Completed';

export interface DailyActivity {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: ActivityCategory;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  priority: PriorityLevel;
  status: ActivityStatus;
  hoursSpent: number;
}

export interface Milestone {
  id: string;
  title: string;
  isCompleted: boolean;
}

export interface CareerGoal {
  id: string;
  userId: string;
  title: string;
  description?: string;
  isLongTerm: boolean; // true = Long-Term, false = Short-Term
  deadline: string; // YYYY-MM-DD
  milestones: Milestone[];
  progressPercentage: number; // calculated from milestones or direct input
  isCompleted: boolean;
  category: string;
}

export interface SkillItem {
  id: string;
  userId: string;
  name: string;
  currentLevel: number; // 1 to 5 (or percentage 0-100)
  targetLevel: number; // 1 to 5 (or percentage 0-100)
  learningHours: number;
  progressPercentage: number; // calculated as ratio
  category?: string;
}

export type CertificateType =
  | 'Internship Offer'
  | 'Hackathon'
  | 'Competition'
  | 'Workshop'
  | 'Course Completion'
  | 'Academic Merit';

export interface CertificateDoc {
  id: string;
  userId: string;
  title: string;
  issuer: string;
  type: CertificateType;
  issueDate: string;
  description: string;
  fileMockName: string; // Mocks upload filename
  fileData?: string; // Base64 or objectUrl simulated
}

export interface RoadmapNode {
  id: string;
  title: string;
  description: string;
  isCompleted: boolean;
  order: number;
}

export interface CareerRoadmap {
  id: string;
  userId: string;
  pathName: string; // e.g. Frontend Developer, Machine Learning, etc.
  description: string;
  nodes: RoadmapNode[];
  completionPercentage: number;
}

export interface ProfessionalJournal {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  title: string;
  whatILearned: string;
  challengesFaced: string;
  achievements: string;
  nextDayPlan: string;
}

export type ApplicationStatus =
  | 'Wishlist'
  | 'Applied'
  | 'In Interview'
  | 'Offer'
  | 'Rejected';

export interface ApplicationTracker {
  id: string;
  userId: string;
  companyName: string;
  role: string;
  type: 'Internship' | 'Full-Time Placement';
  status: ApplicationStatus;
  dateApplied: string;
  notes?: string;
  salary?: string;
  link?: string;
}

export interface AchievementBadge {
  id: string;
  title: string;
  description: string;
  iconName: string; // Name of Lucide icon
  unlockedAt?: string;
  isUnlocked: boolean;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'deadline';
  date: string;
  isRead: boolean;
}

export interface CourseItem {
  id: string;
  userId: string;
  code: string;
  name: string;
  credits: number;
  grade?: string; // A+, A, B, C etc.
  attendancePre: number;
  attendanceAbs: number;
  quiz1?: number;
  midTerm?: number;
  quiz2?: number;
  endSem?: number;
}

export interface PastSemester {
  id: string;
  userId: string;
  name: string; // e.g. "Semester 1"
  gpa: number;
}

export interface ExamChecklistItem {
  id: string;
  title: string;
  isCompleted: boolean;
}

export interface ExamMetric {
  id: string;
  userId: string;
  courseCode: string;
  examDate: string; // YYYY-MM-DD
  topicsCoveredPercentage: number;
  notes?: string;
  checklist: ExamChecklistItem[];
}

export interface ProjectCard {
  id: string;
  userId: string;
  title: string;
  description: string;
  lane: 'Planned' | 'In Progress' | 'Completed' | 'Portfolio Ready';
  githubLink?: string;
  liveLink?: string;
  techStack: string[];
}

