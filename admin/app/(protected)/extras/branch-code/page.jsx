"use client";
import React, { useEffect, useMemo, useState } from "react";
import { db } from "../../../../firebase"; // Your Firebase config file
import {
  collection,
  getDocs,
  doc,
  deleteDoc,
  setDoc,
  writeBatch,
} from "firebase/firestore";
import { Button, Drawer, Label, TextInput } from "flowbite-react";
import { HiBuildingOffice } from "react-icons/hi2"; // Icon for branch
import Loader from "@/components/Loader";
import Papa from "papaparse";

export const theme = {
  root: {
    base: "fixed z-40 overflow-y-auto bg-white p-4 transition-transform dark:bg-gray-800",
    backdrop: "fixed inset-0 z-30 bg-gray-900/50 dark:bg-gray-900/80",
    position: {
      right: {
        on: "right-0 top-0 h-screen w-80 transform-none",
        off: "right-0 top-0 h-screen w-80 translate-x-full",
      },
    },
  },
  header: {
    inner: {
      closeButton:
        "absolute end-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-lg bg-transparent text-sm text-gray-400 hover:bg-gray-200 hover:text-gray-900 dark:hover:bg-gray-600 dark:hover:text-white",
      closeIcon: "h-4 w-4",
      titleText:
        "mb-4 inline-flex items-center text-base font-semibold text-gray-500 dark:text-gray-400",
    },
  },
};

