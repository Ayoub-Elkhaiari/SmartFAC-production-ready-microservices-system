import { useEffect, useState } from "react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import { newsApi } from "../../api/services";
import { NewsPost } from "../../types";

const NewsSlider = () => {
  const [items, setItems] = useState<NewsPost[]>([]);

  useEffect(() => {
    newsApi.list(Date.now()).then(({ data }) => setItems(data)).catch(() => setItems([]));
  }, []);

  if (!items.length) {
    return <div className="rounded-2xl border border-white/20 bg-white/60 p-4">No news published yet.</div>;
  }

  return (
    <Swiper modules={[Navigation, Pagination, Autoplay]} autoplay={{ delay: 5000 }} navigation pagination className="h-64 w-full rounded-2xl">
      {items.map((n) => (
        <SwiperSlide key={n.id}>
          <div className="relative h-full overflow-hidden rounded-2xl bg-slate-800 text-white">
            <img className="h-full w-full object-cover" src={n.images[0] || "https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?w=1200"} alt={n.title} loading="lazy" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent p-6">
              <h3 className="mt-24 text-2xl font-bold">{n.title}</h3>
              <p className="line-clamp-2 text-sm opacity-90">{n.content}</p>
            </div>
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

export default NewsSlider;
