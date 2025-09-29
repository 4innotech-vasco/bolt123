import { Container, Stack, Typography } from '@mui/material';
import Dashboard from './components/Dashboard';

const App = () => (
  <Container maxWidth="xl">
    <Stack spacing={4} py={{ xs: 2, md: 4 }}>
      <Typography variant="h3" component="h1" fontWeight={600} textAlign={{ xs: 'center', md: 'left' }}>
        Habit Insights
      </Typography>
      <Dashboard />
    </Stack>
  </Container>
);

export default App;
