import { useEffect, useState } from "react";

import DashboardLayout from "../../components/layout/DashboardLayout";
import { authApi, courseApi } from "../../api/services";
import { useAuthStore } from "../../store/authStore";

interface Course {
  id: string;
  title: string;
  professor_id: string;
}

interface Enrollment {
  id: string;
  student_id: string;
  enrolled_at: string;
  status: string;
}

const EnrolledStudentsPage = () => {
  const user = useAuthStore((s) => s.user);
  const [courses, setCourses] = useState<Course[]>([]);
  const [courseId, setCourseId] = useState("");
  const [rows, setRows] = useState<Enrollment[]>([]);
  const [studentNames, setStudentNames] = useState<Record<string, string>>({});

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      const all = await courseApi.list();
      const own = all.data.filter((c: Course) => c.professor_id === user.id);
      setCourses(own);
      const first = own[0]?.id;
      if (first) {
        setCourseId(first);
      }
    };
    void load();
  }, [user]);

  useEffect(() => {
    const loadStudents = async () => {
      if (!courseId) {
        setRows([]);
        setStudentNames({});
        return;
      }
      const res = await courseApi.students(courseId);
      setRows(res.data);
      const pairs = await Promise.all(
        res.data.map(async (e: Enrollment) => {
          try {
            const u = await authApi.getUserById(e.student_id);
            return [e.student_id, u.data.full_name] as const;
          } catch {
            return [e.student_id, e.student_id] as const;
          }
        })
      );
      const map: Record<string, string> = {};
      pairs.forEach(([id, name]) => {
        map[id] = name;
      });
      setStudentNames(map);
    };
    void loadStudents();
  }, [courseId]);

  return (
    <DashboardLayout title="Enrolled Students">
      <div className="rounded-2xl bg-white/70 p-4">
        <div className="mb-3 flex justify-between">
          <select className="rounded-xl border p-2" value={courseId} onChange={(e) => setCourseId(e.target.value)}>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
          <button className="rounded-xl border px-3" onClick={() => {
            const csv = ["student_id,enrolled_at,status", ...rows.map((r) => `${r.student_id},${r.enrolled_at},${r.status}`)].join("\n");
            const blob = new Blob([csv], { type: "text/csv" });
            const a = document.createElement("a");
            a.href = URL.createObjectURL(blob);
            a.download = "enrolled_students.csv";
            a.click();
          }}>Export CSV</button>
        </div>
        <table className="w-full text-left text-sm">
          <thead>
            <tr>
              <th>Student</th>
              <th>Student ID</th>
              <th>Enrollment Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-t">
                <td>{studentNames[row.student_id] || "Unknown"}</td>
                <td>{row.student_id}</td>
                <td>{new Date(row.enrolled_at).toLocaleDateString()}</td>
                <td>{row.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!rows.length && <p className="mt-3 text-sm text-slate-500">No enrolled students yet.</p>}
      </div>
    </DashboardLayout>
  );
};

export default EnrolledStudentsPage;
