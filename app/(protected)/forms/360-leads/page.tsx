"use client";

import React, { useState} from "react";
import use360LeadsFormFields from "@/constants/360LeadsForm";
import FormGenerator from "@/components/FormGenerator";
import {useRouter} from "next/navigation";
import {addDoc, setDoc} from "@firebase/firestore";
import {collection, doc} from "firebase/firestore";
import {db} from "@/lib/firebase";
import {leadsType} from "@/types/360LeadsTypes";
import {Card, CardBody, CardHeader} from "@heroui/card";
import {ArrowLeft} from "lucide-react";
import {Divider} from "@heroui/divider";
import {useAuth} from "@/context/AuthContext";

const Page = () => {
    const formFields = use360LeadsFormFields();
    const [formData, setFormData] = useState<leadsType>({} as leadsType);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const {user} = useAuth();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleChange = (key: string, value: any) => {
            setFormData((prev) => ({...prev, [key]: value}));
    };

    const handleSave = async () => {
        try {
            setLoading(true);

            const updatedFormData = {
                ...formData,
                creatorId: user?.employeeId,
                creator_name: user?.username,
            };
            if (formData.id) {
                await setDoc(doc(db, "360Leads", formData.id), updatedFormData);
            } else {
                await addDoc(collection(db, "360Leads"), updatedFormData);
            }

            router.push("/leads");
        } catch (error) {
            console.error("Error saving data:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className={`max-w-lg mx-auto bg-default-50`}>
            <CardHeader className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <ArrowLeft className="w-7 h-7 cursor-pointer" onClick={() => window.history.back()}/>
                    <h2 className="text-2xl font-semibold text-center">360 Leads Form</h2>
                </div>
            </CardHeader>
            <Divider/>
            <CardBody>
                <FormGenerator
                    fields={formFields}
                    onChange={handleChange}
                    values={formData}
                    handleSubmit={handleSave}
                    submitLoading={loading}
                />
            </CardBody>
        </Card>
    );
};

export default Page;
