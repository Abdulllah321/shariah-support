import {useState, useEffect} from "react";
import {collection, getDocs, query} from "firebase/firestore";
import {db} from "@/lib/firebase"; // اپنے Firebase کنفیگریشن کا امپورٹ کریں

export interface FormField {
    value: string;
    label: string;
    type: "text" | "numeric" | "date" | "textarea" | "dropdown";
    options?: string[];
    searchable?: boolean;
    required?: boolean;
    loading?: boolean;
}

export type ActivityType = {
    name: string;
    outstationDayTrip: number;
    outstationLongDistance: number;
    local: number;
};

// ⬇️ ری یوز ایبل فنکشن جو برانچ کوڈز اور برانچ نیمز لائے گا
export const fetchBranches = async (): Promise<{ codes: string[]; names: string[] }> => {
    try {
        const snapshot = await getDocs(query(collection(db, "branches")));
        const branchCodes: string[] = [];
        const branchNames: string[] = [];

        snapshot.docs.forEach((doc) => {
            const data = doc.data();
            if (data.branchCode) branchCodes.push(data.branchCode);
            if (data.branchName) branchNames.push(data.branchName);
        });

        return {codes: branchCodes, names: branchNames};
    } catch (error) {
        console.error("Error fetching branches:", error);
        return {codes: [], names: []};
    }
};

// ⬇️ ری یوز ایبل فنکشن جو ایکٹیویٹیز لائے گا
const fetchActivities = async (): Promise<ActivityType[]> => {
    try {
        const snapshot = await getDocs(query(collection(db, "activities")));
        return snapshot.docs.map((doc) => doc.data() as ActivityType);
    } catch (error) {
        console.error("Error fetching activities:", error);
        return [];
    }
};

export const useDailyActivityForm = () => {
    const [branchCodes, setBranchCodes] = useState<string[]>([]);
    const [branchNames, setBranchNames] = useState<string[]>([]);
    const [activities, setActivities] = useState<ActivityType[]>([]);
    const [branchLoading, setBranchLoading] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            setBranchLoading(true);
            const [{codes, names}, activityList] = await Promise.all([
                fetchBranches(),
                fetchActivities(),
            ]);
            setBranchCodes(codes);
            setBranchNames(names);
            setActivities(activityList);
            setBranchLoading(false);

        };
        loadData();
    }, []);

    return {branchCodes, branchNames, activities, branchLoading};
};

const duration: string[] = ["Full Day", "Half Day", "Leave", "Public Holiday"];
const designation: string[] = ["BM / BSM / RM", "CM / RGM", "GM", "CEO / CFO / Director", "Imam / Khateeb"];
const regionOptions: string[] = ["Central I", "Central II", "North", "South"];
const distanceOptions: string[] = ["Local", "Short", "Long"];
const branchResponseOptions: string[] = ["Excellent = 10 + Clients", "Satisfactory = 5 to 9 Clients", "Unsatisfactory 1 to 4 Clients", "Unacceptable = 0 Client"]

const useDailyActivityFormFields = () => {
    const {branchCodes, branchNames, activities, branchLoading} = useDailyActivityForm();

    const formFields: FormField[] = [
        {value: "date", label: "Date", type: "date", required: true},
        {value: "duration", label: "Duration", type: "dropdown", options: duration, required: true},
        {
            value: "branchCode",
            label: "Branch Code",
            type: "dropdown",
            searchable: true,
            required: true,
            options: branchCodes,
            loading: branchLoading,
        },
        {
            value: "branchName",
            label: "Branch Name",
            type: "dropdown",
            searchable: true,
            required: true,
            options: branchNames,
            loading: branchLoading,
        },
        {value: "personMet", label: "Person Met", type: "text", required: false},
        {value: "designation", label: "Designation", type: "dropdown", options: designation, required: false},
        {
            value: "activity",
            label: "Activity / Title",
            type: "dropdown",
            options: activities.map(act => act.name),
            required: true,
            searchable: true
        },
        {value: "participants", label: "No of Participants / Clients", type: "numeric", required: true},
        {
            value: "distance",
            label: "Distance Local / Short / Long",
            type: "dropdown",
            options: distanceOptions,
            required: true
        },
        {value: "contact", label: "Contact #", type: "numeric", required: false},
        {value: "otherVenue", label: "Other Venue", type: "text", required: false},
        {value: "city", label: "City", type: "text", required: true},
        {value: "area", label: "Area", type: "text", required: true},
        {value: "rgm", label: "RGM", type: "text", required: true},
        {value: "region", label: "Region", type: "dropdown", options: regionOptions, required: true},
        {
            value: "branchResponse",
            label: "Branch Response",
            type: "dropdown",
            options: branchResponseOptions,
        },
        {value: "remarks", label: "Remarks", type: "textarea", required: false},
    ];

    return formFields;
};

export default useDailyActivityFormFields;
