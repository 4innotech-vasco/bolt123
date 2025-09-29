import { useCallback, useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchCompletions, fetchHabits, toggleCompletionRequest } from '../api/client';
import { LocalStorageQueue } from '../api/localStorageQueue';
import type { Completion, Habit, ToggleCompletionPayload } from '../api/types';
import { getDateRangeForDays, getLastNDates } from '../utils/date';
import { buildCompletionIndex } from '../utils/statistics';

const ROW_COUNT = 22;
const COLUMN_COUNT = 7;

const applyToggleToList = (completions: Completion[], payload: ToggleCompletionPayload): Completion[] => {
  const next = [...completions];
  const identifier = (completion: Completion) => completion.habitId === payload.habitId && completion.date === payload.date;
  const existingIndex = next.findIndex(identifier);

  if (payload.completed) {
    if (existingIndex >= 0) {
      next[existingIndex] = {
        ...next[existingIndex],
        completed: true,
        source: next[existingIndex].source ?? 'local'
      };
      return next;
    }
    return [
      ...next,
      {
        habitId: payload.habitId,
        date: payload.date,
        completed: true,
        source: 'local',
        id: `${payload.habitId}:${payload.date}`
      }
    ];
  }

  if (existingIndex >= 0) {
    next.splice(existingIndex, 1);
    return next;
  }

  return completions;
};

const useNavigatorOnline = () => {
  const [isOffline, setIsOffline] = useState(() => {
    if (typeof navigator === 'undefined') return false;
    return !navigator.onLine;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return [isOffline, setIsOffline] as const;
};

export const useHabitData = () => {
  const dates = useMemo(() => getLastNDates(ROW_COUNT), []);
  const dateRange = useMemo(() => getDateRangeForDays(ROW_COUNT), []);
  const queryClient = useQueryClient();
  const [isOffline, setIsOffline] = useNavigatorOnline();
  const [pendingCount, setPendingCount] = useState(() => LocalStorageQueue.getPending().length);

  const habitsQuery = useQuery<Habit[]>({
    queryKey: ['habits'],
    queryFn: fetchHabits,
    initialData: () => {
      const cached = LocalStorageQueue.getHabits();
      return cached.length ? cached : undefined;
    },
    onSuccess: (data) => {
      LocalStorageQueue.setHabits(data);
    }
  });

  const completionKey = ['completions', dateRange.start, dateRange.end] as const;

  const completionsQuery = useQuery<Completion[]>({
    queryKey: completionKey,
    queryFn: () => fetchCompletions(dateRange),
    enabled: (habitsQuery.data?.length ?? 0) > 0,
    initialData: () => {
      const cached = LocalStorageQueue.getCompletions(dateRange);
      return cached.length ? cached : undefined;
    },
    onSuccess: (data) => {
      LocalStorageQueue.setCompletions(data);
    }
  });

  const updatePendingCount = useCallback(() => {
    setPendingCount(LocalStorageQueue.getPending().length);
  }, []);

  const applyOptimisticUpdate = useCallback(
    (payload: ToggleCompletionPayload, storePending: boolean) => {
      const current = (queryClient.getQueryData(completionKey) as Completion[] | undefined) ?? [];
      const updated = applyToggleToList(current, payload);
      queryClient.setQueryData(completionKey, updated);
      LocalStorageQueue.setCompletions(updated);
      if (storePending) {
        LocalStorageQueue.pushPending(payload);
        updatePendingCount();
      }
      return updated;
    },
    [completionKey, queryClient, updatePendingCount]
  );

  const mutation = useMutation({
    mutationFn: toggleCompletionRequest,
    onMutate: async (payload: ToggleCompletionPayload) => {
      await queryClient.cancelQueries({ queryKey: completionKey });
      const previous = (queryClient.getQueryData(completionKey) as Completion[] | undefined) ?? [];
      const optimistic = applyToggleToList(previous, payload);
      queryClient.setQueryData(completionKey, optimistic);
      LocalStorageQueue.setCompletions(optimistic);
      return { previous };
    },
    onError: (_error, payload: ToggleCompletionPayload) => {
      LocalStorageQueue.pushPending(payload);
      updatePendingCount();
      setIsOffline(true);
    },
    onSuccess: () => {
      updatePendingCount();
      setIsOffline(false);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: completionKey });
    }
  });

  const flushPending = useCallback(async () => {
    if (!LocalStorageQueue.hasPending()) return;
    const queue = LocalStorageQueue.getPending();
    if (!queue.length) {
      updatePendingCount();
      return;
    }

    let syncedAny = false;
    let failureIndex = -1;

    for (let index = 0; index < queue.length; index += 1) {
      const payload = queue[index];
      try {
        await toggleCompletionRequest(payload);
        syncedAny = true;
      } catch (error) {
        failureIndex = index;
        setIsOffline(true);
        break;
      }
    }

    if (failureIndex >= 0) {
      LocalStorageQueue.setPending(queue.slice(failureIndex));
    } else {
      LocalStorageQueue.clearPending();
      setIsOffline(false);
    }

    updatePendingCount();

    if (syncedAny) {
      queryClient.invalidateQueries({ queryKey: completionKey });
    }
  }, [completionKey, queryClient, setIsOffline, updatePendingCount]);

  useEffect(() => {
    if (!isOffline) {
      flushPending();
    }
  }, [flushPending, isOffline]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isOffline) {
        flushPending();
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [flushPending, isOffline]);

  const toggleCompletion = useCallback(
    async (payload: ToggleCompletionPayload) => {
      const online = typeof navigator === 'undefined' ? true : navigator.onLine;
      if (!online) {
        setIsOffline(true);
        applyOptimisticUpdate(payload, true);
        return;
      }
      try {
        await mutation.mutateAsync(payload);
      } catch (error) {
        applyOptimisticUpdate(payload, false);
        throw error;
      }
    },
    [applyOptimisticUpdate, mutation, setIsOffline]
  );

  const habits = useMemo(() => (habitsQuery.data ?? []).slice(0, COLUMN_COUNT), [habitsQuery.data]);
  const completions = (completionsQuery.data ?? []) as Completion[];
  const completionIndex = useMemo(() => buildCompletionIndex(habits, completions), [habits, completions]);

  return {
    habits,
    dates,
    dateRange,
    completions,
    completionIndex,
    isLoading: habitsQuery.isLoading || completionsQuery.isLoading,
    isFetching: habitsQuery.isFetching || completionsQuery.isFetching,
    error: habitsQuery.error ?? completionsQuery.error,
    isOffline,
    pendingCount,
    toggleCompletion,
    refetchAll: () => {
      habitsQuery.refetch();
      completionsQuery.refetch();
      flushPending();
    }
  };
};

export type HabitData = ReturnType<typeof useHabitData>;
