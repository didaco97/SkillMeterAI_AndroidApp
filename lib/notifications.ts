import { Platform } from 'react-native';

import type { UserProfile } from '@/types/skillmeter';

type NotificationsModule = typeof import('expo-notifications');

let handlerConfigured = false;

async function getNotifications(): Promise<NotificationsModule | null> {
  if (Platform.OS === 'web') {
    return null;
  }

  const Notifications = await import('expo-notifications');

  if (!handlerConfigured) {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldPlaySound: false,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
    handlerConfigured = true;
  }

  return Notifications;
}

export async function requestNotificationPermission() {
  const Notifications = await getNotifications();
  if (!Notifications) {
    return false;
  }

  const current = await Notifications.getPermissionsAsync();
  if (current.granted) {
    return true;
  }

  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

export async function scheduleDailyReminder(profile: Pick<UserProfile, 'notificationTime' | 'notificationsEnabled'>) {
  const Notifications = await getNotifications();
  if (!Notifications) {
    return false;
  }

  await Notifications.cancelAllScheduledNotificationsAsync();

  if (!profile.notificationsEnabled) {
    return false;
  }

  const granted = await requestNotificationPermission();
  if (!granted) {
    return false;
  }

  const [hourValue, minuteValue] = profile.notificationTime.split(':').map(Number);

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Skillmeter session ready',
      body: "Open today's section and keep your learning streak alive.",
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: Number.isFinite(hourValue) ? hourValue : 20,
      minute: Number.isFinite(minuteValue) ? minuteValue : 30,
    },
  });

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Daily learning reminders',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  return true;
}
