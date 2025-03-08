import { useState, useEffect } from "react";
import { fetchBranches } from "@/constants/DailyActivityForm";
import { FormField } from "@/components/FormGenerator";

const use360LeadsForm = () => {
    const [branchCodes, setBranchCodes] = useState<string[]>([]);
    const [branchLoading, setBranchLoading] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            setBranchLoading(true);
            const [{ codes }] = await Promise.all([
                fetchBranches(),
            ]);
            setBranchCodes(codes);
            setBranchLoading(false);
        };
        loadData();
    }, []);

    return { branchCodes, branchLoading };
};

const use360LeadsFormFields = () => {
    const { branchCodes, branchLoading } = use360LeadsForm();

    const formFields: FormField[] = [
        {
            value: "bmDomainId",
            label: "BM Domain Id",
            type: "text",
            required: true,
        },
        {
            value: "clientName",
            label: "Client Name",
            type: "text",
            required: true,
        },
        {
            value: "clientCellCode",
            label: "Client Cell Code",
            type: "numeric",
            required: true,
        },
        {
            value: "clientCellNumber",
            label: "Client Cell Number",
            type: "numeric",
            required: true,
        },
        {
            value: "clientBusinessAddress",
            label: "Client Business Address",
            type: "textarea",
            required: true,
        },
        {
            value: "clientEmployerBusinessName",
            label: "Client Employer / Business Name",
            type: "text",
            required: true,
        },
        {
            value: "bmBranchCode",
            label: "BM Branch Code",
            type: "dropdown",
            options: branchCodes,
            required: true,
            searchable: true,
            loading: branchLoading,
        },
    ];

    return formFields;
};

export default use360LeadsFormFields;
