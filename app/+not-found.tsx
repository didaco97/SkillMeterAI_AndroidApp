import { router, Stack } from 'expo-router';

import { EmptyState, ScreenShell } from '@/components/AppScaffold';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Not found' }} />
      <ScreenShell scroll={false}>
        <EmptyState
          actionLabel="Go home"
          copy="This route is not part of the Skillmeter learning flow."
          icon="map-signs"
          onAction={() => router.replace('/')}
          title="Screen not found"
        />
      </ScreenShell>
    </>
  );
}
