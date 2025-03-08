"use client";
import { useEffect, useState } from "react";
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { db } from "@/firebase";
import { motion } from "framer-motion";
import { FiSearch, FiDownload, FiTrash2 } from "react-icons/fi";
import { saveAs } from "file-saver";
import { Button } from "flowbite-react";
import Link from "next/link";
import Loader from "@/components/Loader";
import { MdDelete, MdVisibility } from "react-icons/md";

import { useSearchParams } from "next/navigation";
import ExportModal from "@/components/ExportModal";

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const rowsPerPage = 10;
  const searchParams = useSearchParams();
  const employeeId = searchParams.get("scholar");
  console.log(reports);
  useEffect(() => {
    setLoading(true); // Set loading to true while fetching data

    let reportsQuery;
    if (employeeId) {
      // If employeeId is found, filter records by employeeId
      reportsQuery = query(
        collection(db, "BranchReview"),
        where("employeeId", "==", employeeId)
      );
    } else {
      // Otherwise, fetch all records
      reportsQuery = collection(db, "BranchReview");
    }

    const unsubscribe = onSnapshot(reportsQuery, (querySnapshot) => {
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setReports(data);
      setFilteredReports(data);
      setLoading(false); // Set loading to false after data is fetched
    });

    return () => unsubscribe();
  }, [employeeId]);

  const handleFilter = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    const filtered = reports.filter((report) =>
      Object.values(report).some((field) =>
        String(field).toLowerCase().includes(value.toLowerCase())
      )
    );
    setFilteredReports(filtered);
    setCurrentPage(1);
  };

  const handleSort = (key) => {
    const sortedReports = [...filteredReports].sort((a, b) => {
      if (a[key] < b[key]) return -1;
      if (a[key] > b[key]) return 1;
      return 0;
    });
    setFilteredReports(sortedReports);
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "BranchReview", id));
    } catch (error) {
      console.error("Error deleting document: ", error);
    }
  };

  const totalPages = Math.ceil(filteredReports.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentRows = filteredReports.slice(
    startIndex,
    startIndex + rowsPerPage
  );

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  if (loading) {
    return (
      <div>
        <Loader />
      </div>
    );
  }

  return (
    <motion.div
      className="mx-auto p-6 w-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-3xl font-semibold text-gray-800 mb-6">Branch Review Reports</h1>
      <div className="flex justify-between items-center mb-4">
        <form className="w-[28rem]">
          <div className="relative">
            <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
              <FiSearch className="w-4 h-4 text-gray-500" />
            </div>
            <input
              type="text"
              placeholder="Search reports"
              value={searchQuery}
              onChange={handleFilter}
              className="block w-full p-4 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>
        </form>
        <ExportModal dailyActivityRecords={filteredReports} action={'branch-review'}  />
      </div>

      <motion.div
        className="overflow-hidden bg-white shadow rounded-lg w-full mx-auto"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <table className="w-full divide-y divide-gray-200 rounded-md">
          <thead className="bg-teal-800">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">
                Index
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("name")}
              >
                Name
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("branchName")}
              >
                Branch
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("city")}
              >
                City
              </th>{" "}
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("activity")}
              >
                Region
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("date")}
              >
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {currentRows.map((report, index) => (
              <tr
                key={report.id}
                className="hover:bg-teal-100 odd:bg-gray-50 even:bg-white"
              >
                <td className="border px-4 py-2">#{index + 1}</td>
                <td className="border px-4 py-2">{report.name}</td>
                <td className="border px-4 py-2">{report.branchName}</td>
                <td className="border px-4 py-2">{report.city}</td>
                <td className="border px-4 py-2">{report.region}</td>
                <td className="border px-4 py-2">
                  {new Date(report.visitDate).toLocaleDateString()}
                </td>
                <td className="border px-4 py-2">
                  <div className="flex gap-2">
                    <Button className="bg-blue-700 text-white hover:bg-blue-600 flex items-center gap-1">
                      <MdVisibility size={18} className="mr-2" />
                      <Link
                        href={`/reports/detail/${report.id}?action=branch-review`}
                      >
                        Details
                      </Link>
                    </Button>

                    <Button
                      className="bg-red-600 text-white hover:bg-red-600 flex items-center gap-1"
                      onClick={() => handleDelete(report.id)}
                    >
                      <MdDelete size={18} className="mr-2" />
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </motion.div>

      <div className="flex justify-center mt-4">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            onClick={() => handlePageChange(page)}
            className={`px-3 py-1 mx-1 border rounded ${
              currentPage === page ? "bg-teal-500 text-white" : ""
            }`}
          >
            {page}
          </button>
        ))}
      </div>
    </motion.div>
  );
}
