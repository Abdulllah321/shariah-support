import { db } from "@/firebase";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { AnimatePresence, motion } from "framer-motion";
import {
  Award,
  ChevronDown,
  Trophy,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";
import { Bar } from "react-chartjs-2";
import { Combobox } from "./DropdownMenu";
import { Skeleton } from "./ui/skeleton";
import { Label } from "flowbite-react";


const ScholarBoard = ({ dailyActivityRecords }) => {
  const [isShowMore, setIsShowMore] = useState(false);
  const [scholars, setScholars] = useState([]);
  const [activities, setActivities] = useState([]);
  const [selectedScholar, setSelectedScholar] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [activeTab, setActiveTab] = useState("list");
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const sectionRef = useRef(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "scholars"), (snapshot) => {
      const scholarData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setScholars(scholarData);
      if (scholarData.length > 0) {
        setSelectedScholar(scholarData[0].employeeId);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const activitiesQuery = query(
      collection(db, "activities"),
      orderBy("order", "asc")
    );

    const unsubscribe = onSnapshot(activitiesQuery, (snapshot) => {
      const activitiesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setActivities(activitiesData);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!isShowMore && sectionRef.current) {
      sectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [isShowMore]);

  useEffect(() => {
    if (scholars.length === 0) return;

    const filteredRecords = selectedScholar
      ? dailyActivityRecords?.filter(
          (record) => record.employeeId?.trim() === selectedScholar
        )
      : dailyActivityRecords;

    // Count activities
    filteredRecords?.forEach((record) => {
      const activity = record.activity;
      if (activity) {
        activityCount[activity] = (activityCount[activity] || 0) + 1;
      }
    });

    const categoryMap = {};

    filteredRecords.forEach((data) => {
      const activityType = data.activity || "Other Activity";
      const recordMonth = dayjs(data.date).format("YYYY-MM");
      // Aggregate activity counts
      categoryMap[activityType] = (categoryMap[activityType] || 0) + 1;
    });

    setChartData({
      labels: Object.keys(categoryMap),
      datasets: [
        {
          label: "Records by Activity",
          data: Object.values(categoryMap),
          backgroundColor: "#3B82F6",
          borderRadius: 8,
        },
      ],
    });

    setLoading(false);
  }, [dailyActivityRecords, selectedScholar, scholars]);

  const filteredRecords = selectedScholar
    ? dailyActivityRecords?.filter(
        (record) => record.employeeId?.trim() === selectedScholar
      )
    : dailyActivityRecords;

  // Count activities
  const activityCount = {};
  filteredRecords?.forEach((record) => {
    const activity = record.activity;
    if (activity) {
      activityCount[activity] = (activityCount[activity] || 0) + 1;
    }
  });
  const topActivities = activities
    .filter((act) => activityCount[act.name] !== undefined) // Sirf woh activities lo jo activityCount mein hain
    .slice(0, isShowMore ? undefined : 3) // Pehlay 3 ya sab (isShowMore ke mutabiq)
    .map((act) => `${act.name} (${activityCount[act.name]})`);

  return (
    <div
      ref={sectionRef}
      className={`flex flex-col items-center w-full p-6 pb-16 rounded-2xl border shadow-lg backdrop-blur-md relative
          bg-white dark:bg-gray-900/50 border-gray-300 dark:border-gray-700 shadow-gray-400 dark:shadow-gray-800 transition-all duration-500
          ${
            activeTab == "chart"
              ? "max-h-full"
              : isShowMore
              ? "max-h-[1500px]"
              : "max-h-[600px]"
          }`}
    >
      <h1 className="text-2xl text-gray-800 font-bold mb-2">
        Scholar Wise Performance
      </h1>
      {/* //Tabs */}
      <div className="border rounded-md w-full p-2">
        <div className="flex items-center justify-center px-4 bg-gray-100 text-gray-700  rounded-md w-full relative">
          {/* Animated Background */}
          <motion.div
            className="bg-teal-700 w-1/2 h-full absolute top-0 rounded-md"
            initial={false}
            animate={{ left: activeTab === "list" ? "0%" : "50%" }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
          />

          {/* List Button */}
          <button
            className={`font-semibold w-full py-2 h-full relative z-10 ${
              activeTab === "list" ? "text-white" : "text-gray-700"
            }`}
            onClick={() => setActiveTab("list")}
          >
            List
          </button>

          {/* Chart Button */}
          <button
            className={`font-semibold w-full py-2 h-full relative z-10 ${
              activeTab === "chart" ? "text-white" : "text-gray-700"
            }`}
            onClick={() => setActiveTab("chart")}
          >
            Trend
          </button>
        </div>
      </div>

      {/* Divider */}
      <div className="w-full h-0.5 bg-gray-200 dark:bg-gray-700/50 my-2" />

      <div className="relative w-full mb-2 flex items-center justify-center md:gap-3 gap-1 flex-col md:flex-row">
        <Label className="mx-auto w-full">Select Scholars: </Label>
        <Combobox
          frameworks={scholars}
          value={selectedScholar}
          setValue={setSelectedScholar}
          placeholder="Select Scholar..."
          title="Scholars"
          label="name"
          mapValue="employeeId"
        />
      </div>

      {activeTab === "chart" ? (
        <>
          {chartData ? (
            <Bar
              data={chartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                animation: {
                  duration: 1000,
                  easing: "easeInOutQuad",
                },
                plugins: {
                  legend: { display: false },
                  tooltip: { enabled: true },
                },
                scales: {
                  x: {
                    ticks: {
                      autoSkip: false,
                      maxRotation: 90,
                      minRotation: 90,
                      callback: function (value) {
                        const label = this.getLabelForValue(value);
                        return label.length > 10
                          ? label.substring(0, 10) + "..."
                          : label;
                      },
                    },
                  },
                  y: {
                    beginAtZero: true,
                  },
                },
              }}
              className="h-[300px] md:h-[400px] max-h-[400px]"
            />
          ) : (
            <div className="h-[300px] md:h-[400px] max-h-[400px] flex flex-col justify-between p-4">
              {/* X-Axis Labels Skeleton */}
              <div className="flex justify-between mb-4">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Skeleton key={index} className="h-4 w-10 rounded" />
                ))}
              </div>

              {/* Bars Skeleton */}
              <div className="flex justify-between items-end space-x-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <Skeleton
                    key={index}
                    className={`w-8 rounded-md ${
                      index % 2 === 0 ? "h-24" : "h-32"
                    }`}
                  />
                ))}
              </div>

              {/* Y-Axis Labels Skeleton */}
              <div className="flex  items-start space-y-2 mt-4 justify-between">
                {Array.from({ length: 6 }).map((_, index) => (
                  <Skeleton key={index} className="w-5 h-12 rounded" />
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <>
          {/* Loading State */}

          {loading ? (
            <div className="flex flex-col items-center space-y-3 w-full mt-4">
              <Skeleton className="w-full h-10 rounded-full" />
              <Skeleton className="w-full h-10 rounded-full scale-90" />
              <Skeleton className="w-full h-10 rounded-full scale-80" />
            </div>
          ) : topActivities?.length > 0 ? (
            <div
              className={`flex flex-col items-center space-y-3 w-full mt-4 overflow-hidden transition-all duration-500 ${
                isShowMore ? "max-h-auto" : "max-h-[180px]"
              }`}
            >
              <AnimatePresence>
                {topActivities.map((activity, index) => {
                  const rankStyles = [
                    "bg-yellow-200/60 border-yellow-400 text-yellow-700 shadow-yellow-400/40 dark:bg-yellow-500/30 dark:border-yellow-400 dark:text-yellow-200 dark:shadow-yellow-500/40",
                    "bg-gray-200/60 border-gray-400 text-gray-700 shadow-gray-400/40 dark:bg-gray-500/30 dark:border-gray-400 dark:text-gray-200 dark:shadow-gray-500/40",
                    "bg-orange-200/60 border-orange-400 text-orange-700 shadow-orange-400/40 dark:bg-orange-500/30 dark:border-orange-400 dark:text-orange-200 dark:shadow-orange-500/40",
                  ];

                  return (
                    <motion.div
                      key={index}
                      className={`relative w-full px-6 py-3 rounded-full border text-center font-semibold flex items-center transition-all duration-500 transform cursor-pointer
                        ${
                          rankStyles[index] ||
                          "bg-gray-100 border-gray-400 text-gray-700 shadow-gray-300 dark:bg-white/10 dark:border-gray-600 dark:text-gray-300 dark:shadow-gray-700/30"
                        }
                        ${
                          isShowMore
                            ? "scale-100"
                            : index === 0
                            ? "scale-100"
                            : index === 1
                            ? "scale-95"
                            : index === 2
                            ? "scale-90"
                            : "scale-85"
                        }`}
                      style={{
                        transitionDelay: `${(index - 5) * 40}ms`,
                        boxShadow:
                          "inset 2px 2px 6px rgba(0,0,0,0.05), 3px 3px 10px rgba(0,0,0,0.1)",
                      }}
                      onClick={() =>
                        router.push(
                          `/reports/daily?scholar=${selectedScholar}&activity=${
                            activity.split(" (")[0]
                          }`
                        )
                      }
                    >
                      <div className="absolute left-3 top-1/2 -translate-y-1/2">
                        {index < 3 ? (
                          <Trophy
                            className="w-6 h-6 text-yellow-600 dark:text-yellow-300"
                            strokeWidth={2}
                          />
                        ) : (
                          <Award
                            className="w-6 h-6 text-gray-600 dark:text-gray-400"
                            strokeWidth={2}
                          />
                        )}
                      </div>
                      <span className="ml-5 whitespace-nowrap text-ellipsis line-clamp-1">
                        {index + 1}. {activity}
                      </span>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          ) : (
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              No activities recorded yet. 🚀
            </p>
          )}

          {/* Show More Button */}
          {filteredRecords.length > 33 && (
            <div className="w-full h-20 bg-gradient-to-t from-gray-300 dark:from-gray-600/50 rounded-b-md to-transparent z-20 absolute bottom-0">
              <div
                className="flex items-center justify-center w-full h-24 bg-transparent"
                onClick={() => setIsShowMore(!isShowMore)}
              >
                <p className="text-blue-500 underline">
                  Show {isShowMore ? "Less" : "More"}
                </p>
                <ChevronDown
                  className={`${
                    isShowMore ? "rotate-180" : "rotate-0"
                  } text-blue-600 transition`}
                />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ScholarBoard;
