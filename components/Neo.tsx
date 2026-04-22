import FontAwesome from '@expo/vector-icons/FontAwesome';
import type { ComponentProps, ReactNode } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type PressableProps,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';

import { theme } from '@/constants/skillmeterTheme';

type CardProps = {
  children: ReactNode;
  color?: string;
  shadowColor?: string;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
};

export function NeoCard({
  children,
  color = theme.color.white,
  shadowColor = theme.color.ink,
  style,
  contentStyle,
}: CardProps) {
  return (
    <View style={[styles.neoShell, style]}>
      <View style={[styles.neoShadow, { backgroundColor: shadowColor }]} />
      <View style={[styles.neoContent, { backgroundColor: color }, contentStyle]}>{children}</View>
    </View>
  );
}

type ButtonProps = PressableProps & {
  children: ReactNode;
  color?: string;
  textColor?: string;
  style?: StyleProp<ViewStyle>;
};

export function NeoButton({
  children,
  color = theme.color.yellow,
  textColor = theme.color.ink,
  style,
  ...props
}: ButtonProps) {
  const disabled = Boolean(props.disabled);

  return (
    <Pressable
      {...props}
      style={({ pressed }) => [styles.buttonShell, pressed && !disabled && styles.pressed, disabled && styles.buttonDisabled, style]}>
      <View style={styles.buttonShadow} />
      <View style={[styles.buttonContent, { backgroundColor: color }, disabled && styles.buttonContentDisabled]}>
        <Text style={[styles.buttonText, { color: textColor }]}>{children}</Text>
      </View>
    </Pressable>
  );
}

type TagProps = {
  children: ReactNode;
  color?: string;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
};

export function Tag({ children, color = theme.color.yellow, style, textStyle }: TagProps) {
  return (
    <View style={[styles.tag, { backgroundColor: color }, style]}>
      <Text style={[styles.tagText, textStyle]}>{children}</Text>
    </View>
  );
}

type ProgressBarProps = {
  value: number;
  color?: string;
  height?: number;
};

export function ProgressBar({ value, color = theme.color.green, height = 18 }: ProgressBarProps) {
  const clampedValue = Math.max(0, Math.min(1, value));

  return (
    <View style={[styles.progressTrack, { height }]}>
      <View style={[styles.progressFill, { width: `${clampedValue * 100}%`, backgroundColor: color }]} />
    </View>
  );
}

type StatBlockProps = {
  label: string;
  value: string;
  color: string;
  icon: ComponentProps<typeof FontAwesome>['name'];
};

export function StatBlock({ label, value, color, icon }: StatBlockProps) {
  return (
    <NeoCard color={color} style={styles.statCard} contentStyle={styles.statContent}>
      <FontAwesome name={icon} size={18} color={theme.color.ink} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </NeoCard>
  );
}

type SectionTitleProps = {
  eyebrow?: string;
  title: string;
  aside?: string;
};

export function SectionTitle({ eyebrow, title, aside }: SectionTitleProps) {
  return (
    <View style={styles.sectionTitle}>
      <View style={styles.sectionTitleCopy}>
        {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
        <Text style={styles.title}>{title}</Text>
      </View>
      {aside ? <Tag color={theme.color.cyan} style={styles.sectionTitleAside}>{aside}</Tag> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  neoShell: {
    marginBottom: theme.shadow.offset,
    marginRight: theme.shadow.offset,
    position: 'relative',
  },
  neoShadow: {
    borderColor: theme.color.ink,
    borderRadius: theme.border.radius,
    borderWidth: theme.border.width,
    bottom: -theme.shadow.offset,
    left: theme.shadow.offset,
    position: 'absolute',
    right: -theme.shadow.offset,
    top: theme.shadow.offset,
  },
  neoContent: {
    borderColor: theme.color.ink,
    borderRadius: theme.border.radius,
    borderWidth: theme.border.width,
    overflow: 'hidden',
    padding: 16,
  },
  buttonShell: {
    marginBottom: theme.shadow.offset,
    marginRight: theme.shadow.offset,
    minHeight: 54,
    position: 'relative',
  },
  buttonShadow: {
    backgroundColor: theme.color.ink,
    borderColor: theme.color.ink,
    borderRadius: theme.border.radius,
    borderWidth: theme.border.width,
    bottom: -theme.shadow.offset,
    left: theme.shadow.offset,
    position: 'absolute',
    right: -theme.shadow.offset,
    top: theme.shadow.offset,
  },
  buttonContent: {
    alignItems: 'center',
    borderColor: theme.color.ink,
    borderRadius: theme.border.radius,
    borderWidth: theme.border.width,
    justifyContent: 'center',
    minHeight: 54,
    paddingHorizontal: 18,
  },
  buttonText: {
    fontFamily: theme.font.mono,
    fontSize: 14,
    letterSpacing: 0,
    textTransform: 'uppercase',
  },
  pressed: {
    transform: [{ translateX: 4 }, { translateY: 4 }],
  },
  buttonDisabled: {
    opacity: 0.72,
  },
  buttonContentDisabled: {
    backgroundColor: theme.color.paper,
  },
  tag: {
    alignSelf: 'flex-start',
    borderColor: theme.color.ink,
    borderRadius: 999,
    borderWidth: 2,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  tagText: {
    color: theme.color.ink,
    fontFamily: theme.font.mono,
    fontSize: 11,
    letterSpacing: 0,
    textTransform: 'uppercase',
  },
  progressTrack: {
    backgroundColor: theme.color.white,
    borderColor: theme.color.ink,
    borderRadius: 999,
    borderWidth: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
  },
  statCard: {
    flex: 1,
  },
  statContent: {
    minHeight: 116,
  },
  statLabel: {
    color: theme.color.ink,
    fontFamily: theme.font.mono,
    fontSize: 11,
    marginTop: 4,
    textTransform: 'uppercase',
  },
  statValue: {
    color: theme.color.ink,
    fontFamily: theme.font.mono,
    fontSize: 25,
    marginTop: 12,
  },
  sectionTitle: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  sectionTitleCopy: {
    flexBasis: 0,
    flexGrow: 1,
    flexShrink: 1,
    minWidth: 0,
  },
  sectionTitleAside: {
    marginTop: 4,
  },
  eyebrow: {
    color: theme.color.muted,
    fontFamily: theme.font.mono,
    fontSize: 11,
    marginBottom: 3,
    textTransform: 'uppercase',
  },
  title: {
    color: theme.color.ink,
    flexShrink: 1,
    fontFamily: theme.font.mono,
    fontSize: 22,
    lineHeight: 30,
  },
});

