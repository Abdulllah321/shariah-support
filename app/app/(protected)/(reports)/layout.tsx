"use client";

import React, { ReactNode } from "react";
import DashboardHeader from "@/components/DashboardHeader";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useRecord } from "@/context/RecordContext";

const Layout = ({ children }: { children: ReactNode }) => {
  const { logout, user } = useAuth();
  const router = useRouter();

  const handleScoreDetails = () => {
    router.push("/score");
  };

  const { dailyActivityRecords } = useRecord();

  const excludedActivities = [
    "On Leave / Public Holiday",
    "Office Day",
    "Training Attended",
  ];

  // Filter out excluded activities
  const validActivities = dailyActivityRecords.filter(
    (act) => !excludedActivities.includes(act.activity?.trim())
  );

  const totalActivities = validActivities.length;

  return (
    <div className="w-full md:w-1/2 mx-auto">
      <DashboardHeader
        handleLogout={logout}
        handleScoreDetails={handleScoreDetails}
        empId={user?.employeeId}
        username={user?.username}
        score={totalActivities}
      />
      {children}
    </div>
  );
};

export default Layout;
