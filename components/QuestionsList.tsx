'use client';

import React from 'react';
import {Input,   Spinner, Divider} from '@heroui/react';

export interface Question {
    id: string;
    question: string;

    [key: string]: string;
}

interface QuestionsListProps {
    questions: Question[];
    loading: boolean;
    formData: Record<string, string>;
    handleChange: (field: string, value: string) => void;
    selection?: string;
    title?: string;
}

const QuestionsList: React.FC<QuestionsListProps> = ({
                                                         questions,
                                                         loading,
                                                         formData,
                                                         handleChange,
                                                         selection = 'question',
                                                         title = 'Questions',
                                                     }) => {
    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Spinner size="lg"/>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto py-6 ">
            <h2 className="text-2xl font-bold text-center  mb-4">{title}</h2>
            <Divider className="mb-4"/>
            <div className="space-y-4">
                {questions.map((question, index) => {
                    const contentToDisplay = selection === 'question' ? question.question : question[selection];

                    return (
                        <div key={question.id}>
                            <div>

                                <Input
                                    label={`#${index + 1} ${contentToDisplay}`}
                                    value={formData[question[selection]] || ''}
                                    onChange={(e) => handleChange(question[selection], e.target.value)}
                                    className="mt-2 "
                                    placeholder="Type your response..."
                                    variant={`bordered`}
                                    classNames={{
                                        label: "!line-clamp-1 whitespace-nowrap"
                                    }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default QuestionsList;
