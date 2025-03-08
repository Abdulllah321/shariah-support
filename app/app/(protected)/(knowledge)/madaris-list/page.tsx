"use client";
import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card, Skeleton } from "@heroui/react";

interface Madarsa {
    id: string;
    name: string;
    location: string;
    description: string;
    order: number;
}

const MadarisList: React.FC = () => {
    const [madaris, setMadaris] = useState<Madarsa[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, "madaris"));
                const data = querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                })) as Madarsa[];

                // Sort by order
                const sortedData = data.sort((a, b) => a.order - b.order);
                setMadaris(sortedData);
            } catch (error) {
                console.error("Error fetching Madaris data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return (
        <div className="min-h-screen bg-background p-6 flex flex-col items-center gap-6">
            {loading ? (
                Array(3).fill(null).map((_, index) => (
                    <Card key={index} className="max-w-md w-full p-6 shadow-lg rounded-lg border border-border-hover bg-background-hover">
                        <div className="flex flex-col items-center text-center">
                            <Skeleton className="w-48 h-6 mt-3" />
                            <Skeleton className="w-32 h-4 mt-2" />
                        </div>
                        <div className="mt-4 space-y-3">
                            <Skeleton className="w-full h-5" />
                            <Skeleton className="w-full h-5" />
                        </div>
                    </Card>
                ))
            ) : madaris.length > 0 ? (
                madaris.map((madarsa) => (
                    <Card key={madarsa.id} className="max-w-md w-full p-6 shadow-lg rounded-lg border border-border-hover bg-background-hover">
                        <h2 className="text-xl font-bold w-3/4">{madarsa.name}</h2>
                        <p className="text-secondary text-sm">{madarsa.location}</p>
                        <p className="text-foreground mt-2">{madarsa.description}</p>
                        <p className={'font-extrabold text-4xl absolute right-3 top-2'}>{madarsa.order}</p>
                    </Card>
                ))
            ) : (
                <p className="text-center text-muted-foreground">No Madaris Data Available</p>
            )}
        </div>
    );
};

export default MadarisList;
