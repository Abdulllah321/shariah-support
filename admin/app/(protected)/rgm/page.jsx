"use client";

import { useState, useEffect } from "react";
import { db } from "../../../firebase"; // Your Firebase config file
import {
  collection,
  getDocs,
  doc,
  deleteDoc,
  setDoc,
} from "firebase/firestore";
import { Button, Drawer, Label, TextInput, Textarea } from "flowbite-react";
import Loader from "@/components/Loader";
import { TbMap2 } from "react-icons/tb";

const RgmsPage = () => {
  const [Rgms, setRgms] = useState([]);
  const [filteredRgms, setFilteredRgms] = useState([]);
  const [showDrawer, setShowDrawer] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [bulkUpload, setBulkUpload] = useState(false);

  const [selectedRgm, setSelectedRgm] = useState(null);
  const [newRgm, setNewRgm] = useState({ name: "" });
  const [bulkRgmNames, setBulkRgmNames] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const fetchRgms = async () => {
    setIsLoading(true);
    const querySnapshot = await getDocs(collection(db, "Rgms"));
    const RgmsList = [];
    querySnapshot.forEach((doc) => {
      RgmsList.push({ id: doc.id, ...doc.data() });
    });
    setRgms(RgmsList);
    setFilteredRgms(RgmsList); // Initially show all Rgms
    setIsLoading(false);
  };

  useEffect(() => {
    fetchRgms();
  }, []);

  // Handle save (add/update) Rgm
  const handleSaveRgm = async () => {
    if (!newRgm.name.trim()) return; // Validate input
    const RgmRef = selectedRgm
      ? doc(db, "Rgms", selectedRgm.id)
      : doc(db, "Rgms", Date.now().toString());
    await setDoc(RgmRef, { name: newRgm.name });

    setShowDrawer(false);
    setNewRgm({ name: "" });
    setSelectedRgm(null);
    fetchRgms();
  };

  // Handle bulk upload
  const handleBulkUpload = async () => {
    if (!bulkRgmNames.trim()) return; // Validate input
    const RgmNames = bulkRgmNames.split(",").map((name) => name.trim());
    const batchPromises = RgmNames.map((name) => {
      const RgmRef = doc(db, "Rgms", Date.now().toString() + Math.random());
      return setDoc(RgmRef, { name });
    });
    await Promise.all(batchPromises);

    setShowDrawer(false);
    setBulkRgmNames("");
    fetchRgms();
  };

  const handleDelete = async () => {
    if (selectedRgm) {
      await deleteDoc(doc(db, "Rgms", selectedRgm.id));
      setShowModal(false); // Close modal after deletion
      setSelectedRgm(null); // Reset selected Rgm
      fetchRgms(); // Re-fetch Rgms after deletion
    }
  };

  return (
    <div className="mx-auto p-6 w-full">
      <h1 className="text-3xl font-semibold text-gray-800 mb-6">
        Regional Managers Management
      </h1>

      <div className="flex justify-between items-center">
        {/* Add New Rgm Button */}
        <Button
          onClick={() => {
            setShowDrawer(true);
            setNewRgm({ name: "" });
            setSelectedRgm(null);
            setBulkUpload(false);
          }}
          className="bg-teal-600 text-white hover:bg-teal-700"
        >
          Add New Rgm
        </Button>

        <form className="w-[28rem] mx-auto">
          <label
            htmlFor="default-search"
            className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white"
          >
            Search
          </label>
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
              className="block w-full p-4 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-teal-500 dark:focus:border-teal-500"
              placeholder="Search Rgms ..."
              required
              onChange={(e) => {
                const searchQuery = e.target.value.toLowerCase();
                if (searchQuery === "") {
                  setFilteredRgms(Rgms);
                } else {
                  const filtered = Rgms.filter((Rgm) =>
                    Rgm.name.toLowerCase().includes(searchQuery)
                  );
                  setFilteredRgms(filtered);
                }
              }}
            />
          </div>
        </form>

        <Button
          onClick={() => {
            setShowDrawer(true);
            setBulkUpload(true);
            setBulkRgmNames("");
          }}
          className="ml-4 bg-cyan-600 text-white hover:bg-cyan-700"
        >
          Bulk Upload Rgms
        </Button>
      </div>

      {/* Rgms Table */}
      {isLoading ? (
        <Loader />
      ) : (
        <div className="mt-6 bg-white shadow rounded-lg mx-auto w-full">
          <table className="w-full divide-y divide-gray-200 table-stipe">
            <thead className="bg-gray-950">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider w-[10%]">
                  Sr. no
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider w-[10%]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredRgms.length ? (
                filteredRgms.map((Rgm, index) => (
                  <tr
                    key={Rgm.id}
                    className="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50"
                  >
                    <td className="px-6 py-4 text-right"># {index + 1}</td>
                    <td className="px-6 py-4">{Rgm.name}</td>
                    <td className="px-6 py-4 flex space-x-2">
                      <Button
                        onClick={() => {
                          setSelectedRgm(Rgm);
                          setNewRgm(Rgm);
                          setShowDrawer(true);
                        }}
                        className="bg-teal-600 text-white"
                      >
                        Edit
                      </Button>
                      <Button
                        onClick={() => {
                          setSelectedRgm(Rgm);
                          setShowModal(true);
                        }}
                        className="bg-red-600 text-white"
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="3"
                    className="text-center py-4 text-gray-400 font-bold"
                  >
                    No RGMs found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit Modal */}
      <Drawer
        open={showDrawer}
        onClose={() => setShowDrawer(false)}
        size="lg"
        position="right"
      >
        <Drawer.Header
          title={
            bulkUpload
              ? "Bulk Upload Rgms"
              : selectedRgm
              ? "Edit Rgm"
              : "Add New Rgm"
          }
          titleIcon={TbMap2}
        />

        <Drawer.Items className="space-y-6">
          {bulkUpload ? (
            <div>
              <Label
                htmlFor="bulkRgmNames"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                RGM Names (comma-separated)
              </Label>
              <Textarea
                id="bulkRgmNames"
                value={bulkRgmNames}
                placeholder="Enter Rgm names separated by commas"
                onChange={(e) => setBulkRgmNames(e.target.value)}
              />
            </div>
          ) : (
            <div>
              <Label
                htmlFor="name"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                RGM Name
              </Label>
              <TextInput
                shadow
                id="name"
                value={newRgm.name}
                placeholder="Enter Rgm name"
                onChange={(e) => setNewRgm({ ...newRgm, name: e.target.value })}
              />
            </div>
          )}
        </Drawer.Items>

        <div className="mt-6 flex justify-end space-x-2 absolute bottom-4 w-[calc(100%-2rem)]">
          <Button
            onClick={() => setShowDrawer(false)}
            className="bg-gray-300 text-gray-700 hover:bg-gray-400"
          >
            Cancel
          </Button>
          <Button
            onClick={bulkUpload ? handleBulkUpload : handleSaveRgm}
            className="flex-1 bg-teal-600 text-white hover:bg-teal-700"
          >
            Save
          </Button>
        </div>
      </Drawer>

      {showModal && (
        <>
          <div
            className="fixed inset-0 z-40 bg-gray-900/50"
            onClick={() => setShowModal(false)}
          />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg p-6 mx-auto my-16 bg-white rounded-lg shadow-lg">
            <div className="text-center text-xl font-semibold text-gray-800">
              Confirm Deletion
            </div>
            <div className="text-center text-gray-600">
              <p>Are you sure you want to delete this RGM?</p>
            </div>
            <div className="flex justify-center space-x-4 mt-4">
              <Button
                onClick={() => setShowModal(false)}
                className="bg-gray-300 text-gray-700 hover:bg-gray-400"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDelete}
                className="bg-red-600 text-white hover:bg-red-700"
              >
                Delete
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default RgmsPage;
