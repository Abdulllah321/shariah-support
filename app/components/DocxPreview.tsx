"use client";
import React, { useEffect, useState } from "react";
import mammoth from "mammoth";

interface DocxPreviewProps {
    fileUrl: string;
}

const DocxPreview: React.FC<DocxPreviewProps> = ({ fileUrl }) => {
    const [preview, setPreview] = useState<string>("Loading preview...");

    useEffect(() => {
        const fetchDocxAndConvert = async () => {
            try {
                const response = await fetch(fileUrl);
                const arrayBuffer = await response.arrayBuffer();
                const { value } = await mammoth.convertToHtml({ arrayBuffer });
                // Remove HTML tags and shorten the preview
                const textOnly = value.replace(/<[^>]+>/g, "");
                const shortPreview = textOnly.slice(0, 200) + (textOnly.length > 200 ? "..." : "");
                setPreview(shortPreview);
            } catch (error) {
                console.error("Error converting DOCX:", error);
                setPreview("Preview unavailable");
            }
        };

        fetchDocxAndConvert();
    }, [fileUrl]);

    return (
        <div className="mt-2 p-2 border rounded bg-background text-sm text-foreground ">
            {preview}
        </div>
    );
};

export default DocxPreview;
