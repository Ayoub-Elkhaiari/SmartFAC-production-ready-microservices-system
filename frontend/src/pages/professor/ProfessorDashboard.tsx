import { useEffect, useState } from "react";

import DashboardLayout from "../../components/layout/DashboardLayout";
import StatCard from "../../components/common/StatCard";
import NewsSlider from "../../components/slider/NewsSlider";
import { courseApi, meetingApi } from "../../api/services";
import { useAuthStore } from "../../store/authStore";

const ProfessorDashboard = () => {
  const user = useAuthStore((s) => s.user);
  const [activeCourses, setActiveCourses] = useState("0");
  const [studentsCount, setStudentsCount] = useState("0");
  const [pendingSessions, setPendingSessions] = useState("0");

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      const coursesRes = await courseApi.list();
      const myCourses = coursesRes.data.filter((c: { professor_id: string }) => c.professor_id === user.id);
      setActiveCourses(String(myCourses.length));

      let totalStudents = 0;
      for (const c of myCourses) {
        const students = await courseApi.students(c.id);
        totalStudents += students.data.length;
      }
      setStudentsCount(String(totalStudents));

      const sessions = await meetingApi.sessions();
      const minePending = sessions.data.filter((s: { professor_id: string; status: string }) => s.professor_id === user.id && s.status === "pending");
      setPendingSessions(String(minePending.length));
    };
    void load();
  }, [user]);

  return (
    <DashboardLayout title="Professor Dashboard">
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard title="Active Courses" value={activeCourses} />
        <StatCard title="Total Students" value={studentsCount} />
        <StatCard title="Pending Sessions" value={pendingSessions} />
      </div>
      <div className="mt-6"><NewsSlider /></div>
    </DashboardLayout>
  );
};

export default ProfessorDashboard;
