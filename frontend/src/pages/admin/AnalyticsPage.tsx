import { useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

import DashboardLayout from "../../components/layout/DashboardLayout";
import { authApi, courseApi, meetingApi } from "../../api/services";

const AnalyticsPage = () => {
  const [enrollData, setEnrollData] = useState<Array<{ name: string; count: number }>>([]);
  const [growthData, setGrowthData] = useState<Array<{ month: string; users: number }>>([]);
  const [meetingsData, setMeetingsData] = useState<Array<{ week: string; meetings: number }>>([]);
  const [roleData, setRoleData] = useState<Array<{ name: string; value: number }>>([]);

  useEffect(() => {
    const load = async () => {
      const [usersRes, coursesRes, meetingsRes] = await Promise.all([authApi.listUsers(), courseApi.list(), meetingApi.list()]);
      const users = usersRes.data as Array<{ role: string; created_at: string }>;
      const courses = coursesRes.data as Array<{ id: string; code: string }>;
      const meetings = meetingsRes.data as Array<{ scheduled_at: string }>;

      const roleCounts = users.reduce(
        (acc, u) => {
          acc[u.role] = (acc[u.role] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      );
      setRoleData([
        { name: "Students", value: roleCounts.student || 0 },
        { name: "Professors", value: roleCounts.professor || 0 },
        { name: "Admins", value: roleCounts.admin || 0 }
      ]);

      const byMonth = users.reduce(
        (acc, u) => {
          const month = new Date(u.created_at).toLocaleString("en-US", { month: "short" });
          acc[month] = (acc[month] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      );
      setGrowthData(Object.entries(byMonth).map(([month, usersCount]) => ({ month, users: usersCount })));

      const enrollCounts: Array<{ name: string; count: number }> = [];
      for (const c of courses) {
        const students = await courseApi.students(c.id);
        enrollCounts.push({ name: c.code, count: students.data.length });
      }
      setEnrollData(enrollCounts);

      const weekCounts = meetings.reduce(
        (acc, m) => {
          const d = new Date(m.scheduled_at);
          const start = new Date(d.getFullYear(), 0, 1);
          const week = `W${Math.ceil((((d.getTime() - start.getTime()) / 86400000) + start.getDay() + 1) / 7)}`;
          acc[week] = (acc[week] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      );
      setMeetingsData(Object.entries(weekCounts).map(([week, meetingsCount]) => ({ week, meetings: meetingsCount })));
    };
    void load();
  }, []);

  return (
    <DashboardLayout title="Analytics">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="h-72 rounded-2xl bg-white/70 p-4">
          <h3 className="font-bold">Enrollments per Course</h3>
          <ResponsiveContainer width="100%" height="90%">
            <BarChart data={enrollData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#4F46E5" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="h-72 rounded-2xl bg-white/70 p-4">
          <h3 className="font-bold">User Growth</h3>
          <ResponsiveContainer width="100%" height="90%">
            <LineChart data={growthData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="users" stroke="#06B6D4" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="h-72 rounded-2xl bg-white/70 p-4">
          <h3 className="font-bold">Meetings per Week</h3>
          <ResponsiveContainer width="100%" height="90%">
            <AreaChart data={meetingsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="meetings" stroke="#10B981" fill="#A7F3D0" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="h-72 rounded-2xl bg-white/70 p-4">
          <h3 className="font-bold">Role Distribution</h3>
          <ResponsiveContainer width="100%" height="90%">
            <PieChart>
              <Tooltip />
              <Pie data={roleData} dataKey="value" nameKey="name" fill="#F59E0B" />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AnalyticsPage;
