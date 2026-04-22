import type { Session } from '@supabase/supabase-js';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { create } from 'zustand';

const { createJSONStorage, persist } = require('zustand/middleware') as typeof import('zustand/middleware');

import {
  createCourse,
  fetchPlaylistPreview,
  getCourses,
  getProfile,
  getProgress,
  getUsageLimits,
  getUserStats,
  saveProgress,
  SkillmeterApiError,
} from '@/lib/api';
import { scheduleDailyReminder } from '@/lib/notifications';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import type {
  AppError,
  Course,
  CourseGenerationInput,
  CourseProgress,
  GenerationStep,
  PlaylistPreview,
  RequestStatus,
  UsageLimits,
  UserProfile,
  UserStats,
} from '@/types/skillmeter';
import { demoProfile, demoStats, demoUsage, generationSteps } from '@/data/demoCourse';

type SkillmeterState = {
  authBootstrapped: boolean;
  hasSeenOnboarding: boolean;
  isAuthenticated: boolean;
  profile: UserProfile | null;
  usage: UsageLimits | null;
  stats: UserStats | null;
  courses: Course[];
  progress: CourseProgress[];
  activeCourseId: string | null;
  authStatus: RequestStatus;
  courseStatus: RequestStatus;
  generationStatus: RequestStatus;
  playlistStatus: RequestStatus;
  generationSteps: GenerationStep[];
  playlistPreview: PlaylistPreview | null;
  error: AppError | null;
  bootstrapApp: () => Promise<void>;
  syncAuthSession: (session: Session | null) => Promise<void>;
  completeOnboarding: () => void;
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (name: string, email: string, password: string) => Promise<boolean>;
  signInWithGoogle: () => Promise<boolean>;
  signOut: () => Promise<void>;
  loadDashboard: () => Promise<void>;
  setActiveCourse: (courseId: string) => void;
  openCourseSection: (courseId: string, sectionId: string) => Promise<void>;
  createGeneratedCourse: (input: CourseGenerationInput) => Promise<Course>;
  loadPlaylistPreview: (sourceUrl: string) => Promise<PlaylistPreview>;
  togglePlaylistVideo: (videoId: string) => void;
  clearPlaylistPreview: () => void;
  markSectionComplete: (courseId: string, sectionId: string) => Promise<void>;
  saveQuizScore: (courseId: string, sectionId: string, score: number) => Promise<void>;
  updateNotificationSettings: (enabled: boolean, time?: string) => Promise<void>;
  upgradeToPro: () => void;
  clearError: () => void;
};

const emptyError: AppError | null = null;

function toAppError(error: unknown): AppError {
  if (error instanceof SkillmeterApiError) {
    return { code: error.code, message: error.message };
  }

  if (error instanceof Error) {
    return { code: 'unknown', message: error.message };
  }

  return { code: 'unknown', message: 'Something went wrong.' };
}

function buildInitialProgress(course: Course): CourseProgress {
  return {
    courseId: course.id,
    completedSectionIds: [],
    lastOpenedSectionId: course.currentSectionId,
    quizScores: {},
    updatedAt: new Date().toISOString(),
  };
}

function buildProfileFromSession(session: Session): UserProfile {
  const fallbackName =
    typeof session.user.user_metadata?.name === 'string'
      ? session.user.user_metadata.name
      : typeof session.user.user_metadata?.full_name === 'string'
        ? session.user.user_metadata.full_name
        : session.user.email?.split('@')[0] ?? demoProfile.name;

  return {
    ...demoProfile,
    id: session.user.id,
    email: session.user.email ?? demoProfile.email,
    name: fallbackName,
    avatarUrl:
      typeof session.user.user_metadata?.avatar_url === 'string'
        ? session.user.user_metadata.avatar_url
        : demoProfile.avatarUrl,
  };
}

function getRedirectUrl() {
  return Linking.createURL('/');
}

