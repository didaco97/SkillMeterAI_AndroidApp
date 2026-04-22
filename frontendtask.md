# Skillmeter App Frontend Task Audit

Audited against `SkillmeterAPP_PRD.md` and the current Expo Router UI in `app/`, `components/`, `constants/`, and `data/`.

## Implementation Pass Update

Completed in the frontend implementation pass:

- `[x]` NativeWind installed and configured without replacing the existing neo brutal `StyleSheet` UI.
- `[x]` Zustand store added for auth, onboarding, courses, progress, generation, playlist preview, stats, usage, notifications, and paywall state.
- `[x]` AsyncStorage-backed store persistence added.
- `[x]` Supabase client wrapper added with safe no-env fallback.
- `[x]` API facade added for Edge Function integration with local demo fallback.
- `[x]` Onboarding now persists completion and no longer lives inside Home.
- `[x]` Login/signup now validate inputs and use auth store actions.
- `[x]` Home now supports One Shot and Playlist modes, YouTube URL validation, daily time picker, playlist preview, processing steps, 402/paywall state, and course creation.
- `[x]` Courses now uses store data, filtering, empty/loading/error states, and opens Learn with the selected course.
- `[x]` Learn now uses active course state, real course sections, YouTube iframe component, timestamp jumps, modules, daily plan, notes, quiz scoring, and section completion.
- `[x]` Profile now uses store-backed profile/stats/usage, sign-out, reminder toggle/time controls, and paywall link.
- `[x]` Paywall screen added for free-vs-pro comparison and subscription-state demo wiring.
- `[x]` Shared UI states/components added: `ScreenShell`, `PageHeader`, `TextInputField`, `SegmentedControl`, `ProcessingStepList`, `SkeletonBlock`, `LoadingState`, `EmptyState`, and `ErrorState`.
- `[x]` Web/static export and TypeScript checks pass.

Backend/database note:

- The repo now includes a Supabase schema and Edge Function contract under `supabase/`, but it still does not contain a provisioned Supabase project, deployed Edge Functions, or secrets. Frontend integration points are implemented through `lib/supabase.ts` and `lib/api.ts`, and they will call Supabase Edge Functions when `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` are configured. Until then, the app uses local demo data so every frontend path remains testable.

## Status Legend

- `[x]` Implemented UI shell exists
- `[~]` Mock UI exists, but real behavior/data is missing
- `[ ]` Not implemented yet

## Current Frontend Inventory

### App Routes

- `[x]` `app/index.tsx` redirects first load to onboarding.
- `[~]` `app/onboarding.tsx` has onboarding UI and routes to login/signup, but no persisted "seen onboarding" state.
- `[~]` `app/login.tsx` has login UI, but no Supabase/Google auth.
- `[~]` `app/signup.tsx` has signup UI, but no Supabase account creation.
- `[x]` `app/(tabs)/_layout.tsx` defines bottom tabs: Home, Courses, Learn, Profile.
- `[~]` `app/(tabs)/home.tsx` has course creation UI mock.
- `[~]` `app/(tabs)/courses.tsx` lists courses and opens Learn with a course id.
- `[~]` `app/(tabs)/learn.tsx` shows current course workspace, player mock, notes, quiz, plan.
- `[~]` `app/(tabs)/profile.tsx` shows profile, subscription, stats, reminder mock UI.

### Shared Components

- `[x]` `components/Neo.tsx`
  - `NeoCard`
  - `NeoButton`
  - `Tag`
  - `ProgressBar`
  - `StatBlock`
  - `SectionTitle`
- `[x]` `constants/skillmeterTheme.ts` contains the restored original neo brutal color palette and sharp-edge theme.
- `[~]` `data/demoCourse.ts` provides static demo content only.

### Current Gaps In Architecture

- `[ ]` No real global app state store.
- `[ ]` No auth session provider.
- `[ ]` No API client layer.
- `[ ]` No course generation request flow.
- `[ ]` No persistent course/progress cache.
- `[ ]` No real YouTube player integration.
- `[ ]` No push notification setup.
- `[ ]` No paywall/usage-limit state.
- `[ ]` No loading skeleton or empty-state component set.

