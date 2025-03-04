import {useState, useEffect} from "react";
import {fetchBranches} from "@/constants/DailyActivityForm";
import {FormField} from "@/components/FormGenerator";


const useDailyActivityForm = () => {
    const [branchCodes, setBranchCodes] = useState<string[]>([]);
    const [branchNames, setBranchNames] = useState<string[]>([]);
    const [branchLoading, setBranchLoading] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            setBranchLoading(true);
            const [{codes, names}] = await Promise.all([
                fetchBranches(),
            ]);
            setBranchCodes(codes);
            setBranchNames(names);
            setBranchLoading(false);
        };
        loadData();
    }, []);

    return {branchCodes, branchNames, branchLoading};
};


const useDailyActivityFormFields = () => {
    const {branchCodes, branchLoading} = useDailyActivityForm();

    const formFields: FormField[] = [
        {
            value: "branchCode",
            label: "Branch Code",
            type: "dropdown",
            options: branchCodes,
            required: true,
            searchable: true,
            loading: branchLoading,
        },
        {
            value: "branchName",
            label: "Branch Name",
            type: "text",
            required: true,
        },
        {
            value: "city",
            label: "Branch City",
            type: "text",
            required: true,
        },
        {
            value: "province",
            label: "Province",
            type: "text",
            required: true,
        },
        {
            value: "region",
            label: "Branch Region",
            type: "text",
            required: true,
        },
        {
            value: "visitDate",
            label: "Visit Date",
            type: "date",
            required: true,
        },
        {type: "divider"},
        {
            value: "staffName",
            label: "Staff Name",
            type: "text",
            required: true,
        },
        {
            value: "designation",
            label: "Designation",
            type: "text",
            required: true,
        },
        {
            value: "employeeName",
            label: "Employee Number",
            type: "text",
            required: true,
        },
        {
            value: "dateOfJoining",
            label: "Date of joining",
            type: "date",
            required: true,
        },
        {
            type: "divider"
        },
        {
            value: "mandatoryPlanning",
            label: "Mandatory Planning",
            type: "text",
            required: true,
        }, {
            value: "refresher",
            label: "Refresher",
            type: "text",
            required: true,
        }, {
            value: "dressCode",
            label: "Dress Code",
            type: "text",
            required: true,
        },
    ];

    return formFields;
};

export default useDailyActivityFormFields;
