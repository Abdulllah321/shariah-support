"use client";

import React, {ReactNode} from 'react';
import DashboardHeader from "@/components/DashboardHeader";
import {useAuth} from "@/context/AuthContext";
import {useRouter} from "next/navigation";
import {useRecord} from "@/context/RecordContext";

const Layout = ({children}: { children: ReactNode }) => {
    const {logout, user} = useAuth();
    const router = useRouter()
    const handleScoreDetails = () => {
        router.push("/score")
    }
    const {dailyActivityRecords} = useRecord()
    const totalScore = dailyActivityRecords.reduce((sum, record) => {
        const score = typeof record.score === "string" ? parseInt(record.score, 10) : record.score;
        return sum + (isNaN(score) ? 0 : score);
    }, 0);
    return (
        <div className={`w-full md:w-1/2 mx-auto`}>
            <DashboardHeader handleLogout={logout} handleScoreDetails={handleScoreDetails} empId={user?.employeeId}
                             username={user?.username} score={totalScore}/>


            {children}
        </div>
    );
};

export default Layout;
