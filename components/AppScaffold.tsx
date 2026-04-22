import FontAwesome from '@expo/vector-icons/FontAwesome';
import type { ComponentProps, ReactNode } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { NeoButton, NeoCard, Tag } from '@/components/Neo';
import { theme } from '@/constants/skillmeterTheme';
import type { AppError, GenerationStep } from '@/types/skillmeter';

type ScreenShellProps = {
  children: ReactNode;
  scroll?: boolean;
  keyboardShouldPersistTaps?: 'always' | 'never' | 'handled';
};

export function ScreenShell({ children, scroll = true, keyboardShouldPersistTaps }: ScreenShellProps) {
  if (!scroll) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="dark" />
        <View style={styles.staticContent}>{children}</View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps={keyboardShouldPersistTaps}
        showsVerticalScrollIndicator={false}>
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

type PageHeaderProps = {
  title: string;
  caption?: string;
  badge?: ReactNode;
  action?: ReactNode;
  backAction?: () => void;
};

export function PageHeader({ title, caption, badge, action, backAction }: PageHeaderProps) {
  return (
    <View style={styles.header}>
      <View style={styles.headerCopy}>
        {backAction ? (
          <Pressable accessibilityRole="button" onPress={backAction} style={styles.backButton}>
            <FontAwesome color={theme.color.ink} name="arrow-left" size={16} />
          </Pressable>
        ) : null}
        <Text style={styles.screenTitle}>{title}</Text>
        {caption ? <Text style={styles.caption}>{caption}</Text> : null}
      </View>
      <View style={styles.headerAside}>{action ?? badge}</View>
    </View>
  );
}

type TextInputFieldProps = TextInputProps & {
  label: string;
  error?: string;
};

export function TextInputField({ label, error, style, ...props }: TextInputFieldProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        placeholderTextColor={theme.color.muted}
        selectionColor={theme.color.pink}
        style={[styles.input, error && styles.inputError, style]}
        {...props}
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

type SegmentedOption<T extends string | number> = {
  label: string;
  value: T;
  color?: string;
};

type SegmentedControlProps<T extends string | number> = {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
};

export function SegmentedControl<T extends string | number>({ options, value, onChange }: SegmentedControlProps<T>) {
  return (
    <View style={styles.segmentedRow}>
      {options.map((option) => {
        const active = value === option.value;
        return (
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            key={String(option.value)}
            onPress={() => onChange(option.value)}
            style={[styles.segmentedOption, active && { backgroundColor: option.color ?? theme.color.yellow }]}>
            <Text style={styles.segmentedText}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function ProcessingStepList({ steps }: { steps: GenerationStep[] }) {
  return (
    <NeoCard color={theme.color.softBlue}>
      {steps.map((step, index) => (
        <View key={step.id} style={[styles.stepRow, index !== steps.length - 1 && styles.stepGap]}>
          <View style={[styles.stepIcon, step.done ? styles.stepIconDone : styles.stepIconWaiting]}>
            <FontAwesome color={theme.color.ink} name={step.done ? 'check' : 'ellipsis-h'} size={14} />
          </View>
          <Text style={styles.stepText}>{step.label}</Text>
        </View>
      ))}
    </NeoCard>
  );
}

export function SkeletonBlock({ lines = 3 }: { lines?: number }) {
  return (
    <NeoCard color={theme.color.white} contentStyle={styles.skeletonCard}>
      {Array.from({ length: lines }).map((_, index) => (
        <View
          key={index}
          style={[
            styles.skeletonLine,
            { width: `${92 - index * 14}%`, backgroundColor: index % 2 === 0 ? theme.color.softBlue : theme.color.softPink },
          ]}
        />
      ))}
    </NeoCard>
  );
}

export function LoadingState({ label = 'Loading' }: { label?: string }) {
  return (
    <NeoCard color={theme.color.white} contentStyle={styles.stateCard}>
      <ActivityIndicator color={theme.color.ink} />
      <Text style={styles.stateTitle}>{label}</Text>
    </NeoCard>
  );
}

export function EmptyState({
  title,
  copy,
  actionLabel,
  onAction,
  icon = 'inbox',
}: {
  title: string;
  copy: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: ComponentProps<typeof FontAwesome>['name'];
}) {
  return (
    <NeoCard color={theme.color.yellow} contentStyle={styles.stateCard}>
      <View style={styles.stateIcon}>
        <FontAwesome color={theme.color.ink} name={icon} size={22} />
      </View>
      <Text style={styles.stateTitle}>{title}</Text>
      <Text style={styles.stateCopy}>{copy}</Text>
      {actionLabel && onAction ? (
        <NeoButton color={theme.color.green} onPress={onAction} style={styles.stateButton}>
          {actionLabel}
        </NeoButton>
      ) : null}
    </NeoCard>
  );
}

export function ErrorState({ error, onRetry }: { error: AppError | null; onRetry?: () => void }) {
  if (!error) {
    return null;
  }

  return (
    <NeoCard color={error.code === 'payment_required' ? theme.color.pink : theme.color.red} contentStyle={styles.errorCard}>
      <Tag color={theme.color.white}>{error.code === 'payment_required' ? 'Upgrade needed' : 'Error'}</Tag>
      <Text style={styles.errorTitle}>{error.message}</Text>
      {onRetry ? (
        <NeoButton color={theme.color.white} onPress={onRetry}>
          Try again
        </NeoButton>
      ) : null}
    </NeoCard>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: theme.color.paper,
    flex: 1,
  },
  content: {
    padding: 18,
    paddingBottom: 116,
  },
  staticContent: {
    flex: 1,
    padding: 18,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  headerCopy: {
    flexBasis: 0,
    flexGrow: 1,
    flexShrink: 1,
    minWidth: 0,
  },
  headerAside: {
    alignItems: 'flex-end',
  },
  backButton: {
    alignItems: 'center',
    backgroundColor: theme.color.white,
    borderColor: theme.color.ink,
    borderRadius: theme.border.radius,
    borderWidth: theme.border.width,
    height: 44,
    justifyContent: 'center',
    marginBottom: 14,
    width: 44,
  },
  screenTitle: {
    color: theme.color.ink,
    fontFamily: theme.font.mono,
    fontSize: 28,
    lineHeight: 36,
    textTransform: 'uppercase',
  },
  caption: {
    color: theme.color.muted,
    fontFamily: theme.font.mono,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 2,
  },
  field: {
    gap: 7,
  },
  inputLabel: {
    color: theme.color.ink,
    fontFamily: theme.font.mono,
    fontSize: 12,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: theme.color.paper,
    borderColor: theme.color.ink,
    borderRadius: theme.border.radius,
    borderWidth: theme.border.width,
    color: theme.color.ink,
    fontFamily: theme.font.mono,
    fontSize: 14,
    minHeight: 54,
    paddingHorizontal: 12,
  },
  inputError: {
    backgroundColor: theme.color.softPink,
  },
  errorText: {
    color: theme.color.ink,
    fontFamily: theme.font.mono,
    fontSize: 11,
    lineHeight: 16,
  },
  segmentedRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  segmentedOption: {
    alignItems: 'center',
    backgroundColor: theme.color.white,
    borderColor: theme.color.ink,
    borderRadius: theme.border.radius,
    borderWidth: 2,
    flexGrow: 1,
    minHeight: 42,
    minWidth: 74,
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  segmentedText: {
    color: theme.color.ink,
    fontFamily: theme.font.mono,
    fontSize: 12,
    textTransform: 'uppercase',
  },
  stepRow: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  stepGap: {
    marginBottom: 14,
  },
  stepIcon: {
    alignItems: 'center',
    borderColor: theme.color.ink,
    borderRadius: theme.border.radius,
    borderWidth: 2,
    height: 30,
    justifyContent: 'center',
    marginRight: 12,
    width: 30,
  },
  stepIconDone: {
    backgroundColor: theme.color.green,
  },
  stepIconWaiting: {
    backgroundColor: theme.color.white,
  },
  stepText: {
    color: theme.color.ink,
    flex: 1,
    fontFamily: theme.font.mono,
    fontSize: 13,
    lineHeight: 19,
  },
  skeletonCard: {
    gap: 12,
  },
  skeletonLine: {
    borderColor: theme.color.ink,
    borderRadius: theme.border.radius,
    borderWidth: 2,
    height: 18,
  },
  stateCard: {
    alignItems: 'flex-start',
    gap: 12,
  },
  stateIcon: {
    alignItems: 'center',
    backgroundColor: theme.color.white,
    borderColor: theme.color.ink,
    borderRadius: theme.border.radius,
    borderWidth: theme.border.width,
    height: 52,
    justifyContent: 'center',
    width: 52,
  },
  stateTitle: {
    color: theme.color.ink,
    fontFamily: theme.font.mono,
    fontSize: 20,
    lineHeight: 28,
  },
  stateCopy: {
    color: theme.color.ink,
    fontFamily: theme.font.mono,
    fontSize: 13,
    lineHeight: 20,
  },
  stateButton: {
    alignSelf: 'stretch',
  },
  errorCard: {
    gap: 12,
  },
  errorTitle: {
    color: theme.color.ink,
    fontFamily: theme.font.mono,
    fontSize: 16,
    lineHeight: 23,
  },
});
