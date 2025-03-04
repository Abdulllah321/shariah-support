import {db} from "@/lib/firebase";
import {collection, getDocs, query} from "firebase/firestore";
import {
    Calendar,
    ClipboardCheck,
    ClipboardList,
    Flag,
    IdCard,
    Landmark,
    MapPin,
    Repeat,
    Shirt,
    Tag,
    User
} from "lucide-react";
import {orderBy} from "@firebase/firestore";


type Record = {
    name?: string;
    branchCode?: string;
    city?: string;
    province?: string;
    region?: string;
    visitDate?: string;
    staffName?: string;
    designation?: string;
    employeeName?: string;
    dateOfJoining?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
};

const formatDate = (date?: string): string => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
};

const fetchQuestions = async (): Promise<{ id: string; question: string }[]> => {
    try {
        const questionQuery = query(collection(db, "sQuestion"), orderBy("order"));
        const questionSnapshot = await getDocs(questionQuery);

        return questionSnapshot.docs.map((doc) => ({
            id: doc.id,
            question: doc.data().question as string,
        }));
    } catch (error) {
        console.error("Error fetching questions: ", error);
        return [];
    }
};

const getStaffInterviewList = async (record: Record) => {
    const branchData = [
        {label: "Sharia Scholar", value: record.name || "N/A", icon: <User/>},
        {label: "Branch Code", value: record.branchCode || "N/A", icon: <ClipboardList/>},
        {label: "Branch City", value: record.city || "N/A", icon: <Landmark/>},
        {label: "Province", value: record.province || "N/A", icon: <MapPin/>},
        {label: "Branch Region", value: record.region || "N/A", icon: <Flag/>},
        {label: "Visit Date", value: formatDate(record.visitDate), icon: <Calendar/>},
        {label: "Staff Name", value: record.staffName || "N/A", icon: <User/>},
        {label: "Designation", value: record.designation || "N/A", icon: <Tag/>},
        {label: "Employee Number", value: record.employeeName || "N/A", icon: <IdCard/>},
        {label: "Date of Joining", value: formatDate(record.dateOfJoining), icon: <Calendar/>},
        {label: "Mandatory Planning", value: record.mandatoryPlanning || "N/A", icon: <ClipboardCheck/>},
        {label: "Refresher", value: record.refresher || "N/A", icon: <Repeat/>},
        {label: "Dress Code", value: record.dressCode || "N/A", icon: <Shirt/>},
    ];

    const questions = await fetchQuestions();

    const questionData = questions.map((question) => ({
        label: question.question,
        value: record[question.question] || "N/A",
        icon: <ClipboardList/>,
    }));

    branchData.push({
        label: "Questions",
        value: questionData.length > 0 ? questionData : "N/A",
        icon: <ClipboardList/>,
    });

    return branchData;
};

export default getStaffInterviewList;
