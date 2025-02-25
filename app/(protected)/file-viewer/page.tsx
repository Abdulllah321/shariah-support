"use client";
import React from "react";
import { useSearchParams } from "next/navigation";
import {Button} from "@heroui/react";

const FileViewer: React.FC = () => {
    const searchParams = useSearchParams();
    const fileUrl = searchParams.get("url") || "";
    const fileType = searchParams.get("type") || "";

    return (
        <div className="flex justify-center items-center min-h-screen  p-6">
            {fileType.includes("image") && (
                <img src={fileUrl} alt="Image Preview" className="max-w-full max-h-screen rounded-lg shadow-lg" />
            )}
            {fileType.includes("video") && (
                <video src={fileUrl} controls className="max-w-full max-h-screen rounded-lg shadow-lg" />
            )}
            {fileType.includes("pdf") && (
                <embed src={fileUrl} type="application/pdf" className="w-full h-screen rounded-lg" />
            )}
            {(fileType.includes("word") || fileType.includes("excel") || fileType.includes("ppt")) && (
                <Button
                    onPress={() => openInGoogleDocs(fileUrl)}
                >
                    Open in Google Docs
                </Button>
            )}
            {!fileType && <p className="text-red-500">Invalid file type</p>}
        </div>
    );
};

const openInGoogleDocs = (fileUrl: string) => {
    window.open(`https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}&embedded=true`, "_blank");
};

export default FileViewer;
