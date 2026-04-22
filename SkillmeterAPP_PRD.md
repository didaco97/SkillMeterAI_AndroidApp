# Skillmeter App — Project Requirements Document

---

## 1. Overview

**App Name:** Skillmeter App
**Platform:** Android (iOS later) via React Native + Expo
**One-liner:** Turn any YouTube video or playlist into a structured, AI-powered course you can learn at your own pace.

Skillmeter App solves the core problem with free educational content on YouTube — it's abundant but completely unstructured. The app adds a curriculum layer on top of YouTube by using AI to generate sections, notes, quizzes, and personalized daily learning plans.

---

## 2. Problem Statement

YouTube has the world's best free educational content. But:

- Long videos have no enforced structure for the learner
- Playlists are just a list of videos with no syllabus
- There is no note-taking, quizzing, or progress tracking built in
- A user with limited daily time has no way to pace themselves through long content
- Motivation and consistency drop off with no learning loop

**Skillmeter App fixes all of this.**

---

## 3. Target Users

| User Type | Description |
|---|---|
| Self-learners | People learning skills like coding, design, finance via YouTube |
| Students | Using YouTube lectures as study material |
| Busy professionals | Only 30–60 min/day to dedicate to learning |
| Bootcamp students | Following curated playlists from instructors |

---

## 4. Core Modes

### Mode 1 — One Shot Video Breakdown
User pastes a link to any long YouTube video (1–5 hours). The app:
- Fetches the video transcript via YouTube Data API
- Sends transcript to OpenAI to detect and generate logical sections with titles and timestamps
- Asks the user for their daily available time (e.g. 30 min/day)
- Clusters sections into daily learning sessions without cutting mid-section
- Generates AI notes and a quiz for each section
- Saves a personalized day-by-day learning plan

**Example:** A 3-hour Python tutorial → 6-day learning plan with 30 min sessions per day.

---

### Mode 2 — Playlist to Course
User pastes a YouTube playlist URL. The app:
- Fetches all videos in the playlist via YouTube Data API
- Pulls transcripts for each video
- Sends all metadata + transcripts to OpenAI
- Generates a full course structure — modules, lessons, learning objectives
- Creates notes and quizzes per video
- Tracks progress across the full playlist as a course

**Example:** A 20-video ML playlist → structured course with 4 modules, completion tracking, and quizzes.

---

## 5. Key Features

### AI-Generated Course Structure
- Auto-detect chapters/sections from transcript
- Generate module titles and learning objectives
- Organize content into logical learning flow

### Daily Learning Plan
- User sets daily available time
- App distributes sections across days
- Daily session view with progress indicator
- Push notification reminders

### AI Notes
- Per-section structured notes generated from transcript
- Key concepts, bullet summaries, important terms
- Viewable alongside the video player

### Quizzes
- Auto-generated multiple choice questions per section
- Instant feedback and scoring
- Quiz results saved to progress history

### Progress Tracking
- Per-section and per-course completion status
- Streak tracking (days in a row)
- Overall course completion percentage
- Synced to cloud via Supabase

### YouTube Player
- Embedded player using `react-native-youtube-iframe`
- Timestamp-based jumping to specific sections
- Ads will appear as per YouTube's standard embed behavior (expected, not a bug)

---

## 6. Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| App Framework | React Native + Expo | Cross-platform mobile |
| Navigation | Expo Router | File-based routing |
| Styling | NativeWind (Tailwind RN) | Fast, consistent UI |
| Backend / Auth | Supabase | Auth, DB, Edge Functions |
| AI | OpenAI API (GPT-4o + GPT-4o-mini) | Course generation, notes, quizzes |
| YouTube | YouTube Data API v3 | Metadata, transcripts, playlist data |
| State Management | Zustand | Lightweight global state |
| Local Storage | AsyncStorage | Offline progress caching |
| Cloud Sync | Supabase Realtime DB | Cross-device progress sync |
| Push Notifications | Expo Notifications | Daily learning reminders |

---

## 7. Architecture

### Security Rule
API keys (OpenAI, YouTube) must never live in the React Native app. All third-party API calls are routed through Supabase Edge Functions.

```
[React Native App]
      |
      ▼
[Supabase Edge Functions]  ←── Auth middleware
      |           |
      ▼           ▼
[YouTube API]  [OpenAI API]
      |           |
      ▼           ▼
   Transcript   Course Structure
   + Metadata   Notes + Quizzes
```

### Data Flow — One Shot Mode
1. User pastes YouTube URL in app
2. App calls Supabase Edge Function with URL
3. Edge Function calls YouTube API → returns transcript + metadata
4. Edge Function chunks transcript → calls OpenAI → returns sections + daily plan
5. App stores course data in Supabase DB
6. User sees structured course with daily sessions

### Data Flow — Playlist Mode
1. User pastes playlist URL
2. Edge Function fetches all video IDs from playlist
3. Loops through each video → fetches transcript
4. Aggregates all transcripts → single OpenAI call for course structure
5. Individual OpenAI calls per video for notes + quizzes
6. Full course stored in Supabase DB

---

