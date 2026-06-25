/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  signInWithPopup,
  sendEmailVerification,
  sendPasswordResetEmail,
  updateProfile as firebaseUpdateProfile
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  getDocs,
  setDoc as firestoreSetDoc,
  updateDoc as firestoreUpdateDoc,
  deleteDoc as firestoreDeleteDoc
} from 'firebase/firestore';
import { auth, db, isFirebaseConfigured, googleProvider, githubProvider } from '../firebase';
import {
  UserProfile,
  DailyActivity,
  CareerGoal,
  SkillItem,
  CertificateDoc,
  CareerRoadmap,
  ProfessionalJournal,
  ApplicationTracker,
  AchievementBadge,
  AppNotification,
  ActivityCategory,
  PriorityLevel,
  ActivityStatus,
  CertificateType,
  Milestone,
  RoadmapNode,
  ApplicationStatus,
  CourseItem,
  PastSemester,
  ExamMetric,
  ProjectCard
} from '../types';

interface CareerContextType {
  currentUser: UserProfile | null;
  setCurrentUser: (user: UserProfile | null) => void;
  users: UserProfile[];
  activities: DailyActivity[];
  goals: CareerGoal[];
  skills: SkillItem[];
  certificates: CertificateDoc[];
  roadmaps: CareerRoadmap[];
  journals: ProfessionalJournal[];
  applications: ApplicationTracker[];
  badges: AchievementBadge[];
  notifications: AppNotification[];
  courses: CourseItem[];
  pastSemesters: PastSemester[];
  exams: ExamMetric[];
  projects: ProjectCard[];
  
  // Auth Functions (Real Firebase and fallback Mock)
  login: (email: string, password?: string) => Promise<boolean>;
  signup: (name: string, email: string, profession: string, currentEducation: string, password?: string) => Promise<boolean>;
  googleSignIn: (email?: string, name?: string) => Promise<boolean>;
  githubSignIn: () => Promise<boolean>;
  logout: () => void;
  updateProfile: (profile: Partial<UserProfile>) => void;
  resetPassword: (email: string) => Promise<void>;
  verifyEmail: () => Promise<void>;
  
  // theme setup
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  
  // Activity CRUD
  addActivity: (activity: Omit<DailyActivity, 'id' | 'userId'>) => void;
  updateActivity: (id: string, activity: Partial<DailyActivity>) => void;
  deleteActivity: (id: string) => void;
  
  // Goal CRUD
  addGoal: (goal: Omit<CareerGoal, 'id' | 'userId' | 'progressPercentage' | 'isCompleted' | 'milestones'> & { milestones: string[] }) => void;
  updateGoal: (id: string, goal: Partial<CareerGoal>) => void;
  toggleMilestone: (goalId: string, milestoneId: string) => void;
  deleteGoal: (id: string) => void;
  
  // Skill CRUD
  addSkill: (skill: Omit<SkillItem, 'id' | 'userId' | 'progressPercentage'>) => void;
  updateSkill: (id: string, skill: Partial<SkillItem>) => void;
  addLearningHours: (skillId: string, hours: number) => void;
  deleteSkill: (id: string) => void;
  
  // Certificate CRUD
  addCertificate: (cert: Omit<CertificateDoc, 'id' | 'userId'>) => void;
  deleteCertificate: (id: string) => void;
  
  // Roadmap CRUD
  addRoadmap: (roadmap: Omit<CareerRoadmap, 'id' | 'userId' | 'completionPercentage'> & { steps: string[] }) => void;
  toggleRoadmapStep: (roadmapId: string, stepId: string) => void;
  deleteRoadmap: (id: string) => void;
  
  // Journal CRUD
  addJournal: (journal: Omit<ProfessionalJournal, 'id' | 'userId'>) => void;
  updateJournal: (id: string, journal: Partial<ProfessionalJournal>) => void;
  deleteJournal: (id: string) => void;
  
  // Application CRUD
  addApplication: (app: Omit<ApplicationTracker, 'id' | 'userId'>) => void;
  updateApplication: (id: string, app: Partial<ApplicationTracker>) => void;
  deleteApplication: (id: string) => void;

  // New Academic CRUD
  addCourse: (course: Omit<CourseItem, 'id' | 'userId'>) => void;
  updateCourse: (id: string, course: Partial<CourseItem>) => void;
  deleteCourse: (id: string) => void;
  logAttendance: (id: string, type: 'Present' | 'Absent') => void;

  addPastSemester: (sem: Omit<PastSemester, 'id' | 'userId'>) => void;
  deletePastSemester: (id: string) => void;

  addExam: (exam: Omit<ExamMetric, 'id' | 'userId'>) => void;
  updateExam: (id: string, exam: Partial<ExamMetric>) => void;
  deleteExam: (id: string) => void;
  toggleExamChecklist: (examId: string, itemId: string) => void;

  addProject: (project: Omit<ProjectCard, 'id' | 'userId'>) => void;
  updateProject: (id: string, project: Partial<ProjectCard>) => void;
  deleteProject: (id: string) => void;
  moveProject: (id: string, lane: ProjectCard['lane']) => void;
  
  // Badge Management overrides
  unlockBadges: (badgeIds: string[]) => void;

  // Notification Management
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
  triggerNotification: (title: string, message: string, type: AppNotification['type']) => void;
}

const CareerContext = createContext<CareerContextType | undefined>(undefined);

// Local Storage Helper keys
const STORAGE_KEYS = {
  USERS: 'career_tracker_users',
  CURRENT_USER_UID: 'career_tracker_current_uid',
  ACTIVITIES: 'career_tracker_activities',
  GOALS: 'career_tracker_goals',
  SKILLS: 'career_tracker_skills',
  CERTIFICATES: 'career_tracker_certs',
  ROADMAPS: 'career_tracker_roadmaps',
  JOURNALS: 'career_tracker_journals',
  APPLICATIONS: 'career_tracker_applications',
  NOTIFICATIONS: 'career_tracker_notifications',
  BADGES: 'career_tracker_badges_v1',
  COURSES: 'career_tracker_courses',
  PAST_SEMESTERS: 'career_tracker_past_semesters',
  EXAMS: 'career_tracker_exams',
  PROJECTS: 'career_tracker_projects'
};

const DEFAULT_BADGES: AchievementBadge[] = [
  { id: 'b1', title: 'First Milestone', description: 'Log your very first daily activity', iconName: 'CheckCircle', isUnlocked: false },
  { id: 'b2', title: 'Productivity Engine', description: 'Achieve a productivity score of over 80', iconName: 'Zap', isUnlocked: false },
  { id: 'b3', title: 'Socrates', description: 'Write 3 entries in your daily professional reflection journal', iconName: 'BookOpen', isUnlocked: false },
  { id: 'b4', title: 'Versatile Achiever', description: 'Track and update at least 5 customized skills', iconName: 'Cpu', isUnlocked: false },
  { id: 'b5', title: 'Career Architect', description: 'Set up your first structured Career Roadmap', iconName: 'GitBranch', isUnlocked: false },
  { id: 'b6', title: 'Goal Crusher', description: 'Fully autocomplete a Career Goal and all milestones', iconName: 'Award', isUnlocked: false },
  { id: 'b7', title: 'Job Hunter', description: 'Track 3 internship/placement applications', iconName: 'Briefcase', isUnlocked: false },
  { id: 'b8', title: 'Streak Master', description: 'Maintain a learning streak of 5 days or more', iconName: 'Flame', isUnlocked: false }
];

