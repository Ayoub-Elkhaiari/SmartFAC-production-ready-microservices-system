import { useState } from "react";
import toast from "react-hot-toast";

import ForgotPasswordForm from "../../components/auth/ForgotPasswordForm";
import OtpBoxes from "../../components/auth/ResetPasswordForm";
import Button from "../../components/common/Button";
import { authApi } from "../../api/services";
import { useNavigate } from "react-router-dom";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"email" | "otp">("email");
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <h1 className="mb-4 text-2xl font-bold">Forgot Password</h1>
        {step === "email" ? (
          <ForgotPasswordForm
            onSubmit={async (value) => {
              await authApi.forgotPassword(value);
              setEmail(value);
              setStep("otp");
              toast.success("We sent a 6-digit code to your email");
            }}
          />
        ) : (
          <div className="space-y-4">
            <OtpBoxes value={otp} onChange={setOtp} />
            <Button
              onClick={async () => {
                const { data } = await authApi.verifyOtp(email, otp);
                sessionStorage.setItem("reset_token", data.reset_token);
                sessionStorage.setItem("reset_email", email);
                navigate("/reset-password");
              }}
            >
              Verify Code
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
