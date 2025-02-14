import {createContext, useContext, useEffect, useState} from "react";
import {collection, getDocs, query, where, orderBy, doc, getDoc} from "firebase/firestore";
import {db} from "@/lib/firebase";
import {Branch, dailyActivityType} from "@/types/dailyactivityTypes";
import {EmployeeData as branchShariahType} from "@/types/branchShariahTypes";
import {leadsType} from "@/types/360LeadsTypes";
import {EmployeeData as staffInterviewType} from "@/types/staffInterviewTypes";
import {useAuth} from "@/context/AuthContext";

// 🔹 Context کا ڈیفالٹ ویلیو
interface RecordContextType {
    dailyActivityRecords: dailyActivityType[];
    branchShariahRecords: branchShariahType[];
    staffInterviewRecords: staffInterviewType[];
    LeadsRecords: leadsType[];
    branches: Branch[];

    dailyActivityLoading: boolean;
    branchShariahLoading: boolean;
    staffInterviewLoading: boolean;
    LeadsLoading: boolean;

    fetchDailyActivity: () => Promise<void>;
    fetchBranchShariah: () => Promise<void>;
    fetchStaffInterview: () => Promise<void>;
    fetchLeads: () => Promise<void>;

    fetchDailyActivityById: (id: string) => Promise<dailyActivityType | null>;
    fetchBranchShariahById: (id: string) => Promise<branchShariahType | null>;
    fetchStaffInterviewById: (id: string) => Promise<staffInterviewType | null>;
    fetchLeadsById: (id: string) => Promise<leadsType | null>;
}

interface LoadingType {
    dailyActivity: boolean;
    branchShariah: boolean;
    staffInterview: boolean;
    Leads: boolean;
}

// 🔹 Context بنانے کا مرحلہ
const RecordContext = createContext<RecordContextType | undefined>(undefined);

