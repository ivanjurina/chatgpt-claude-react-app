import { useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Button from '@mui/material/Button';
import useAuth from '../../lib/hooks/useAuth';
import ChangePasswordDialog from './ChangePasswordDialog';

export default function NavBar() {
  const { logout } = useAuth();
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);

  return (
    <Box sx={{ width: '100%', pb: 4 }}>
      <AppBar position="static">
        <Toolbar>
          <div className="w-full flex">
            <div className="flex-1" />
            <div className="flex items-center gap-2">
              <Button color="inherit" onClick={() => setPasswordDialogOpen(true)}>
                Change Password
              </Button>
              <Button color="inherit" onClick={logout}>
                Logout
              </Button>
            </div>
          </div>
        </Toolbar>
      </AppBar>
      <ChangePasswordDialog 
        open={passwordDialogOpen}
        onClose={() => setPasswordDialogOpen(false)}
      />
    </Box>
  );
}
