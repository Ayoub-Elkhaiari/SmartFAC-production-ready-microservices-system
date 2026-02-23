import { useState } from "react";
import toast from "react-hot-toast";

import DashboardLayout from "../../components/layout/DashboardLayout";
import { meetingApi } from "../../api/services";

const CreateMeetingPage = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [meetingUrl, setMeetingUrl] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [duration, setDuration] = useState("60");

  return (
    <DashboardLayout title="Create Meeting">
      <div className="rounded-2xl bg-white/70 p-6">
        <div className="grid gap-3 md:grid-cols-2">
          <input value={title} onChange={(e) => setTitle(e.target.value)} className="rounded-xl border p-3" placeholder="Title" />
          <input value={meetingUrl} onChange={(e) => setMeetingUrl(e.target.value)} className="rounded-xl border p-3" placeholder="Meeting URL" />
          <input type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} className="rounded-xl border p-3" />
          <input value={duration} onChange={(e) => setDuration(e.target.value)} className="rounded-xl border p-3" placeholder="Duration minutes" />
        </div>
        <textarea className="mt-3 w-full rounded-xl border p-3" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
        <button
          className="mt-4 rounded-xl bg-primary px-4 py-2 text-white"
          onClick={async () => {
            try {
              await meetingApi.create({
                title,
                description,
                meeting_url: meetingUrl,
                scheduled_at: new Date(scheduledAt).toISOString(),
                duration_minutes: Number(duration),
                is_recurring: false
              });
              toast.success("Meeting created");
              setTitle("");
              setDescription("");
              setMeetingUrl("");
              setScheduledAt("");
              setDuration("60");
            } catch {
              toast.error("Meeting creation failed");
            }
          }}
        >
          Submit
        </button>
      </div>
    </DashboardLayout>
  );
};

export default CreateMeetingPage;
