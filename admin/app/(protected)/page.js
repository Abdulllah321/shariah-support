"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from "chart.js";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/firebase";
import LeaderBoard from "@/components/LeaderBoard";
import ScholarBoard from "@/components/ScholarBoard";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

const Dashboard = () => {
  const [activities, setActivities] = useState([]);
  const [summary, setSummary] = useState({
    totalActivities: 0,
    avgScore: 0,
    uniqueBranches: 0,
    uniqueEmployees: 0,
  });

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "records"), (snapshot) => {
      const fetchedActivities = snapshot.docs.map((doc) => doc.data());
      setActivities(fetchedActivities);

      const totalActivities = fetchedActivities.length;
      const totalScore = fetchedActivities.reduce((sum, act) => {
        const score = Number(act.score);
        return isNaN(score) ? sum : sum + score;
      }, 0);

      const uniqueBranches = new Set(
        fetchedActivities.map((act) => act.branchCode)
      ).size;
      const uniqueEmployees = new Set(
        fetchedActivities.map((act) => act.employeeId)
      ).size;

      setSummary({
        totalActivities,
        avgScore: totalActivities
          ? (totalScore / totalActivities).toFixed(2)
          : 0,
        uniqueBranches,
        uniqueEmployees,
      });
    });

    return () => unsubscribe();
  }, []);

  const employeeScores = activities.reduce((acc, act) => {
    const score = Number(act.score);
    if (!isNaN(score)) {
      acc[act.employeeId] = (acc[act.employeeId] || 0) + score;
    }
    return acc;
  }, {});

  const sortedEmployeeScores = Object.entries(employeeScores)
    .map(([employeeId, score]) => ({
      employeeId,
      score,
      name:
        activities.find((act) => act.employeeId === employeeId)?.name ||
        "Unknown",
    }))
    .sort((a, b) => b.score - a.score);

  const generateColors = (count) => {
    return Array.from(
      { length: count },
      (_, i) => `hsl(${i * (360 / count)}, 70%, 50%)`
    );
  };

  const employeeScoreChart = {
    labels: sortedEmployeeScores.map((emp) => emp.name),
    datasets: [
      {
        label: "Total Score by Employee",
        data: sortedEmployeeScores.map((emp) => emp.score),
        backgroundColor: generateColors(sortedEmployeeScores.length),
        borderColor: "#fff",
        borderWidth: 2,
      },
    ],
  };

  const employeeScoreChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Employee Total Scores",
      },
    },
  };

  return (
    <div className="p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">Daily Activity Dashboard</h1>
        <p className="text-gray-600">Track and analyze employee activities</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div className="bg-white p-6 rounded-lg shadow-lg text-center ">
          <h3 className="text-xl font-semibold">Total Activities</h3>
          <p className="text-3xl font-bold">{summary.totalActivities}</p>
        </motion.div>

        <motion.div className="bg-white p-6 rounded-lg shadow-lg text-center">
          <h3 className="text-xl font-semibold">Avg. Score</h3>
          <p className="text-3xl font-bold">{summary.avgScore}</p>
        </motion.div>

        <motion.div className="bg-white p-6 rounded-lg shadow-lg text-center">
          <h3 className="text-xl font-semibold">Visited Branches</h3>
          <p className="text-3xl font-bold">{summary.uniqueBranches}</p>
        </motion.div>

        <motion.div className="bg-white p-6 rounded-lg shadow-lg text-center">
          <h3 className="text-xl font-semibold">Total Scholars</h3>
          <p className="text-3xl font-bold">{summary.uniqueEmployees}</p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="flex flex-col gap-6">
          <ScholarBoard dailyActivityRecords={activities} />
          <motion.div className="bg-white h-max p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold mb-4">
              Employee Total Scores
            </h3>
            {sortedEmployeeScores.length > 0 && (
              <Doughnut
                data={employeeScoreChart}
                options={employeeScoreChartOptions}
              />
            )}
          </motion.div>
        </div>

        <LeaderBoard />
      </div>
    </div>
  );
};

export default Dashboard;
