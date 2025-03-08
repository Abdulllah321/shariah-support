"use client";

import {useState, useEffect} from "react";
import {db} from "../../../../firebase"; // Your Firebase config file
import {
    collection,
    getDocs,
    doc,
    deleteDoc,
    setDoc,
    updateDoc, orderBy, query
} from "firebase/firestore";
import {Button, Drawer, Label, TextInput, Textarea} from "flowbite-react";
import Loader from "@/components/Loader";
import {TbBuilding} from "react-icons/tb";
import {motion} from "framer-motion";
import Papa from "papaparse"; // Import PapaParse
import {DndContext, closestCenter} from "@dnd-kit/core";
import {
    SortableContext,
    verticalListSortingStrategy,
    arrayMove,
} from "@dnd-kit/sortable";
import SortableItem from "@/components/SortableItem";

const StaffInterviewPage = () => {
    const [staff, setStaff] = useState([]);
    const [filteredStaff, setFilteredStaff] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [showDrawer, setShowDrawer] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [bulkUpload, setBulkUpload] = useState(false);

    const [selectedStaff, setSelectedStaff] = useState(null);
    const [newStaff, setNewStaff] = useState({question: ""});
    const [bulkStaffNames, setBulkStaffNames] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const fetchStaff = async () => {
        setIsLoading(true);
        const staffQuery = query(collection(db, "sQuestion"), orderBy("order", "asc"));

        const querySnapshot = await getDocs(staffQuery);
        const staffList = [];
        querySnapshot.forEach((doc) => {
            staffList.push({id: doc.id, ...doc.data()});
        });

        // Order کے مطابق sort کریں
        staffList.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

        setStaff(staffList);
        setFilteredStaff(staffList);
        setIsLoading(false);
    };


    useEffect(() => {
        fetchStaff();
    }, []);

    const handleSearch = (e) => {
        const query = e.target.value.toLowerCase();
        setSearchQuery(query);

        if (query === "") {
            setFilteredStaff(staff);
        } else {
            const filtered = staff.filter((person) =>
                person.question.toLowerCase().includes(query)
            );
            setFilteredStaff(filtered);
        }
    };

    const highlightText = (text, query) => {
        if (!query) return text;
        const parts = text.split(new RegExp(`(${query})`, "gi"));
        return parts.map((part, index) =>
                part.toLowerCase() === query.toLowerCase() ? (
                    <span key={index} className="bg-yellow-200">
          {part}
        </span>
                ) : (
                    part
                )
        );
    };

    const handleSaveStaff = async () => {
        if (!newStaff.question.trim()) return; // Validate input
        const staffRef = selectedStaff
            ? doc(db, "sQuestion", selectedStaff.id)
            : doc(db, "sQuestion", Date.now().toString());
        await setDoc(staffRef, {question: newStaff.question});

        setShowDrawer(false);
        setNewStaff({question: ""});
        setSelectedStaff(null);
        fetchStaff();
    };

    const handleBulkUpload = async (e) => {
        if (!e.target.files || e.target.files.length === 0) return;

        const file = e.target.files[0];

        // Parse the CSV file using PapaParse
        Papa.parse(file, {
            complete: async (result) => {
                const data = result.data;

                // Assuming the "Question" column exists in the CSV
                const questions = data.map((row) => row.Question).filter(Boolean); // Filter out empty questions

                if (questions.length === 0) {
                    alert("No questions found in the file.");
                    return;
                }

                const batchPromises = questions.map((question) => {
                    const staffRef = doc(
                        db,
                        "sQuestion",
                        Date.now().toString() + Math.random()
                    );
                    return setDoc(staffRef, {question: question});
                });

                await Promise.all(batchPromises);

                setShowDrawer(false);
                setBulkStaffNames("");
                fetchStaff();
            },
            header: true, // Assume the first row contains headers
            skipEmptyLines: true, // Skip empty lines in the CSV
        });
    };

    const handleDelete = async () => {
        if (selectedStaff) {
            await deleteDoc(doc(db, "sQuestion", selectedStaff.id));
            setShowModal(false); // Close modal after deletion
            setSelectedStaff(null); // Reset selected staff
            fetchStaff(); // Re-fetch staff after deletion
        }
    };

    const handleDragEnd = async (event) => {
        const {active, over} = event;
        if (!over || active.id === over.id) return;

        const oldIndex = staff.findIndex((item) => item.id === active.id);
        const newIndex = staff.findIndex((item) => item.id === over.id);

        const reorderedStaff = arrayMove(staff, oldIndex, newIndex);

        // Update state immediately for a smooth UI experience
        setStaff([...reorderedStaff]);

        // Update Firestore order
        await Promise.all(
            reorderedStaff.map((item, index) =>
                updateDoc(doc(db, "sQuestion", item.id), {order: index})
            )
        );

        // Ensure state is in sync after Firestore update
        setStaff([...reorderedStaff]);
    };


    return (
        <div className="mx-auto p-6 w-full">
            <h1 className="text-3xl font-semibold text-gray-800 mb-6">
                Staff Interview Management
            </h1>

            <div className="flex justify-between items-center">
                <Button
                    onClick={() => {
                        setShowDrawer(true);
                        setNewStaff({question: ""});
                        setSelectedStaff(null);
                        setBulkUpload(false);
                    }}
                    className="bg-teal-600 text-white hover:bg-teal-700"
                >
                    Add New Staff
                </Button>

                <form className="w-[28rem] mx-auto">
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
                            placeholder="Search Staff ..."
                            value={searchQuery}
                            onChange={handleSearch}
                        />
                    </div>
                </form>

                <Button
                    onClick={() => setBulkUpload(true)}
                    className="ml-4 bg-cyan-600 text-white hover:bg-cyan-700"
                >
                    Bulk Upload Staff
                </Button>

                {bulkUpload && (
                    <motion.div
                        className="flex justify-center items-center min-h-screen fixed top-0 left-0 z-50 bg-black bg-opacity-50 w-full h-full"
                        initial={{opacity: 0, scale: 0.8}}
                        animate={{opacity: 1, scale: 1}}
                        exit={{opacity: 0, scale: 0.8}}
                        transition={{duration: 0.3}}
                    >
                        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
                            <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">
                                Upload CSV File
                            </h2>

                            <Label
                                htmlFor="bulkUploadFile"
                                className="mb-2 block text-sm font-medium text-gray-700"
                            >
                                Choose a file to upload
                            </Label>

                            <input
                                type="file"
                                id="bulkUploadFile"
                                accept=".csv"
                                onChange={handleBulkUpload}
                                className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-teal-500 focus:border-teal-500 mb-4"
                            />

                            <Button
                                onClick={() => setBulkUpload(false)}
                                className="w-full bg-gray-300 text-gray-700 hover:bg-gray-400"
                            >
                                Cancel
                            </Button>
                        </div>
                    </motion.div>
                )}
            </div>

            {isLoading ? (
                <Loader/>
            ) : (
                <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={staff.map((s) => s.id)} strategy={verticalListSortingStrategy}>
                        <div className="mt-6 bg-white shadow rounded-lg mx-auto w-full">
                            <table className="w-full divide-y divide-gray-200">
                                <thead className="bg-gray-950">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider w-[10%]">
                                        Sr. No
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">
                                        Questions
                                    </th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                {staff.length ? (
                                    staff.map((person, index) => (
                                        <SortableItem key={person.id} id={person.id}>
                                            <td className={'px-6 py-4 text-right'}>#{person.order + 1}</td>
                                            <td className={'px-6 py-4 '}>{person.question}</td>
                                        </SortableItem>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="3" className="text-center py-4 text-gray-400 font-bold">
                                            No staff found
                                        </td>
                                    </tr>
                                )}
                                </tbody>
                            </table>
                        </div>
                    </SortableContext>
                </DndContext>
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
                            ? "Bulk Upload Staff"
                            : selectedStaff
                                ? "Edit Staff"
                                : "Add New Staff"
                    }
                    titleIcon={TbBuilding}
                />

                <Drawer.Items className="space-y-6">
                    {bulkUpload ? (
                        <div>
                            <Label
                                htmlFor="bulkStaffNames"
                                className="mb-2 block text-sm font-medium text-gray-700"
                            >
                                Staff Questions (comma-separated)
                            </Label>
                            <Textarea
                                id="bulkStaffNames"
                                value={bulkStaffNames}
                                placeholder="Enter staff questions separated by commas"
                                onChange={(e) => setBulkStaffNames(e.target.value)}
                            />
                        </div>
                    ) : (
                        <div>
                            <Label
                                htmlFor="name"
                                className="mb-2 block text-sm font-medium text-gray-700"
                            >
                                Staff Questions
                            </Label>
                            <TextInput
                                shadow
                                id="name"
                                value={newStaff.question}
                                placeholder="Enter staff questions"
                                onChange={(e) =>
                                    setNewStaff({...newStaff, question: e.target.value})
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
                        onClick={bulkUpload ? handleBulkUpload : handleSaveStaff}
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
                    <div
                        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg p-6 mx-auto my-16 bg-white rounded-lg shadow-lg">
                        <div className="text-center text-xl font-semibold text-gray-800">
                            Confirm Deletion
                        </div>
                        <div className="text-center text-gray-600">
                            <p>Are you sure you want to delete this staff questions?</p>
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

export default StaffInterviewPage;
