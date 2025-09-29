import type { Completion, Habit } from '../api/types';
import * as impl from './statistics.js';

export type CompletionIndex = Record<string, Record<string, boolean>>;

export interface DailySummaryItem {
  date: string;
  completedCount: number;
  totalHabits: number;
  percentage: number;
}

export interface HabitSummaryItem {
  habitId: string;
  habitName: string;
  completedDays: number;
  totalDays: number;
  percentage: number;
  bestDay: string | null;
}

export interface HabitStreakItem {
  habitId: string;
  habitName: string;
  currentStreak: number;
  longestStreak: number;
  bestDate: string | null;
}

export const buildCompletionIndex = impl.buildCompletionIndex as (
  habits: Habit[],
  completions: Completion[]
) => CompletionIndex;

export const computeDailySummary = impl.computeDailySummary as (
  habits: Habit[],
  completions: Completion[],
  dates: string[]
) => DailySummaryItem[];

export const computeHabitSummary = impl.computeHabitSummary as (
  habits: Habit[],
  completions: Completion[],
  dates: string[]
) => HabitSummaryItem[];

export const computeStreaks = impl.computeStreaks as (
  habits: Habit[],
  completions: Completion[],
  dates: string[]
) => HabitStreakItem[];
