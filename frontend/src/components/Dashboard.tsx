import { Alert, Button, Grid, Stack } from '@mui/material';
import HabitGrid from './HabitGrid';
import DailySummary from './DailySummary';
import HabitSummary from './HabitSummary';
import StreakTracker from './StreakTracker';
import { useHabitData } from '../hooks/useHabitData';

const Dashboard = () => {
  const {
    habits,
    dates,
    completions,
    completionIndex,
    toggleCompletion,
    isLoading,
    isFetching,
    isOffline,
    pendingCount,
    error,
    refetchAll
  } = useHabitData();

  return (
    <Stack spacing={3}>
      {error && (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={() => refetchAll()}>
              Retry
            </Button>
          }
        >
          {error instanceof Error ? error.message : 'Something went wrong while loading habits.'}
        </Alert>
      )}

      <HabitGrid
        habits={habits}
        dates={dates}
        completionIndex={completionIndex}
        isLoading={isLoading}
        isFetching={isFetching}
        isOffline={isOffline}
        pendingCount={pendingCount}
        toggleCompletion={toggleCompletion}
      />

      <Grid container spacing={3}>
        <Grid item xs={12} md={6} lg={4}>
          <DailySummary habits={habits} dates={dates} completions={completions} />
        </Grid>
        <Grid item xs={12} md={6} lg={4}>
          <HabitSummary habits={habits} dates={dates} completions={completions} />
        </Grid>
        <Grid item xs={12} lg={4}>
          <StreakTracker habits={habits} dates={dates} completions={completions} />
        </Grid>
      </Grid>
    </Stack>
  );
};

export default Dashboard;
