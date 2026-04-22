import FontAwesome from '@expo/vector-icons/FontAwesome';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ErrorState, PageHeader, ScreenShell, SegmentedControl } from '@/components/AppScaffold';
import { NeoButton, NeoCard, ProgressBar, SectionTitle, StatBlock, Tag } from '@/components/Neo';
import { theme } from '@/constants/skillmeterTheme';
import { useSkillmeterStore } from '@/stores/useSkillmeterStore';

const reminderTimes = ['08:30', '20:30', '22:00'];

export default function ProfileScreen() {
  const profile = useSkillmeterStore((state) => state.profile);
  const usage = useSkillmeterStore((state) => state.usage);
  const stats = useSkillmeterStore((state) => state.stats);
  const error = useSkillmeterStore((state) => state.error);
  const signOut = useSkillmeterStore((state) => state.signOut);
  const updateNotificationSettings = useSkillmeterStore((state) => state.updateNotificationSettings);

  async function handleSignOut() {
    await signOut();
    router.replace('/login');
  }

  const initials = profile?.name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'SK';

  return (
    <ScreenShell>
      <PageHeader
        title="Profile"
        caption="Progress, plan, and reminders"
        badge={<Tag color={theme.color.green}>{stats?.currentStreak ?? profile?.streakCount ?? 0} day streak</Tag>}
      />

      <NeoCard color={theme.color.cyan} contentStyle={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <View style={styles.profileCopy}>
          <Text style={styles.name}>{profile?.name ?? 'Skillmeter learner'}</Text>
          <Text style={styles.email}>{profile?.email ?? 'learner@skillmeter.app'}</Text>
        </View>
      </NeoCard>

      <View style={styles.statsRow}>
        <StatBlock color={theme.color.yellow} icon="book" label="Courses" value={`${stats?.totalCourses ?? 0}`} />
        <StatBlock color={theme.color.pink} icon="check-square-o" label="Sections" value={`${stats?.completedSections ?? 0}`} />
      </View>

      <SectionTitle eyebrow="Progress" title="Weekly streak" />
      <NeoCard color={theme.color.white} contentStyle={styles.weekCard}>
        <View style={styles.weekGrid}>
          {(stats?.weeklyActivity ?? [false, false, false, false, false, false, false]).map((active, index) => (
            <View key={index} style={[styles.weekDay, active && styles.weekDayActive]}>
              <Text style={styles.weekDayText}>{['M', 'T', 'W', 'T', 'F', 'S', 'S'][index]}</Text>
            </View>
          ))}
        </View>
        <Text style={styles.weekCopy}>
          Longest streak: {stats?.longestStreak ?? profile?.longestStreak ?? 0} days. Learning time: {stats?.totalLearningMinutes ?? 0} minutes.
        </Text>
      </NeoCard>

      <SectionTitle eyebrow="Subscription" title="Freemium limits" />
      <NeoCard color={theme.color.white} contentStyle={styles.planCard}>
        <View style={styles.planHeader}>
          <View style={styles.planCopy}>
            <Text style={styles.planTitle}>{profile?.plan === 'pro' ? 'Pro plan' : 'Free plan'}</Text>
            <Text style={styles.planSub}>
              {profile?.plan === 'pro' ? 'Unlimited generation is active.' : 'Upgrade when the playlist habit sticks.'}
            </Text>
          </View>
          <Tag color={profile?.plan === 'pro' ? theme.color.green : theme.color.yellow}>
            {profile?.plan === 'pro' ? 'Pro' : 'Free'}
          </Tag>
        </View>

        <UsageRow
          color={theme.color.cyan}
          label="One Shot videos"
          used={`${usage?.oneshotUsed ?? 0} of ${usage?.oneshotLimit ?? 2}`}
          value={(usage?.oneshotUsed ?? 0) / (usage?.oneshotLimit ?? 2)}
        />
        <UsageRow
          color={theme.color.pink}
          label="Playlist courses"
          used={`${usage?.playlistUsed ?? 0} of ${usage?.playlistLimit ?? 1}`}
          value={(usage?.playlistUsed ?? 0) / (usage?.playlistLimit ?? 1)}
        />
        <UsageRow
          color={theme.color.green}
          label="AI quizzes"
          used={`${usage?.quizUsed ?? 0} of ${usage?.quizLimit ?? 18}`}
          value={(usage?.quizUsed ?? 0) / (usage?.quizLimit ?? 18)}
        />

        <NeoButton color={theme.color.pink} onPress={() => router.push('/paywall')}>
          View Pro options
        </NeoButton>
      </NeoCard>

      <SectionTitle eyebrow="Reminders" title="Learning loop" />
      <NeoCard color={theme.color.softGreen} contentStyle={styles.settingsCard}>
        <Pressable
          accessibilityRole="switch"
          accessibilityState={{ checked: profile?.notificationsEnabled ?? false }}
          onPress={() => updateNotificationSettings(!(profile?.notificationsEnabled ?? false))}
          style={styles.settingRow}>
          <View style={styles.settingIcon}>
            <FontAwesome color={theme.color.ink} name="bell" size={15} />
          </View>
          <View style={styles.settingText}>
            <Text style={styles.settingLabel}>Daily reminder</Text>
            <Text style={styles.settingValue}>{profile?.notificationsEnabled ? 'Enabled' : 'Off'}</Text>
          </View>
          <View style={[styles.toggle, profile?.notificationsEnabled && styles.toggleActive]} />
        </Pressable>

        <View style={styles.timePicker}>
          <Text style={styles.settingLabel}>Reminder time</Text>
          <SegmentedControl
            options={reminderTimes.map((time) => ({ label: time, value: time, color: theme.color.yellow }))}
            value={profile?.notificationTime ?? '20:30'}
            onChange={(time) => updateNotificationSettings(profile?.notificationsEnabled ?? false, time)}
          />
        </View>

        <SettingRow icon="database" label="Cloud progress sync" value="Supabase when configured" />
        <SettingRow icon="wifi" label="Offline cache" value="Current course + progress" />
      </NeoCard>

      <ErrorState error={error && error.code !== 'payment_required' ? error : null} />

      <NeoButton color={theme.color.white} onPress={handleSignOut}>
        Sign out
      </NeoButton>
    </ScreenShell>
  );
}

function UsageRow({
  color,
  label,
  used,
  value,
}: {
  color: string;
  label: string;
  used: string;
  value: number;
}) {
  return (
    <View style={styles.usageRow}>
      <View style={styles.usageTop}>
        <Text style={styles.usageLabel}>{label}</Text>
        <Text style={styles.usageUsed}>{used}</Text>
      </View>
      <ProgressBar color={color} height={14} value={value} />
    </View>
  );
}

function SettingRow({
  icon,
  label,
  value,
}: {
  icon: React.ComponentProps<typeof FontAwesome>['name'];
  label: string;
  value: string;
}) {
  return (
    <View style={styles.settingRow}>
      <View style={styles.settingIcon}>
        <FontAwesome color={theme.color.ink} name={icon} size={15} />
      </View>
      <View style={styles.settingText}>
        <Text style={styles.settingLabel}>{label}</Text>
        <Text style={styles.settingValue}>{value}</Text>
      </View>
      <FontAwesome color={theme.color.ink} name="check" size={14} />
    </View>
  );
}

const styles = StyleSheet.create({
  profileCard: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  avatar: {
    alignItems: 'center',
    backgroundColor: theme.color.yellow,
    borderColor: theme.color.ink,
    borderRadius: theme.border.radius,
    borderWidth: theme.border.width,
    height: 68,
    justifyContent: 'center',
    marginRight: 14,
    width: 68,
  },
  avatarText: {
    color: theme.color.ink,
    fontFamily: theme.font.mono,
    fontSize: 22,
  },
  profileCopy: {
    flex: 1,
  },
  name: {
    color: theme.color.ink,
    fontFamily: theme.font.mono,
    fontSize: 18,
    lineHeight: 24,
  },
  email: {
    color: theme.color.ink,
    fontFamily: theme.font.mono,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 5,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 18,
    marginTop: 18,
  },
  weekCard: {
    gap: 12,
  },
  weekGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  weekDay: {
    alignItems: 'center',
    backgroundColor: theme.color.white,
    borderColor: theme.color.ink,
    borderRadius: theme.border.radius,
    borderWidth: 2,
    flex: 1,
    height: 42,
    justifyContent: 'center',
  },
  weekDayActive: {
    backgroundColor: theme.color.green,
  },
  weekDayText: {
    color: theme.color.ink,
    fontFamily: theme.font.mono,
    fontSize: 12,
  },
  weekCopy: {
    color: theme.color.ink,
    fontFamily: theme.font.mono,
    fontSize: 12,
    lineHeight: 18,
  },
  planCard: {
    gap: 16,
  },
  planHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
  },
  planCopy: {
    flex: 1,
    minWidth: 0,
  },
  planTitle: {
    color: theme.color.ink,
    fontFamily: theme.font.mono,
    fontSize: 20,
  },
  planSub: {
    color: theme.color.muted,
    fontFamily: theme.font.mono,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 5,
  },
  usageRow: {
    gap: 8,
  },
  usageTop: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between',
  },
  usageLabel: {
    color: theme.color.ink,
    fontFamily: theme.font.mono,
    fontSize: 12,
    textTransform: 'uppercase',
  },
  usageUsed: {
    color: theme.color.muted,
    fontFamily: theme.font.mono,
    fontSize: 12,
  },
  settingsCard: {
    gap: 14,
  },
  settingRow: {
    alignItems: 'center',
    backgroundColor: theme.color.white,
    borderColor: theme.color.ink,
    borderRadius: theme.border.radius,
    borderWidth: 2,
    flexDirection: 'row',
    minHeight: 66,
    paddingHorizontal: 12,
  },
  settingIcon: {
    alignItems: 'center',
    backgroundColor: theme.color.yellow,
    borderColor: theme.color.ink,
    borderRadius: theme.border.radius,
    borderWidth: 2,
    height: 38,
    justifyContent: 'center',
    marginRight: 12,
    width: 38,
  },
  settingText: {
    flex: 1,
  },
  settingLabel: {
    color: theme.color.ink,
    fontFamily: theme.font.mono,
    fontSize: 13,
    textTransform: 'uppercase',
  },
  settingValue: {
    color: theme.color.muted,
    fontFamily: theme.font.mono,
    fontSize: 12,
    marginTop: 4,
  },
  toggle: {
    backgroundColor: theme.color.white,
    borderColor: theme.color.ink,
    borderRadius: theme.border.radius,
    borderWidth: 2,
    height: 24,
    width: 42,
  },
  toggleActive: {
    backgroundColor: theme.color.green,
  },
  timePicker: {
    gap: 10,
  },
});
