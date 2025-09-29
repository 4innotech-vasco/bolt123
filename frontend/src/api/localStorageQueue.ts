import type { Completion, DateRange, ToggleCompletionPayload, Habit } from './types';

const HABIT_CACHE_KEY = 'habit-dashboard:habits';
const COMPLETION_CACHE_KEY = 'habit-dashboard:completions';
const PENDING_MUTATIONS_KEY = 'habit-dashboard:pending-toggle';

const hasWindow = typeof window !== 'undefined';
const storage = hasWindow ? window.localStorage : undefined;

const memoryStore = new Map<string, string>();

const read = (key: string): string | null => {
  if (storage) {
    return storage.getItem(key);
  }
  return memoryStore.get(key) ?? null;
};

const write = (key: string, value: string) => {
  if (storage) {
    storage.setItem(key, value);
  } else {
    memoryStore.set(key, value);
  }
};

const remove = (key: string) => {
  if (storage) {
    storage.removeItem(key);
  }
  memoryStore.delete(key);
};

const safeParse = <T>(value: string | null): T | undefined => {
  if (!value) return undefined;
  try {
    return JSON.parse(value) as T;
  } catch (error) {
    console.warn('Failed to parse cached data', error);
    return undefined;
  }
};

const filterByRange = (items: Completion[], range?: DateRange) => {
  if (!range) return items;
  return items.filter((completion) => completion.date >= range.start && completion.date <= range.end);
};

export const LocalStorageQueue = {
  getHabits(): Habit[] {
    return safeParse<Habit[]>(read(HABIT_CACHE_KEY)) ?? [];
  },
  setHabits(habits: Habit[]) {
    write(HABIT_CACHE_KEY, JSON.stringify(habits));
  },
  getCompletions(range?: DateRange): Completion[] {
    const completions = safeParse<Completion[]>(read(COMPLETION_CACHE_KEY)) ?? [];
    return filterByRange(completions, range);
  },
  setCompletions(completions: Completion[]) {
    write(COMPLETION_CACHE_KEY, JSON.stringify(completions));
  },
  getPending(): ToggleCompletionPayload[] {
    return safeParse<ToggleCompletionPayload[]>(read(PENDING_MUTATIONS_KEY)) ?? [];
  },
  setPending(queue: ToggleCompletionPayload[]) {
    write(PENDING_MUTATIONS_KEY, JSON.stringify(queue));
  },
  pushPending(payload: ToggleCompletionPayload) {
    const queue = this.getPending();
    queue.push(payload);
    this.setPending(queue);
  },
  shiftPending(): ToggleCompletionPayload | undefined {
    const queue = this.getPending();
    const next = queue.shift();
    this.setPending(queue);
    return next;
  },
  clearPending() {
    remove(PENDING_MUTATIONS_KEY);
  },
  hasPending(): boolean {
    return this.getPending().length > 0;
  }
};
