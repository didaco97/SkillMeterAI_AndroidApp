import { StatusBar } from 'expo-status-bar';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { NeoCard, SectionTitle, Tag } from '@/components/Neo';
import { theme } from '@/constants/skillmeterTheme';

const roadmap = [
  'Supabase auth and Edge Functions',
  'YouTube transcript ingestion',
  'OpenAI section, notes, and quiz generation',
  'Progress sync, streaks, and reminders',
];

export default function ModalScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.content}>
        <SectionTitle eyebrow="Product map" title="Skillmeter App roadmap" />
        <NeoCard color={theme.color.yellow}>
          <Tag color={theme.color.white}>Phase 1</Tag>
          <Text style={styles.title}>Android-first course builder</Text>
          <Text style={styles.copy}>
            The UI is shaped around the PRD flow: paste a YouTube link, generate a structured plan,
            learn by daily sessions, review notes, and finish quizzes.
          </Text>
        </NeoCard>

        <NeoCard color={theme.color.softBlue}>
          {roadmap.map((item) => (
            <View key={item} style={styles.row}>
              <View style={styles.dot} />
              <Text style={styles.rowText}>{item}</Text>
            </View>
          ))}
        </NeoCard>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: theme.color.paper,
    flex: 1,
  },
  content: {
    padding: 18,
  },
  title: {
    color: theme.color.ink,
    fontFamily: theme.font.mono,
    fontSize: 24,
    lineHeight: 32,
    marginTop: 16,
  },
  copy: {
    color: theme.color.ink,
    fontFamily: theme.font.mono,
    fontSize: 13,
    lineHeight: 21,
    marginTop: 12,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 12,
  },
  dot: {
    backgroundColor: theme.color.pink,
    borderColor: theme.color.ink,
    borderRadius: theme.border.radius,
    borderWidth: 2,
    height: 16,
    marginRight: 10,
    width: 16,
  },
  rowText: {
    color: theme.color.ink,
    flex: 1,
    fontFamily: theme.font.mono,
    fontSize: 13,
    lineHeight: 19,
  },
});


