import { Navigate, Outlet } from "react-router-dom";
import useTokenStore from "@/store";

// This component wraps routes that should be accessible to any authenticated user
const UserRoute = () => {
  const { token } = useTokenStore((state) => state);

  // If not logged in, redirect to login
  if (!token) {
    return <Navigate to="/auth/login" replace />;
  }

  // If logged in (any role), render the protected route
  return <Outlet />;
};

export default UserRoute;
