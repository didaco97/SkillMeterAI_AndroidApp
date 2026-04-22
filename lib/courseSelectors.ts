import type { Course, CourseProgress, CourseSection } from '@/types/skillmeter';

export function getCourseProgressValue(course: Course, progress?: CourseProgress) {
  if (!progress || course.sections.length === 0) {
    return 0;
  }

  return progress.completedSectionIds.length / course.sections.length;
}

export function getCourseDayLabel(course: Course) {
  const currentSection = getCurrentSection(course);
  if (!currentSection) {
    return 'No sections';
  }

  if (course.mode === 'playlist') {
    const module = course.modules.find((item) => item.sectionIds.includes(currentSection.id));
    return module ? `Module ${module.orderIndex} active` : 'Playlist active';
  }

  return `Day ${currentSection.dayNumber} of ${course.dailyPlan.length}`;
}

export function getCurrentSection(course: Course, progress?: CourseProgress): CourseSection | undefined {
  const sectionId = progress?.lastOpenedSectionId ?? course.currentSectionId;
  return course.sections.find((section) => section.id === sectionId) ?? course.sections[0];
}

export function getSectionTimestampRange(section?: CourseSection) {
  if (!section) {
    return '00:00';
  }

  return `${formatTimestamp(section.startSeconds)} - ${formatTimestamp(section.endSeconds)}`;
}

export function formatTimestamp(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

export function getCourseProgressLabel(course: Course, progress?: CourseProgress) {
  return `${Math.round(getCourseProgressValue(course, progress) * 100)}% complete`;
}

export function getSelectedSection(course: Course, selectedSectionId?: string | null, progress?: CourseProgress) {
  if (selectedSectionId) {
    return course.sections.find((section) => section.id === selectedSectionId) ?? getCurrentSection(course, progress);
  }

  return getCurrentSection(course, progress);
}
