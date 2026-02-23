import { useForm } from "react-hook-form";

import Button from "../common/Button";

const ForgotPasswordForm = ({ onSubmit }: { onSubmit: (email: string) => void }) => {
  const { register, handleSubmit } = useForm<{ email: string }>();
  return (
    <form onSubmit={handleSubmit((v) => onSubmit(v.email))} className="space-y-4">
      <input {...register("email")} placeholder="Enter your email" className="w-full rounded-xl border p-3" />
      <Button type="submit">Send OTP</Button>
    </form>
  );
};

export default ForgotPasswordForm;
