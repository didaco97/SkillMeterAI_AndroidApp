export type CourseMode = 'oneshot' | 'playlist';

export type PlanName = 'free' | 'pro';

export type RequestStatus = 'idle' | 'loading' | 'success' | 'empty' | 'error' | 'payment_required';

export type LessonStatus = 'locked' | 'available' | 'in_progress' | 'completed';

export type TimestampMarker = {
  id: string;
  label: string;
  seconds: number;
};

export type NotesTerm = {
  term: string;
  definition: string;
};

export type SectionNotes = {
  summary: string;
  keyPoints: string[];
  terms: NotesTerm[];
};

export type QuizOption = {
  id: string;
  text: string;
};

export type QuizQuestion = {
  id: string;
  prompt: string;
  options: QuizOption[];
  correctOptionId: string;
  explanation: string;
};

export type CourseSection = {
  id: string;
  courseId: string;
  videoId: string;
  title: string;
  startSeconds: number;
  endSeconds: number;
  durationMinutes: number;
  dayNumber: number;
  orderIndex: number;
  status: LessonStatus;
  notes: SectionNotes;
  quiz: QuizQuestion[];
  timestamps: TimestampMarker[];
};

export type CourseModule = {
  id: string;
  courseId: string;
  title: string;
  orderIndex: number;
  learningObjectives: string[];
  sectionIds: string[];
};

export type DailySession = {
  day: number;
  title: string;
  minutes: number;
  sectionIds: string[];
};

export type Course = {
  id: string;
  title: string;
  mode: CourseMode;
  sourceUrl: string;
  sourceLabel: string;
  thumbnail?: string;
  color: string;
  dailyMinutes: number;
  currentSectionId: string;
  nextAction: string;
  createdAt: string;
  updatedAt: string;
  sections: CourseSection[];
  modules: CourseModule[];
  dailyPlan: DailySession[];
};

export type CourseProgress = {
  courseId: string;
  completedSectionIds: string[];
  quizScores: Record<string, number>;
  lastOpenedSectionId?: string;
  updatedAt: string;
};

export type UserProfile = {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  plan: PlanName;
  streakCount: number;
  longestStreak: number;
  lastActiveDate?: string;
  notificationTime: string;
  notificationsEnabled: boolean;
};

export type UsageLimits = {
  oneshotUsed: number;
  oneshotLimit: number;
  playlistUsed: number;
  playlistLimit: number;
  quizUsed: number;
  quizLimit: number;
};

export type UserStats = {
  totalCourses: number;
  completedCourses: number;
  completedSections: number;
  totalLearningMinutes: number;
  currentStreak: number;
  longestStreak: number;
  weeklyActivity: boolean[];
};

export type PlaylistVideoPreview = {
  id: string;
  title: string;
  durationMinutes: number;
  thumbnail?: string;
  selected: boolean;
};

export type PlaylistPreview = {
  playlistId: string;
  title: string;
  sourceUrl: string;
  videos: PlaylistVideoPreview[];
};

export type CourseGenerationInput = {
  mode: CourseMode;
  sourceUrl: string;
  dailyMinutes: number;
  selectedVideoIds?: string[];
};

export type GenerationStep = {
  id: string;
  label: string;
  done: boolean;
};

export type AppError = {
  code: 'validation' | 'network' | 'auth' | 'payment_required' | 'not_found' | 'unknown';
  message: string;
};
