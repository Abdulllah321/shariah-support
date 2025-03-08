import {
  FaBriefcase,
  FaBuilding,
  FaClipboardCheck,
  FaClipboardList,
  FaPhoneAlt,
  FaPhoneSquareAlt,
  FaUser,
  FaUserCircle,
} from "react-icons/fa";
const get360LeadsList = (record) => [
  {
    label: "BM Domain",
    value: record.bmDomainId || "N/A",
    icon: <FaClipboardList />,
  },
  { label: "Client Name", value: record.clientName || "N/A", icon: <FaUser /> },
  {
    label: "Client Cell Code",
    value: record.clientCellCode || "N/A",
    icon: <FaPhoneAlt />,
  },
  {
    label: "Client Cell Number",
    value: record.clientCellNumber || "N/A",
    icon: <FaPhoneSquareAlt />,
  },
  {
    label: "Client Business Address",
    value: record.clientBusinessAddress || "N/A",
    icon: <FaBuilding />,
  },
  {
    label: "Client Employer / Business Name",
    value: record.clientEmployerBusinessName || "N/A",
    icon: <FaBriefcase />,
  },
  {
    label: "Creator Name",
    value: record.creator_name || "N/A",
    icon: <FaUserCircle />,
  },
  {
    label: "Creator Domain",
    value: record.creatorId || "N/A",
    icon: <FaUser />,
  },
  {
    label: "BM Branch Code",
    value: record.bmBranchCode || "N/A",
    icon: <FaClipboardCheck />,
  },
];
export default get360LeadsList;
