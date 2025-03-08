import React from "react";
import { LucideIcon } from "lucide-react";
import { Skeleton } from "@heroui/react";

interface StatCardProps {
    title: string;
    value: number|string;
    icon: LucideIcon;
    color: string;
    loading?:boolean
}

const StatCard = ({ title, value, icon: Icon, color,loading }:StatCardProps) => {
    if (loading) return <StatCardSkeleton />;
    return (
        <div className={`p-4 rounded-lg shadow-md flex items-center ${color}`}>
            <div className="bg-white/20 p-3 rounded-lg">
                <Icon className="h-8 w-8" />
            </div>
            <div className="ml-4">
                <h2 className="text-lg font-semibold">{title}</h2>
                <p className="text-2xl font-bold">{value}</p>
            </div>
        </div>
    );
};

export default StatCard;

const StatCardSkeleton: React.FC = () => {
    return (
        <div className="p-4 rounded-lg shadow-md flex items-center bg-neutral-200 dark:bg-neutral-800 animate-pulse">
            {/* Icon Skeleton */}
            <div className="bg-neutral-300 dark:bg-neutral-700 p-3 rounded-lg">
                <Skeleton className="h-10 w-10 rounded-lg" />
            </div>

            {/* Text Skeletons */}
            <div className="ml-4 flex flex-col space-y-2 w-full">
                <Skeleton className="h-5 w-32 rounded" />
                <Skeleton className="h-8 w-20 rounded" />
            </div>
        </div>
    );
};
