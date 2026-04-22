import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import YoutubePlayer from 'react-native-youtube-iframe';

import { NeoButton, NeoCard, ProgressBar, Tag } from '@/components/Neo';
import { theme } from '@/constants/skillmeterTheme';
import { getCourseDayLabel, getCourseProgressLabel, getCourseProgressValue, getSectionTimestampRange } from '@/lib/courseSelectors';
import type { Course, CourseProgress, CourseSection } from '@/types/skillmeter';

export function CourseCard({
  course,
  progress,
  onPress,
}: {
  course: Course;
  progress?: CourseProgress;
  onPress: () => void;
}) {
  const currentSection =
    course.sections.find((section) => section.id === progress?.lastOpenedSectionId) ??
    course.sections.find((section) => section.id === course.currentSectionId) ??
    course.sections[0];

  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => pressed && styles.coursePressed}>
      <NeoCard color={course.color} contentStyle={styles.courseCard}>
        <View style={styles.courseTop}>
          <Tag color={theme.color.white}>{course.mode === 'oneshot' ? 'One Shot' : 'Playlist'}</Tag>
          <Text style={styles.courseDays}>{getCourseDayLabel(course)}</Text>
        </View>
        <Text style={styles.courseTitle}>{course.title}</Text>
        <Text style={styles.courseSource}>{course.sourceLabel}</Text>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>{getCourseProgressLabel(course, progress)}</Text>
          <Text style={styles.progressLabel}>{course.nextAction}</Text>
        </View>
        <ProgressBar color={theme.color.green} value={getCourseProgressValue(course, progress)} />
        <View style={styles.openRow}>
          <Text style={styles.openText}>{currentSection?.title ?? 'Open course'}</Text>
          <FontAwesome color={theme.color.ink} name="arrow-right" size={16} />
        </View>
      </NeoCard>
    </Pressable>
  );
}

export function ActiveCourseHeader({
  course,
  progress,
}: {
  course: Course;
  progress?: CourseProgress;
}) {
  return (
    <NeoCard color={course.color} contentStyle={styles.activeCourseCard}>
      <View style={styles.courseTop}>
        <Text style={styles.courseSource}>{course.sourceLabel}</Text>
        <Tag color={theme.color.white}>{getCourseDayLabel(course)}</Tag>
      </View>
      <Text style={styles.courseAction}>{course.nextAction}</Text>
      <ProgressBar color={theme.color.green} value={getCourseProgressValue(course, progress)} />
    </NeoCard>
  );
}

export function LessonPlayerCard({
  section,
}: {
  section: CourseSection;
}) {
  const [seekSeconds, setSeekSeconds] = useState(section.startSeconds);
  const playerKey = `${section.videoId}-${seekSeconds}`;

  useEffect(() => {
    setSeekSeconds(section.startSeconds);
  }, [section.id, section.startSeconds]);

  return (
    <NeoCard color={theme.color.white} contentStyle={styles.playerCard}>
      <View style={styles.playerFrame}>
        <YoutubePlayer
          key={playerKey}
          height={220}
          play={false}
          videoId={section.videoId}
          initialPlayerParams={{
            start: seekSeconds,
            controls: true,
            modestbranding: true,
          }}
        />
      </View>
      <Text style={styles.lessonTitle}>{section.title}</Text>
      <Text style={styles.lessonMeta}>
        {getSectionTimestampRange(section)} - {section.durationMinutes} minutes
      </Text>
      <View style={styles.timestampGrid}>
        {section.timestamps.map((timestamp) => (
          <Pressable
            accessibilityRole="button"
            key={timestamp.id}
            onPress={() => setSeekSeconds(timestamp.seconds)}
            style={[styles.timestampChip, seekSeconds === timestamp.seconds && styles.timestampChipActive]}>
            <Text style={styles.timestampText}>{timestamp.label}</Text>
          </Pressable>
        ))}
      </View>
    </NeoCard>
  );
}

