"use client";
import React, { useEffect, useRef, useState } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "@/firebase";
import { Label } from "flowbite-react";
import { format, parseISO } from "date-fns";
import { Skeleton } from "@heroui/skeleton";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/free-mode";
import { FreeMode } from "swiper/modules";

const Page = () => {
  const [groupedRecords, setGroupedRecords] = useState({});
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState("overall");
  const [selectedRegion, setSelectedRegion] = useState("overall");
  const [availableMonths, setAvailableMonths] = useState([]);
  const [records, setRecords] = useState([]);

  useEffect(() => {
    const fetchRecords = async () => {
      setLoading(true);
      try {
        const recordsQuery = query(
          collection(db, "records"),
          orderBy("date", "desc")
        );
        const querySnapshot = await getDocs(recordsQuery);
        const fetchedRecords = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setRecords(fetchedRecords);
      } catch (error) {
        console.error("Error fetching daily activity records:", error);
        setRecords([]);
      }
    };
    fetchRecords();
  }, []);

  useEffect(() => {
    if (records.length > 0) {
      const uniqueMonths = Array.from(
        new Set(
          records
            .map((record) => {
              if (!record.date) return null;
              const recordDate =
                typeof record.date === "string"
                  ? parseISO(record.date)
                  : record.date.toDate();
              return format(recordDate, "yyyy-MM");
            })
            .filter((month) => month !== null)
        )
      ).sort((a, b) => b.localeCompare(a));

      setAvailableMonths(uniqueMonths);
    }
  }, [records]);

  useEffect(() => {
    if (records.length > 0) {
      filterRecords();
    }
  }, [records, selectedMonth, selectedRegion]);

  const filterRecords = () => {
    let filteredRecords = records;

    if (selectedMonth !== "overall") {
      filteredRecords = filteredRecords.filter((record) => {
        if (!record.date) return false;
        const recordDate =
          typeof record.date === "string" ? parseISO(record.date) : record.date;
        return format(recordDate, "yyyy-MM") === selectedMonth;
      });
    }

    if (selectedRegion !== "overall") {
      filteredRecords = filteredRecords.filter(
        (record) => record.region === selectedRegion
      );
    }

    const groupedData = filteredRecords.reduce((acc, record) => {
      let activityType = record.activity?.trim() || "Other Activity";
      const employeeName = record.name?.trim() || "Unnamed";

      if (!acc[activityType]) acc[activityType] = {};
      if (!acc[activityType][employeeName]) acc[activityType][employeeName] = 0;

      acc[activityType][employeeName]++;
      return acc;
    }, {});

    setGroupedRecords(groupedData);

    // Set default selected activity
    const firstActivity = Object.keys(groupedData)[0] || null;
    setSelected(firstActivity);

    setLoading(false);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg h-full overflow-y-auto">
      <div className="mb-4 flex justify-between">
        {loading ? (
          <Skeleton className="h-10 w-32 rounded-lg" />
        ) : (
          <div className="flex flex-col gap-2">
            <Label>Month</Label>
            <select
              className="p-2 border rounded-lg"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            >
              <option value="overall">Overall</option>
              {availableMonths.map((month) => {
                try {
                  const formattedMonth = format(
                    parseISO(`${month}-01`),
                    "MMMM yyyy"
                  );
                  return (
                    <option key={month} value={month}>
                      {formattedMonth}
                    </option>
                  );
                } catch (error) {
                  console.error("Invalid date format:", month, error);
                  return null;
                }
              })}
            </select>
          </div>
        )}
        {loading ? (
          <Skeleton className="h-10 w-32 rounded-lg" />
        ) : (
          <div className="flex flex-col gap-2">
            <Label>Region</Label>
            <select
              className="p-2 border rounded-lg"
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
            >
              <option value="overall">Overall</option>
              {["Central I", "Central II", "North", "South"].map((region) => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex gap-4 overflow-x-auto p-2">
          {[1, 2, 3, 4].map((_, i) => (
            <Skeleton key={i} className="w-32 h-10 rounded-lg" />
          ))}
        </div>
      ) : Object.keys(groupedRecords).length === 0 ? (
        <p>No records found.</p>
      ) : (
        <Swiper
          slidesPerView="auto"
          spaceBetween={10}
          freeMode
          modules={[FreeMode]}
          className="p-2"
        >
          {Object.entries(groupedRecords)
            .sort(
              ([, employeesA], [, employeesB]) =>
                Object.values(employeesB).reduce((sum, count) => sum + count, 0) -
                Object.values(employeesA).reduce((sum, count) => sum + count, 0)
            )
            .map(([activityType, employees]) => (
              <SwiperSlide key={activityType} className="!w-max">
                <button
                  onClick={() => setSelected(activityType)}
                  className={`px-4 py-2 rounded-lg border transition-all ${
                    selected === activityType
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100"
                  }`}
                >
                  {`${activityType} (${Object.values(employees).reduce(
                    (sum, count) => sum + count,
                    0
                  )})`}
                </button>
              </SwiperSlide>
            ))}
        </Swiper>
      )}

      {loading ? (
        <div className="mt-6 space-y-3">
          {[1, 2, 3, 4, 5].map((_, i) => (
            <Skeleton key={i} className="h-12 rounded-lg" />
          ))}
        </div>
      ) : (
        selected &&
        groupedRecords[selected] && (
          <div className="mt-6 p-4 bg-white rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold mb-4 text-center">
              {selected} Activity Leaderboard
            </h2>
            <div className="space-y-3">
              {Object.entries(groupedRecords[selected])
                .sort((a, b) => b[1] - a[1])
                .map(([employeeName, count], index) => (
                  <div key={employeeName} className="p-3 bg-gray-100 rounded-lg">
                    <span>#{index + 1} {employeeName} - {count}</span>
                  </div>
                ))}
            </div>
          </div>
        )
      )}
    </div>
  );
};

export default Page;