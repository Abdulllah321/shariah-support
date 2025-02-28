"use client";

import React, {useState, useEffect} from "react";
import {animate, motion, useMotionValue, useTransform} from "framer-motion";
import {LogOut, Eye, EyeOff, LayoutDashboard, Trophy, Award} from "lucide-react";
import {Button} from "@heroui/button";
import {Modal, ModalBody, ModalContent, ModalFooter, ModalHeader} from "@heroui/react";
import Image from "next/image";
import {Skeleton} from "@heroui/skeleton";
import {Divider} from "@heroui/divider";
import {useRouter} from "next/navigation";

interface DashboardHeaderProps {
    username?: string;
    empId?: string | number;
    score?: number | string;
    activities?: string[];
    handleLogout: () => void;
    handleScoreDetails: () => void;
    loading: boolean;
}

const AnimatedNumber = ({value}: { value: number }) => {
    const motionValue = useMotionValue(0);
    const animatedValue = useTransform(motionValue, (latest) => Math.round(latest));

    useEffect(() => {

        const controls = animate(motionValue, value, {duration: 1.5, ease: "easeOut"});
        return controls.stop;
    }, [value, motionValue]);

    return <motion.span className="text-3xl font-bold text-white">{animatedValue}</motion.span>;
};

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
                                                             username = "User",
                                                             empId,
                                                             score = 0,
                                                             activities,
                                                             loading,
                                                             handleLogout,
                                                             handleScoreDetails,
                                                         }) => {
    const [visible, setVisible] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);
    const [isEmpIdVisible, setIsEmpIdVisible] = useState(false);
    const router = useRouter();

    const openLogoutModal = () => setVisible(true);
    const closeLogoutModal = () => setVisible(false);
    const confirmLogout = () => {
        setVisible(false);
        handleLogout();
    };
    const toggleEmpIdVisibility = () => setIsEmpIdVisible(!isEmpIdVisible);

    return (
        <div className="relative">
            <div className={'absolute top-20 -right-20 w-40 h-40 rounded-full bg-secondary blur-[50px]'}/>
            <div
                className={'absolute top-[50%] left-1/2 -translate-x-1/2 w-[80%] h-40 rounded-full bg-primary-500 blur-[80px]'}/>
            <div
                className={'blur-[106px] absolute -top-1/4 left-10 rotate-45 w-40 h-96 rounded-full bg-emerald-800 outline-[30px] outline-primary'}/>

            <div
                className="backdrop-blur-xl bg-gradient-to-tr dark:from-foreground-800/20 dark:to-foreground-400/40 from-primary via-primary-800 to-primary-600 p-6 pt-20 -mt-20 rounded-b-3xl text-white relative overflow-hidden">
                <div className="flex space-x-2 text-md text-center items-center font-semibold justify-between mb-4">
                    <span>Employee Id:</span>
                    <span className="flex items-center gap-2">
                        <span className={isEmpIdVisible ? 'text-sm' : "text-lg"}>
                            {isEmpIdVisible ? empId : "******"}
                        </span>
                        <Button
                            isIconOnly
                            onPress={toggleEmpIdVisibility}
                            aria-label="Toggle Employee Id"
                            variant="light"
                            color="primary"
                        >
                            {isEmpIdVisible ? <Eye className="w-6 h-6 text-gray-500"/> :
                                <EyeOff className="w-6 h-6 text-gray-500"/>}
                        </Button>
                    </span>
                </div>

                <div className="flex flex-col items-start space-y-4 relative">
                    <div className="flex items-center justify-between w-full">
                        <div className="leading-tight flex items-center space-x-3">
                            <div className="relative w-12 h-12">
                                {!imageLoaded && <Skeleton className="w-12 h-12 rounded-full"/>}
                                <Image
                                    src="/user-avatar.png"
                                    className={`w-12 h-12 rounded-full transition-opacity duration-500 ${imageLoaded ? "opacity-100" : "opacity-0"}`}
                                    width={50}
                                    height={50}
                                    alt="User Avatar"
                                    onLoad={() => setImageLoaded(true)}
                                />
                            </div>
                            <div>
                                <div className="text-xl font-bold text-secondary">Asslam u alikum,</div>
                                <div className="text-2xl font-extrabold text-primary-500">{username}</div>
                                <div className="text-lg font-semibold text-gray-300">
                                    Score: <AnimatedNumber value={Number(score)}/>
                                </div>
                            </div>

                        </div>
                        <button onClick={openLogoutModal} className="bg-white text-red-500 rounded-full p-2"
                                aria-label="Logout">
                            <LogOut className="w-6 h-6"/>
                        </button>
                    </div>

                    <Divider/>

                    <div className={'flex items-center justify-between w-full '}>

                        <div className="flex flex-col items-center space-y-3 w-full">
                            {loading ? <div className="flex flex-col items-center space-y-3 w-full">

                                <Skeleton className={'w-full h-10 rounded-full'}/>
                                <Skeleton className={'w-full h-10 rounded-full scale-90'}/>
                                <Skeleton className={'w-full h-10 rounded-full scale-80'}/>
                            </div> : activities?.map((activity, index) => {
                                // Rank-specific styles
                                const rankStyles = [
                                    "bg-yellow-500/30 border-yellow-400 text-yellow-200 shadow-yellow-500/40", // 🥇 Gold
                                    "bg-gray-500/30 border-gray-400 text-gray-200 shadow-gray-500/40", // 🥈 Silver
                                    "bg-orange-500/30 border-orange-400 text-orange-200 shadow-orange-500/40", // 🥉 Bronze
                                ];

                                return (
                                    <div
                                        key={index}
                                        className={`relative w-full px-6 py-2 rounded-full border backdrop-blur-lg text-center font-semibold flex items-center transition-all duration-300 transform
          
          ${rankStyles[index] || "bg-white/10 border-gray-600 text-gray-300 shadow-gray-700/30"}
          ${index === 0 ? "scale-100 text-lg" : index === activities.length - 1 ? "scale-80" : "scale-90"}`}
                                        style={{
                                            boxShadow: "inset 2px 2px 8px rgba(255,255,255,0.1), 3px 3px 10px rgba(0,0,0,0.3)",
                                        }}
                                    >
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2">
                                            {index < 3 ? (
                                                <Trophy className="w-6 h-6" strokeWidth={2}/>
                                            ) : (
                                                <Award className="w-6 h-6" strokeWidth={2}/>
                                            )}
                                        </div>
                                        <span className="ml-8 whitespace-nowrap">{index + 1}. {activity}</span>
                                    </div>
                                );
                            })}
                        </div>


                    </div>

                    <Divider/>

                    <div className="flex items-center mx-auto justify-center gap-2 mt-4">
                        <Button
                            variant="shadow"
                            radius="full"
                            className="bg-white shadow-white/50 dark:bg-primary dark:shadow-primary/50 px-6 py-3"
                            size="md"
                            startContent={<Eye className="w-4 h-4"/>}
                            onPress={handleScoreDetails}
                        >
                            View Details
                        </Button>
                        <Button
                            variant="shadow"
                            radius="full"
                            className="bg-gradient-to-r from-gray-900 to-gray-700 text-white px-6 py-3"
                            size="md"
                            onPress={() => router.push("/dashboard")}
                            endContent={<LayoutDashboard className="w-4 h-4"/>}
                        >
                            View Dashboard
                        </Button>
                    </div>
                </div>

                <Modal isOpen={visible} onClose={closeLogoutModal} placement="center">
                    <ModalContent>
                        <ModalHeader>Confirm Logout</ModalHeader>
                        <ModalBody>
                            <h4>Are you sure you want to logout?</h4>
                        </ModalBody>
                        <ModalFooter>
                            <Button variant="ghost" onPress={closeLogoutModal}>
                                Cancel
                            </Button>
                            <Button variant="faded" color="danger" onPress={confirmLogout}>
                                Confirm
                            </Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>
            </div>
        </div>
    );
};

export default DashboardHeader;
