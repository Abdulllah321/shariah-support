import { dailyActivityType } from "@/types/dailyactivityTypes";
import {
    User,
    Calendar,
    Clock,
    Building,
    MapPin,
    Users,
    // Star,
    Phone,
    MessageCircle,
    List,
    Compass,
    Landmark,
    BarChart,
    IdCard,
    Flag,
} from "lucide-react";


const formatDate = (date?: string): string => {
    if (!date) return "N/A";

    return new Date(date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
};

const getDailyActivityList = (record: dailyActivityType) => [
    { label: "Sharia Scholar", value: record.name || "N/A", icon: <User /> },
    { label: "Date", value: formatDate(record.date), icon: <Calendar /> },
    {
        label: "Day",
        value: record.date
            ? new Date(record.date).toLocaleDateString("en-US", { weekday: "long" })
            : "N/A",
        icon: <Calendar />,
    },
    { label: "Duration", value: record.duration || "N/A", icon: <Clock /> },
    { label: "Branch Code", value: record.branchCode || "N/A", icon: <Building /> },
    { label: "Branch Name", value: record.branchName || "N/A", icon: <Landmark /> },
    { label: "Person Met", value: record.personMet || "N/A", icon: <User /> },
    { label: "Designation", value: record.designation || "N/A", icon: <IdCard /> },
    { label: "No of Participants / Clients", value: record.participants || "N/A", icon: <Users /> },
    { label: "Activity / Title", value: record.activity || "N/A", icon: <List /> },
    { label: "Distance (Local / Short / Long)", value: record.distance || "N/A", icon: <Compass /> },
    // { label: "Score", value: record.score || "N/A", icon: <Star /> },
    { label: "Contact #", value: record.contact || "N/A", icon: <Phone /> },
    { label: "Other Venue", value: record.otherVenue || "N/A", icon: <Compass /> },
    { label: "City", value: record.city || "N/A", icon: <Landmark /> },
    { label: "Area", value: record.area || "N/A", icon: <MapPin /> },
    { label: "RGM", value: record.rgm || "N/A", icon: <BarChart /> },
    { label: "Region", value: record.region || "N/A", icon: <Flag /> },
    { label: "Branch Response", value: record.branchResponse || "N/A", icon: <MessageCircle /> },
    { label: "Remarks", value: record.remarks || "N/A", icon: <MessageCircle /> },
];

export default getDailyActivityList;
