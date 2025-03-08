import { db } from "@/firebase";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import {
  FaUser,
  FaCity,
  FaMapMarkerAlt,
  FaRegCalendarAlt,
  FaFlag,
  FaClipboardList,
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
    const questionQuery = query(
      collection(db, "branches-review-points"),
      orderBy("order") 
    );
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

const getBranchReviewList = async (record) => {
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
  ];

  const questions = await fetchQuestions(); 

  const questionData = questions.map((question) => {
    const value = record[question.name] || "N/A"; 
    const icon = value === "N/A" ? <FaRegMap /> : <FaClipboardList />; 

    return {
      label: question.name, 
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

export default getBranchReviewList;
