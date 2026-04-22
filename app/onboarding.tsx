import FontAwesome from '@expo/vector-icons/FontAwesome';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { NeoButton, NeoCard, ProgressBar, Tag } from '@/components/Neo';
import { theme } from '@/constants/skillmeterTheme';
import { useSkillmeterStore } from '@/stores/useSkillmeterStore';

const slides = [
  {
    color: theme.color.yellow,
    icon: 'youtube-play',
    title: 'Turn any long lesson into a daily study route',
    copy: 'Paste one YouTube video or a playlist and Skillmeter App breaks it into sessions you can actually finish on Android.',
    shortLabel: 'Paste',
    previewTag: 'Day 1',
    previewMeta: '13 min tutorial',
    previewTitle: 'Python setup + mental model',
    previewProgress: 0.28,
  },
  {
    color: theme.color.cyan,
    icon: 'magic',
    title: 'Get sections, notes, quizzes, and timestamps automatically',
    copy: 'The study structure is generated for you, so each day starts with a clear lesson instead of another search spiral.',
    shortLabel: 'Build',
    previewTag: 'Auto notes',
    previewMeta: 'Generated study structure',
    previewTitle: 'Sections, notes, and quiz appear for every lesson',
    previewProgress: 0.62,
  },
  {
    color: theme.color.pink,
    icon: 'check-square-o',
    title: 'Keep momentum with a course that moves with you',
    copy: 'Open the Learn tab, continue the current lesson, finish the day, and come back to the next step without losing your place.',
    shortLabel: 'Learn',
    previewTag: 'Resume',
    previewMeta: 'Current ongoing course',
    previewTitle: 'Continue section 2 and move straight to the next day',
    previewProgress: 0.84,
  },
];

