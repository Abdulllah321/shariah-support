"use client"
import {useRecord} from "@/context/RecordContext";

import * as XLSX from 'xlsx';
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
import {leadsType} from "@/types/360LeadsTypes"
import {useRouter} from "next/navigation";
import {Divider} from "@heroui/divider";

export default function DailyActivityReport() {
    const {LeadsRecords, LeadsLoading, fetchLeads} = useRecord();
    const router = useRouter()

    const handleExportToExcel = () => {
        try {
            const formattedData = LeadsRecords.map((record) => ({
                "BM Domain": record.bmDomainId || "N/A",
                "Client Name": record.clientName || "N/A",
                "Client Cell Code": record.clientCellCode || "N/A",
                "Client Cell Number": record.clientCellNumber || "N/A",
                "Client Business Address": record.clientBusinessAddress || "N/A",
                "Client Employer / Business Name":
                    record.clientEmployerBusinessName || "N/A",
                "Creator Name": record.creator_name || "N/A",
                "Creator Domain": record.creatorId || "N/A",
                "BM Branch Code": record.bmBranchCode || "N/A",
            }));


            const ws = XLSX.utils.json_to_sheet(formattedData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "360 Leads Report");

            const excelBuffer = XLSX.write(wb, {bookType: "xlsx", type: "array"});
            const blob = new Blob([excelBuffer], {type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"});

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
        await deleteDoc(doc(db, "360Leads", id));
        fetchLeads();
    };

    // Render function
    const renderItemContent = (item: dailyActivityType | branchShariahTypes | staffInterviewTypes | leadsType) => {
        if ("bmDomainId" in item && "clientName" in item) {
            return (
                <div className="flex items-center space-x-2">
                    <span
                        className="base font-medium text-foreground-600">{item.bmDomainId}</span>
                    {item.clientName ? (
                        <span className="text-gray-600">{`- ${item.clientName}`}</span>
                    ) : (
                        <span className="text-red-500">- No activity</span>
                    )}
                </div>
            );
        }

        return <span className="text-gray-500">Unknown Record Type</span>;
    };

    return (
        <ScrollShadow>
            <div className="flex flex-row items-center justify-between p-2.5">
                <h2 className={`text-2xl font-extrabold`}>360 Leads Report</h2>
                <Button
                    onPress={handleExportToExcel}
                    isIconOnly
                    color={'warning'}
                    radius={'full'}
                    variant={`faded`}
                    className="shadow-secondary"
                >
                    <Download size={20}/>
                </Button>
            </div>
            <Divider/>

            <CommonList
                records={LeadsRecords}
                confirmDelete={confirmDelete}
                fetchRecords={fetchLeads}
                renderItemContent={renderItemContent}
                action="leads"
                noRecordsActions={
                    [
                        {
                            label: "Add 360 Leads Record",
                            onPress: () => router.push("/forms/360-leads"),
                        },
                    ]}
                loading={LeadsLoading}
            />

        </ScrollShadow>
    );
}
