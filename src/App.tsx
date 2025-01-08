import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './lib/hooks/useAuth';
import Routes from './config/Routes';
import { Suspense } from 'react';
import { CircularProgress } from '@mui/material';

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <Suspense fallback={<CircularProgress />}>
          <Routes />
        </Suspense>
      </AuthProvider>
    </Router>
  );
}
