"use client";
import { useRecord } from "@/context/RecordContext";
import { format } from "date-fns";
import { deleteDoc } from "@firebase/firestore";
import { doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { ScrollShadow } from "@heroui/scroll-shadow";
import { dailyActivityType } from "@/types/dailyactivityTypes";
import CommonList from "@/components/CommonList";
import { EmployeeData as branchShariahTypes } from "@/types/branchShariahTypes";
import { EmployeeData as staffInterviewTypes } from "@/types/staffInterviewTypes";
import { leadsType } from "@/types/360LeadsTypes";
import { useRouter } from "next/navigation";
import { Divider } from "@heroui/divider";
import { getFormattedDate } from "@/constants";
import { Accordion, AccordionItem, Skeleton } from "@heroui/react";
import { useEffect, useState } from "react";
import ExportBottomSheet from "@/components/ExportBottomSheet";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const groupRecordsByMonth = (records: any[]) => {
  return records.reduce((groups, record) => {
    const date = new Date(record.date);
    const monthKey = format(date, "yyyy-MM");
    if (!groups[monthKey]) {
      groups[monthKey] = [];
    }
    groups[monthKey].push(record);
    return groups;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  }, {} as Record<string, any[]>);
};

export default function DailyActivityReport() {
  const { dailyActivityRecords, dailyActivityLoading, fetchDailyActivity } =
    useRecord();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchDailyActivity();
  }, []);

  // Delete function
  const confirmDelete = async (id: string) => {
    await deleteDoc(doc(db, "records", id));
    fetchDailyActivity();
  };

  // Handle Search Logic
  const handleSearch = (query: string) => {
    setSearchQuery(query.toLowerCase());
  };

  // Filter records based on search query
  const filteredRecords = dailyActivityRecords.filter(
    (record) =>
      record.activity.toLowerCase().includes(searchQuery) ||
      getFormattedDate(record.date).toLowerCase().includes(searchQuery)
  );

  // Group filtered records by month
  const groupedRecords = groupRecordsByMonth(filteredRecords);
  const sortedMonthKeys = Object.keys(groupedRecords).sort(
    (a, b) => new Date(`${b}-01`).getTime() - new Date(`${a}-01`).getTime()
  );
  const renderItemContent = (
    item:
      | dailyActivityType
      | branchShariahTypes
      | staffInterviewTypes
      | leadsType
  ) => {
    if ("date" in item && "activity" in item) {
      return (
        <div className="flex items-center space-x-2">
          <span className="base font-medium text-foreground-600">
            {getFormattedDate(item.date)}
          </span>
          {item.activity ? (
            <span className="text-gray-600">{`- ${item.activity}`}</span>
          ) : (
            <span className="text-red-500">- No activity</span>
          )}
        </div>
      );
    }
    return <span className="text-gray-500">Unknown Record Type</span>;
  };

  return (
    <ScrollShadow>
      <ExportBottomSheet
        dailyActivityRecords={dailyActivityRecords}
        action={"daily-activity"}
        onSearch={handleSearch}
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
                  records={groupedRecords[monthKey]}
                  confirmDelete={confirmDelete}
                  fetchRecords={fetchDailyActivity}
                  renderItemContent={renderItemContent}
                  action="daily-activity"
                  noRecordsActions={[
                    {
                      label: "Add Daily Activity Record",
                      onPress: () => router.push("/forms/daily-activity"),
                    },
                  ]}
                  loading={dailyActivityLoading}
                />
              </AccordionItem>
            );
          })}
        </Accordion>
      ) : dailyActivityLoading ? (
        <div className="space-y-3 p-3 w-full">
          {[...Array(15)].map((_, index) => (
            <div
              key={index}
              className="p-3 rounded-md transition w-full bg-gray-100 dark:bg-gray-800 animate-pulse"
            >
              <div className="flex justify-between items-center w-full">
                <div>
                  <Skeleton className="h-6 w-40 mb-2" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <div className="flex space-x-2">
                  <div className="h-8 w-8 bg-gray-300 dark:bg-gray-700 rounded-full animate-pulse" />
                  <div className="h-8 w-8 bg-gray-300 dark:bg-gray-700 rounded-full animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="p-4 text-center">No records found.</p>
      )}
    </ScrollShadow>
  );
}
