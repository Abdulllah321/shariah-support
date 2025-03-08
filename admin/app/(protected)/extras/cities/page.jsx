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
import { Button, Drawer, Label, TextInput, Textarea } from "flowbite-react";
import Loader from "@/components/Loader";
import { TbBuilding } from "react-icons/tb";

const CitiesPage = () => {
  const [cities, setCities] = useState([]);
  const [filteredCities, setFilteredCities] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDrawer, setShowDrawer] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [bulkUpload, setBulkUpload] = useState(false);

  const [selectedCity, setSelectedCity] = useState(null);
  const [newCity, setNewCity] = useState({ name: "" });
  const [bulkCityNames, setBulkCityNames] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const fetchCities = async () => {
    setIsLoading(true);
    const querySnapshot = await getDocs(collection(db, "cities"));
    const citiesList = [];
    querySnapshot.forEach((doc) => {
      citiesList.push({ id: doc.id, ...doc.data() });
    });
    setCities(citiesList);
    setFilteredCities(citiesList);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchCities();
  }, []);

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    if (query === "") {
      setFilteredCities(cities);
    } else {
      const filtered = cities.filter((city) =>
        city.name.toLowerCase().includes(query)
      );
      setFilteredCities(filtered);
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

  const handleSaveCity = async () => {
    if (!newCity.name.trim()) return; // Validate input
    const cityRef = selectedCity
      ? doc(db, "cities", selectedCity.id)
      : doc(db, "cities", Date.now().toString());
    await setDoc(cityRef, { name: newCity.name });

    setShowDrawer(false);
    setNewCity({ name: "" });
    setSelectedCity(null);
    fetchCities();
  };

  const handleBulkUpload = async () => {
    if (!bulkCityNames.trim()) return; // Validate input
    const cityNames = bulkCityNames.split(",").map((name) => name.trim());
    const batchPromises = cityNames.map((name) => {
      const cityRef = doc(db, "cities", Date.now().toString() + Math.random());
      return setDoc(cityRef, { name });
    });
    await Promise.all(batchPromises);

    setShowDrawer(false);
    setBulkCityNames("");
    fetchCities();
  };

  const handleDelete = async () => {
    if (selectedCity) {
      await deleteDoc(doc(db, "cities", selectedCity.id));
      setShowModal(false); // Close modal after deletion
      setSelectedCity(null); // Reset selected city
      fetchCities(); // Re-fetch cities after deletion
    }
  };

  return (
    <div className="mx-auto p-6 w-full">
      <h1 className="text-3xl font-semibold text-gray-800 mb-6">
        Cities Management
      </h1>

      <div className="flex justify-between items-center">
        <Button
          onClick={() => {
            setShowDrawer(true);
            setNewCity({ name: "" });
            setSelectedCity(null);
            setBulkUpload(false);
          }}
          className="bg-teal-600 text-white hover:bg-teal-700"
        >
          Add New City
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
              placeholder="Search Cities ..."
              value={searchQuery}
              onChange={handleSearch}
            />
          </div>
        </form>

        <Button
          onClick={() => {
            setShowDrawer(true);
            setBulkUpload(true);
            setBulkCityNames("");
          }}
          className="ml-4 bg-cyan-600 text-white hover:bg-cyan-700"
        >
          Bulk Upload Cities
        </Button>
      </div>

      {isLoading ? (
        <Loader />
      ) : (
        <div className="mt-6 bg-white shadow rounded-lg mx-auto w-full">
          <table className="w-full divide-y divide-gray-200">
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
              {filteredCities.length ? (
                filteredCities.map((city, index) => (
                  <tr key={city.id} className="odd:bg-white even:bg-gray-50">
                    <td className="px-6 py-4 text-right"># {index + 1}</td>
                    <td className="px-6 py-4">
                      {highlightText(city.name, searchQuery)}
                    </td>
                    <td className="px-6 py-4 flex space-x-2">
                      <Button
                        onClick={() => {
                          setSelectedCity(city);
                          setNewCity(city);
                          setShowDrawer(true);
                        }}
                        className="bg-teal-600 text-white"
                      >
                        Edit
                      </Button>
                      <Button
                        onClick={() => {
                          setSelectedCity(city);
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
                    No cities found
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
              ? "Bulk Upload Cities"
              : selectedCity
              ? "Edit City"
              : "Add New City"
          }
          titleIcon={TbBuilding}
        />

        <Drawer.Items className="space-y-6">
          {bulkUpload ? (
            <div>
              <Label
                htmlFor="bulkCityNames"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                City Names (comma-separated)
              </Label>
              <Textarea
                id="bulkCityNames"
                value={bulkCityNames}
                placeholder="Enter city names separated by commas"
                onChange={(e) => setBulkCityNames(e.target.value)}
              />
            </div>
          ) : (
            <div>
              <Label
                htmlFor="name"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                City Name
              </Label>
              <TextInput
                shadow
                id="name"
                value={newCity.name}
                placeholder="Enter city name"
                onChange={(e) =>
                  setNewCity({ ...newCity, name: e.target.value })
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
            onClick={bulkUpload ? handleBulkUpload : handleSaveCity}
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
              <p>Are you sure you want to delete this City?</p>
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

export default CitiesPage;
