"use client";
import React, { useEffect, useRef, useState } from "react";
import {
  collection,
  getDocs,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import { db } from "@/firebase";
import { Label } from "flowbite-react";
import { format, parseISO } from "date-fns";
import { Skeleton } from "@heroui/skeleton";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/free-mode";
import { FreeMode, Navigation } from "swiper/modules";
import { ChevronLeft, ChevronRight } from "lucide-react";

const Page = () => {
  const [groupedRecords, setGroupedRecords] = useState({});
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState("overall");
  const [selectedRegion, setSelectedRegion] = useState("overall");
  const [availableMonths, setAvailableMonths] = useState([]);
  const [records, setRecords] = useState([]);
  const [scholars, setScholars] = useState({});
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    const fetchScholars = async () => {
      try {
        const scholarsQuery = query(collection(db, "scholars"));
        const querySnapshot = await getDocs(scholarsQuery);

        const scholarMap = {};
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          scholarMap[data.employeeId] = data.name; // Store employeeId → name mapping
        });

        setScholars(scholarMap);
      } catch (error) {
        console.error("Error fetching scholars:", error);
      }
    };

    fetchScholars();
  }, []);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "activities"), (snapshot) => {
      const activitiesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setActivities(activitiesData);
    });

    return () => unsubscribe();
  }, []);

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
      const activityType = record.activity?.trim() || "Other Activity";
      const employeeName = record.employeeId?.trim() || "Unnamed";

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
    <div
      className="flex flex-col items-center w-full p-6 rounded-2xl border shadow-lg backdrop-blur-md relative h-max
          bg-white dark:bg-gray-900/50 border-gray-300 dark:border-gray-700 shadow-gray-400 dark:shadow-gray-800 transition-all duration-500"
    >
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
        // <Swiper
        //   slidesPerView="auto"
        //   spaceBetween={10}
        //   freeMode
        //   modules={[FreeMode]}
        //   className="p-2"
        // >
        //   {Object.entries(groupedRecords)
        //     .sort(
        //       ([, employeesA], [, employeesB]) =>
        //         Object.values(employeesB).reduce(
        //           (sum, count) => sum + count,
        //           0
        //         ) -
        //         Object.values(employeesA).reduce((sum, count) => sum + count, 0)
        //     )
        //     .map(([activityType, employees]) => (
        //       <SwiperSlide key={activityType} className="!w-max">
        //         <button
        //           onClick={() => setSelected(activityType)}
        //           className={`px-4 py-2 rounded-lg border transition-all ${
        //             selected === activityType
        //               ? "bg-blue-500 text-white"
        //               : "bg-gray-100"
        //           }`}
        //         >
        //           {`${activityType} (${Object.values(employees).reduce(
        //             (sum, count) => sum + count,
        //             0
        //           )})`}
        //         </button>
        //       </SwiperSlide>
        //     ))}
        // </Swiper>

        <div className="relative w-full mb-10">
          {/* Left Arrow */}
          <button
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 -ml-4 bg-white/50 backdrop-blur-sm shadow-md p-2 rounded-full border border-gray-300 hover:bg-gray-200 transition"
            id="swiper-prev-lead"
          >
            <ChevronLeft className="w-6 h-6 text-gray-700" />
          </button>

          <Swiper
            slidesPerView="auto"
            spaceBetween={30}
            freeMode={true}
            navigation={{
              prevEl: "#swiper-prev-lead",
              nextEl: "#swiper-next-lead",
            }}
            modules={[FreeMode, Navigation]}
            className="w-full"
            slidesOffsetBefore={40} // Space before the first slide
            slidesOffsetAfter={40} // Space after the last slide
          >
            {Object.entries(groupedRecords)
              .sort((a, b) => {
                const orderA =
                  activities.find((act) => act.name === a[0])?.order ??
                  Infinity;
                const orderB =
                  activities.find((act) => act.name === b[0])?.order ??
                  Infinity;

                return orderA - orderB; // Sort by predefined order only
              })
              .map(([activityType, employees]) => (
                <SwiperSlide
                  key={activityType}
                  onClick={() => setSelected(activityType)}
                  className={`flex flex-col items-center justify-center px-4 py-2 text-center rounded-lg border border-gray-300 shadow-lg !w-max cursor-pointer transition-all
                          ${
                            selected === activityType
                              ? "!bg-blue-500 text-white"
                              : "bg-gray-100"
                          }`}
                >
                  {`${activityType} (${Object.values(employees).reduce(
                    (sum, count) => sum + count,
                    0
                  )})`}
                </SwiperSlide>
              ))}
          </Swiper>

          {/* Right Arrow */}
          <button
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/50 backdrop-blur-sm -mr-4 shadow-md p-2 rounded-full border border-gray-300 hover:bg-gray-200 transition"
            id="swiper-next-lead"
          >
            <ChevronRight className="w-6 h-6 text-gray-700" />
          </button>
        </div>
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
          <div className="mt-4">
            <h2 className="text-xl font-bold mb-4 text-center text-gray-800">
              {selected} Activity Leaderboard
            </h2>
            <div className="space-y-2">
              {Object.entries(groupedRecords[selected])
                .sort((a, b) => b[1] - a[1])
                .map(([employeeId, count], index) => {
                  const employeeName = scholars[employeeId] || "Unnamed";

                  // Define styles for the top 3 positions
                  const rankStyles = [
                    "bg-yellow-500 text-white", // 🥇 Gold
                    "bg-gray-400 text-white", // 🥈 Silver
                    "bg-orange-400 text-white", // 🥉 Bronze
                  ];

                  return (
                    <div
                      key={employeeId}
                      className={`p-2 rounded-lg flex items-center justify-between text-sm font-semibold
                      transition-all duration-300 ${
                        index < 3
                          ? rankStyles[index] + " shadow-md"
                          : "bg-white border border-gray-300 shadow-sm"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        {index === 0 && "🥇"}
                        {index === 1 && "🥈"}
                        {index === 2 && "🥉"}#{index + 1} {employeeName}
                      </span>
                      <span className="font-bold text-gray-700">
                        {count} pts
                      </span>
                    </div>
                  );
                })}
            </div>
          </div>
        )
      )}
    </div>
  );
};

export default Page;
