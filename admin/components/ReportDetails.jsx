"use client";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Loader from "./Loader";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase";
import getDailyActivityList from "./DailyActivityList";
import getBranchReviewList from "./BranchReviewList";
import getStaffInterviewList from "./StaffInterviewList";
import get360LeadsList from "@/components/360LeadsList";

const ReportDetails = ({ id }) => {
  const [selectedReport, setSelectedReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reportList, setReportList] = useState([]); // Ensure initial state is an empty array
  const searchParams = useSearchParams();
  const action = searchParams.get("action");

  useEffect(() => {
    const fetchRecord = async () => {
      if (!id || !action) {
        setLoading(false);
        return;
      }

      try {
        let docRef;
        switch (action) {
          case "daily-activity":
            docRef = doc(db, "records", id);
            break;
          case "branch-review":
            docRef = doc(db, "BranchReview", id);
            break;
          case "staff-interview":
            docRef = doc(db, "StaffReview", id);
            break;
          case "360-leads":
            docRef = doc(db, "360Leads", id);
            break;
          default:
            console.error("Invalid action type");
            setLoading(false);
            return;
        }

        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setSelectedReport(docSnap.data());
        } else {
          console.error("No record found with this ID.");
          setSelectedReport(null);
        }
      } catch (error) {
        console.error("Error fetching record:", error);
        setSelectedReport(null);
      } finally {
        setLoading(false);
      }
    };

    fetchRecord();
  }, [id, action]);

  useEffect(() => {
    const fetchReportList = async () => {
      let result = [];
      if (!selectedReport) return;

      switch (action) {
        case "daily-activity":
          result = getDailyActivityList(selectedReport);
          break;
        case "branch-review":
          result = (await getBranchReviewList(selectedReport)) || [];
          break;
        case "staff-interview":
          result = (await getStaffInterviewList(selectedReport)) || [];
          break;
        case "360-leads":
          result = get360LeadsList(selectedReport) || [];
          break;
        default:
          result = [];
      }

      setReportList(result); // Set the result after the async call
    };

    fetchReportList(); // Call fetchReportList on selectedReport change
  }, [action, selectedReport]); // Depend on both action and selectedReport

  if (loading) {
    return <Loader />;
  }

  if (!selectedReport) {
    return <p className="text-center text-gray-500">No report found.</p>;
  }

  return (
    <div>
      {action && (
        <h2 className="text-xl font-semibold text-gray-500 border-b pb-2 capitalize">
          {action.replace("-", " ")}
        </h2>
      )}

      {reportList.map((item, index) => (
        <DetailItem
          key={index}
          icon={item.icon}
          label={item.label}
          value={item.value}
        />
      ))}
    </div>
  );
};

const DetailItem = ({ label, value, icon }) => {
  const isQuestions = label === "Questions" && Array.isArray(value);

  const renderQuestionValue = (questionValue) => {
    if (questionValue === "N/A") {
      return <div className="text-lg text-gray-400 italic">N/A</div>;
    }

    const numericValue = Number(questionValue);
    if (!isNaN(numericValue)) {
      return (
        <div className="text-3xl text-gray-600 text-right">{numericValue}</div>
      );
    }

    return <div className="text-3xl text-gray-600">{questionValue}</div>;
  };

  return (
    <div className="flex items-center space-x-4 bg-gray-50 p-3 rounded-md shadow-sm">
      {!isQuestions && <div className="text-teal-500 text-xl">{icon}</div>}
      <div>
        {!isQuestions && <dt className="text-gray-600 font-bold">{label}</dt>}
        <dd
          className={`text-lg ${
            value !== "N/A"
              ? "text-gray-800 font-semibold"
              : "text-gray-400 font-normal italic"
          }`}
        >
          {isQuestions ? (
            <div className="space-y-4 mt-4">
              {/* Divider with label */}
              <div className="text-gray-700 font-semibold text-xl">
                Questions:
              </div>
              <div className="border-t border-gray-300 my-2"></div>

              {/* Render each question with serial number */}
              {value.map((question, index) => (
                <div
                  key={index}
                  className="p-3 bg-teal-50 rounded-md border-l-4 border-teal-400 shadow-sm"
                >
                  <div className="font-bold text-sm text-teal-600">
                    Question {index + 1}:
                  </div>
                  <div className="font-semibold text-gray-500 ">
                    {question.label}
                  </div>

                  {renderQuestionValue(question.value)}
                </div>
              ))}
            </div>
          ) : (
            value || "N/A"
          )}
        </dd>
      </div>
    </div>
  );
};

export default ReportDetails;
