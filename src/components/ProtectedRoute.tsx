import { Navigate } from 'react-router-dom';
import { useUser } from '../context/userContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user } = useUser();
  const token = localStorage.getItem('token');

  if (!user || !token) {
    // Redirect them to the login page
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
