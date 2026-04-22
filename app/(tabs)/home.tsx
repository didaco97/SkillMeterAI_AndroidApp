import FontAwesome from '@expo/vector-icons/FontAwesome';
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  EmptyState,
  ErrorState,
  LoadingState,
  PageHeader,
  ProcessingStepList,
  ScreenShell,
  SegmentedControl,
  TextInputField,
} from '@/components/AppScaffold';
import { CourseCard } from '@/components/CourseUI';
import { NeoButton, NeoCard, SectionTitle, StatBlock, Tag } from '@/components/Neo';
import { theme } from '@/constants/skillmeterTheme';
import { validateYoutubeUrl } from '@/lib/youtube';
import { useSkillmeterStore } from '@/stores/useSkillmeterStore';
import type { CourseMode } from '@/types/skillmeter';

const timeOptions = [20, 30, 45, 60];

export default function HomeScreen() {
  const [mode, setMode] = useState<CourseMode>('oneshot');
  const [dailyMinutes, setDailyMinutes] = useState(30);
  const [url, setUrl] = useState('https://youtube.com/watch?v=dQw4w9WgXcQ');
  const [urlError, setUrlError] = useState('');
  const isAuthenticated = useSkillmeterStore((state) => state.isAuthenticated);
  const profile = useSkillmeterStore((state) => state.profile);
  const usage = useSkillmeterStore((state) => state.usage);
  const stats = useSkillmeterStore((state) => state.stats);
  const courses = useSkillmeterStore((state) => state.courses);
  const progress = useSkillmeterStore((state) => state.progress);
  const courseStatus = useSkillmeterStore((state) => state.courseStatus);
  const generationStatus = useSkillmeterStore((state) => state.generationStatus);
  const playlistStatus = useSkillmeterStore((state) => state.playlistStatus);
  const generationSteps = useSkillmeterStore((state) => state.generationSteps);
  const playlistPreview = useSkillmeterStore((state) => state.playlistPreview);
  const error = useSkillmeterStore((state) => state.error);
  const loadDashboard = useSkillmeterStore((state) => state.loadDashboard);
  const createGeneratedCourse = useSkillmeterStore((state) => state.createGeneratedCourse);
  const loadPlaylistPreview = useSkillmeterStore((state) => state.loadPlaylistPreview);
  const togglePlaylistVideo = useSkillmeterStore((state) => state.togglePlaylistVideo);
  const clearPlaylistPreview = useSkillmeterStore((state) => state.clearPlaylistPreview);

  const recentCourse = courses[0];
  const recentProgress = recentCourse ? progress.find((item) => item.courseId === recentCourse.id) : undefined;
  const selectedPlaylistVideoCount = playlistPreview?.videos.filter((video) => video.selected).length ?? 0;
  const usageLabel = useMemo(() => {
    if (!usage) {
      return 'Free plan';
    }

    return mode === 'oneshot'
      ? `${Math.max(0, usage.oneshotLimit - usage.oneshotUsed)} free left`
      : `${Math.max(0, usage.playlistLimit - usage.playlistUsed)} free left`;
  }, [mode, usage]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }

    if (courseStatus === 'idle' && courses.length === 0) {
      loadDashboard();
    }
  }, [courseStatus, courses.length, isAuthenticated, loadDashboard]);

  async function handleGenerate() {
    const validation = validateYoutubeUrl(url, mode);
    if (!validation.ok) {
      setUrlError(validation.message);
      return;
    }

    setUrlError('');

    try {
      if (mode === 'playlist' && !playlistPreview) {
        await loadPlaylistPreview(validation.normalizedUrl);
        return;
      }

      const selectedVideoIds = playlistPreview?.videos.filter((video) => video.selected).map((video) => video.id);
      if (mode === 'playlist' && playlistPreview && selectedPlaylistVideoCount === 0) {
        return;
      }

      const course = await createGeneratedCourse({
        mode,
        sourceUrl: validation.normalizedUrl,
        dailyMinutes,
        selectedVideoIds,
      });
      clearPlaylistPreview();
      router.push({ pathname: '/learn', params: { courseId: course.id } });
    } catch {
      // Error state is stored globally for the shared ErrorState and paywall prompt.
    }
  }

  return (
    <ScreenShell keyboardShouldPersistTaps="handled">
      <PageHeader
        title="Skillmeter App"
        caption={`AI course builder for YouTube${profile ? ` - ${profile.name}` : ''}`}
        badge={<Tag color={theme.color.pink}>{usageLabel}</Tag>}
      />

      <NeoCard color={theme.color.yellow} contentStyle={styles.heroCard}>
        <Text style={styles.heroTitle}>Turn any long video into a day-by-day course.</Text>
        <Text style={styles.heroCopy}>
          Paste a YouTube link, set your daily time, and get sections, notes, quizzes, and progress tracking.
        </Text>
      </NeoCard>

      <View style={styles.statsRow}>
        <StatBlock color={theme.color.cyan} icon="fire" label="Streak" value={`${stats?.currentStreak ?? 0} days`} />
        <StatBlock color={theme.color.green} icon="clock-o" label="Minutes" value={`${stats?.totalLearningMinutes ?? 0}`} />
      </View>

      <SectionTitle eyebrow="Create" title="Choose your source" aside={usageLabel} />
      <NeoCard color={theme.color.white} contentStyle={styles.formCard}>
        <SegmentedControl
          options={[
            { label: 'One Shot', value: 'oneshot', color: theme.color.cyan },
            { label: 'Playlist', value: 'playlist', color: theme.color.pink },
          ]}
          value={mode}
          onChange={(nextMode) => {
            setMode(nextMode);
            setUrlError('');
            clearPlaylistPreview();
          }}
        />

        <TextInputField
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
          label={mode === 'oneshot' ? 'YouTube video URL' : 'YouTube playlist URL'}
          onChangeText={(value) => {
            setUrl(value);
            setUrlError('');
            if (playlistPreview) {
              clearPlaylistPreview();
            }
          }}
          value={url}
          error={urlError}
        />

        <Text style={styles.inputLabel}>Daily learning time</Text>
        <SegmentedControl
          options={timeOptions.map((minutes) => ({
            label: `${minutes}m`,
            value: minutes,
            color: theme.color.yellow,
          }))}
          value={dailyMinutes}
          onChange={setDailyMinutes}
        />

        {mode === 'playlist' && playlistStatus === 'loading' ? <LoadingState label="Fetching playlist preview" /> : null}
        {playlistPreview ? (
          <NeoCard color={theme.color.softBlue} contentStyle={styles.previewCard}>
            <View style={styles.previewHeader}>
              <Text style={styles.previewTitle}>{playlistPreview.title}</Text>
              <Tag color={theme.color.white}>{playlistPreview.videos.length} videos</Tag>
            </View>
            {playlistPreview.videos.map((video) => (
              <Pressable
                accessibilityRole="checkbox"
                key={video.id}
                onPress={() => togglePlaylistVideo(video.id)}
                style={styles.videoRow}>
                <View style={[styles.videoCheck, video.selected && styles.videoCheckActive]}>
                  {video.selected ? <FontAwesome color={theme.color.ink} name="check" size={11} /> : null}
                </View>
                <View style={styles.videoCopy}>
                  <Text style={styles.videoTitle}>{video.title}</Text>
                  <Text style={styles.videoMeta}>{video.durationMinutes} minutes</Text>
                </View>
              </Pressable>
            ))}
            {selectedPlaylistVideoCount === 0 ? (
              <Text style={styles.helperError}>Select at least one playlist video to build the course.</Text>
            ) : null}
          </NeoCard>
        ) : null}

        <NeoButton
          color={theme.color.green}
          disabled={generationStatus === 'loading' || (mode === 'playlist' && !!playlistPreview && selectedPlaylistVideoCount === 0)}
          onPress={handleGenerate}>
          {mode === 'playlist' && !playlistPreview
            ? 'Preview playlist'
            : generationStatus === 'loading'
              ? 'Building course'
              : 'Generate course plan'}
        </NeoButton>
      </NeoCard>

      {generationStatus === 'loading' ? (
        <>
          <SectionTitle eyebrow="Processing" title="AI build status" />
          <ProcessingStepList steps={generationSteps} />
        </>
      ) : null}

      <ErrorState
        error={error}
        onRetry={error?.code === 'payment_required' ? () => router.push('/paywall') : undefined}
      />

      <SectionTitle eyebrow="Ready course" title="Your next session" />
      {recentCourse ? (
        <CourseCard
          course={recentCourse}
          progress={recentProgress}
          onPress={() => router.push({ pathname: '/learn', params: { courseId: recentCourse.id } })}
        />
      ) : (
        <EmptyState
          copy="Generate your first YouTube course above. It will appear here with progress and the next section."
          icon="rocket"
          title="No courses yet"
        />
      )}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    padding: 18,
  },
  heroTitle: {
    color: theme.color.ink,
    fontFamily: theme.font.mono,
    fontSize: 31,
    lineHeight: 40,
  },
  heroCopy: {
    color: theme.color.ink,
    fontFamily: theme.font.mono,
    fontSize: 13,
    lineHeight: 20,
    marginTop: 12,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 18,
    marginTop: 18,
  },
  formCard: {
    gap: 14,
  },
  inputLabel: {
    color: theme.color.ink,
    fontFamily: theme.font.mono,
    fontSize: 12,
    textTransform: 'uppercase',
  },
  previewCard: {
    gap: 10,
  },
  helperError: {
    color: theme.color.ink,
    fontFamily: theme.font.mono,
    fontSize: 11,
    lineHeight: 16,
  },
  previewHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
  },
  previewTitle: {
    color: theme.color.ink,
    flex: 1,
    fontFamily: theme.font.mono,
    fontSize: 16,
    lineHeight: 23,
  },
  videoRow: {
    alignItems: 'center',
    backgroundColor: theme.color.white,
    borderColor: theme.color.ink,
    borderRadius: theme.border.radius,
    borderWidth: 2,
    flexDirection: 'row',
    minHeight: 58,
    paddingHorizontal: 10,
  },
  videoCheck: {
    alignItems: 'center',
    backgroundColor: theme.color.white,
    borderColor: theme.color.ink,
    borderRadius: theme.border.radius,
    borderWidth: 2,
    height: 22,
    justifyContent: 'center',
    marginRight: 10,
    width: 22,
  },
  videoCheckActive: {
    backgroundColor: theme.color.green,
  },
  videoCopy: {
    flex: 1,
  },
  videoTitle: {
    color: theme.color.ink,
    fontFamily: theme.font.mono,
    fontSize: 12,
    lineHeight: 18,
  },
  videoMeta: {
    color: theme.color.muted,
    fontFamily: theme.font.mono,
    fontSize: 11,
    marginTop: 3,
  },
});
