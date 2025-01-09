import { useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, IconButton, Button, Typography } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import ChangePasswordDialog from '../common/ChangePasswordDialog';
import { useState } from 'react';

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const { setToken, setUser, setIsAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <AppBar position="static">
        <Toolbar className="justify-between">
          <Typography variant="h6">Chat App</Typography>
          <div>
            <Button 
              color="inherit" 
              onClick={() => setIsChangePasswordOpen(true)}
            >
              Change Password
            </Button>
            <Button 
              color="inherit" 
              onClick={handleLogout}
            >
              Logout
            </Button>
          </div>
        </Toolbar>
      </AppBar>

      <main className="flex-1 container mx-auto">
        {children}
      </main>

      <ChangePasswordDialog
        open={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
      />
    </div>
  );
} 