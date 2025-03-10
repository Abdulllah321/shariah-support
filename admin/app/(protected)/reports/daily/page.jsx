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
import { FiSearch } from "react-icons/fi";
import { Button } from "flowbite-react";
import Link from "next/link";
import Loader from "@/components/Loader";
import { useSearchParams } from "next/navigation";
import { MdDelete, MdVisibility } from "react-icons/md";
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
  const activity = searchParams.get("activity");

  // Sorting state
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  useEffect(() => {
    setLoading(true);

    let reportsQuery = collection(db, "records");

    if (employeeId || activity) {
      const filters = [];
      if (employeeId) filters.push(where("employeeId", "==", employeeId));
      if (activity) filters.push(where("activity", "==", activity));

      reportsQuery = query(reportsQuery, ...filters);
    }

    const unsubscribe = onSnapshot(reportsQuery, (querySnapshot) => {
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setReports(data);
      setFilteredReports(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [employeeId, activity]);

  // Apply sorting dynamically
  useEffect(() => {
    if (sortConfig.key) {
      const sortedReports = [...filteredReports].sort((a, b) => {
        let valueA = a[sortConfig.key];
        let valueB = b[sortConfig.key];

        // Convert date fields to actual Date objects for sorting
        if (sortConfig.key === "date") {
          valueA = new Date(a.date);
          valueB = new Date(b.date);
        }

        if (valueA < valueB) return sortConfig.direction === "asc" ? -1 : 1;
        if (valueA > valueB) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });

      setFilteredReports(sortedReports);
    }
  }, [sortConfig]);

  const handleFilter = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchQuery(value);

    const filtered = reports.filter((report) =>
      Object.values(report).some((field) =>
        String(field).toLowerCase().includes(value)
      )
    );
    setFilteredReports(filtered);
    setCurrentPage(1);
  };

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "records", id));
    } catch (error) {
      console.error("Error deleting document: ", error);
    }
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    const d = new Date(date);
    return `${d.getDate()}-${d.toLocaleString("en-US", {
      month: "short",
    })}-${d.getFullYear()}`;
  };

  const totalPages = Math.ceil(filteredReports.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentRows = filteredReports.slice(
    startIndex,
    startIndex + rowsPerPage
  );

  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) return <Loader />;

  return (
    <motion.div
      className="mx-auto p-6 w-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-3xl font-semibold text-gray-800 mb-6">
        Daily Activity Report
      </h1>

      <div className="flex justify-between md:items-center mb-4 flex-col-reverse md:flex-row gap-2">
        <form className="w-[28rem] max-w-full">
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
        <ExportModal
          dailyActivityRecords={filteredReports}
          action={"daily-activity"}
        />
      </div>

      <motion.div className="overflow-hidden bg-white shadow-lg rounded-lg">
        <div className="overflow-x-auto">
          <table className="w-full table-auto border-collapse min-w-max">
            <thead className="bg-teal-800 text-white">
              <tr>
                <th className="p-3">#</th>
                {[
                  { label: "Name", key: "name" },
                  { label: "Activity", key: "activity" },
                  { label: "Branch", key: "branchName" },
                  { label: "City", key: "city" },
                  { label: "Date", key: "date" },
                ].map(({ label, key }) => (
                  <th
                    key={key}
                    className="p-3 cursor-pointer"
                    onClick={() => handleSort(key)}
                  >
                    {label}{" "}
                    {sortConfig.key === key
                      ? sortConfig.direction === "asc"
                        ? "↑"
                        : "↓"
                      : "↕"}
                  </th>
                ))}
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentRows.length ? (
                currentRows.map((report, index) => (
                  <tr
                    key={report.id}
                    className="hover:bg-teal-100 odd:bg-gray-50 even:bg-white border-t text-sm md:text-base"
                  >
                    <td className="p-3">{index + 1}</td>
                    <td className="p-3">{report.name || "N/A"}</td>
                    <td className="p-3">{report.activity || "N/A"}</td>
                    <td className="p-3">{report.branchName || "N/A"}</td>
                    <td className="p-3">{report.city || "N/A"}</td>
                    <td className="p-3">{formatDate(report.date)}</td>
                    <td className="p-3">
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Link
                          href={`/reports/detail/${report.id}?action=daily-activity`}
                        >
                          <Button className="bg-blue-700 text-white flex items-center gap-1">
                            <MdVisibility size={18} />
                            Details
                          </Button>
                        </Link>
                        <Button
                          className="bg-red-600 text-white flex items-center gap-1"
                          onClick={() => handleDelete(report.id)}
                        >
                          <MdDelete size={18} />
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="p-4 text-center text-gray-500">
                    No records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Pagination Controls */}
      <div className="flex justify-between items-center mt-4">
        <p>
          Page {currentPage} of {totalPages}
        </p>
        <div className="flex gap-2">
          <Button
            color="teal"
            disabled={currentPage === 1}
            onClick={() => handlePageChange(currentPage - 1)}
          >
            Prev
          </Button>
          <Button
            disabled={currentPage === totalPages}
            onClick={() => handlePageChange(currentPage + 1)}
            className="bg-teal-500"
          >
            Next
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
