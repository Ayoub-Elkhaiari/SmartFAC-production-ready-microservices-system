import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import DashboardLayout from "../../components/layout/DashboardLayout";
import Spinner from "../../components/common/Spinner";
import { courseApi } from "../../api/services";
import { useAuthStore } from "../../store/authStore";

interface CourseRow {
  id: string;
  title: string;
  code: string;
  credits: number;
  semester: string;
}

const StudentCoursesPage = () => {
  const [semester, setSemester] = useState("");
  const [courses, setCourses] = useState<CourseRow[]>([]);
  const [loading, setLoading] = useState(true);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      try {
        const [allCoursesRes, enrollmentsRes] = await Promise.all([courseApi.list(), courseApi.myCourses(user.id)]);
        const allCourses: CourseRow[] = allCoursesRes.data;
        const enrolledIds = new Set<string>(enrollmentsRes.data.map((e: { course_id: string }) => e.course_id));
        setCourses(allCourses.filter((c) => enrolledIds.has(c.id)));
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [user]);

  const filtered = useMemo(
    () => courses.filter((c) => !semester || c.semester.toLowerCase().includes(semester.toLowerCase())),
    [courses, semester]
  );

  return (
    <DashboardLayout title="My Courses">
      <input
        value={semester}
        onChange={(e) => setSemester(e.target.value)}
        placeholder="Filter by semester"
        className="mb-4 rounded-xl border p-2"
      />
      {loading ? (
        <Spinner />
      ) : filtered.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((c) => (
            <div key={c.id} className="rounded-2xl border border-white/20 bg-white/60 p-4 backdrop-blur">
              <h3 className="font-bold">{c.title}</h3>
              <p className="text-sm text-slate-500">
                {c.code} • {c.credits} credits
              </p>
              <div className="mt-3 flex gap-2">
                <Link className="rounded-lg bg-indigo-100 px-3 py-1 text-sm" to={`/student/course/${c.id}`}>
                  View Details
                </Link>
                <Link className="rounded-lg bg-cyan-100 px-3 py-1 text-sm" to={`/student/materials?courseId=${c.id}`}>
                  View Materials
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-white/20 bg-white/60 p-4 backdrop-blur">No enrolled courses yet.</div>
      )}
    </DashboardLayout>
  );
};

export default StudentCoursesPage;
