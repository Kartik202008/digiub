import { Navigate } from 'react-router-dom';

function ProtectedAdminRoute({ children }) {
const user = JSON.parse(localStorage.getItem('user'));

// test@123 ko admin maan rahe hain
if (!user || user.email !== 'kg0493793@gmail.com') {
return <Navigate to="/" replace />;
}

return children;
}

export default ProtectedAdminRoute;
