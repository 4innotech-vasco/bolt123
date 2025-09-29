export interface Habit {
  id: string;
  name: string;
  targetPerWeek?: number;
  color?: string;
}

export interface Completion {
  id?: string;
  habitId: string;
  date: string; // ISO date string YYYY-MM-DD
  completed: boolean;
  recordedAt?: string;
  source?: 'server' | 'local';
}

export interface DateRange {
  start: string; // inclusive ISO date
  end: string; // inclusive ISO date
}

export interface ToggleCompletionPayload {
  habitId: string;
  date: string;
  completed: boolean;
}
