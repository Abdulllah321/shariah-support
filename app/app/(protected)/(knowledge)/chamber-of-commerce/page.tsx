"use client";
import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card, Avatar, Button, Skeleton } from "@heroui/react";
import {Mail, Phone, Globe,  ExternalLink} from "lucide-react";

interface Chamber {
    id: string;
    name: string;
    chairman: string;
    email: string;
    phone: string;
    website: string;
}

const ChamberOfCommerce: React.FC = () => {
    const [chambers, setChambers] = useState<Chamber[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, "chambers"));
                const data = querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                })) as Chamber[];

                setChambers(data); // Set all chambers in the state
            } catch (error) {
                console.error("Error fetching chamber data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return (
        <div className="min-h-screen bg-background p-6 flex flex-col items-center gap-6">
            {loading ? (
                Array(3)
                    .fill(null)
                    .map((_, index) => (
                        <Card key={index} className="max-w-md w-full p-6 shadow-lg rounded-lg border border-border-hover bg-background-hover">
                            <div className="flex flex-col items-center text-center">
                                <Skeleton className="w-16 h-16 rounded-full" />
                                <Skeleton className="w-48 h-6 mt-3" />
                                <Skeleton className="w-32 h-4 mt-2" />
                            </div>
                            <div className="mt-4 space-y-3">
                                <Skeleton className="w-full h-5" />
                                <Skeleton className="w-full h-5" />
                                <Skeleton className="w-full h-5" />
                            </div>
                            <div className="mt-5">
                                <Skeleton className="w-full h-10 rounded-md" />
                            </div>
                        </Card>
                    ))
            ) : chambers.length > 0 ? (
                chambers.map((chamber) => (
                    <Card key={chamber.id} className="max-w-md w-full p-6 shadow-lg rounded-lg border border-border-hover bg-background-hover">
                        <div className="flex flex-col items-center text-center">
                            <Avatar size="lg" />
                            <h2 className="text-xl font-bold mt-3">{chamber.name}</h2>
                            <p className="text-secondary text-sm">{chamber.chairman}</p>
                        </div>

                        <div className="mt-4 space-y-3">
                            <div className="flex items-center gap-2">
                                <Mail className="w-5 h-5 text-primary-600" />
                                <a href={`mailto:${chamber.email}`} className="text-primary-600 hover:underline">
                                    {chamber.email}
                                </a>
                            </div>
                            <div className="flex items-center gap-2">
                                <Phone className="w-5 h-5 text-green-500" />
                                <span className="text-foreground">{chamber.phone}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Globe className="w-5 h-5 text-blue-500" />
                                <a href={`https://${chamber.website}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                                    {chamber.website}
                                </a>
                            </div>
                        </div>

                        <div className="mt-5 flex gap-3">
                            <Button color={'warning'} variant={'ghost'} fullWidth  endContent={<ExternalLink />} onPress={() => window.open(`https://${chamber.website}`, "_blank")}>
                                Visit Website
                            </Button>
                        </div>
                    </Card>
                ))
            ) : (
                <p className="text-center text-muted-foreground">No Chamber Data Available</p>
            )}
        </div>
    );
};

export default ChamberOfCommerce;
