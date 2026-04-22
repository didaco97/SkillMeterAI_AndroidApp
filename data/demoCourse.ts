import { theme } from '@/constants/skillmeterTheme';
import type {
  Course,
  CourseProgress,
  GenerationStep,
  PlaylistPreview,
  UsageLimits,
  UserProfile,
  UserStats,
} from '@/types/skillmeter';

const now = new Date().toISOString();

export const generationSteps: GenerationStep[] = [
  { id: 'metadata', label: 'Fetch YouTube metadata', done: false },
  { id: 'transcript', label: 'Read transcript', done: false },
  { id: 'sections', label: 'Generate sections', done: false },
  { id: 'plan', label: 'Build daily plan', done: false },
  { id: 'notes', label: 'Generate notes + quiz', done: false },
  { id: 'save', label: 'Save course', done: false },
];

export const demoCourses: Course[] = [
  {
    id: 'python-fluency',
    title: 'Python from zero to fluency',
    mode: 'oneshot',
    sourceUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    sourceLabel: '3h 08m tutorial',
    color: theme.color.yellow,
    dailyMinutes: 30,
    currentSectionId: 'python-functions',
    nextAction: 'Continue section 2',
    createdAt: now,
    updatedAt: now,
    sections: [
      {
        id: 'python-setup',
        courseId: 'python-fluency',
        videoId: 'dQw4w9WgXcQ',
        title: 'Python setup + mental model',
        startSeconds: 0,
        endSeconds: 745,
        durationMinutes: 13,
        dayNumber: 1,
        orderIndex: 1,
        status: 'completed',
        timestamps: [
          { id: 'py-ts-1', label: '00:00 Setup', seconds: 0 },
          { id: 'py-ts-2', label: '04:20 Editor', seconds: 260 },
          { id: 'py-ts-3', label: '09:10 First run', seconds: 550 },
        ],
        notes: {
          summary: 'Set up Python, understand the interpreter, and run small scripts with confidence.',
          keyPoints: [
            'The interpreter runs code line by line and reports syntax mistakes early.',
            'A small script should be easy to rerun while you experiment.',
            'Editor shortcuts matter because repeated practice compounds quickly.',
          ],
          terms: [
            { term: 'Interpreter', definition: 'The program that reads and executes Python code.' },
            { term: 'Script', definition: 'A file containing reusable Python instructions.' },
          ],
        },
        quiz: [
          {
            id: 'py-q-setup',
            prompt: 'What does the Python interpreter do?',
            correctOptionId: 'a',
            explanation: 'The interpreter reads Python code and executes it.',
            options: [
              { id: 'a', text: 'Reads and executes Python code' },
              { id: 'b', text: 'Stores only YouTube metadata' },
              { id: 'c', text: 'Designs app screens automatically' },
              { id: 'd', text: 'Compresses video files' },
            ],
          },
        ],
      },
      {
        id: 'python-control-flow',
        courseId: 'python-fluency',
        videoId: 'dQw4w9WgXcQ',
        title: 'Variables, types, and control flow',
        startSeconds: 746,
        endSeconds: 1500,
        durationMinutes: 28,
        dayNumber: 2,
        orderIndex: 2,
        status: 'completed',
        timestamps: [
          { id: 'py-ts-4', label: '12:26 Variables', seconds: 746 },
          { id: 'py-ts-5', label: '18:40 Conditions', seconds: 1120 },
          { id: 'py-ts-6', label: '23:12 Loops', seconds: 1392 },
        ],
        notes: {
          summary: 'Variables hold values, conditions branch decisions, and loops repeat useful work.',
          keyPoints: [
            'Good variable names explain intent before comments are needed.',
            'Conditions should describe one decision at a time.',
            'Loops are safest when you know what changes each pass.',
          ],
          terms: [
            { term: 'Variable', definition: 'A named reference to a value.' },
            { term: 'Loop', definition: 'A repeated block of instructions.' },
          ],
        },
        quiz: [
          {
            id: 'py-q-flow',
            prompt: 'Why are clear variable names useful?',
            correctOptionId: 'b',
            explanation: 'They make the intent of code easier to understand.',
            options: [
              { id: 'a', text: 'They make code run twice as fast' },
              { id: 'b', text: 'They make intent easier to understand' },
              { id: 'c', text: 'They remove the need for functions' },
              { id: 'd', text: 'They create a database table' },
            ],
          },
        ],
      },
      {
        id: 'python-functions',
        courseId: 'python-fluency',
        videoId: 'dQw4w9WgXcQ',
        title: 'Functions that do real work',
        startSeconds: 1501,
        endSeconds: 2358,
        durationMinutes: 14,
        dayNumber: 3,
        orderIndex: 3,
        status: 'in_progress',
        timestamps: [
          { id: 'py-ts-7', label: '25:01 Function shape', seconds: 1501 },
          { id: 'py-ts-8', label: '31:14 Parameters', seconds: 1874 },
          { id: 'py-ts-9', label: '37:40 Return values', seconds: 2260 },
        ],
        notes: {
          summary: 'A function packages repeated steps behind one clear name so you can test and reuse them.',
          keyPoints: [
            'Inputs become parameters and outputs become return values.',
            'A good function has one clear job.',
            'Small functions make debugging and reuse easier.',
          ],
          terms: [
            { term: 'Parameter', definition: 'A named input accepted by a function.' },
            { term: 'Return value', definition: 'The output a function gives back after it runs.' },
          ],
        },
        quiz: [
          {
            id: 'py-q-function',
            prompt: 'What is the best definition of a function?',
            correctOptionId: 'a',
            explanation: 'A function is a named block of reusable logic.',
            options: [
              { id: 'a', text: 'A named block of reusable logic' },
              { id: 'b', text: 'A file that stores YouTube metadata' },
              { id: 'c', text: 'A database row with quiz results' },
              { id: 'd', text: 'A playlist section without timestamps' },
            ],
          },
          {
            id: 'py-q-return',
            prompt: 'What does a return value represent?',
            correctOptionId: 'c',
            explanation: 'Return values let functions send results back to the caller.',
            options: [
              { id: 'a', text: 'The video duration in minutes' },
              { id: 'b', text: 'The app navigation tab' },
              { id: 'c', text: 'The result sent back by a function' },
              { id: 'd', text: 'The user subscription plan' },
            ],
          },
        ],
      },
      {
        id: 'python-files',
        courseId: 'python-fluency',
        videoId: 'dQw4w9WgXcQ',
        title: 'Files, errors, and APIs',
        startSeconds: 2359,
        endSeconds: 3600,
        durationMinutes: 31,
        dayNumber: 4,
        orderIndex: 4,
        status: 'available',
        timestamps: [
          { id: 'py-ts-10', label: '39:19 Files', seconds: 2359 },
          { id: 'py-ts-11', label: '47:02 Errors', seconds: 2822 },
          { id: 'py-ts-12', label: '56:14 APIs', seconds: 3374 },
        ],
        notes: {
          summary: 'Files and APIs let programs communicate with data outside the script.',
          keyPoints: [
            'File operations need clear read/write intent.',
            'Errors should be handled where useful recovery is possible.',
            'APIs exchange structured data between systems.',
          ],
          terms: [
            { term: 'API', definition: 'A contract for requesting and exchanging data.' },
            { term: 'Exception', definition: 'A runtime problem that code can catch and handle.' },
          ],
        },
        quiz: [
          {
            id: 'py-q-api',
            prompt: 'What is an API mainly used for?',
            correctOptionId: 'd',
            explanation: 'APIs let software systems request and exchange data.',
            options: [
              { id: 'a', text: 'Changing tab colors only' },
              { id: 'b', text: 'Preventing all errors' },
              { id: 'c', text: 'Replacing functions' },
              { id: 'd', text: 'Requesting and exchanging data' },
            ],
          },
        ],
      },
    ],
    modules: [
      {
        id: 'python-module-1',
        courseId: 'python-fluency',
        title: 'Module 1: Core programming instincts',
        orderIndex: 1,
        learningObjectives: ['Read code confidently', 'Predict what simple scripts will do'],
        sectionIds: ['python-setup', 'python-control-flow'],
      },
      {
        id: 'python-module-2',
        courseId: 'python-fluency',
        title: 'Module 2: Practical problem solving',
        orderIndex: 2,
        learningObjectives: ['Use functions and collections', 'Debug repeated logic'],
        sectionIds: ['python-functions', 'python-files'],
      },
    ],
    dailyPlan: [
      { day: 1, title: 'Python setup + mental model', minutes: 32, sectionIds: ['python-setup'] },
      { day: 2, title: 'Variables, types, and control flow', minutes: 28, sectionIds: ['python-control-flow'] },
      { day: 3, title: 'Functions that do real work', minutes: 35, sectionIds: ['python-functions'] },
      { day: 4, title: 'Files, errors, and APIs', minutes: 31, sectionIds: ['python-files'] },
    ],
  },
  {
    id: 'ml-crash-course',
    title: 'Machine learning crash course',
    mode: 'playlist',
    sourceUrl: 'https://www.youtube.com/playlist?list=PLSKILLMETERML',
    sourceLabel: '20 videos, 4 modules',
    color: theme.color.cyan,
    dailyMinutes: 45,
    currentSectionId: 'ml-training-data',
    nextAction: 'Resume lesson 3',
    createdAt: now,
    updatedAt: now,
    sections: [
      {
        id: 'ml-intuition',
        courseId: 'ml-crash-course',
        videoId: '9bZkp7q19f0',
        title: 'Model intuition',
        startSeconds: 0,
        endSeconds: 900,
        durationMinutes: 15,
        dayNumber: 1,
        orderIndex: 1,
        status: 'completed',
        timestamps: [{ id: 'ml-ts-1', label: '00:00 Why models learn', seconds: 0 }],
        notes: {
          summary: 'Models learn patterns from examples and use those patterns for predictions.',
          keyPoints: ['Training data shapes model behavior', 'Predictions are only as useful as evaluation'],
          terms: [{ term: 'Model', definition: 'A learned mapping from inputs to outputs.' }],
        },
        quiz: [
          {
            id: 'ml-q-1',
            prompt: 'What does training data provide?',
            correctOptionId: 'a',
            explanation: 'Training data provides examples the model can learn from.',
            options: [
              { id: 'a', text: 'Examples for the model to learn from' },
              { id: 'b', text: 'Only app colors' },
              { id: 'c', text: 'A push notification token' },
              { id: 'd', text: 'A subscription receipt' },
            ],
          },
        ],
      },
      {
        id: 'ml-training-data',
        courseId: 'ml-crash-course',
        videoId: '9bZkp7q19f0',
        title: 'Training data and model intuition',
        startSeconds: 250,
        endSeconds: 1355,
        durationMinutes: 18,
        dayNumber: 2,
        orderIndex: 2,
        status: 'in_progress',
        timestamps: [
          { id: 'ml-ts-2', label: '04:10 Dataset', seconds: 250 },
          { id: 'ml-ts-3', label: '12:30 Labels', seconds: 750 },
        ],
        notes: {
          summary: 'The quality and shape of data decide what a model can learn.',
          keyPoints: ['Labels define the target', 'Bias in data becomes bias in predictions'],
          terms: [{ term: 'Label', definition: 'The expected answer attached to a training example.' }],
        },
        quiz: [
          {
            id: 'ml-q-2',
            prompt: 'Why do labels matter?',
            correctOptionId: 'b',
            explanation: 'Labels tell the model what answer it should learn to predict.',
            options: [
              { id: 'a', text: 'They change the phone wallpaper' },
              { id: 'b', text: 'They define the target answer' },
              { id: 'c', text: 'They hide invalid URLs' },
              { id: 'd', text: 'They replace notes' },
            ],
          },
        ],
      },
    ],
    modules: [
      {
        id: 'ml-module-1',
        courseId: 'ml-crash-course',
        title: 'Module 1: Learning from examples',
        orderIndex: 1,
        learningObjectives: ['Understand training data', 'Explain model predictions'],
        sectionIds: ['ml-intuition', 'ml-training-data'],
      },
    ],
    dailyPlan: [
      { day: 1, title: 'Model intuition', minutes: 15, sectionIds: ['ml-intuition'] },
      { day: 2, title: 'Training data and labels', minutes: 18, sectionIds: ['ml-training-data'] },
    ],
  },
  {
    id: 'ux-research',
    title: 'UX research foundations',
    mode: 'playlist',
    sourceUrl: 'https://www.youtube.com/playlist?list=PLSKILLMETERUX',
    sourceLabel: '12 videos, 3 modules',
    color: theme.color.pink,
    dailyMinutes: 30,
    currentSectionId: 'ux-synthesis',
    nextAction: 'Review quiz answers',
    createdAt: now,
    updatedAt: now,
    sections: [
      {
        id: 'ux-synthesis',
        courseId: 'ux-research',
        videoId: '3JZ_D3ELwOQ',
        title: 'Interview synthesis and patterns',
        startSeconds: 1082,
        endSeconds: 2350,
        durationMinutes: 21,
        dayNumber: 5,
        orderIndex: 1,
        status: 'in_progress',
        timestamps: [
          { id: 'ux-ts-1', label: '18:02 Synthesis', seconds: 1082 },
          { id: 'ux-ts-2', label: '25:18 Patterns', seconds: 1518 },
        ],
        notes: {
          summary: 'Research synthesis turns raw interview notes into patterns teams can act on.',
          keyPoints: ['Cluster observations by behavior', 'Name patterns in user language'],
          terms: [{ term: 'Synthesis', definition: 'The process of finding patterns across research evidence.' }],
        },
        quiz: [
          {
            id: 'ux-q-1',
            prompt: 'What is the goal of research synthesis?',
            correctOptionId: 'a',
            explanation: 'Synthesis turns observations into useful patterns.',
            options: [
              { id: 'a', text: 'Find useful patterns in observations' },
              { id: 'b', text: 'Skip user evidence' },
              { id: 'c', text: 'Only draw app icons' },
              { id: 'd', text: 'Generate a Supabase key' },
            ],
          },
        ],
      },
    ],
    modules: [
      {
        id: 'ux-module-1',
        courseId: 'ux-research',
        title: 'Module 3: Making research actionable',
        orderIndex: 1,
        learningObjectives: ['Synthesize interviews', 'Turn evidence into decisions'],
        sectionIds: ['ux-synthesis'],
      },
    ],
    dailyPlan: [{ day: 5, title: 'Interview synthesis and patterns', minutes: 21, sectionIds: ['ux-synthesis'] }],
  },
];

