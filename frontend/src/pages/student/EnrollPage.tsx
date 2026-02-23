import { useMemo, useState } from "react";
import { useEffect } from "react";
import toast from "react-hot-toast";

import DashboardLayout from "../../components/layout/DashboardLayout";
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import { useCourses } from "../../hooks/useCourses";
import { courseApi } from "../../api/services";
import { useAuthStore } from "../../store/authStore";

const EnrollPage = () => {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string>("");
  const [enrolled, setEnrolled] = useState<Set<string>>(new Set());
  const { courses } = useCourses();
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      try {
        const res = await courseApi.myCourses(user.id);
        setEnrolled(new Set(res.data.map((e: { course_id: string }) => e.course_id)));
      } catch {
        setEnrolled(new Set());
      }
    };
    void load();
  }, [user]);

  const rows = useMemo(
    () => courses.filter((c) => `${c.title} ${c.code} ${c.department}`.toLowerCase().includes(search.toLowerCase())),
    [courses, search]
  );

  const selected = rows.find((r) => r.id === selectedId);

  return (
    <DashboardLayout title="Browse & Enroll">
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search courses"
        className="mb-4 w-full rounded-xl border p-3"
      />
      <div className="overflow-x-auto rounded-2xl bg-white/70 p-4">
        <table className="w-full text-left text-sm">
          <thead>
            <tr>
              <th>Course</th>
              <th>Code</th>
              <th>Department</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t">
                <td>{r.title}</td>
                <td>{r.code}</td>
                <td>{r.department}</td>
                <td>
                  <Button
                    disabled={enrolled.has(r.id)}
                    onClick={() => {
                      setSelectedId(r.id);
                      setOpen(true);
                    }}
                  >
                    {enrolled.has(r.id) ? "Enrolled" : "Enroll"}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Modal open={open} onClose={() => setOpen(false)} title="Confirm Enrollment">
        <p className="mb-4">Enroll in {selected?.title}?</p>
        <Button
          onClick={async () => {
            if (!selected || !user) return;
            try {
              await courseApi.enroll(selected.id, user.id);
              setEnrolled((prev) => new Set(prev).add(selected.id));
              toast.success("Enrollment successful");
            } catch (err: unknown) {
              const detail =
                typeof err === "object" &&
                err !== null &&
                "response" in err &&
                typeof (err as { response?: { data?: { detail?: string } } }).response?.data?.detail === "string"
                  ? (err as { response?: { data?: { detail?: string } } }).response?.data?.detail
                  : null;
              toast.error(detail || "Enrollment failed");
            } finally {
              setOpen(false);
            }
          }}
        >
          Confirm
        </Button>
      </Modal>
    </DashboardLayout>
  );
};

export default EnrollPage;