export function ModuleAccordion({
  course,
  selectedSectionId,
  completedSectionIds,
  onSelectSection,
}: {
  course: Course;
  selectedSectionId?: string;
  completedSectionIds: string[];
  onSelectSection: (sectionId: string) => void;
}) {
  const [expandedModuleId, setExpandedModuleId] = useState<string | undefined>(course.modules[0]?.id);

  useEffect(() => {
    const activeModuleId =
      course.modules.find((module) => module.sectionIds.includes(selectedSectionId ?? ''))?.id ?? course.modules[0]?.id;
    setExpandedModuleId(activeModuleId);
  }, [course.id, course.modules, selectedSectionId]);

  return (
    <View style={styles.panelBody}>
      {course.modules.map((module, index) => {
        const expanded = expandedModuleId === module.id;
        const moduleSections = module.sectionIds
          .map((sectionId) => course.sections.find((section) => section.id === sectionId))
          .filter(Boolean) as CourseSection[];

        return (
          <View key={module.id} style={[styles.moduleBlock, index !== course.modules.length - 1 && styles.moduleGap]}>
            <Pressable
              accessibilityRole="button"
              onPress={() => setExpandedModuleId(expanded ? undefined : module.id)}
              style={styles.moduleHeader}>
              <View style={styles.moduleCopy}>
                <Text style={styles.moduleTitle}>{module.title}</Text>
                <Text style={styles.moduleObjective}>{module.learningObjectives.join(' - ')}</Text>
              </View>
              <FontAwesome color={theme.color.ink} name={expanded ? 'chevron-up' : 'chevron-down'} size={14} />
            </Pressable>
            {expanded
              ? moduleSections.map((section) => {
                  const completed = completedSectionIds.includes(section.id);
                  const selected = selectedSectionId === section.id;
                  return (
                    <Pressable
                      accessibilityRole="button"
                      key={section.id}
                      onPress={() => onSelectSection(section.id)}
                      style={[styles.lessonRow, selected && styles.lessonRowActive]}>
                      <View style={[styles.lessonCheck, completed && styles.lessonCheckComplete]}>
                        {completed ? <FontAwesome color={theme.color.ink} name="check" size={10} /> : null}
                      </View>
                      <View style={styles.lessonCopy}>
                        <Text style={styles.lessonName}>{section.title}</Text>
                        <Text style={styles.lessonMetaSmall}>
                          Day {section.dayNumber} - {section.durationMinutes}m
                        </Text>
                      </View>
                    </Pressable>
                  );
                })
              : null}
          </View>
        );
      })}
    </View>
  );
}

export function DailyPlanList({
  course,
  completedSectionIds,
  selectedSectionId,
  onSelectSection,
}: {
  course: Course;
  completedSectionIds: string[];
  selectedSectionId?: string;
  onSelectSection: (sectionId: string) => void;
}) {
  return (
    <View style={styles.panelBody}>
      {course.dailyPlan.map((session) => {
        const completedCount = session.sectionIds.filter((sectionId) => completedSectionIds.includes(sectionId)).length;
        const value = session.sectionIds.length ? completedCount / session.sectionIds.length : 0;
        const firstSectionId = session.sectionIds[0];
        const selected = Boolean(selectedSectionId && session.sectionIds.includes(selectedSectionId));
        const tagColor = value === 1 ? theme.color.green : selected ? theme.color.cyan : theme.color.yellow;
        const progressColor = value === 1 ? theme.color.green : selected ? theme.color.cyan : theme.color.pink;

        return (
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected }}
            key={session.day}
            onPress={() => firstSectionId && onSelectSection(firstSectionId)}
            style={({ pressed }) => [
              styles.dayBlock,
              selected && styles.dayBlockActive,
              pressed && styles.dayBlockPressed,
            ]}>
            <View style={styles.courseTop}>
              <Tag color={tagColor}>Day {session.day}</Tag>
              <Text style={[styles.courseDays, selected && styles.dayMetaActive]}>{session.minutes} min</Text>
            </View>
            <Text style={[styles.dayTitle, selected && styles.dayTitleActive]}>{session.title}</Text>
            <ProgressBar color={progressColor} height={14} value={value} />
          </Pressable>
        );
      })}
    </View>
  );
}