## PRD Frontend Checklist

| PRD ID | Status | Current State | Still Needed |
|---|---:|---|---|
| FE-01 Initialize Expo project with Expo Router | `[x]` | Expo Router app exists with tabs and auth/onboarding routes. | Confirm final Android app config before production build. |
| FE-02 Install/configure NativeWind | `[ ]` | App currently uses `StyleSheet`. | Install NativeWind or intentionally update PRD to keep StyleSheet. |
| FE-03 Install Zustand/store | `[ ]` | No Zustand store. | Add stores for auth, generation, current course, progress, notification settings. |
| FE-04 App shell tab nav | `[x]` | Home, Courses, Learn, Profile tabs exist. | Confirm PRD naming if "My Courses" should replace "Courses". |
| FE-05 Google Sign-In via Supabase Auth | `[ ]` | Login/signup are visual mocks. | Add Supabase client, Google auth, session persistence, sign-out. |
| FE-06 Home screen with two mode cards | `[~]` | Home has visual mode cards/content. | Add real One Shot vs Playlist selection state and routing. |
| FE-07 URL input + YouTube URL validation | `[~]` | URL input UI exists. | Add validation function, error state, disabled submit state. |
| FE-08 One Shot flow | `[ ]` | No complete flow. | Build URL input -> daily time -> generation loading -> ready state. |
| FE-09 Processing screen step indicators | `[ ]` | No dedicated processing screen. | Add staged progress UI for transcript, outline, quiz, save. |
| FE-10 Course Home screen | `[~]` | Learn screen shows active course card and daily plan mock. | Add real course home from generated backend data. |
| FE-11 Section Player screen | `[~]` | Player area is a static mock. | Add real YouTube embed/player, title, section metadata, timestamps. |
| FE-12 Timestamp jumping | `[ ]` | Timestamp chips are visual only. | Add timestamp seek handlers connected to player ref. |
| FE-13 Notes tab | `[~]` | Notes panel mock exists in Learn. | Render generated notes, key points, glossary, links per section. |
| FE-14 Quiz screen with feedback/score | `[~]` | Quiz mock exists. | Add interactive answers, validation, scoring, retry, persistence. |
| FE-15 Daily Session screen | `[~]` | Plan items and checklist-style content exist. | Add actual completion checkboxes and session complete action. |
| FE-16 Playlist flow | `[ ]` | Not implemented. | Build playlist URL -> fetch preview -> confirm -> processing -> course. |
| FE-17 Course Module screen | `[~]` | Courses list and module-like mock content exist. | Add expandable modules, lessons, locked/completed state. |
| FE-18 Lesson screen | `[~]` | Learn page combines video, notes, quiz. | Add dedicated lesson/section routing if PRD still requires it. |
| FE-19 Course Progress screen | `[~]` | Progress bars are static. | Add module/lesson progress calculations and persistence. |
| FE-20 Progress/Stats screen | `[~]` | Profile has static stats. | Add real stats from progress data. |
| FE-21 Streak UI | `[~]` | Profile has a weekly grid mock. | Add real streak calculation and date-aware weekly activity. |
| FE-22 Expo Push Notifications | `[ ]` | No notification setup. | Add permissions, token registration, local reminder scheduling. |
| FE-23 Notification settings | `[~]` | Profile shows reminder UI mock. | Add toggle, time picker, persistence, scheduling updates. |
| FE-24 AsyncStorage caching current course | `[ ]` | No local persistence. | Cache auth-lite state, current course, selected section, progress. |
| FE-25 Supabase realtime sync | `[ ]` | No Supabase integration. | Add realtime progress/course sync if backend schema supports it. |
| FE-26 Onboarding flow | `[~]` | Onboarding route exists. | Persist completion and prevent showing onboarding every launch. |
| FE-27 Paywall free vs pro | `[ ]` | Profile has static Pro card. | Add paywall screen, plan comparison, upgrade CTA, subscription state. |
| FE-28 Handle 402 errors | `[ ]` | No API error handling. | Add upgrade prompt when backend returns usage-limit/payment errors. |
| FE-29 Profile account/subscription/sign out | `[~]` | Profile UI mock exists. | Add real account data, subscription state, sign-out action. |
| FE-30 Loading skeletons | `[ ]` | No skeleton components. | Add skeletons for course list, learn page, generation, notes, quiz. |
| FE-31 Empty states | `[ ]` | No reusable empty states. | Add no courses, no active course, no notes, no quiz, offline/error states. |
| FE-32 Final UI polish | `[~]` | Neo brutal theme exists. | Finish responsive layout, accessibility, dark mode decision, visual consistency. |
| FE-33 Production APK build/test | `[ ]` | TypeScript smoke checks only. | Run Android build/test flow, device QA, navigation flow QA. |

