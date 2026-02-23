import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import Button from "../common/Button";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

type FormValues = z.infer<typeof schema>;

const LoginForm = ({ onSubmit }: { onSubmit: (values: FormValues) => void }) => {
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({ resolver: zodResolver(schema) });
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <input {...register("email")} placeholder="Email" className="w-full rounded-xl border p-3" />
        {errors.email && <p className="text-xs text-red-500">Invalid email</p>}
      </div>
      <div>
        <input type="password" {...register("password")} placeholder="Password" className="w-full rounded-xl border p-3" />
      </div>
      <Button type="submit">Sign in</Button>
    </form>
  );
};

export default LoginForm;
