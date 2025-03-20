"use client";

import { ReactNode, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Spinner } from "@heroui/spinner";
import BottomNavigation from "@/components/BottomNavigation";
import Navbar from "@/components/Navbar";
import {RecordProvider} from "@/context/RecordContext";
import WebsiteTour from "@/components/WebsiteTour";

const ProtectedLayout = ({ children }: { children: ReactNode }) => {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            setTimeout(() => {
                router.replace("/login"); // `replace` استعمال کریں تاکہ بیک بٹن سے واپس نہ جا سکے
            }, 0);
        }
    }, [user, loading, router]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Spinner color={'current'} />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Spinner color={'current'} />
            </div>
        );
    }

    return (
        <RecordProvider>
            <Navbar />
            <main className={`py-20`}>
                {children}
                <WebsiteTour />
            </main>
            <BottomNavigation />
        </RecordProvider>
    );
};

export default ProtectedLayout;
