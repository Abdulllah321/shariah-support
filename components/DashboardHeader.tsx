"use client";

import React, {useState} from "react";
import {LogOut, Eye, EyeOff} from "lucide-react"; // Import Eye and EyeOff icons
import {Button} from "@heroui/button";
import {Modal, ModalBody, ModalContent, ModalFooter, ModalHeader} from "@heroui/react";
import Image from "next/image";
import {Skeleton} from "@heroui/skeleton";
import {Divider} from "@heroui/divider";

interface DashboardHeaderProps {
    username?: string;
    empId?: string | number;
    score?: number | string;
    handleLogout: () => void;
    handleScoreDetails: () => void;
    iconId?: string; // Add iconId to allow changing icons
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
                                                             username = "User",
                                                             empId,
                                                             score,
                                                             handleLogout,
                                                             handleScoreDetails,
                                                         }) => {
    const [visible, setVisible] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);
    const [isEmpIdVisible, setIsEmpIdVisible] = useState(false);

    const openLogoutModal = () => setVisible(true);
    const closeLogoutModal = () => setVisible(false);
    const confirmLogout = () => {
        setVisible(false);
        handleLogout();
    };

    const toggleEmpIdVisibility = () => setIsEmpIdVisible(!isEmpIdVisible);


    return (
        <div className="relative ">
            <div className={'absolute top-20 -right-20 w-40 h-40 rounded-full bg-secondary  blur-[50px]'}/>
            <div
                className={'absolute top-[50%] left-1/2 -translate-x-1/2 w-[80%] h-40 rounded-full bg-primary-500  blur-[80px]'}/>
            <div
                className={'blur-[106px] absolute -top-1/4 left-10 rotate-45 w-40 h-96 rounded-full bg-emerald-800 outline-[30px] outline-primary'}/>

            <div
                className="backdrop-blur-xl bg-gradient-to-tr dark:from-foreground-800/20 dark:to-foreground-400/40 from-primary via-primary-800 to-primary-600 p-6 pt-20 -mt-20 rounded-b-3xl text-white relative overflow-hidden">
                <div className="flex space-x-2 text-md text-center items-center font-semibold justify-between mb-4">
                    <span>Employee Id:</span>
                    <span className={`flex items-center gap-2`}>

                    <span className={isEmpIdVisible ? 'text-sm' : "text-lg"}>
                        {isEmpIdVisible ? empId : "******"} {/* Toggle visibility */}
                    </span>
                    <Button
                        isIconOnly={true}
                        onPress={toggleEmpIdVisibility} // Toggle visibility on click
                        aria-label="Toggle Employee Id"
                        // className="text-white"
                        variant={'light'}
                        color={'primary'}
                    >
  {isEmpIdVisible ? <Eye className="w-6 h-6 text-gray-500"/>
      : <EyeOff className="w-6 h-6 text-gray-500"/>}
                    </Button></span>
                </div>
                <div className="flex flex-col items-start space-y-4 relative">
                    {/* Greeting & Logout */}
                    <div className="flex items-center justify-between w-full">
                        <div className="leading-tight flex items-center space-x-3">
                            {/* Avatar with Skeleton */}
                            <div className="relative w-12 h-12">
                                {!imageLoaded && (
                                    <Skeleton className="w-12 h-12  rounded-full"/>
                                )}
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
                            </div>
                        </div>
                        <button
                            onClick={openLogoutModal}
                            className="bg-white text-red-500 rounded-full p-2"
                            aria-label="Logout"
                        >
                            <LogOut className="w-6 h-6"/>
                        </button>
                    </div>

                    <Divider/>

                    {/* Score Section */}
                    <div className="flex items-center space-x-2 text-lg">
                        <span>Score:</span>
                        <span className="text-3xl font-bold">{score}</span>
                    </div>

                    {/* Score Details Button */}
                    <Button
                        variant="shadow"

                        radius="full"
                        className="mx-auto bg-white shadow-white/50 dark:bg-primary dark:shadow-primary/50"
                        size="lg"
                        onPress={handleScoreDetails}
                    >
                        <Eye className="w-6 h-6 mr-2"/> {/* Icon added here */}
                        View Details
                    </Button>

                </div>

                {/* Logout Confirmation Modal */}
                <Modal isOpen={visible} onClose={closeLogoutModal} placement={'center'}>
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
