import {
  FaUser,
  FaUserAlt,
  FaCalendarAlt,
  FaRegCalendarAlt,
  FaRegClock,
  FaBuilding,
  FaRegBuilding,
  FaMapMarkerAlt,
  FaUserFriends,
  FaStar,
  FaPhoneAlt,
  FaCommentDots,
  FaRegCommentDots,
  FaRegListAlt,
  FaRegCompass,
  FaDirections,
  FaCity,
  FaRegChartBar,
  FaRegIdCard,
  FaRegFlag,
} from "react-icons/fa";

const formatDate = (date) => {
  if (!date) return "N/A";

  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const getDailyActivityList = (record) => [
  { label: "Sharia Scholar", value: record.name || "N/A", icon: <FaUserAlt /> },
  { label: "Date", value: formatDate(record.date), icon: <FaRegCalendarAlt /> },
  {
    label: "Day",
    value: record.date
      ? new Date(record.date).toLocaleDateString("en-US", { weekday: "long" })
      : "N/A",
    icon: <FaCalendarAlt />,
  },
  { label: "Duration", value: record.duration || "N/A", icon: <FaRegClock /> },
  {
    label: "Branch Code",
    value: record.branchCode || "N/A",
    icon: <FaRegBuilding />,
  },
  {
    label: "Branch Name",
    value: record.branchName || "N/A",
    icon: <FaBuilding />,
  },
  { label: "Person Met", value: record.personMet || "N/A", icon: <FaUser /> },
  {
    label: "Designation",
    value: record.designation || "N/A",
    icon: <FaRegIdCard />,
  },
  {
    label: "No of Participants / Clients",
    value: record.purpose || "N/A",
    icon: <FaUserFriends />,
  },
  {
    label: "Activity / Title",
    value: record.activity || "N/A",
    icon: <FaRegListAlt />,
  },
  {
    label: "Distance (Local / Short / Long)",
    value: record.distance || "N/A",
    icon: <FaDirections />,
  },
  { label: "Score", value: record.score || "N/A", icon: <FaStar /> },
  { label: "Contact #", value: record.contact || "N/A", icon: <FaPhoneAlt /> },
  {
    label: "Other Venue",
    value: record.otherVenue || "N/A",
    icon: <FaRegCompass />,
  },
  { label: "City", value: record.city || "N/A", icon: <FaCity /> },
  { label: "Area", value: record.area || "N/A", icon: <FaMapMarkerAlt /> },
  { label: "RGM", value: record.rgm || "N/A", icon: <FaRegChartBar /> },
  { label: "Region", value: record.region || "N/A", icon: <FaRegFlag /> },
  {
    label: "Branch Response",
    value: record.branchResponse || "N/A",
    icon: <FaRegCommentDots />,
  },
  { label: "Remarks", value: record.remarks || "N/A", icon: <FaCommentDots /> },
];
export default getDailyActivityList;
