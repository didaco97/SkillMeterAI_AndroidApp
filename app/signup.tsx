import FontAwesome from '@expo/vector-icons/FontAwesome';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ErrorState, PageHeader, ScreenShell, TextInputField } from '@/components/AppScaffold';
import { NeoButton, NeoCard } from '@/components/Neo';
import { theme } from '@/constants/skillmeterTheme';
import { isSupabaseConfigured } from '@/lib/supabase';
import { useSkillmeterStore } from '@/stores/useSkillmeterStore';

export default function SignupScreen() {
  const [name, setName] = useState('Skillmeter learner');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');
  const signUp = useSkillmeterStore((state) => state.signUp);
  const signInWithGoogle = useSkillmeterStore((state) => state.signInWithGoogle);
  const authStatus = useSkillmeterStore((state) => state.authStatus);
  const error = useSkillmeterStore((state) => state.error);

  async function submitSignup() {
    if (name.trim().length < 2) {
      setFormError('Add your name.');
      return;
    }

    if (!email.includes('@')) {
      setFormError('Enter a valid email address.');
      return;
    }

    if (password.length > 0 && password.length < 6) {
      setFormError('Password must be at least 6 characters.');
      return;
    }

    setFormError('');
    const signedUp = await signUp(name, email, password);
    if (signedUp) {
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
        caption="Generate courses, keep notes, and track progress from one account."
        title="Create account"
      />

      <NeoCard color={theme.color.yellow} contentStyle={styles.formCard}>
        <TextInputField label="Name" onChangeText={setName} value={name} />
        <TextInputField
          autoCapitalize="none"
          keyboardType="email-address"
          label="Email"
          onChangeText={setEmail}
          placeholder="you@example.com"
          value={email}
          error={formError && !email.includes('@') ? formError : undefined}
        />
        <TextInputField
          label="Password"
          onChangeText={setPassword}
          placeholder={isSupabaseConfigured ? 'Create a password' : 'Demo signup can be empty'}
          secureTextEntry
          value={password}
          error={formError && password.length > 0 && password.length < 6 ? formError : undefined}
        />

        {formError && email.includes('@') ? <Text style={styles.formError}>{formError}</Text> : null}

        <Pressable accessibilityRole="button" onPress={submitGoogle} style={styles.googleButton}>
          <FontAwesome color={theme.color.ink} name="google" size={18} />
          <Text style={styles.googleText}>Sign up with Google</Text>
        </Pressable>

        <NeoButton color={theme.color.green} disabled={authStatus === 'loading'} onPress={submitSignup}>
          {authStatus === 'loading' ? 'Creating' : 'Create account'}
        </NeoButton>
      </NeoCard>

      <NeoCard color={theme.color.softBlue} contentStyle={styles.promiseCard}>
        <Text style={styles.promiseTitle}>Free plan includes</Text>
        <PromiseRow text="2 One Shot courses per month" />
        <PromiseRow text="1 playlist course per month" />
        <PromiseRow text="Daily plan, quizzes, and local progress" />
      </NeoCard>

      <ErrorState error={error?.code === 'auth' ? error : null} />

      <Pressable onPress={() => router.push('/login')} style={styles.switchLink}>
        <Text style={styles.switchText}>Already have an account? Log in</Text>
      </Pressable>
    </ScreenShell>
  );
}

function PromiseRow({ text }: { text: string }) {
  return (
    <View style={styles.promiseRow}>
      <View style={styles.promiseDot} />
      <Text style={styles.promiseText}>{text}</Text>
    </View>
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
    backgroundColor: theme.color.white,
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
  promiseCard: {
    gap: 10,
    marginTop: 10,
  },
  promiseTitle: {
    color: theme.color.ink,
    fontFamily: theme.font.mono,
    fontSize: 16,
    textTransform: 'uppercase',
  },
  promiseRow: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  promiseDot: {
    backgroundColor: theme.color.green,
    borderColor: theme.color.ink,
    borderRadius: theme.border.radius,
    borderWidth: 2,
    height: 14,
    marginRight: 9,
    width: 14,
  },
  promiseText: {
    color: theme.color.ink,
    flex: 1,
    fontFamily: theme.font.mono,
    fontSize: 12,
    lineHeight: 18,
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
