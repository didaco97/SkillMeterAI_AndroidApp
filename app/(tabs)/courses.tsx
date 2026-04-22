import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';

import { EmptyState, ErrorState, PageHeader, ScreenShell, SegmentedControl, SkeletonBlock } from '@/components/AppScaffold';
import { CourseCard } from '@/components/CourseUI';
import { SectionTitle, Tag } from '@/components/Neo';
import { theme } from '@/constants/skillmeterTheme';
import { getCourseProgressValue } from '@/lib/courseSelectors';
import { useSkillmeterStore } from '@/stores/useSkillmeterStore';

type Filter = 'ongoing' | 'completed' | 'newest';

export default function CoursesScreen() {
  const [filter, setFilter] = useState<Filter>('ongoing');
  const courses = useSkillmeterStore((state) => state.courses);
  const progress = useSkillmeterStore((state) => state.progress);
  const courseStatus = useSkillmeterStore((state) => state.courseStatus);
  const error = useSkillmeterStore((state) => state.error);
  const loadDashboard = useSkillmeterStore((state) => state.loadDashboard);
  const setActiveCourse = useSkillmeterStore((state) => state.setActiveCourse);

  useEffect(() => {
    if (courseStatus === 'idle') {
      loadDashboard();
    }
  }, [courseStatus, loadDashboard]);

  const filteredCourses = useMemo(() => {
    const withProgress = courses.map((course) => ({
      course,
      progress: progress.find((item) => item.courseId === course.id),
    }));

    if (filter === 'completed') {
      return withProgress.filter((item) => getCourseProgressValue(item.course, item.progress) === 1);
    }

    if (filter === 'newest') {
      return withProgress.sort((a, b) => Date.parse(b.course.createdAt) - Date.parse(a.course.createdAt));
    }

    return withProgress.filter((item) => getCourseProgressValue(item.course, item.progress) < 1);
  }, [courses, filter, progress]);

  function openCourse(courseId: string, sectionId?: string) {
    setActiveCourse(courseId);
    router.push({ pathname: '/learn', params: { courseId, ...(sectionId ? { sectionId } : {}) } });
  }

  return (
    <ScreenShell>
      <PageHeader
        title="Courses"
        caption="Pick up where you left off or review completed lessons."
        badge={<Tag color={theme.color.green}>{`${courses.length} total`}</Tag>}
      />

      {courseStatus === 'loading' ? (
        <>
          <SkeletonBlock lines={4} />
          <SkeletonBlock lines={4} />
        </>
      ) : null}

      {courseStatus === 'error' ? <ErrorState error={error} onRetry={loadDashboard} /> : null}

      {courseStatus !== 'loading' && filteredCourses.length === 0 ? (
        <EmptyState
          actionLabel="Create course"
          copy="Create a One Shot video course or convert a playlist from the Home tab."
          icon="plus"
          onAction={() => router.push('/home')}
          title="No courses here"
        />
      ) : null}

      {courseStatus !== 'loading' && filteredCourses.length > 0 ? (
        <>
          <SegmentedControl
            options={[
              { label: 'Ongoing', value: 'ongoing', color: theme.color.yellow },
              { label: 'Done', value: 'completed', color: theme.color.green },
              { label: 'Newest', value: 'newest', color: theme.color.cyan },
            ]}
            value={filter}
            onChange={setFilter}
          />

          <SectionTitle eyebrow="Library" title="Course list" aside={`${filteredCourses.length} shown`} />
        </>
      ) : null}

      {courseStatus !== 'loading'
        ? filteredCourses.map(({ course, progress: courseProgress }) => (
            <CourseCard
              key={course.id}
              course={course}
              progress={courseProgress}
              onPress={() => openCourse(course.id, courseProgress?.lastOpenedSectionId ?? course.currentSectionId)}
            />
          ))
        : null}
    </ScreenShell>
  );
}
