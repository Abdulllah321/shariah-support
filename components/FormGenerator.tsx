import React from "react";
import {
    Input,
    Textarea,
    Select,
    SelectItem,
    DatePicker,
    DateValue,
    Button,
    Autocomplete,
    AutocompleteItem
} from "@heroui/react";
import { parseAbsolute } from "@internationalized/date";
import { Divider } from "@heroui/divider";

export interface FormField {
    value?: string;
    label?: string;
    type: "text" | "numeric" | "date" | "textarea" | "dropdown" | "divider";
    options?: string[];
    searchable?: boolean;
    required?: boolean;
    loading?: boolean;
}

interface FormGeneratorProps {
    fields: FormField[];
    onChange: (field: string, value: string) => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    values: Record<string, any>;
    handleSubmit?: (values: Record<string, string>) => void;
    submitText?: string;
    submitLoading?: boolean;
}

const FormGenerator: React.FC<FormGeneratorProps> = ({
    fields,
    onChange,
    values,
    handleSubmit,
    submitText = "Submit",
    submitLoading,
}) => {
    const FormComponent = handleSubmit ? "form" : "div";


    return (
        <FormComponent
            className="space-y-4 w-full max-w-lg mx-auto"
            onSubmit={(e) => {
                e.preventDefault();
                if (handleSubmit) {
                    handleSubmit(values);
                }

            }}
        >
            {fields.map((field) => {
                // Conditionally render the "participants" field
                if (
                    field.value === "participants" &&
                    values.activity !== "Clients met indoor / outdoor"
                ) {
                    return null;
                }

                return (
                    <div key={field.value} className="flex flex-col gap-1">
                        {field.type === "dropdown" ? (
                            field.searchable ? (
                                <Autocomplete
                                    label={field.label}
                                    onSelectionChange={(key) => {
                                        // Ensure key is a string before using replace()
                                        const keyStr = String(key);
                                        const selectedOption = keyStr.replace(/^options__/, "").replace(/-\d+$/, ""); // Extract the real option
                                        console.log(selectedOption);
                                        onChange(field.value!, selectedOption);
                                    }}
                                    className="w-full"
                                    selectedKey={
                                        values[field.value!] ? `options__${values[field.value!]}-${(field.options ?? []).indexOf(values[field.value!])}` : ""
                                    }
                                    isLoading={field.loading}
                                    value={
                                        values[field.value!] ? `options__${values[field.value!]}-${(field.options ?? []).indexOf(values[field.value!])}` : ""
                                    }
                                    isRequired={field.required}
                                >
                                    {(field.options ?? [])
                                        .filter((option) => option) // ✅ Remove falsy values
                                        .map((option, index) => (
                                            <AutocompleteItem key={`options__${option}-${index}`} value={`options__${option}-${index}`} textValue={option}>
                                                {option}
                                            </AutocompleteItem>
                                        ))}
                                </Autocomplete>

                            ) : (
                                <Select
                                    id={field.value}
                                    label={field.label}
                                    isRequired={field.required}
                                    onChange={(e) => onChange(field.value!, e.target.value)}
                                    className="w-full"
                                    value={values[field.value!] ?? ""}
                                >
                                    {(field.options ?? []).map((option) => (
                                        <SelectItem key={option} value={option}>
                                            {option}
                                        </SelectItem>
                                    ))}
                                </Select>
                            )
                        ) : field.type === "date" ? (
                            <DatePicker
                                isRequired={field.required}
                                label={field.label}
                                // @ts-expect-error
                                value={values[field.value!] ? parseAbsolute(values[field.value!], "UTC") : undefined}

                                onChange={(date: DateValue | null) =>
                                    onChange(field.value!, date ? date.toString() : "")
                                }
                            />
                        ) : field.type === "textarea" ? (
                            <Textarea
                                id={field.value}
                                label={field.label}
                                isRequired={field.required}
                                value={values[field.value!] ?? ""}
                                onChange={(e) => onChange(field.value!, e.target.value)}
                                className="w-full"
                            />
                        ) : field.type === "divider" ? (
                            <Divider />
                        ) : (
                            <Input
                                id={field.value}
                                label={field.label}
                                type={field.type === "numeric" ? "number" : field.type}
                                isRequired={field.required}
                                value={values[field.value!] ?? ""}
                                onChange={(e) => onChange(field.value!, e.target.value)}
                                className="w-full"
                            />
                        )}
                    </div>
                );
            })}

            {/* Submit Button */}
            {handleSubmit && <Button
                type="submit"
                className="w-full bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-md transition-all"
                isLoading={submitLoading}
            >
                {submitText}
            </Button>}
        </FormComponent>
    );
};

export default FormGenerator;
