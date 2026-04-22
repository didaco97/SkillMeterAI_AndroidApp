import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import type { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { PlatformPressable } from '@react-navigation/elements';
import { Redirect, Tabs } from 'expo-router';
import { StyleSheet, Text } from 'react-native';

import { theme } from '@/constants/skillmeterTheme';
import { useSkillmeterStore } from '@/stores/useSkillmeterStore';

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={21} {...props} />;
}

function TabBarLabel({
  color,
  label,
}: {
  color: string;
  label: string;
}) {
  return <Text style={[styles.tabBarLabel, { color }]}>{label}</Text>;
}

function TabBarButton({
  ['aria-selected']: ariaSelected,
  children,
  style,
  ...props
}: BottomTabBarButtonProps) {
  const focused = Boolean(ariaSelected);

  return (
    <PlatformPressable {...props} style={[style, styles.tabButton, focused && styles.tabButtonActive]}>
      {children}
    </PlatformPressable>
  );
}

export default function TabLayout() {
  const hasSeenOnboarding = useSkillmeterStore((state) => state.hasSeenOnboarding);
  const isAuthenticated = useSkillmeterStore((state) => state.isAuthenticated);

  if (!hasSeenOnboarding) {
    return <Redirect href="/onboarding" />;
  }

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.color.ink,
        tabBarInactiveTintColor: theme.color.muted,
        tabBarItemStyle: styles.tabBarItem,
        tabBarStyle: styles.tabBar,
      }}>
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarButton: (props) => <TabBarButton {...props} />,
          tabBarIcon: ({ color }) => <TabBarIcon name="bolt" color={color} />,
          tabBarLabel: ({ color }) => <TabBarLabel color={color} label="Home" />,
        }}
      />
      <Tabs.Screen
        name="courses"
        options={{
          title: 'Courses',
          tabBarButton: (props) => <TabBarButton {...props} />,
          tabBarIcon: ({ color }) => <TabBarIcon name="list-ul" color={color} />,
          tabBarLabel: ({ color }) => <TabBarLabel color={color} label="Courses" />,
        }}
      />
      <Tabs.Screen
        name="learn"
        options={{
          title: 'Learn',
          tabBarButton: (props) => <TabBarButton {...props} />,
          tabBarIcon: ({ color }) => <TabBarIcon name="play-circle" color={color} />,
          tabBarLabel: ({ color }) => <TabBarLabel color={color} label="Learn" />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarButton: (props) => <TabBarButton {...props} />,
          tabBarIcon: ({ color }) => <TabBarIcon name="user" color={color} />,
          tabBarLabel: ({ color }) => <TabBarLabel color={color} label="Profile" />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: theme.color.yellow,
    borderColor: theme.color.ink,
    borderTopWidth: theme.border.width,
    height: 80,
    paddingBottom: 0,
    paddingTop: 0,
  },
  tabBarItem: {
    margin: 0,
  },
  tabBarLabel: {
    fontFamily: theme.font.mono,
    fontSize: 10,
    letterSpacing: 0,
    lineHeight: 12,
    marginTop: 4,
    textTransform: 'uppercase',
  },
  tabButton: {
    alignItems: 'center',
    alignSelf: 'stretch',
    flex: 1,
    justifyContent: 'center',
    paddingBottom: 10,
    paddingTop: 8,
  },
  tabButtonActive: {
    borderColor: theme.color.ink,
    borderLeftWidth: theme.border.width,
    borderRightWidth: theme.border.width,
  },
});


