"use client";
import {useRecord} from "@/context/RecordContext";
import * as XLSX from "xlsx";
import {format} from "date-fns";
import {deleteDoc} from "@firebase/firestore";
import {doc} from "firebase/firestore";
import {db} from "@/lib/firebase";
import {ScrollShadow} from "@heroui/scroll-shadow";
import {dailyActivityType} from "@/types/dailyactivityTypes";
import {Button} from "@heroui/react";
import {Download} from "lucide-react";
import CommonList from "@/components/CommonList";
import {EmployeeData as branchShariahTypes} from "@/types/branchShariahTypes";
import {EmployeeData as staffInterviewTypes} from "@/types/staffInterviewTypes";
import {leadsType} from "@/types/360LeadsTypes";
import {useRouter} from "next/navigation";
import {Divider} from "@heroui/divider";
import {getFormattedDate} from "@/constants";
import {Accordion, AccordionItem} from "@heroui/react";


// eslint-disable-next-line @typescript-eslint/no-explicit-any
const groupRecordsByMonth = (records: any[]) => {
    return records.reduce((groups, record) => {
        const date = new Date(record.date);
        // Use "yyyy-MM" as a key (e.g., "2025-01")
        const monthKey = format(date, "yyyy-MM");
        if (!groups[monthKey]) {
            groups[monthKey] = [];
        }
        groups[monthKey].push(record);
        return groups;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }, {} as Record<string, any[]>);
};

export default function DailyActivityReport() {
    const {dailyActivityRecords, dailyActivityLoading, fetchDailyActivity} = useRecord();
    const router = useRouter();

    // Export function
    const handleExportToExcel = () => {
        try {
            const formattedData = dailyActivityRecords.map((record) => ({
                "Sharia Scholar": record.name || "N/A",
                Date: format(new Date(record.date), "yyyy-MMM-dd"),
                Day: new Date(record.date).toLocaleDateString("en-US", {weekday: "long"}),
                Duration: record.duration || "N/A",
                "Branch Code": record.branchCode || "N/A",
                "Branch Name": record.branchName || "N/A",
                "Person Met": record.personMet || "N/A",
                Designation: record.designation || "N/A",
                "No of Participants / Clients": record.purpose || "N/A",
                "Activity / Title": record.activity || "N/A",
                "Distance (Local / Short / Long)": record.distance || "N/A",
                Score: record.score || "N/A",
                "Contact #": record.contact || "N/A",
                "Other Venue": record.otherVenue || "N/A",
                City: record.city || "N/A",
                Area: record.area || "N/A",
                RGM: record.rgm || "N/A",
                Region: record.region || "N/A",
                "Branch Response": record.branchResponse || "N/A",
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
        } catch (error) {
            console.error("Error exporting report:", error);
            alert("Error: Failed to export the report.");
        }
    };

    // Delete function
    const confirmDelete = async (id: string) => {
        await deleteDoc(doc(db, "records", id));
        fetchDailyActivity();
    };

    // Render function for an individual record
    const renderItemContent = (
        item: dailyActivityType | branchShariahTypes | staffInterviewTypes | leadsType
    ) => {
        if ("date" in item && "activity" in item) {
            return (
                <div className="flex items-center space-x-2">
          <span className="base font-medium text-foreground-600">
            {getFormattedDate(item.date)}
          </span>
                    {item.activity ? (
                        <span className="text-gray-600">{`- ${item.activity}`}</span>
                    ) : (
                        <span className="text-red-500">- No activity</span>
                    )}
                </div>
            );
        }
        return <span className="text-gray-500">Unknown Record Type</span>;
    };

    // Group records by month
    const groupedRecords = groupRecordsByMonth(dailyActivityRecords);
    // Sort month keys in descending order (latest first)
    const sortedMonthKeys = Object.keys(groupedRecords).sort(
        (a, b) => new Date(`${b}-01`).getTime() - new Date(`${a}-01`).getTime()
    );

    return (
        <ScrollShadow>
            <div className="flex flex-row items-center justify-between p-2.5">
                <h2 className="text-2xl font-extrabold">Daily Activity Report</h2>
                <Button
                    onPress={handleExportToExcel}
                    isIconOnly
                    color={"warning"}
                    radius={"full"}
                    variant={`faded`}
                    className="shadow-secondary"
                >
                    <Download size={20}/>
                </Button>
            </div>
            <Divider/>

            {sortedMonthKeys.length > 0 ? (
                <Accordion selectionMode={'multiple'} defaultExpandedKeys={'all'}>
                    {sortedMonthKeys.map((monthKey) => {
                        const dateObj = new Date(`${monthKey}-01`);
                        const monthLabel = format(dateObj, "MMMM yyyy");
                        return (
                            <AccordionItem
                                key={monthKey}
                                title={monthLabel}
                                classNames={
                                    {
                                        title: "text-xl font-extrabold text-secondary px-4 shadow-white drop-shadow-xl"
                                    }
                                }

                            >
                                <CommonList
                                    records={groupedRecords[monthKey]}
                                    confirmDelete={confirmDelete}
                                    fetchRecords={fetchDailyActivity}
                                    renderItemContent={renderItemContent}
                                    action="daily-activity"
                                    noRecordsActions={[
                                        {
                                            label: "Add Daily Activity Record",
                                            onPress: () => router.push("/forms/daily-activity"),
                                        },
                                    ]}
                                    loading={dailyActivityLoading}
                                />
                            </AccordionItem>
                        );
                    })}
                </Accordion>
            ) : (
                <p className="p-4 text-center">No records found.</p>
            )}
        </ScrollShadow>
    );
}
