import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildCompletionIndex,
  computeDailySummary,
  computeHabitSummary,
  computeStreaks
} from '../src/utils/statistics.js';

const habits = [
  { id: 'h1', name: 'Hydrate' },
  { id: 'h2', name: 'Meditate' },
  { id: 'h3', name: 'Workout' }
];

const dates = [
  '2024-04-01',
  '2024-04-02',
  '2024-04-03',
  '2024-04-04',
  '2024-04-05'
];

const completions = [
  { habitId: 'h1', date: '2024-04-01', completed: true },
  { habitId: 'h1', date: '2024-04-02', completed: true },
  { habitId: 'h1', date: '2024-04-04', completed: true },
  { habitId: 'h2', date: '2024-04-01', completed: true },
  { habitId: 'h2', date: '2024-04-03', completed: true },
  { habitId: 'h2', date: '2024-04-04', completed: true },
  { habitId: 'h3', date: '2024-04-03', completed: true },
  { habitId: 'h3', date: '2024-04-04', completed: true },
  { habitId: 'h3', date: '2024-04-05', completed: true }
];

test('buildCompletionIndex maps dates and habits', () => {
  const index = buildCompletionIndex(habits, completions);
  assert.equal(index['2024-04-04'].h3, true);
  assert.equal(index['2024-04-02'].h2 ?? false, false);
});

test('computeDailySummary calculates percentages', () => {
  const summary = computeDailySummary(habits, completions, dates);
  const firstDay = summary.find((item) => item.date === '2024-04-01');
  assert.equal(firstDay.completedCount, 2);
  assert.equal(firstDay.percentage, 66.7);
  const fourthDay = summary.find((item) => item.date === '2024-04-04');
  assert.equal(fourthDay.completedCount, 3);
  assert.equal(fourthDay.percentage, 100);
});

test('computeHabitSummary finds best day and percentages', () => {
  const summary = computeHabitSummary(habits, completions, dates);
  const hydrate = summary.find((item) => item.habitId === 'h1');
  assert.equal(hydrate.completedDays, 3);
  assert.equal(hydrate.percentage, 60);
  assert.ok(['Mon', 'Tue', 'Thu'].includes(hydrate.bestDay));
  const meditate = summary.find((item) => item.habitId === 'h2');
  assert.equal(meditate.bestDay, 'Thu');
});

test('computeStreaks sorts by longest streak', () => {
  const streaks = computeStreaks(habits, completions, dates);
  assert.equal(streaks[0].habitId, 'h3');
  assert.equal(streaks[0].longestStreak, 3);
  assert.equal(streaks[0].bestDate, '2024-04-05');
  const hydrate = streaks.find((item) => item.habitId === 'h1');
  assert.equal(hydrate.currentStreak, 1);
});
