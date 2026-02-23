import { useEffect, useState } from "react";

import DashboardLayout from "../../components/layout/DashboardLayout";
import StatCard from "../../components/common/StatCard";
import NewsSlider from "../../components/slider/NewsSlider";
import { courseApi, meetingApi } from "../../api/services";
import { useAuthStore } from "../../store/authStore";

const StudentDashboard = () => {
  const user = useAuthStore((s) => s.user);
  const [enrolledCount, setEnrolledCount] = useState("0");
  const [upcomingMeetings, setUpcomingMeetings] = useState("0");
  const [materialCount, setMaterialCount] = useState("0");

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      const enrollments = await courseApi.myCourses(user.id);
      const allMeetings = await meetingApi.list();
      setEnrolledCount(String(enrollments.data.length));
      setUpcomingMeetings(String(allMeetings.data.filter((m: { status: string }) => m.status !== "completed").length));

      let totalMaterials = 0;
      for (const e of enrollments.data) {
        const materials = await courseApi.materials(e.course_id);
        totalMaterials += materials.data.length;
      }
      setMaterialCount(String(totalMaterials));
    };
    void load();
  }, [user]);

  return (
    <DashboardLayout title="Student Dashboard">
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard title="Enrolled Courses" value={enrolledCount} />
        <StatCard title="Upcoming Meetings" value={upcomingMeetings} />
        <StatCard title="Recent Materials" value={materialCount} />
      </div>
      <div className="mt-6">
        <NewsSlider />
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;
