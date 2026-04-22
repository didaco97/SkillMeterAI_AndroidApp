import FontAwesome from '@expo/vector-icons/FontAwesome';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ErrorState, PageHeader, ScreenShell, TextInputField } from '@/components/AppScaffold';
import { NeoButton, NeoCard } from '@/components/Neo';
import { theme } from '@/constants/skillmeterTheme';
import { isSupabaseConfigured } from '@/lib/supabase';
import { useSkillmeterStore } from '@/stores/useSkillmeterStore';

export default function LoginScreen() {
  const [email, setEmail] = useState('learner@skillmeter.app');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');
  const signIn = useSkillmeterStore((state) => state.signIn);
  const signInWithGoogle = useSkillmeterStore((state) => state.signInWithGoogle);
  const authStatus = useSkillmeterStore((state) => state.authStatus);
  const error = useSkillmeterStore((state) => state.error);

  async function submitLogin() {
    if (!email.includes('@')) {
      setFormError('Enter a valid email address.');
      return;
    }

    if (password.length > 0 && password.length < 6) {
      setFormError('Password must be at least 6 characters.');
      return;
    }

    setFormError('');
    const signedIn = await signIn(email, password);
    if (signedIn) {
      router.replace('/home');
    }
  }

  async function submitGoogle() {
    setFormError('');
    const signedIn = await signInWithGoogle();
    if (signedIn) {
      router.replace('/home');
    }
  }

  return (
    <ScreenShell keyboardShouldPersistTaps="handled">
      <PageHeader
        backAction={() => router.back()}
        caption="Your courses, streaks, notes, and quizzes stay attached to your account."
        title="Log in"
        badge={null}
      />

      <NeoCard color={theme.color.white} contentStyle={styles.formCard}>
        <TextInputField
          autoCapitalize="none"
          keyboardType="email-address"
          label="Email"
          onChangeText={setEmail}
          value={email}
          error={formError && !email.includes('@') ? formError : undefined}
        />
        <TextInputField
          label="Password"
          onChangeText={setPassword}
          placeholder={isSupabaseConfigured ? 'Enter your password' : 'Demo login can be empty'}
          secureTextEntry
          value={password}
          error={formError && password.length > 0 && password.length < 6 ? formError : undefined}
        />

        {formError && email.includes('@') ? <Text style={styles.formError}>{formError}</Text> : null}

        <Pressable accessibilityRole="button" onPress={submitGoogle} style={styles.googleButton}>
          <FontAwesome color={theme.color.ink} name="google" size={18} />
          <Text style={styles.googleText}>Continue with Google</Text>
        </Pressable>

        <NeoButton color={theme.color.green} disabled={authStatus === 'loading'} onPress={submitLogin}>
          {authStatus === 'loading' ? 'Logging in' : 'Log in'}
        </NeoButton>
      </NeoCard>

      <ErrorState error={error?.code === 'auth' ? error : null} />

      <Pressable onPress={() => router.push('/signup')} style={styles.switchLink}>
        <Text style={styles.switchText}>New here? Create account</Text>
      </Pressable>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  formCard: {
    gap: 14,
  },
  formError: {
    color: theme.color.ink,
    fontFamily: theme.font.mono,
    fontSize: 12,
    lineHeight: 18,
  },
  googleButton: {
    alignItems: 'center',
    backgroundColor: theme.color.cyan,
    borderColor: theme.color.ink,
    borderRadius: theme.border.radius,
    borderWidth: theme.border.width,
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
    minHeight: 54,
  },
  googleText: {
    color: theme.color.ink,
    fontFamily: theme.font.mono,
    fontSize: 12,
    textTransform: 'uppercase',
  },
  switchLink: {
    alignItems: 'center',
    marginTop: 14,
    paddingVertical: 12,
  },
  switchText: {
    color: theme.color.ink,
    fontFamily: theme.font.mono,
    fontSize: 12,
    textDecorationLine: 'underline',
    textTransform: 'uppercase',
  },
});
