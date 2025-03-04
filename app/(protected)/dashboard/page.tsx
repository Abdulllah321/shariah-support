"use client";

import React, {useEffect, useState} from "react";
import {db} from "@/lib/firebase";
import {collection, getDocs, query, where} from "firebase/firestore";
import {useAuth} from "@/context/AuthContext";
import {Bar, Doughnut} from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";
import {Activity, Award, Trophy} from "lucide-react";
import {dailyActivityType} from "@/types/dailyactivityTypes";
import {Skeleton} from "@heroui/react";
import dayjs from "dayjs";
import StatCard from "@/components/StatCard";
import {useTheme} from "@heroui/use-theme";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

const Dashboard: React.FC = () => {
    const [totalScores, setTotalScores] = useState(0);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [chartData, setChartData] = useState<any>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [pieChartData, setPieChartData] = useState<any>(null);
    const [loading, setLoading] = useState(false)
    const [selectedMonth, setSelectedMonth] = useState<string>();
    const [availableMonths, setAvailableMonths] = useState<{ value: string; label: string }[]>([]);
    const [monthlyCategoryMap, setMonthlyCategoryMap] = useState<Record<string, Record<string, number>>>({});
    const [dailyActivityRecords, setDailyActivityRecords] = useState<dailyActivityType[]>()

    const {user} = useAuth();
    const {theme} = useTheme();

    useEffect(() => {
        if (!user?.employeeId) return;

        const fetchData = async () => {
            try {
                setLoading(true)
                const recordsQuery = query(collection(db, "records"), where("employeeId", "==", user.employeeId));
                const recordsSnapshot = await getDocs(recordsQuery);

                const categoryMap: Record<string, number> = {};
                let totalScore = 0;
                const monthlyData: Record<string, Record<string, number>> = {};
                const uniqueMonths = new Set<string>();
                const activityFrequency: Record<string, number> = {};

                const dailyActivity = recordsSnapshot.docs.map((doc) => ({
                    id: doc.id, // Include the document ID if needed
                    ...doc.data(),
                })) as dailyActivityType[];

                setDailyActivityRecords(dailyActivity);

                recordsSnapshot.forEach((doc) => {
                    const data = doc.data() as dailyActivityType;
                    const activityType = data.activity || "Unknown";
                    const recordMonth = dayjs(data.date).format("YYYY-MM");
                    // Aggregate activity counts
                    categoryMap[activityType] = (categoryMap[activityType] || 0) + 1;
                    totalScore += Number(data.score) || 0;

                    // Track per-month activity distribution
                    if (!monthlyData[recordMonth]) {
                        monthlyData[recordMonth] = {};
                    }
                    monthlyData[recordMonth][activityType] = (monthlyData[recordMonth][activityType] || 0) + 1;

                    uniqueMonths.add(recordMonth);

                    // Count most frequent activity
                    activityFrequency[activityType] = (activityFrequency[activityType] || 0) + 1;
                });



                setTotalScores(totalScore);
                setMonthlyCategoryMap(monthlyData);

                // Set available months dynamically
                const sortedMonths = Array.from(uniqueMonths)
                    .sort((a, b) => dayjs(b).diff(dayjs(a))) // Sort from latest to oldest
                    .map((month) => ({
                        value: month, // Keep "YYYY-MM" for filtering
                        label: dayjs(month).format("MMM YYYY"), // Display as "Feb 2025"
                    }));

                setAvailableMonths(sortedMonths);
                setSelectedMonth(sortedMonths[0].value)
                // Update charts
                setChartData({
                    labels: Object.keys(categoryMap),
                    datasets: [
                        {
                            label: "Records by Activity",
                            data: Object.values(categoryMap),
                            backgroundColor: theme === "dark" ? "#6366F1" : "#3B82F6",
                            borderRadius: 8,
                        },
                    ],
                });
                // Ensure pie chart updates correctly
                updatePieChart(sortedMonths[0].value, monthlyData);
            } catch (error) {
                console.error("Error fetching data: ", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user?.employeeId, theme]);

    const professionalColors = [
        "#4E79A7", "#F28E2B", "#E15759", "#76B7B2", "#59A14F", "#EDC949", "#B07AA1", "#FF9DA7",
        "#9C755F", "#BAB0AC", "#D37295", "#8CD17D", "#6A3D9A", "#BD5F00", "#5F9EA0",
    ];

    const updatePieChart = (month: string, dataMap: Record<string, Record<string, number>>) => {
        const dataForMonth = dataMap[month] || {};
        setPieChartData({
            labels: Object.keys(dataForMonth),
            datasets: [
                {
                    label: "Records by Activity",
                    data: Object.values(dataForMonth),
                    backgroundColor: professionalColors.slice(0, Object.keys(dataForMonth).length),
                    hoverOffset: 6,
                },
            ],
        });
    };

    const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedMonth = e.target.value;
        setSelectedMonth(selectedMonth);
        updatePieChart(selectedMonth, monthlyCategoryMap);
    };

    const activityCount: Record<string, number> = {};
    dailyActivityRecords?.forEach(record => {
        const activity = record.activity; // Single activity per record
        if (activity) {
            activityCount[activity] = (activityCount[activity] || 0) + 1;
        }
    });


    const topActivities = Object.entries(activityCount)
        .sort((a, b) => b[1] - a[1]) // Sort by occurrence count (descending)
        .slice(0, 3) // Get top 3
        .map(([activity, count]) => `${activity} (${count})`);

    return (
        <div className="min-h-screen p-4 md:p-6">
            <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

            {/* Stat Cards (Only First and Last) */}
            <div className="grid gap-4 md:grid-cols-2">
                {/* Total Scores */}
                <StatCard
                    title="Total Scores"
                    value={totalScores}
                    icon={Activity}
                    loading={loading}
                    color="bg-gradient-to-r  from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-400/50"
                />


            </div>

            <div className="flex flex-col items-center w-full p-6 mt-10 rounded-2xl border shadow-lg backdrop-blur-md
    bg-white dark:bg-gray-900/50 border-gray-300 dark:border-gray-700 shadow-gray-400 dark:shadow-gray-800">

                {/* Title */}
                <h2 className="text-xl font-bold flex items-center gap-2 text-gray-800 dark:text-white">
                    🏆 Top Activities Leaderboard
                </h2>

                {/* Loading State */}
                {loading ? (
                    <div className="flex flex-col items-center space-y-3 w-full mt-4">
                        <Skeleton className="w-full h-10 rounded-full"/>
                        <Skeleton className="w-full h-10 rounded-full scale-90"/>
                        <Skeleton className="w-full h-10 rounded-full scale-80"/>
                    </div>
                ) : topActivities?.length > 0 ? (
                    <div className="flex flex-col items-center space-y-3 w-full mt-4">
                        {topActivities.map((activity, index) => {
                            // Rank-specific styles with Light & Dark Mode Support
                            const rankStyles = [
                                "bg-yellow-200/60 border-yellow-400 text-yellow-700 shadow-yellow-400/40 dark:bg-yellow-500/30 dark:border-yellow-400 dark:text-yellow-200 dark:shadow-yellow-500/40",
                                "bg-gray-200/60 border-gray-400 text-gray-700 shadow-gray-400/40 dark:bg-gray-500/30 dark:border-gray-400 dark:text-gray-200 dark:shadow-gray-500/40",
                                "bg-orange-200/60 border-orange-400 text-orange-700 shadow-orange-400/40 dark:bg-orange-500/30 dark:border-orange-400 dark:text-orange-200 dark:shadow-orange-500/40"
                            ];

                            return (
                                <div
                                    key={index}
                                    className={`relative w-full px-6 py-3 rounded-full border text-center font-semibold flex items-center transition-all duration-300 transform
                            ${rankStyles[index] || "bg-gray-100 border-gray-400 text-gray-700 shadow-gray-300 dark:bg-white/10 dark:border-gray-600 dark:text-gray-300 dark:shadow-gray-700/30"}
                            ${index === 0 ? "scale-105 text-lg" : index === topActivities.length - 1 ? "scale-90" : "scale-95"}`}
                                    style={{
                                        boxShadow: "inset 2px 2px 6px rgba(0,0,0,0.05), 3px 3px 10px rgba(0,0,0,0.1)"
                                    }}
                                >
                                    {/* Trophy or Award Icon */}
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2">
                                        {index < 3 ? (
                                            <Trophy className="w-6 h-6 text-yellow-600 dark:text-yellow-300"
                                                    strokeWidth={2}/>
                                        ) : (
                                            <Award className="w-6 h-6 text-gray-600 dark:text-gray-400"
                                                   strokeWidth={2}/>
                                        )}
                                    </div>

                                    {/* Rank & Activity Name */}
                                    <span className="ml-10 whitespace-nowrap">
                            {index + 1}. {activity}
                        </span>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <p className="mt-4 text-gray-600 dark:text-gray-400">
                        No activities recorded yet. Start logging your activities to see rankings here! 🚀
                    </p>
                )}
            </div>

            {/* Activity Distribution Chart */}
            <div className="mt-10 p-4 md:p-6 bg-white dark:bg-neutral-950 shadow-lg rounded-lg">
                <h2 className="text-xl font-semibold mb-4">Activity Distribution</h2>
                {chartData ? (
                    <Bar data={chartData} options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        animation: {
                            duration: 1000,
                            easing: "easeInOutQuad",
                        },
                        plugins: {
                            legend: {display: false},
                            tooltip: {enabled: true},
                        },
                        scales: {
                            x: {
                                ticks: {
                                    autoSkip: true,
                                    maxRotation: 90,
                                    minRotation: 90,
                                    callback: function (value) {
                                        const label = this.getLabelForValue(value as number);
                                        return label.length > 10 ? label.substring(0, 10) + "..." : label;
                                    },
                                },
                            },
                            y: {
                                beginAtZero: true,
                            },
                        },
                    }}
                         className="h-[300px] md:h-[400px] max-h-[400px]"
                    />) : (
                    <div className="h-[300px] md:h-[400px] max-h-[400px] flex flex-col justify-between p-4">
                        {/* X-Axis Labels Skeleton */}
                        <div className="flex justify-between mb-4">
                            {Array.from({length: 5}).map((_, index) => (
                                <Skeleton key={index} className="h-4 w-10 rounded"/>
                            ))}
                        </div>

                        {/* Bars Skeleton */}
                        <div className="flex justify-between items-end space-x-3">
                            {Array.from({length: 6}).map((_, index) => (
                                <Skeleton
                                    key={index}
                                    className={`w-8 rounded-md ${
                                        index % 2 === 0 ? "h-24" : "h-32"
                                    }`}
                                />
                            ))}
                        </div>

                        {/* Y-Axis Labels Skeleton */}
                        <div className="flex  items-start space-y-2 mt-4 justify-between">
                            {Array.from({length: 6}).map((_, index) => (
                                <Skeleton key={index} className="w-5 h-12 rounded"/>
                            ))}
                        </div>
                    </div>
                )}
            </div>


            {/* Pie Chart - Activity Distribution by Month */}
            <div className="mt-10 p-4 md:p-6 bg-white dark:bg-neutral-950 shadow-lg rounded-lg">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Activity Distribution by Month</h2>
                    <select
                        className="p-2 border rounded-md  bg-white dark:bg-neutral-700"
                        value={selectedMonth}
                        onChange={handleMonthChange}
                    >
                        {availableMonths.length > 0 ? (
                            availableMonths.map(({value, label}) => (
                                <option key={value} value={value}>
                                    {value === dayjs().format("YYYY-MM") ? `📅 ${label} (Current)` : label}
                                </option>
                            ))
                        ) : (
                            <option value="">No data available</option>
                        )}
                    </select>
                </div>
                {pieChartData ? (
                    <Doughnut data={pieChartData}
                              options={{responsive: true, plugins: {legend: {position: "bottom"}}}}/>
                ) : (
                    <div className="flex flex-col items-center justify-center space-y-4">
                        {/* Donut Chart Placeholder */}
                        <div className="relative">
                            <Skeleton className="w-40 h-40 rounded-full"/>
                            <Skeleton
                                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-neutral-100 dark:bg-neutral-700"/>
                        </div>

                        {/* Legend Placeholder */}
                        <div className="flex flex-col space-y-2 w-full px-8">
                            {Array.from({length: 3}).map((_, index) => (
                                <div key={index} className="flex items-center space-x-2">
                                    <Skeleton className="w-4 h-4 rounded-full"/>
                                    <Skeleton className="w-20 h-4 rounded"/>
                                </div>
                            ))}
                        </div>
                    </div>)}
            </div>
        </div>
    );
};

export default Dashboard;
