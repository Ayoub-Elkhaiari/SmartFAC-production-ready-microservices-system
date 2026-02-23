import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import OtpBoxes from "../../components/auth/ResetPasswordForm";
import Button from "../../components/common/Button";
import { authApi } from "../../api/services";

const score = (password: string) => {
  let s = 0;
  if (password.length >= 8) s += 1;
  if (/[A-Z]/.test(password)) s += 1;
  if (/[0-9]/.test(password)) s += 1;
  if (/[^A-Za-z0-9]/.test(password)) s += 1;
  return s;
};

const ResetPasswordPage = () => {
  const [otp, setOtp] = useState("");
  const [token, setToken] = useState(sessionStorage.getItem("reset_token") || "");
  const [email] = useState(sessionStorage.getItem("reset_email") || "");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const navigate = useNavigate();

  const strength = useMemo(() => score(password), [password]);

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <h1 className="mb-4 text-2xl font-bold">Reset Password</h1>
        {!token ? (
          <div className="space-y-4">
            <OtpBoxes value={otp} onChange={setOtp} />
            <Button
              onClick={async () => {
                const { data } = await authApi.verifyOtp(email, otp);
                setToken(data.reset_token);
              }}
            >
              Verify Code
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="New password" className="w-full rounded-xl border p-3" />
            <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Confirm password" className="w-full rounded-xl border p-3" />
            <div className="text-sm text-slate-500">Strength: {strength}/4</div>
            <Button
              onClick={async () => {
                if (password !== confirm) {
                  toast.error("Passwords do not match");
                  return;
                }
                await authApi.resetPassword(password, token);
                toast.success("Password reset successful");
                navigate("/login");
              }}
            >
              Reset Password
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResetPasswordPage;
