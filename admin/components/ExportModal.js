import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Button, Checkbox, Label, Radio } from "flowbite-react";
import { Download, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval } from "date-fns";
import * as XLSX from "xlsx";
import { getFormattedData } from "@/components/getFornattedData";

const ExportModal = ({ dailyActivityRecords, action, questions }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState("all");
    const [selectedMonths, setSelectedMonths] = useState([]);

    const closeModal = useCallback(() => setIsOpen(false), []);

    useEffect(() => {
        const handleKeyDown = (event) => event.key === "Escape" && closeModal();
        if (isOpen) window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, closeModal]);

    const getDateTypes = (action) => ({
        "daily-activity": "date",
        "branch-review": "visitDate",
        "staff-interview": "visitDate"
    }[action] || "date");

    const availableMonths = React.useMemo(() => {
        const months = new Map();
        const selectedDate = getDateTypes(action);

        dailyActivityRecords.forEach((record) => {
            const dateValue = record[selectedDate]; // Get the date value
            if (!dateValue) return; // Skip if date is missing
        
            const date = new Date(dateValue);
            if (isNaN(date.getTime())) return; // Skip if the date is invalid
        
            const year = format(date, "yyyy");
            const month = format(date, "MM"); // Only get the numeric month
            const monthKey = `${year}-${month}`; // Ensure uniqueness by including the year
        
            if (!months.has(year)) {
                months.set(year, new Set()); // Use Set to avoid duplicates
            }
        
            months.get(year).add(monthKey);
        });
        

        // Convert Set to Array for easier iteration
        return new Map([...months.entries()].map(([year, monthSet]) => [year, Array.from(monthSet)]));
    }, [dailyActivityRecords, action]);


    const handleExportToExcel = () => {
        const today = new Date(), selectedDate = getDateTypes(action);
        let filteredData = dailyActivityRecords.filter(({ [selectedDate]: date }) =>
            selectedFilter === "this-week" ? isWithinInterval(new Date(date), { start: startOfWeek(today, { weekStartsOn: 1 }), end: endOfWeek(today, { weekStartsOn: 1 }) }) :
                selectedFilter === "this-month" ? isWithinInterval(new Date(date), { start: startOfMonth(today), end: endOfMonth(today) }) :
                    selectedMonths.length ? selectedMonths.includes(format(new Date(date), "yyyy-MM")) : true
        );
        if (!filteredData.length) return alert("No records found for the selected filter.");

        const ws = XLSX.utils.json_to_sheet(getFormattedData(filteredData, action, questions));
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Report");
        XLSX.writeFile(wb, "Daily_Activity_Report.xlsx");
        closeModal();
    };

    const toggleMonthSelection = (monthKey) => {
        setSelectedFilter(""); // Reset filter when selecting custom months
        setSelectedMonths((prev) =>
            prev.includes(monthKey) ? prev.filter((m) => m !== monthKey) : [...prev, monthKey]
        );
    };


    return (
        <>
            <Button className="bg-teal-700 text-white" onClick={() => setIsOpen(true)}>
                <Download size={20} className={'mr-2'} /> Export Excel
            </Button>
            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-40" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeModal} />
                        <motion.div className="fixed inset-0 flex items-center justify-center z-50" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
                            <div className="bg-white shadow-lg rounded-lg p-6 w-[500px] relative">
                                <button className="absolute top-3 right-3 text-gray-600 hover:text-gray-900" onClick={closeModal}><X size={24} /></button>
                                <h2 className="text-xl font-semibold mb-4">Export Report</h2>
                                <Label>Select a filter:</Label>
                                {["all", "this-week", "this-month"].map((filter) => (
                                    <div key={filter} className="flex items-center gap-2">
                                        <Radio name="filter" value={filter} id={filter} onChange={() => setSelectedFilter(filter)} label={filter.replace("-", " ").replace(/\w/g, (l) => l.toUpperCase())} />
                                        <Label htmlFor={filter}>{filter.replace("-", " ").replace(/\w/g, (l) => l.toUpperCase())}</Label>
                                    </div>
                                ))}
                                <div className="mt-4">
                                    <Label>Select months:</Label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {Array.from(availableMonths.entries()).map(([year, months]) => (
                                            <div key={year}>
                                                <h3 className="font-semibold">{year}</h3>
                                                {months.map((monthKey) => {
                                                    const [yearPart, monthPart] = monthKey.split("-");
                                                    const monthLabel = format(new Date(`${yearPart}-${monthPart}-01`), "MMMM");

                                                    return (
                                                        <div className="flex items-center gap-2" key={monthKey}>
                                                            <Checkbox
                                                                checked={selectedMonths.includes(monthKey)}
                                                                onChange={() => toggleMonthSelection(monthKey)}
                                                                id={monthKey}
                                                            />
                                                            <Label htmlFor={monthKey}>{monthLabel} {year}</Label>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="mt-6 flex justify-end space-x-4">
                                    <Button onClick={closeModal} color="gray">Cancel</Button>
                                    <Button onClick={handleExportToExcel} className="bg-teal-700 text-white" disabled={!selectedFilter && !selectedMonths.length}>Export</Button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
};

export default ExportModal;
