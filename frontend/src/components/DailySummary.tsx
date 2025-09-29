import { useMemo } from 'react';
import { Box, Card, CardContent, CardHeader, Stack, Typography } from '@mui/material';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import type { Habit, Completion } from '../api/types';
import { computeDailySummary } from '../utils/statistics';
import { formatDisplayDate } from '../utils/date';

interface DailySummaryProps {
  habits: Habit[];
  dates: string[];
  completions: Completion[];
}

const DailySummary = ({ habits, dates, completions }: DailySummaryProps) => {
  const data = useMemo(() => computeDailySummary(habits, completions, dates), [habits, completions, dates]);
  const bestDay = useMemo(() => {
    if (!data.length) {
      return null;
    }
    return data.reduce((best, item) => (item.percentage > best.percentage ? item : best));
  }, [data]);
  const average = useMemo(() => {
    if (!data.length) return 0;
    const total = data.reduce((sum, item) => sum + item.percentage, 0);
    return Number((total / data.length).toFixed(1));
  }, [data]);

  return (
    <Card sx={{ height: '100%' }}>
      <CardHeader
        title="Daily Completion Rate"
        subheader={`Average ${average}% completion over the last ${dates.length} days`}
      />
      <CardContent>
        {data.length === 0 ? (
          <Typography color="text.secondary">No completion data available yet.</Typography>
        ) : (
          <Stack spacing={2}>
            <Box sx={{ width: '100%', height: 240 }}>
              <ResponsiveContainer>
                <BarChart data={data} margin={{ top: 8, right: 8, bottom: 8, left: -16 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tickFormatter={formatDisplayDate} interval={data.length > 14 ? 2 : 0} fontSize={12} />
                  <YAxis unit="%" domain={[0, 100]} fontSize={12} />
                  <Tooltip
                    formatter={(value: number) => `${value}%`}
                    labelFormatter={(label) => formatDisplayDate(label as string)}
                  />
                  <Bar dataKey="percentage" fill="#1976d2" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
            <Typography variant="body2" color="text.secondary">
              Best day: {bestDay?.date ? `${formatDisplayDate(bestDay.date)} (${bestDay.percentage}%)` : 'n/a'}
            </Typography>
          </Stack>
        )}
      </CardContent>
    </Card>
  );
};

export default DailySummary;
