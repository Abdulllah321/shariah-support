"use client";
import AdminSidebar from "@/components/Sidebar";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useEffect } from "react";

export default function RootLayout({ children }) {

  return (
    <div className="flex w-screen h-screen overflow-hidden" id="scroll-container">
      <ProtectedRoute>
        <AdminSidebar>{children}</AdminSidebar>
      </ProtectedRoute>
    </div>
  );
}