// 🔹 Provider Component
export const RecordProvider = ({children}: { children: React.ReactNode }) => {
    const [dailyActivityRecords, setDailyActivityRecords] = useState<dailyActivityType[]>([]);
    const [branchShariahRecords, setBranchShariahRecords] = useState<branchShariahType[]>([]);
    const [staffInterviewRecords, setStaffInterviewRecords] = useState<staffInterviewType[]>([]);
    const [LeadsRecords, setLeadsRecords] = useState<leadsType[]>([]);
    const [branches, setBranches] = useState<Branch[]>([]);

    const [loading, setLoading] = useState<LoadingType>({
        dailyActivity: false,
        branchShariah: false,
        staffInterview: false,
        Leads: false
    });

    const {user} = useAuth();

    // 🔹 برانچ لسٹ حاصل کرنے کا فنکشن
    const fetchBranches = async () => {
        try {
            const branchQuery = query(collection(db, "branches"));
            const branchSnapshot = await getDocs(branchQuery);
            const branchList: Branch[] = branchSnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as Branch[];
            setBranches(branchList);
        } catch (error) {
            console.error("Error fetching branches:", error);
        }
    };

    // 🔹 ڈیلی ایکٹیویٹی کے ریکارڈز حاصل کرنے کا فنکشن
    const fetchDailyActivity = async () => {
        setLoading((prev) => ({...prev, dailyActivity: true}));

        try {
            const recordsQuery = query(
                collection(db, "records"),
                where("employeeId", "==", user?.employeeId),
                orderBy("date", "desc")
            );

            const querySnapshot = await getDocs(recordsQuery);
            const records: dailyActivityType[] = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as dailyActivityType[];

            setDailyActivityRecords(records);
        } catch (error) {
            console.error("Error fetching daily activity records:", error);
            setDailyActivityRecords([]);
        } finally {
            setLoading((prev) => ({...prev, dailyActivity: false}));
        }
    };

    // 🔹 برانچ شریعہ کے ریکارڈز حاصل کرنے کا فنکشن
    const fetchBranchShariah = async () => {
        setLoading((prev) => ({...prev, branchShariah: true}));

        try {
            const recordsQuery = query(collection(db, "BranchReview"), where("employeeId", "==", user?.employeeId),
                orderBy("visitDate", "desc"));
            const querySnapshot = await getDocs(recordsQuery);
            const records: branchShariahType[] = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as branchShariahType[];

            setBranchShariahRecords(records);
        } catch (error) {
            console.error("Error fetching branch shariah records:", error);
            setBranchShariahRecords([]);
        } finally {
            setLoading((prev) => ({...prev, branchShariah: false}));
        }
    };

    // 🔹 اسٹاف انٹرویو کے ریکارڈز حاصل کرنے کا فنکشن
    const fetchStaffInterview = async () => {
        setLoading((prev) => ({...prev, staffInterview: true}));

        try {
            const recordsQuery = query(
                collection(db, "StaffReview"),
                where("employeeId", "==", user?.employeeId),
                orderBy("visitDate", "desc")
            );
            ;
            const querySnapshot = await getDocs(recordsQuery);
            const records: staffInterviewType[] = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as staffInterviewType[];

            setStaffInterviewRecords(records);
        } catch (error) {
            console.error("Error fetching staff interview records:", error);
            setStaffInterviewRecords([]);
        } finally {
            setLoading((prev) => ({...prev, staffInterview: false}));
        }
    };

    // 🔹 لیڈز کے ریکارڈز حاصل کرنے کا فنکشن
    const fetchLeads = async () => {
        setLoading((prev) => ({...prev, Leads: true}));

        try {
            const recordsQuery = query(
                collection(db, "360Leads"),
                where("creatorId", "==", user?.employeeId),
                orderBy("createdAt", "desc")
            );
            ;
            const querySnapshot = await getDocs(recordsQuery);
            const records: leadsType[] = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as leadsType[];

            setLeadsRecords(records);
        } catch (error) {
            console.error("Error fetching leads records:", error);
            setLeadsRecords([]);
        } finally {
            setLoading((prev) => ({...prev, Leads: false}));
        }
    };

    // 🔹 مخصوص ID سے ریکارڈ لانے والے فنکشنز
    const fetchById = async <T, >(collectionName: string, id: string): Promise<T | null> => {
        try {
            const docRef = doc(db, collectionName, id);
            const docSnap = await getDoc(docRef);
            return docSnap.exists() ? ({id: docSnap.id, ...docSnap.data()} as T) : null;
        } catch (error) {
            console.error(`Error fetching ${collectionName} record by ID:`, error);
            return null;
        }
    };

    useEffect(() => {
        fetchBranches().then(() => {
            fetchDailyActivity();
            fetchBranchShariah();
            fetchStaffInterview();
            fetchLeads();
        });
    }, []);

    return (
        <RecordContext.Provider
            value={{
                dailyActivityRecords,
                branchShariahRecords,
                staffInterviewRecords,
                LeadsRecords,
                branches,

                dailyActivityLoading: loading.dailyActivity,
                branchShariahLoading: loading.branchShariah,
                staffInterviewLoading: loading.staffInterview,
                LeadsLoading: loading.Leads,

                fetchDailyActivity,
                fetchBranchShariah,
                fetchStaffInterview,
                fetchLeads,

                fetchDailyActivityById: (id) => fetchById<dailyActivityType>("records", id),
                fetchBranchShariahById: (id) => fetchById<branchShariahType>("branchShariah", id),
                fetchStaffInterviewById: (id) => fetchById<staffInterviewType>("staffInterviews", id),
                fetchLeadsById: (id) => fetchById<leadsType>("leads", id),
            }}
        >
            {children}
        </RecordContext.Provider>
    );
};

// 🔹 Custom Hook for Using Context
export const useRecord = () => {
    const context = useContext(RecordContext);
    if (!context) {
        throw new Error("useRecord must be used within a RecordProvider");
    }
    return context;
};
