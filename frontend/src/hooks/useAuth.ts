import { useAuthStore } from "../store/authStore";

export const useAuth = () => {
  const { user, accessToken, setAuth, clearAuth } = useAuthStore();
  return { user, accessToken, setAuth, clearAuth };
};
