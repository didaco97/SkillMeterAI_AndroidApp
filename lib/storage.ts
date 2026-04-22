import AsyncStorage from '@react-native-async-storage/async-storage';

export const storageKeys = {
  onboardingSeen: 'skillmeter:onboarding-seen',
  authProfile: 'skillmeter:auth-profile',
  courses: 'skillmeter:courses',
  progress: 'skillmeter:progress',
  activeCourseId: 'skillmeter:active-course-id',
  notificationSettings: 'skillmeter:notification-settings',
};

export async function readJson<T>(key: string, fallback: T): Promise<T> {
  try {
    const value = await AsyncStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}

export async function writeJson<T>(key: string, value: T): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export async function removeKey(key: string): Promise<void> {
  await AsyncStorage.removeItem(key);
}

export async function readString(key: string, fallback = ''): Promise<string> {
  try {
    return (await AsyncStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
}

export async function writeString(key: string, value: string): Promise<void> {
  await AsyncStorage.setItem(key, value);
}
