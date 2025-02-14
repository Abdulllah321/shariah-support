"use client";

import React, {useEffect, useState} from "react";
import useDailyActivityFormFields from "@/constants/StaffInterviewForm";
import FormGenerator from "@/components/FormGenerator";
import {useRouter} from "next/navigation";
import {addDoc, setDoc} from "@firebase/firestore";
import {collection, doc, getDocs, query} from "firebase/firestore";
import {db} from "@/lib/firebase";
import {useRecord} from "@/context/RecordContext";
import {Card, CardBody, CardHeader} from "@heroui/card";
import {ArrowLeft} from "lucide-react";
import {Divider} from "@heroui/divider";
import QuestionsList from "@/components/QuestionsList";
import {EmployeeData} from "@/types/staffInterviewTypes";
import {Button} from "@heroui/button";

const DRAFT_STORAGE_KEY = "cachedStaffReviews";

const Page = () => {
    const formFields = useDailyActivityFormFields();
    const [formData, setFormData] = useState<EmployeeData>({} as EmployeeData);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const router = useRouter();
    const {branches} = useRecord();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [questions, setQuestions] = useState<any[]>([]);
    const [questionLoading, setQuestionLoading] = useState<boolean>(false);
    const [uniqueId] = useState(() => Date.now().toString()); // Generate a unique ID for new drafts

    // Fetch questions
    const fetchQuestions = async () => {
        setQuestionLoading(true);
        try {
            const questionQuery = query(collection(db, "sQuestion"));
            const questionSnapshot = await getDocs(questionQuery);

            const questionList = questionSnapshot.docs.map((doc) => ({
                ...doc.data(),
                id: doc.id,
            }));

            setQuestions(questionList);
        } catch (error) {
            console.error("Error fetching questions: ", error);
        } finally {
            setQuestionLoading(false);
        }
    };

    // Load draft from localStorage
    useEffect(() => {
        const fetchDraft = async () => {
            const existingDrafts = localStorage.getItem(DRAFT_STORAGE_KEY);
            const drafts = existingDrafts ? JSON.parse(existingDrafts) : [];

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const draft = drafts.find((draft: any) => draft.id === uniqueId);
            if (draft) {
                setFormData(draft.formData);
            }
        };

        fetchQuestions();
        fetchDraft();
    }, []);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleChange = (key: string, value: any) => {
        const updatedForm = {...formData, [key]: value};

        if (key === "branchCode") {
            const branch = branches.find((branch) => branch.branchCode === value);
            if (branch) {
                updatedForm.branchName = branch.branchName;
                updatedForm.city = branch.city;
                updatedForm.area = branch.area;
                updatedForm.rgm = branch.rgmName;
                updatedForm.region = branch.region;
            }
        }

        setFormData(updatedForm);
        autoSaveDraft(updatedForm);
    };

    // Auto-save draft every few seconds
    const autoSaveDraft = async (updatedForm: EmployeeData) => {
        setSaving(true);
        try {
            const existingDrafts = localStorage.getItem(DRAFT_STORAGE_KEY);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const drafts: any[] = existingDrafts ? JSON.parse(existingDrafts) : [];

            const draftIndex = drafts.findIndex((draft) => draft.id === uniqueId);
            const currentTime = new Date().toISOString();

            if (draftIndex !== -1) {
                // Update existing draft
                drafts[draftIndex] = {
                    id: uniqueId,
                    formData: updatedForm,
                    lastEditedOn: currentTime,
                };
            } else {
                // Add new draft
                drafts.push({
                    id: uniqueId,
                    formData: updatedForm,
                    lastEditedOn: currentTime,
                });
            }

            localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(drafts));
        } catch (error) {
            console.error("Error during autosave:", error);
        } finally {
            setSaving(false);
        }
    };

    // Save final form to Firestore and remove draft
    const handleSave = async () => {
        let id;
        try {
            setLoading(true);

            if (id) {
                await setDoc(doc(db, "StaffReview", id), formData);
            } else {
                await addDoc(collection(db, "StaffReview"), formData);
            }

            // Remove draft after saving
            const existingDrafts = localStorage.getItem(DRAFT_STORAGE_KEY);
            if (existingDrafts) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const drafts = JSON.parse(existingDrafts).filter((draft: any) => draft.id !== uniqueId);
                localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(drafts));
            }

            router.push("/StaffInterviewReport");
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
                    <ArrowLeft className="w-7 h-7 cursor-pointer" onClick={() => window.history.back()}/>
                    <h2 className="text-2xl font-semibold text-center">Staff Interview Form</h2>
                </div>
                <p className={`text-secondary`}>
                    {saving ? "Saving..." : ""}
                </p>
            </CardHeader>
            <Divider/>
            <CardBody>
                <form>
                    <FormGenerator fields={formFields} onChange={handleChange} values={formData}/>
                    <QuestionsList questions={questions} loading={questionLoading} formData={formData}
                                   handleChange={handleChange}/>

                    <div className="flex gap-4 mt-4">

                        <Button type="submit" className="w-full" variant="shadow" color="primary" isLoading={loading}
                                onClick={handleSave}>
                            Save
                        </Button>
                    </div>
                </form>
            </CardBody>
        </Card>
    );
};

export default Page;
