"use client";

import { motion } from "framer-motion";
import { Progress } from "@heroui/progress";
import { Smile, Meh, Frown } from "lucide-react";
import { JSX } from "react";

const ProgressBar = ({ score }: { score: number }) => {
  const getStatus = (): { text: string; color: "success" | "warning" | "danger"; icon: JSX.Element } => {
    if (score >= 75) return { text: "Satisfied", color: "success", icon: <Smile className="w-6 h-6 text-success" /> };
    if (score >= 50) return { text: "Needs Improvement", color: "warning", icon: <Meh className="w-6 h-6 text-warning" /> };
    return { text: "Unsatisfied", color: "danger", icon: <Frown className="w-6 h-6 text-danger" /> };
  };

  const { text, color, icon } = getStatus();

  return (
    <motion.div
      className="fixed top-10 left-1/2 transform -translate-x-1/2 max-w-96 shadow-lg rounded-full bg-default-100/50 backdrop-blur-md border border-gray-200 px-4 py-2 flex items-center justify-between gap-2 z-50"
      initial={{ y: -50, opacity: 0, left:"50%", x: "-50%" }}
      animate={{ y: 0, opacity: 1, left:"50%", x: "-50%" }}
      transition={{ duration: 0.5 }}
    >
      <div className="!flex items-center gap-2" >
        {icon}
        <h2 color={color}>{text}</h2>
      </div>
      <Progress value={score} color={color} className="w-44 h-3 rounded-full" />
    </motion.div>
  );
};

export default ProgressBar;
