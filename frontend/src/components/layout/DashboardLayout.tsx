import { ReactNode } from "react";

import Sidebar from "./Sidebar";

const DashboardLayout = ({ children, title }: { children: ReactNode; title: string }) => (
  <div className="flex min-h-screen">
    <Sidebar />
    <main className="w-full p-6">
      <div className="mb-6 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 p-6 text-white shadow-lg">
        <h1 className="text-3xl font-extrabold">{title}</h1>
      </div>
      {children}
    </main>
  </div>
);

export default DashboardLayout;
