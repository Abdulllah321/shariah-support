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

    // ✅ Calculate Total Score
    const totalScore = dailyActivityRecords.reduce((sum, record) => {
        const score = typeof record.score === "string" ? parseInt(record.score, 10) : record.score;
        return sum + (isNaN(score) ? 0 : score);
    }, 0);

    // ✅ Find Top 3 Activities
    const activityCount: Record<string, number> = {};

    dailyActivityRecords.forEach(record => {
        const activity = record.activity; // Single activity per record
        if (activity) {
            activityCount[activity] = (activityCount[activity] || 0) + 1;
        }
    });

    const topActivities = Object.entries(activityCount)
        .sort((a, b) => b[1] - a[1]) // Sort by occurrence count (descending)
        .slice(0, 3) // Get top 3
        .map(([activity, count]) => `${activity} (${count})`); // Format output

    return (
        <div className="w-full md:w-1/2 mx-auto">
            <DashboardHeader
                handleLogout={logout}
                handleScoreDetails={handleScoreDetails}
                empId={user?.employeeId}
                username={user?.username}
                score={totalScore}
                activities={topActivities} // 🔥 Pass Top 3 Activities
            />
            {children}
        </div>
    );
};

export default Layout;
