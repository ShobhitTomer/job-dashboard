import { Navigate, Outlet } from "react-router-dom";
import useTokenStore from "@/store";

// This component wraps routes that should only be accessible to admin users
const AdminRoute = () => {
  const { token, isAdmin } = useTokenStore((state) => state);

  // If not logged in, redirect to login
  if (!token) {
    return <Navigate to="/auth/login" replace />;
  }

  // If logged in but not admin, redirect to user dashboard
  if (!isAdmin()) {
    return <Navigate to="/dashboard/welcome" replace />;
  }

  // If admin, render the protected route
  return <Outlet />;
};

export default AdminRoute;
