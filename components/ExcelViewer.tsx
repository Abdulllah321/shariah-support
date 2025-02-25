"use client";
import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";

interface ExcelViewerProps {
    fileUrl: string;
}

const ExcelViewer: React.FC<ExcelViewerProps> = ({ fileUrl }) => {
    const [data, setData] = useState<string[][]>([]);

    useEffect(() => {
        fetch(fileUrl)
            .then(response => response.arrayBuffer())
            .then(buffer => {
                const workbook = XLSX.read(buffer, { type: "array" });
                const sheetName = workbook.SheetNames[0];
                const sheet = XLSX.utils.sheet_to_json<string[]>(workbook.Sheets[sheetName], { header: 1 });
                setData(sheet);
            });
    }, [fileUrl]);

    return (
        <div className="overflow-auto max-w-full max-h-screen p-4 bg-white rounded-lg shadow">
            <table className="table-auto border-collapse border border-gray-300 w-full">
                <tbody>
                {data.map((row, i) => (
                    <tr key={i} className="border border-gray-200">
                        {row.map((cell, j) => (
                            <td key={j} className="p-2 border border-gray-200">{cell}</td>
                        ))}
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default ExcelViewer;
