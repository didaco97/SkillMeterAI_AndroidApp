import { useLocalSearchParams, router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { StyleSheet } from 'react-native';

import { EmptyState, ErrorState, PageHeader, ScreenShell, SegmentedControl, SkeletonBlock } from '@/components/AppScaffold';
import {
  ActiveCourseHeader,
  CompletionFooter,
  DailyPlanList,
  LessonPlayerCard,
  ModuleAccordion,
  NotesPanel,
  QuizPanel,
} from '@/components/CourseUI';
import { NeoCard, SectionTitle, Tag } from '@/components/Neo';
import { theme } from '@/constants/skillmeterTheme';
import { getCurrentSection, getSelectedSection } from '@/lib/courseSelectors';
import { useSkillmeterStore } from '@/stores/useSkillmeterStore';

type Panel = 'plan' | 'modules' | 'notes' | 'quiz';

export default function LearnScreen() {
  const [panel, setPanel] = useState<Panel>('plan');
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const { courseId, sectionId } = useLocalSearchParams<{ courseId?: string; sectionId?: string }>();
  const courses = useSkillmeterStore((state) => state.courses);
  const progress = useSkillmeterStore((state) => state.progress);
  const activeCourseId = useSkillmeterStore((state) => state.activeCourseId);
  const courseStatus = useSkillmeterStore((state) => state.courseStatus);
  const error = useSkillmeterStore((state) => state.error);
  const loadDashboard = useSkillmeterStore((state) => state.loadDashboard);
  const setActiveCourse = useSkillmeterStore((state) => state.setActiveCourse);
  const openCourseSection = useSkillmeterStore((state) => state.openCourseSection);
  const markSectionComplete = useSkillmeterStore((state) => state.markSectionComplete);
  const saveQuizScore = useSkillmeterStore((state) => state.saveQuizScore);

  const resolvedCourseId = courseId ?? activeCourseId;
  const activeCourse = courses.find((course) => course.id === resolvedCourseId);
  const activeProgress = activeCourse ? progress.find((item) => item.courseId === activeCourse.id) : undefined;
  const selectedSection = activeCourse ? getSelectedSection(activeCourse, selectedSectionId, activeProgress) : undefined;
  const completedSectionIds = useMemo(() => activeProgress?.completedSectionIds ?? [], [activeProgress?.completedSectionIds]);
  const sectionCompleted = selectedSection ? completedSectionIds.includes(selectedSection.id) : false;
  const quizCompleted = useMemo(() => {
    if (!selectedSection) {
      return false;
    }

    if (selectedSection.quiz.length === 0) {
      return true;
    }

    return Object.prototype.hasOwnProperty.call(activeProgress?.quizScores ?? {}, selectedSection.id);
  }, [activeProgress?.quizScores, selectedSection]);
  const requestedSectionId = sectionId ?? undefined;

  useEffect(() => {
    if (courseStatus === 'idle') {
      loadDashboard();
    }
  }, [courseStatus, loadDashboard]);

  useEffect(() => {
    if (!activeCourse) {
      setSelectedSectionId(null);
      return;
    }

    setActiveCourse(activeCourse.id);
    const requestedSectionIsValid =
      typeof requestedSectionId === 'string' &&
      activeCourse.sections.some((section) => section.id === requestedSectionId);
    const fallbackSectionId = (requestedSectionIsValid ? requestedSectionId : getCurrentSection(activeCourse, activeProgress)?.id) ?? null;

    setSelectedSectionId((current) => {
      if (requestedSectionIsValid) {
        return requestedSectionId ?? null;
      }

      if (current && activeCourse.sections.some((section) => section.id === current)) {
        return current;
      }

      return fallbackSectionId;
    });

    if (fallbackSectionId && fallbackSectionId !== activeProgress?.lastOpenedSectionId) {
      void openCourseSection(activeCourse.id, fallbackSectionId);
    }
  }, [activeCourse, activeProgress, openCourseSection, requestedSectionId, setActiveCourse]);

  function goToSection(sectionIdToOpen: string) {
    if (!activeCourse) {
      return;
    }

    setSelectedSectionId(sectionIdToOpen);
    router.setParams({ courseId: activeCourse.id, sectionId: sectionIdToOpen });
    void openCourseSection(activeCourse.id, sectionIdToOpen);
  }

  async function completeCurrentSection() {
    if (!activeCourse || !selectedSection) {
      return;
    }

    await markSectionComplete(activeCourse.id, selectedSection.id);
  }

  async function saveCurrentQuiz(score: number) {
    if (!activeCourse || !selectedSection) {
      return;
    }

    await saveQuizScore(activeCourse.id, selectedSection.id, score);
  }

  return (
    <ScreenShell>
      <PageHeader
        title="Learn"
        caption="Current ongoing course"
        badge={activeCourse ? <Tag color={activeCourse.color}>{activeCourse.mode === 'oneshot' ? 'One Shot' : 'Playlist'}</Tag> : undefined}
      />

      {courseStatus === 'loading' ? (
        <>
          <SkeletonBlock lines={4} />
          <SkeletonBlock lines={5} />
        </>
      ) : null}

      {courseStatus === 'error' ? <ErrorState error={error} onRetry={loadDashboard} /> : null}

      {courseStatus !== 'loading' && !activeCourse ? (
        <EmptyState
          actionLabel={courses.length > 0 ? 'Open courses' : 'Create course'}
          copy={
            courses.length > 0
              ? 'The selected course is not available anymore. Pick another course from your library.'
              : 'Create a course from Home, then your current lesson workspace will appear here.'
          }
          icon="play-circle"
          onAction={() => router.push(courses.length > 0 ? '/courses' : '/home')}
          title="No active course"
        />
      ) : null}

      {activeCourse && selectedSection ? (
        <>
          <SectionTitle eyebrow="Active course" title={activeCourse.title} aside={activeCourse.sourceLabel} />
          <ActiveCourseHeader course={activeCourse} progress={activeProgress} />

          <SectionTitle eyebrow="Now playing" title={selectedSection.title} aside={`${selectedSection.durationMinutes} min`} />
          <LessonPlayerCard section={selectedSection} />

          <NeoCard color={theme.color.white} contentStyle={styles.workspaceCard}>
            <SegmentedControl
              options={[
                { label: 'Plan', value: 'plan', color: theme.color.yellow },
                { label: 'Modules', value: 'modules', color: theme.color.cyan },
                { label: 'Notes', value: 'notes', color: theme.color.softBlue },
                { label: 'Quiz', value: 'quiz', color: theme.color.pink },
              ]}
              value={panel}
              onChange={setPanel}
            />

            {panel === 'plan' ? (
              <DailyPlanList
                course={activeCourse}
                completedSectionIds={completedSectionIds}
                selectedSectionId={selectedSection.id}
                onSelectSection={goToSection}
              />
            ) : null}
            {panel === 'modules' ? (
              <ModuleAccordion
                course={activeCourse}
                completedSectionIds={completedSectionIds}
                selectedSectionId={selectedSection.id}
                onSelectSection={goToSection}
              />
            ) : null}
            {panel === 'notes' ? <NotesPanel section={selectedSection} /> : null}
            {panel === 'quiz' ? (
              <>
                <QuizPanel section={selectedSection} onSaveScore={saveCurrentQuiz} />
                <CompletionFooter
                  completed={sectionCompleted}
                  onComplete={completeCurrentSection}
                  quizCompleted={quizCompleted}
                  quizRequired={selectedSection.quiz.length > 0}
                />
              </>
            ) : null}
          </NeoCard>
        </>
      ) : null}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  workspaceCard: {
    gap: 14,
  },
});
