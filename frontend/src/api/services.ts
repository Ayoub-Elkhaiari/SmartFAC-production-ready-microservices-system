import api from "./client";

export const authApi = {
  login: (email: string, password: string) => api.post("/auth/login", { email, password }),
  me: (token?: string) =>
    api.get("/auth/me", {
      headers: token
        ? {
            Authorization: `Bearer ${token}`
          }
        : undefined
    }),
  listUsers: () => api.get("/auth/users"),
  getUserById: (id: string) => api.get(`/auth/users/${id}`),
  forgotPassword: (email: string) => api.post("/auth/forgot-password", { email }),
  verifyOtp: (email: string, otp: string) => api.post("/auth/verify-otp", { email, otp }),
  resetPassword: (password: string, resetToken: string) =>
    api.post(
      "/auth/reset-password",
      { password },
      {
        headers: {
          "x-reset-token": resetToken
        }
      }
    )
};

export const userApi = {
  list: () => api.get("/users/"),
  create: (payload: Record<string, string>) => api.post("/users/", payload),
  byRole: (role: string) => api.get(`/users/by-role/${role}`)
};

export const courseApi = {
  list: () => api.get("/courses/courses/"),
  get: (id: string) => api.get(`/courses/courses/${id}`),
  create: (payload: Record<string, unknown>) => api.post("/courses/courses/", payload),
  update: (id: string, payload: Record<string, unknown>) => api.put(`/courses/courses/${id}`, payload),
  delete: (id: string) => api.delete(`/courses/courses/${id}`),
  myCourses: (studentId: string) => api.get(`/courses/students/${studentId}/courses`),
  enroll: (courseId: string, studentId: string) => api.post(`/courses/courses/${courseId}/enroll?student_id=${studentId}`),
  drop: (courseId: string, studentId: string) => api.delete(`/courses/courses/${courseId}/enroll?student_id=${studentId}`),
  students: (courseId: string) => api.get(`/courses/courses/${courseId}/students`),
  materials: (courseId: string) => api.get(`/courses/courses/${courseId}/materials`),
  uploadMaterial: (courseId: string, form: FormData) => api.post(`/courses/courses/${courseId}/materials`, form),
  deleteMaterial: (courseId: string, materialId: string) => api.delete(`/courses/courses/${courseId}/materials/${materialId}`)
};

export const meetingApi = {
  list: () => api.get("/meetings/meetings/"),
  get: (id: string) => api.get(`/meetings/meetings/${id}`),
  create: (payload: Record<string, unknown>) => api.post("/meetings/meetings/", payload),
  update: (id: string, payload: Record<string, unknown>) => api.put(`/meetings/meetings/${id}`, payload),
  cancel: (id: string) => api.delete(`/meetings/meetings/${id}`),
  join: (id: string) => api.post(`/meetings/meetings/${id}/join`),
  sessions: () => api.get("/meetings/sessions/"),
  reserveSession: (payload: Record<string, unknown>) => api.post("/meetings/sessions/", payload),
  approveSession: (id: string) => api.put(`/meetings/sessions/${id}/approve`),
  rejectSession: (id: string) => api.put(`/meetings/sessions/${id}/reject`)
};

export const newsApi = {
  list: (cacheBuster?: number) => api.get(cacheBuster ? `/news/?t=${cacheBuster}` : "/news/"),
  listAllAdmin: () => api.get("/news/admin/all"),
  get: (id: string) => api.get(`/news/${id}`),
  create: (payload: { title: string; content: string }) => api.post("/news/", payload),
  update: (id: string, payload: { title?: string; content?: string }) => api.put(`/news/${id}`, payload),
  delete: (id: string) => api.delete(`/news/${id}`),
  publish: (id: string) => api.post(`/news/${id}/publish`),
  uploadImages: (id: string, form: FormData) => api.post(`/news/${id}/images`, form)
};

export const notificationApi = {
  sendOtp: (toEmail: string, otp: string) => api.post("/notifications/send-otp-email", { to_email: toEmail, otp })
};

export const chatApi = {
  chat: (messages: Array<{ role: "user" | "assistant"; content: string }>) => api.post("/chat/chat", { messages })
};