export const demoProgress: CourseProgress[] = demoCourses.map((course) => ({
  courseId: course.id,
  completedSectionIds: course.sections.filter((section) => section.status === 'completed').map((section) => section.id),
  lastOpenedSectionId: course.currentSectionId,
  quizScores: course.sections.reduce<Record<string, number>>((scores, section) => {
    scores[section.id] = section.status === 'completed' ? 100 : 0;
    return scores;
  }, {}),
  updatedAt: now,
}));

export const demoProfile: UserProfile = {
  id: 'demo-user',
  name: 'Skillmeter learner',
  email: 'learner@skillmeter.app',
  plan: 'free',
  streakCount: 7,
  longestStreak: 12,
  lastActiveDate: now,
  notificationTime: '20:30',
  notificationsEnabled: true,
};

export const demoUsage: UsageLimits = {
  oneshotUsed: 1,
  oneshotLimit: 2,
  playlistUsed: 0,
  playlistLimit: 1,
  quizUsed: 9,
  quizLimit: 18,
};

export const demoStats: UserStats = {
  totalCourses: 3,
  completedCourses: 0,
  completedSections: 3,
  totalLearningMinutes: 126,
  currentStreak: 7,
  longestStreak: 12,
  weeklyActivity: [true, true, false, true, true, true, true],
};

