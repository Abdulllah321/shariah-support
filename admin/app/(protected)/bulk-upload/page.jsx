"use client";
import {useState} from "react";
import {db} from "@/firebase"; // Firebase setup file
import {collection, addDoc, deleteDoc, getDocs, where, query} from "firebase/firestore";
import {saveAs} from "file-saver";
import * as XLSX from "xlsx";

export default function BulkUploadForm() {
    const [jsonInput, setJsonInput] = useState("");
    const [parsedData, setParsedData] = useState([]);
    const [error, setError] = useState("");

    const handleFileUpload = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Read the file
        const reader = new FileReader();
        reader.onload = (event) => {
            const binaryStr = event.target?.result;
            const workbook = XLSX.read(binaryStr, {type: "binary"});

            // Get the first sheet
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];

            // Convert sheet to JSON
            const data = XLSX.utils.sheet_to_json(sheet);

            // Transform data into your required format
            const transformedData = data.map((row) => ({
                activity: row["Activity / Title"] ?? "",
                area: row["Area"] ?? "",
                branchCode: row["Branch Code"] ?? "",
                branchName: row["Branch Name"] ?? "",
                branchResponse: row["Branch Response"] ?? "",
                city: row["City"] ?? "",
                contact: row["Contact #"] ?? "",
                date: formatDate(row["Date"]),
                designation: row["Designation"] ?? "",
                distance: row["Distance\nLocal / Short / Long"] ?? "",
                duration: row["Duration"] ?? "",
                employeeId: "30160",
                name: row["Sharia Scholar"] ?? "Syed Faizan Ahmad" ,
                otherVenue: row["Other Venue"] ?? "",
                personMet: row["Person Met"] ?? "",
                purpose: row["Purpose"] ?? "",
                region: row["Region"] ?? "",
                remarks: row["Remarks"] ?? "",
                rgm: row["RGM"] ?? "",
                score: row["Score"] ?? 0,
            }));

            setParsedData(transformedData);
            console.log(transformedData)
            setError("");
        };

        reader.readAsBinaryString(file);
    };
    const formatDate = (dateValue) => {
        if (!dateValue) return null;

        // If date is an Excel serial number (e.g., 45650 for 1-Jan-2025)
        if (typeof dateValue === "number") {
            const excelEpoch = new Date(Date.UTC(1899, 11, 30)); // Excel starts from 30-Dec-1899
            return new Date(excelEpoch.getTime() + (dateValue * 86400000)).toISOString();
        }

        // If date is a string like "1-Jan-25", try parsing
        const parsedDate = Date.parse(dateValue);
        if (!isNaN(parsedDate)) {
            return new Date(parsedDate).toISOString();
        }

        console.warn("Invalid date format:", dateValue);
        return null; // Return null for invalid dates
    };

    const handleJsonChange = (e) => {
        setJsonInput(e.target.value);
    };

    const handleParseJson = () => {
        try {
            const data = JSON.parse(jsonInput); // Attempt to parse the input as JSON
            const isValid = data.every((item) => validateRecord(item));

            if (isValid) {
                setParsedData(data);
                setError("");
            } else {
                setError("Invalid data structure. Please make sure it matches the required format.");
            }
        } catch (err) {
            setError("Invalid JSON format. Please check your input.");
            setParsedData([]);
        }
    };

    const validateRecord = (record) => {
        const requiredKeys = [
            "activity", "area", "branchCode", "branchName", "branchResponse",
            "city", "contact", "date", "designation", "distance", "duration",
            "employeeId", "name", "otherVenue", "personMet", "purpose", "region",
            "remarks", "rgm", "score"
        ];
        return requiredKeys.every((key) => key in record);
    };

    const handleUpload = async () => {
        if (parsedData.length === 0) {
            setError("No valid data to upload.");
            return;
        }

        try {
            const recordsCollection = collection(db, "records"); // Firestore collection

            for (const report of parsedData) {
                await addDoc(recordsCollection, report); // Add each record one by one
            }

            alert("Reports uploaded successfully!");
        } catch (error) {
            console.error("Error uploading reports:", error);
            alert("Failed to upload reports");
        }
    };


    const handleExportCSV = () => {
        if (parsedData.length === 0) {
            alert("No data available to export.");
            return;
        }

        const csvData = [
            Object.keys(parsedData[0] || {}).map((key) => `"${key}"`),
            ...parsedData.map((report) =>
                Object.values(report).map((item) => `"${item}"`)
            ),
        ];

        const csvContent = csvData.map((row) => row.join(",")).join("\n");

        const blob = new Blob([csvContent], {type: "text/csv;charset=utf-8;"});
        saveAs(blob, "reports.csv");
    };


    return (
        <div className="p-6 max-w-4xl mx-auto bg-white rounded-lg shadow-lg">
            <h1 className="text-3xl font-semibold text-gray-800 mb-6">Bulk Upload Reports</h1>

            {/*<div className="mb-6">*/}
            {/*    <label className="block text-gray-700">Paste your JSON data here:</label>*/}
            {/*    <textarea*/}
            {/*        className="w-full p-4 mt-2 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-teal-500 focus:border-teal-500"*/}
            {/*        rows="10"*/}
            {/*        value={jsonInput}*/}
            {/*        onChange={handleJsonChange}*/}
            {/*        placeholder='Enter JSON (e.g., [{"name": "John", "activity": "Coding"}])'*/}
            {/*    />*/}
            {/*</div>*/}

            <div className="p-4">
                <input
                    type="file"
                    accept=".xlsx, .xls"
                    onChange={handleFileUpload}
                    className="mb-4"
                />
            </div>

            {/*<div className="flex justify-between items-center mb-6">*/}
            {/*    /!*<button*!/*/}
            {/*    /!*    onClick={deleteEmployeeRecord}*!/*/}
            {/*    /!*    className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"*!/*/}
            {/*    /!*>*!/*/}
            {/*    /!*    Parse JSON*!/*/}
            {/*    /!*</button>*!/*/}
            {/*    <button*/}
            {/*        onClick={handleExportCSV}*/}
            {/*        className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700"*/}
            {/*    >*/}
            {/*        Export CSV*/}
            {/*    </button>*/}
            {/*</div>*/}

            {error && <p className="text-red-500 mb-4">{error}</p>}

            {parsedData.length > 0 && (
                <div>
                    <div className="mt-4 flex justify-center">
                        <button
                            onClick={handleUpload}
                            className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700"
                        >
                            Upload All Reports
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
