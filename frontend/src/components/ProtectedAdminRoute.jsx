import { Navigate } from 'react-router-dom';

function ProtectedAdminRoute({ children }) {
  const user = JSON.parse(localStorage.getItem('user'));

  // Abhi tester@123 ko admin maan rahe hain
  if (!user || user.email !== 'tester@123') {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedAdminRoute;