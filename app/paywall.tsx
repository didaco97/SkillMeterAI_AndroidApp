import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { PageHeader, ScreenShell } from '@/components/AppScaffold';
import { NeoButton, NeoCard, Tag } from '@/components/Neo';
import { theme } from '@/constants/skillmeterTheme';
import { useSkillmeterStore } from '@/stores/useSkillmeterStore';

const rows = [
  { label: 'One Shot Mode', free: '2/month', pro: 'Unlimited' },
  { label: 'Playlist Mode', free: '1/month', pro: 'Unlimited' },
  { label: 'AI Notes', free: 'Basic', pro: 'Full structured' },
  { label: 'Quizzes', free: '3 questions', pro: 'Full quiz' },
  { label: 'Progress Sync', free: 'Local', pro: 'Cloud sync' },
];

export default function PaywallScreen() {
  const upgradeToPro = useSkillmeterStore((state) => state.upgradeToPro);

  function handleUpgrade() {
    upgradeToPro();
    router.replace('/profile');
  }

  return (
    <ScreenShell>
      <PageHeader
        backAction={() => router.back()}
        title="Go Pro"
        caption="Unlock unlimited course generation when free limits are reached."
        badge={<Tag color={theme.color.pink}>$8/mo</Tag>}
      />

      <NeoCard color={theme.color.yellow} contentStyle={styles.heroCard}>
        <Text style={styles.heroTitle}>Keep building courses without waiting for next month.</Text>
        <Text style={styles.heroCopy}>The frontend is wired for subscription state now. Payments can connect to Stripe or RevenueCat when the backend is ready.</Text>
      </NeoCard>

      <NeoCard color={theme.color.white} contentStyle={styles.tableCard}>
        <View style={styles.tableHeader}>
          <Text style={styles.headerText}>Feature</Text>
          <Text style={styles.headerText}>Free</Text>
          <Text style={styles.headerText}>Pro</Text>
        </View>
        {rows.map((row) => (
          <View key={row.label} style={styles.tableRow}>
            <Text style={styles.rowLabel}>{row.label}</Text>
            <Text style={styles.rowText}>{row.free}</Text>
            <Text style={styles.rowText}>{row.pro}</Text>
          </View>
        ))}
      </NeoCard>

      <NeoButton color={theme.color.green} onPress={handleUpgrade}>
        Activate Pro demo
      </NeoButton>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    gap: 12,
  },
  heroTitle: {
    color: theme.color.ink,
    fontFamily: theme.font.mono,
    fontSize: 25,
    lineHeight: 34,
  },
  heroCopy: {
    color: theme.color.ink,
    fontFamily: theme.font.mono,
    fontSize: 13,
    lineHeight: 20,
  },
  tableCard: {
    gap: 0,
    padding: 0,
  },
  tableHeader: {
    backgroundColor: theme.color.cyan,
    borderBottomColor: theme.color.ink,
    borderBottomWidth: 2,
    flexDirection: 'row',
    padding: 12,
  },
  tableRow: {
    borderBottomColor: theme.color.ink,
    borderBottomWidth: 2,
    flexDirection: 'row',
    padding: 12,
  },
  headerText: {
    color: theme.color.ink,
    flex: 1,
    fontFamily: theme.font.mono,
    fontSize: 12,
    textTransform: 'uppercase',
  },
  rowLabel: {
    color: theme.color.ink,
    flex: 1,
    fontFamily: theme.font.mono,
    fontSize: 12,
    lineHeight: 18,
  },
  rowText: {
    color: theme.color.ink,
    flex: 1,
    fontFamily: theme.font.mono,
    fontSize: 12,
    lineHeight: 18,
  },
});
