"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  HiChartPie,
  HiUsers,
  HiClipboardList,
  HiLocationMarker,
  HiDocumentText,
  HiCode,
  HiQuestionMarkCircle,
  HiOfficeBuilding,
  HiArrowSmRight,
} from "react-icons/hi";
import { MdArrowDropDown } from "react-icons/md";

import { AnimatePresence, motion } from "framer-motion";
import { signOut } from "firebase/auth";
import { auth } from "@/firebase";

function AdminSidebar({ children }) {
  const [isOpen, setIsOpen] = useState(true); // State to toggle sidebar size
  const [showModal, setShowModal] = useState(false); // State for modal visibility
  const [expanded, setExpanded] = useState(null); // Track expanded sidebar item

  const pathname = usePathname(); // Get the current path
  const router = useRouter();

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
    setExpanded(null);
  };

  const sidebarItems = useMemo(
    () => [
      {
        href: "/",
        icon: HiChartPie,
        label: "Dashboard",
        subOptions: [],
      },
      {
        href: "/scholars",
        icon: HiUsers,
        label: "Scholars Management",
      },

      {
        href: "/reports",
        icon: HiDocumentText,
        label: "Reports",
        subOptions: [
          { href: "/reports/daily", label: "Daily Activity Records" },
          {
            href: "/reports/branch",
            label: "Branch Shariah Compliance Review",
          },
          { href: "/reports/staff", label: "Staff Interview" },
          {
            href: "/reports/leads",
            label: "360 Leads",
          },
        ],
      },
      {
        href: "/knowledge",
        icon: HiDocumentText,
        label: "Knowledge Center",
        subOptions: [
          { href: "/knowledge/process-flow", label: "Process Flow" },
          { href: "/knowledge/sessions-link", label: "Session Link" },
          {
            href: "/knowledge/chamber-of-commerce",
            label: "Chamber of Commerce",
          },
          {
            href: "/knowledge/branch-list",
            label: "Branch List",
          },
          {
            href: "/knowledge/madaris-list",
            label: "Madaris List",
          },
        ],
      },
      {
        href: "/extras",
        icon: HiLocationMarker,
        label: "Extras",
        subOptions: [
          {
            href: "/extras/questions",
            label: "Staff Interview Questions",
          },
          {
            href: "/extras/branch-review",
            label: "Branch Review Questions",
          },
          {
            href: "/extras/branch-code",
            label: "Branch Management",
          },
          {
            href: "/extras/activity",
            label: "Activity & Score",
          },
        ],
      },
    ],
    []
  );

  useEffect(() => {
    if (isOpen)
      if (pathname === "/") {
        setExpanded(null);
      } else {
        const item = sidebarItems.find((item) =>
          item.subOptions?.some((subOption) => subOption.href === pathname)
        );
        setExpanded(item?.href);
      }
  }, [isOpen, pathname, sidebarItems]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log("User logged out successfully");
      router.push("/login");
    } catch (error) {
      console.error("Error during logout:", error.message);
    }
  };



  return (
    <>
      <div
        className={`h-screen transition-all duration-300 gap-4 flex flex-col relative`}
        style={{ width: isOpen ? "16rem" : "4rem" }}
      >
        <motion.div
          className={`h-full bg-teal-600 text-white relative overflow-y-auto overflow-x-hidden`}
          initial={false}
          animate={{ width: isOpen ? "16rem" : "4rem" }}
          transition={{ duration: 0.3 }}
        >
          {/* Logo Section */}
          <div className="flex items-center justify-between px-3 py-4">
            <div
              className={`flex items-center space-x-2 ${
                isOpen ? "" : "justify-center"
              }`}
            >
              <HiOfficeBuilding className="text-teal-100 h-8 w-8" />
              {isOpen && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-teal-100 text-xl font-semibold"
                >
                  Admin Panel
                  <p className="text-xs">Shariah Compliance & review</p>
                </motion.span>
              )}
            </div>
          </div>

          {/* Sidebar Items */}
          <div className="h-full overflow-hidden rounded-t-2xl bg-gray-50 px-3 py-4">
            <div className="mt-4 space-y-2 border-t border-gray-200 pt-4 first:mt-0 first:border-t-0 first:pt-0">
              {sidebarItems.map((item, index) => {
                const isParentActive =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(item.href);
                const hasSubOptions = item.subOptions?.length > 0;

                return (
                  <div key={index}>
                    {/* Parent Item */}
                    <div
                      className={`flex items-center justify-between p-2 rounded-lg cursor-pointer ${
                        isParentActive
                          ? "bg-teal-700 text-white"
                          : "text-gray-900 hover:bg-gray-100"
                      }`}
                      onClick={() => {
                        hasSubOptions &&
                          setExpanded(
                            expanded === item.href ? null : item.href
                          );
                        !hasSubOptions && router.push(item.href);
                      }}
                    >
                      <div className="flex">
                        <item.icon
                          className={`h-6 w-6 transition duration-75 ${
                            isParentActive
                              ? "text-white"
                              : "text-gray-500 group-hover:text-gray-900"
                          }`}
                        />
                        {isOpen && (
                          <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ delay: 0.3 }}
                            className="ml-3 whitespace-nowrap text-left flex-1"
                          >
                            {item.label}
                          </motion.span>
                        )}
                      </div>
                      {hasSubOptions && <MdArrowDropDown />}
                    </div>

                    {/* Sub-options */}
                    <div className="mt-2">
                      <AnimatePresence>
                        {expanded === item.href &&
                          item.subOptions?.map((subItem, subIndex) => {
                            const isSubActive = pathname === subItem.href;
                            return (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                key={subIndex}
                              >
                                <Link href={subItem.href}>
                                  <div
                                    className={`ml-6 group flex w-full items-center rounded-lg p-2 text-base font-normal transition duration-75 relative ${
                                      isSubActive
                                        ? "bg-gray-200 text-teal-700"
                                        : "text-gray-900 hover:bg-gray-100"
                                    }`}
                                  >
                                    <HiArrowSmRight
                                      className={`h-5 w-5 transition duration-75 ${
                                        isSubActive
                                          ? "text-teal-700"
                                          : "text-gray-500 group-hover:text-gray-900"
                                      }`}
                                    />
                                    {isSubActive && (
                                      <span className="w-[0.55rem] h-full bg-teal-700 rounded-l-md absolute right-2 top-0 z-10" />
                                    )}

                                    {isOpen && (
                                      <motion.span
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ delay: 0.3 }}
                                        className="ml-3 flex-1 whitespace-nowrap text-left line-clamp-1"
                                      >
                                        {subItem.label}
                                      </motion.span>
                                    )}
                                  </div>
                                </Link>
                              </motion.div>
                            );
                          })}
                      </AnimatePresence>
                    </div>
                  </div>
                );
              })}
              <hr />
              {/* Sign Out */}
              <AnimatePresence>
                <div
                  className="group flex w-full items-center rounded-lg p-2 text-base font-normal text-gray-900 transition duration-75 hover:bg-gray-100"
                  onClick={() => setShowModal(true)} // Show modal on click
                >
                  <HiArrowSmRight className="h-6 w-6 text-gray-500 transition duration-75 group-hover:text-gray-900" />
                  {isOpen && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ delay: 0.3 }}
                      className="ml-3 flex-1 whitespace-nowrap text-left cursor-pointer"
                    >
                      Sign Out
                    </motion.span>
                  )}
                </div>
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
        <button
          onClick={toggleSidebar}
          className="absolute top-1/2 -right-8 w-16 h-16 rounded-full focus:outline-none flex items-center justify-center text-xl shadow-2xl overflow-hidden"
        >
          <div className="flex h-full w-full">
            <div className="flex-1 bg-teal-800/50 text-white flex items-center justify-center">
              {isOpen ? "←" : ""}
            </div>
            <div className="flex-1 bg-white/50 text-teal-800 flex items-center justify-center">
              {!isOpen ? "→" : ""}
            </div>
          </div>
        </button>

        {/* Modal for Logout Confirmation */}
        <AnimatePresence>
          {showModal && (
            <motion.div
              initial={{ scale: 1.2, opacity: 0 }}
              exit={{ scale: 1.2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
            >
              <div className="bg-white rounded-lg p-6 w-96">
                <h2 className="text-lg font-semibold text-gray-800">
                  Confirm Logout
                </h2>
                <p className="text-gray-600 mt-2">
                  Are you sure you want to log out?
                </p>
                <div className="flex justify-end space-x-4 mt-6">
                  <button
                    className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="pl-10 pb-10 flex justify-center w-full overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-track]:bg-teal-700 dark:[&::-webkit-scrollbar-thumb]:bg-teal-500">
        {children}
      </div>
    </>
  );
}

export default AdminSidebar;