## Detailed Frontend Tasks To Implement

### 1. Foundation, State, And Data Flow

- `[ ]` Create `lib/supabase.ts` for Supabase client configuration.
- `[ ]` Create `lib/api.ts` for backend requests:
  - `createOneShotCourse(payload)`
  - `createPlaylistCourse(payload)`
  - `fetchPlaylistPreview(url)`
  - `getCourses()`
  - `getCourse(courseId)`
  - `saveProgress(payload)`
  - `getProfile()`
- `[ ]` Add Zustand or equivalent stores:
  - `useAuthStore`
  - `useCourseStore`
  - `useGenerationStore`
  - `useProgressStore`
  - `useNotificationStore`
- `[ ]` Add AsyncStorage persistence for:
  - onboarding completion
  - auth session helper state
  - current active course id
  - last opened lesson/section
  - local progress while offline
- `[ ]` Add reusable request states:
  - idle
  - loading
  - success
  - empty
  - error
  - payment required

### 2. Auth And Onboarding

- `[~]` Keep current onboarding UI, but wire it to real state.
- `[ ]` Add `hasSeenOnboarding` persistence.
- `[ ]` Update `app/index.tsx` redirect logic:
  - first launch -> `/onboarding`
  - unauthenticated returning user -> `/login`
  - authenticated user -> `/home`
- `[ ]` Implement Google sign-in via Supabase.
- `[ ]` Implement email/password signup if it is still part of the product.
- `[ ]` Add auth loading screen while session is restored.
- `[ ]` Add form validation to login/signup:
  - required fields
  - valid email
  - password length
  - auth error display
- `[ ]` Add sign-out action in Profile.

### 3. Home And Course Creation UI

- `[~]` Current Home screen is a static shell.
- `[ ]` Split Home into smaller components:
  - `ModeSelector`
  - `CourseUrlInput`
  - `DailyTimeSelector`
  - `CreateCourseButton`
  - `RecentCourseStrip`
  - `UsageLimitBanner`
- `[ ]` Add One Shot and Playlist mode selection.
- `[ ]` Add YouTube URL validation:
  - single video URL
  - playlist URL
  - invalid domain
  - missing URL
- `[ ]` Add disabled/loading/error states to create buttons.
- `[ ]` Add clear CTA labels for the selected mode.

### 4. One Shot Flow

- `[ ]` Build a complete One Shot creation route or modal.
- `[ ]` Add daily learning time input:
  - 5 min
  - 10 min
  - 15 min
  - custom value if required
- `[ ]` Add generation request call.
- `[ ]` Add processing screen with step indicators:
  - fetching video
  - reading transcript
  - creating course sections
  - generating quiz
  - saving course
- `[ ]` Add generated course ready screen.
- `[ ]` On success, route to `/learn?courseId={id}`.
- `[ ]` On error, show retry and fallback messaging.

### 5. Playlist Flow

- `[ ]` Build playlist URL input flow.
- `[ ]` Add playlist preview screen:
  - playlist title
  - video count
  - video thumbnails
  - selected videos
  - estimated course length
