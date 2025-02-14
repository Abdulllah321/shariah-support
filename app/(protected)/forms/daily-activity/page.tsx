"use client";

import React, {useEffect, useState} from "react";
import useDailyActivityFormFields, {useDailyActivityForm} from "@/constants/DailyActivityForm";
import FormGenerator from "@/components/FormGenerator";
import {useRouter, useSearchParams} from "next/navigation";
import {addDoc, setDoc, doc, collection} from "firebase/firestore";
import {db} from "@/lib/firebase";
import {useRecord} from "@/context/RecordContext";
import {dailyActivityType} from "@/types/dailyactivityTypes";
import {Card, CardBody, CardHeader} from "@heroui/card";
import {ArrowLeft} from "lucide-react";
import {Divider} from "@heroui/divider";
import {useAuth} from "@/context/AuthContext";
import {Skeleton} from "@heroui/skeleton"; // ✅ Skeleton component for loading UI

const Page = () => {
    const formFields = useDailyActivityFormFields();
    const [formData, setFormData] = useState<dailyActivityType | null>(null);

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false); // ✅ Track data fetching
    const router = useRouter();
    const searchParams = useSearchParams();
    const id = searchParams.get("id");
    const {branches, fetchDailyActivityById} = useRecord();
    const {user} = useAuth();
    const {activities} = useDailyActivityForm();

    useEffect(() => {
        if (id) {
            setFetching(true);
            fetchDailyActivityById(id)
                .then((result) => {
                    if (result) { // ✅ ID ملنے پر ڈیٹا سیٹ کریں
                        setFormData(result);
                    }
                })
                .catch((error) => console.error("Error fetching activity:", error))
                .finally(() => setFetching(false));
        } else {
            setFormData({} as dailyActivityType); // ✅ نیا انٹری فارم ریڈی کریں
        }
    }, [id, fetchDailyActivityById]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleChange = (key: string, value: any) => {
        if (key === "branchCode") {

            const branch = branches.find((branch) => branch.branchCode === value);
            if (branch) {
                //@ts-expect-error:@typescript-eslint/ ban-ts-comment
                setFormData((prev) => ({
                    ...prev, // Ensure previous state is preserved
                    branchCode: branch.branchCode,
                    branchName: branch.branchName,
                    city: branch.city,
                    area: branch.area,
                    rgm: branch.rgmName,
                    region: branch.region,
                }));
                return;
            }
        }

        setFormData((prev) => (prev ? {...prev, [key]: value} : null));
    };

    const handleSave = async () => {
        try {
            setLoading(true);
            let score = 0;

            const foundedActivity = activities.find(
                (act) => act.name === formData?.activity
            );

            if (foundedActivity) {
                if (
                    formData?.activity === "Clients met indoor / outdoor" &&
                    foundedActivity.name === "Clients met indoor / outdoor"
                ) {
                    if (formData.distance === "Short") {
                        score =
                            foundedActivity.outstationDayTrip *
                            parseFloat(formData.participants);
                    } else if (formData.distance === "Long") {
                        score =
                            foundedActivity.outstationLongDistance *
                            parseFloat(formData.participants);
                    } else if (formData.distance === "Local") {
                        score = foundedActivity.local * parseFloat(formData.participants);
                    }
                } else {
                    if (formData?.distance === "Short") {
                        score = foundedActivity.outstationDayTrip;
                    } else if (formData?.distance === "Long") {
                        score = foundedActivity.outstationLongDistance;
                    } else if (formData?.distance === "Local") {
                        score = foundedActivity.local;
                    }
                }
            }

            const updatedFormData = {
                ...formData,
                score,
                participant: formData?.participant || 0,
                employeeId: user?.employeeId,
                name: user?.username,
            };

            if (id) {
                await setDoc(doc(db, "records", id), updatedFormData);
            } else {
                await addDoc(collection(db, "records"), updatedFormData);
            }

            router.push("/");
        } catch (error) {
            console.error("Error saving data:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="max-w-lg mx-auto bg-default-50">
            <CardHeader className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <ArrowLeft className="w-7 h-7 cursor-pointer" onClick={() => router.back()}/>
                    <h2 className="text-2xl font-semibold text-center">
                        {id ? "Edit Daily Activity" : "New Daily Activity"}
                    </h2>
                </div>
            </CardHeader>
            <Divider/>

            <CardBody>
                {fetching ? ( // ✅ Show Skeleton Loader while fetching
                    <div className="space-y-4">
                        <Skeleton className="h-10 w-full"/>
                        <Skeleton className="h-10 w-full"/>
                        <Skeleton className="h-10 w-full"/>
                        <Skeleton className="h-10 w-full"/>
                        <Skeleton className="h-12 w-full"/>
                    </div>
                ) : (
                    formData && (
                        <FormGenerator
                            fields={formFields}
                            onChange={handleChange}
                            values={formData}
                            handleSubmit={handleSave}
                            submitLoading={loading}
                        />
                    )
                )}
            </CardBody>
        </Card>
    );
};

export default Page;
