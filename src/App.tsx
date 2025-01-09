import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './screens/public/Login';
import ChatOverview from './screens/private/ChatOverview';
import ChatDetail from './screens/private/ChatDetail';
import MainLayout from './components/layout/MainLayout';

interface PrivateRouteProps {
  children: React.ReactNode;
}

function PrivateRoute({ children }: PrivateRouteProps): JSX.Element {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={
            <PrivateRoute>
              <MainLayout>
                <ChatOverview />
              </MainLayout>
            </PrivateRoute>
          } />
          <Route path="/chat/:id" element={
            <PrivateRoute>
              <MainLayout>
                <ChatDetail />
              </MainLayout>
            </PrivateRoute>
          } />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
