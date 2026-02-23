import { useEffect, useState } from "react";

import DashboardLayout from "../../components/layout/DashboardLayout";
import StatCard from "../../components/common/StatCard";
import { authApi, courseApi, meetingApi } from "../../api/services";

const AdminDashboard = () => {
  const [users, setUsers] = useState("0");
  const [courses, setCourses] = useState("0");
  const [meetingsWeek, setMeetingsWeek] = useState("0");

  useEffect(() => {
    const load = async () => {
      const [usersRes, coursesRes, meetingsRes] = await Promise.all([authApi.listUsers(), courseApi.list(), meetingApi.list()]);
      setUsers(String(usersRes.data.length));
      setCourses(String(coursesRes.data.filter((c: { is_active: boolean }) => c.is_active).length));
      const now = new Date();
      const in7 = new Date(now.getTime() + 7 * 86400000);
      setMeetingsWeek(
        String(
          meetingsRes.data.filter((m: { scheduled_at: string }) => {
            const d = new Date(m.scheduled_at);
            return d >= now && d <= in7;
          }).length
        )
      );
    };
    void load();
  }, []);

  return (
    <DashboardLayout title="Admin Dashboard">
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard title="Total Users" value={users} />
        <StatCard title="Active Courses" value={courses} />
        <StatCard title="Meetings This Week" value={meetingsWeek} />
        <StatCard title="System Health" value="OK" />
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
