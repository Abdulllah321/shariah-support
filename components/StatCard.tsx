import React from "react";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
    title: string;
    value: number|string;
    icon: LucideIcon;
    color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, color }) => {
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
