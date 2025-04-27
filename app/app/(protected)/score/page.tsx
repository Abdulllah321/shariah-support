"use client";

import React from "react";
import { Card, CardHeader, CardBody, Spinner } from "@heroui/react";
import { useRecord } from "@/context/RecordContext";
import { useRouter } from "next/navigation";

const RecordsList = () => {
  const { dailyActivityRecords, dailyActivityLoading } = useRecord();
  const router = useRouter();
  // ✅ اگر ریکارڈز لوڈ ہو رہے ہیں تو اسپنر دکھائیں
  if (dailyActivityLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  const totalActivities = dailyActivityRecords.reduce((sum, record) => {
    let participantCount = 1; // default
    if (record.participants !== undefined && record.participants !== null) {
      participantCount = parseInt(record.participants, 10);
      if (isNaN(participantCount)) {
        participantCount = 1; // fallback if parsing fails
      }
    }
    return sum + participantCount;
  }, 0);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      month: "long",
      day: "numeric",
      year: "numeric",
    }).format(date);
  };

  return (
    <div className="p-6 min-h-screen w-full md:w-1/2 mx-auto">
      {dailyActivityRecords.length > 0 ? (
        dailyActivityRecords.map((record) => (
          <Card
            key={record.id}
            className="mb-4 w-full relative"
            isPressable
            onPress={() =>
              router.push(`/detail/${record.id}?action=daily-activity`)
            }
          >
            <CardHeader>
              {record.activity ? (
                <h2 className="text-xl font-bold text-left">
                  {record.activity}
                </h2>
              ) : (
                <h2 className="text-lg text-gray-500 italic text-left ">
                  No Activity Name
                </h2>
              )}
            </CardHeader>
            <CardBody>
              <h6>Date: {record.date ? formatDate(record.date) : "N/A"}</h6>
              {record.participants ? (
                <p className="font-bold">
                  No of Participant{" "}
                  <span className="absolute text-4xl right-4 bottom-4 font-extrabold text-secondary">
                    {record.participants}
                  </span>
                </p>
              ) : null}
            </CardBody>
          </Card>
        ))
      ) : (
        // ✅ اگر کوئی ڈیٹا نہیں ملا تو "No Activities Found" دکھائیں
        <div className="flex justify-center items-center h-64">
          <p className="text-lg font-semibold text-gray-500">
            No activities found.
          </p>
        </div>
      )}

      {dailyActivityRecords.length > 0 && (
        <Card className="mt-6 bg-primary text-white">
          <CardBody>
            <h2 className="text-2xl font-bold text-center">
              Total Activities: {totalActivities}
            </h2>
          </CardBody>
        </Card>
      )}
    </div>
  );
};

export default RecordsList;
