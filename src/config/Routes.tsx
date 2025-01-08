import { Navigate, useRoutes } from 'react-router-dom';
import Login from '../screens/public/Login';
import ChatOverview from '../screens/private/ChatOverview';
import ChatDetail from '../screens/private/ChatDetail';
import AppLayout from '../components/common/AppLayout';
import useAuth from '../lib/hooks/useAuth';

export default function Routes() {
  const { isAuthenticated } = useAuth();

  return useRoutes([
    ...(!isAuthenticated
      ? [
          { path: '/login', element: <Login />, index: true },
          {
            element: <Navigate to={'/login'} />,
            index: true,
            path: '/*',
          },
        ]
      : [
          {
            path: '/',
            element: <AppLayout />,
            children: [
              { element: <ChatOverview />, path: '/chat' },
              { element: <ChatDetail />, path: '/chat/:id' },
              {
                path: '/',
                element: <Navigate to="/chat" />,
              },
            ],
          },
          {
            path: '/*',
            element: <Navigate to="/chat" />,
          },
        ]),
  ]);
}
