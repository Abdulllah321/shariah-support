import { useEffect } from "react";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";

const driverObj = driver({
  showProgress: true,
  showButtons: ["next", "previous"],
  allowClose: false,
  doneBtnText: "Finish",
  nextBtnText: "Next ▶",
  prevBtnText: "⬅ Back",
  steps: [
    {
      element: "#bottom-nav #daily_activity_report",
      popover: {
        title: "📊 Daily Activity Report",
        description: "Monitor and track daily activities effortlessly.",
        side: "top",
      },
    },
    {
      element: "#bottom-nav #branch_review",
      popover: {
        title: "🏢 Branch Performance Review",
        description: "Analyze and assess branch operations and performance.",
        side: "top",
      },
    },
    {
      element: "#bottom-nav #staff_interview",
      popover: {
        title: "🧑‍💼 Staff Interview Reports",
        description: "Manage and review staff interview feedback efficiently.",
      },
    },
    {
      element: "#bottom-nav #leads",
      popover: {
        title: "🚀 Leads & Sales Tracking",
        description: "Keep track of sales leads and conversion progress.",
        side: "top",
      },
    },
    {
      element: "#theme-switcher",
      popover: {
        title: "🌗 Theme Switcher",
        description:
          "Switch between Dark, Light, and System themes effortlessly.",
      },
    },
    {
      element: "#dropdown-menu-button",
      popover: {
        title: "📂 Menu",
        description: "Click here to open the menu and explore more options.",
      },
    },
    {
      element: "#employee-id",
      popover: {
        title: "🔢 Employee ID",
        description: "Your unique employee ID is displayed here.",
        side: "top",
      },
    },
    {
      element: "#employee-greeting",
      popover: {
        title: "👋 Welcome Message",
        description: "Personalized greeting to make you feel at home.",
        side: "bottom",
      },
    },
    {
      element: "#employee-score",
      popover: {
        title: "🏆 Your Score",
        description: "Your current performance score is shown here.",
        side: "top",
      },
    },
    {
      element: "#view-details-btn",
      popover: {
        title: "🔍 View Details",
        description: "Click here to see a detailed breakdown of your Score.",
        side: "bottom",
      },
    },
    {
      element: "#view-dashboard-btn",
      popover: {
        title: "📊 View Dashboard",
        description:
          "Access your complete dashboard with performance insights.",
        side: "bottom",
      },
    },
    {
      element: "#logout-button",
      popover: {
        title: "🚪 Logout",
        description: "Click here to securely log out of your account.",
        side: "left",
      },
    },
    {
      element: "#search-button",
      popover: {
        title: "🔍 Search Reports",
        description: "Use this button to quickly find specific reports.",
        side: "bottom",
      },
    },
    {
      element: "#export-button",
      popover: {
        title: "📥 Export to Excel",
        description: "Click here to download the report in Excel format.",
        side: "bottom",
      },
    },
    {
      element: "#report-list",
      popover: {
        title: "📋 Report Entries",
        description:
          "This section displays all submitted reports. You can edit or delete any entry.",
        side: "top",
      },
    },
  ],
});

const WebsiteTour = () => {
  useEffect(() => {
    const hasSeenTour = localStorage.getItem("hasSeenTour");

    if (!hasSeenTour) {
      driverObj.drive();
      localStorage.setItem("hasSeenTour", "true");
    }
  }, []);

  return null;
};

export default WebsiteTour;
