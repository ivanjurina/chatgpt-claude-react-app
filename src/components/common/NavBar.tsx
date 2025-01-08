import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Button from '@mui/material/Button';
import useAuth from '../../lib/hooks/useAuth';

export default function NavBar() {
  const { logout } = useAuth();

  return (
    <Box sx={{ width: '100%', pb: 4 }}>
      <AppBar position="static">
        <Toolbar>
          <div className="w-full flex">
            <div className="flex-1" />
            <Button color="inherit" onClick={logout}>
              Logout
            </Button>
          </div>
        </Toolbar>
      </AppBar>
    </Box>
  );
}
