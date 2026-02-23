import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

import DashboardLayout from "../../components/layout/DashboardLayout";
import Modal from "../../components/common/Modal";
import { courseApi, authApi } from "../../api/services";

interface Course {
  id: string;
  title: string;
  code: string;
  department: string;
  semester: string;
  credits: number;
  description: string;
  max_students: number;
  professor_id: string;
}

interface Professor {
  id: string;
  full_name: string;
}

const CoursesPage = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [professors, setProfessors] = useState<Professor[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Course | null>(null);
  const [form, setForm] = useState({
    title: "",
    code: "",
    department: "",
    semester: "",
    credits: 3,
    description: "",
    max_students: 30,
    professor_id: ""
  });

  const load = async () => {
    try {
      const [coursesRes, usersRes] = await Promise.all([courseApi.list(), authApi.listUsers()]);
      setCourses(coursesRes.data);
      setProfessors(usersRes.data.filter((u: { role: string }) => u.role === "professor"));
    } catch {
      setCourses([]);
      setProfessors([]);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  return (
    <DashboardLayout title="Courses Management">
      <button
        className="mb-3 rounded-xl bg-primary px-4 py-2 text-white"
        onClick={() => {
          setEditing(null);
          setForm({ title: "", code: "", department: "", semester: "", credits: 3, description: "", max_students: 30, professor_id: professors[0]?.id || "" });
          setOpen(true);
        }}
      >
        Create Course
      </button>
      <div className="rounded-2xl bg-white/70 p-4">
        <table className="w-full text-left text-sm">
          <thead>
            <tr>
              <th>Title</th>
              <th>Code</th>
              <th>Dept</th>
              <th>Semester</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {courses.map((c) => (
              <tr key={c.id} className="border-t">
                <td>{c.title}</td>
                <td>{c.code}</td>
                <td>{c.department}</td>
                <td>{c.semester}</td>
                <td className="space-x-2">
                  <button
                    className="rounded bg-indigo-100 px-2 py-1"
                    onClick={() => {
                      setEditing(c);
                      setForm({
                        title: c.title,
                        code: c.code,
                        department: c.department,
                        semester: c.semester,
                        credits: c.credits,
                        description: c.description,
                        max_students: c.max_students,
                        professor_id: c.professor_id
                      });
                      setOpen(true);
                    }}
                  >
                    Edit
                  </button>
                  <button
                    className="rounded bg-red-100 px-2 py-1"
                    onClick={async () => {
                      try {
                        await courseApi.delete(c.id);
                        toast.success("Course deleted");
                        await load();
                      } catch (err: unknown) {
                        const detail = axios.isAxiosError(err) ? err.response?.data?.detail : undefined;
                        toast.error(detail || "Delete failed");
                      }
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? "Edit Course" : "Create Course"}>
        <div className="grid gap-2">
          <input className="rounded-xl border p-2" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Title" />
          <input className="rounded-xl border p-2" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="Code" />
          <input className="rounded-xl border p-2" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} placeholder="Department" />
          <input className="rounded-xl border p-2" value={form.semester} onChange={(e) => setForm({ ...form, semester: e.target.value })} placeholder="Semester" />
          <input className="rounded-xl border p-2" type="number" value={form.credits} onChange={(e) => setForm({ ...form, credits: Number(e.target.value) })} placeholder="Credits" />
          <input className="rounded-xl border p-2" type="number" value={form.max_students} onChange={(e) => setForm({ ...form, max_students: Number(e.target.value) })} placeholder="Max students" />
          <select className="rounded-xl border p-2" value={form.professor_id} onChange={(e) => setForm({ ...form, professor_id: e.target.value })}>
            {professors.map((p) => (
              <option key={p.id} value={p.id}>
                {p.full_name}
              </option>
            ))}
          </select>
          <textarea className="rounded-xl border p-2" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" />
          <button
            className="rounded-xl bg-primary px-4 py-2 text-white"
            onClick={async () => {
              try {
                if (editing) {
                  await courseApi.update(editing.id, form);
                  toast.success("Course updated");
                } else {
                  await courseApi.create(form);
                  toast.success("Course created");
                }
                setOpen(false);
                await load();
              } catch (err: unknown) {
                const detail = axios.isAxiosError(err) ? err.response?.data?.detail : undefined;
                toast.error(detail || "Save failed");
              }
            }}
          >
            Save
          </button>
        </div>
      </Modal>
    </DashboardLayout>
  );
};

export default CoursesPage;
