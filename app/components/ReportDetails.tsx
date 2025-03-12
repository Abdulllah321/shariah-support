"use client";

import {useSearchParams} from "next/navigation";
import React, {JSX, useEffect, useState} from "react";
import {doc, getDoc} from "firebase/firestore";
import {db} from "@/lib/firebase";
import getDailyActivityList from "./DailyActivityList";
import getBranchReviewList from "./BranchReviewList";
import getStaffInterviewList from "./StaffInterviewList";
import get360LeadsList from "./360LeadsList";
import {Card, CardHeader} from "@heroui/react";
import {CardBody} from "@heroui/card";

interface ReportDetailsProps {
    id: string;
}

interface DetailItemProps {
    label: string;
    value: string | number | { label: string; value: string | number }[];
    icon?: JSX.Element;
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const actionMap: Record<string, (id: string) => Promise<any>> = {
    "daily-activity": async (id) => getDoc(doc(db, "records", id)),
    "branch-review": async (id) => getDoc(doc(db, "BranchReview", id)),
    "staff-interview": async (id) => getDoc(doc(db, "StaffReview", id)),
    "360-leads": async (id) => getDoc(doc(db, "360Leads", id)),
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getReportList = async (action: string, data: any) => {
    switch (action) {
        case "daily-activity":
            return getDailyActivityList(data);
        case "branch-review":
            return await getBranchReviewList(data);
        case "staff-interview":
            return await getStaffInterviewList(data);
        case "360-leads":
            return get360LeadsList(data);
        default:
            return [];
    }
};

const ReportDetails: React.FC<ReportDetailsProps> = ({id}) => {
    const searchParams = useSearchParams();
    const actionParam = searchParams.get("action");

    const action = actionParam === "branch-shariah" ? "branch-review" : actionParam

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [report, setReport] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [reportList, setReportList] = useState<DetailItemProps[]>([]);

    useEffect(() => {
        if (!id || !actionMap[action!]) return setLoading(false);

        actionMap[action!](id)
            .then((docSnap) => {
                if (docSnap.exists()) {
                    setReport(docSnap.data());
                }
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [id, action]);

    useEffect(() => {
        if (!report) return;
        getReportList(action!, report).then(setReportList);
    }, [action, report]);

    if (loading) return <SkeletonLoader />;
    if (!report) return <p className="text-center text-gray-500 dark:text-gray-400">No report found.</p>;

    return (
        <div className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-4">
                {reportList.map((item, index) => (
                    <DetailItem key={index} {...item} />
                ))}
            </div>
        </div>
    );
};

const DetailItem: React.FC<DetailItemProps> = ({label, value, icon}) => {
    const isArray = Array.isArray(value);

    return (
        <Card
            className={`border-l-4 border-secondary dark:border-accent-dark shadow-md dark:bg-gray-800 dark:text-gray-300 ${isArray ? "col-span-2" : ""}`}>
            <CardHeader>
                {icon}
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 ml-2">{label}</h3>
            </CardHeader>
            <CardBody className="flex items-start gap-4">
                <div className="w-full">
                    {isArray ? (
                        <ul className="mt-2 space-y-2">
                            {value.map((q, i) => (
                                <li key={i}
                                    className="p-3 border rounded-md shadow-sm dark:border-gray-600 dark:bg-gray-700">
                                    <h2  content={`#${i + 1}`}>
                                        Question #{i + 1}
                                    </h2>
                                    <p className="text-gray-600 dark:text-gray-400 mt-2">{q.label}</p>
                                    <p className="text-lg font-medium text-gray-800 dark:text-gray-100">{q.value}</p>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-lg text-gray-800 font-medium dark:text-gray-100">{value}</p>
                    )}
                </div>
            </CardBody>
        </Card>
    );
};

const SkeletonLoader = () => {
    return (
        <div className="grid lg:grid-cols-2 gap-4">
            {[...Array(4)].map((_, index) => (
                <div key={index} className="p-4 rounded-lg shadow-md animate-pulse bg-gray-200 dark:bg-gray-700">
                    <div className="h-4 w-32 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
                    <div className="h-6 w-full bg-gray-300 dark:bg-gray-600 rounded"></div>
                </div>
            ))}
        </div>
    );
};

export default ReportDetails;
