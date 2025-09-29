import { useMemo } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Chip,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  Stack,
  Typography
} from '@mui/material';
import type { Habit, Completion } from '../api/types';
import { computeHabitSummary } from '../utils/statistics';

interface HabitSummaryProps {
  habits: Habit[];
  dates: string[];
  completions: Completion[];
}

const HabitSummary = ({ habits, dates, completions }: HabitSummaryProps) => {
  const summary = useMemo(() => computeHabitSummary(habits, completions, dates), [habits, completions, dates]);

  return (
    <Card sx={{ height: '100%' }}>
      <CardHeader title="Habit Completion Summary" subheader="Consistency across each habit" />
      <CardContent>
        {summary.length === 0 ? (
          <Typography color="text.secondary">No habits to summarise yet.</Typography>
        ) : (
          <List disablePadding>
            {summary.map((item) => (
              <ListItem key={item.habitId} sx={{ flexDirection: 'column', alignItems: 'stretch', py: 1.5 }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2} mb={1}>
                  <ListItemText
                    primary={
                      <Typography variant="subtitle1" fontWeight={600}>
                        {item.habitName}
                      </Typography>
                    }
                    secondary={`${item.completedDays}/${item.totalDays} days`}
                  />
                  <Chip
                    label={item.bestDay ? `Best on ${item.bestDay}` : 'No best day yet'}
                    color={item.bestDay ? 'primary' : 'default'}
                    variant={item.bestDay ? 'filled' : 'outlined'}
                  />
                </Stack>
                <LinearProgress variant="determinate" value={item.percentage} sx={{ height: 8, borderRadius: 4 }} />
              </ListItem>
            ))}
          </List>
        )}
      </CardContent>
    </Card>
  );
};

export default HabitSummary;
