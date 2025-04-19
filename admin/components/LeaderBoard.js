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
import "swiper/css";
import "swiper/css/free-mode";
import { Skeleton } from "./ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

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
  const [selectedArea, setSelectedArea] = useState("overall");
  const [availableAreas, setAvailableAreas] = useState([]);


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

        const uniqueAreas = [
          ...new Set(
            fetchedRecords
              .map((record) => record.area?.trim()) // Trim whitespace & handle undefined
              .filter((area) => area) // Remove empty or falsy values
          ),
        ];

        // Grouping areas alphabetically
        const groupedAreas = uniqueAreas.sort().reduce((acc, area) => {
          const firstLetter = area.charAt(0).toUpperCase(); // Get first letter
          if (!acc[firstLetter]) acc[firstLetter] = []; // Create array if not exists
          acc[firstLetter].push(area);
          return acc;
        }, {});

        setAvailableAreas(groupedAreas);

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
  }, [records, selectedMonth, selectedRegion,selectedArea]);

  const filterRecords = () => {
    let filteredRecords = records;

    // Filter by selected month
    if (selectedMonth !== "overall") {
      filteredRecords = filteredRecords.filter((record) => {
        if (!record.date) return false;
        const recordDate =
          typeof record.date === "string" ? parseISO(record.date) : record.date;
        return format(recordDate, "yyyy-MM") === selectedMonth;
      });
    }

    // Filter by selected region
    if (selectedRegion !== "overall") {
      filteredRecords = filteredRecords.filter(
        (record) => record.region === selectedRegion
      );
    }

    // Filter by selected area
    if (selectedArea !== "overall") {
      filteredRecords = filteredRecords.filter(
        (record) => record.area === selectedArea
      );
    }
    // Group data by activity and employee
    const groupedData = filteredRecords.reduce((acc, record) => {
      if (!record || !record.activity) return acc; // Skip undefined records

      const activityType = record.activity?.trim() || "Other Activity";
      const employeeName = record.employeeId?.trim() || "Unnamed";

      if (!acc[activityType]) acc[activityType] = {};
      if (!acc[activityType][employeeName]) acc[activityType][employeeName] = 0;

      if (activityType === "Clients met indoor / outdoor") {
        const participants = Number(record.participants);
        acc[activityType][employeeName] += isNaN(participants)
          ? 0
          : participants;
      } else {
        acc[activityType][employeeName]++;
      }

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
      <h1 className="text-2xl text-gray-800 font-bold mb-2">
        Activity Wise Performance
      </h1>

      <div className="mb-4 flex gap-2 overflow-x-auto md:overflow-visible whitespace-nowrap w-full px-2">
        {loading ? (
          <Skeleton className="h-10 w-32 rounded-lg" />
        ) : (
          <div className="flex flex-col gap-1 min-w-[120px]">
            <Label>Month</Label>
            <select
              className="p-2 border rounded-lg"
              value={selectedMonth}
              onChange={(e) => setSelectedArea(e.target.value)}
            >
              <option value="overall">All</option>
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
          <div className="flex flex-col gap-1 min-w-[120px]">
            <Label>Region</Label>
            <select
              className="p-2 border rounded-lg"
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
            >
              <option value="overall">All</option>
              {["Central I", "Central II", "North", "South"].map((region) => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </select>
          </div>
        )}

        {loading ? (
          <Skeleton className="h-10 w-32 rounded-lg" />
        ) : (
          <div className="flex flex-col gap-1 min-w-[120px]">
            <Label>Area</Label>
            <select
              className="p-2 border rounded-lg"
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
            >
              <option value="overall">All</option>
              {Object.keys(availableAreas).map((letter) => (
                <optgroup key={letter} label={letter}>
                  {availableAreas[letter].map((area) => (
                    <option key={area} value={area}>
                      {area}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
        )}
      </div>

      <hr />
      {loading ? (
        <div className="flex gap-4 overflow-x-auto p-2">
          {[1, 2, 3, 4].map((_, i) => (
            <Skeleton key={i} className="w-32 h-10 rounded-lg" />
          ))}
        </div>
      ) : Object.keys(groupedRecords).length === 0 ? (
        <p>No records found.</p>
      ) : (
        <div className="relative w-full flex items-center justify-center md:gap-3 gap-1 flex-col md:flex-row">
          <Label>Activity:</Label>
          <Select onValueChange={setSelected} value={selected}>
            <SelectTrigger className="w-[250px]">
              <SelectValue placeholder="Select an Activity" />
            </SelectTrigger>
            <SelectContent>
              {activities
                .filter((act) => groupedRecords[act.name.trim()] !== undefined)
                .map((act) => {
                  const activityType = act.name.trim();
                  return (
                    <SelectItem key={activityType} value={activityType}>
                      {`${activityType} (${Object.values(
                        groupedRecords[activityType]
                      ).reduce((sum, count) => sum + count, 0)})`}
                    </SelectItem>
                  );
                })}
            </SelectContent>
          </Select>
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
          <div className="mt-4 w-full">
            <h2 className="text-xl font-bold mb-4 text-center text-gray-800">
              {selected}
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
                      <span className="font-bold text-gray-700">{count}</span>
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
