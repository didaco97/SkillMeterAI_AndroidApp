import {
  cloneDemoCourses,
  cloneDemoProgress,
  demoPlaylistPreview,
  demoProfile,
  demoStats,
  demoUsage,
} from '@/data/demoCourse';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import type {
  AppError,
  Course,
  CourseGenerationInput,
  CourseProgress,
  PlaylistPreview,
  UsageLimits,
  UserProfile,
  UserStats,
} from '@/types/skillmeter';

const delay = (milliseconds: number) => new Promise((resolve) => setTimeout(resolve, milliseconds));

export class SkillmeterApiError extends Error {
  code: AppError['code'];

  constructor(code: AppError['code'], message: string) {
    super(message);
    this.code = code;
  }
}

async function invokeEdgeFunction<T>(name: string, body?: unknown) {
  if (!supabase || !isSupabaseConfigured) {
    return null;
  }

  const { data, error } = await supabase.functions.invoke<T>(name, body ? { body } : undefined);

  if (error) {
    const status = 'context' in error ? (error.context as { status?: number } | undefined)?.status : undefined;
    if (status === 400) {
      throw new SkillmeterApiError('validation', error.message);
    }
    if (status === 401) {
      throw new SkillmeterApiError('auth', 'Please log in again.');
    }
    if (status === 402) {
      throw new SkillmeterApiError('payment_required', 'Your free plan limit is reached.');
    }
    if (status === 404) {
      throw new SkillmeterApiError('not_found', error.message || 'Requested resource not found.');
    }
    throw new SkillmeterApiError('network', error.message);
  }

  return data;
}

export async function getProfile(): Promise<UserProfile> {
  const remote = await invokeEdgeFunction<UserProfile>('get-profile');
  if (remote) {
    return remote;
  }

  await delay(150);
  return demoProfile;
}

export async function getUsageLimits(): Promise<UsageLimits> {
  const remote = await invokeEdgeFunction<UsageLimits>('get-usage-limits');
  if (remote) {
    return remote;
  }

  await delay(150);
  return demoUsage;
}

export async function getUserStats(): Promise<UserStats> {
  const remote = await invokeEdgeFunction<UserStats>('get-user-stats');
  if (remote) {
    return remote;
  }

  await delay(150);
  return demoStats;
}

export async function getCourses(): Promise<Course[]> {
  const remote = await invokeEdgeFunction<Course[]>('get-courses');
  if (remote) {
    return remote;
  }

  await delay(200);
  return cloneDemoCourses();
}

export async function getProgress(): Promise<CourseProgress[]> {
  const remote = await invokeEdgeFunction<CourseProgress[]>('get-progress');
  if (remote) {
    return remote;
  }

  await delay(150);
  return cloneDemoProgress();
}

export async function fetchPlaylistPreview(sourceUrl: string): Promise<PlaylistPreview> {
  const remote = await invokeEdgeFunction<PlaylistPreview>('get-playlist-videos', { sourceUrl });
  if (remote) {
    return remote;
  }

  await delay(650);
  return {
    ...demoPlaylistPreview,
    sourceUrl,
  };
}

export async function createCourse(input: CourseGenerationInput): Promise<Course> {
  const functionName = input.mode === 'playlist' ? 'create-playlist-course' : 'create-oneshot-course';
  const remote = await invokeEdgeFunction<Course>(functionName, input);
  if (remote) {
    return remote;
  }

  await delay(900);
  const template = cloneDemoCourses().find((course) => course.mode === input.mode) ?? cloneDemoCourses()[0];
  const generatedAt = new Date().toISOString();
  const courseId = `${input.mode}-${Date.now()}`;
  const selectedVideoIds =
    input.mode === 'playlist' && input.selectedVideoIds?.length
      ? input.selectedVideoIds
      : Array.from(new Set(template.sections.map((section) => section.videoId)));

  const generatedSections =
    input.mode === 'playlist'
      ? selectedVideoIds.map((videoId, index) => {
          const fallbackSection = template.sections.find((section) => section.videoId === videoId) ?? template.sections[index % template.sections.length];

          return {
            ...fallbackSection,
            id: `${courseId}-${index + 1}`,
            courseId,
            videoId,
            title: fallbackSection?.title ?? `Playlist lesson ${index + 1}`,
            dayNumber: index + 1,
            orderIndex: index + 1,
            status: index === 0 ? ('in_progress' as const) : ('available' as const),
          };
        })
      : template.sections.map((section) => ({
          ...section,
          id: `${courseId}-${section.orderIndex}`,
          courseId,
          status: section.orderIndex === 1 ? ('in_progress' as const) : ('available' as const),
        }));

  const generatedModules =
    input.mode === 'playlist'
      ? Array.from({ length: Math.max(1, Math.ceil(generatedSections.length / 2)) }).map((_, index) => {
          const chunk = generatedSections.slice(index * 2, index * 2 + 2);
          return {
            id: `${courseId}-module-${index + 1}`,
            courseId,
            title: `Module ${index + 1}`,
            orderIndex: index + 1,
            learningObjectives: [`Finish ${chunk.length} playlist lessons`, 'Keep the daily habit moving'],
            sectionIds: chunk.map((section) => section.id),
          };
        })
      : template.modules.map((module) => ({
          ...module,
          id: `${courseId}-module-${module.orderIndex}`,
          courseId,
          sectionIds: module.sectionIds
            .map((sectionId) => template.sections.find((section) => section.id === sectionId))
            .filter(Boolean)
            .map((section) => `${courseId}-${section!.orderIndex}`),
        }));

  const generatedDailyPlan = generatedSections.map((section) => ({
    day: section.dayNumber,
    title: section.title,
    minutes: section.durationMinutes,
    sectionIds: [section.id],
  }));

  return {
    ...template,
    id: courseId,
    title: input.mode === 'playlist' ? 'Generated playlist course' : 'Generated One Shot course',
    sourceUrl: input.sourceUrl,
    sourceLabel: input.mode === 'playlist' ? `${generatedSections.length} videos selected` : template.sourceLabel,
    dailyMinutes: input.dailyMinutes,
    createdAt: generatedAt,
    updatedAt: generatedAt,
    sections: generatedSections,
    modules: generatedModules,
    dailyPlan: generatedDailyPlan,
    currentSectionId: generatedSections[0]?.id ?? `${courseId}-1`,
    nextAction: 'Start first section',
  };
}

export async function saveProgress(progress: CourseProgress): Promise<CourseProgress> {
  const remote = await invokeEdgeFunction<CourseProgress>('update-progress', progress);
  if (remote) {
    return remote;
  }

  await delay(120);
  return {
    ...progress,
    updatedAt: new Date().toISOString(),
  };
}
