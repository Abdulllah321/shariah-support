"use client";

import { useState, useEffect } from "react";
import { db } from "../../../../firebase"; // Your Firebase config file
import {
  collection,
  getDocs,
  doc,
  deleteDoc,
  setDoc,
} from "firebase/firestore";
import { Button, Drawer, Label, TextInput } from "flowbite-react";
import Loader from "@/components/Loader";
import { theme } from "../../scholars/page";
import { TbActivity } from "react-icons/tb";

const ActivitiesPage = () => {
  const [activities, setActivities] = useState([]);
  const [showDrawer, setShowDrawer] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const [selectedActivity, setSelectedActivity] = useState(null);
  const [newActivity, setNewActivity] = useState({
    name: "",
    local: "",
    outstationDayTrip: "",
    outstationLongDistance: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const fetchActivities = async () => {
    setIsLoading(true);
    const querySnapshot = await getDocs(collection(db, "activities"));
    const activitiesList = [];
    querySnapshot.forEach((doc) => {
      activitiesList.push({ id: doc.id, ...doc.data() });
    });
    setActivities(activitiesList);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  // Handle save (add/update) activity
  const handleSaveActivity = async () => {
    if (!newActivity.name.trim()) return; // Validate input
    const activityRef = selectedActivity
      ? doc(db, "activities", selectedActivity.id)
      : doc(db, "activities", Date.now().toString());
    await setDoc(activityRef, {
      name: newActivity.name,
      local: Number(newActivity.local),
      outstationDayTrip: Number(newActivity.outstationDayTrip),
      outstationLongDistance: Number(newActivity.outstationLongDistance),
    });

    setShowDrawer(false);
    setNewActivity({
      name: "",
      local: "",
      outstationDayTrip: "",
      outstationLongDistance: "",
    });
    setSelectedActivity(null);
    fetchActivities();
  };

  const handleDelete = async () => {
    if (selectedScholar) {
      await deleteDoc(doc(db, "activities", id));
      setShowModal(false); // Close modal after deletion
      setSelectedActivity(null); // Reset selected scholar
      fetchActivities(); // Re-fetch scholars after deletion
    }
  };

  return (
    <div className="mx-auto p-6 ">
      <h1 className="text-3xl font-semibold text-gray-800 mb-6">
        Activities Management
      </h1>

      {/* Add New Activity Button */}
      <Button
        onClick={() => {
          setShowDrawer(true);
          setNewActivity({
            name: "",
            local: "",
            outstationDayTrip: "",
            outstationLongDistance: "",
          });
          setSelectedActivity(null);
        }}
        className="bg-teal-600 text-white  hover:bg-teal-700"
      >
        Add New Activity
      </Button>

      {/* Activities Table */}
      {isLoading ? (
        <Loader />
      ) : (
        <div className="mt-6 bg-white shadow rounded-lg mx-auto w-full">
          <table className="w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Local
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Outstation Day Trip
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Outstation Long Distance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {activities.length ? (
                activities.map((activity) => (
                  <tr key={activity.id}>
                    <td className="px-6 py-4">{activity.name}</td>
                    <td className="px-6 py-4 text-right">{activity.local}</td>
                    <td className="px-6 py-4 text-right">
                      {activity.outstationDayTrip}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {activity.outstationLongDistance}
                    </td>
                    <td className="px-6 py-4 flex space-x-4">
                      <Button
                        onClick={() => {
                          setSelectedActivity(activity);
                          setNewActivity(activity);
                          setShowDrawer(true);
                        }}
                        className="bg-teal-600 text-white"
                      >
                        Edit
                      </Button>
                      <Button
                        onClick={() => {
                          setSelectedActivity(activity.id); // Set the selected scholar for deletion
                          setShowModal(true); // Open delete confirmation modal
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
                  <td colSpan="5" className="text-center py-4">
                    No activities found
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
        className={theme.root.base}
      >
        <Drawer.Header
          title={selectedActivity ? "Edit Activity" : "Add New Activity"}
          titleIcon={TbActivity}
          className={theme.header.inner.titleText}
        />

        <Drawer.Items className="space-y-6">
          {/* Activity Name */}
          <div>
            <Label
              htmlFor="name"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Activity Name
            </Label>
            <TextInput
              shadow
              id="name"
              value={newActivity.name}
              placeholder="Enter activity name"
              onChange={(e) =>
                setNewActivity({ ...newActivity, name: e.target.value })
              }
            />
          </div>

          {/* Local Points */}
          <div>
            <Label
              htmlFor="localPoints"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Local Points
            </Label>
            <TextInput
              shadow
              id="localPoints"
              type="number"
              value={newActivity.local}
              placeholder="Enter local points"
              onChange={(e) =>
                setNewActivity({ ...newActivity, local: e.target.value })
              }
            />
          </div>

          {/* Outstation Day Trip Points */}
          <div>
            <Label
              htmlFor="outstationDayTrip"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Outstation Day Trip Points
            </Label>
            <TextInput
              shadow
              id="outstationDayTrip"
              type="number"
              value={newActivity.outstationDayTrip}
              placeholder="Enter outstation day trip points"
              onChange={(e) =>
                setNewActivity({
                  ...newActivity,
                  outstationDayTrip: e.target.value,
                })
              }
            />
          </div>

          {/* Outstation Long Distance Points */}
          <div>
            <Label
              htmlFor="outstationLongDistance"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Outstation Long Distance Points
            </Label>
            <TextInput
              shadow
              id="outstationLongDistance"
              type="number"
              value={newActivity.outstationLongDistance}
              placeholder="Enter outstation long distance points"
              onChange={(e) =>
                setNewActivity({
                  ...newActivity,
                  outstationLongDistance: e.target.value,
                })
              }
            />
          </div>
        </Drawer.Items>

        <div className="mt-6 flex justify-end space-x-2 absolute bottom-4 w-[calc(100%-2rem)] ">
          <Button
            onClick={() => setShowDrawer(false)}
            className="bg-gray-300 text-gray-700 hover:bg-gray-400"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveActivity}
            className="flex-1 bg-teal-600 text-white hover:bg-teal-700"
          >
            Save
          </Button>
        </div>
      </Drawer>

      {showModal && (
        <>
          <div
            className="fixed inset-0 z-40 bg-gray-900/50 dark:bg-gray-900/80"
            onClick={() => setShowModal(false)}
          />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg p-6 mx-auto my-16 bg-white rounded-lg shadow-lg transform scale-95 transition-all duration-300 ease-out sm:max-w-md sm:rounded-xl sm:scale-100">
            <div className="text-center text-xl font-semibold text-gray-800">
              Confirm Deletion
            </div>
            <div className="text-center text-gray-600">
              <p>Are you sure you want to delete this Activity?</p>
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

export default ActivitiesPage;
