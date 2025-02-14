'use client';

import React, { useState } from 'react';
import { Card, Listbox, ListboxItem, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from '@heroui/react';
import { Button } from "@heroui/button";
import { useRouter } from 'next/navigation';
import { dailyActivityType } from "@/types/dailyactivityTypes";
import { EmployeeData as branchShariahTypes } from "@/types/branchShariahTypes";
import { EmployeeData as staffInterviewTypes } from "@/types/staffInterviewTypes";
import { leadsType } from "@/types/360LeadsTypes";
import { Pencil, Trash2, RefreshCcw, PlusCircle } from "lucide-react";
import { Skeleton } from "@heroui/skeleton";

interface Action {
    label: string;
    onPress: () => void;
    mode?: 'contained' | 'outlined';
}

interface CommonListProps {
    loading?: boolean;
    records: dailyActivityType[] | branchShariahTypes[] | staffInterviewTypes[] | leadsType[];
    confirmDelete: (id: string) => void;
    fetchRecords: () => void;
    noRecordsText?: string;
    noRecordsActions?: Action[];
    renderItemContent: (item: dailyActivityType | branchShariahTypes | staffInterviewTypes | leadsType) => React.ReactNode;
    description?: string;
    action: string;
}

const CommonList: React.FC<CommonListProps> = ({
    loading = false,
    records,
    confirmDelete,
    fetchRecords,
    noRecordsText = 'No records available',
    noRecordsActions = [],
    renderItemContent,
    description = 'branchName',
    action,
}) => {
    const router = useRouter();
    const [deleteModal, setDeleteModal] = useState(false);
    const [selectedId, setSelectedId] = useState<string | null>(null);

    const openDeleteModal = (id: string) => {
        setSelectedId(id);
        setDeleteModal(true);
    };

    const closeDeleteModal = () => {
        setSelectedId(null);
        setDeleteModal(false);
    };

    const handleConfirmDelete = () => {
        if (selectedId) {
            confirmDelete(selectedId);
        }
        closeDeleteModal();
    };

    if (loading) {
        return (
            <div className="space-y-3 p-3 w-full">
                {[...Array(15)].map((_, index) => (
                    <div
                        key={index}
                        className="p-3 rounded-md transition w-full bg-gray-100 dark:bg-gray-800 animate-pulse"
                    >
                        <div className="flex justify-between items-center w-full">
                            <div>
                                <Skeleton className="h-6 w-40 mb-2" />
                                <Skeleton className="h-4 w-32" />
                            </div>
                            <div className="flex space-x-2">
                                <div className="h-8 w-8 bg-gray-300 dark:bg-gray-700 rounded-full animate-pulse" />
                                <div className="h-8 w-8 bg-gray-300 dark:bg-gray-700 rounded-full animate-pulse" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow-lg">
            {records.length > 0 ? (
                <Listbox className="divide-y divide-gray-300 dark:divide-gray-700">
                    {records.map((item, index) => (
                        <ListboxItem
                            key={item.id || index}
                            onClick={() => router.push(`/detail/${item.id}?action=${action}`)}
                            variant={'shadow'}
                            className={`w-full`}
                        >
                            <Card isPressable
                                onPress={() => router.push(`/detail/${item.id}?action=${action}`)}
                                fullWidth
                                className="p-3 rounded-md transition bg-transparent w-full hover:bg-gray-100 dark:hover:bg-gray-800"
                            >
                                <div className="flex justify-between items-center w-full">
                                    <div>
                                        <p className="text-gray-900 dark:text-gray-100">{renderItemContent(item)}</p>
                                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                        <p className="text-gray-500 dark:text-gray-400 text-sm text-left">{(item as any)[description] ?? "N/A"}</p>
                                    </div>
                                    <div className="flex space-x-2">
                                        <Button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                router.push(`/forms/${action}?id=${item.id}`);
                                            }}
                                            isIconOnly
                                            radius={'full'}
                                            variant={'flat'}
                                            className={'shadow-foreground !shadow-md mr-1'}
                                            color={"warning"}
                                        >
                                            <Pencil size={16} />
                                        </Button>
                                        <Button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                openDeleteModal(item.id!);
                                            }}
                                            isIconOnly
                                            radius={'full'}
                                            variant={'shadow'}
                                            className={'shadow-foreground !shadow-md'}
                                            color={"danger"}
                                        >
                                            <Trash2 size={16} />
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        </ListboxItem>
                    ))}
                </Listbox>
            ) : (
                <div className="flex flex-col items-center my-12">
                    <p className="text-4xl text-gray-500 dark:text-gray-300 mb-4">😔</p>
                    <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">{noRecordsText}</p>
                    {noRecordsActions.map((action, index) => (
                        <Button
                            key={index}
                            color={'success'}
                            radius={'lg'}
                            fullWidth
                            variant={'shadow'}
                            startContent={<PlusCircle />}
                            onClick={action.onPress}
                            size={'lg'}
                        >
                            {action.label}
                        </Button>
                    ))}
                    <Button
                        size={'lg'}
                        color={'warning'}
                        radius={'lg'}
                        fullWidth
                        variant={'light'}
                        className={`mt-4`}
                        startContent={<RefreshCcw size={16} className="mr-2" />}
                        onClick={fetchRecords}
                    >
                        Refresh
                    </Button>
                </div>
            )}

            <Modal isOpen={deleteModal} onClose={closeDeleteModal} backdrop={'blur'}>
                <ModalContent>
                    <ModalHeader>Confirm Delete</ModalHeader>
                    <ModalBody>Are you sure you want to delete this record?</ModalBody>

                    <ModalFooter>
                        <Button variant="light" onClick={closeDeleteModal}>Cancel</Button>
                        <Button color="danger" onClick={handleConfirmDelete}>Delete</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </div>
    );
};

export default CommonList;
