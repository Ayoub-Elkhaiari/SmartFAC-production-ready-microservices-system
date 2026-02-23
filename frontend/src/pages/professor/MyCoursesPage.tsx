import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";

import DashboardLayout from "../../components/layout/DashboardLayout";
import Modal from "../../components/common/Modal";
import { courseApi } from "../../api/services";
import { useAuthStore } from "../../store/authStore";

interface Course {
  id: string;
  title: string;
  code: string;
  semester: string;
  department: string;
  credits: number;
  description: string;
  max_students: number;
}

const emptyForm = {
  title: "",
  code: "",
  semester: "",
  department: "",
  credits: 3,
  description: "",
  max_students: 30
};

const ProfessorCoursesPage = () => {
  const user = useAuthStore((s) => s.user);
  const [courses, setCourses] = useState<Course[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const load = async () => {
    if (!user) return;
    const res = await courseApi.list();
    setCourses(res.data.filter((c: { professor_id: string }) => c.professor_id === user.id));
  };

  useEffect(() => {
    void load();
  }, [user]);

  const editingCourse = useMemo(() => courses.find((c) => c.id === editingId), [courses, editingId]);

  useEffect(() => {
    if (editingCourse) {
      setForm({
        title: editingCourse.title,
        code: editingCourse.code,
        semester: editingCourse.semester,
        department: editingCourse.department,
        credits: editingCourse.credits,
        description: editingCourse.description,
        max_students: editingCourse.max_students
      });
    } else {
      setForm(emptyForm);
    }
  }, [editingCourse]);

  return (
    <DashboardLayout title="My Courses">
      <button
        className="mb-3 rounded-xl bg-primary px-4 py-2 text-white"
        onClick={() => {
          setEditingId(null);
          setModalOpen(true);
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
              <th>Semester</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {courses.map((c) => (
              <tr key={c.id} className="border-t">
                <td>{c.title}</td>
                <td>{c.code}</td>
                <td>{c.semester}</td>
                <td className="space-x-2">
                  <button
                    className="rounded bg-indigo-100 px-2 py-1"
                    onClick={() => {
                      setEditingId(c.id);
                      setModalOpen(true);
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

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? "Edit Course" : "Create Course"}>
        <div className="grid gap-2">
          <input className="rounded-xl border p-2" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <input className="rounded-xl border p-2" placeholder="Code" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
          <input className="rounded-xl border p-2" placeholder="Semester" value={form.semester} onChange={(e) => setForm({ ...form, semester: e.target.value })} />
          <input className="rounded-xl border p-2" placeholder="Department" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} />
          <input className="rounded-xl border p-2" type="number" placeholder="Credits" value={form.credits} onChange={(e) => setForm({ ...form, credits: Number(e.target.value) })} />
          <input className="rounded-xl border p-2" type="number" placeholder="Max students" value={form.max_students} onChange={(e) => setForm({ ...form, max_students: Number(e.target.value) })} />
          <textarea className="rounded-xl border p-2" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <button
            className="rounded-xl bg-primary px-4 py-2 text-white"
            onClick={async () => {
              if (!user) return;
              const payload = { ...form, professor_id: user.id };
              try {
                if (editingId) {
                  await courseApi.update(editingId, payload);
                  toast.success("Course updated");
                } else {
                  await courseApi.create(payload);
                  toast.success("Course created");
                }
                setModalOpen(false);
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

export default ProfessorCoursesPage;
