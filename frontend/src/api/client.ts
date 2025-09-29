import type { Completion, DateRange, Habit, ToggleCompletionPayload } from './types';

const JSON_HEADERS = {
  'Content-Type': 'application/json'
};

const apiFetch = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(path, {
    cache: 'no-store',
    credentials: 'same-origin',
    ...init
  });

  if (!response.ok) {
    const message = await response.text().catch(() => response.statusText);
    throw new Error(message || `Request failed with status ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as unknown as T;
  }

  return (await response.json()) as T;
};

export const fetchHabits = async (): Promise<Habit[]> => {
  return apiFetch<Habit[]>('/api/habits');
};

export const fetchCompletions = async (range: DateRange): Promise<Completion[]> => {
  const query = new URLSearchParams({ start: range.start, end: range.end });
  return apiFetch<Completion[]>(`/api/completions?${query.toString()}`);
};

export const toggleCompletionRequest = async (payload: ToggleCompletionPayload): Promise<Completion> => {
  return apiFetch<Completion>('/api/completions/toggle', {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify(payload)
  });
};
