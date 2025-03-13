"use client";
import { useRecord } from "@/context/RecordContext";
import { format } from "date-fns";
import { deleteDoc } from "@firebase/firestore";
import { collection, doc, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { ScrollShadow } from "@heroui/scroll-shadow";
import { dailyActivityType } from "@/types/dailyactivityTypes";
import { Accordion, AccordionItem, Card } from "@heroui/react";
import CommonList from "@/components/CommonList";
import { EmployeeData as branchShariahTypes } from "@/types/branchShariahTypes";
import { EmployeeData as staffInterviewTypes } from "@/types/staffInterviewTypes";
import { leadsType } from "@/types/360LeadsTypes";
import { useRouter } from "next/navigation";
import { Divider } from "@heroui/divider";
import { useEffect, useState } from "react";
import { Question } from "@/components/QuestionsList";
import { CardHeader } from "@heroui/card";
import { getFormattedDate } from "@/constants";
import ExportBottomSheet from "@/components/ExportBottomSheet";
import { groupRecordsByMonth } from "@/components/getFornattedData";

export const DRAFT_BRANCH_STORAGE_KEY = "cachedBranchShariahReviews";

export default function DailyActivityReport() {
  const { branchShariahRecords, branchShariahLoading, fetchBranchShariah } =
    useRecord();
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [drafts, setDrafts] = useState<any[]>([]);

  const fetchDraft = async () => {
    const existingDrafts = localStorage.getItem(DRAFT_BRANCH_STORAGE_KEY);
    const drafts = existingDrafts ? JSON.parse(existingDrafts) : [];

    if (drafts) {
      setDrafts(drafts);
    }
  };

  useEffect(() => {
    fetchDraft();
    fetchBranchShariah();
  }, []);

  const fetchQuestions = async () => {
    try {
      const questionQuery = query(
        collection(db, "branches-review-points"),
        orderBy("order") // Order by the "order" field
      );
      const questionSnapshot = await getDocs(questionQuery);

      const questionList: Question[] = questionSnapshot.docs.map(
        (doc) =>
          ({
            ...doc.data(),
            id: doc.id,
          } as Question)
      );

      setQuestions(questionList);
    } catch (error) {
      console.error("Error fetching questions: ", error);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  // Delete function
  const confirmDelete = async (id: string) => {
    await deleteDoc(doc(db, "BranchReview", id));
    fetchBranchShariah();
  };

  const handleDeleteDraft = (id: string) => {
    try {
      console.log(id);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const updatedDrafts = drafts?.filter((draft: any) => draft.id !== id);
      setDrafts(updatedDrafts);

      localStorage.setItem(
        DRAFT_BRANCH_STORAGE_KEY,
        JSON.stringify(updatedDrafts)
      );
    } catch (error) {
      console.error("Error deleting draft:", error);
    }
  };

  // Render function
  const renderItemContent = (
    item:
      | dailyActivityType
      | branchShariahTypes
      | staffInterviewTypes
      | leadsType
  ) => {
    if ("visitDate" in item && "branchCode" in item) {
      return (
        <div className="flex items-center space-x-2">
          <span className="text-base font-medium text-foreground-600">
            {getFormattedDate(item.visitDate!)}
          </span>
          {item.branchCode ? (
            <span className="text-gray-600">{`- ${item.branchCode}`}</span>
          ) : (
            <span className="text-red-500">- No Branch</span>
          )}
        </div>
      );
    }

    return <span className="text-gray-500">Unknown Record Type</span>;
  };
  const renderDraftContent = (
    item:
      | dailyActivityType
      | branchShariahTypes
      | staffInterviewTypes
      | leadsType
  ) => {
    // if ("lastEditedOn" in item && "branchCode" in item) {
    //     return (
    //         <div className="flex items-center space-x-2">
    //             <span
    //                 className="text-base font-medium text-foreground-600">{format(new Date(item.lastEditedOn!), "yyyy-MM-dd")}</span>
    //             {item.branchCode ? (
    //                 <span className="text-gray-600">{`- ${item.branchCode}`}</span>
    //             ) : (
    //                 <span className="text-red-500">- No Branch</span>
    //             )}
    //         </div>
    //     );
    // }

    if (
      "lastEditedOn" in item &&
      typeof item.formData === "object" &&
      (item.formData as { branchCode: string }).branchCode
    ) {
      const formData = item.formData as {
        staffName?: string;
        branchCode: string;
      };
      return (
        <div className="flex items-center space-x-2">
          <span className="text-base font-medium text-foreground-600">
            {item.lastEditedOn
              ? format(new Date(item.lastEditedOn), "yyyy-MM-dd")
              : "N/A"}
          </span>
          {formData.branchCode ? (
            <span className="text-gray-600">{`- ${formData.branchCode}`}</span>
          ) : (
            <span className="text-red-500">- No Branch</span>
          )}
        </div>
      );
    }

    return <span className="text-gray-500">Unknown Record Type</span>;
  };

  const groupedRecords = groupRecordsByMonth(branchShariahRecords);

  const sortedMonthKeys = Object.keys(groupedRecords).sort(
    (a, b) => new Date(`${b}-01`).getTime() - new Date(`${a}-01`).getTime()
  );

  return (
    <ScrollShadow>
      {drafts && drafts.length ? (
        <Card className={`mt-0 bg-transparent backdrop-blur-xl`}>
          <CardHeader>
            <h2 className={`text-2xl font-extrabold py-3`}>
              Draft Branch Review Report
            </h2>
          </CardHeader>

          <CommonList
            records={drafts}
            confirmDelete={handleDeleteDraft}
            fetchRecords={fetchDraft}
            renderItemContent={renderDraftContent}
            noRecordsText="No Draft available"
            noRecordsActions={[
              {
                label: "Add Branch Review Record",
                onPress: () => router.push("/forms/branch-shariah"),
              },
            ]}
            action="branch-shariah"
            draft
          />
        </Card>
      ) : null}

      <ExportBottomSheet
        dailyActivityRecords={branchShariahRecords}
        action={"branch-review"}
        questions={questions}
      />
      <Divider />

      {sortedMonthKeys.length > 0 ? (
        <Accordion selectionMode={"multiple"} defaultExpandedKeys={"all"}>
          {sortedMonthKeys.map((monthKey) => {
            const dateObj = new Date(`${monthKey}-01`);
            const monthLabel = format(dateObj, "MMMM yyyy");
            return (
              <AccordionItem
                key={monthKey}
                title={monthLabel}
                classNames={{
                  title:
                    "text-xl font-extrabold text-secondary px-4 shadow-white drop-shadow-xl",
                }}
              >
                <CommonList
                  records={branchShariahRecords}
                  confirmDelete={confirmDelete}
                  fetchRecords={fetchBranchShariah}
                  loading={branchShariahLoading}
                  renderItemContent={renderItemContent}
                  action="branch-shariah"
                  noRecordsActions={[
                    {
                      label: "Add Branch Review Record",
                      onPress: () => router.push("/forms/branch-shariah"),
                    },
                  ]}
                />
              </AccordionItem>
            );
          })}
        </Accordion>
      ) : (
        <p className="p-4 text-center">No records found.</p>
      )}
    </ScrollShadow>
  );
}
