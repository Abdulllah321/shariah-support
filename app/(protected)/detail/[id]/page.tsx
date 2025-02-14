"use client";

import {useEffect, useState} from "react";
import {useParams, useSearchParams} from "next/navigation";
import {Card, CardBody, CardHeader} from "@heroui/card";
import {Breadcrumbs, BreadcrumbItem} from "@heroui/breadcrumbs";
import {Skeleton} from "@heroui/skeleton";
import {motion} from "framer-motion";
import {AlertCircle, Home} from "lucide-react";
import {db} from "@/lib/firebase";
import {doc, getDoc} from "firebase/firestore";
import {format} from "date-fns";

type Record = {
    [key: string]: string | number | null;
};

const DetailsPage = () => {
    const {id} = useParams();
    const searchParams = useSearchParams();
    const actionParam = searchParams.get("action");
    const action = actionParam === "branch-shariah" ? "branch-review" : actionParam
    const [record, setRecord] = useState<Record | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Function to transform action string into readable format
    const transformAction = (action: string | null): string => {
        if (!action) return "Details";
        return action
            .replace(/-/g, " ")
            .replace(/\b\w/g, (char) => char.toUpperCase());
    };

    useEffect(() => {
        const fetchRecord = async () => {
            if (!id || !action) {
                setLoading(false);
                return;
            }

            try {
                let docRef;
                switch (action) {
                    case "daily-activity":
                        docRef = doc(db, "records", id as string);
                        break;
                    case "branch-review":
                        docRef = doc(db, "BranchReview", id as string);
                        break;

                    case "staff-interview":
                        docRef = doc(db, "StaffReview", id as string);
                        break;
                    case "360-leads":
                        docRef = doc(db, "360Leads", id as string);
                        break;
                    default:
                        console.error("Invalid action type");
                        setLoading(false);
                        return;
                }

                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setRecord(docSnap.data() as Record);
                } else {
                    setError("No record found.");
                    setRecord(null);
                }
            } catch (error) {
                console.error("Error fetching record:", error);
                setError("An error occurred while fetching the record.");
                setRecord(null);
            } finally {
                setLoading(false);
            }
        };

        fetchRecord();
    }, [id, action]);

    if (loading) return <LoadingSkeleton/>;

    return (
        <div className="min-h-screen p-6">
            {/* Breadcrumbs */}
            <Breadcrumbs>
                <BreadcrumbItem href="/" startContent={<Home className="w-4 h-4"/>}>
                    Home
                </BreadcrumbItem>
                <BreadcrumbItem href={`/${action}`}>
                    {transformAction(action)}
                </BreadcrumbItem>
                <BreadcrumbItem>{id}</BreadcrumbItem>
            </Breadcrumbs>

            {/* Page Title */}
            <h1 className="text-3xl font-bold text-secondary mt-4 mb-6 text-center">
                {transformAction(action)} Details
            </h1>

            {/* If no record found */}
            {error || !record ? (
                <motion.div
                    initial={{opacity: 0, y: 20}}
                    animate={{opacity: 1, y: 0}}
                    transition={{duration: 0.5}}
                    className="w-full max-w-lg mx-auto"
                >
                    <Card className="shadow-lg rounded-xl bg-white border border-red-400">
                        <CardHeader className="text-red-500 flex items-center gap-2">
                            <AlertCircle className="w-6 h-6"/>
                            <span>No Record Found</span>
                        </CardHeader>
                        <CardBody>
                            <p className="text-gray-500">The requested record does not exist or has been removed.</p>
                        </CardBody>
                    </Card>
                </motion.div>
            ) : (
                <motion.div
                    initial={{opacity: 0, y: 20}}
                    animate={{opacity: 1, y: 0}}
                    transition={{duration: 0.5}}
                    className="w-full max-w-lg mx-auto"
                >
                    <Card
                        className="shadow-lg rounded-xl bg-white dark:bg-primary/50 shadow-primary dark:shadow-white/50 backdrop-blur-3xl">

                        <CardBody className={`relative z-[1] `}>
                            {Object.entries(record).map(([key, value]) => {
                                let displayValue = value;

                                // Check if the value is a date
                                if (typeof value === "string" && !isNaN(Date.parse(value))) {
                                    displayValue = format(new Date(value), "PPpp"); // Example: Jan 6, 2025 at 11:26 AM
                                }

                                return (
                                    <motion.div
                                        key={key}
                                        initial={{opacity: 0, x: -20}}
                                        animate={{opacity: 1, x: 0}}
                                        transition={{duration: 0.3, delay: 0.1}}
                                        className="mb-4 border-b last:border-b-0 pb-2"
                                    >
                                        <p className="text-sm text-gray-500 capitalize">{key}</p>
                                        <p className="text-lg font-medium">{displayValue || "N/A"}</p>
                                    </motion.div>
                                );
                            })}
                        </CardBody>
                        <div
                            className={`absolute bg-purple-800/50 w-3/4 h-1/2 top-3/4 -translate-y-1/2 rounded-full blur-[150px]  left-1/2 -translate-x-1/2 opacity-0 dark:opacity-100`}/>
                        <div
                            className={`absolute bg-secondary w-40 h-3/4 top-0  rounded-full blur-[106px] rotate-45 left-1/2 -translate-x-1/2  opacity-0 dark:opacity-100`}/>
                    </Card>
                </motion.div>
            )}
        </div>
    );
};

// Skeleton Loading Component
const LoadingSkeleton = () => (
    <div className="min-h-screen flex justify-center items-center">
        <div className="w-full max-w-lg">
            <Skeleton className="h-10 w-1/2 mb-4"/>
            <Skeleton className="h-20 w-full mb-4"/>
            <Skeleton className="h-6 w-full mb-2"/>
            <Skeleton className="h-6 w-full mb-2"/>
            <Skeleton className="h-6 w-full mb-2"/>
        </div>
    </div>
);

export default DetailsPage;
