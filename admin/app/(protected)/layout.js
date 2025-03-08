import AdminSidebar from "@/components/Sidebar";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function RootLayout({ children }) {
  return (
    <div className="flex w-screen h-screen overflow-hidden">
      <ProtectedRoute>
        <AdminSidebar>{children}</AdminSidebar>
      </ProtectedRoute>
    </div>
  );
}
