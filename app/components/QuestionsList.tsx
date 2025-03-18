"use client";

import React from "react";
import { RadioGroup, Radio, Spinner, Divider, Card } from "@heroui/react";

export interface Question {
  id: string;
  question: string;
  name: string;
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
  selection = "question",
  title = "Questions",
}) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-6">
      <h2 className="text-2xl font-bold text-center mb-4">{title}</h2>
      <Divider className="mb-4" />
      <div className="space-y-6">
        {questions.map((question, index) => {
          const contentToDisplay =
            selection === "question" ? question.question : question[selection];

          return (
            <Card key={question.id} className="p-6 border ">
              <h3 className="font-semibold mb-6 text-lg ">
                #{index + 1} {contentToDisplay}
              </h3>
              <RadioGroup
                value={formData[question[selection]] || ""}
                onValueChange={(value) =>
                  handleChange(question[selection], value)
                }
                className="flex items-center "
                classNames={{
                  wrapper: "flex justify-between flex-nowrap",
                }}
                orientation="horizontal"
                color="secondary"
              >
                {[1, 2, 3, 4, 5].map((num, idx) => (
                  <div key={num} className="flex items-center ">
                    {idx !== 0 && (
                      <Divider className="h-6 w-px bg-gray-500 mx-2"></Divider>
                    )}
                    <Radio value={String(num)} classNames={
                        {
                            wrapper: "ml-1"
                        }
                    }>{num}</Radio>
                    {/* Vertical divider except for the last radio */}
                  </div>
                ))}
              </RadioGroup>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default QuestionsList;