## 8. Monetization

**Model:** Freemium + Annual Subscription

| Feature | Free | Pro ($8/month or $55/year) |
|---|---|---|
| One Shot Mode | 2 videos/month | Unlimited |
| Playlist Mode | 1 playlist/month | Unlimited |
| AI Notes | Basic summary | Full structured notes |
| Quizzes | 3 questions/section | Full quiz per section |
| Progress Sync | Local only | Cloud sync |
| Daily Plan | ✓ | ✓ |
| Streak Tracking | ✓ | ✓ |

**Future:** B2B plan for educators and bootcamps at $50–100/month.

---

## 9. Out of Scope (Phase 1)

- iOS launch (Android first)
- Social / sharing features
- AI Roadmap mode (Keyword → course) — Phase 2
- Offline video download
- Custom AI tutor / chat
- Web app version

---

## 10. Success Metrics

| Metric | Target (Month 1) |
|---|---|
| App installs | 500+ |
| Day 7 retention | 30%+ |
| Courses created per user | 2+ |
| Daily session completion rate | 40%+ |
| Pro conversions | 3–5% of actives |

---

---

# Task Board

---

## Phase 1 — Foundation (Week 1)

### Backend Tasks

- [ ] **BE-01** Set up Supabase project — enable Auth, Database, Edge Functions
- [ ] **BE-02** Configure Google OAuth in Supabase Auth
- [ ] **BE-03** Create Edge Function: `get-youtube-metadata` — accepts video URL, returns title, description, duration, thumbnail, chapter timestamps if available
- [ ] **BE-04** Create Edge Function: `get-transcript` — accepts video ID, fetches full transcript with timestamps from YouTube Data API
- [ ] **BE-05** Set up YouTube Data API v3 key in Supabase secrets
- [ ] **BE-06** Set up OpenAI API key in Supabase secrets
- [ ] **BE-07** Add basic auth middleware to all Edge Functions — reject unauthenticated requests

### Frontend Tasks

- [ ] **FE-01** Initialize Expo project with Expo Router
- [ ] **FE-02** Install and configure NativeWind for styling
- [ ] **FE-03** Install Zustand and set up global store structure
- [ ] **FE-04** Build app shell — tab navigation (Home, My Courses, Profile)
- [ ] **FE-05** Build Google Sign-In screen using Supabase Auth
- [ ] **FE-06** Build Home screen with two mode cards (One Shot, Playlist)
- [ ] **FE-07** Build URL input screen — paste field + validate YouTube URL format

### Database Tasks

- [ ] **DB-01** Create `users` table — id, email, name, avatar_url, plan (free/pro), created_at
- [ ] **DB-02** Create `courses` table — id, user_id, title, mode (oneshot/playlist), source_url, thumbnail, created_at
- [ ] **DB-03** Enable Row Level Security (RLS) on all tables — users can only access their own data

---

## Phase 2 — One Shot Mode (Week 2)

### Backend Tasks

- [ ] **BE-08** Create Edge Function: `chunk-transcript` — splits long transcripts into ~10 min chunks for OpenAI processing
- [ ] **BE-09** Create Edge Function: `generate-sections` — sends chunked transcript to GPT-4o, returns array of sections with title, start timestamp, end timestamp, duration
- [ ] **BE-10** Create Edge Function: `generate-daily-plan` — accepts sections array + user daily minutes, returns grouped daily sessions
- [ ] **BE-11** Create Edge Function: `generate-notes` — accepts single section transcript chunk, calls GPT-4o-mini, returns structured notes (summary, key points, terms)
- [ ] **BE-12** Create Edge Function: `generate-quiz` — accepts section transcript chunk, calls GPT-4o-mini, returns 5 multiple choice questions with answers
- [ ] **BE-13** Add error handling and retry logic to all OpenAI Edge Functions

### Frontend Tasks

- [ ] **FE-08** Build One Shot flow screen — URL input → daily time picker → loading state → course ready
- [ ] **FE-09** Build loading/processing screen with step indicators (Fetching transcript → Generating sections → Building your plan)
- [ ] **FE-10** Build Course Home screen — daily plan overview, today's session card, overall progress bar
- [ ] **FE-11** Build Section Player screen — YouTube embed player + section title + timestamps
- [ ] **FE-12** Implement timestamp-based section jumping in YouTube player
- [ ] **FE-13** Build Notes tab — display AI notes alongside video player (tabbed view)
- [ ] **FE-14** Build Quiz screen — multiple choice UI, submit answer, show result, score summary
- [ ] **FE-15** Build Daily Session screen — list of sections for the day with completion checkboxes

### Database Tasks

- [ ] **DB-04** Create `sections` table — id, course_id, title, start_timestamp, end_timestamp, duration, day_number, order_index
- [ ] **DB-05** Create `notes` table — id, section_id, summary, key_points (jsonb), terms (jsonb)
- [ ] **DB-06** Create `quizzes` table — id, section_id, questions (jsonb array of question + options + correct answer)
- [ ] **DB-07** Create `progress` table — id, user_id, section_id, completed (bool), quiz_score, completed_at