- `[ ]` Add confirm button before generation.
- `[ ]` Add generation processing screen.
- `[ ]` Add error states for private, empty, invalid, or too-large playlists.
- `[ ]` Route generated playlist course to Learn.

### 6. Courses Tab

- `[~]` Current Courses tab lists static demo courses.
- `[ ]` Fetch real user courses.
- `[ ]` Add reusable `CourseCard` component:
  - title
  - source type
  - progress
  - next lesson
  - last opened date
  - thumbnail or color marker
- `[ ]` Add filter/sort controls:
  - ongoing
  - completed
  - newest
  - progress
- `[ ]` Add no-courses empty state with CTA back to Home.
- `[ ]` On course press, set active course and route to `/learn?courseId={id}`.

### 7. Learn Tab And Current Course UI

- `[~]` Current Learn tab has static active course content.
- `[ ]` Load current course from route param or cached active course id.
- `[ ]` Add empty state when no current course exists.
- `[ ]` Split Learn into components:
  - `ActiveCourseHeader`
  - `ContinueLessonCard`
  - `SectionWorkspace`
  - `CoursePlanList`
  - `LessonTabs`
  - `CompletionFooter`
- `[ ]` Make active course header fully responsive across screen sizes.
- `[ ]` Add lesson/section selection state.
- `[ ]` Add "mark section complete" action.
- `[ ]` Add next/previous section controls.
- `[ ]` Persist selected section and completion progress.

### 8. Video Player And Timestamps

- `[ ]` Install and wire a real YouTube player package.
- `[ ]` Build `YouTubeLessonPlayer` component.
- `[ ]` Support video id extraction from backend/source URL.
- `[ ]` Add player loading and error states.
- `[ ]` Build `TimestampList` component.
- `[ ]` Implement timestamp jump function:
  - pressing timestamp seeks player
  - active timestamp updates while playing if supported
- `[ ]` Add transcript/timeline view if backend returns transcript segments.

### 9. Notes UI

- `[~]` Current notes are static cards.
- `[ ]` Build `NotesPanel` from generated backend data.
- `[ ]` Add components:
  - `KeyPointList`
  - `SummaryBlock`
  - `TermsList`
  - `ResourceLinks`
- `[ ]` Add copy/share affordance if needed.
- `[ ]` Add empty state when notes are unavailable.
- `[ ]` Add skeleton state while notes load.

### 10. Quiz UI

- `[~]` Current quiz is visual only.
- `[ ]` Build `QuizScreen` or `QuizPanel`.
- `[ ]` Add components:
  - `QuizQuestionCard`
  - `QuizOptionButton`
  - `QuizFeedbackCard`
  - `QuizProgressDots`
  - `QuizScoreSummary`
- `[ ]` Track selected answer per question.
- `[ ]` Show correct/incorrect feedback.
- `[ ]` Calculate score.
- `[ ]` Persist quiz attempt.
- `[ ]` Add retry quiz action.
- `[ ]` Mark lesson complete when quiz requirements are met.

### 11. Daily Session UI

- `[~]` Daily plan mock exists.
- `[ ]` Build dedicated daily session view if PRD still requires it.
- `[ ]` Add checklist items:
  - watch section
  - read notes
  - answer quiz
  - mark complete
- `[ ]` Add day progress indicator.
- `[ ]` Add session complete celebration/confirmation.
- `[ ]` Update streak and course progress on completion.

### 12. Modules, Lessons, And Progress

- `[~]` Module-like UI exists only as static content.
- `[ ]` Build `ModuleAccordion`.
- `[ ]` Build `LessonRow`.
- `[ ]` Add lesson states:
  - locked
  - available
  - in progress
  - complete
- `[ ]` Add course progress calculations.
- `[ ]` Add progress screen or section:
  - total completion
  - module completion
  - lessons completed
  - quiz scores
- `[ ]` Sync local progress with backend.

### 13. Profile, Stats, And Settings

