"use client";
import { useEffect, useState } from "react";
import { db } from "../../../firebase"; // Your Firebase config file
import {
  collection,
  getDocs,
  doc,
  deleteDoc,
  setDoc,
} from "firebase/firestore";
import { Button, Drawer, Label, TextInput } from "flowbite-react";
import { HiUser } from "react-icons/hi"; // Assuming you're using React Icons for icons
import Loader from "@/components/Loader";
import { useRouter } from "next/navigation";

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
const ScholarsPage = () => {
  const [scholars, setScholars] = useState([]);
  const [showDrawer, setShowDrawer] = useState(false); // Drawer state
  const [showModal, setShowModal] = useState(false); // Delete confirmation modal state
  const [selectedScholar, setSelectedScholar] = useState(null); // For edit and delete
  const [newScholar, setNewScholar] = useState(""); // For adding new scholar
  const [newEmployeeId, setNewEmployeeId] = useState(""); // For adding or editing employee ID
  const [loading, setLoading] = useState(true); // Loading state for fetching data
  const router = useRouter();

  // Fetch scholars from Firestore
  const fetchScholars = async () => {
    setLoading(true); // Set loading to true when starting to fetch
    const querySnapshot = await getDocs(collection(db, "scholars"));
    const scholarsList = [];
    querySnapshot.forEach((doc) => {
      scholarsList.push({
        id: doc.id,
        name: doc.data().name,
        employeeId: doc.data().employeeId,
      });
    });

    setScholars(scholarsList);
    setLoading(false);
  };

  useEffect(() => {
    fetchScholars();
  }, []);

  // Handle adding or updating scholar
  const handleSaveScholar = async () => {
    if (!newScholar.trim() || !newEmployeeId.trim()) return; // Validate inputs

    if (selectedScholar) {
      // Update existing scholar
      await setDoc(doc(db, "scholars", selectedScholar), {
        name: newScholar,
        employeeId: newEmployeeId,
      });
    } else {
      // Add new scholar
      await setDoc(doc(db, "scholars", Date.now().toString()), {
        name: newScholar,
        employeeId: newEmployeeId,
      });
    }

    setShowDrawer(false);
    setNewScholar("");
    setNewEmployeeId(""); // Clear input
    setSelectedScholar(null);
    fetchScholars();
  };

  // Handle scholar deletion
  const handleDelete = async () => {
    if (selectedScholar) {
      await deleteDoc(doc(db, "scholars", selectedScholar));
      setShowModal(false); // Close modal after deletion
      setSelectedScholar(null); // Reset selected scholar
      fetchScholars(); // Re-fetch scholars after deletion
    }
  };

  return (
    <div className="mx-auto p-6 w-full">
      <h1 className="text-3xl font-semibold text-gray-800 mb-6">
        Scholars Management
      </h1>

      {/* Add New Scholar Button */}
      <Button
        onClick={() => {
          setShowDrawer(true); // Open drawer for adding new scholar
          setNewScholar(""); // Clear input field
          setSelectedScholar(null); // Reset selected scholar for adding
        }}
        className=" bg-teal-600 text-white rounded-md hover:bg-teal-700 transition duration-200 mb-6"
      >
        Add New Scholar
      </Button>

      {/* Scholars Table */}
      <div className="overflow-hidden bg-white shadow rounded-lg w-full mx-auto">
        {!loading && (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Serial No.
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[20%]">
                  Employee ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[10%]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {scholars.length ? (
                scholars.map((scholar, index) => (
                  <tr key={scholar.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 w-[10%]">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {scholar.employeeId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 ">
                      {scholar.name}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex ">
                      <Button
                        onClick={() => {
                          router.push(`/reports/daily?scholar=${scholar.employeeId}`);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View Reports
                      </Button>
                      <Button
                        onClick={() => {
                          setSelectedScholar(scholar.id); // Set the selected scholar for editing
                          setNewScholar(scholar.name); // Pre-fill name
                          setNewEmployeeId(scholar.employeeId); // Pre-fill employee ID
                          setShowDrawer(true); // Open drawer for editing
                        }}
                        className="text-teal-600 hover:text-teal-900 ml-4"
                      >
                        Edit
                      </Button>
                      <Button
                        onClick={() => {
                          setSelectedScholar(scholar.id); // Set the selected scholar for deletion
                          setShowModal(true); // Open delete confirmation modal
                        }}
                        className="text-red-600 hover:text-red-900 ml-4"
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr className="text-center">
                  <td colSpan="4" className="py-6 text-sm text-gray-500">
                    No scholars found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Loading Spinner */}
      {loading && <Loader />}

      {/* Add/Edit Drawer */}
      <Drawer
        open={showDrawer}
        onClose={() => setShowDrawer(false)}
        size="lg"
        position="right"
        className={theme.root.base}
      >
        <Drawer.Header
          title={selectedScholar ? "Edit Scholar" : "Add New Scholar"}
          titleIcon={HiUser}
          className={theme.header.inner.titleText}
        />
        <Drawer.Items>
          <div className="mb-6 mt-3">
            <Label htmlFor="scholarName" className="mb-2 block">
              Scholar Name
            </Label>
            <TextInput
              id="scholarName"
              placeholder="Enter scholar name"
              value={newScholar}
              onChange={(e) => setNewScholar(e.target.value)}
            />
          </div>
          <div className="mb-6 mt-3">
            <Label htmlFor="employeeId" className="mb-2 block">
              Employee ID
            </Label>
            <TextInput
              id="employeeId"
              placeholder="Enter employee ID"
              value={newEmployeeId}
              onChange={(e) => setNewEmployeeId(e.target.value)}
            />
          </div>

          <Button
            onClick={handleSaveScholar}
            className="w-full bg-teal-600 text-white"
          >
            {selectedScholar ? "Update Scholar" : "Add Scholar"}
          </Button>
        </Drawer.Items>
      </Drawer>

      {/* Custom Animated Delete Confirmation Modal */}
      {showModal && (
        <>
          <div className="fixed inset-0 z-40 bg-gray-900/50 dark:bg-gray-900/80" />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg p-6 mx-auto my-16 bg-white rounded-lg shadow-lg transform scale-95 transition-all duration-300 ease-out sm:max-w-md sm:rounded-xl sm:scale-100">
            <div className="text-center text-xl font-semibold text-gray-800">
              Confirm Deletion
            </div>
            <div className="text-center text-gray-600">
              <p>Are you sure you want to delete this scholar?</p>
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

export default ScholarsPage;
