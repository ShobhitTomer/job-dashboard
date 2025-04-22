// Updated router.tsx file with new user routes

import { createBrowserRouter, Navigate } from "react-router-dom";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardLayout from "./layouts/DashboardLayout";
import JobsPage from "./pages/JobsPage";
import AuthLayout from "./layouts/AuthLayout";
import CreateJob from "./pages/CreateJob";
import ApplicationsPage from "./pages/ApplicationsPage";
import ApplicationDetailPage from "./pages/ApplicationDetailPage";
import CandidateProfilePage from "./pages/CandidateProfilePage";
import CompanyProfilePage from "./pages/CompanyProfilePage";
import UserWelcomePage from "./pages/UserWelcomePage";
import AdminRoute from "./components/AdminRoute";
import UserRoute from "./components/UserRoute";
import UserJobsPage from "./pages/UserJobsPage";
import JobDetailPage from "./pages/JobDetailPage";
import UserApplicationsPage from "./pages/UserApplicationsPage";
import UserApplicationDetail from "./pages/UserApplicationDetail";
import UserProfilePage from "./pages/UserProfilePage";
import UserLayout from "./layouts/UserLayout";
//import PublicLayout from "./layouts/PublicLayout";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/jobs" />,
  },
  // Public routes (accessible without login)
  {
    path: "/",
    element: <PublicLayout />,
    children: [
      {
        path: "jobs",
        element: <UserJobsPage />,
      },
      {
        path: "jobs/:id",
        element: <JobDetailPage />,
      },
    ],
  },
  // Admin dashboard routes
  {
    path: "dashboard",
    element: <DashboardLayout />,
    children: [
      {
        path: "home",
        element: <Navigate to="/dashboard/welcome" />,
      },
      {
        // User welcome page - accessible to all authenticated users
        path: "welcome",
        element: <UserRoute />,
        children: [
          {
            path: "",
            element: <UserWelcomePage />,
          },
        ],
      },
      {
        // Admin routes - only accessible to users with admin role
        element: <AdminRoute />,
        children: [
          {
            path: "company",
            element: <CompanyProfilePage />,
          },
          {
            path: "jobs",
            element: <JobsPage />,
          },
          {
            path: "jobs/create",
            element: <CreateJob />,
          },
          {
            path: "applications",
            element: <ApplicationsPage />,
          },
          {
            path: "applications/:id",
            element: <ApplicationDetailPage />,
          },
          {
            path: "candidates/:id",
            element: <CandidateProfilePage />,
          },
        ],
      },
    ],
  },
  // User account routes
  {
    path: "/",
    element: <UserLayout />,
    children: [
      {
        path: "profile",
        element: <UserRoute />,
        children: [
          {
            path: "",
            element: <UserProfilePage />,
          },
        ],
      },
      {
        path: "applications",
        element: <UserRoute />,
        children: [
          {
            path: "",
            element: <UserApplicationsPage />,
          },
          {
            path: ":id",
            element: <UserApplicationDetail />,
          },
        ],
      },
    ],
  },
  // Auth routes
  {
    path: "/auth",
    element: <AuthLayout />,
    children: [
      {
        path: "login",
        element: <LoginPage />,
      },
      {
        path: "register",
        element: <RegisterPage />,
      },
    ],
  },
]);

export default router;
