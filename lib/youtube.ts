import type { CourseMode } from '@/types/skillmeter';

export type YoutubeValidationResult =
  | { ok: true; videoId?: string; playlistId?: string; normalizedUrl: string }
  | { ok: false; message: string };

const youtubeHosts = new Set(['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtu.be']);

export function validateYoutubeUrl(rawUrl: string, mode: CourseMode): YoutubeValidationResult {
  const value = rawUrl.trim();

  if (!value) {
    return { ok: false, message: 'Paste a YouTube URL first.' };
  }

  let parsed: URL;
  try {
    parsed = new URL(value.startsWith('http') ? value : `https://${value}`);
  } catch {
    return { ok: false, message: 'That does not look like a valid URL.' };
  }

  if (!youtubeHosts.has(parsed.hostname)) {
    return { ok: false, message: 'Use a youtube.com or youtu.be link.' };
  }

  const videoId = extractYoutubeVideoId(parsed);
  const playlistId = parsed.searchParams.get('list') ?? undefined;

  if (mode === 'oneshot' && !videoId) {
    return { ok: false, message: 'One Shot needs a YouTube video URL.' };
  }

  if (mode === 'playlist' && !playlistId) {
    return { ok: false, message: 'Playlist mode needs a YouTube playlist URL.' };
  }

  return {
    ok: true,
    videoId,
    playlistId,
    normalizedUrl: parsed.toString(),
  };
}

export function extractYoutubeVideoId(parsedOrUrl: URL | string) {
  const parsed = typeof parsedOrUrl === 'string' ? new URL(parsedOrUrl.startsWith('http') ? parsedOrUrl : `https://${parsedOrUrl}`) : parsedOrUrl;

  if (parsed.hostname === 'youtu.be') {
    return parsed.pathname.replace('/', '') || undefined;
  }

  if (parsed.pathname.includes('/shorts/')) {
    return parsed.pathname.split('/shorts/')[1]?.split('/')[0];
  }

  return parsed.searchParams.get('v') ?? undefined;
}

export function secondsToTimestamp(seconds: number) {
  const safeSeconds = Math.max(0, Math.round(seconds));
  const minutes = Math.floor(safeSeconds / 60);
  const remainingSeconds = safeSeconds % 60;
  return `${minutes}:${String(remainingSeconds).padStart(2, '0')}`;
}
