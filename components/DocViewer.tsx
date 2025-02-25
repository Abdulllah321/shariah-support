"use client";
import React, { useState, useEffect } from "react";
import { Viewer, Worker } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";

interface DocViewerProps {
    fileUrl: string;
}

const DocViewer: React.FC<DocViewerProps> = ({ fileUrl }) => {
    const [docData, setDocData] = useState<string | null>(null);

    useEffect(() => {
        fetch(fileUrl)
            .then(response => response.blob())
            .then(blob => {
                const reader = new FileReader();
                reader.onload = () => setDocData(reader.result as string);
                reader.readAsDataURL(blob);
            });
    }, [fileUrl]);

    return docData ? (
        <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.5.141/build/pdf.worker.min.js">
            <Viewer fileUrl={docData} />
        </Worker>
    ) : (
        <p>Loading...</p>
    );
};

export default DocViewer;
