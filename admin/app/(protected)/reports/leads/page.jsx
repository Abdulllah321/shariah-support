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
import { Download } from "lucide-react";
import * as XLSX from "xlsx";

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const rowsPerPage = 10;
  const searchParams = useSearchParams();
  const employeeId = searchParams.get("scholar");

  useEffect(() => {
    setLoading(true); // Set loading to true while fetching data

    let reportsQuery;
    if (employeeId) {
      // If employeeId is found, filter records by employeeId
      reportsQuery = query(
        collection(db, "360Leads"),
        where("creatorId", "==", employeeId)
      );
    } else {
      // Otherwise, fetch all records
      reportsQuery = collection(db, "360Leads");
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
      await deleteDoc(doc(db, "360Leads", id));
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

  const handleExportToExcel = () => {
    try {
      const formattedData = filteredReports.map((record) => ({
        "BM Domain": record.bmDomainId || "N/A",
        "Client Name": record.clientName || "N/A",
        "Client Cell Code": record.clientCellCode || "N/A",
        "Client Cell Number": record.clientCellNumber || "N/A",
        "Client Business Address": record.clientBusinessAddress || "N/A",
        "Client Employer / Business Name":
          record.clientEmployerBusinessName || "N/A",
        "Creator Name": record.creator_name || "N/A",
        "Creator Domain": record.creatorId || "N/A",
        "BM Branch Code": record.bmBranchCode || "N/A",
      }));

      const ws = XLSX.utils.json_to_sheet(formattedData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "360 Leads Report");

      const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
      const blob = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "Daily_Activity_Report.xlsx";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error exporting report:", error);
      alert("Error: Failed to export the report.");
    }
  };

  return (
    <motion.div
      className="mx-auto p-6 w-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-3xl font-semibold text-gray-800 mb-6">
        360 Leads Report
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
        <Button
          onClick={handleExportToExcel}
          color={"warning"}
          className="shadow-secondary bg-teal-800 text-white"
        >
          <Download size={20} className={"mr-2"} /> Export
        </Button>
      </div>

      <motion.div className="overflow-hidden bg-white shadow-lg rounded-lg">
        <div className="overflow-x-auto">
          <table className="w-full table-auto border-collapse">
            <thead className="bg-teal-800 text-white">
              <tr>
                <th className="p-3">#</th>
                {[
                  "Creator Name",
                  "Client Name",
                  "Client Cell No.",
                  "Client Employer / Business Name",
                  "BM Domain",
                ].map((col) => (
                  <th
                    key={col}
                    className="p-3 cursor-pointer"
                    onClick={() => handleSort(col.toLowerCase())}
                  >
                    {col}
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
                    className="hover:bg-teal-100 odd:bg-gray-50 even:bg-white border-t"
                  >
                    <td className="p-3">{index + 1}</td>
                    <td
                      className={`p-3 ${
                        report.creator_name
                          ? "text-gray-800"
                          : "text-gray-400 italic"
                      }`}
                    >
                      {report.creator_name || "N/A"}
                    </td>
                    <td
                      className={`p-3 ${
                        report.clientName
                          ? "text-gray-800"
                          : "text-gray-400 italic"
                      }`}
                    >
                      {report.clientName || "N/A"}
                    </td>
                    <td
                      className={`p-3 ${
                        report.clientCellNumber
                          ? "text-gray-800"
                          : "text-gray-400 italic"
                      }`}
                    >
                      {`${report.clientCellCode} ${report.clientCellNumber}` ||
                        "N/A"}
                    </td>
                    <td
                      className={`p-3 ${
                        report.clientEmployerBusinessName
                          ? "text-gray-800"
                          : "text-gray-400 italic"
                      }`}
                    >
                      {report.clientEmployerBusinessName || "N/A"}
                    </td>
                    <td
                      className={`p-3 ${
                        report.bmDomainId
                          ? "text-gray-800"
                          : "text-gray-400 italic"
                      }`}
                    >
                      {report.bmDomainId || "N/A"}
                    </td>
                    <td className="border px-4 py-2">
                      <div className="flex gap-2">
                        <Button className="bg-blue-700 text-white hover:bg-blue-600 flex items-center gap-1">
                          <MdVisibility size={18} className="mr-2" />
                          <Link
                            href={`/reports/detail/${report.id}?action=360-leads`}
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
