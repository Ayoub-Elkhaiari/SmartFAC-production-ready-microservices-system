import { Navigate, Outlet } from "react-router-dom";

import { useAuthStore } from "../store/authStore";
import { Role } from "../types";

const ProtectedRoute = ({ role }: { role?: Role }) => {
  const { user, accessToken } = useAuthStore();
  if (!accessToken || !user) {
    return <Navigate to="/login" replace />;
  }
  if (role && user.role !== role) {
    return <Navigate to="/403" replace />;
  }
  return <Outlet />;
};

export default ProtectedRoute;
