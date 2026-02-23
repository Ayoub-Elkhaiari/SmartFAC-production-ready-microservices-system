import { ReactNode } from "react";

interface Props {
  children: ReactNode;
  variant?: "primary" | "outline";
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
}

const Button = ({ children, variant = "primary", onClick, type = "button", disabled }: Props) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    className={`rounded-xl px-4 py-2 text-sm font-semibold transition active:scale-[0.98] ${
      variant === "primary"
        ? "bg-primary text-white hover:bg-indigo-700 disabled:bg-indigo-300"
        : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
    }`}
  >
    {children}
  </button>
);

export default Button;
