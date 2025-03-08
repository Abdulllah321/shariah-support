import { db } from "@/firebase";
import { Skeleton } from "@heroui/skeleton";
import { collection, onSnapshot } from "firebase/firestore";
import { Button } from "flowbite-react";
import { AnimatePresence, motion } from "framer-motion";
import { Award, ChevronDown, Trophy } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/free-mode";
import { FreeMode } from "swiper/modules";
import { useRouter } from "next/navigation";

const ScholarBoard = ({ dailyActivityRecords }) => {
  const [isShowMore, setIsShowMore] = useState(false);
  const [scholars, setScholars] = useState([]);
  const [selectedScholar, setSelectedScholar] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter()
  const sectionRef = useRef(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "scholars"), (snapshot) => {
      const scholarData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setScholars(scholarData);
      if (scholarData.length > 0) {
        setSelectedScholar(scholarData[0].employeeId); // Set first scholar as default
      }
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

    // Filter activities based on selected scholar
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

    setLoading(false); // Set loading to false after all calculations
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

  const topActivities = Object.entries(activityCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, isShowMore ? undefined : 3)
    .map(([activity, count]) => `${activity} (${count})`);

  return (
    <div
      ref={sectionRef}
      className={`flex flex-col items-center w-full p-6 pb-16 rounded-2xl border shadow-lg backdrop-blur-md relative
          bg-white dark:bg-gray-900/50 border-gray-300 dark:border-gray-700 shadow-gray-400 dark:shadow-gray-800 transition-all duration-500
          ${isShowMore ? "max-h-[1200px]" : "max-h-[450px]"}`}
    >
      <div className="w-full mb-10">
        <Swiper
          slidesPerView="auto"
          spaceBetween={30}
          freeMode={true}
          modules={[FreeMode]}
          className="w-full"
        >
          {scholars.map((scholar) => (
            <SwiperSlide
              key={scholar.employeeId}
              onClick={() => setSelectedScholar(scholar.employeeId)}
              className={`flex flex-col items-center justify-center px-4 py-2 text-center rounded-lg border border-gray-300 shadow-lg bg-white !w-max cursor-pointer transition-all
            ${
              selectedScholar === scholar.employeeId
                ? "!bg-teal-500 !text-white !border-teal-700 shadow-md"
                : ""
            }`}
            >
              <p className="text-lg font-semibold whitespace-nowrap">
                {scholar.name}
              </p>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Title */}
      <h2 className="text-xl font-bold flex items-center gap-2 text-gray-800 dark:text-white">
        🏆{" "}
        {selectedScholar
          ? "Selected Scholar's Activities"
          : "Top Activities Leaderboard"}
      </h2>

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
                  onClick={() => router.push(`/reports/daily?scholar=${selectedScholar}&activity=${activity.split(" (")[0]}`)}
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
    </div>
  );
};

export default ScholarBoard;
