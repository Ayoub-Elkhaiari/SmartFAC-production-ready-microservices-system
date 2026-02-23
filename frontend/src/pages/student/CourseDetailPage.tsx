import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import DashboardLayout from "../../components/layout/DashboardLayout";
import { courseApi } from "../../api/services";

interface CourseDetail {
  id: string;
  title: string;
  code: string;
  description: string;
  semester: string;
  department: string;
  credits: number;
}

const CourseDetailPage = () => {
  const { id } = useParams();
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [materialsCount, setMaterialsCount] = useState(0);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      try {
        const [courseRes, materialsRes] = await Promise.all([courseApi.get(id), courseApi.materials(id)]);
        setCourse(courseRes.data);
        setMaterialsCount(materialsRes.data.length);
      } catch {
        setCourse(null);
      }
    };
    void load();
  }, [id]);

  return (
    <DashboardLayout title="Course Detail">
      {course ? (
        <div className="rounded-2xl border border-white/20 bg-white/60 p-6 backdrop-blur">
          <h2 className="text-xl font-bold">{course.title}</h2>
          <p className="mt-2 text-sm text-slate-600">{course.code} • {course.department} • {course.semester}</p>
          <p className="mt-4">{course.description}</p>
          <p className="mt-4 text-sm text-slate-600">Credits: {course.credits}</p>
          <p className="mt-2 text-sm text-slate-600">Materials: {materialsCount}</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-white/20 bg-white/60 p-4 backdrop-blur">No information for this course yet.</div>
      )}
    </DashboardLayout>
  );
};

export default CourseDetailPage;
