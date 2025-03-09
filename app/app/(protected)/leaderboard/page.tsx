"use client";
import React, {useEffect, useRef, useState} from "react";
import {collection, getDocs, orderBy, query, Timestamp} from "firebase/firestore";
import {db} from "@/lib/firebase";
import {dailyActivityType} from "@/types/dailyactivityTypes";
import {Tabs, Tab} from "@heroui/react";
import {format,  parseISO} from "date-fns";
import {Skeleton} from "@heroui/skeleton";

type GroupedRecords = {
    [activityType: string]: {
        [name: string]: number;
    };
};


type Scholar = {
    employeeId: string;
    name: string;
};

const Page = () => {
    const [groupedRecords, setGroupedRecords] = useState<GroupedRecords>({});
    const [loading, setLoading] = useState<boolean>(true);
    const [selected, setSelected] = useState<string>();
    const [selectedMonth, setSelectedMonth] = useState<string>("overall");
    const [availableMonths, setAvailableMonths] = useState<string[]>([]);
    const [records, setRecords] = useState<dailyActivityType[]>([]);
    const [scholars, setScholars] = useState<Record<string, string>>({}); // EmployeeID → Name mapping
    const tabsRef = useRef<HTMLDivElement>(null);

      // Fetch scholars from Firestore
      useEffect(() => {
        const fetchScholars = async () => {
            try {
                const scholarsQuery = query(collection(db, "scholars"));
                const querySnapshot = await getDocs(scholarsQuery);

                const scholarMap: Record<string, string> = {};
                querySnapshot.forEach((doc) => {
                    const data = doc.data() as Scholar;
                    scholarMap[data.employeeId] = data.name; // Store employeeId → name mapping
                });

                setScholars(scholarMap);
            } catch (error) {
                console.error("Error fetching scholars:", error);
            }
        };

        fetchScholars();
    }, []);

    useEffect(() => {
        const fetchRecords = async () => {
            setLoading(true);
            try {
                const recordsQuery = query(collection(db, "records"), orderBy("date", "desc"));
                const querySnapshot = await getDocs(recordsQuery);
                const fetchedRecords: dailyActivityType[] = querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                })) as dailyActivityType[];
                setRecords(fetchedRecords);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching daily activity records:", error);
                setRecords([]);
                setLoading(false);
            }
        };
        fetchRecords();
    }, []);

    useEffect(() => {
        if (records.length > 0) {
            const uniqueMonths = Array.from(
                new Set(
                    records
                        .map((record) => {
                            if (!record.date) return null;
                            const recordDate =
                                typeof record.date === "string"
                                    ? parseISO(record.date)
                                    : (record.date as Timestamp).toDate(); // Firestore timestamp handling
                            return format(recordDate, "yyyy-MM"); // Format as YYYY-MM
                        })
                        .filter((month): month is string => month !== null) // Ensures TypeScript treats it as string[]
                )
            ).sort((a, b) => b.localeCompare(a)); // Sort descending

            setAvailableMonths(uniqueMonths);
        }
    }, [records]);


    const filterRecords = () => {
        let filteredRecords = records;

        if (selectedMonth !== "overall") {
            filteredRecords = records.filter((record) => {
                if (!record.date) return false;

                const recordDate = typeof record.date === "string"
                    ? parseISO(record.date)
                    : record.date;

                return format(recordDate, "yyyy-MM") === selectedMonth;
            });
        }

        // Group & sort logic remains the same
        const groupedData: GroupedRecords = filteredRecords.reduce((acc: GroupedRecords, record) => {
            const activityType = record.activity?.trim() || "Other Activity";
            const employeeName = record.employeeId?.trim() || "Unnamed";

            if (!acc[activityType]) acc[activityType] = {};
            if (!acc[activityType][employeeName]) acc[activityType][employeeName] = 0;

            acc[activityType][employeeName]++;
            return acc;
        }, {});

        setGroupedRecords(groupedData);
    };    
 
    useEffect(() => {
        if (records.length > 0 && Object.keys(scholars).length > 0) {
            filterRecords();
        }
    }, [records, scholars, selectedMonth]);

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!tabsRef.current) return;
        const startX = e.pageX;
        const scrollLeft = tabsRef.current.scrollLeft;

        const handleMouseMove = (event: MouseEvent) => {
            if (tabsRef.current) {
                tabsRef.current.scrollLeft = scrollLeft - (event.pageX - startX);
            }
        };

        const handleMouseUp = () => {
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);
        };

        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);
    };

    console.log(scholars)

    return (
        <div className="p-6">
            <div className="mb-4 flex justify-center">
                {loading ? (
                    <Skeleton className="h-10 w-32 rounded-lg" />
                ) : (
                    <select
                        className="p-2 border rounded-lg items-end"
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                    >
                        <option value="overall">Overall</option>
                        {availableMonths.map((month) => {
                            try {
                                const formattedMonth = format(parseISO(`${month}-01`), "MMMM yyyy"); // Converts YYYY-MM to readable format
                                return (
                                    <option key={month} value={month}>
                                        {formattedMonth}
                                    </option>
                                );
                            } catch (error) {
                                console.error("Invalid date format:", month, error);
                                return null;
                            }
                        })}
                    </select>
                )}

            </div>
            {loading ? (
                <div className="flex gap-4 overflow-x-auto scrollbar-hide p-2">
                    {[1, 2, 3, 4].map((_, i) => (
                        <Skeleton key={i} className="w-32 h-10 rounded-lg"></Skeleton>
                    ))}
                </div>
            ) : Object.keys(groupedRecords).length === 0 ? (
                <p>No records found.</p>
            ) : (
                <div ref={tabsRef} onMouseDown={handleMouseDown}
                     className="overflow-x-auto scrollbar-hide cursor-grab select-none p-2 rounded-lg">
                    <Tabs
                        aria-label="Activity Tabs"
                        classNames={{
                            tabList: "gap-6 w-full relative rounded-none p-0 border-b border-divider",
                            cursor: "w-full bg-secondary",
                            tab: "max-w-fit px-0 h-12",
                            tabContent: "group-data-[selected=true]:text-secondary",
                        }}
                        color="primary"
                        variant="underlined"
                        selectedKey={selected}
                        onSelectionChange={(key) => setSelected(key as string)}
                    >
                        {Object.entries(groupedRecords)
                            .sort(([, employeesA], [, employeesB]) =>
                                Object.values(employeesB).reduce((sum, count) => sum + count, 0) -
                                Object.values(employeesA).reduce((sum, count) => sum + count, 0)
                            ) 
                            .map(([activityType, employees]) => (
                                <Tab key={activityType}
                                     title={`${activityType} (${Object.values(employees).reduce((sum, count) => sum + count, 0)})`}/>
                            ))}
                    </Tabs>
                </div>

            )}

            {/* Leaderboard Section */}
            {loading ? (
                <div className="mt-6 space-y-3">
                    {[1, 2, 3, 4, 5].map((_, i) => (
                        <Skeleton key={i} className="h-12 rounded-lg"></Skeleton>
                    ))}
                </div>
            ) : selected && groupedRecords[selected] && (
                <div className="mt-6 p-4 bg-white dark:bg-gray-900 rounded-xl shadow-lg">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 text-center">
                        {selected} Activity Leaderboard
                    </h2>

                    <div className="space-y-3">
                        {Object.entries(groupedRecords[selected])
                            .sort((a, b) => b[1] - a[1])
                            .map(([employeeId, count], index) => {
                                const employeeName = scholars.hasOwnProperty(employeeId)
                                    ? scholars[employeeId]
                                    : "Unnamed";
                                return(
                                <div
                                    key={employeeId}
                                    className={`flex items-center justify-between p-3 rounded-lg transition-all
                                        ${
                                        index === 0
                                            ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold shadow-md"
                                            : index === 1
                                                ? "bg-gradient-to-r from-gray-400 to-gray-600 text-white font-semibold"
                                                : index === 2
                                                    ? "bg-gradient-to-r from-orange-300 to-orange-600 text-white font-semibold"
                                                    : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                                    }
                                    `}
                                >
                                    <div className="flex items-center gap-3">
                                        <span className={`text-lg font-semibold ${index === 0 ? "text-2xl" : ""}`}>
                                            #{index + 1}
                                        </span>
                                        <span className={`text-lg ${index === 0 ? "text-xl" : ""}`}>
                                            {employeeName}
                                        </span>
                                    </div>
                                    <span className={`text-lg font-semibold ${index === 0 ? "text-xl" : ""}`}>
                                        {count}
                                    </span>
                                </div>
                            )})}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Page;
