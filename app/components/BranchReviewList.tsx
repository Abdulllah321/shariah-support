import {db} from "@/lib/firebase";
import {collection, getDocs, orderBy, query} from "firebase/firestore";
import {
    User,
    Building,
    MapPin,
    Calendar,
    Flag,
    ClipboardList,
} from "lucide-react";
import {JSX} from "react";

type Record = {
    name?: string;
    branchCode?: string;
    city?: string;
    province?: string;
    region?: string;
    visitDate?: string;
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

const fetchQuestions = async (): Promise<{ id: string; name: string }[]> => {
    try {
        const questionQuery = query(
            collection(db, "branches-review-points"),
            orderBy("order")
        );
        const questionSnapshot = await getDocs(questionQuery);

        return questionSnapshot.docs.map((doc) => ({
            id: doc.id,
            name: doc.data().name as string, // Ensure TypeScript recognizes `name`
        }));
    } catch (error) {
        console.error("Error fetching questions: ", error);
        return [];
    }
};


const getBranchReviewList = async (record: Record) => {
    const branchData = [
        {label: "Sharia Scholar", value: record.name || "N/A", icon: <User/>},
        {
            label: "Branch Code",
            value: record.branchCode || "N/A",
            icon: <ClipboardList/>,
        },
        {label: "Branch City", value: record.city || "N/A", icon: <Building/>},
        {
            label: "Province",
            value: record.province || "N/A",
            icon: <MapPin/>,
        },
        {label: "Branch Region", value: record.region || "N/A", icon: <Flag/>},
        {
            label: "Visit Date",
            value: formatDate(record.visitDate) || "N/A",
            icon: <Calendar/>,
        },
    ];

    const questions = await fetchQuestions();

    const questionData: {
        label: string;
        value: string;
        icon: JSX.Element;
    }[] = questions.map((question: { id: string; name: string; }) => {
        const value = record[question.name] || "N/A";
        return {
            label: question.name,
            value,
            icon: <ClipboardList/>,
        };
    });

    branchData.push({
        label: "Questions",
        // @ts-expect-error:@typescript-eslint/ ban-ts-comment
        value: questionData.length > 0 ? questionData : "N/A",
        icon: <ClipboardList/>,
    });

    return branchData;
};

export default getBranchReviewList;
