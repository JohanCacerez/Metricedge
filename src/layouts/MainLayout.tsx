import { Outlet } from "react-router-dom";
import { Sidebar } from "../components/Sidebar";

export default function MainLayout() {
  return (
    <div className="flex h-screen">
      <Sidebar userName="Johan" activeModel="Rear lh" />
      <main className="flex-1 p-4 overflow-auto bg-gray-50">
        <Outlet />
      </main>
    </div>
  );
}
