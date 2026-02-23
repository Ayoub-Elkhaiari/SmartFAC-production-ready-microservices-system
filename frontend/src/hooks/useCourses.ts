import { useEffect, useState } from "react";

import { courseApi } from "../api/services";
import { Course } from "../types";

export const useCourses = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      try {
        const { data } = await courseApi.list();
        setCourses(data);
      } finally {
        setLoading(false);
      }
    };
    void run();
  }, []);

  return { courses, loading };
};
