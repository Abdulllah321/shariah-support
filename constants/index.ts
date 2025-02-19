import { format, isToday, isYesterday, isTomorrow, differenceInCalendarDays } from "date-fns";

export const getFormattedDate = (dateInput: string | number | Date): string => {
    const date = new Date(dateInput);
    const now = new Date();

    if (isToday(date)) {
        return "Today";
    }
    if (isYesterday(date)) {
        return "Yesterday";
    }
    if (isTomorrow(date)) {
        return "Tomorrow";
    }

    // If the date is within the same week (past or upcoming), show the day name (e.g., "Monday")
    const diffDays = differenceInCalendarDays(date, now);
    if (diffDays >= -6 && diffDays <= 6) {
        return format(date, "EEEE");
    }

    // If the date is within the current year, show "dd-MMM" (e.g., "20-Feb")
    if (date.getFullYear() === now.getFullYear()) {
        return format(date, "dd-MMM");
    }

    // Otherwise, show full date "dd-MMM-yyyy" (e.g., "20-Feb-2025")
    return format(date, "dd-MMM-yyyy");
};