const BranchManagement = () => {
  const [branches, setBranches] = useState([]);
  const [showDrawer, setShowDrawer] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [newBranch, setNewBranch] = useState({
    branchCode: "",
    branchName: "",
    rgmName: "",
    region: "",
    city: "",
    area: "",
  });
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(10); // Rows per page
  const [searchQuery, setSearchQuery] = useState("");

  const filteredBranches = useMemo(() => {
    return branches.filter(
      (branch) =>
        branch.branchCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        branch.branchName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        branch.rgmName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        branch.region.toLowerCase().includes(searchQuery.toLowerCase()) ||
        branch.area.toLowerCase().includes(searchQuery.toLowerCase()) ||
        branch.city.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [branches, searchQuery]);

  // Pagination logic
  const totalPages = Math.ceil(filteredBranches.length / rowsPerPage);
  const paginatedBranches = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return filteredBranches.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredBranches, currentPage, rowsPerPage]);

  // Handlers
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };
  const handlePageChange = (page) => setCurrentPage(page);
  const fetchBranches = async () => {
    setLoading(true);
    const querySnapshot = await getDocs(collection(db, "branches"));
    const branchList = [];
    querySnapshot.forEach((doc) => {
      branchList.push({ id: doc.id, ...doc.data() });
    });
    setBranches(branchList);
    setLoading(false);
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  const handleSaveBranch = async () => {
    const { branchCode, branchName, area, rgmName, region } = newBranch;
    if (!branchCode || !branchName || !area || !rgmName || !region) return;

    if (selectedBranch) {
      await setDoc(doc(db, "branches", selectedBranch), newBranch);
    } else {
      await setDoc(doc(db, "branches", Date.now().toString()), newBranch);
    }

    setShowDrawer(false);
    setNewBranch({
      branchCode: "",
      branchName: "",
      area: "",
      rgmName: "",
      region: "",
      city: "",
    });
    setSelectedBranch(null);
    fetchBranches();
  };

  const handleDelete = async () => {
    if (selectedBranch) {
      await deleteDoc(doc(db, "branches", selectedBranch));
      setShowModal(false);
      setSelectedBranch(null);
      fetchBranches();
    }
  };

  const handleBulkUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const bulkData = results.data;

        try {
          const batchSize = 500; // Firestore batch limit
          for (let i = 0; i < bulkData.length; i += batchSize) {
            const batch = writeBatch(db); // Initialize a new batch
            const chunk = bulkData.slice(i, i + batchSize); // Get the current chunk

            chunk.forEach((branch) => {
              const docRef = doc(collection(db, "branches")); // Auto-generate a unique ID
              batch.set(docRef, branch);
            });

            await batch.commit(); // Commit the current batch
          }

          fetchBranches(); // Refresh the branches after successful upload
          alert("Bulk upload successful!");
        } catch (error) {
          console.error("Error during bulk upload:", error);
          alert("An error occurred during the bulk upload. Please try again.");
        }
      },
    });
  };

  return (
    <div className="mx-auto p-6 w-full">
      <h1 className="text-3xl font-semibold text-gray-800 mb-6">
        Branch Management
      </h1>

      <div className="flex items-center gap-4 mb-6 justify-between lg:flex-nowrap flex-wrap">
        <label className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-200 w-full lg:w-auto text-center">
          Bulk Upload
          <input
            type="file"
            accept=".csv"
            onChange={handleBulkUpload}
            className="hidden"
          />
        </label>
        <form className="w-[28rem] mx-auto mb-4 max-w-full">
          <div className="relative">
            <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
              <svg
                className="w-4 h-4 text-gray-500 dark:text-gray-400"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 20 20"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                />
              </svg>
            </div>
            <input
              type="search"
              id="default-search"
              className="block w-full p-4 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-teal-500 focus:border-teal-500"
              placeholder="Search Branches..."
              value={searchQuery}
              onChange={handleSearch}
            />
          </div>
        </form>

        <Button
          onClick={() => {
            setShowDrawer(true);
            setNewBranch({
              branchCode: "",
              branchName: "",
              area: "",
              rgmName: "",
              region: "",
              city: "",
            });
            setSelectedBranch(null);
          }}
          className="bg-teal-600 text-white rounded-md hover:bg-teal-700 transition duration-200 w-full lg:w-auto text-center"
        >
          Add New Branch
        </Button>
      </div>

      <div
        className="bg-white shadow rounded-lg  mx-auto p-4 
[&::-webkit-scrollbar]:h-2
[&::-webkit-scrollbar-track]:rounded-full
[&::-webkit-scrollbar-track]:bg-gray-100
[&::-webkit-scrollbar-track]:cursor-pointer
[&::-webkit-scrollbar-thumb]:rounded-full
[&::-webkit-scrollbar-thumb]:bg-gray-300
dark:[&::-webkit-scrollbar-track]:bg-teal-700
dark:[&::-webkit-scrollbar-thumb]:bg-teal-500 overflow-auto"
      >
        {!loading && (
          <>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Serial No.
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Branch Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Branch Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    RGM Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Region
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Area
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    City
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedBranches.length ? (
                  paginatedBranches.map((branch, index) => (
                    <tr key={branch.id}>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {(currentPage - 1) * rowsPerPage + index + 1}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {branch.branchCode}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {branch.branchName}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {branch.rgmName}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {branch.region}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {branch.area}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {branch.city}
                      </td>
                      <td className="px-6 py-4 flex gap-2">
                        <Button
                          onClick={() => {
                            setSelectedBranch(branch.id);
                            setNewBranch(branch);
                            setShowDrawer(true);
                          }}
                          className="text-teal-600 hover:text-teal-900"
                        >
                          Edit
                        </Button>
                        <Button
                          onClick={() => {
                            setSelectedBranch(branch.id);
                            setShowModal(true);
                          }}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="7"
                      className="text-center py-6 text-sm text-gray-500"
                    >
                      No branches found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            {/* Pagination */}
            <div className="flex flex-col justify-center items-center mt-4 gap-2">
              {/* Showing results out of total branches */}
              <div className="text-sm text-gray-600">
                Showing{" "}
                <span className="font-medium">
                  {Math.min(
                    (currentPage - 1) * rowsPerPage + 1,
                    filteredBranches.length
                  )}
                </span>{" "}
                to{" "}
                <span className="font-medium">
                  {Math.min(currentPage * rowsPerPage, filteredBranches.length)}
                </span>{" "}
                of <span className="font-medium">{filteredBranches.length}</span>{" "}
                branches
              </div>

              {/* Pagination Controls */}
              <div className="flex justify-center items-center gap-2">
                {/* Previous Button */}
                <Button
                  disabled={currentPage === 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                  className={` ${
                    currentPage === 1
                      ? "bg-gray-300"
                      : "bg-teal-500 text-white hover:bg-teal-600"
                  }`}
                >
                  Previous
                </Button>

                {/* Dynamic Page Buttons */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((page) => {
                      if (page === 1 || page === totalPages) return true;
                      if (page >= currentPage - 2 && page <= currentPage + 2)
                        return true;
                      return false;
                    })
                    .map((page, index, arr) => (
                      <React.Fragment key={page}>
                        {/* Show ellipses */}
                        {index > 0 && arr[index - 1] !== page - 1 && (
                          <span className="text-gray-500">...</span>
                        )}
                        <Button
                          onClick={() => handlePageChange(page)}
                          className={` rounded ${
                            page === currentPage
                              ? "bg-teal-500 text-white"
                              : "bg-gray-200 hover:bg-teal-200"
                          }`}
                        >
                          {page}
                        </Button>
                      </React.Fragment>
                    ))}
                </div>

                {/* Next Button */}
                <Button
                  disabled={currentPage === totalPages}
                  onClick={() => handlePageChange(currentPage + 1)}
                  className={` ${
                    currentPage === totalPages
                      ? "bg-gray-300"
                      : "bg-teal-500 text-white hover:bg-teal-600"
                  }`}
                >
                  Next
                </Button>

                {/* Jump to Page Input */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Jump to:</span>
                  <input
                    type="number"
                    min="1"
                    max={totalPages}
                    className="w-16 px-2 py-1 border border-gray-300 rounded focus:ring-teal-500 focus:border-teal-500 text-center"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        const page = parseInt(e.target.value, 10);
                        if (page >= 1 && page <= totalPages) {
                          handlePageChange(page);
                        }
                      }
                    }}
                    placeholder={currentPage}
                  />
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {loading && <Loader />}

      <Drawer
        open={showDrawer}
        onClose={() => setShowDrawer(false)}
        size="lg"
        position="right"
        className={theme.root.base}
      >
        <Drawer.Header
          title={selectedBranch ? "Edit Branch" : "Add New Branch"}
          titleIcon={HiBuildingOffice}
          className={theme.header.inner.titleText}
        />
        <Drawer.Items>
          {Object.keys(newBranch).map((key) => (
            <div key={key} className="mb-6">
              <Label htmlFor={key} className="mb-2 block capitalize">
                {key.replace(/([A-Z])/g, " $1")}
              </Label>
              <TextInput
                id={key}
                placeholder={`Enter ${key}`}
                value={newBranch[key]}
                onChange={(e) =>
                  setNewBranch({ ...newBranch, [key]: e.target.value })
                }
              />
            </div>
          ))}
          <Button
            onClick={handleSaveBranch}
            className="w-full bg-teal-600 text-white"
          >
            {selectedBranch ? "Update Branch" : "Add Branch"}
          </Button>
        </Drawer.Items>
      </Drawer>

      {showModal && (
        <>
          <div className="fixed inset-0 bg-gray-900/50 z-40" />
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-lg z-50">
            <h3 className="text-xl font-semibold text-gray-800">
              Confirm Deletion
            </h3>
            <p className="text-gray-600 mt-2">
              Are you sure you want to delete this branch?
            </p>
            <div className="flex justify-end mt-4 gap-2">
              <Button
                onClick={() => setShowModal(false)}
                className="bg-gray-300 text-gray-700"
              >
                Cancel
              </Button>
              <Button onClick={handleDelete} className="bg-red-600 text-white">
                Delete
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default BranchManagement;
