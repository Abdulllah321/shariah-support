import { format, isToday, isYesterday } from "date-fns";

export const getFormattedDate = (dateStr: string | number): string => {
    const recordDate = new Date(dateStr);
    const today = new Date();

    if (isToday(recordDate)) {
        return "Today";
    } else if (isYesterday(recordDate)) {
        return "Yesterday";
    } else {
        // Check if the record is from last month.
        const recordMonth = recordDate.getMonth();
        const recordYear = recordDate.getFullYear();
        const todayMonth = today.getMonth();
        const todayYear = today.getFullYear();

        let isRecordInLastMonth = false;

        if (todayYear === recordYear) {
            // If current month is greater by 1 than record month.
            if (todayMonth - recordMonth === 1) {
                isRecordInLastMonth = true;
            }
        } else if (todayYear - recordYear === 1 && todayMonth === 0 && recordMonth === 11) {
            // Special edge-case: today is January and record is December of previous year.
            isRecordInLastMonth = true;
        }

        if (isRecordInLastMonth) {
            return "Last Month";
        } else {
            return format(recordDate, "dd-MMM-yyyy");
        }
    }
};