export const demoPlaylistPreview: PlaylistPreview = {
  playlistId: 'PLSKILLMETERML',
  title: 'Machine learning crash course',
  sourceUrl: 'https://www.youtube.com/playlist?list=PLSKILLMETERML',
  videos: [
    { id: '9bZkp7q19f0', title: 'Model intuition', durationMinutes: 15, selected: true },
    { id: '3JZ_D3ELwOQ', title: 'Training data and labels', durationMinutes: 18, selected: true },
    { id: 'dQw4w9WgXcQ', title: 'Evaluation basics', durationMinutes: 22, selected: true },
  ],
};

export function getCourseProgress(course: Course, progress: CourseProgress) {
  if (course.sections.length === 0) {
    return 0;
  }

  return progress.completedSectionIds.length / course.sections.length;
}

export function getCourseDayLabel(course: Course) {
  const currentSection = course.sections.find((section) => section.id === course.currentSectionId) ?? course.sections[0];
  if (!currentSection) {
    return 'No sections';
  }

  return course.mode === 'playlist' ? `Module ${course.modules[0]?.orderIndex ?? 1} active` : `Day ${currentSection.dayNumber} of ${course.dailyPlan.length}`;
}

export function getCurrentSection(course: Course) {
  return course.sections.find((section) => section.id === course.currentSectionId) ?? course.sections[0];
}

