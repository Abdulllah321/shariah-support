import React, {useState, useMemo} from "react";
import {Sheet} from "react-modal-sheet";
import {RadioGroup} from "@heroui/radio";
import {Button} from "@heroui/button";
import {format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval} from "date-fns";
import {Checkbox} from "@heroui/checkbox";
import * as XLSX from "xlsx";
import {CustomRadio} from "@/components/CustomRadio";
import {Download} from "lucide-react";

interface DailyActivityRecord {
    date: string;
    name?: string;
    activity?: string;
    duration?: string;
    city?: string;
    remarks?: string;
}

interface ExportBottomSheetProps {
    dailyActivityRecords: DailyActivityRecord[];
}

const ExportBottomSheet: React.FC<ExportBottomSheetProps> = ({dailyActivityRecords}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState<string>("all");
    const [selectedMonths, setSelectedMonths] = useState<string[]>([]);

    // Generate year-wise grouped months
    const availableMonths = useMemo(() => {
        const months = new Map<string, string[]>();
        dailyActivityRecords.forEach((record) => {
            const date = new Date(record.date);
            const monthKey = format(date, "yyyy-MM");
            const year = format(date, "yyyy");
            if (!months.has(year)) {
                months.set(year, []);
            }
            if (!months.get(year)?.includes(monthKey)) {
                months.get(year)?.push(monthKey);
            }
        });
        return months;
    }, [dailyActivityRecords]);

    const toggleMonthSelection = (monthKey: string) => {
        setSelectedFilter("")
        setSelectedMonths((prev) =>
            prev.includes(monthKey) ? prev.filter((m) => m !== monthKey) : [...prev, monthKey]
        );
    };

    const handleExportToExcel = () => {
        let filteredData = dailyActivityRecords;
        const today = new Date();

        if (selectedFilter === "this-week") {
            const weekStart = startOfWeek(today, {weekStartsOn: 1});
            const weekEnd = endOfWeek(today, {weekStartsOn: 1});
            filteredData = dailyActivityRecords.filter((record) =>
                isWithinInterval(new Date(record.date), {start: weekStart, end: weekEnd})
            );
        } else if (selectedFilter === "this-month") {
            const monthStart = startOfMonth(today);
            const monthEnd = endOfMonth(today);
            filteredData = dailyActivityRecords.filter((record) =>
                isWithinInterval(new Date(record.date), {start: monthStart, end: monthEnd})
            );
        } else if (selectedMonths.length > 0) {
            filteredData = dailyActivityRecords.filter((record) => {
                const recordMonth = format(new Date(record.date), "yyyy-MM");
                return selectedMonths.includes(recordMonth);
            });
        }

        if (filteredData.length === 0) {
            alert("No records found for the selected filter.");
            return;
        }

        const formattedData = filteredData.map((record) => ({
            "Sharia Scholar": record.name || "N/A",
            Date: format(new Date(record.date), "yyyy-MMM-dd"),
            Day: new Date(record.date).toLocaleDateString("en-US", {weekday: "long"}),
            "Activity / Title": record.activity || "N/A",
            Duration: record.duration || "N/A",
            City: record.city || "N/A",
            Remarks: record.remarks || "N/A",
        }));

        const ws = XLSX.utils.json_to_sheet(formattedData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Daily Activity Report");

        const excelBuffer = XLSX.write(wb, {bookType: "xlsx", type: "array"});
        const blob = new Blob([excelBuffer], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });

        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "Daily_Activity_Report.xlsx";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setIsOpen(false);
    };

    const handleFilterChange = (value: string) => {
        setSelectedFilter(value);
        if (value) {
            setSelectedMonths([]);
        }
    };

    return (
        <>
            <div className="flex flex-row items-center justify-between p-2.5">
                <h2 className={`text-2xl font-extrabold`}>Daily Activity Report</h2>


                <Button
                    onPress={() => setIsOpen(true)}
                    isIconOnly
                    color={'warning'}
                    radius={'full'}
                    variant={`faded`}
                    className="shadow-secondary"
                >
                    <Download size={20}/>
                </Button>
            </div>
            <Sheet isOpen={isOpen} onClose={() => setIsOpen(false)} rootId="root">
                <Sheet.Container className="border-t rounded-t-2xl shadow-lg">
                    <Sheet.Header/>
                    <Sheet.Content className="p-6 overflow-y-auto max-h-[80vh]">
                        <h2 className="text-xl font-semibold text-center text-foreground-800 mb-4">
                            Export Daily Activity Report
                        </h2>

                        {/* Radio Group for Single Selection */}
                        <div className="space-y-4">
                            <RadioGroup value={selectedFilter} onValueChange={handleFilterChange}
                                        color={'secondary'}>
                                <CustomRadio value="all">All Records</CustomRadio>
                                <CustomRadio value="this-week">This Week</CustomRadio>
                                <CustomRadio value="this-month">This Month</CustomRadio>
                            </RadioGroup>
                        </div>

                        <div className="flex items-center my-6">
                            <hr className="flex-1 border-foreground-600"/>
                            <span
                                className="px-4 font-medium text-foreground-600 bg-(hsl(var(--background-muted)))">OR</span>
                            <hr className="flex-1 border-foreground-600"/>
                        </div>

                        {/* Multi-select Year-wise Categorized Months */}
                        <div className="mt-4 space-y-4">
                            {Array.from(availableMonths.entries()).map(([year, months]) => (
                                <div key={year}>
                                    <h3 className="font-semibold text-lg">{year}</h3>
                                    <div className="flex gap-2 overflow-x-auto p-2 scrollbar-hide">
                                        {months.map((monthKey) => (
                                            <Checkbox
                                                key={monthKey}
                                                isSelected={selectedMonths.includes(monthKey)}
                                                onValueChange={() => toggleMonthSelection(monthKey)}
                                                className={`px-4 py-2 rounded-lg shadow-md transition }`}
                                                color={'secondary'}
                                            >
                                                {format(new Date(`${monthKey}-01`), "MMMM")}
                                            </Checkbox>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>


                        <div className="mt-6 flex  space-x-2 justify-end">
                            <Button variant="ghost" onPress={() => setIsOpen(false)}>
                                Cancel
                            </Button>
                            <Button
                                color="success"
                                variant={'shadow'}
                                disabled={!selectedFilter && selectedMonths.length === 0}
                                onPress={handleExportToExcel}
                            >
                                Export
                            </Button>
                        </div>
                    </Sheet.Content>
                </Sheet.Container>
            </Sheet>
        </>
    );

};

export default ExportBottomSheet;
