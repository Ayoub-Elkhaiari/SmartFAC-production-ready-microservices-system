import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

import DashboardLayout from "../../components/layout/DashboardLayout";
import { courseApi } from "../../api/services";
import { useAuthStore } from "../../store/authStore";

interface CourseOption {
  id: string;
  title: string;
}

interface Material {
  id: string;
  title: string;
  file_type: string;
  file_url: string;
}

const MaterialsPage = () => {
  const [searchParams] = useSearchParams();
  const initialCourseId = searchParams.get("courseId") || "";
  const user = useAuthStore((s) => s.user);
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState(initialCourseId);
  const [items, setItems] = useState<Material[]>([]);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const loadCourses = async () => {
      if (!user) return;
      const [allCoursesRes, enrollmentsRes] = await Promise.all([courseApi.list(), courseApi.myCourses(user.id)]);
      const enrolledIds = new Set<string>(enrollmentsRes.data.map((e: { course_id: string }) => e.course_id));
      const enrolledCourses = allCoursesRes.data
        .filter((c: { id: string }) => enrolledIds.has(c.id))
        .map((c: { id: string; title: string }) => ({ id: c.id, title: c.title }));
      setCourses(enrolledCourses);
      if (!selectedCourseId && enrolledCourses[0]) {
        setSelectedCourseId(enrolledCourses[0].id);
      }
    };
    void loadCourses();
  }, [user, selectedCourseId]);

  useEffect(() => {
    const loadMaterials = async () => {
      if (!selectedCourseId) {
        setItems([]);
        return;
      }
      const mat = await courseApi.materials(selectedCourseId);
      setItems(mat.data);
    };
    void loadMaterials();
  }, [selectedCourseId]);

  const filtered = useMemo(() => {
    if (filter === "all") return items;
    return items.filter((m) => m.file_type.toLowerCase() === filter.toLowerCase());
  }, [items, filter]);

  return (
    <DashboardLayout title="Materials">
      <div className="mb-4 grid gap-3 md:grid-cols-2">
        <select
          value={selectedCourseId}
          onChange={(e) => setSelectedCourseId(e.target.value)}
          className="rounded-xl border p-3"
        >
          <option value="">Select course</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </select>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="rounded-xl border p-3">
          <option value="all">All types</option>
          <option value="pdf">PDF</option>
          <option value="video">Video</option>
          <option value="doc">Doc</option>
          <option value="link">Link</option>
        </select>
      </div>
      <div className="space-y-3">
        {filtered.map((m) => (
          <div key={m.id} className="rounded-2xl border border-white/20 bg-white/60 p-4 backdrop-blur">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold">{m.title}</h4>
                <p className="text-sm text-slate-500">{m.file_type}</p>
              </div>
              <a href={m.file_url} target="_blank" rel="noreferrer" className="rounded-lg bg-indigo-100 px-3 py-1 text-sm">
                Open
              </a>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <p className="text-slate-500">No information for this course yet.</p>}
      </div>
    </DashboardLayout>
  );
};

export default MaterialsPage;
