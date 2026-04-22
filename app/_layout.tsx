import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useState } from 'react';
import { AppState, Platform } from 'react-native';
import 'react-native-reanimated';
import '../global.css';

import { theme } from '@/constants/skillmeterTheme';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { useSkillmeterStore } from '@/stores/useSkillmeterStore';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: 'index',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();
WebBrowser.maybeCompleteAuthSession();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });
  const [hydrated, setHydrated] = useState(useSkillmeterStore.persist.hasHydrated());
  const authBootstrapped = useSkillmeterStore((state) => state.authBootstrapped);
  const bootstrapApp = useSkillmeterStore((state) => state.bootstrapApp);

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    const unsubscribe = useSkillmeterStore.persist.onFinishHydration(() => setHydrated(true));
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (loaded && hydrated && !authBootstrapped) {
      void bootstrapApp();
    }
  }, [authBootstrapped, bootstrapApp, hydrated, loaded]);

  useEffect(() => {
    if (loaded && hydrated && authBootstrapped) {
      SplashScreen.hideAsync();
    }
  }, [authBootstrapped, hydrated, loaded]);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      return;
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'INITIAL_SESSION') {
        return;
      }

      void useSkillmeterStore.getState().syncAuthSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase || Platform.OS === 'web') {
      return;
    }

    const client = supabase;
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        client.auth.startAutoRefresh();
      } else {
        client.auth.stopAutoRefresh();
      }
    });

    return () => subscription.remove();
  }, []);

  if (!loaded || !hydrated || !authBootstrapped) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  return (
    <ThemeProvider
      value={{
        ...DefaultTheme,
        colors: {
          ...DefaultTheme.colors,
          background: theme.color.paper,
          card: theme.color.paper,
          primary: theme.color.ink,
          text: theme.color.ink,
        },
      }}>
      <Stack>
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="signup" options={{ headerShown: false }} />
        <Stack.Screen name="paywall" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
      </Stack>
    </ThemeProvider>
  );
}


