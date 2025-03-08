"use client";
import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { format } from "date-fns";
import { Card, Avatar, Button } from "@heroui/react";
import {
    FileText,
    FileImage,
    FileVideo,
    FileSpreadsheet,
    FileArchive
} from "lucide-react";
import DocxPreview from "@/components/DocxPreview";
import {useRouter} from "next/navigation";

interface ProcessFlow {
    id: string;
    description: string;
    createdAt: { seconds: number; nanoseconds: number };
    fileType: string;
    fileUrl: string;
}



const Page: React.FC = () => {
    const [processFlows, setProcessFlows] = useState<ProcessFlow[]>([]);
    const router = useRouter();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, "process_flows"));
                const data = querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                })) as ProcessFlow[];
                setProcessFlows(data);
            } catch (error) {
                console.error("Error fetching process flows:", error);
            }
        };

        fetchData();
    }, []);


    const getFileIcon = (fileType: string) => {
        if (fileType.includes("image")) return <FileImage className="w-6 h-6 text-primary" />;
        if (fileType.includes("video")) return <FileVideo className="w-6 h-6 text-secondary" />;
        if (fileType.includes("excel") || fileType.includes("spreadsheet")) return <FileSpreadsheet className="w-6 h-6 text-green-500" />;
        if (fileType.includes("word")) return <FileArchive className="w-6 h-6 text-blue-500" />;
        if (fileType.includes("ppt") || fileType.includes("powerpoint")) return <FileArchive className="w-6 h-6 text-orange-500" />;
        if (fileType.includes("pdf")) return <FileArchive className="w-6 h-6 text-red-500" />;
        return <FileText className="w-6 h-6 text-gray-500" />;
    };

    const handleDownload = (fileUrl: string) => {
        const anchor = document.createElement("a");
        anchor.href = fileUrl;
        anchor.download = fileUrl.split("/").pop() || "downloaded-file";
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
    };

    const handleOpenOnline = (fileUrl: string, fileType: string) => {
        router.push(`/file-viewer?url=${encodeURIComponent(fileUrl)}&type=${fileType}`);
    };


    const formatDate = (timestamp: { seconds: number; nanoseconds: number }) => {
        const date = new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000);
        return format(date, "MMM dd, yyyy hh:mm a");
    };

    return (
        <div className={'flex flex-col gap-4 p-6 bg-background'}>
            {processFlows.map((flow) => (
                <Card key={flow.id}
                      className="self-end max-w-xs p-4 rounded-lg shadow-md mx-auto shadow-foreground border border-border-hover bg-background-hover"
                      shadow={'lg'}>
                    <div className="flex items-center gap-3">
                        <Avatar icon={getFileIcon(flow.fileType)} isBordered></Avatar>
                        <span className="text-xs text-muted-foreground">{formatDate(flow.createdAt)}</span>
                    </div>
                    <div className="mt-3">
                        {flow.fileType.includes("image") ? (
                            <img src={flow.fileUrl} alt="Image Preview" className="w-40 h-40 rounded-lg object-cover" />
                        ) : flow.fileType.includes("video") ? (
                            <video src={flow.fileUrl} controls className="w-40 h-40 rounded-lg" />
                        ) : flow.fileType.includes("word") ? (
                            <DocxPreview fileUrl={flow.fileUrl} />
                        ) : flow.fileType.includes("pdf") ? (
                            <embed src={flow.fileUrl} width="160" height="160" type="application/pdf" className="rounded-lg" />
                        ) : flow.fileType.includes("excel") ? (
                            <div className="p-2 bg-green-100 rounded text-green-700">Excel File Preview Not Available</div>
                        ) : flow.fileType.includes("ppt") ? (
                            <div className="p-2 bg-orange-100 rounded text-orange-700">PowerPoint Preview Not Available</div>
                        ) : null}
                    </div>
                    <p className="mt-3 text-sm text-foreground">{flow.description}</p>

                    <div className="flex gap-2 mt-3">
                        <Button onPress={() => handleDownload(flow.fileUrl)}
                                className="bg-primary hover:bg-primary-hover text-white w-1/2">
                            Download
                        </Button>
                        <Button onPress={() => handleOpenOnline(flow.fileUrl, flow.fileType)}
                                className="bg-secondary hover:bg-secondary-hover text-white w-1/2">
                            Open Online
                        </Button>
                    </div>
                </Card>
            ))}
        </div>
    );
};

export default Page;
