import { useEffect, useState } from "react";

import DashboardLayout from "../../components/layout/DashboardLayout";
import Modal from "../../components/common/Modal";
import { meetingApi } from "../../api/services";

interface Meeting {
  id: string;
  title: string;
  status: string;
  meeting_url: string;
  description?: string;
  scheduled_at: string;
  duration_minutes: number;
}

const MeetingsPage = () => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [selected, setSelected] = useState<Meeting | null>(null);

  useEffect(() => {
    meetingApi.list().then(({ data }) => setMeetings(data)).catch(() => setMeetings([]));
  }, []);

  return (
    <DashboardLayout title="Meetings">
      <div className="space-y-3">
        {meetings.map((m) => (
          <div key={m.id} className={`rounded-2xl border p-4 ${m.status === "completed" ? "bg-slate-100" : "bg-white/70"}`}>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold">{m.title}</h4>
                <p className="text-sm text-slate-500">{m.status}</p>
              </div>
              <button className="rounded-lg bg-cyan-100 px-3 py-1 text-sm" onClick={() => setSelected(m)}>
                Join
              </button>
            </div>
          </div>
        ))}
      </div>

      <Modal open={!!selected} onClose={() => setSelected(null)} title={selected?.title || "Meeting"}>
        {selected && (
          <div className="space-y-3">
            <p className="text-sm text-slate-600">{selected.description || "No description."}</p>
            <p className="text-sm text-slate-600">Scheduled: {new Date(selected.scheduled_at).toLocaleString()}</p>
            <p className="text-sm text-slate-600">Duration: {selected.duration_minutes} minutes</p>
            <a
              href={selected.meeting_url}
              target="_blank"
              rel="noreferrer"
              className="inline-block rounded-xl bg-primary px-4 py-2 text-white"
            >
              Open Meeting Link
            </a>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
};

export default MeetingsPage;
