import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";

import DashboardLayout from "../../components/layout/DashboardLayout";
import { meetingApi } from "../../api/services";
import { useAuthStore } from "../../store/authStore";

interface Session {
  id: string;
  professor_id: string;
  room: string;
  status: string;
  reserved_at: string;
  purpose: string;
}

const SessionsPage = () => {
  const user = useAuthStore((s) => s.user);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [room, setRoom] = useState("");
  const [reservedAt, setReservedAt] = useState("");
  const [duration, setDuration] = useState("60");
  const [purpose, setPurpose] = useState("");

  const load = async () => {
    const res = await meetingApi.sessions();
    if (!user) {
      setSessions([]);
      return;
    }
    setSessions(res.data.filter((s: Session) => s.professor_id === user.id));
  };

  useEffect(() => {
    void load();
  }, [user]);

  return (
    <DashboardLayout title="Reserve Session">
      <div className="rounded-2xl bg-white/70 p-6">
        <div className="grid gap-3 md:grid-cols-2">
          <input className="rounded-xl border p-3" placeholder="Room" value={room} onChange={(e) => setRoom(e.target.value)} />
          <input type="datetime-local" className="rounded-xl border p-3" value={reservedAt} onChange={(e) => setReservedAt(e.target.value)} />
          <input className="rounded-xl border p-3" placeholder="Duration" value={duration} onChange={(e) => setDuration(e.target.value)} />
          <input className="rounded-xl border p-3" placeholder="Purpose" value={purpose} onChange={(e) => setPurpose(e.target.value)} />
        </div>
        <button
          className="mt-4 rounded-xl bg-primary px-4 py-2 text-white"
          onClick={async () => {
            try {
              await meetingApi.reserveSession({
                room,
                reserved_at: new Date(reservedAt).toISOString(),
                duration_minutes: Number(duration),
                purpose
              });
              toast.success("Session reserved");
              setRoom("");
              setReservedAt("");
              setDuration("60");
              setPurpose("");
              await load();
            } catch (err: unknown) {
              const detail = axios.isAxiosError(err) ? err.response?.data?.detail : undefined;
              toast.error(detail || "Reservation failed");
            }
          }}
        >
          Reserve
        </button>
      </div>
      <div className="mt-4 space-y-2">
        {sessions.map((s) => (
          <div key={s.id} className="rounded-xl bg-white p-3">
            {s.room} - {s.status} - {new Date(s.reserved_at).toLocaleString()} - {s.purpose}
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
};

export default SessionsPage;
