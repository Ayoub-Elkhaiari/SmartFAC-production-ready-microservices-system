import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import LoginForm from "../../components/auth/LoginForm";
import { authApi } from "../../api/services";
import { useAuthStore } from "../../store/authStore";
import { AuthUser, Role } from "../../types";
// import logo from "./Smart_FAC.png";

const LoginPage = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  return (
    <div className="grid min-h-screen grid-cols-1 bg-slate-50 md:grid-cols-2">
      <div className="hidden bg-gradient-to-br from-indigo-700 to-cyan-500 p-12 text-white md:block">
        <img 
    src="/Smart_FAC.png" 
    alt="Smart Faculty Logo" 
    className="mb-6 h-32 w-auto"
  />
        <h1 className="text-5xl font-extrabold">Smart Faculty</h1>
        <p className="mt-4 text-lg">Flagship faculty management experience for students, professors, and admins.</p>
      </div>
      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-md rounded-2xl border border-white/20 bg-white/60 p-8 shadow-xl backdrop-blur">
          <h2 className="mb-6 text-2xl font-bold">Login</h2>
          <LoginForm
            onSubmit={async ({ email, password }) => {
              try {
                const { data } = await authApi.login(email, password);
                const me = await authApi.me(data.access_token);
                const user = me.data as AuthUser;
                setAuth(data.access_token, user);
                const routes: Record<Role, string> = { student: "/student", professor: "/professor", admin: "/admin" };
                navigate(routes[user.role]);
              } catch {
                toast.error("Login failed");
              }
            }}
          />
          <div className="mt-4 text-sm"><a className="text-indigo-600" href="/forgot-password">Forgot password?</a></div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
