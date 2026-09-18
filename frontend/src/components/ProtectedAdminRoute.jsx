import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function ProtectedAdminRoute({ children }) {
  const { user } = useAuth();

  // test@123 ko admin maan rahe hain
  if (!user || user.email !== 'kg0493793@gmail.com') {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedAdminRoute;
