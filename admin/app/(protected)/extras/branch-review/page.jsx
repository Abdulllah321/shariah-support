"use client";

import { useState, useEffect } from "react";
import { db } from "../../../../firebase"; // Your Firebase config file
import {
  collection,
  getDocs,
  doc,
  deleteDoc,
  setDoc,
  orderBy,
  query,
} from "firebase/firestore";
import { Button, Drawer, Label, TextInput, Textarea } from "flowbite-react";
import Loader from "@/components/Loader";
import { TbBuilding } from "react-icons/tb";

const BranchReviewPage = () => {
  const [branches, setBranches] = useState([]);
  const [filteredBranches, setFilteredBranches] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDrawer, setShowDrawer] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [bulkUpload, setBulkUpload] = useState(false);

  const [selectedBranch, setSelectedBranch] = useState(null);
  const [newBranch, setNewBranch] = useState({ name: "" });
  const [bulkBranchNames, setBulkBranchNames] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const fetchBranches = async () => {
    setIsLoading(true);

    // Fetch branches ordered by the 'order' field in ascending order
    const querySnapshot = await getDocs(
      query(collection(db, "branches-review-points"), orderBy("order"))
    );

    const branchesList = [];
    querySnapshot.forEach((doc) => {
      branchesList.push({ id: doc.id, ...doc.data() });
    });

    setBranches(branchesList);
    setFilteredBranches(branchesList);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    if (query === "") {
      setFilteredBranches(branches);
    } else {
      const filtered = branches.filter((branch) =>
        branch.name.toLowerCase().includes(query)
      );
      setFilteredBranches(filtered);
    }
  };

  const handleSaveBranch = async () => {
    if (!newBranch.name.trim()) return; // Validate input

    // Get the next order value if adding a new branch
    let order = 1;
    if (!selectedBranch) {
      // If it's a new branch, fetch the highest current order and increment it
      const querySnapshot = await getDocs(
        collection(db, "branches-review-points")
      );
      if (!querySnapshot.empty) {
        const maxOrder = Math.max(
          ...querySnapshot.docs.map((doc) => doc.data().order || 0)
        );
        order = maxOrder + 1; // Increment the highest order value
      }
    } else {
      // If editing, retain the current order
      order = selectedBranch.order || 1;
    }

    const branchRef = selectedBranch
      ? doc(db, "branches-review-points", selectedBranch.id)
      : doc(db, "branches-review-points", Date.now().toString());

    await setDoc(branchRef, {
      name: newBranch.name,
      order,
    });

    setShowDrawer(false);
    setNewBranch({ name: "", review: "" });
    setSelectedBranch(null);
    fetchBranches();
  };
  const handleBulkUpload = async () => {
    if (!bulkBranchNames.trim()) return; // Validate input

    const branchNames = bulkBranchNames.split(",").map((name) => name.trim());

    // Ensure branches are loaded before calculating maxOrder
    let maxOrder = 0;
    if (branches.length > 0) {
      maxOrder = Math.max(...branches.map((doc) => doc.order || 0));
    }

    // Set order to the maxOrder + 1 for the new branches
    const order = maxOrder + 1;

    // Create an array of promises with an order field to maintain sequence
    const batchPromises = branchNames.map((name, index) => {
      const branchRef = doc(
        db,
        "branches-review-points",
        Date.now().toString() + Math.random()
      );
      return setDoc(branchRef, {
        name,
        review: "",
        order: order + index, // Assign order starting from maxOrder + 1
      });
    });

    await Promise.all(batchPromises);

    setShowDrawer(false);
    setBulkBranchNames("");
    fetchBranches();
  };

  const handleDelete = async () => {
    if (selectedBranch) {
      await deleteDoc(doc(db, "branches-review-points", selectedBranch.id));
      setShowModal(false); // Close modal after deletion
      setSelectedBranch(null); // Reset selected branch
      fetchBranches(); // Re-fetch branches after deletion
    }
  };

  return (
    <div className="mx-auto p-6 w-full">
      <h1 className="text-3xl font-semibold text-gray-800 mb-6">
        Branch Review Management
      </h1>

      <div className="flex flex-wrap justify-center sm:justify-between items-center gap-4">
      <Button
          onClick={() => {
            setShowDrawer(true);
            setNewBranch({ name: "", review: "" });
            setSelectedBranch(null);
            setBulkUpload(false);
          }}
          className="bg-teal-600 text-white hover:bg-teal-700 w-full md:w-auto"
        >
          Add New Branch Review Point
        </Button>

        <form className="w-[28rem] mx-auto max-w-full">
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
              placeholder="Search Branches Review Points ..."
              value={searchQuery}
              onChange={handleSearch}
            />
          </div>
        </form>

        <Button
          onClick={() => {
            setShowDrawer(true);
            setBulkUpload(true);
            setBulkBranchNames("");
          }}
          className="md:ml-4 bg-cyan-600 text-white hover:bg-cyan-700 md:w-auto w-full "
        >
          Bulk Upload Branches
        </Button>
      </div>

      {isLoading ? (
        <Loader />
      ) : (
        <div className="mt-6 bg-white shadow rounded-lg mx-auto w-full overflow-x-auto">
          <table className="w-full divide-y divide-gray-200">
            <thead className="bg-gray-950">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider w-[10%]">
                  Sr. no
                </th>

                <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">
                  Review Points
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider w-[10%]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredBranches.length ? (
                filteredBranches.map((branch, index) => (
                  <tr key={branch.id} className="odd:bg-white even:bg-gray-50">
                    <td className="px-6 py-4 text-right"># {index + 1}</td>

                    <td className="px-6 py-4">{branch.name}</td>
                    <td className="px-6 py-4 flex space-x-2">
                      <Button
                        onClick={() => {
                          setSelectedBranch(branch);
                          setNewBranch(branch);
                          setShowDrawer(true);
                        }}
                        className="bg-teal-600 text-white"
                      >
                        Edit
                      </Button>
                      <Button
                        onClick={() => {
                          setSelectedBranch(branch);
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
                    colSpan="4"
                    className="text-center py-4 text-gray-400 font-bold"
                  >
                    No branches found
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
              ? "Bulk Upload Branches"
              : selectedBranch
              ? "Edit Branch"
              : "Add New Branch"
          }
          titleIcon={TbBuilding}
        />

        <Drawer.Items className="space-y-6">
          {bulkUpload ? (
            <div>
              <Label
                htmlFor="bulkBranchNames"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Branch Review Points (comma-separated)
              </Label>
              <Textarea
                id="bulkBranchNames"
                value={bulkBranchNames}
                placeholder="Enter branch review points separated by commas"
                onChange={(e) => setBulkBranchNames(e.target.value)}
              />
            </div>
          ) : (
            <div>
              <Label
                htmlFor="review"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Branch Review Point
              </Label>
              <TextInput
                id="name"
                value={newBranch.name}
                placeholder="Enter branch review point"
                onChange={(e) =>
                  setNewBranch({ ...newBranch, name: e.target.value })
                }
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
            onClick={bulkUpload ? handleBulkUpload : handleSaveBranch}
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
              <p>Are you sure you want to delete this Point?</p>
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

export default BranchReviewPage;
