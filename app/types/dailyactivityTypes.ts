export type dailyActivityType = {
    id: string;
    activity: string;
    area: string;
    branchCode: string;
    branchName: string;
    branchResponse: string;
    city: string;
    contact: string;
    date: string; // ISO date string
    designation: string;
    distance: string;
    duration: string;
    employeeId: string;
    name: string;
    otherVenue: string;
    personMet: string;
    participants: string;
    participant: string;
    purpose: string;
    region: string;
    remarks: string;
    rgm: string;
    score: string | number;
};

export interface Branch {
    id: string; // ✅ اب `id` شامل کر دیا
    branchCode: string;
    branchName: string;
    city: string;
    area: string;
    region: string;
    rgmName: string;
}
