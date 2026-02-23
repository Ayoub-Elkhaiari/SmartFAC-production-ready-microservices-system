import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";

import DashboardLayout from "../../components/layout/DashboardLayout";
import { courseApi } from "../../api/services";
import { useAuthStore } from "../../store/authStore";

interface Course {
  id: string;
  title: string;
  professor_id: string;
}

interface Material {
  id: string;
  title: string;
  file_type: string;
}

const UploadMaterialPage = () => {
  const user = useAuthStore((s) => s.user);
  const [courses, setCourses] = useState<Course[]>([]);
  const [courseId, setCourseId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [fileType, setFileType] = useState("pdf");
  const [file, setFile] = useState<File | null>(null);
  const [materials, setMaterials] = useState<Material[]>([]);

  const load = async (selectedCourseId?: string) => {
    if (!user) return;
    const coursesRes = await courseApi.list();
    const ownCourses = coursesRes.data.filter((c: Course) => c.professor_id === user.id);
    setCourses(ownCourses);
    const target = selectedCourseId || courseId || ownCourses[0]?.id || "";
    if (target) {
      setCourseId(target);
      const mats = await courseApi.materials(target);
      setMaterials(mats.data);
    }
  };

  useEffect(() => {
    void load();
  }, [user]);

  return (
    <DashboardLayout title="Upload Materials">
      <div className="rounded-2xl bg-white/70 p-6">
        <div className="grid gap-3 md:grid-cols-2">
          <select className="rounded-xl border p-3" value={courseId} onChange={(e) => void load(e.target.value)}>
            <option value="">Select course</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
          <input className="rounded-xl border p-3" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <textarea className="mt-3 w-full rounded-xl border p-3" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <select className="rounded-xl border p-3" value={fileType} onChange={(e) => setFileType(e.target.value)}>
            <option value="pdf">PDF</option>
            <option value="video">Video</option>
            <option value="doc">Doc</option>
            <option value="link">Link</option>
          </select>
          <input type="file" className="rounded-xl border p-2" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        </div>
        <button
          className="mt-4 rounded-xl bg-primary px-4 py-2 text-white"
          onClick={async () => {
            if (!courseId || !file) {
              toast.error("Select course and file");
              return;
            }
            const form = new FormData();
            form.append("title", title);
            form.append("description", description);
            form.append("file_type", fileType);
            form.append("file", file);
            try {
              await courseApi.uploadMaterial(courseId, form);
              toast.success("Material uploaded");
              setTitle("");
              setDescription("");
              setFile(null);
              await load(courseId);
            } catch (err: unknown) {
              const detail = axios.isAxiosError(err) ? err.response?.data?.detail : undefined;
              toast.error(detail || "Upload failed");
            }
          }}
        >
          Upload
        </button>
      </div>

      <div className="mt-4 space-y-2">
        {materials.map((m) => (
          <div key={m.id} className="flex items-center justify-between rounded-xl bg-white p-3">
            <div>
              <div className="font-semibold">{m.title}</div>
              <div className="text-xs text-slate-500">{m.file_type}</div>
            </div>
            <button
              className="rounded bg-red-100 px-3 py-1 text-sm"
              onClick={async () => {
                try {
                  await courseApi.deleteMaterial(courseId, m.id);
                  toast.success("Material deleted");
                  await load(courseId);
                } catch (err: unknown) {
                  const detail = axios.isAxiosError(err) ? err.response?.data?.detail : undefined;
                  toast.error(detail || "Delete failed");
                }
              }}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
};

export default UploadMaterialPage;
