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
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
        "360-leads"
        :
            return filteredData.map((record) => ({
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

        default:
            return filteredData;
    }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const groupRecordsByMonth = (records: any[]) => {
    return records.reduce((groups, record) => {
        const date = new Date(record.visitDate);
        const monthKey = format(date, "yyyy-MM");
        if (!groups[monthKey]) {
            groups[monthKey] = [];
        }
        groups[monthKey].push(record);
        return groups;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }, {} as Record<string, any[]>);
};