export function cloneDemoCourses() {
  return JSON.parse(JSON.stringify(demoCourses)) as Course[];
}

export function cloneDemoProgress() {
  return JSON.parse(JSON.stringify(demoProgress)) as CourseProgress[];
}

export const learningSteps = generationSteps.slice(0, 4).map((step, index) => ({ ...step, done: index < 3 }));
export const dailyPlan = demoCourses[0].dailyPlan.map((session) => ({
  day: session.day,
  title: session.title,
  minutes: session.minutes,
  progress: session.day < 3 ? 1 : session.day === 3 ? 0.62 : 0,
}));
export const courses = demoCourses.map((course) => {
  const progress = demoProgress.find((item) => item.courseId === course.id) ?? demoProgress[0];
  const currentSection = getCurrentSection(course);
  return {
    id: course.id,
    title: course.title,
    mode: course.mode === 'oneshot' ? 'One Shot' : 'Playlist',
    source: course.sourceLabel,
    progress: getCourseProgress(course, progress),
    color: course.color,
    days: getCourseDayLabel(course),
    currentLesson: currentSection?.title ?? 'No lesson selected',
    lessonMeta: currentSection ? `Day ${currentSection.dayNumber}, section ${currentSection.orderIndex}, ${currentSection.durationMinutes} minutes` : 'No lesson metadata',
    timestamp: currentSection ? `${Math.floor(currentSection.startSeconds / 60)}:${String(currentSection.startSeconds % 60).padStart(2, '0')} - ${Math.floor(currentSection.endSeconds / 60)}:${String(currentSection.endSeconds % 60).padStart(2, '0')}` : '00:00',
    videoProgress: 0.46,
    nextAction: course.nextAction,
  };
});
export const modules = demoCourses[0].modules.map((module) => ({
  title: module.title,
  objective: module.learningObjectives.join(' - '),
  lessons: module.sectionIds
    .map((sectionId) => demoCourses[0].sections.find((section) => section.id === sectionId)?.title)
    .filter(Boolean) as string[],
}));
export const quizOptions = demoCourses[0].sections[2].quiz[0].options.map((option) => option.text);
