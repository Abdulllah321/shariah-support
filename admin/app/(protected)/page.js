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
  const [totalStaffInterviews, setTotalStaffInterviews] = useState(0);
  const [uniqueStaffInterviews, setUniqueStaffInterviews] = useState(0);

  useEffect(() => {
    const unsubscribeRecords = onSnapshot(
      collection(db, "records"),
      (snapshot) => {
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
      }
    );

    const unsubscribeStaff = onSnapshot(
      collection(db, "StaffReview"),
      (snapshot) => {
        const staffData = snapshot.docs.map((doc) => doc.data());
        const uniqueStaff = new Set(staffData.map((s) => s.employeeName)).size;
        const totalStaff = staffData.length;
        setTotalStaffInterviews(totalStaff);
        setUniqueStaffInterviews(uniqueStaff);
      }
    );

    return () => {
      unsubscribeRecords();
      unsubscribeStaff();
    };
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

  const predefinedColors = [
    "#FF0000",
    "#FF5733",
    "#FFC300",
    "#DAF7A6",
    "#28A745",
    "#007BFF",
    "#6F42C1",
    "#E83E8C",
    "#17A2B8",
    "#20C997",
    "#FD7E14",
    "#6610F2",
    "#DC3545",
    "#6C757D",
    "#343A40",
  ];

  const employeeScoreChart = {
    labels: sortedEmployeeScores.map((emp) => {
      const name =
        emp.name.length > 10 ? `${emp.name.substring(0, 10)}...` : emp.name;
      return `(${emp.score}) ${name}`;
    }),
    datasets: [
      {
        label: "Total Score by Employee",
        data: sortedEmployeeScores.map((emp) => emp.score),
        backgroundColor: predefinedColors.slice(0, sortedEmployeeScores.length),
        borderColor: "#fff",
        borderWidth: 2,
      },
    ],
  };

  const employeeScoreChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "left",
        labels: {
          font: {
            size: 12,
          },
          boxWidth: 15,
          usePointStyle: true, // Makes legends more compact
        },
      },
      tooltip: {
        callbacks: {
          label: (tooltipItem) => {
            const index = tooltipItem.dataIndex;
            return `${sortedEmployeeScores[index].name}: ${sortedEmployeeScores[index].score}`;
          },
        },
      },
    },
  };

  return (
    <div className="p-6 h-max">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-600">Track and analyze employee activities</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div className="bg-white p-6 rounded-lg shadow-lg text-center ">
          <h3 className="text-xl font-semibold">Total Activities</h3>
          <p className="text-3xl font-bold">{summary.totalActivities}</p>
        </motion.div>

        <motion.div className="bg-white p-6 rounded-lg shadow-lg text-center">
          <h3 className="text-xl font-semibold">Interviewed Staff</h3>
          <p className="text-3xl font-bold">
            {uniqueStaffInterviews} / <sub>{totalStaffInterviews}</sub>
          </p>
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
