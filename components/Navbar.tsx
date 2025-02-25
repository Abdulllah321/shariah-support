"use client";
import {
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    Navbar,
    NavbarBrand,
    NavbarContent
} from "@heroui/react";
import ThemeTabs from "@/components/ThemeToggle";
import Image from "next/image";
import ToggleMenu, {UserType} from "@/components/ToggleMenu";
import React, {useState} from "react";
import {Button} from "@heroui/button";
import {useAuth} from "@/context/AuthContext";


export default function AppNavbar() {
    const {user, logout} = useAuth()

    const [visible, setVisible] = useState(false);

    const openLogoutModal = () => setVisible(true);
    const closeLogoutModal = () => setVisible(false);
    const confirmLogout = () => {
        setVisible(false);
        logout();
    };


    return (<>
            <Navbar isBordered className={`fixed`}>
                <NavbarBrand className="flex items-center md:gap-2 gap-1 max-w-1/2">
                    <Image src={'/logo.png'} width={80} height={80}
                           className="w-12 h-12 bg-white rounded-full shadow-primary shadow-2xl" alt={'Logo'}/>
                    <p className="font-bold text-xs md:text-sm  md:text-left whitespace-normal">
                        Shariah Support and Services
                    </p>
                </NavbarBrand>

                <NavbarContent justify="end">
                    <ThemeTabs/>
                    <ToggleMenu user={user as UserType} handleLogout={openLogoutModal}  />
                </NavbarContent>
            </Navbar>
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
        </>
    );
}
