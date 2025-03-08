"use client";
import {useParams, useSearchParams} from "next/navigation";
import {Breadcrumbs, BreadcrumbItem} from "@heroui/breadcrumbs";
import {motion} from "framer-motion";
import { Home} from "lucide-react";
import ReportDetails from "@/components/ReportDetails";


const DetailsPage = () => {
    const {id} = useParams();
    const searchParams = useSearchParams();
    const actionParam = searchParams.get("action");
    const action = actionParam === "branch-shariah" ? "branch-review" : actionParam

    // Function to transform action string into readable format
    const transformAction = (action: string | null): string => {
        if (!action) return "Details";
        return action
            .replace(/-/g, " ")
            .replace(/\b\w/g, (char) => char.toUpperCase());
    };


    return (
        <div className="min-h-screen p-6 w-full md:w-1/2 mx-auto">
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

            <motion.div
                initial={{opacity: 0, y: 20}}
                animate={{opacity: 1, y: 0}}
                transition={{duration: 0.5}}
                className="w-full max-w-lg mx-auto"
            >
                <ReportDetails id={id as string}
                /></motion.div>

        </div>
    );
};


export default DetailsPage;
