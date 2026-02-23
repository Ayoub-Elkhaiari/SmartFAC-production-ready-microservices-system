import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";

import DashboardLayout from "../../components/layout/DashboardLayout";
import { authApi, meetingApi } from "../../api/services";

interface SessionRow {
  id: string;
  professor_id: string;
  room: string;
  reserved_at: string;
  status: string;
}

const MeetingsPage = () => {
  const [rows, setRows] = useState<SessionRow[]>([]);
  const [names, setNames] = useState<Record<string, string>>({});

  const load = async () => {
    const [res, users] = await Promise.all([meetingApi.sessions(), authApi.listUsers()]);
    const map: Record<string, string> = {};
    users.data.forEach((u: { id: string; full_name: string }) => {
      map[u.id] = u.full_name;
    });
    setNames(map);
    setRows(res.data);
  };

  useEffect(() => {
    void load();
  }, []);

  return (
    <DashboardLayout title="Meetings Overview">
      <div className="rounded-2xl bg-white/70 p-4">
        <table className="w-full text-left text-sm">
          <thead>
            <tr>
              <th>Professor</th>
              <th>Room</th>
              <th>When</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t">
                <td>{names[r.professor_id] || r.professor_id}</td>
                <td>{r.room}</td>
                <td>{new Date(r.reserved_at).toLocaleString()}</td>
                <td>{r.status}</td>
                <td className="space-x-2">
                  <button
                    className="rounded bg-green-100 px-2 py-1"
                    onClick={async () => {
                      try {
                        await meetingApi.approveSession(r.id);
                        toast.success("Approved");
                        await load();
                      } catch (err: unknown) {
                        const detail = axios.isAxiosError(err) ? err.response?.data?.detail : undefined;
                        toast.error(detail || "Approve failed");
                      }
                    }}
                  >
                    Approve
                  </button>
                  <button
                    className="rounded bg-red-100 px-2 py-1"
                    onClick={async () => {
                      try {
                        await meetingApi.rejectSession(r.id);
                        toast.success("Rejected");
                        await load();
                      } catch (err: unknown) {
                        const detail = axios.isAxiosError(err) ? err.response?.data?.detail : undefined;
                        toast.error(detail || "Reject failed");
                      }
                    }}
                  >
                    Reject
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
};

export default MeetingsPage;
