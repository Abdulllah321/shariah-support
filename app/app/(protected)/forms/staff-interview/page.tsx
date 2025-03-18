"use client";

import React, { useEffect, useState } from "react";
import useDailyActivityFormFields from "@/constants/StaffInterviewForm";
import FormGenerator from "@/components/FormGenerator";
import { useRouter, useSearchParams } from "next/navigation";
import { addDoc, orderBy, setDoc } from "@firebase/firestore";
import { collection, doc, getDocs, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useRecord } from "@/context/RecordContext";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { ArrowLeft } from "lucide-react";
import { Divider } from "@heroui/divider";
import QuestionsList from "@/components/QuestionsList";
import { EmployeeData } from "@/types/staffInterviewTypes";
import { Button } from "@heroui/button";
import { useAuth } from "@/context/AuthContext";
import { Skeleton } from "@heroui/react";
import { addToast } from "@heroui/toast";

const DRAFT_STORAGE_KEY = "cachedStaffReviews";

const Page = () => {
  const formFields = useDailyActivityFormFields();
  const [formData, setFormData] = useState<EmployeeData>({} as EmployeeData);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const { branches, fetchStaffInterviewById } = useRecord();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [questions, setQuestions] = useState<any[]>([]);
  const [questionLoading, setQuestionLoading] = useState<boolean>(false);
  const [uniqueId] = useState(() => Date.now().toString());
  const { user } = useAuth();
  const [fetching, setFetching] = useState(false);
  const searchParams = useSearchParams();
  const id = searchParams.get("id") ||uniqueId;
  const isDraft = searchParams.get("draft") === "true";

  useEffect(() => {
    if (id) {
      setFetching(true);
      fetchStaffInterviewById(id)
        .then((result) => {
          if (result) {
            setFormData(result);
          }
        })
        .catch((error) => console.error("Error fetching activity:", error))
        .finally(() => setFetching(false));
    } else {
      setFormData({} as EmployeeData);
    }
  }, [id, fetchStaffInterviewById]);

  // Fetch questions
  const fetchQuestions = async () => {
    setQuestionLoading(true);
    try {
      const questionQuery = query(
        collection(db, "sQuestion"),
        orderBy("order")
      );
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
    const fetchDraft = () => {
      const existingDrafts = JSON.parse(localStorage.getItem(DRAFT_STORAGE_KEY) || "[]");
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const draft = existingDrafts.find((draft: any) => draft.id === id);
      if (draft) {
        setFormData(draft.formData);
      }
    };
  
    fetchQuestions();
    if (isDraft) fetchDraft();
  }, [id, isDraft]);
  

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleChange = (key: string, value: any) => {
    const updatedForm = { ...formData, [key]: value };

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
  const autoSaveDraft = (updatedForm: EmployeeData) => {
    setSaving(true);
    try {
      const existingDrafts = JSON.parse(localStorage.getItem(DRAFT_STORAGE_KEY) || "[]");
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const draftIndex = existingDrafts.findIndex((draft: any) => draft.id === id);
  
      updatedForm = {
        ...updatedForm,
        employeeId: user?.employeeId || "",
        name: user?.username || "",
      };
  
      if (draftIndex !== -1) {
        existingDrafts[draftIndex] = { id, formData: updatedForm, lastEditedOn: new Date().toISOString() };
      } else {
        existingDrafts.push({ id, formData: updatedForm, lastEditedOn: new Date().toISOString() });
      }
  
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(existingDrafts));
    } catch (error) {
      console.error("Error during autosave:", error);
    } finally {
      setSaving(false);
    }
  };
  

  // Save final form to Firestore and remove draft
  const handleSave = async () => {
  
    try {
      setLoading(true);
      const updatedFormData = {
        ...formData,
        employeeId: user?.employeeId,
        name: user?.username,
      };

      if (updatedFormData.visitDate) {
        const enteredDate = new Date(updatedFormData.visitDate);
        const enteredYear = enteredDate.getFullYear();
        const today = new Date();

        if (enteredYear < 1000) {
          addToast({
            title: "Please enter a four-digit year!",
          });
          return;
        }

        if (enteredDate > today) {
          addToast({
            title: "Future dates are not allowed!",
          });
          return;
        }

        if (enteredYear < 2025) {
          addToast({
            title: "The date must be in 2025 or later!",
          });
          return;
        }
      }

      if (id && !isDraft) {
        await setDoc(doc(db, "StaffReview", id), updatedFormData);
      } else {
        await addDoc(collection(db, "StaffReview"), updatedFormData);
      }

      // Remove draft after saving
      const existingDrafts = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (isDraft) {
        if (existingDrafts) {
          const drafts = JSON.parse(existingDrafts).filter(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (draft: any) => draft.id !== id
          );
          localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(drafts));
        }
      } else {
        if (existingDrafts) {
          const drafts = JSON.parse(existingDrafts).filter(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (draft: any) => draft.id !== id
          );
          localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(drafts));
        }
      }
      
      router.push("/staff-interview");
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
          <ArrowLeft
            className="w-7 h-7 cursor-pointer"
            onClick={() => window.history.back()}
          />
          <h2 className="text-2xl font-semibold text-center">
            Staff Interview Form
          </h2>
        </div>
        <p className={`text-secondary`}>{saving ? "Saving..." : ""}</p>
      </CardHeader>
      <Divider />
      <CardBody>
        {fetching ? ( // ✅ Show Skeleton Loader while fetching
          <div className="space-y-4">
            {Array.from({ length: 10 }).map((_, index) => (
              <Skeleton key={index} className="h-10 w-full rounded-md" />
            ))}
            <Skeleton className="h-12 w-full rounded-md" />
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSave();
            }}
          >
            <FormGenerator
              fields={formFields}
              onChange={handleChange}
              values={formData}
            />
            <QuestionsList
              questions={questions}
              loading={questionLoading}
              formData={formData}
              handleChange={handleChange}
            />

            <div className="flex gap-4 mt-4">
              <Button
                type="submit"
                className="w-full"
                variant="shadow"
                color="primary"
                isLoading={loading}
              >
                Save
              </Button>
            </div>
          </form>
        )}
      </CardBody>
    </Card>
  );
};

export default Page;