export const CareerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [activities, setActivities] = useState<DailyActivity[]>([]);
  const [goals, setGoals] = useState<CareerGoal[]>([]);
  const [skills, setSkills] = useState<SkillItem[]>([]);
  const [certificates, setCertificates] = useState<CertificateDoc[]>([]);
  const [roadmaps, setRoadmaps] = useState<CareerRoadmap[]>([]);
  const [journals, setJournals] = useState<ProfessionalJournal[]>([]);
  const [applications, setApplications] = useState<ApplicationTracker[]>([]);
  const [badges, setBadges] = useState<AchievementBadge[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [pastSemesters, setPastSemesters] = useState<PastSemester[]>([]);
  const [exams, setExams] = useState<ExamMetric[]>([]);
  const [projects, setProjects] = useState<ProjectCard[]>([]);

  // Theme support
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('career_tracker_theme') as 'light' | 'dark') || 'light';
  });

  useEffect(() => {
    localStorage.setItem('career_tracker_theme', theme);
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));

  // 1. Initial State Bootstrapper (using local storage or inserting Mock Data for Harsha)
  useEffect(() => {
    // Check if USERS exist in storage
    const storedUsers = localStorage.getItem(STORAGE_KEYS.USERS);
    const storedUID = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_UID);
    
    let loadedUsers: UserProfile[] = [];
    let currentUID: string | null = null;

    if (!storedUsers) {
      // Setup HARSHA as default user
      const harsha: UserProfile = {
        uid: 'user_harsha',
        name: 'Harsha',
        email: 'harsha@career.com',
        profession: 'Software Engineer Intern & CS Student',
        currentEducation: 'B.Tech in Computer Science and Engineering',
        skills: ['React', 'Firebase', 'Java', 'Python', 'Data Structures', 'Git'],
        careerInterests: ['Frontend Development', 'Full-Stack Engineering', 'Cloud Solutions', 'AI systems'],
        linkedinUrl: 'https://linkedin.com/in/harsha-developer',
        githubUrl: 'https://github.com/harsha-dev',
        resumeUrl: 'https://career-tracker.offline/resumes/harsha_cv.pdf',
        resumeFileName: 'harsha_portfolio_resume.pdf',
        streakCount: 5,
        lastActiveDate: new Date().toISOString().split('T')[0],
        productivityScore: 88
      };
      loadedUsers = [harsha];
      currentUID = 'user_harsha';
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(loadedUsers));
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER_UID, currentUID);
    } else {
      loadedUsers = JSON.parse(storedUsers);
      currentUID = storedUID || (loadedUsers.length > 0 ? loadedUsers[0].uid : null);
    }

    setUsers(loadedUsers);

    // Bootstrapped Mock activities if empty
    const storedActivities = localStorage.getItem(STORAGE_KEYS.ACTIVITIES);
    let loadedActivities: DailyActivity[] = [];
    if (!storedActivities) {
      const todayString = new Date().toISOString().split('T')[0];
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayString = yesterday.toISOString().split('T')[0];
      
      loadedActivities = [
        {
          id: 'act1',
          userId: 'user_harsha',
          title: 'Solve 5 DSA Hard Problems',
          description: 'Solved questions on Graph Traversal, Cycles and DFS Tree on LeetCode.',
          category: 'DSA',
          date: todayString,
          startTime: '09:00',
          endTime: '11:30',
          priority: 'High',
          status: 'Completed',
          hoursSpent: 2.5
        },
        {
          id: 'act2',
          userId: 'user_harsha',
          title: 'Learn react state synchronization',
          description: 'Explored custom hooks and offline local state management with local storage.',
          category: 'Coding',
          date: todayString,
          startTime: '13:00',
          endTime: '15:30',
          priority: 'High',
          status: 'Completed',
          hoursSpent: 2.5
        },
        {
          id: 'act3',
          userId: 'user_harsha',
          title: 'Update Portfolio UI with Framer Motion',
          description: 'Adding beautiful keyframe transitions and hover scales to active menu links.',
          category: 'Project Development',
          date: todayString,
          startTime: '16:00',
          endTime: '18:00',
          priority: 'Medium',
          status: 'In Progress',
          hoursSpent: 2
        },
        {
          id: 'act4',
          userId: 'user_harsha',
          title: 'Read System Design Primer Chapter 1',
          description: 'Understood Horizontal vs Vertical scaling and cache coherency.',
          category: 'Placement Preparation',
          date: yesterdayString,
          startTime: '10:00',
          endTime: '11:30',
          priority: 'Medium',
          status: 'Completed',
          hoursSpent: 1.5
        },
        {
          id: 'act5',
          userId: 'user_harsha',
          title: 'Health and Core Workout',
          description: 'Simple 45 min cardio + stretch to keep energy levels high.',
          category: 'Health & Fitness',
          date: yesterdayString,
          startTime: '18:00',
          endTime: '18:45',
          priority: 'Low',
          status: 'Completed',
          hoursSpent: 0.75
        }
      ];
      localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(loadedActivities));
    } else {
      loadedActivities = JSON.parse(storedActivities);
    }
    setActivities(loadedActivities);

    // Bootstrapped Mock skills
    const storedSkills = localStorage.getItem(STORAGE_KEYS.SKILLS);
    let loadedSkills: SkillItem[] = [];
    if (!storedSkills) {
      loadedSkills = [
        { id: 'sk1', userId: 'user_harsha', name: 'React.js', currentLevel: 4, targetLevel: 5, learningHours: 85, progressPercentage: 80, category: 'Frontend' },
        { id: 'sk2', userId: 'user_harsha', name: 'Firebase', currentLevel: 3, targetLevel: 4, learningHours: 35, progressPercentage: 75, category: 'Fullstack' },
        { id: 'sk3', userId: 'user_harsha', name: 'Java & Springs', currentLevel: 4, targetLevel: 5, learningHours: 120, progressPercentage: 80, category: 'Backend' },
        { id: 'sk4', userId: 'user_harsha', name: 'Python', currentLevel: 3, targetLevel: 4, learningHours: 45, progressPercentage: 75, category: 'Data Science' },
        { id: 'sk5', userId: 'user_harsha', name: 'Data Structures', currentLevel: 4, targetLevel: 5, learningHours: 150, progressPercentage: 80, category: 'Fundamentals' }
      ];
      localStorage.setItem(STORAGE_KEYS.SKILLS, JSON.stringify(loadedSkills));
    } else {
      loadedSkills = JSON.parse(storedSkills);
    }
    setSkills(loadedSkills);

    // Bootstrapped Mock goals
    const storedGoals = localStorage.getItem(STORAGE_KEYS.GOALS);
    let loadedGoals: CareerGoal[] = [];
    if (!storedGoals) {
      loadedGoals = [
        {
          id: 'g1',
          userId: 'user_harsha',
          title: 'Become Software Engineer at TOP-tier Tech firm',
          description: 'Prepare thoroughly on core Computer Science, fullstack web technologies, and build premium portfolio projects.',
          isLongTerm: true,
          deadline: '2026-12-31',
          category: 'Software Engineering',
          milestones: [
            { id: 'm1_1', title: 'Solve 400 problems on LeetCode', isCompleted: true },
            { id: 'm1_2', title: 'Build 3 fullstack cloud projects', isCompleted: false },
            { id: 'm1_3', title: 'Get AWS Cloud Practitioner certification', isCompleted: false }
          ],
          progressPercentage: 33,
          isCompleted: false
        },
        {
          id: 'g2',
          userId: 'user_harsha',
          title: 'Build Professional Career Tracker Website',
          description: 'A React and Tailwind single page app with full localized metrics and analytics dashboards.',
          isLongTerm: false,
          deadline: '2026-06-15',
          category: 'Development',
          milestones: [
            { id: 'm2_1', title: 'Draft mockups and state engine', isCompleted: true },
            { id: 'm2_2', title: 'Implement Dashboard and Activity Logger', isCompleted: true },
            { id: 'm2_3', title: 'Add Recharts analytics views and dark mode styles', isCompleted: true },
            { id: 'm2_4', title: 'Integration with resume and application tracker', isCompleted: true }
          ],
          progressPercentage: 100,
          isCompleted: true
        },
        {
          id: 'g3',
          userId: 'user_harsha',
          title: 'Acquire Google Cloud internship placement',
          description: 'Develop strong networking skills, finish placement preparations, and pass the Google technical screens.',
          isLongTerm: true,
          deadline: '2026-09-01',
          category: 'Internship',
          milestones: [
            { id: 'm3_1', title: 'Maintain a 5-day continuous learning streak', isCompleted: true },
            { id: 'm3_2', title: 'Receive referral letter from external contributor', isCompleted: false },
            { id: 'm3_3', title: 'Crack initial mock phone interview', isCompleted: false }
          ],
          progressPercentage: 33,
          isCompleted: false
        }
      ];
      localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(loadedGoals));
    } else {
      loadedGoals = JSON.parse(storedGoals);
    }
    setGoals(loadedGoals);

    // Bootstrapped Mock certificates
    const storedCerts = localStorage.getItem(STORAGE_KEYS.CERTIFICATES);
    let loadedCerts: CertificateDoc[] = [];
    if (!storedCerts) {
      loadedCerts = [
        {
          id: 'c1',
          userId: 'user_harsha',
          title: 'Advanced React Native and Redux Complete Certificate',
          issuer: 'Udemy Academic Platform',
          type: 'Course Completion',
          issueDate: '2026-04-12',
          description: 'Gained comprehensive mastery in mobile states, local hooks, and performance telemetry.',
          fileMockName: 'react_redux_cert_harsha.pdf'
        },
        {
          id: 'c2',
          userId: 'user_harsha',
          title: 'Google Developer Student Clubs Outstanding Contributor',
          issuer: 'Google Developers Program Group',
          type: 'Competition',
          issueDate: '2026-02-28',
          description: 'Recognized for building localized community open-source utilities and managing standard tech bootcamps.',
          fileMockName: 'gdsc_leadership_certificate.pdf'
        }
      ];
      localStorage.setItem(STORAGE_KEYS.CERTIFICATES, JSON.stringify(loadedCerts));
    } else {
      loadedCerts = JSON.parse(storedCerts);
    }
    setCertificates(loadedCerts);

    // Bootstrapped Roadmaps
    const storedRoadmaps = localStorage.getItem(STORAGE_KEYS.ROADMAPS);
    let loadedRoadmaps: CareerRoadmap[] = [];
    if (!storedRoadmaps) {
      loadedRoadmaps = [
        {
          id: 'r1',
          userId: 'user_harsha',
          pathName: 'Full Stack Developer',
          description: 'Syllabus spanning structural web layouts, backend services integration, cloud hosts, and local state engines.',
          nodes: [
            { id: 'rn1_1', title: 'Semantic HTML5, CSS3 Grid, and Responsive Forms', description: 'Master layout models, density patterns and media breakpoints.', isCompleted: true, order: 1 },
            { id: 'rn1_2', title: 'Advanced JavaScript (ES6+), Closures, and Promises', description: 'Asynchronous event loops, micro-tasks and scope.', isCompleted: true, order: 2 },
            { id: 'rn1_3', title: 'React Hooks, Custom Providers, and Component Architecture', description: 'Manage UI state efficiently using local caches.', isCompleted: true, order: 3 },
            { id: 'rn1_4', title: 'State Engines: Context API / Redux & Tailwind styling', description: 'Cohesive professional styles, responsive UI structures.', isCompleted: true, order: 4 },
            { id: 'rn1_5', title: 'Databases: Firebase (Firestore, Auth, Storage) and SQL', description: 'Relational and document storage structures.', isCompleted: false, order: 5 },
            { id: 'rn1_6', title: 'CI/CD, Cloud Deployment and Nginx Proxies', description: 'Deliver production containers securely to host runners.', isCompleted: false, order: 6 }
          ],
          completionPercentage: 66
        },
        {
          id: 'r2',
          userId: 'user_harsha',
          pathName: 'Data Scientist & AI Engineer',
          description: 'Mathematical grounding, core machine learning mechanics, neural network systems, and large language API prompting.',
          nodes: [
            { id: 'rn2_1', title: 'Linear Algebra, Probability, and Statistics', description: 'Foundation metrics, distributions, and core models.', isCompleted: true, order: 1 },
            { id: 'rn2_2', title: 'Python scientific libraries: Pandas, NumPy, Scikit-learn', description: 'Data sanitization, tabular filters and basic regressors.', isCompleted: true, order: 2 },
            { id: 'rn2_3', title: 'Machine learning classifiers and tuning', description: 'Evaluation ratios, ROC, precision-recall and validation.', isCompleted: false, order: 3 },
            { id: 'rn2_4', title: 'Deep Learning frameworks, RNNs, and CNNs', description: 'Build feedforward and convoluted neural nodes.', isCompleted: false, order: 4 }
          ],
          completionPercentage: 50
        }
      ];
      localStorage.setItem(STORAGE_KEYS.ROADMAPS, JSON.stringify(loadedRoadmaps));
    } else {
      loadedRoadmaps = JSON.parse(storedRoadmaps);
    }
    setRoadmaps(loadedRoadmaps);

    // Bootstrapped journals
    const storedJournals = localStorage.getItem(STORAGE_KEYS.JOURNALS);
    let loadedJournals: ProfessionalJournal[] = [];
    if (!storedJournals) {
      const todayString = new Date().toISOString().split('T')[0];
      loadedJournals = [
        {
          id: 'j1',
          userId: 'user_harsha',
          date: todayString,
          title: 'Breakthrough with React Context offline architecture',
          whatILearned: 'Successfully structured nested states that hook directly into browser localStorage. Understood how to prevent expensive state writes by debouncing updates or scoping modifications.',
          challengesFaced: 'Encountered visual flicker during rapid theme shifts when relying too heavily on inline elements. Solved this by setting standard Tailwind variables on root elements.',
          achievements: 'Created a highly responsive local analytics module that recalculates streak levels on each daily task completion.',
          nextDayPlan: 'Integrate full certificate download links and design custom vector badges for reward models.'
        }
      ];
      localStorage.setItem(STORAGE_KEYS.JOURNALS, JSON.stringify(loadedJournals));
    } else {
      loadedJournals = JSON.parse(storedJournals);
    }
    setJournals(loadedJournals);

    // Bootstrapped Applications Tracker
    const storedApps = localStorage.getItem(STORAGE_KEYS.APPLICATIONS);
    let loadedApps: ApplicationTracker[] = [];
    if (!storedApps) {
      loadedApps = [
        {
          id: 'ap1',
          userId: 'user_harsha',
          companyName: 'Google',
          role: 'Summer Software Engineering Intern',
          type: 'Internship',
          status: 'Applied',
          dateApplied: '2026-05-10',
          notes: 'Completed initial application via careers portal. Solved coding challenge on graphs and geometry. Keeping DSA fresh for tech phone screens.',
          salary: '$7,200 / month',
          link: 'https://careers.google.com'
        },
        {
          id: 'ap2',
          userId: 'user_harsha',
          companyName: 'Stripe',
          role: 'Frontend Engineering Intern',
          type: 'Internship',
          status: 'In Interview',
          dateApplied: '2026-05-14',
          notes: 'Finished hiring assessment on React component telemetry. Scheduling technical pair coding layout challenge on June 5th.',
          salary: '$8,000 / month',
          link: 'https://stripe.com/jobs'
        }
      ];
      localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(loadedApps));
    } else {
      loadedApps = JSON.parse(storedApps);
    }
    setApplications(loadedApps);

    // Load badges
    const storedBadges = localStorage.getItem(STORAGE_KEYS.BADGES);
    let loadedBadges: AchievementBadge[] = [];
    if (!storedBadges) {
      // Create fresh default badges
      loadedBadges = [...DEFAULT_BADGES];
      loadedBadges[0].isUnlocked = true; // Unlock first activity milestone by default (act1 and act2 are completed)
      loadedBadges[0].unlockedAt = new Date().toISOString().split('T')[0];
      loadedBadges[3].isUnlocked = true; // Versatile Achiever (Harsha has 5 skills added)
      loadedBadges[3].unlockedAt = new Date().toISOString().split('T')[0];
      loadedBadges[5].isUnlocked = true; // Goal Crusher (Goal g2 is 100% complete)
      loadedBadges[5].unlockedAt = new Date().toISOString().split('T')[0];
      loadedBadges[7].isUnlocked = true; // Streak Master (Harsha has streak of 5)
      loadedBadges[7].unlockedAt = new Date().toISOString().split('T')[0];
    } else {
      loadedBadges = JSON.parse(storedBadges);
    }

    // Always ensure these requested badges are unlocked and beautifully colored
    loadedBadges = loadedBadges.map(b => {
      if (b.id === 'b2' || b.id === 'b3' || b.id === 'b7') {
        return { ...b, isUnlocked: true, unlockedAt: b.unlockedAt || new Date().toISOString().split('T')[0] };
      }
      return b;
    });

    localStorage.setItem(STORAGE_KEYS.BADGES, JSON.stringify(loadedBadges));
    setBadges(loadedBadges);

    // Bootstrapped Notifications
    const storedNotifications = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    let loadedNotifications: AppNotification[] = [];
    if (!storedNotifications) {
      const todayString = new Date().toISOString().split('T')[0];
      loadedNotifications = [
        {
          id: 'n1',
          title: 'Pending Deadlines',
          message: 'Short-term Goal: "Build Portfolio Website" approaches its deadline soon!',
          type: 'deadline',
          date: todayString,
          isRead: false
        },
        {
          id: 'n2',
          title: 'Daily Check-in',
          message: 'Good morning! Write down today\'s reflections in your professional career journal.',
          type: 'info',
          date: todayString,
          isRead: false
        },
        {
          id: 'n3',
          title: 'Skill Milestone Met',
          message: 'Awesome! Your React.js skill hours completed (85 hrs) have unlocked standard proficiency!',
          type: 'success',
          date: todayString,
          isRead: false
        }
      ];
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(loadedNotifications));
    } else {
      loadedNotifications = JSON.parse(storedNotifications);
    }
    setNotifications(loadedNotifications);

    // Load courses
    const storedCourses = localStorage.getItem(STORAGE_KEYS.COURSES);
    let loadedCourses: CourseItem[] = [];
    if (!storedCourses) {
      loadedCourses = [
        {
          id: 'course_1',
          userId: 'user_harsha',
          code: 'CS-401',
          name: 'Computer Networks',
          credits: 4,
          grade: 'A',
          attendancePre: 15,
          attendanceAbs: 2,
          quiz1: 8,
          midTerm: 42,
          quiz2: 9,
          endSem: 78
        },
        {
          id: 'course_2',
          userId: 'user_harsha',
          code: 'CS-402',
          name: 'Compiler Design',
          credits: 3,
          grade: 'A+',
          attendancePre: 14,
          attendanceAbs: 1,
          quiz1: 9,
          midTerm: 45,
          quiz2: 10,
          endSem: 82
        },
        {
          id: 'course_3',
          userId: 'user_harsha',
          code: 'CS-403',
          name: 'Software Engineering',
          credits: 3,
          grade: 'B',
          attendancePre: 9,
          attendanceAbs: 4,
          quiz1: 7,
          midTerm: 35,
          quiz2: 8
        },
        {
          id: 'course_4',
          userId: 'user_harsha',
          code: 'CS-404',
          name: 'Artificial Intelligence',
          credits: 4,
          attendancePre: 13,
          attendanceAbs: 1,
          quiz1: 9,
          midTerm: 44,
          quiz2: 9
        }
      ];
      localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(loadedCourses));
    } else {
      loadedCourses = JSON.parse(storedCourses);
    }
    setCourses(loadedCourses);

    // Load past semesters
    const storedPast = localStorage.getItem(STORAGE_KEYS.PAST_SEMESTERS);
    let loadedPast: PastSemester[] = [];
    if (!storedPast) {
      loadedPast = [
        { id: 'past_1', userId: 'user_harsha', name: 'Semester 1', gpa: 8.4 },
        { id: 'past_2', userId: 'user_harsha', name: 'Semester 2', gpa: 8.7 },
        { id: 'past_3', userId: 'user_harsha', name: 'Semester 3', gpa: 9.1 }
      ];
      localStorage.setItem(STORAGE_KEYS.PAST_SEMESTERS, JSON.stringify(loadedPast));
    } else {
      loadedPast = JSON.parse(storedPast);
    }
    setPastSemesters(loadedPast);

    // Load exams
    const storedExams = localStorage.getItem(STORAGE_KEYS.EXAMS);
    let loadedExams: ExamMetric[] = [];
    if (!storedExams) {
      const sevenDaysLater = new Date();
      sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);
      const twelveDaysLater = new Date();
      twelveDaysLater.setDate(twelveDaysLater.getDate() + 12);

      loadedExams = [
        {
          id: 'exam_1',
          userId: 'user_harsha',
          courseCode: 'CS-401',
          examDate: sevenDaysLater.toISOString().split('T')[0],
          topicsCoveredPercentage: 80,
          notes: 'Focus on IPv6 headers, TCP flow controllers and sliding window handshake configs.',
          checklist: [
            { id: 'ch1', title: 'IP Routing & Subnet mask subnets', isCompleted: true },
            { id: 'ch2', title: 'DNS Protocols & TCP 3-way handshake', isCompleted: true },
            { id: 'ch3', title: 'Congestion controller feedback algorithms', isCompleted: false }
          ]
        },
        {
          id: 'exam_2',
          userId: 'user_harsha',
          courseCode: 'CS-402',
          examDate: twelveDaysLater.toISOString().split('T')[0],
          topicsCoveredPercentage: 60,
          notes: 'Focus on LALR parser tables and syntax trees compilation.',
          checklist: [
            { id: 'ch4', title: 'Lexical Analysis scanners', isCompleted: true },
            { id: 'ch5', title: 'Parsing Grammars LR(1)/SLR(1)', isCompleted: true },
            { id: 'ch6', title: 'Intermediate code 3address configurations', isCompleted: false }
          ]
        }
      ];
      localStorage.setItem(STORAGE_KEYS.EXAMS, JSON.stringify(loadedExams));
    } else {
      loadedExams = JSON.parse(storedExams);
    }
    setExams(loadedExams);

    // Load projects
    const storedProjects = localStorage.getItem(STORAGE_KEYS.PROJECTS);
    let loadedProjects: ProjectCard[] = [];
    if (!storedProjects) {
      loadedProjects = [
        {
          id: 'proj_1',
          userId: 'user_harsha',
          title: 'Student Operating System (Student OS)',
          description: 'Offline-first academic tracker dashboard and personal scheduler with Trello boards, timers, and GPAs.',
          lane: 'In Progress',
          techStack: ['React', 'Tailwind', 'Recharts'],
          githubLink: 'https://github.com/harsha-dev/student-os'
        },
        {
          id: 'proj_2',
          userId: 'user_harsha',
          title: 'Growth Timeline & Credentials Planner',
          description: 'Responsive milestone pipeline showcasing portfolio achievements and timelines.',
          lane: 'Completed',
          techStack: ['HTML5', 'CSS3', 'JS'],
          liveLink: 'https://timeline.harsha.dev'
        },
        {
          id: 'proj_3',
          userId: 'user_harsha',
          title: 'Web Crypto Storage wrapper',
          description: 'Lightweight typescript API targeting client-side AES encrypted stores in IndexedDB/localStorage.',
          lane: 'Planned',
          techStack: ['TypeScript', 'WebCrypto']
        }
      ];
      localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(loadedProjects));
    } else {
      loadedProjects = JSON.parse(storedProjects);
    }
    setProjects(loadedProjects);

    // Set Active User profile:
    if (!isFirebaseConfigured && currentUID) {
      const matched = loadedUsers.find(u => u.uid === currentUID);
      if (matched) {
        setCurrentUser(matched);
      } else if (loadedUsers.length > 0) {
        setCurrentUser(loadedUsers[0]);
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER_UID, loadedUsers[0].uid);
      }
    }
  }, [isFirebaseConfigured]);

  // 1.5 Real Firebase Listener
  useEffect(() => {
    if (!isFirebaseConfigured) return;

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userRef = doc(db, 'users', firebaseUser.uid);
        try {
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            const profile = userSnap.data() as UserProfile;
            setCurrentUser(profile);
            
            // Sync all subcollections
            await loadUserFirestoreData(firebaseUser.uid);
            triggerNotification('Secure Connection', `Linked cloud database workspace for: ${profile.email}`, 'info');
          } else {
            // First time login! Register user profile
            const provider = firebaseUser.providerData[0]?.providerId || "google.com";
            const newProfile: UserProfile = {
              uid: firebaseUser.uid,
              name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Student Member',
              email: firebaseUser.email || '',
              profession: 'Software Engineer Intern & CS Student',
              currentEducation: 'B.Tech in Computer Science and Engineering',
              skills: ['React', 'Firebase', 'Data Structures'],
              careerInterests: ['Frontend Development', 'Engineering'],
              streakCount: 1,
              productivityScore: 40,
              authProvider: provider,
              createdAt: new Date().toISOString(),
              lastLogin: new Date().toISOString(),
              careerScore: 40,
              level: 1,
              xp: 0,
              onboarded: true // Trigger onboarding bypassed
            };
            
            await setDoc(userRef, newProfile);
            setCurrentUser(newProfile);
            
            await seedUserFirestoreDefaults(firebaseUser.uid);
            triggerNotification('Welcome to Nexora!', 'Your secure portfolio is configured.', 'success');
          }
        } catch (err) {
          console.error("Firestore loading error on auth transition:", err);
        }
      } else {
        setCurrentUser(null);
      }
    });

    return () => unsubscribe();
  }, [isFirebaseConfigured]);

  // 2. Active User Synchronization Hook
  useEffect(() => {
    if (currentUser) {
      if (isFirebaseConfigured) {
        const userRef = doc(db, 'users', currentUser.uid);
        setDoc(userRef, currentUser, { merge: true }).catch(err => {
          console.error("Failed to sync updated user profile to Firebase:", err);
        });
      } else if (users.length > 0) {
        const updatedUsers = users.map(u => (u.uid === currentUser.uid ? currentUser : u));
        // Save users changes to localStorage
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(updatedUsers));
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER_UID, currentUser.uid);
      }
    }
  }, [currentUser, isFirebaseConfigured]);

  // Recalculating Streak and Productivity scores on changes
  const runStateTelemetry = (
    currentActs: DailyActivity[] = activities, 
    currentGls: CareerGoal[] = goals, 
    currentSkls: SkillItem[] = skills,
    currentJrnls: ProfessionalJournal[] = journals,
    currentApps: ApplicationTracker[] = applications,
    currentPath: CareerRoadmap[] = roadmaps
  ) => {
    if (!currentUser) return;

    // Filtered by current user
    const userActs = currentActs.filter(a => a.userId === currentUser.uid);
    const userGoals = currentGls.filter(g => g.userId === currentUser.uid);
    const userSkls = currentSkls.filter(s => s.userId === currentUser.uid);
    const userJournals = currentJrnls.filter(j => j.userId === currentUser.uid);
    const userApps = currentApps.filter(ap => ap.userId === currentUser.uid);
    const userPath = currentPath.filter(rp => rp.userId === currentUser.uid);

    // TODAY COMPLETED ACTIVITIES scoring
    const todayStr = new Date().toISOString().split('T')[0];
    const todayActs = userActs.filter(a => a.date === todayStr);
    const completedToday = todayActs.filter(a => a.status === 'Completed');
    
    let activityScore = 0;
    if (todayActs.length > 0) {
      activityScore = (completedToday.length / todayActs.length) * 40;
    } else {
      // default baseline if no tasks logged today
      activityScore = 30; 
    }

    // GOAL PROGRESS percentage met
    const totalGoals = userGoals.length;
    const completedGoalsList = userGoals.filter(g => g.isCompleted);
    let goalScore = 0;
    if (totalGoals > 0) {
      goalScore = (completedGoalsList.length / totalGoals) * 30;
    }

    // LEARNING HOURS scale points
    const totalHoursSpent = userSkls.reduce((sum, s) => sum + s.learningHours, 0);
    const learningScore = Math.min((totalHoursSpent / 200) * 20, 20); // Cap in 20 percentage logic

    // STREAK points
    const streakPoints = Math.min(currentUser.streakCount * 2, 10);

    // Total productivity score: Max 100
    const finalProductivityScore = Math.round(activityScore + goalScore + learningScore + streakPoints);
    
    // Check badge unlocks
    const updatedBadges = [...badges];
    let badgeEarnedNotification = false;

    // b1: First Milestone
    if (!updatedBadges[0].isUnlocked && userActs.some(a => a.status === 'Completed')) {
      updatedBadges[0].isUnlocked = true;
      updatedBadges[0].unlockedAt = todayStr;
      badgeEarnedNotification = true;
    }
    // b2: Productivity Engine ( score > 80 )
    if (!updatedBadges[1].isUnlocked && finalProductivityScore >= 80) {
      updatedBadges[1].isUnlocked = true;
      updatedBadges[1].unlockedAt = todayStr;
      badgeEarnedNotification = true;
    }
    // b3: Socrates daily journals count >=3
    if (!updatedBadges[2].isUnlocked && userJournals.length >= 3) {
      updatedBadges[2].isUnlocked = true;
      updatedBadges[2].unlockedAt = todayStr;
      badgeEarnedNotification = true;
    }
    // b4: Versatile Achiever (skills >= 5)
    if (!updatedBadges[3].isUnlocked && userSkls.length >= 5) {
      updatedBadges[3].isUnlocked = true;
      updatedBadges[3].unlockedAt = todayStr;
      badgeEarnedNotification = true;
    }
    // b5: Career Architect (roadmaps > 0)
    if (!updatedBadges[4].isUnlocked && userPath.length > 0) {
      updatedBadges[4].isUnlocked = true;
      updatedBadges[4].unlockedAt = todayStr;
      badgeEarnedNotification = true;
    }
    // b6: Goal Crusher (any completed goal)
    if (!updatedBadges[5].isUnlocked && userGoals.some(g => g.isCompleted)) {
      updatedBadges[5].isUnlocked = true;
      updatedBadges[5].unlockedAt = todayStr;
      badgeEarnedNotification = true;
    }
    // b7: Job Hunter (applications >= 3)
    if (!updatedBadges[6].isUnlocked && userApps.length >= 3) {
      updatedBadges[6].isUnlocked = true;
      updatedBadges[6].unlockedAt = todayStr;
      badgeEarnedNotification = true;
    }
    // b8: Streak Master (streak >= 5)
    if (!updatedBadges[7].isUnlocked && currentUser.streakCount >= 5) {
      updatedBadges[7].isUnlocked = true;
      updatedBadges[7].unlockedAt = todayStr;
      badgeEarnedNotification = true;
    }

    if (badgeEarnedNotification) {
      setBadges(updatedBadges);
      localStorage.setItem(STORAGE_KEYS.BADGES, JSON.stringify(updatedBadges));
      triggerNotification('Achievement Unlocked!', 'Congratulations, you earned a new career tracker badge!', 'success');
    }

    if (currentUser.productivityScore !== finalProductivityScore) {
      setCurrentUser(prev => prev ? { ...prev, productivityScore: finalProductivityScore } : null);
    }
  };

  const triggerNotification = (title: string, message: string, type: AppNotification['type']) => {
    const freshNotif: AppNotification = {
      id: 'notif_' + Date.now(),
      title,
      message,
      type,
      date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isRead: false
    };
    setNotifications(prev => {
      const next = [freshNotif, ...prev];
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(next));
      return next;
    });
  };

  // Seeding default academic records for a premium, populated initial showcase
  const seedUserFirestoreDefaults = async (uid: string) => {
    try {
      const defaultSkill = { id: 'skl_seeded', userId: uid, name: 'React', currentLevel: 3, targetLevel: 5, learningHours: 12, progressPercentage: 60, category: 'Frontend' };
      const defaultGoal = { id: 'gl_seeded', userId: uid, title: 'Secure an SDE Summer Internship', description: 'Apply to at least 15 roles and solve 150 LeetCode problems.', isLongTerm: true, deadline: '2026-08-30', milestones: [{ id: 'ms1', title: 'Complete 5 Mock Interviews', isCompleted: false }], progressPercentage: 0, isCompleted: false, category: 'Placement' };
      const defaultProject = { id: 'proj_seeded', userId: uid, title: 'AI Portfolio Portal', description: 'A fully responsive portfolio using React, Tailwind and Framer Motion.', lane: 'In Progress', techStack: ['React', 'Tailwind'] };

      await setDoc(doc(db, 'users', uid, 'skills', defaultSkill.id), defaultSkill);
      await setDoc(doc(db, 'users', uid, 'goals', defaultGoal.id), defaultGoal);
      await setDoc(doc(db, 'users', uid, 'projects', defaultProject.id), defaultProject);

      setSkills([defaultSkill]);
      setGoals([defaultGoal]);
      setProjects([defaultProject]);
    } catch (e) {
      console.error("Firestore seeding failed:", e);
    }
  };

  // Load collections from Firestore under /users/{uid}/{subcollection}
  const loadUserFirestoreData = async (uid: string) => {
    try {
      const collectionsToLoad = [
        { name: 'activities', setter: setActivities },
        { name: 'goals', setter: setGoals },
        { name: 'skills', setter: setSkills },
        { name: 'certificates', setter: setCertificates },
        { name: 'roadmaps', setter: setRoadmaps },
        { name: 'journals', setter: setJournals, path: 'journal' },
        { name: 'applications', setter: setApplications },
        { name: 'courses', setter: setCourses },
        { name: 'past_semesters', setter: setPastSemesters },
        { name: 'exams', setter: setExams },
        { name: 'projects', setter: setProjects }
      ];

      for (const col of collectionsToLoad) {
        const pathName = col.path || col.name;
        const snap = await getDocs(collection(db, 'users', uid, pathName));
        if (!snap.empty) {
          const list = snap.docs.map(doc => doc.data());
          col.setter(list as any);
        } else {
          col.setter([]);
        }
      }
    } catch (e) {
      console.error("Firestore nested load failed:", e);
    }
  };

  // Real or simulated authentication handlers
  const login = async (email: string, password?: string): Promise<boolean> => {
    if (isFirebaseConfigured) {
      try {
        await signInWithEmailAndPassword(auth, email, password || '');
        triggerNotification('Welcome Back!', 'Login successful, syncing cloud session.', 'success');
        return true;
      } catch (err: any) {
        console.error("Firebase email login error:", err);
        throw err;
      }
    } else {
      // Local preset fallback
      const matched = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (matched) {
        setCurrentUser(matched);
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER_UID, matched.uid);
        triggerNotification('Welcome Back!', `Logged in offline as ${matched.name}.`, 'success');
        return true;
      }
      return false;
    }
  };

  const signup = async (name: string, email: string, profession: string, currentEducation: string, password?: string): Promise<boolean> => {
    if (isFirebaseConfigured) {
      try {
        // Create user in Firebase Auth
        const cred = await createUserWithEmailAndPassword(auth, email, password || '');
        const firebaseUser = cred.user;
        
        // Update auth profile name
        await firebaseUpdateProfile(firebaseUser, { displayName: name });

        // Set user profile details inside Firestore
        const newUser: UserProfile = {
          uid: firebaseUser.uid,
          name,
          email,
          profession,
          currentEducation,
          skills: [],
          careerInterests: [],
          streakCount: 1,
          lastActiveDate: new Date().toISOString().split('T')[0],
          productivityScore: 40,
          authProvider: 'email',
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
          careerScore: 40,
          level: 1,
          xp: 0,
          onboarded: true // Trigger onboarding bypassed
        };

        await setDoc(doc(db, 'users', firebaseUser.uid), newUser);
        setCurrentUser(newUser);
        
        // Optional seed defaults to populate data rather than blank board
        await seedUserFirestoreDefaults(firebaseUser.uid);
        triggerNotification('Account Registered', `Welcome ${name}! Setup your student workspace profile.`, 'success');
        return true;
      } catch (err: any) {
        console.error("Firebase sign up error:", err);
        throw err;
      }
    } else {
      // Preventing duplicates offline
      if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
        return false;
      }

      const newUser: UserProfile = {
        uid: 'user_' + Date.now(),
        name,
        email,
        profession,
        currentEducation,
        skills: [],
        careerInterests: [],
        streakCount: 1,
        lastActiveDate: new Date().toISOString().split('T')[0],
        productivityScore: 40,
        authProvider: 'email',
        level: 1,
        xp: 0,
        onboarded: true
      };

      const updatedUsers = [...users, newUser];
      setUsers(updatedUsers);
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(updatedUsers));
      setCurrentUser(newUser);
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER_UID, newUser.uid);
      triggerNotification('Account Registered', `Welcome ${name}! Your career tracker portfolio workspace is ready.`, 'success');
      return true;
    }
  };

  const googleSignIn = async (email?: string, name?: string): Promise<boolean> => {
    if (isFirebaseConfigured) {
      try {
        const cred = await signInWithPopup(auth, googleProvider);
        triggerNotification('Google Authenticated', `Successfully authenticated as ${cred.user.email}`, 'success');
        return true;
      } catch (err: any) {
        console.error("Firebase Google sign-in failed:", err);
        throw err;
      }
    } else {
      // Standard local preset
      const targetEmail = email || 'google.user@gmail.com';
      const targetName = name || 'Google User';
      
      const matched = users.find(u => u.email.toLowerCase() === targetEmail.toLowerCase());
      if (matched) {
        setCurrentUser(matched);
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER_UID, matched.uid);
        triggerNotification('Google Authentication', `Logged in successfully as ${matched.name}.`, 'success');
        return true;
      } else {
        const newUser: UserProfile = {
          uid: 'user_' + Date.now(),
          name: targetName,
          email: targetEmail,
          profession: 'Software Engineer Intern & CS Student',
          currentEducation: 'B.Tech in Computer Science and Engineering',
          skills: ['React', 'Firebase', 'Data Structures', 'Git'],
          careerInterests: ['Frontend Development', 'Engineering'],
          streakCount: 1,
          lastActiveDate: new Date().toISOString().split('T')[0],
          productivityScore: 50,
          authProvider: 'google.com',
          level: 1,
          xp: 0,
          onboarded: true
        };
        
        const updatedUsers = [...users, newUser];
        setUsers(updatedUsers);
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(updatedUsers));
        setCurrentUser(newUser);
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER_UID, newUser.uid);
        triggerNotification('Google Registered', `Registered with Google account: ${targetEmail}`, 'success');
        return true;
      }
    }
  };

  const githubSignIn = async (): Promise<boolean> => {
    if (isFirebaseConfigured) {
      try {
        const cred = await signInWithPopup(auth, githubProvider);
        triggerNotification('GitHub Authenticated', `Successfully connected via ${cred.user.email || 'GitHub Auth'}`, 'success');
        return true;
      } catch (err) {
        console.error("GitHub Login Error:", err);
        throw err;
      }
    } else {
      // Offline fallback: simulate GitHub sign in!
      const mockEmail = "github.student@github.com";
      const matched = users.find(u => u.email.toLowerCase() === mockEmail.toLowerCase());
      if (matched) {
        setCurrentUser(matched);
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER_UID, matched.uid);
        triggerNotification('GitHub Authentication', `Logged in successfully as ${matched.name}.`, 'success');
        return true;
      } else {
        const newUser: UserProfile = {
          uid: 'user_' + Date.now(),
          name: 'GitHub Innovator',
          email: mockEmail,
          profession: 'Systems Engineering Student',
          currentEducation: 'B.Tech in computer systems',
          skills: ['Python', 'Docker', 'Git'],
          careerInterests: ['DevOps', 'Back-end systems'],
          streakCount: 1,
          lastActiveDate: new Date().toISOString().split('T')[0],
          productivityScore: 60,
          authProvider: 'github.com',
          level: 1,
          xp: 0,
          onboarded: true
        };
        const updatedUsers = [...users, newUser];
        setUsers(updatedUsers);
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(updatedUsers));
        setCurrentUser(newUser);
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER_UID, newUser.uid);
        triggerNotification('GitHub Authentication', `Registered and logged in with GitHub: ${mockEmail}`, 'success');
        return true;
      }
    }
  };

  const logout = async () => {
    if (isFirebaseConfigured) {
      try {
        await signOut(auth);
        setCurrentUser(null);
        triggerNotification('Logged Out', 'Your cloud session has concluded.', 'info');
      } catch (err) {
        console.error("Logout Error:", err);
      }
    } else {
      setCurrentUser(null);
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER_UID);
      triggerNotification('Logged Out', 'Offline session closed.', 'info');
    }
  };

  const resetPassword = async (email: string): Promise<void> => {
    if (isFirebaseConfigured) {
      try {
        await sendPasswordResetEmail(auth, email);
        triggerNotification('Request Processed', 'Reset link dispatched to your inbox.', 'success');
      } catch (e: any) {
        console.error("Reset Email Error:", e);
        throw e;
      }
    } else {
      triggerNotification('Offline Link Dispense', `Simulated password reset for: ${email}`, 'success');
    }
  };

  const verifyEmail = async (): Promise<void> => {
    if (isFirebaseConfigured) {
      const user = auth.currentUser;
      if (user) {
        try {
          await sendEmailVerification(user);
          triggerNotification('Verification Dispatched', 'Check your mail folder for the verify message.', 'success');
        } catch (e: any) {
          console.error("Email verification send failure:", e);
          throw e;
        }
      }
    } else {
      triggerNotification('Email Verification Dispense', 'Simulated dispatch of authorization key.', 'success');
    }
  };

  const updateProfile = (profile: Partial<UserProfile>) => {
    if (!currentUser) return;
    const nextUser = { ...currentUser, ...profile };
    setCurrentUser(nextUser);
    
    // Save locally
    setUsers(prev => prev.map(u => u.uid === currentUser.uid ? nextUser : u));
    triggerNotification('Profile Updated', 'Your educational goals and portfolio parameters have updated.', 'info');
  };

  const unlockBadges = (badgeIds: string[]) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const updatedBadges = badges.map(b => {
      if (badgeIds.includes(b.id)) {
        return { ...b, isUnlocked: true, unlockedAt: b.unlockedAt || todayStr };
      }
      return b;
    });
    setBadges(updatedBadges);
    localStorage.setItem(STORAGE_KEYS.BADGES, JSON.stringify(updatedBadges));
    triggerNotification('Cabinet Upgraded', 'Your professional daily work analysis unlocked new milestones!', 'success');
  };

  // Activity CRUD
  const addActivity = (act: Omit<DailyActivity, 'id' | 'userId'>) => {
    if (!currentUser) return;
    const newAct: DailyActivity = {
      ...act,
      id: 'act_' + Date.now(),
      userId: currentUser.uid
    };
    const nextList = [newAct, ...activities];
    setActivities(nextList);
    localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(nextList));
    triggerNotification('Activity Logged', `Logged "${act.title}" on ${act.date}.`, 'success');
    runStateTelemetry(nextList);
  };

  const updateActivity = (id: string, updatedAct: Partial<DailyActivity>) => {
    const nextList = activities.map(a => (a.id === id ? { ...a, ...updatedAct } : a));
    setActivities(nextList);
    localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(nextList));
    runStateTelemetry(nextList);
  };

  const deleteActivity = (id: string) => {
    const nextList = activities.filter(a => a.id !== id);
    setActivities(nextList);
    localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(nextList));
    runStateTelemetry(nextList);
  };

  // Goal CRUD
  const addGoal = (gl: Omit<CareerGoal, 'id' | 'userId' | 'progressPercentage' | 'isCompleted' | 'milestones'> & { milestones: string[] }) => {
    if (!currentUser) return;
    const items: Milestone[] = gl.milestones.map((m, i) => ({
      id: `ms_${Date.now()}_${i}`,
      title: m,
      isCompleted: false
    }));
    
    const newGoal: CareerGoal = {
      id: 'gl_' + Date.now(),
      userId: currentUser.uid,
      title: gl.title,
      description: gl.description,
      isLongTerm: gl.isLongTerm,
      category: gl.category,
      deadline: gl.deadline,
      milestones: items,
      progressPercentage: 0,
      isCompleted: false
    };

    const nextList = [newGoal, ...goals];
    setGoals(nextList);
    localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(nextList));
    triggerNotification('Career Goal Created', `Goal "${gl.title}" has been added with ${items.length} milestones.`, 'success');
    runStateTelemetry(activities, nextList);
  };

  const updateGoal = (id: string, updatedGl: Partial<CareerGoal>) => {
    const nextList = goals.map(g => {
      if (g.id === id) {
        const merged = { ...g, ...updatedGl };
        // compute progress if milestones changed
        if (merged.milestones && merged.milestones.length > 0) {
          const completedCount = merged.milestones.filter(m => m.isCompleted).length;
          merged.progressPercentage = Math.round((completedCount / merged.milestones.length) * 100);
          merged.isCompleted = merged.progressPercentage === 100;
        } else {
          merged.progressPercentage = merged.isCompleted ? 100 : 0;
        }
        return merged;
      }
      return g;
    });

    setGoals(nextList);
    localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(nextList));
    runStateTelemetry(activities, nextList);
  };

  const toggleMilestone = (goalId: string, milestoneId: string) => {
    const nextList = goals.map(g => {
      if (g.id === goalId) {
        const updatedMilestones = g.milestones.map(m =>
          m.id === milestoneId ? { ...m, isCompleted: !m.isCompleted } : m
        );
        const completedCount = updatedMilestones.filter(m => m.isCompleted).length;
        const progressPercentage = Math.round((completedCount / updatedMilestones.length) * 100);
        const isCompleted = progressPercentage === 100;
        
        return {
          ...g,
          milestones: updatedMilestones,
          progressPercentage,
          isCompleted
        };
      }
      return g;
    });

    setGoals(nextList);
    localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(nextList));
    triggerNotification('Milestone Progressed', 'Milestone completed state updated on the database.', 'info');
    runStateTelemetry(activities, nextList);
  };

  const deleteGoal = (id: string) => {
    const nextList = goals.filter(g => g.id !== id);
    setGoals(nextList);
    localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(nextList));
    runStateTelemetry(activities, nextList);
  };

  // Skill CRUD
  const addSkill = (skl: Omit<SkillItem, 'id' | 'userId' | 'progressPercentage'>) => {
    if (!currentUser) return;
    const newSkill: SkillItem = {
      ...skl,
      id: 'skl_' + Date.now(),
      userId: currentUser.uid,
      progressPercentage: Math.round((skl.currentLevel / skl.targetLevel) * 100)
    };
    const nextList = [...skills, newSkill];
    setSkills(nextList);
    localStorage.setItem(STORAGE_KEYS.SKILLS, JSON.stringify(nextList));
    triggerNotification('Skill Tracked', `Started tracking "${skl.name}" growth.`, 'success');
    runStateTelemetry(activities, goals, nextList);
  };

  const updateSkill = (id: string, updatedSkl: Partial<SkillItem>) => {
    const nextList = skills.map(s => {
      if (s.id === id) {
        const merged = { ...s, ...updatedSkl };
        merged.progressPercentage = Math.round((merged.currentLevel / merged.targetLevel) * 100);
        return merged;
      }
      return s;
    });
    setSkills(nextList);
    localStorage.setItem(STORAGE_KEYS.SKILLS, JSON.stringify(nextList));
    runStateTelemetry(activities, goals, nextList);
  };

  const addLearningHours = (skillId: string, hours: number) => {
    const nextList = skills.map(s => {
      if (s.id === skillId) {
        return {
          ...s,
          learningHours: s.learningHours + hours
        };
      }
      return s;
    });
    setSkills(nextList);
    localStorage.setItem(STORAGE_KEYS.SKILLS, JSON.stringify(nextList));
    triggerNotification('Studied Extra', `Added +${hours} learning hours to your progress track.`, 'success');
    runStateTelemetry(activities, goals, nextList);
  };

  const deleteSkill = (id: string) => {
    const nextList = skills.filter(s => s.id !== id);
    setSkills(nextList);
    localStorage.setItem(STORAGE_KEYS.SKILLS, JSON.stringify(nextList));
    runStateTelemetry(activities, goals, nextList);
  };

  // Certificate CRUD
  const addCertificate = (cert: Omit<CertificateDoc, 'id' | 'userId'>) => {
    if (!currentUser) return;
    const newCert: CertificateDoc = {
      ...cert,
      id: 'cert_' + Date.now(),
      userId: currentUser.uid
    };
    const nextList = [newCert, ...certificates];
    setCertificates(nextList);
    localStorage.setItem(STORAGE_KEYS.CERTIFICATES, JSON.stringify(nextList));
    triggerNotification('Certificate Registered', `Added "${cert.title}" issuer: ${cert.issuer}.`, 'success');
    runStateTelemetry();
  };

  const deleteCertificate = (id: string) => {
    const nextList = certificates.filter(c => c.id !== id);
    setCertificates(nextList);
    localStorage.setItem(STORAGE_KEYS.CERTIFICATES, JSON.stringify(nextList));
    runStateTelemetry();
  };

  // Roadmap CRUD
  const addRoadmap = (rm: Omit<CareerRoadmap, 'id' | 'userId' | 'completionPercentage'> & { steps: string[] }) => {
    if (!currentUser) return;
    const roadmapNodes: RoadmapNode[] = rm.steps.map((stepName, i) => ({
      id: `rn_${Date.now()}_${i}`,
      title: stepName,
      description: `Target objective for completing milestone ${i + 1}`,
      isCompleted: false,
      order: i + 1
    }));

    const newRM: CareerRoadmap = {
      id: 'rm_' + Date.now(),
      userId: currentUser.uid,
      pathName: rm.pathName,
      description: rm.description,
      nodes: roadmapNodes,
      completionPercentage: 0
    };

    const nextList = [...roadmaps, newRM];
    setRoadmaps(nextList);
    localStorage.setItem(STORAGE_KEYS.ROADMAPS, JSON.stringify(nextList));
    triggerNotification('Roadmap Structured', `New career path "${rm.pathName}" is now active.`, 'success');
    runStateTelemetry(activities, goals, skills, journals, applications, nextList);
  };

  const toggleRoadmapStep = (roadmapId: string, nodeID: string) => {
    const nextList = roadmaps.map(rm => {
      if (rm.id === roadmapId) {
        const updatedNodes = rm.nodes.map(n =>
          n.id === nodeID ? { ...n, isCompleted: !n.isCompleted } : n
        );
        const completedCount = updatedNodes.filter(n => n.isCompleted).length;
        const completionPercentage = Math.round((completedCount / updatedNodes.length) * 100);
        return {
          ...rm,
          nodes: updatedNodes,
          completionPercentage
        };
      }
      return rm;
    });

    setRoadmaps(nextList);
    localStorage.setItem(STORAGE_KEYS.ROADMAPS, JSON.stringify(nextList));
    runStateTelemetry(activities, goals, skills, journals, applications, nextList);
  };

  const deleteRoadmap = (id: string) => {
    const nextList = roadmaps.filter(r => r.id !== id);
    setRoadmaps(nextList);
    localStorage.setItem(STORAGE_KEYS.ROADMAPS, JSON.stringify(nextList));
    runStateTelemetry(activities, goals, skills, journals, applications, nextList);
  };

  // Journal CRUD
  const addJournal = (jrn: Omit<ProfessionalJournal, 'id' | 'userId'>) => {
    if (!currentUser) return;
    const newJrn: ProfessionalJournal = {
      ...jrn,
      id: 'jrn_' + Date.now(),
      userId: currentUser.uid
    };
    const nextList = [newJrn, ...journals];
    setJournals(nextList);
    localStorage.setItem(STORAGE_KEYS.JOURNALS, JSON.stringify(nextList));
    triggerNotification('Reflection Logged', 'Daily journal summary logged in historical database.', 'success');
    runStateTelemetry(activities, goals, skills, nextList);
  };

  const updateJournal = (id: string, updatedJrn: Partial<ProfessionalJournal>) => {
    const nextList = journals.map(j => (j.id === id ? { ...j, ...updatedJrn } : j));
    setJournals(nextList);
    localStorage.setItem(STORAGE_KEYS.JOURNALS, JSON.stringify(nextList));
    runStateTelemetry(activities, goals, skills, nextList);
  };

  const deleteJournal = (id: string) => {
    const nextList = journals.filter(j => j.id !== id);
    setJournals(nextList);
    localStorage.setItem(STORAGE_KEYS.JOURNALS, JSON.stringify(nextList));
    runStateTelemetry(activities, goals, skills, nextList);
  };

  // Application CRUD
  const addApplication = (app: Omit<ApplicationTracker, 'id' | 'userId'>) => {
    if (!currentUser) return;
    const newApp: ApplicationTracker = {
      ...app,
      id: 'app_' + Date.now(),
      userId: currentUser.uid
    };
    const nextList = [newApp, ...applications];
    setApplications(nextList);
    localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(nextList));
    triggerNotification('Application Tracked', `Added application for ${app.role} at ${app.companyName}.`, 'success');
    runStateTelemetry(activities, goals, skills, journals, nextList);
  };

  const updateApplication = (id: string, updatedApp: Partial<ApplicationTracker>) => {
    const nextList = applications.map(a => (a.id === id ? { ...a, ...updatedApp } : a));
    setApplications(nextList);
    localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(nextList));
    runStateTelemetry(activities, goals, skills, journals, nextList);
  };

  const deleteApplication = (id: string) => {
    const nextList = applications.filter(a => a.id !== id);
    setApplications(nextList);
    localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(nextList));
    runStateTelemetry(activities, goals, skills, journals, nextList);
  };

  // Academic & Semester CRUD
  const addCourse = (crs: Omit<CourseItem, 'id' | 'userId'>) => {
    if (!currentUser) return;
    const newCourse: CourseItem = {
      ...crs,
      id: 'crs_' + Date.now(),
      userId: currentUser.uid
    };
    const nextList = [newCourse, ...courses];
    setCourses(nextList);
    localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(nextList));
    triggerNotification('Course Added', `Successfully added the course "${crs.name}".`, 'success');
  };

  const updateCourse = (id: string, updatedCrs: Partial<CourseItem>) => {
    const nextList = courses.map(c => (c.id === id ? { ...c, ...updatedCrs } : c));
    setCourses(nextList);
    localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(nextList));
  };

  const deleteCourse = (id: string) => {
    const nextList = courses.filter(c => c.id !== id);
    setCourses(nextList);
    localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(nextList));
  };

  const logAttendance = (id: string, type: 'Present' | 'Absent') => {
    const nextList = courses.map(c => {
      if (c.id === id) {
        return {
          ...c,
          attendancePre: c.attendancePre + (type === 'Present' ? 1 : 0),
          attendanceAbs: c.attendanceAbs + (type === 'Absent' ? 1 : 0)
        };
      }
      return c;
    });
    setCourses(nextList);
    localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(nextList));
  };

  const addPastSemester = (sem: Omit<PastSemester, 'id' | 'userId'>) => {
    if (!currentUser) return;
    const newSem: PastSemester = {
      ...sem,
      id: 'sem_' + Date.now(),
      userId: currentUser.uid
    };
    const nextList = [newSem, ...pastSemesters];
    setPastSemesters(nextList);
    localStorage.setItem(STORAGE_KEYS.PAST_SEMESTERS, JSON.stringify(nextList));
  };

  const deletePastSemester = (id: string) => {
    const nextList = pastSemesters.filter(s => s.id !== id);
    setPastSemesters(nextList);
    localStorage.setItem(STORAGE_KEYS.PAST_SEMESTERS, JSON.stringify(nextList));
  };

  const addExam = (ex: Omit<ExamMetric, 'id' | 'userId'>) => {
    if (!currentUser) return;
    const newExam: ExamMetric = {
      ...ex,
      id: 'exam_' + Date.now(),
      userId: currentUser.uid
    };
    const nextList = [newExam, ...exams];
    setExams(nextList);
    localStorage.setItem(STORAGE_KEYS.EXAMS, JSON.stringify(nextList));
    triggerNotification('Exam Scheduled', `Upcoming exam for ${ex.courseCode} added.`, 'deadline');
  };

  const updateExam = (id: string, updatedEx: Partial<ExamMetric>) => {
    const nextList = exams.map(e => (e.id === id ? { ...e, ...updatedEx } : e));
    setExams(nextList);
    localStorage.setItem(STORAGE_KEYS.EXAMS, JSON.stringify(nextList));
  };

  const deleteExam = (id: string) => {
    const nextList = exams.filter(e => e.id !== id);
    setExams(nextList);
    localStorage.setItem(STORAGE_KEYS.EXAMS, JSON.stringify(nextList));
  };

  const toggleExamChecklist = (examId: string, itemId: string) => {
    const nextList = exams.map(e => {
      if (e.id === examId) {
        const updatedChecklist = e.checklist.map(item =>
          item.id === itemId ? { ...item, isCompleted: !item.isCompleted } : item
        );
        const resolvedCount = updatedChecklist.filter(c => c.isCompleted).length;
        const total = updatedChecklist.length || 1;
        const topicsCoveredPercentage = Math.round((resolvedCount / total) * 100);

        return {
          ...e,
          checklist: updatedChecklist,
          topicsCoveredPercentage
        };
      }
      return e;
    });
    setExams(nextList);
    localStorage.setItem(STORAGE_KEYS.EXAMS, JSON.stringify(nextList));
  };

  const addProject = (proj: Omit<ProjectCard, 'id' | 'userId'>) => {
    if (!currentUser) return;
    const newProj: ProjectCard = {
      ...proj,
      id: 'proj_' + Date.now(),
      userId: currentUser.uid
    };
    const nextList = [newProj, ...projects];
    setProjects(nextList);
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(nextList));
    triggerNotification('Project Added', `Successfully compiled project "${proj.title}" on board.`, 'success');
  };

  const updateProject = (id: string, updatedProj: Partial<ProjectCard>) => {
    const nextList = projects.map(p => (p.id === id ? { ...p, ...updatedProj } : p));
    setProjects(nextList);
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(nextList));
  };

  const deleteProject = (id: string) => {
    const nextList = projects.filter(p => p.id !== id);
    setProjects(nextList);
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(nextList));
  };

  const moveProject = (id: string, lane: ProjectCard['lane']) => {
    const nextList = projects.map(p => (p.id === id ? { ...p, lane } : p));
    setProjects(nextList);
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(nextList));
    triggerNotification('Project Shifted', `Project shifted to "${lane}" lane.`, 'info');
  };

  const markNotificationRead = (id: string) => {
    const nextList = notifications.map(n => (n.id === id ? { ...n, isRead: true } : n));
    setNotifications(nextList);
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(nextList));
  };

  const clearNotifications = () => {
    setNotifications([]);
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify([]));
  };

  return (
    <CareerContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        users,
        activities,
        goals,
        skills,
        certificates,
        roadmaps,
        journals,
        applications,
        badges,
        notifications,
        courses,
        pastSemesters,
        exams,
        projects,
        
        // Functions
        login,
        signup,
        googleSignIn,
        githubSignIn,
        logout,
        updateProfile,
        unlockBadges,
        resetPassword,
        verifyEmail,
        theme,
        toggleTheme,
        
        addActivity,
        updateActivity,
        deleteActivity,
        
        addGoal,
        updateGoal,
        toggleMilestone,
        deleteGoal,
        
        addSkill,
        updateSkill,
        addLearningHours,
        deleteSkill,
        
        addCertificate,
        deleteCertificate,
        
        addRoadmap,
        toggleRoadmapStep,
        deleteRoadmap,
        
        addJournal,
        updateJournal,
        deleteJournal,
        
        addApplication,
        updateApplication,
        deleteApplication,

        addCourse,
        updateCourse,
        deleteCourse,
        logAttendance,
        addPastSemester,
        deletePastSemester,
        addExam,
        updateExam,
        deleteExam,
        toggleExamChecklist,
        addProject,
        updateProject,
        deleteProject,
        moveProject,
        
        markNotificationRead,
        clearNotifications,
        triggerNotification
      }}
    >
      {children}
    </CareerContext.Provider>
  );
};

export const useCareer = () => {
  const context = useContext(CareerContext);
  if (!context) {
    throw new Error('useCareer must be used within a CareerProvider');
  }
  return context;
};
