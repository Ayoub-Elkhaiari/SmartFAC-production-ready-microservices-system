import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen, CalendarDays, LayoutDashboard, Newspaper, Shield, UserCircle2, Users } from "lucide-react";

import { useAuthStore } from "../../store/authStore";
import RoleBadge from "../common/RoleBadge";

interface LinkItem {
  to: string;
  label: string;
  icon: JSX.Element;
}

const linkSets: Record<string, LinkItem[]> = {
  student: [
    { to: "/student", label: "Dashboard", icon: <LayoutDashboard size={16} /> },
    { to: "/student/courses", label: "My Courses", icon: <BookOpen size={16} /> },
    { to: "/student/enroll", label: "Browse & Enroll", icon: <Users size={16} /> },
    { to: "/student/materials", label: "Materials", icon: <BookOpen size={16} /> },
    { to: "/student/meetings", label: "Meetings", icon: <CalendarDays size={16} /> }
  ],
  professor: [
    { to: "/professor", label: "Dashboard", icon: <LayoutDashboard size={16} /> },
    { to: "/professor/courses", label: "My Courses", icon: <BookOpen size={16} /> },
    { to: "/professor/upload", label: "Upload Materials", icon: <BookOpen size={16} /> },
    { to: "/professor/students", label: "Enrolled Students", icon: <Users size={16} /> },
    { to: "/professor/meetings", label: "Meetings", icon: <CalendarDays size={16} /> },
    { to: "/professor/sessions", label: "Reserve Session", icon: <CalendarDays size={16} /> }
  ],
  admin: [
    { to: "/admin", label: "Dashboard", icon: <LayoutDashboard size={16} /> },
    { to: "/admin/users", label: "Users", icon: <Users size={16} /> },
    { to: "/admin/courses", label: "Courses", icon: <BookOpen size={16} /> },
    { to: "/admin/meetings", label: "Meetings", icon: <CalendarDays size={16} /> },
    { to: "/admin/news", label: "News", icon: <Newspaper size={16} /> },
    { to: "/admin/analytics", label: "Analytics", icon: <Shield size={16} /> }
  ]
};

const Sidebar = () => {
  const { user, clearAuth } = useAuthStore();
  if (!user) return null;

  return (
    <motion.aside initial={{ x: -24, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="flex h-screen w-72 flex-col border-r border-white/30 bg-white/70 p-4 backdrop-blur">
      <div className="rounded-2xl bg-gradient-to-r from-indigo-600 to-cyan-500 p-4 text-white">
        <h2 className="text-xl font-extrabold">Smart Faculty</h2>
        <p className="text-sm opacity-90">University Portal</p>
      </div>

      <nav className="mt-4 flex flex-1 flex-col gap-1">
        {linkSets[user.role].map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `flex items-center gap-2 rounded-xl px-3 py-2 text-sm ${isActive ? "bg-indigo-100 text-indigo-700" : "text-slate-700 hover:bg-slate-100"}`
            }
          >
            {link.icon}
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div className="rounded-2xl border border-white/20 bg-white/60 p-3 backdrop-blur">
        <div className="mb-2 flex items-center gap-2"><UserCircle2 size={18} /> {user.full_name}</div>
        <RoleBadge role={user.role} />
        <button onClick={clearAuth} className="mt-3 w-full rounded-lg border px-2 py-1 text-sm">Logout</button>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
