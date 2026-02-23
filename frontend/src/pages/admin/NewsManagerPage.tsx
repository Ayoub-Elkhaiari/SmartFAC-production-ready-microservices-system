import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";

import DashboardLayout from "../../components/layout/DashboardLayout";
import NewsSlider from "../../components/slider/NewsSlider";
import { newsApi } from "../../api/services";

interface NewsItem {
  id: string;
  title: string;
  is_published: boolean;
}

const NewsManagerPage = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [files, setFiles] = useState<FileList | null>(null);

  const load = async () => {
    const res = await newsApi.listAllAdmin();
    setNews(res.data);
  };

  useEffect(() => {
    void load();
  }, []);

  return (
    <DashboardLayout title="News Manager">
      <div className="rounded-2xl bg-white/70 p-6">
        <div className="grid gap-3">
          <input className="rounded-xl border p-3" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <textarea className="rounded-xl border p-3" placeholder="Content" rows={4} value={content} onChange={(e) => setContent(e.target.value)} />
          <input type="file" multiple onChange={(e) => setFiles(e.target.files)} />
          <button
            className="w-max rounded-xl bg-primary px-4 py-2 text-white"
            onClick={async () => {
              try {
                const created = await newsApi.create({ title, content });
                if (files?.length) {
                  const form = new FormData();
                  Array.from(files).forEach((f) => form.append("files", f));
                  await newsApi.uploadImages(created.data.id, form);
                }
                toast.success("Draft created");
                setTitle("");
                setContent("");
                setFiles(null);
                await load();
              } catch {
                toast.error("Create failed");
              }
            }}
          >
            Create Draft
          </button>
        </div>
      </div>
      <div className="mt-6"><NewsSlider /></div>
      <div className="mt-6 rounded-2xl bg-white/70 p-4">
        <h3 className="mb-2 font-bold">Posts</h3>
        {news.map((n) => (
          <div key={n.id} className="flex items-center justify-between border-t py-2">
            <span>
              {n.title} - {n.is_published ? "published" : "draft"}
            </span>
            <div className="space-x-2">
              {!n.is_published && (
                <button
                  className="rounded bg-green-100 px-2 py-1"
                  onClick={async () => {
                    try {
                      await newsApi.publish(n.id);
                      toast.success("Published");
                      await load();
                    } catch (err: unknown) {
                      const detail = axios.isAxiosError(err) ? err.response?.data?.detail : undefined;
                      toast.error(detail || "Publish failed");
                    }
                  }}
                >
                  Publish
                </button>
              )}
              <button
                className="rounded bg-red-100 px-2 py-1"
                onClick={async () => {
                  try {
                    await newsApi.delete(n.id);
                    toast.success("Deleted");
                    await load();
                  } catch (err: unknown) {
                    const detail = axios.isAxiosError(err) ? err.response?.data?.detail : undefined;
                    toast.error(detail || "Delete failed");
                  }
                }}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
};

export default NewsManagerPage;
