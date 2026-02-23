import { useEffect, useMemo, useState } from "react";

import DashboardLayout from "../../components/layout/DashboardLayout";
import { authApi } from "../../api/services";

interface UserRow {
  id: string;
  full_name: string;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

const UsersPage = () => {
  const [rows, setRows] = useState<UserRow[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    authApi.listUsers().then(({ data }) => setRows(data)).catch(() => setRows([]));
  }, []);

  const filtered = useMemo(
    () => rows.filter((r) => `${r.full_name} ${r.email} ${r.role}`.toLowerCase().includes(search.toLowerCase())),
    [rows, search]
  );

  return (
    <DashboardLayout title="Users Management">
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-3 w-full rounded-xl border p-3"
        placeholder="Search users"
      />
      <div className="rounded-2xl bg-white/70 p-4">
        <table className="w-full text-left text-sm">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u.id} className="border-t">
                <td>{u.full_name}</td>
                <td>{u.email}</td>
                <td>{u.role}</td>
                <td>{u.is_active ? "active" : "inactive"}</td>
                <td>{new Date(u.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!filtered.length && <p className="mt-3 text-sm text-slate-500">No users found.</p>}
      </div>
    </DashboardLayout>
  );
};

export default UsersPage;
