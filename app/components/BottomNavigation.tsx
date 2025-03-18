"use client";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ClipboardList, CheckCircle, Users, Pencil } from "lucide-react";
import { cn } from "@heroui/react";
import ButtonsModal from "@/components/ButtonsModal";

const routes = [
    { key: "daily_activity_report", title: "Daily Activity", Icon: ClipboardList, path: "/daily-activity" },
    { key: "branch_review", title: "Branch Review", Icon: CheckCircle, path: "/branch-review" },
    { key: "staff_interview", title: "Staff Interview", Icon: Users, path: "/staff-interview" },
    { key: "leads", title: "360 Leads", Icon: Pencil, path: "/leads" },
];

export default function BottomNavigation() {
    const [activeTab, setActiveTab] = useState<string>();
    const [isOpen, setIsOpen] = useState(false)
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const currentRoute = routes.find(route => route.path === pathname);
        if (currentRoute) {
            setActiveTab(currentRoute.key);
        } else {
            setActiveTab('');
        }
    }, [pathname]);

    const handleNavigation = (key: string, path: string) => {
        router.push(path);
    };

    const openModal = () => {
        setIsOpen(!isOpen)
    }
    const closeModal = () => {
        setIsOpen(false)
    }

    return (
        <div className="fixed bottom-0 w-full shadow-lg z-[10]">
            <nav className="relative w-full md:w-1/2 h-16 grid grid-cols-2 gap-[3.4rem] text-gray-700 dark:text-gray-300 mx-auto">
                <div className="relative z-10 bg-default-50 border-t grid grid-cols-2 place-items-center rounded-r-[1.5rem] !rounded-b-none rounded-l-lg w-full py-2">
                    {routes.slice(0, 2).map(({ key, title, Icon, path }) => {
                        const isActive = activeTab === key;
                        return (
                            <button
                                key={key}
                                onClick={() => handleNavigation(key, path)}
                                className={cn(
                                    "flex flex-col items-center transition-colors duration-300 text-sm",
                                    isActive ? "text-primary dark:text-primary-400" : "text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white"
                                )}
                            >
                                <motion.div animate={{ scale: isActive ? 1.1 : 1 }} transition={{ type: "spring", stiffness: 300 }}>
                                    <Icon className={isActive ? "w-5 h-5" : "w-6 h-6"} />
                                </motion.div>
                                {isActive && <motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-1 text-xs">{title}</motion.span>}
                            </button>
                        );
                    })}
                </div>
                <div className="relative z-10 bg-default-50 border-t grid grid-cols-2 place-items-center rounded-l-[1.5rem] !rounded-b-none rounded-r-lg w-full py-2">
                    {routes.slice(2).map(({ key, title, Icon, path }) => {
                        const isActive = activeTab === key;
                        return (
                            <button
                                key={key}
                                onClick={() => handleNavigation(key, path)}
                                className={cn(
                                    "flex flex-col items-center transition-colors duration-300 text-sm",
                                    isActive ? "text-primary dark:text-primary-400" : "text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white"
                                )}
                            >
                                <motion.div animate={{ scale: isActive ? 1.1 : 1 }} transition={{ type: "spring", stiffness: 300 }}>
                                    <Icon className={isActive ? "w-5 h-5" : "w-6 h-6"} />
                                </motion.div>
                                {isActive && <motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-1 text-xs">{title}</motion.span>}
                            </button>
                        );
                    })}
                </div>

                <div className="absolute -top-[1.75rem] left-1/2 -translate-x-1/2 h-16 w-16 bg-default-50 rounded-full border-b">
                <div className="bg-default-50  border-background  rounded-full border-[8px] w-full h-full">
                    <button className="rounded-full w-full h-full bg-gradient-to-br from-teal-500 to-blue-500 hover:from-blue-600 hover:to-teal-600 transition duration-300" onClick={openModal}>
                        <div className="text-white flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-plus w-8 h-8">
                                <path d="M5 12h14" />
                                <path d="M12 5v14" />
                            </svg>
                        </div>
                    </button>
                </div>
                </div>

                <div className="absolute bottom-0 h-[75%] left-1/2 -z-[1] -translate-x-1/2 w-1/2 bg-default-50" />
            </nav>

            <ButtonsModal isOpen={isOpen} closeModal={closeModal} />
        </div>
    );
}
