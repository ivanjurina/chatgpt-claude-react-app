import { Box } from '@mui/material';
import NavBar from './NavBar';
import { Outlet } from 'react-router-dom';

export default function AppLayout() {
  return (
    <main className="flex min-h-screen flex-col items-center">
      <NavBar />
      <Outlet />
    </main>
  );
}
