"use client";
import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { format } from "date-fns";
import {Button, Card} from "@heroui/react";

interface SessionLink {
    id: string;
    title: string;
    description: string;
    createdAt: { seconds: number; nanoseconds: number };
    link: string;
}

const SessionLinkPage: React.FC = () => {
    const [sessionLinks, setSessionLinks] = useState<SessionLink[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, "session_links"));
                const data = querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                })) as SessionLink[];
                setSessionLinks(data);
            } catch (error) {
                console.error("Error fetching session links:", error);
            }
        };

        fetchData();
    }, []);

    const formatDate = (timestamp: { seconds: number; nanoseconds: number }) => {
        const date = new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000);
        return format(date, "MMM dd, yyyy hh:mm a");
    };

    // Function to check if the link is a YouTube video
    const isYouTubeLink = (url: string) => {
        return url.includes("youtube.com") || url.includes("youtu.be");
    };

    // Convert YouTube link to embeddable format
    const getYouTubeEmbedUrl = (url: string) => {
        const videoId = url.split("v=")[1]?.split("&")[0] || url.split("youtu.be/")[1];
        return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
    };

    return (
        <div className="flex flex-col gap-4 p-6 bg-background">
            {sessionLinks.map((session) => (
                <Card key={session.id} className="p-4 border border-border-hover bg-background-hover shadow-white" shadow={"lg"}>
                    <h3 className="text-lg font-bold">{session.title}</h3>
                    <p className="text-sm text-muted-foreground">{formatDate(session.createdAt)}</p>

                    {/* Show description if available */}
                    {session.description && (
                        <p className="mt-2 text-foreground">{session.description}</p>
                    )}

                    <div className="mt-4">
                        {isYouTubeLink(session.link) ? (
                            <iframe
                                className="w-full h-64 rounded-lg"
                                src={getYouTubeEmbedUrl(session.link)}
                                title="YouTube Video"
                                allowFullScreen
                            />
                        ) : (
                            <Button
                                href={session.link}
                                target="_blank"
                                className="text-primary underline"
                            >
                                Open Link
                            </Button>
                        )}
                    </div>
                </Card>
            ))}
        </div>
    );
};

export default SessionLinkPage;