---

## Phase 3 — Playlist Mode (Week 3)

### Backend Tasks

- [ ] **BE-14** Create Edge Function: `get-playlist-videos` — accepts playlist URL, returns all video IDs, titles, thumbnails, durations
- [ ] **BE-15** Create Edge Function: `batch-transcripts` — loops through video IDs, fetches all transcripts, handles rate limiting with delays
- [ ] **BE-16** Create Edge Function: `generate-course-structure` — sends all video titles + descriptions to GPT-4o, returns module groupings with titles and learning objectives
- [ ] **BE-17** Reuse `generate-notes` and `generate-quiz` Edge Functions per video in playlist mode
- [ ] **BE-18** Add playlist video count limit for free tier (max 10 videos)

### Frontend Tasks

- [ ] **FE-16** Build Playlist flow screen — URL input → fetching videos preview → confirm → processing
- [ ] **FE-17** Build Course Module screen — expandable module list with lessons inside each module
- [ ] **FE-18** Build Lesson screen — video player + notes + quiz (reuse One Shot components)
- [ ] **FE-19** Build Course Progress screen — module-by-module completion view, overall % complete

### Database Tasks

- [ ] **DB-08** Create `modules` table — id, course_id, title, order_index, learning_objectives (jsonb)
- [ ] **DB-09** Create `videos` table — id, course_id, module_id, youtube_video_id, title, thumbnail, duration, order_index
- [ ] **DB-10** Link `sections`, `notes`, `quizzes`, `progress` tables to `videos` table for playlist mode

---

## Phase 4 — Progress, Streaks & Notifications (Week 4)

### Backend Tasks

- [ ] **BE-19** Create Edge Function: `update-progress` — marks section/video as complete, updates streak count
- [ ] **BE-20** Create streak calculation logic — checks consecutive days with at least one completed session
- [ ] **BE-21** Create Edge Function: `get-user-stats` — returns total courses, total sections completed, current streak, longest streak

### Frontend Tasks

- [ ] **FE-20** Build Progress/Stats screen — streak counter, courses completed, total learning time
- [ ] **FE-21** Implement streak UI — flame icon, current streak number, weekly activity grid
- [ ] **FE-22** Set up Expo Push Notifications — daily reminder at user-set time
- [ ] **FE-23** Build notification settings screen — toggle on/off, set reminder time
- [ ] **FE-24** Implement AsyncStorage caching — cache current course data locally for offline viewing
- [ ] **FE-25** Implement Supabase real-time sync — sync local progress to cloud on reconnect

### Database Tasks

- [ ] **DB-11** Add `streak_count`, `longest_streak`, `last_active_date` fields to `users` table
- [ ] **DB-12** Create `sessions` table — id, user_id, date, total_minutes, sections_completed — for streak calculation
- [ ] **DB-13** Add indexes on `progress.user_id`, `progress.section_id`, `sessions.user_id` for query performance

---

## Phase 5 — Freemium, Polish & Launch (Week 5)

### Backend Tasks

- [ ] **BE-22** Add usage tracking Edge Function — count courses created per user per month
- [ ] **BE-23** Enforce free tier limits in all generation Edge Functions — return 402 error when limit hit
- [ ] **BE-24** Integrate Stripe or RevenueCat for subscription management
- [ ] **BE-25** Create webhook handler for subscription status changes (activate/cancel Pro)

### Frontend Tasks

- [ ] **FE-26** Build Onboarding flow — 3 screens explaining the two modes + value prop
- [ ] **FE-27** Build Paywall screen — free vs pro comparison, subscribe CTA
- [ ] **FE-28** Handle 402 errors gracefully — show upgrade prompt when limit hit
- [ ] **FE-29** Build Profile screen — account info, subscription status, sign out
- [ ] **FE-30** Add loading skeletons to all data-fetching screens
- [ ] **FE-31** Add empty states for new users with no courses
- [ ] **FE-32** Final UI polish pass — spacing, typography, dark mode check
- [ ] **FE-33** Build and test production APK for Play Store submission

### Database Tasks

- [ ] **DB-14** Create `subscriptions` table — id, user_id, plan, status, current_period_end, stripe_customer_id
- [ ] **DB-15** Add RLS policy update — pro features check against `subscriptions` table
- [ ] **DB-16** Set up Supabase database backups

---

## Quick Reference — Edge Functions Summary

| Function | Trigger | AI Used |
|---|---|---|
| `get-youtube-metadata` | URL paste | None |
| `get-transcript` | URL paste | None |
| `chunk-transcript` | After transcript fetch | None |
| `generate-sections` | One Shot mode | GPT-4o |
| `generate-daily-plan` | After sections | GPT-4o-mini |
| `generate-notes` | Per section/video | GPT-4o-mini |
| `generate-quiz` | Per section/video | GPT-4o-mini |
| `get-playlist-videos` | Playlist mode | None |
| `batch-transcripts` | Playlist mode | None |
| `generate-course-structure` | Playlist mode | GPT-4o |
| `update-progress` | Section complete | None |
| `get-user-stats` | Profile/Stats screen | None |
