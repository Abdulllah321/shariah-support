"use client";
import { useRecord } from "@/context/RecordContext";
import { deleteDoc } from "@firebase/firestore";
import { doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { ScrollShadow } from "@heroui/scroll-shadow";
import { dailyActivityType } from "@/types/dailyactivityTypes";
import { Accordion, AccordionItem } from "@heroui/react";
import CommonList from "@/components/CommonList";
import { EmployeeData as branchShariahTypes } from "@/types/branchShariahTypes";
import { EmployeeData as staffInterviewTypes } from "@/types/staffInterviewTypes";
import { leadsType } from "@/types/360LeadsTypes";
import { useRouter } from "next/navigation";
import { Divider } from "@heroui/divider";
import { format } from "date-fns";
import { useEffect } from "react";
import ExportBottomSheet from "@/components/ExportBottomSheet";

// Function to group records by month, handling missing dates
const groupRecordsByMonth = (records: leadsType[]) => {
  return records.reduce((groups, record) => {
    const date = record.createdAt ? new Date(record.createdAt) : null;
    const monthKey = date ? format(date, "yyyy-MM") : "No Date"; // Handle missing date

    if (!groups[monthKey]) {
      groups[monthKey] = [];
    }
    groups[monthKey].push(record);
    return groups;
  }, {} as Record<string, leadsType[]>);
};

export default function DailyActivityReport() {
  const { LeadsRecords, LeadsLoading, fetchLeads } = useRecord();
  const router = useRouter();

  useEffect(() => {
    fetchLeads();
  }, []);


  // Delete function
  const confirmDelete = async (id: string) => {
    await deleteDoc(doc(db, "360Leads", id));
    fetchLeads();
  };

  // Render function
  const renderItemContent = (
    item:
      | dailyActivityType
      | branchShariahTypes
      | staffInterviewTypes
      | leadsType
  ) => {
    if ("bmDomainId" in item && "clientName" in item) {
      return (
        <div className="flex items-center space-x-2">
          <span className="base font-medium text-foreground-600">
            {item.bmDomainId}
          </span>
          {item.clientName ? (
            <span className="text-gray-600">{`- ${item.clientName}`}</span>
          ) : (
            <span className="text-red-500">- No activity</span>
          )}
        </div>
      );
    }

    return <span className="text-gray-500">Unknown Record Type</span>;
  };

  const groupedRecords = groupRecordsByMonth(LeadsRecords);
  // Sort month keys in descending order (latest first), keeping "No Date" at the end
  const sortedMonthKeys = Object.keys(groupedRecords).sort((a, b) => {
    if (a === "No Date") return 1; // Push "No Date" to the end
    if (b === "No Date") return -1;
    return new Date(`${b}-01`).getTime() - new Date(`${a}-01`).getTime();
  });

  return (
    <ScrollShadow>
      {/* <div className="flex flex-row items-center justify-between p-2.5">
        <h2 className={`text-2xl font-extrabold`}>360 Leads Report</h2>
        <Button
          onPress={handleExportToExcel}
          isIconOnly
          color={"warning"}
          radius={"full"}
          variant={`faded`}
          className="shadow-secondary"
        >
          <Download size={20} />
        </Button>
      </div> */}
      <ExportBottomSheet
        dailyActivityRecords={LeadsRecords}
        action={"360-leads"}
      />
      <Divider />

      {sortedMonthKeys.length > 0 ? (
        <Accordion selectionMode={"multiple"} defaultExpandedKeys={"all"}>
          {sortedMonthKeys.map((monthKey) => {
            const monthLabel =
              monthKey === "No Date" ? "No Date Records" : format(new Date(`${monthKey}-01`), "MMMM yyyy");
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
                  records={groupedRecords[monthKey]}
                  confirmDelete={confirmDelete}
                  fetchRecords={fetchLeads}
                  renderItemContent={renderItemContent}
                  action="360-leads"
                  description="clientEmployerBusinessName"
                  noRecordsActions={[
                    {
                      label: "Add 360 Leads Record",
                      onPress: () => router.push("/forms/360-leads"),
                    },
                  ]}
                  loading={LeadsLoading}
                />
              </AccordionItem>
            );
          })}
        </Accordion>
      ) : null}
    </ScrollShadow>
  );
}
