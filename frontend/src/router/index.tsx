import { createBrowserRouter } from "react-router-dom";

import ProtectedRoute from "./ProtectedRoute";
import LoginPage from "../pages/auth/LoginPage";
import ForgotPasswordPage from "../pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "../pages/auth/ResetPasswordPage";
import StudentDashboard from "../pages/student/StudentDashboard";
import StudentCoursesPage from "../pages/student/MyCoursesPage";
import CourseDetailPage from "../pages/student/CourseDetailPage";
import EnrollPage from "../pages/student/EnrollPage";
import MaterialsPage from "../pages/student/MaterialsPage";
import StudentMeetingsPage from "../pages/student/MeetingsPage";
import ProfessorDashboard from "../pages/professor/ProfessorDashboard";
import ProfessorCoursesPage from "../pages/professor/MyCoursesPage";
import UploadMaterialPage from "../pages/professor/UploadMaterialPage";
import EnrolledStudentsPage from "../pages/professor/EnrolledStudentsPage";
import CreateMeetingPage from "../pages/professor/CreateMeetingPage";
import SessionsPage from "../pages/professor/SessionsPage";
import AdminDashboard from "../pages/admin/AdminDashboard";
import UsersPage from "../pages/admin/UsersPage";
import AdminCoursesPage from "../pages/admin/CoursesPage";
import AdminMeetingsPage from "../pages/admin/MeetingsPage";
import NewsManagerPage from "../pages/admin/NewsManagerPage";
import AnalyticsPage from "../pages/admin/AnalyticsPage";

const ForbiddenPage = () => <div className="p-10 text-center text-red-600">403 Forbidden</div>;

export const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  { path: "/forgot-password", element: <ForgotPasswordPage /> },
  { path: "/reset-password", element: <ResetPasswordPage /> },
  { path: "/403", element: <ForbiddenPage /> },

  {
    element: <ProtectedRoute role="student" />,
    children: [
      { path: "/student", element: <StudentDashboard /> },
      { path: "/student/courses", element: <StudentCoursesPage /> },
      { path: "/student/course/:id", element: <CourseDetailPage /> },
      { path: "/student/enroll", element: <EnrollPage /> },
      { path: "/student/materials", element: <MaterialsPage /> },
      { path: "/student/meetings", element: <StudentMeetingsPage /> }
    ]
  },
  {
    element: <ProtectedRoute role="professor" />,
    children: [
      { path: "/professor", element: <ProfessorDashboard /> },
      { path: "/professor/courses", element: <ProfessorCoursesPage /> },
      { path: "/professor/upload", element: <UploadMaterialPage /> },
      { path: "/professor/students", element: <EnrolledStudentsPage /> },
      { path: "/professor/meetings", element: <CreateMeetingPage /> },
      { path: "/professor/sessions", element: <SessionsPage /> }
    ]
  },
  {
    element: <ProtectedRoute role="admin" />,
    children: [
      { path: "/admin", element: <AdminDashboard /> },
      { path: "/admin/users", element: <UsersPage /> },
      { path: "/admin/courses", element: <AdminCoursesPage /> },
      { path: "/admin/meetings", element: <AdminMeetingsPage /> },
      { path: "/admin/news", element: <NewsManagerPage /> },
      { path: "/admin/analytics", element: <AnalyticsPage /> }
    ]
  },
  { path: "*", element: <LoginPage /> }
]);
