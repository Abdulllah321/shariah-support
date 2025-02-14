"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Input, Button, Card } from "@heroui/react";
import { useAuth } from "@/context/AuthContext";

export default function Login() {
    const router = useRouter();
    const [employeeId, setEmployeeId] = useState("");
    const [username, setUsername] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const { login } = useAuth();

    const handleLogin = async () => {
        if (!employeeId.trim() || !username.trim()) {
            setError("Please enter both Employee ID and Username.");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const scholarsRef = collection(db, "scholars");
            const scholarQuery = query(scholarsRef, where("employeeId", "==", employeeId.trim()));
            const querySnapshot = await getDocs(scholarQuery);

            if (querySnapshot.empty) {
                setError("Invalid Employee ID.");
                setLoading(false);
                return;
            }

            const scholarData = querySnapshot.docs[0].data();
            if (scholarData.name !== username.trim()) {
                setError("Incorrect Username.");
                setLoading(false);
                return;
            }

            login({ employeeId, username });

            // 🌟 Delay redirect to avoid re-render issues
            setTimeout(() => {
                router.replace("/");
            }, 0);
        } catch (error) {
            console.error("Login Error:", error);
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen ">
            <Card className="p-6 w-96 shadow-lg rounded-xl bg-default/50">
                <h2 className="text-2xl font-bold text-center mb-4 ">
                    Login
                </h2>

                {error && <p className="text-red-500 text-sm text-center mb-2">{error}</p>}

                <div className="space-y-4">
                    <Input
                        type="text"
                        placeholder="Employee ID"
                        value={employeeId}
                        onChange={(e) => setEmployeeId(e.target.value)}
                    />
                    <Input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <Button
                        onPress={handleLogin}
                        isLoading={loading}
                        disabled={loading}
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-md"
                    >
                        {loading ? "Logging in..." : "Login"}
                    </Button>
                </div>
            </Card>
        </div>
    );
}