export default function OnboardingScreen() {
  const [index, setIndex] = useState(0);
  const completeOnboarding = useSkillmeterStore((state) => state.completeOnboarding);
  const slide = slides[index];
  const isLast = index === slides.length - 1;

  function goNext() {
    if (isLast) {
      completeOnboarding();
      router.push('/signup');
      return;
    }

    setIndex((currentIndex) => currentIndex + 1);
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <View>
            <Text style={styles.brand}>Skillmeter App</Text>
            <Text style={styles.caption}>Your YouTube learning system</Text>
          </View>
          <Pressable
            onPress={() => {
              completeOnboarding();
              router.push('/login');
            }}
            style={styles.skipButton}>
            <Text style={styles.skipText}>Log in</Text>
          </Pressable>
        </View>

        <NeoCard color={slide.color} contentStyle={styles.heroCard}>
          <View style={styles.heroContent}>
            <View style={styles.heroHeader}>
              <View style={styles.iconBox}>
                <FontAwesome color={theme.color.ink} name={slide.icon as React.ComponentProps<typeof FontAwesome>['name']} size={24} />
              </View>
              <View style={styles.heroTagRow}>
                <Tag color={theme.color.white}>Android beta</Tag>
                <Tag color={theme.color.white}>{`Step ${index + 1} of ${slides.length}`}</Tag>
              </View>
            </View>

            <Text style={styles.heroTitle}>{slide.title}</Text>
            <Text style={styles.heroCopy}>{slide.copy}</Text>

            <View style={styles.heroPreview}>
              <View style={styles.heroPreviewTop}>
                <View>
                  <Text style={styles.heroPreviewLabel}>Active course</Text>
                  <Text style={styles.heroPreviewMeta}>{slide.previewMeta}</Text>
                </View>
                <Tag color={theme.color.white}>{slide.previewTag}</Tag>
              </View>

              <Text style={styles.heroPreviewTitle}>{slide.previewTitle}</Text>

              <View style={styles.heroPreviewProgress}>
                <ProgressBar color={theme.color.green} height={16} value={slide.previewProgress} />
              </View>
            </View>

            <View style={styles.heroSignalRow}>
              <View style={styles.heroSignalItem}>
                <Text style={styles.heroSignalLabel}>One Shot</Text>
                <Text style={styles.heroSignalValue}>Daily video route</Text>
              </View>
              <View style={styles.heroSignalItem}>
                <Text style={styles.heroSignalLabel}>Playlist</Text>
                <Text style={styles.heroSignalValue}>Module roadmap</Text>
              </View>
            </View>
          </View>
        </NeoCard>

        <View style={styles.progressWrap}>
          <View style={styles.stepRail}>
            {slides.map((item, itemIndex) => {
              const active = itemIndex === index;
              return (
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  key={item.title}
                  onPress={() => setIndex(itemIndex)}
                  style={[
                    styles.stepChip,
                    active && { backgroundColor: item.color },
                  ]}>
                  <Text style={styles.stepNumber}>{`0${itemIndex + 1}`}</Text>
                  <Text style={styles.stepLabel}>{item.shortLabel}</Text>
                </Pressable>
              );
            })}
          </View>
          <ProgressBar color={slide.color} value={(index + 1) / slides.length} />
        </View>

        <NeoCard color={theme.color.white} contentStyle={styles.modeCard}>
          <Text style={styles.panelTitle}>Built for your study loop</Text>

          <BenefitRow
            icon="calendar-check-o"
            title="Daily sessions"
            copy="A long lesson becomes a route you can continue without guessing what to study next."
            color={theme.color.green}
          />
          <BenefitRow
            icon="sticky-note-o"
            title="Notes + checkpoints"
            copy="Every section carries timestamps, notes, and quizzes so the Learn tab feels complete from day one."
            color={theme.color.cyan}
          />
          <BenefitRow
            icon="line-chart"
            title="Progress that sticks"
            copy="Your active course, current section, and completion state stay visible instead of getting buried."
            color={theme.color.pink}
          />
        </NeoCard>

        <View style={styles.actionRow}>
          {index > 0 ? (
            <NeoButton color={theme.color.white} onPress={() => setIndex((currentIndex) => Math.max(0, currentIndex - 1))} style={styles.secondaryAction}>
              Back
            </NeoButton>
          ) : null}
          <NeoButton color={theme.color.green} onPress={goNext} style={styles.primaryAction}>
            {isLast ? 'Create account' : 'Next step'}
          </NeoButton>
        </View>

        <Pressable
          onPress={() => {
            completeOnboarding();
            router.push('/login');
          }}
          style={styles.loginLink}>
          <Text style={styles.loginText}>I already have an account</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function BenefitRow({
  icon,
  title,
  copy,
  color,
}: {
  icon: React.ComponentProps<typeof FontAwesome>['name'];
  title: string;
  copy: string;
  color: string;
}) {
  return (
    <View style={styles.benefitRow}>
      <View style={[styles.benefitIcon, { backgroundColor: color }]}>
        <FontAwesome color={theme.color.ink} name={icon} size={18} />
      </View>
      <View style={styles.benefitCopy}>
        <Text style={styles.benefitTitle}>{title}</Text>
        <Text style={styles.benefitText}>{copy}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: theme.color.paper,
    flex: 1,
  },
  content: {
    padding: 18,
    paddingBottom: 40,
  },
  topBar: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  brand: {
    color: theme.color.ink,
    fontFamily: theme.font.mono,
    fontSize: 25,
    textTransform: 'uppercase',
  },
  caption: {
    color: theme.color.muted,
    fontFamily: theme.font.mono,
    fontSize: 12,
    marginTop: 4,
  },
  skipButton: {
    backgroundColor: theme.color.white,
    borderColor: theme.color.ink,
    borderRadius: theme.border.radius,
    borderWidth: 2,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  skipText: {
    color: theme.color.ink,
    fontFamily: theme.font.mono,
    fontSize: 11,
    textTransform: 'uppercase',
  },
  heroCard: {
    padding: 0,
  },
  heroContent: {
    gap: 14,
    paddingHorizontal: 18,
    paddingBottom: 18,
    paddingTop: 20,
  },
  heroHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  heroTagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'flex-end',
  },
  iconBox: {
    alignItems: 'center',
    backgroundColor: theme.color.white,
    borderColor: theme.color.ink,
    borderRadius: theme.border.radius,
    borderWidth: theme.border.width,
    height: 68,
    justifyContent: 'center',
    width: 60,
  },
  heroTitle: {
    color: theme.color.ink,
    fontFamily: theme.font.mono,
    fontSize: 32,
    lineHeight: 40,
  },
  heroCopy: {
    color: theme.color.ink,
    fontFamily: theme.font.mono,
    fontSize: 13,
    lineHeight: 21,
  },
  heroPreview: {
    backgroundColor: theme.color.paper,
    borderColor: theme.color.ink,
    borderWidth: 2,
    gap: 12,
    padding: 14,
  },
  heroPreviewTop: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
  },
  heroPreviewLabel: {
    color: theme.color.muted,
    fontFamily: theme.font.mono,
    fontSize: 10,
    textTransform: 'uppercase',
  },
  heroPreviewMeta: {
    color: theme.color.ink,
    fontFamily: theme.font.mono,
    fontSize: 12,
    marginTop: 4,
    textTransform: 'uppercase',
  },
  heroPreviewTitle: {
    color: theme.color.ink,
    fontFamily: theme.font.mono,
    fontSize: 22,
    lineHeight: 31,
  },
  heroPreviewProgress: {
    marginTop: 2,
  },
  heroSignalRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  heroSignalItem: {
    borderLeftColor: theme.color.ink,
    borderLeftWidth: 3,
    flexBasis: '48%',
    flexGrow: 1,
    minWidth: 120,
    paddingLeft: 10,
  },
  heroSignalLabel: {
    color: theme.color.muted,
    fontFamily: theme.font.mono,
    fontSize: 10,
    textTransform: 'uppercase',
  },
  heroSignalValue: {
    color: theme.color.ink,
    fontFamily: theme.font.mono,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
  },
  progressWrap: {
    gap: 12,
    marginBottom: 18,
    marginTop: 18,
  },
  stepRail: {
    flexDirection: 'row',
    gap: 8,
  },
  stepChip: {
    backgroundColor: theme.color.white,
    borderColor: theme.color.ink,
    borderRadius: theme.border.radius,
    borderWidth: 2,
    flex: 1,
    minHeight: 54,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  modeCard: {
    gap: 18,
    marginBottom: 18,
  },
  panelTitle: {
    color: theme.color.ink,
    fontFamily: theme.font.mono,
    fontSize: 18,
    lineHeight: 24,
    textTransform: 'uppercase',
  },
  benefitRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  benefitIcon: {
    alignItems: 'center',
    borderColor: theme.color.ink,
    borderWidth: 2,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  benefitCopy: {
    flex: 1,
  },
  benefitTitle: {
    color: theme.color.ink,
    fontFamily: theme.font.mono,
    fontSize: 13,
    textTransform: 'uppercase',
  },
  benefitText: {
    color: theme.color.ink,
    flex: 1,
    fontFamily: theme.font.mono,
    fontSize: 12,
    lineHeight: 18,
  },
  stepNumber: {
    color: theme.color.muted,
    fontFamily: theme.font.mono,
    fontSize: 10,
    textTransform: 'uppercase',
  },
  stepLabel: {
    color: theme.color.ink,
    fontFamily: theme.font.mono,
    fontSize: 14,
    marginTop: 6,
    textTransform: 'uppercase',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 4,
  },
  secondaryAction: {
    minWidth: 112,
  },
  primaryAction: {
    flex: 1,
  },
  loginLink: {
    alignItems: 'center',
    marginTop: 10,
    paddingVertical: 12,
  },
  loginText: {
    color: theme.color.ink,
    fontFamily: theme.font.mono,
    fontSize: 12,
    textDecorationLine: 'underline',
    textTransform: 'uppercase',
  },
});

