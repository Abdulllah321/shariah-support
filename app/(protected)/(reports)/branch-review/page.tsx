"use client"
import {useRecord} from "@/context/RecordContext";
import * as XLSX from 'xlsx';
import {format} from "date-fns";
import {deleteDoc} from "@firebase/firestore";
import {collection, doc, getDocs, orderBy, query} from "firebase/firestore";
import {db} from "@/lib/firebase";
import {ScrollShadow} from "@heroui/scroll-shadow";
import {dailyActivityType} from "@/types/dailyactivityTypes";
import {Button, Card} from "@heroui/react";
import {Download} from "lucide-react";
import CommonList from "@/components/CommonList";
import {EmployeeData as branchShariahTypes} from "@/types/branchShariahTypes";
import {EmployeeData as staffInterviewTypes} from "@/types/staffInterviewTypes";
import {leadsType} from "@/types/360LeadsTypes"
import {useRouter} from "next/navigation";
import {Divider} from "@heroui/divider";
import {useEffect, useState} from "react";
import {Question} from "@/components/QuestionsList";
import {CardHeader} from "@heroui/card";
import {getFormattedDate} from "@/constants";


const DRAFT_STORAGE_KEY = "cachedBranchShariahReviews";

export default function DailyActivityReport() {
    const {branchShariahRecords, branchShariahLoading, fetchBranchShariah} = useRecord();
    const router = useRouter();
    const [questions, setQuestions] = useState<Question[]>()
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [drafts, setDrafts] = useState<any[]>([]);


    const fetchDraft = async () => {
        const existingDrafts = localStorage.getItem(DRAFT_STORAGE_KEY);
        const drafts = existingDrafts ? JSON.parse(existingDrafts) : [];

        if (drafts) {
            setDrafts(drafts);
        }
    };

    useEffect(() => {
        fetchDraft();
    }, []);


    const fetchQuestions = async () => {
        try {
            const questionQuery = query(
                collection(db, "branches-review-points"),
                orderBy("order") // Order by the "order" field
            );
            const questionSnapshot = await getDocs(questionQuery);

            const questionList: Question[] = questionSnapshot.docs.map((doc) => ({
                ...doc.data(),
                id: doc.id,
            }) as Question);

            setQuestions(questionList);
        } catch (error) {
            console.error("Error fetching questions: ", error);
        }
    };

    useEffect(() => {
        fetchQuestions()
    }, []);

    // Export function
    const handleExportToExcel = () => {
        try {

            const formattedData = branchShariahRecords.map((record: branchShariahTypes) => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const rowData: any = { // 👈 Define rowData as an indexable object
                    "Sharia Scholar": record.name || "N/A",
                    "Branch Code": record.branchCode || "N/A",
                    "Branch City": record.city || "N/A",
                    Province: record.province || "N/A",
                    "Branch Region": record.region || "N/A",
                    "Visit Date": record.visitDate
                        ? format(new Date(record.visitDate), "yyyy-MM-dd") // Ensure correct format
                        : "N/A",
                };

                questions?.forEach((question: Question) => {
                    rowData[question.name] = record[question.name] || "N/A";
                });
                return rowData;
            });


            if (!formattedData || formattedData.length === 0) {
                throw new Error("No data available to export");
            }

            const ws = XLSX.utils.json_to_sheet(formattedData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Daily Activity Report");

            const excelBuffer = XLSX.write(wb, {bookType: "xlsx", type: "array"});
            const blob = new Blob([excelBuffer], {type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"});

            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = "Branch Review Report.xlsx";
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
        await deleteDoc(doc(db, "BranchReview", id));
        fetchBranchShariah();
    };

    const handleDeleteDraft = (id: string) => {
        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const updatedDrafts = drafts?.filter((draft: any) => draft.id !== id);
            setDrafts(updatedDrafts);

            localStorage.setItem(
                DRAFT_STORAGE_KEY,
                JSON.stringify(updatedDrafts)
            );
        } catch (error) {
            console.error("Error deleting draft:", error);
        }
    };

    // Render function
    const renderItemContent = (item: dailyActivityType | branchShariahTypes | staffInterviewTypes | leadsType) => {
        if ("visitDate" in item && "branchCode" in item) {
            return (
                <div className="flex items-center space-x-2">
                    <span
                        className="text-base font-medium text-foreground-600">{getFormattedDate(item.visitDate!)}</span>
                    {item.branchCode ? (
                        <span className="text-gray-600">{`- ${item.branchCode}`}</span>
                    ) : (
                        <span className="text-red-500">- No Branch</span>
                    )}
                </div>
            );
        }

        return <span className="text-gray-500">Unknown Record Type</span>;
    };
    const renderDraftContent = (item: dailyActivityType | branchShariahTypes | staffInterviewTypes | leadsType) => {
        if ("lastEditedOn" in item && "branchCode" in item) {
            return (
                <div className="flex items-center space-x-2">
                    <span
                        className="text-base font-medium text-foreground-600">{format(new Date(item.lastEditedOn!), "yyyy-MM-dd")}</span>
                    {item.branchCode ? (
                        <span className="text-gray-600">{`- ${item.branchCode}`}</span>
                    ) : (
                        <span className="text-red-500">- No Branch</span>
                    )}
                </div>
            );
        }

        return <span className="text-gray-500">Unknown Record Type</span>;
    };
    return (
        <ScrollShadow>

            {
                drafts && drafts.length ?
                    <Card className={`mt-0 bg-transparent backdrop-blur-xl`}>
                        <CardHeader>

                            <h2 className={`text-2xl font-extrabold py-3`}>Draft Branch Review Report</h2>
                        </CardHeader>

                        <CommonList
                            records={drafts}
                            confirmDelete={handleDeleteDraft}
                            fetchRecords={fetchDraft}
                            renderItemContent={renderDraftContent}
                            noRecordsText="No Draft available"
                            noRecordsActions={
                                [
                                    {
                                        label: "Add Branch Review Record",
                                        onPress: () => router.push("/forms/branch-shariah"),
                                    },
                                ]}
                            action="branch-shariah"
                        />

                    </Card>
                    : null}


            <div className="flex flex-row items-center justify-between p-2.5">
                <h2 className={`text-2xl font-extrabold`}>Branch Review Report</h2>
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
                records={branchShariahRecords}
                confirmDelete={confirmDelete}
                fetchRecords={fetchBranchShariah}
                loading={branchShariahLoading}
                renderItemContent={renderItemContent}
                action="branch-shariah"
                noRecordsActions={
                    [
                        {
                            label: "Add Branch Review Record",
                            onPress: () => router.push("/forms/branch-shariah"),
                        },
                    ]}
            />

        </ScrollShadow>
    );
}
