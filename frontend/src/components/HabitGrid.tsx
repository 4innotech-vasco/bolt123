import { useMemo } from 'react';
import {
  Alert,
  Box,
  Checkbox,
  CircularProgress,
  LinearProgress,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography
} from '@mui/material';
import type { Habit } from '../api/types';
import type { CompletionIndex } from '../utils/statistics';
import { formatDisplayDate } from '../utils/date';
import type { ToggleCompletionPayload } from '../api/types';

interface HabitGridProps {
  habits: Habit[];
  dates: string[];
  completionIndex: CompletionIndex;
  isLoading: boolean;
  isFetching: boolean;
  isOffline: boolean;
  pendingCount: number;
  toggleCompletion: (payload: ToggleCompletionPayload) => Promise<void> | void;
}

const HabitGrid = ({
  habits,
  dates,
  completionIndex,
  isLoading,
  isFetching,
  isOffline,
  pendingCount,
  toggleCompletion
}: HabitGridProps) => {
  const hasHabits = habits.length > 0;

  const statusLabel = useMemo(() => {
    if (isLoading) return 'Loading habits…';
    if (!hasHabits) return 'No habits configured yet.';
    return `${habits.length} habit${habits.length === 1 ? '' : 's'} tracked`;
  }, [habits.length, hasHabits, isLoading]);

  return (
    <Paper elevation={3} sx={{ p: { xs: 2, md: 3 }, position: 'relative', overflow: 'hidden' }}>
      <Stack direction={{ xs: 'column', md: 'row' }} alignItems={{ xs: 'flex-start', md: 'center' }} justifyContent="space-between" spacing={2} mb={2}>
        <Box>
          <Typography variant="h5" fontWeight={600} gutterBottom>
            22-Day × 7-Habit Grid
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {statusLabel}
          </Typography>
        </Box>
        {isFetching && <LinearProgress sx={{ width: { xs: '100%', md: 240 } }} />}
      </Stack>

      {isOffline && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          You are currently offline. {pendingCount > 0 ? `${pendingCount} change${pendingCount === 1 ? '' : 's'} pending sync.` : 'Changes will sync when you reconnect.'}
        </Alert>
      )}

      {isLoading ? (
        <Stack alignItems="center" py={6}>
          <CircularProgress />
        </Stack>
      ) : (
        <TableContainer sx={{ maxHeight: { xs: 420, md: 520 } }}>
          <Table stickyHeader size="small" aria-label="habit grid">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                {habits.map((habit) => (
                  <TableCell key={habit.id} align="center" sx={{ fontWeight: 600 }}>
                    <Typography variant="body2" fontWeight={600}>
                      {habit.name}
                    </Typography>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {dates.map((date) => (
                <TableRow hover key={date} sx={{ '&:last-of-type td': { borderBottom: 0 } }}>
                  <TableCell component="th" scope="row" sx={{ fontWeight: 500 }}>
                    {formatDisplayDate(date)}
                  </TableCell>
                  {habits.map((habit) => {
                    const checked = completionIndex[date]?.[habit.id] ?? false;
                    const label = `${habit.name} on ${formatDisplayDate(date)}`;
                    return (
                      <TableCell key={`${date}-${habit.id}`} align="center">
                        <Tooltip title={checked ? 'Mark as missed' : 'Mark as complete'} placement="top">
                          <Checkbox
                            color="primary"
                            checked={checked}
                            onChange={(event) =>
                              void toggleCompletion({
                                habitId: habit.id,
                                date,
                                completed: event.target.checked
                              })
                            }
                            inputProps={{ 'aria-label': label }}
                          />
                        </Tooltip>
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Paper>
  );
};

export default HabitGrid;