function getAuthParamsFromUrl(url: string) {
  const parsedUrl = new URL(url);
  const query = new URLSearchParams(parsedUrl.search.replace(/^\?/, ''));
  const hash = new URLSearchParams(parsedUrl.hash.replace(/^#/, ''));

  const getParam = (key: string) => hash.get(key) ?? query.get(key);

  return {
    accessToken: getParam('access_token'),
    refreshToken: getParam('refresh_token'),
    errorCode: getParam('error_code') ?? getParam('error'),
    errorDescription: getParam('error_description'),
  };
}

async function createSessionFromRedirectUrl(url: string) {
  if (!supabase) {
    return null;
  }

  const { accessToken, refreshToken, errorCode, errorDescription } = getAuthParamsFromUrl(url);

  if (errorCode) {
    throw new SkillmeterApiError('auth', errorDescription ?? errorCode);
  }

  if (!accessToken || !refreshToken) {
    return null;
  }

  const {
    data: { session },
    error,
  } = await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  if (error) {
    throw new SkillmeterApiError('auth', error.message);
  }

  return session;
}

function upsertProgress(progressList: CourseProgress[], nextProgress: CourseProgress) {
  const withoutCurrent = progressList.filter((item) => item.courseId !== nextProgress.courseId);
  return [nextProgress, ...withoutCurrent];
}

function getNextSectionId(course: Course, progress?: CourseProgress) {
  const completedSectionIds = new Set(progress?.completedSectionIds ?? []);
  return course.sections.find((section) => !completedSectionIds.has(section.id))?.id ?? course.sections.at(-1)?.id ?? null;
}

function decorateCourse(course: Course, progress?: CourseProgress): Course {
  const nextSectionId = getNextSectionId(course, progress);
  const nextSection = course.sections.find((section) => section.id === nextSectionId) ?? course.sections[0];
  const currentSection =
    course.sections.find((section) => section.id === progress?.lastOpenedSectionId) ??
    nextSection ??
    course.sections[0];
  const completedCount = progress?.completedSectionIds.length ?? 0;
  const fullyCompleted = course.sections.length > 0 && completedCount >= course.sections.length;

  return {
    ...course,
    currentSectionId: currentSection?.id ?? course.currentSectionId,
    nextAction: fullyCompleted
      ? 'Review completed course'
      : completedCount > 0
        ? `Continue ${currentSection?.title ?? nextSection?.title ?? 'lesson'}`
        : `Start ${nextSection?.title ?? 'first lesson'}`,
  };
}

function decorateCourses(courses: Course[], progressList: CourseProgress[]) {
  return courses.map((course) =>
    decorateCourse(
      course,
      progressList.find((item) => item.courseId === course.id),
    ),
  );
}

function recalculateStats(courses: Course[], progressList: CourseProgress[], currentStats: UserStats | null): UserStats {
  const sectionDurations = new Map(courses.flatMap((course) => course.sections.map((section) => [section.id, section.durationMinutes])));
  const completedSections = progressList.reduce((total, progress) => total + progress.completedSectionIds.length, 0);
  const completedCourses = courses.filter((course) => {
    const progress = progressList.find((item) => item.courseId === course.id);
    return course.sections.length > 0 && (progress?.completedSectionIds.length ?? 0) >= course.sections.length;
  }).length;
  const totalLearningMinutes = progressList.reduce((total, progress) => {
    return (
      total +
      progress.completedSectionIds.reduce((sectionTotal, sectionId) => sectionTotal + (sectionDurations.get(sectionId) ?? 0), 0)
    );
  }, 0);

  return {
    totalCourses: courses.length,
    completedCourses,
    completedSections,
    totalLearningMinutes,
    currentStreak: currentStats?.currentStreak ?? demoStats.currentStreak,
    longestStreak: currentStats?.longestStreak ?? demoStats.longestStreak,
    weeklyActivity: currentStats?.weeklyActivity ?? demoStats.weeklyActivity,
  };
}

function hasLocalCachedData(state: Pick<SkillmeterState, 'courses' | 'progress' | 'profile' | 'usage' | 'stats'>) {
  return state.courses.length > 0 || state.progress.length > 0 || Boolean(state.profile || state.usage || state.stats);
}

function shouldBlockForFreeLimit(input: CourseGenerationInput, usage: UsageLimits | null) {
  if (!usage) {
    return false;
  }

  if (input.mode === 'oneshot') {
    return usage.oneshotUsed >= usage.oneshotLimit;
  }

  return usage.playlistUsed >= usage.playlistLimit;
}

async function runGenerationSteps(set: (state: Partial<SkillmeterState>) => void) {
  for (let index = 0; index < generationSteps.length; index += 1) {
    set({
      generationSteps: generationSteps.map((step, stepIndex) => ({
        ...step,
        done: stepIndex <= index,
      })),
    });
    await new Promise((resolve) => setTimeout(resolve, 180));
  }
}

export const useSkillmeterStore = create<SkillmeterState>()(
  persist(
    (set, get) => ({
      authBootstrapped: false,
      hasSeenOnboarding: false,
      isAuthenticated: false,
      profile: null,
      usage: null,
      stats: null,
      courses: [],
      progress: [],
      activeCourseId: null,
      authStatus: 'idle',
      courseStatus: 'idle',
      generationStatus: 'idle',
      playlistStatus: 'idle',
      generationSteps,
      playlistPreview: null,
      error: emptyError,

      bootstrapApp: async () => {
        try {
          if (isSupabaseConfigured && supabase) {
            const {
              data: { session },
              error,
            } = await supabase.auth.getSession();

            if (error) {
              throw new SkillmeterApiError('auth', error.message);
            }

            await get().syncAuthSession(session);
            return;
          }

          if (get().isAuthenticated) {
            if (hasLocalCachedData(get())) {
              const decoratedCourses = decorateCourses(get().courses, get().progress);
              set((state) => ({
                courses: decoratedCourses,
                stats: recalculateStats(decoratedCourses, state.progress, state.stats),
                courseStatus: decoratedCourses.length > 0 ? 'success' : 'empty',
                authBootstrapped: true,
              }));
              return;
            }

            await get().loadDashboard();
          }

          set({ authBootstrapped: true });
        } catch (error) {
          set({ authBootstrapped: true, authStatus: 'error', error: toAppError(error) });
        }
      },

      syncAuthSession: async (session) => {
        if (!session) {
          set({
            authBootstrapped: true,
            isAuthenticated: false,
            profile: null,
            usage: null,
            stats: null,
            courses: [],
            progress: [],
            activeCourseId: null,
            authStatus: 'idle',
            courseStatus: 'idle',
            generationStatus: 'idle',
            playlistStatus: 'idle',
            playlistPreview: null,
          });
          return;
        }

        set({
          authBootstrapped: true,
          hasSeenOnboarding: true,
          isAuthenticated: true,
          profile: buildProfileFromSession(session),
          authStatus: 'success',
          error: null,
        });
        await get().loadDashboard();
      },

      completeOnboarding: () => {
        set({ hasSeenOnboarding: true });
      },

      signIn: async (email: string, password: string) => {
        set({ authStatus: 'loading', error: null });
        try {
          if (isSupabaseConfigured && supabase) {
            const {
              data: { session },
              error,
            } = await supabase.auth.signInWithPassword({ email, password });
            if (error) {
              throw new SkillmeterApiError('auth', error.message);
            }

            await get().syncAuthSession(session);
            return true;
          }

          const nextProfile = {
            ...(get().profile ?? demoProfile),
            email: email || demoProfile.email,
          };
          set({
            hasSeenOnboarding: true,
            isAuthenticated: true,
            profile: nextProfile,
            authStatus: 'success',
            authBootstrapped: true,
          });

          if (!hasLocalCachedData(get())) {
            await get().loadDashboard();
          }

          return true;
        } catch (error) {
          set({ authStatus: 'error', error: toAppError(error) });
          return false;
        }
      },

      signUp: async (name: string, email: string, password: string) => {
        set({ authStatus: 'loading', error: null });
        try {
          if (isSupabaseConfigured && supabase) {
            const {
              data: { session },
              error,
            } = await supabase.auth.signUp({
              email,
              password,
              options: { data: { name } },
            });
            if (error) {
              throw new SkillmeterApiError('auth', error.message);
            }

            if (!session) {
              set({
                hasSeenOnboarding: true,
                authStatus: 'success',
                error: {
                  code: 'auth',
                  message: 'Account created. Confirm your email, then log in.',
                },
                authBootstrapped: true,
              });
              return false;
            }

            await get().syncAuthSession(session);
            return true;
          }

          const nextProfile = {
            ...(get().profile ?? demoProfile),
            name: name || demoProfile.name,
            email: email || demoProfile.email,
          };
          set({
            hasSeenOnboarding: true,
            isAuthenticated: true,
            profile: nextProfile,
            authStatus: 'success',
            authBootstrapped: true,
          });

          if (!hasLocalCachedData(get())) {
            await get().loadDashboard();
          }

          return true;
        } catch (error) {
          set({ authStatus: 'error', error: toAppError(error) });
          return false;
        }
      },

      signInWithGoogle: async () => {
        set({ authStatus: 'loading', error: null });
        try {
          if (isSupabaseConfigured && supabase) {
            const redirectTo = getRedirectUrl();

            if (Platform.OS === 'web') {
              const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                  redirectTo,
                },
              });
              if (error) {
                throw new SkillmeterApiError('auth', error.message);
              }

              set({ authStatus: 'idle' });
              return false;
            }

            const { data, error } = await supabase.auth.signInWithOAuth({
              provider: 'google',
              options: {
                redirectTo,
                skipBrowserRedirect: true,
              },
            });
            if (error) {
              throw new SkillmeterApiError('auth', error.message);
            }

            if (!data?.url) {
              throw new SkillmeterApiError('auth', 'Google sign-in could not start.');
            }

            const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
            if (result.type !== 'success') {
              set({ authStatus: 'idle' });
              return false;
            }

            const session = await createSessionFromRedirectUrl(result.url);
            if (!session) {
              set({ authStatus: 'idle' });
              return false;
            }

            await get().syncAuthSession(session);
            return true;
          }

          set({
            hasSeenOnboarding: true,
            isAuthenticated: true,
            profile: get().profile ?? demoProfile,
            authStatus: 'success',
            authBootstrapped: true,
          });

          if (!hasLocalCachedData(get())) {
            await get().loadDashboard();
          }

          return true;
        } catch (error) {
          set({ authStatus: 'error', error: toAppError(error) });
          return false;
        }
      },

      signOut: async () => {
        if (isSupabaseConfigured && supabase) {
          await supabase.auth.signOut();
        }

        set({
          authBootstrapped: true,
          isAuthenticated: false,
          profile: null,
          usage: null,
          stats: null,
          courses: [],
          progress: [],
          activeCourseId: null,
          authStatus: 'idle',
          courseStatus: 'idle',
          generationStatus: 'idle',
          playlistStatus: 'idle',
          playlistPreview: null,
          error: null,
        });
      },

      loadDashboard: async () => {
        set({ courseStatus: 'loading', error: null });
        try {
          if (!isSupabaseConfigured && hasLocalCachedData(get())) {
            const decoratedCourses = decorateCourses(get().courses, get().progress);
            set((state) => ({
              courses: decoratedCourses,
              stats: recalculateStats(decoratedCourses, state.progress, state.stats),
              courseStatus: decoratedCourses.length > 0 ? 'success' : 'empty',
              authBootstrapped: true,
            }));
            return;
          }

          const [profile, courses, progress, usage, stats] = await Promise.all([
            getProfile(),
            getCourses(),
            getProgress(),
            getUsageLimits(),
            getUserStats(),
          ]);
          const decoratedCourses = decorateCourses(courses, progress);
          set({
            profile,
            courses: decoratedCourses,
            progress,
            usage,
            stats: recalculateStats(decoratedCourses, progress, stats),
            activeCourseId: get().activeCourseId ?? decoratedCourses[0]?.id ?? null,
            courseStatus: decoratedCourses.length > 0 ? 'success' : 'empty',
            authBootstrapped: true,
          });
        } catch (error) {
          const appError = toAppError(error);
          set({
            courseStatus: 'error',
            authStatus: appError.code === 'auth' ? 'error' : get().authStatus,
            error: appError,
            authBootstrapped: true,
          });
        }
      },

      setActiveCourse: (courseId: string) => {
        set({ activeCourseId: courseId });
      },

      openCourseSection: async (courseId: string, sectionId: string) => {
        const course = get().courses.find((item) => item.id === courseId);
        if (!course) {
          set({ error: { code: 'not_found', message: 'Course not found.' } });
          return;
        }

        const existingProgress =
          get().progress.find((item) => item.courseId === courseId) ??
          buildInitialProgress(course);

        if (existingProgress.lastOpenedSectionId === sectionId && get().activeCourseId === courseId) {
          return;
        }

        const optimisticProgress = {
          ...existingProgress,
          lastOpenedSectionId: sectionId,
          updatedAt: new Date().toISOString(),
        };

        set((state) => {
          const nextProgressList = upsertProgress(state.progress, optimisticProgress);
          const nextCourses = state.courses.map((item) =>
            item.id === courseId ? decorateCourse(item, optimisticProgress) : item,
          );

          return {
            activeCourseId: courseId,
            progress: nextProgressList,
            courses: nextCourses,
            error: null,
          };
        });

        try {
          const savedProgress = await saveProgress(optimisticProgress);
          set((state) => {
            const nextProgressList = upsertProgress(state.progress, savedProgress);
            const nextCourses = state.courses.map((item) =>
              item.id === courseId ? decorateCourse(item, savedProgress) : item,
            );

            return {
              progress: nextProgressList,
              courses: nextCourses,
              error: null,
            };
          });
        } catch (error) {
          set({ error: toAppError(error) });
        }
      },

      createGeneratedCourse: async (input: CourseGenerationInput) => {
        set({
          generationStatus: 'loading',
          generationSteps: generationSteps.map((step) => ({ ...step, done: false })),
          error: null,
        });

        try {
          if (shouldBlockForFreeLimit(input, get().usage)) {
            throw new SkillmeterApiError('payment_required', 'Your free plan limit is reached.');
          }

          if (input.mode === 'playlist' && input.selectedVideoIds && input.selectedVideoIds.length === 0) {
            throw new SkillmeterApiError('validation', 'Select at least one playlist video before building the course.');
          }

          await runGenerationSteps(set);
          const course = await createCourse(input);
          const nextProgress = buildInitialProgress(course);
          const decoratedCourse = decorateCourse(course, nextProgress);

          set((state) => {
            const nextCourses = [decoratedCourse, ...state.courses];
            const nextProgressList = upsertProgress(state.progress, nextProgress);

            return {
              courses: nextCourses,
              progress: nextProgressList,
              activeCourseId: decoratedCourse.id,
              generationStatus: 'success',
              courseStatus: 'success',
              usage: state.usage
                ? {
                    ...state.usage,
                    oneshotUsed: input.mode === 'oneshot' ? state.usage.oneshotUsed + 1 : state.usage.oneshotUsed,
                    playlistUsed: input.mode === 'playlist' ? state.usage.playlistUsed + 1 : state.usage.playlistUsed,
                  }
                : state.usage,
              stats: recalculateStats(nextCourses, nextProgressList, state.stats),
            };
          });

          return decoratedCourse;
        } catch (error) {
          const appError = toAppError(error);
          set({
            generationStatus: appError.code === 'payment_required' ? 'payment_required' : 'error',
            error: appError,
          });
          throw error;
        }
      },

      loadPlaylistPreview: async (sourceUrl: string) => {
        set({ playlistStatus: 'loading', playlistPreview: null, error: null });
        try {
          const preview = await fetchPlaylistPreview(sourceUrl);
          set({ playlistPreview: preview, playlistStatus: 'success' });
          return preview;
        } catch (error) {
          const appError = toAppError(error);
          set({ playlistStatus: 'error', error: appError });
          throw error;
        }
      },

      togglePlaylistVideo: (videoId: string) => {
        set((state) => ({
          playlistPreview: state.playlistPreview
            ? {
                ...state.playlistPreview,
                videos: state.playlistPreview.videos.map((video) =>
                  video.id === videoId ? { ...video, selected: !video.selected } : video,
                ),
              }
            : null,
        }));
      },

      clearPlaylistPreview: () => {
        set({ playlistPreview: null, playlistStatus: 'idle' });
      },

      markSectionComplete: async (courseId: string, sectionId: string) => {
        const course = get().courses.find((item) => item.id === courseId);
        if (!course) {
          set({ error: { code: 'not_found', message: 'Course not found.' } });
          return;
        }

        const section = course.sections.find((item) => item.id === sectionId);
        if (!section) {
          set({ error: { code: 'not_found', message: 'Section not found.' } });
          return;
        }

        const existingProgress =
          get().progress.find((item) => item.courseId === courseId) ??
          buildInitialProgress(course);

        const quizCompleted =
          section.quiz.length === 0 || Object.prototype.hasOwnProperty.call(existingProgress.quizScores, sectionId);
        if (!quizCompleted) {
          set({
            error: {
              code: 'validation',
              message: 'Complete the quiz before marking this section complete.',
            },
          });
          return;
        }

        try {
          const completedSectionIds = Array.from(new Set([...existingProgress.completedSectionIds, sectionId]));
          const nextProgress = await saveProgress({
            ...existingProgress,
            completedSectionIds,
            lastOpenedSectionId: sectionId,
          });

          set((state) => {
            const nextProgressList = upsertProgress(state.progress, nextProgress);
            const nextCourses = state.courses.map((item) =>
              item.id === courseId ? decorateCourse(item, nextProgress) : item,
            );

            return {
              courses: nextCourses,
              progress: nextProgressList,
              stats: {
                ...recalculateStats(nextCourses, nextProgressList, state.stats),
                currentStreak: Math.max(state.stats?.currentStreak ?? 0, 1),
                longestStreak: Math.max(state.stats?.longestStreak ?? 0, state.stats?.currentStreak ?? 1, 1),
              },
              error: null,
            };
          });
        } catch (error) {
          set({ error: toAppError(error) });
        }
      },

      saveQuizScore: async (courseId: string, sectionId: string, score: number) => {
        const course = get().courses.find((item) => item.id === courseId);
        if (!course) {
          set({ error: { code: 'not_found', message: 'Course not found.' } });
          return;
        }

        const existingProgress =
          get().progress.find((item) => item.courseId === courseId) ??
          buildInitialProgress(course);

        try {
          const nextProgress = await saveProgress({
            ...existingProgress,
            quizScores: {
              ...existingProgress.quizScores,
              [sectionId]: score,
            },
            lastOpenedSectionId: sectionId,
          });

          set((state) => {
            const nextProgressList = upsertProgress(state.progress, nextProgress);
            const nextCourses = state.courses.map((item) =>
              item.id === courseId ? decorateCourse(item, nextProgress) : item,
            );

            return {
              progress: nextProgressList,
              courses: nextCourses,
              error: null,
            };
          });
        } catch (error) {
          set({ error: toAppError(error) });
        }
      },

      updateNotificationSettings: async (enabled: boolean, time?: string) => {
        const currentProfile = get().profile ?? demoProfile;
        const nextProfile = {
          ...currentProfile,
          notificationsEnabled: enabled,
          notificationTime: time ?? currentProfile.notificationTime,
        };

        if (!enabled) {
          await scheduleDailyReminder(nextProfile);
          set({ profile: nextProfile, error: null });
          return;
        }

        const scheduled = await scheduleDailyReminder(nextProfile);
        if (!scheduled) {
          set({
            error: {
              code: 'validation',
              message: 'Notifications are unavailable or permission was denied on this device.',
            },
          });
          return;
        }

        set({ profile: nextProfile, error: null });
      },

      upgradeToPro: () => {
        set((state) => ({
          profile: {
            ...(state.profile ?? demoProfile),
            plan: 'pro',
          },
          usage: {
            ...(state.usage ?? demoUsage),
            oneshotLimit: 999,
            playlistLimit: 999,
            quizLimit: 999,
          },
          error: null,
        }));
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'skillmeter-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        hasSeenOnboarding: state.hasSeenOnboarding,
        isAuthenticated: state.isAuthenticated,
        profile: state.profile,
        usage: state.usage,
        stats: state.stats,
        courses: state.courses,
        progress: state.progress,
        activeCourseId: state.activeCourseId,
      }),
    },
  ),
);

export function getStoredCourseProgress(course: Course, progress?: CourseProgress) {
  if (!progress || course.sections.length === 0) {
    return 0;
  }

  return progress.completedSectionIds.length / course.sections.length;
}