export function NotesPanel({ section }: { section: CourseSection }) {
  return (
    <View style={styles.panelBody}>
      <Text style={styles.noteSummary}>{section.notes.summary}</Text>
      {section.notes.keyPoints.map((note) => (
        <View key={note} style={styles.noteRow}>
          <View style={styles.noteBullet} />
          <Text style={styles.noteText}>{note}</Text>
        </View>
      ))}
      <View style={styles.termGrid}>
        {section.notes.terms.map((term) => (
          <View key={term.term} style={styles.termCard}>
            <Text style={styles.termTitle}>{term.term}</Text>
            <Text style={styles.termDefinition}>{term.definition}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

export function QuizPanel({
  section,
  onSaveScore,
}: {
  section: CourseSection;
  onSaveScore: (score: number) => Promise<void> | void;
}) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    setAnswers({});
    setSubmitted(false);
  }, [section.id]);

  const score = useMemo(() => {
    const correct = section.quiz.filter((question) => answers[question.id] === question.correctOptionId).length;
    return section.quiz.length ? Math.round((correct / section.quiz.length) * 100) : 0;
  }, [answers, section.quiz]);

  function submitQuiz() {
    setSubmitted(true);
    onSaveScore(score);
  }

  return (
    <View style={styles.panelBody}>
      {section.quiz.map((question, questionIndex) => (
        <View key={question.id} style={styles.questionBlock}>
          <Text style={styles.quizQuestion}>
            {questionIndex + 1}. {question.prompt}
          </Text>
          {question.options.map((option) => {
            const active = answers[question.id] === option.id;
            const correct = submitted && option.id === question.correctOptionId;
            const wrong = submitted && active && option.id !== question.correctOptionId;
            return (
              <Pressable
                accessibilityRole="button"
                key={option.id}
                onPress={() => setAnswers((current) => ({ ...current, [question.id]: option.id }))}
                style={[
                  styles.answerRow,
                  active && styles.answerRowActive,
                  correct && styles.answerRowCorrect,
                  wrong && styles.answerRowWrong,
                ]}>
                <View style={[styles.answerRadio, active && styles.answerRadioActive]} />
                <Text style={styles.answerText}>{option.text}</Text>
              </Pressable>
            );
          })}
          {submitted ? <Text style={styles.explanation}>{question.explanation}</Text> : null}
        </View>
      ))}
      {submitted ? (
        <NeoCard color={score >= 70 ? theme.color.green : theme.color.yellow} contentStyle={styles.scoreCard}>
          <Text style={styles.scoreText}>Score: {score}%</Text>
        </NeoCard>
      ) : null}
      <NeoButton color={theme.color.green} disabled={Object.keys(answers).length < section.quiz.length} onPress={submitQuiz}>
        {submitted ? 'Save score again' : 'Submit quiz'}
      </NeoButton>
    </View>
  );
}

export function CompletionFooter({
  completed,
  onComplete,
  quizCompleted,
  quizRequired,
}: {
  completed: boolean;
  onComplete: () => void;
  quizCompleted: boolean;
  quizRequired: boolean;
}) {
  const unlocked = completed || !quizRequired || quizCompleted;
  const cardColor = completed ? theme.color.green : unlocked ? theme.color.softGreen : theme.color.softBlue;
  const title = completed ? 'Section complete' : unlocked ? 'Ready to mark complete' : 'Complete the quiz first';
  const copy = completed
    ? 'Progress is saved locally and ready to sync.'
    : unlocked
      ? quizRequired
        ? 'Your quiz is saved. You can now mark this section complete.'
        : 'This lesson has no quiz. Mark it complete when you are ready.'
      : 'Submit the quiz in this tab to unlock section completion.';
  const buttonLabel = completed ? 'Completed' : unlocked ? 'Mark complete' : 'Complete quiz to unlock';

  return (
    <NeoCard color={cardColor} contentStyle={styles.completionCard}>
      <View style={styles.completionCopy}>
        <Text style={styles.completionTitle}>{title}</Text>
        <Text style={styles.completionText}>{copy}</Text>
      </View>
      <NeoButton color={completed ? theme.color.white : theme.color.green} disabled={completed || !unlocked} onPress={onComplete}>
        {buttonLabel}
      </NeoButton>
    </NeoCard>
  );
}

const styles = StyleSheet.create({
  coursePressed: {
    transform: [{ translateX: 3 }, { translateY: 3 }],
  },
  courseCard: {
    gap: 12,
  },
  courseTop: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
  },
  courseDays: {
    color: theme.color.ink,
    fontFamily: theme.font.mono,
    fontSize: 11,
    textTransform: 'uppercase',
  },
  courseTitle: {
    color: theme.color.ink,
    fontFamily: theme.font.mono,
    fontSize: 21,
    lineHeight: 29,
  },
  courseSource: {
    color: theme.color.ink,
    fontFamily: theme.font.mono,
    fontSize: 12,
    textTransform: 'uppercase',
  },
  progressHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between',
  },
  progressLabel: {
    color: theme.color.ink,
    flexShrink: 1,
    fontFamily: theme.font.mono,
    fontSize: 11,
    textTransform: 'uppercase',
  },
  openRow: {
    alignItems: 'center',
    borderColor: theme.color.ink,
    borderRadius: theme.border.radius,
    borderWidth: 2,
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
    minHeight: 42,
    paddingHorizontal: 12,
  },
  openText: {
    color: theme.color.ink,
    flex: 1,
    fontFamily: theme.font.mono,
    fontSize: 12,
    lineHeight: 18,
    textTransform: 'uppercase',
  },
  activeCourseCard: {
    gap: 12,
  },
  courseAction: {
    color: theme.color.ink,
    fontFamily: theme.font.mono,
    fontSize: 20,
    lineHeight: 28,
  },
  playerCard: {
    gap: 14,
  },
  playerFrame: {
    backgroundColor: theme.color.ink,
    borderColor: theme.color.ink,
    borderRadius: theme.border.radius,
    borderWidth: theme.border.width,
    minHeight: 220,
    overflow: 'hidden',
  },
  lessonTitle: {
    color: theme.color.ink,
    fontFamily: theme.font.mono,
    fontSize: 22,
    lineHeight: 30,
  },
  lessonMeta: {
    color: theme.color.muted,
    fontFamily: theme.font.mono,
    fontSize: 12,
    lineHeight: 18,
  },
  timestampGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  timestampChip: {
    backgroundColor: theme.color.white,
    borderColor: theme.color.ink,
    borderRadius: theme.border.radius,
    borderWidth: 2,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  timestampChipActive: {
    backgroundColor: theme.color.yellow,
  },
  timestampText: {
    color: theme.color.ink,
    fontFamily: theme.font.mono,
    fontSize: 11,
    textTransform: 'uppercase',
  },
  panelBody: {
    backgroundColor: theme.color.paper,
    borderColor: theme.color.ink,
    borderRadius: theme.border.radius,
    borderWidth: 2,
    padding: 14,
  },
  moduleBlock: {
    backgroundColor: theme.color.white,
    borderColor: theme.color.ink,
    borderRadius: theme.border.radius,
    borderWidth: 2,
    padding: 12,
  },
  moduleGap: {
    marginBottom: 12,
  },
  moduleHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
  },
  moduleCopy: {
    flex: 1,
  },
  moduleTitle: {
    color: theme.color.ink,
    fontFamily: theme.font.mono,
    fontSize: 14,
    lineHeight: 20,
  },
  moduleObjective: {
    color: theme.color.muted,
    fontFamily: theme.font.mono,
    fontSize: 11,
    lineHeight: 17,
    marginTop: 8,
  },
  lessonRow: {
    alignItems: 'center',
    borderColor: theme.color.ink,
    borderRadius: theme.border.radius,
    borderWidth: 2,
    flexDirection: 'row',
    marginTop: 10,
    minHeight: 56,
    padding: 10,
  },
  lessonRowActive: {
    backgroundColor: theme.color.yellow,
  },
  lessonCheck: {
    alignItems: 'center',
    backgroundColor: theme.color.white,
    borderColor: theme.color.ink,
    borderRadius: theme.border.radius,
    borderWidth: 2,
    height: 20,
    justifyContent: 'center',
    marginRight: 10,
    width: 20,
  },
  lessonCheckComplete: {
    backgroundColor: theme.color.green,
  },
  lessonCopy: {
    flex: 1,
  },
  lessonName: {
    color: theme.color.ink,
    fontFamily: theme.font.mono,
    fontSize: 12,
    lineHeight: 18,
  },
  lessonMetaSmall: {
    color: theme.color.muted,
    fontFamily: theme.font.mono,
    fontSize: 10,
    marginTop: 3,
    textTransform: 'uppercase',
  },
  dayBlock: {
    backgroundColor: theme.color.white,
    borderColor: theme.color.ink,
    borderRadius: theme.border.radius,
    borderWidth: 2,
    marginBottom: 12,
    padding: 12,
  },
  dayBlockActive: {
    backgroundColor: theme.color.softBlue,
    borderWidth: theme.border.width,
  },
  dayBlockPressed: {
    transform: [{ translateX: 2 }, { translateY: 2 }],
  },
  dayTitle: {
    color: theme.color.ink,
    fontFamily: theme.font.mono,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 12,
    marginTop: 12,
  },
  dayTitleActive: {
    color: theme.color.ink,
  },
  dayMetaActive: {
    color: theme.color.ink,
  },
  noteSummary: {
    color: theme.color.ink,
    fontFamily: theme.font.mono,
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 12,
  },
  noteRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    marginBottom: 10,
  },
  noteBullet: {
    backgroundColor: theme.color.pink,
    borderColor: theme.color.ink,
    borderRadius: theme.border.radius,
    borderWidth: 2,
    height: 14,
    marginRight: 9,
    marginTop: 4,
    width: 14,
  },
  noteText: {
    color: theme.color.ink,
    flex: 1,
    fontFamily: theme.font.mono,
    fontSize: 12,
    lineHeight: 19,
  },
  termGrid: {
    gap: 10,
    marginTop: 8,
  },
  termCard: {
    backgroundColor: theme.color.softBlue,
    borderColor: theme.color.ink,
    borderRadius: theme.border.radius,
    borderWidth: 2,
    padding: 10,
  },
  termTitle: {
    color: theme.color.ink,
    fontFamily: theme.font.mono,
    fontSize: 12,
    textTransform: 'uppercase',
  },
  termDefinition: {
    color: theme.color.ink,
    fontFamily: theme.font.mono,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 5,
  },
  questionBlock: {
    marginBottom: 16,
  },
  quizQuestion: {
    color: theme.color.ink,
    fontFamily: theme.font.mono,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 12,
  },
  answerRow: {
    alignItems: 'center',
    backgroundColor: theme.color.white,
    borderColor: theme.color.ink,
    borderRadius: theme.border.radius,
    borderWidth: 2,
    flexDirection: 'row',
    marginBottom: 10,
    minHeight: 56,
    paddingHorizontal: 12,
  },
  answerRowActive: {
    backgroundColor: theme.color.yellow,
  },
  answerRowCorrect: {
    backgroundColor: theme.color.green,
  },
  answerRowWrong: {
    backgroundColor: theme.color.red,
  },
  answerRadio: {
    backgroundColor: theme.color.white,
    borderColor: theme.color.ink,
    borderRadius: theme.border.radius,
    borderWidth: 2,
    height: 18,
    marginRight: 10,
    width: 18,
  },
  answerRadioActive: {
    backgroundColor: theme.color.green,
  },
  answerText: {
    color: theme.color.ink,
    flex: 1,
    fontFamily: theme.font.mono,
    fontSize: 12,
    lineHeight: 18,
  },
  explanation: {
    color: theme.color.muted,
    fontFamily: theme.font.mono,
    fontSize: 12,
    lineHeight: 18,
  },
  scoreCard: {
    marginBottom: 10,
    padding: 12,
  },
  scoreText: {
    color: theme.color.ink,
    fontFamily: theme.font.mono,
    fontSize: 16,
    textTransform: 'uppercase',
  },
  completionCard: {
    gap: 14,
  },
  completionCopy: {
    gap: 6,
  },
  completionTitle: {
    color: theme.color.ink,
    fontFamily: theme.font.mono,
    fontSize: 18,
  },
  completionText: {
    color: theme.color.ink,
    fontFamily: theme.font.mono,
    fontSize: 12,
    lineHeight: 18,
  },
});
