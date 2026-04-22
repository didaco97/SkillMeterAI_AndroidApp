# Skillmeter Edge Function Contract

The mobile app calls these functions through `lib/api.ts` when `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` are configured.

## Runtime Inputs

- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`

Keep third-party secrets inside the deployed Supabase project:

- YouTube Data API key
- OpenAI API key
- Stripe or RevenueCat credentials

## Functions The App Expects

| Function | Request | Response |
|---|---|---|
| `get-profile` | authenticated user | `UserProfile` |
| `get-usage-limits` | authenticated user | `UsageLimits` |
| `get-user-stats` | authenticated user | `UserStats` |
| `get-courses` | authenticated user | `Course[]` |
| `get-progress` | authenticated user | `CourseProgress[]` |
| `get-playlist-videos` | `{ sourceUrl }` | `PlaylistPreview` |
| `create-oneshot-course` | `CourseGenerationInput` | `Course` |
| `create-playlist-course` | `CourseGenerationInput` | `Course` |
| `update-progress` | `CourseProgress` | `CourseProgress` |

## Database Contract Notes

- `public.course_progress` is the canonical backend store for the frontend `CourseProgress` aggregate shape.
- `public.progress` can still be maintained for row-level analytics or reporting, but the app does not send row-per-section payloads.
- `public.daily_sessions` stores the learn-plan cards shown in the Learn tab.
- `public.courses`, `public.sections`, `public.notes`, and `public.quizzes` must be reassembled into the nested frontend `Course` shape before returning from `get-courses`.
- `public.users` now includes `notifications_enabled` and `notification_time`, so `get-profile` can return the same reminder state the Profile screen edits.

## Error Contract

- `400`: frontend surfaces validation errors.
- `401`: frontend shows login or session recovery.
- `402`: frontend opens the upgrade flow.
- `404`: frontend shows not-found or empty state.
- `500`: frontend shows a retryable network error.

`lib/api.ts` maps those statuses into the app's `AppError` codes.

## Local Frontend Fallback

If Supabase is not configured, `lib/api.ts` returns local demo data so every frontend route stays runnable during UI development.
