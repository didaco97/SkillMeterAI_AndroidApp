import { Redirect } from 'expo-router';
import { useSkillmeterStore } from '@/stores/useSkillmeterStore';

export default function IndexScreen() {
  const hasSeenOnboarding = useSkillmeterStore((state) => state.hasSeenOnboarding);
  const isAuthenticated = useSkillmeterStore((state) => state.isAuthenticated);

  if (!hasSeenOnboarding) {
    return <Redirect href="/onboarding" />;
  }

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  return <Redirect href="/home" />;
}
