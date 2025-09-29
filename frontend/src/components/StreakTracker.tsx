import { useMemo } from 'react';
import {
  Avatar,
  Card,
  CardContent,
  CardHeader,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Typography
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import type { Habit, Completion } from '../api/types';
import { computeStreaks } from '../utils/statistics';
import { formatDisplayDate } from '../utils/date';

interface StreakTrackerProps {
  habits: Habit[];
  dates: string[];
  completions: Completion[];
}

const StreakTracker = ({ habits, dates, completions }: StreakTrackerProps) => {
  const streaks = useMemo(() => computeStreaks(habits, completions, dates), [habits, completions, dates]);

  return (
    <Card sx={{ height: '100%' }}>
      <CardHeader title="Streak Tracker" subheader="Longest streaks across your habits" />
      <CardContent>
        {streaks.length === 0 ? (
          <Typography color="text.secondary">Keep logging to start a streak!</Typography>
        ) : (
          <List disablePadding>
            {streaks.map((streak) => (
              <ListItem key={streak.habitId} sx={{ py: 1 }}>
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    <CheckCircleIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={`${streak.habitName} — ${streak.longestStreak} day${streak.longestStreak === 1 ? '' : 's'} best streak`}
                  secondary={
                    streak.bestDate
                      ? `Best streak ended on ${formatDisplayDate(streak.bestDate)} • Current streak ${streak.currentStreak} day${streak.currentStreak === 1 ? '' : 's'}`
                      : `Current streak ${streak.currentStreak} day${streak.currentStreak === 1 ? '' : 's'}`
                  }
                />
              </ListItem>
            ))}
          </List>
        )}
      </CardContent>
    </Card>
  );
};

export default StreakTracker;
