import { Role } from "../../types";

const colors: Record<Role, string> = {
  student: "bg-cyan-100 text-cyan-700",
  professor: "bg-indigo-100 text-indigo-700",
  admin: "bg-amber-100 text-amber-700"
};

const RoleBadge = ({ role }: { role: Role }) => <span className={`rounded-full px-2 py-1 text-xs ${colors[role]}`}>{role}</span>;

export default RoleBadge;
