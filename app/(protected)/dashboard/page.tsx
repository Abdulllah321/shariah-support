"use client";

import React, {useEffect, useState} from "react";
import {db} from "@/lib/firebase";
import {collection, getDocs, query, where} from "firebase/firestore";
import {useAuth} from "@/context/AuthContext";
import {Bar} from "react-chartjs-2";
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
import {useTheme} from "next-themes";
import {Activity, Archive, ClipboardList} from "lucide-react";
import {dailyActivityType} from "@/types/dailyactivityTypes";
import {Spinner} from "@heroui/react";
import dayjs from "dayjs";
import {Doughnut} from "react-chartjs-2";
import StatCard from "@/components/StatCard";


ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

const Dashboard: React.FC = () => {
    const [totalScores, setTotalScores] = useState(0);
    const [recordsCount, setRecordsCount] = useState<number>(0);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [chartData, setChartData] = useState<any>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [pieChartData, setPieChartData] = useState<any>(null);
    const [selectedMonth, setSelectedMonth] = useState<string>(dayjs().format("YYYY-MM"));
    const [availableMonths, setAvailableMonths] = useState<{ value: string; label: string }[]>([]);
    const [monthlyCategoryMap, setMonthlyCategoryMap] = useState<Record<string, Record<string, number>>>({});
    const [currentMonthScore, setCurrentMonthScore] = useState(0);
    const [currentMonthActivities, setCurrentMonthActivities] = useState<string[]>([]);
    const [topActivity, setTopActivity] = useState("None");


    const {user} = useAuth();
    const {theme} = useTheme();

    useEffect(() => {
        if (!user?.employeeId) return;

        const fetchData = async () => {
            try {
                const recordsQuery = query(
                    collection(db, "records"),
                    where("employeeId", "==", user.employeeId)
                );
                const recordsSnapshot = await getDocs(recordsQuery);
                setRecordsCount(recordsSnapshot.size);

                const categoryMap: Record<string, number> = {};
                let totalScore = 0;
                const monthlyData: Record<string, Record<string, number>> = {};
                const uniqueMonths = new Set<string>();

                const currentMonth = dayjs().format("YYYY-MM");

                let currentMonthScore = 0;
                const currentMonthActivities: string[] = [];
                const activityFrequency: Record<string, number> = {};

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

                    // If record belongs to the current month
                    if (recordMonth === currentMonth) {
                        currentMonthScore += Number(data.score) || 0;
                        currentMonthActivities.push(activityType);
                        activityFrequency[activityType] = (activityFrequency[activityType] || 0) + 1;
                    }
                });

                // Find the most frequent activity of this month
                const topActivity =
                    Object.entries(activityFrequency).reduce(
                        (top, entry) => (entry[1] > (top[1] || 0) ? entry : top),
                        ["None", 0]
                    )[0];

                setTotalScores(totalScore);
                setMonthlyCategoryMap(monthlyData);
                setCurrentMonthScore(currentMonthScore);
                setCurrentMonthActivities(currentMonthActivities);
                setTopActivity(topActivity);

                // Set available months dynamically
                const sortedMonths = Array.from(uniqueMonths)
                    .sort((a, b) => dayjs(b).diff(dayjs(a))) // Sort from latest to oldest
                    .map((month) => ({
                        value: month, // Keep "YYYY-MM" for filtering
                        label: dayjs(month).format("MMM YYYY"), // Display as "Feb 2025"
                    }));

                setAvailableMonths(sortedMonths);
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
                // Update pie chart
                updatePieChart(selectedMonth, monthlyData);
            } catch (error) {
                console.error("Error fetching data: ", error);
            }
        };

        fetchData();
    }, [user?.employeeId, theme]);


    const professionalColors = [
        "#4E79A7", // Blue
        "#F28E2B", // Orange
        "#E15759", // Red
        "#76B7B2", // Teal
        "#59A14F", // Green
        "#EDC949", // Yellow
        "#B07AA1", // Purple
        "#FF9DA7", // Soft Pink
        "#9C755F", // Brown
        "#BAB0AC", // Gray
        "#D37295", // Magenta
        "#8CD17D", // Light Green
        "#6A3D9A", // Deep Violet
        "#BD5F00", // Deep Orange
        "#5F9EA0", // Dark Cyan
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


    return (
        <div className="min-h-screen p-4 md:p-6">
            <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

            {/* Stat Cards */}
            <div className="grid gap-4 md:gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Total Scores */}
                <StatCard
                    title="Total Scores"
                    value={totalScores}
                    icon={Activity}
                    color="bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-400/50"
                />

                {/* Total Records */}
                <StatCard
                    title="Total Records"
                    value={recordsCount}
                    icon={Archive }
                    color="bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-400/50"
                />

                {/* Current Month Score */}
                <StatCard
                    title="Current Month Score"
                    value={currentMonthScore}
                    icon={Activity}
                    color="bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-400/50"
                />

                {/* Current Month Activities */}
                <StatCard
                    title="Current Month Activities"
                    value={currentMonthActivities.length}
                    icon={ClipboardList}
                    color="bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-400/50"
                />

                {/* Top Activity of the Month */}
                <StatCard
                    title="Top Activity of the Month"
                    value={topActivity}
                    icon={Activity}
                    color="bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-400/50"
                />
            </div>


            {/* Activity Distribution Chart */}
            <div className="mt-10 p-4 md:p-6 bg-white dark:bg-gray-800 shadow-lg rounded-lg">
                <h2 className="text-xl font-semibold mb-4">Activity Distribution</h2>
                {chartData ? (
                    <Bar data={chartData} options={{responsive: true}} className="h-[300px] md:h-[400px]"/>
                ) : (
                    <p><Spinner/>Loading chart...</p>
                )}
            </div>

            {/* Pie Chart - Activity Distribution by Month */}
            <div className="mt-10 p-4 md:p-6 bg-white dark:bg-gray-800 shadow-lg rounded-lg">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Activity Distribution by Month</h2>
                    <select
                        className="p-2 border rounded-md dark:bg-gray-700"
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
                    <p><Spinner/>Loading chart...</p>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
