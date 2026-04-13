import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const RoleRoute = ({ children, allowedRoles = [] }) => {
  const { userInfo } = useAuth();

  if (!userInfo) {
    return <Navigate to="/" replace />;
  }

  const userRole = userInfo?.user?.role;

  if (!allowedRoles.includes(userRole)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default RoleRoute;