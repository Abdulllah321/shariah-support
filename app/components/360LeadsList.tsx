import {
    Briefcase,
    Building,
    ClipboardCheck,
    ClipboardList,
    Phone,
    PhoneCall,
    User,
    UserCircle,
} from "lucide-react";

type LeadRecord = {
    bmDomainId?: string;
    clientName?: string;
    clientCellCode?: string;
    clientCellNumber?: string;
    clientBusinessAddress?: string;
    clientEmployerBusinessName?: string;
    creator_name?: string;
    creatorId?: string;
    bmBranchCode?: string;
};

const get360LeadsList = (record: LeadRecord) => [
    { label: "BM Domain", value: record.bmDomainId || "N/A", icon: <ClipboardList /> },
    { label: "Client Name", value: record.clientName || "N/A", icon: <User /> },
    { label: "Client Cell Code", value: record.clientCellCode || "N/A", icon: <Phone /> },
    { label: "Client Cell Number", value: record.clientCellNumber || "N/A", icon: <PhoneCall /> },
    { label: "Client Business Address", value: record.clientBusinessAddress || "N/A", icon: <Building /> },
    { label: "Client Employer / Business Name", value: record.clientEmployerBusinessName || "N/A", icon: <Briefcase /> },
    { label: "Creator Name", value: record.creator_name || "N/A", icon: <UserCircle /> },
    { label: "Creator Domain", value: record.creatorId || "N/A", icon: <User /> },
    { label: "BM Branch Code", value: record.bmBranchCode || "N/A", icon: <ClipboardCheck /> },
];

export default get360LeadsList;
