import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from '@heroui/react';
import { ClipboardList, UsersRound, CheckCircle, Pencil } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ButtonsModal({ isOpen, closeModal }: {isOpen: boolean,
 closeModal: () => void}) {
    const router = useRouter();

    return (
        <Modal isOpen={isOpen} onClose={closeModal} backdrop={'blur'}>
            <ModalContent>
                <ModalHeader>
                    <h2>Activity Selection</h2>
                </ModalHeader>
                <ModalBody>
                    <div className="flex flex-col space-y-4">
                        <Button
                            onPress={() => {
                                router.push('/forms/daily-activity');
                                closeModal();
                            }}
                            startContent={<ClipboardList className="w-5 h-5" />}
                            className="bg-blue-500 hover:bg-blue-600 text-white"
                        >
                            Daily Activity Record
                        </Button>
                        <Button
                            onPress={() => {
                                router.push('/forms/staff-interview');
                                closeModal();
                            }}
                            startContent={<UsersRound className="w-5 h-5" />}
                            className="bg-green-500 hover:bg-green-600 text-white"
                        >
                            Staff Interview
                        </Button>
                        <Button
                            onPress={() => {
                                router.push('/forms/branch-shariah');
                                closeModal();
                            }}
                            startContent={<CheckCircle className="w-5 h-5" />}
                            className="bg-yellow-500 hover:bg-yellow-600 text-white"
                        >
                            Branch Shariah Compliance Review
                        </Button>
                        <Button
                            onPress={() => {
                                router.push('/forms/360-leads');
                                closeModal();
                            }}
                            startContent={<Pencil className="w-5 h-5" />}
                            className="bg-purple-500 hover:bg-purple-600 text-white"
                        >
                            360 Leads
                        </Button>
                    </div>
                </ModalBody>
                <ModalFooter />
            </ModalContent>
        </Modal>
    );
}