- `[~]` Current Profile screen is static.
- `[ ]` Fetch and display real user info.
- `[ ]` Display real subscription plan.
- `[ ]` Add sign-out button behavior.
- `[ ]` Add `StatsGrid` from real progress data:
  - current streak
  - total courses
  - completed sections
  - learning time
- `[ ]` Build real weekly activity grid.
- `[ ]` Add notification settings:
  - enable/disable reminders
  - reminder time picker
  - permission state
  - save setting
- `[ ]` Add account error/loading states.

### 14. Push Notifications

- `[ ]` Add Expo Notifications package and setup.
- `[ ]` Request notification permissions.
- `[ ]` Store Expo push token if backend requires it.
- `[ ]` Schedule daily local reminder.
- `[ ]` Cancel/reschedule reminder when settings change.
- `[ ]` Handle denied permission UI.
- `[ ]` Test notification behavior on Android device/emulator.

### 15. Paywall And Usage Limits

- `[ ]` Build `PaywallScreen`.
- `[ ]` Build `PlanComparisonCard`.
- `[ ]` Build `UpgradePrompt`.
- `[ ]` Add free vs pro usage state:
  - remaining free courses
  - playlist locked or limited
  - generation limits
- `[ ]` Handle backend `402` response:
  - show upgrade prompt
  - preserve attempted action
  - allow retry after upgrade
- `[ ]` Reflect subscription state in Profile.

### 16. Shared UI Components Still Needed

- `[ ]` `ScreenShell`
- `[ ]` `PageHeader`
- `[ ]` `IconButton`
- `[ ]` `TextInputField`
- `[ ]` `SegmentedControl`
- `[ ]` `TimePickerField`
- `[ ]` `SkeletonBlock`
- `[ ]` `CourseCard`
- `[ ]` `EmptyState`
- `[ ]` `ErrorState`
- `[ ]` `OfflineBanner`
- `[ ]` `LoadingOverlay`
- `[ ]` `ConfirmationModal`
- `[ ]` `Toast`
- `[ ]` `PaywallCard`
- `[ ]` `VideoPlayerCard`
- `[ ]` `TimestampChip`
- `[ ]` `QuizOption`

### 17. Styling And Responsive Polish

- `[~]` Original Skillmeter neo brutal color palette is restored.
- `[x]` Sharp-edge theme is restored for core cards and panels.
- `[ ]` Audit all screens at small Android widths.
- `[ ]` Ensure text wraps cleanly in:
  - course headers
  - action buttons
  - course cards
  - tabs
  - profile stat blocks
- `[ ]` Add accessibility labels to icon-only and important buttons.
- `[ ]` Confirm whether dark mode is required by PRD or should be removed from scope.
- `[ ]` Keep visual language consistent:
  - thick black borders
  - hard shadows
  - sharp card corners
  - original yellow/cyan/pink/green/red accents

### 18. QA And Build Tasks

- `[ ]` Add route smoke checks for:
  - `/`
  - `/onboarding`
  - `/login`
  - `/signup`
  - `/home`
  - `/courses`
  - `/learn`
  - `/profile`
- `[ ]` Test main user flow:
  - first launch
  - onboarding
  - auth
  - create course
  - processing
  - learn
  - complete section
  - view progress
- `[ ]` Test empty user flow with no courses.
- `[ ]` Test API error flow.
- `[ ]` Test `402` paywall flow.
- `[ ]` Test Android viewport and physical/emulator device behavior.
- `[ ]` Run TypeScript check before every handoff.
- `[ ]` Run production Android build when backend/env is ready.

## Recommended Implementation Order

1. Add state/auth foundation: Supabase client, Zustand stores, AsyncStorage persistence.
2. Wire onboarding/login/signup to real routing and session state.
3. Implement Home creation flows for One Shot and Playlist.
4. Implement processing/loading/ready states.
5. Replace static demo course data with API-backed courses.
6. Wire Learn player, notes, quiz, completion, and progress.
7. Add Profile stats, notifications, paywall, and sign-out.
8. Finish skeletons, empty states, error states, and Android QA.
