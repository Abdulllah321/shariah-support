import {format} from "date-fns";
import {Question} from "@/components/QuestionsList";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getFormattedData = (filteredData: any[], action: string, questions?: Question[]) => {
    switch (action) {
        case "daily-activity":
            return filteredData.map((record) => ({
                "Sharia Scholar": record.name || "N/A",
                Date: format(new Date(record.date), "yyyy-MMM-dd"),
                Day: new Date(record.date).toLocaleDateString("en-US", {weekday: "long"}),
                "Activity / Title": record.activity || "N/A",
                Duration: record.duration || "N/A",
                City: record.city || "N/A",
                Remarks: record.remarks || "N/A",
            }));

        case "branch-review":
            return filteredData.map((record) => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const rowData: any = {
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
        case "staff-interview":
            return filteredData.map((record) => {
                const rowData: Record<string, any> = {
                    "Sharia Scholar": record.name || "N/A",
                    "Branch Code": record.branchCode || "N/A",
                    "Branch City": record.city || "N/A",
                    Province: record.province || "N/A",
                    "Branch Region": record.region || "N/A",
                    "Visit Date": record.visitDate
                        ? format(new Date(record.visitDate), "yyyy-MMM-dd") // Ensure correct format
                        : "N/A",
                    "Staff Name": record.staffName || "N/A",
                    Designation: record.designation || "N/A",
                    "Employee Number": record.employeeName || "N/A",
                    "Date of Joining": record.dateOfJoining || "N/A",
                };

                // Adding dynamic questions
                questions?.forEach((question: { question: string }) => {
                    rowData[question.question] = record[question.question] || "N/A";
                });

                console.log(rowData); // Debugging purpose

                return rowData;
            });


        case
        "leads"
        :
            return filteredData.map((record) => ({
                "Lead Name": record.name || "N/A",
                "Contact Number": record.contact || "N/A",
                "Lead Source": record.source || "N/A",
                Status: record.status || "N/A",
                "Follow-up Date": record.followUp
                    ? format(new Date(record.followUp), "yyyy-MM-dd")
                    : "N/A",
            }));

        default:
            return filteredData;
    }
};
