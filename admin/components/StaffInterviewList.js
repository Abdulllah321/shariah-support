import { db } from "@/firebase";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import {
  FaUser,
  FaCity,
  FaMapMarkerAlt,
  FaRegCalendarAlt,
  FaFlag,
  FaClipboardList,
  FaIdCard,
  FaTag,
  FaRegCalendar,
} from "react-icons/fa";

const formatDate = (date) => {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const fetchQuestions = async () => {
  try {
    const questionQuery = query(collection(db, "sQuestion"));
    const questionSnapshot = await getDocs(questionQuery);

    const questionList = questionSnapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    }));

    return questionList;
  } catch (error) {
    console.error("Error fetching questions: ", error);
    return [];
  }
};

const getStaffInterviewList = async (record) => {
  const branchData = [
    { label: "Sharia Scholar", value: record.name || "N/A", icon: <FaUser /> },
    {
      label: "Branch Code",
      value: record.branchCode || "N/A",
      icon: <FaClipboardList />,
    },
    { label: "Branch City", value: record.city || "N/A", icon: <FaCity /> },
    {
      label: "Province",
      value: record.province || "N/A",
      icon: <FaMapMarkerAlt />,
    },
    { label: "Branch Region", value: record.region || "N/A", icon: <FaFlag /> },
    {
      label: "Visit Date",
      value: formatDate(record.visitDate) || "N/A",
      icon: <FaRegCalendarAlt />,
    },
    { label: "Staff Name", value: record.staffName || "N/A", icon: <FaUser /> },
    {
      label: "Designation",
      value: record.designation || "N/A",
      icon: <FaTag />,
    },
    {
      label: "Employee Number",
      value: record.employeeName || "N/A",
      icon: <FaIdCard />,
    },
    {
      label: "Date of Joining",
      value: formatDate(record.dateOfJoining) || "N/A",
      icon: <FaRegCalendar />,
    },
  ];

  const questions = await fetchQuestions();

  const questionData = questions.map((question) => {
    const value = record[question.question] || "N/A";
    const icon = value === "N/A" ? <FaRegMap /> : <FaClipboardList />;

    return {
      label: question.question,
      value,
      icon,
    };
  });

  branchData.push({
    label: "Questions",
    value: questionData.length > 0 ? questionData : "N/A",
    icon: <FaClipboardList />, // Icon for the questions section
  });

  return branchData;
};

export default getStaffInterviewList;
