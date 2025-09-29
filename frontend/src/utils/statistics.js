const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const buildCompletionIndex = (habits, completions) => {
  const relevantHabitIds = new Set((habits ?? []).map((habit) => habit.id));
  return (completions ?? []).reduce((acc, completion) => {
    if (!relevantHabitIds.has(completion.habitId)) {
      return acc;
    }
    const dateKey = completion.date;
    if (!acc[dateKey]) {
      acc[dateKey] = {};
    }
    acc[dateKey][completion.habitId] = Boolean(completion.completed);
    return acc;
  }, {});
};

export const computeDailySummary = (habits, completions, dates) => {
  const totalHabits = habits?.length ?? 0;
  const index = buildCompletionIndex(habits, completions);
  return (dates ?? []).map((date) => {
    const dayCompletions = index[date] ?? {};
    const completedCount = habits.reduce((count, habit) => {
      return count + (dayCompletions[habit.id] ? 1 : 0);
    }, 0);
    const percentage = totalHabits === 0 ? 0 : Number(((completedCount / totalHabits) * 100).toFixed(1));
    return {
      date,
      completedCount,
      totalHabits,
      percentage
    };
  });
};

export const computeHabitSummary = (habits, completions, dates) => {
  const index = buildCompletionIndex(habits, completions);
  return (habits ?? []).map((habit) => {
    let completedDays = 0;
    const dayFrequency = new Array(7).fill(0);
    let bestDayIndex = -1;
    let bestDayScore = 0;
    let bestDayDate = null;

    (dates ?? []).forEach((date) => {
      const completed = Boolean(index[date]?.[habit.id]);
      if (completed) {
        completedDays += 1;
        const dayOfWeek = new Date(date).getDay();
        dayFrequency[dayOfWeek] += 1;
        if (
          bestDayIndex === -1 ||
          dayFrequency[dayOfWeek] > bestDayScore ||
          (dayFrequency[dayOfWeek] === bestDayScore && (!bestDayDate || date > bestDayDate))
        ) {
          bestDayIndex = dayOfWeek;
          bestDayScore = dayFrequency[dayOfWeek];
          bestDayDate = date;
        }
      }
    });

    const totalDays = dates?.length ?? 0;
    const percentage = totalDays === 0 ? 0 : Number(((completedDays / totalDays) * 100).toFixed(1));

    return {
      habitId: habit.id,
      habitName: habit.name,
      completedDays,
      totalDays,
      percentage,
      bestDay: bestDayIndex >= 0 ? DAY_NAMES[bestDayIndex] : null
    };
  });
};

const computeHabitStreak = (habitId, habitName, dates, index) => {
  let rolling = 0;
  let longest = 0;
  let bestDate = null;

  (dates ?? []).forEach((date) => {
    if (index[date]?.[habitId]) {
      rolling += 1;
      if (rolling >= longest) {
        longest = rolling;
        bestDate = date;
      }
    } else {
      rolling = 0;
    }
  });

  let current = 0;
  let seenCompletion = false;
  for (let i = (dates ?? []).length - 1; i >= 0; i -= 1) {
    const date = dates[i];
    const completed = Boolean(index[date]?.[habitId]);
    if (!seenCompletion && !completed) {
      continue;
    }
    seenCompletion = true;
    if (completed) {
      current += 1;
    } else {
      break;
    }
  }

  return {
    habitId,
    habitName,
    currentStreak: current,
    longestStreak: longest,
    bestDate
  };
};

export const computeStreaks = (habits, completions, dates) => {
  const index = buildCompletionIndex(habits, completions);
  return (habits ?? [])
    .map((habit) => computeHabitStreak(habit.id, habit.name, dates, index))
    .sort((a, b) => b.longestStreak - a.longestStreak);
};
