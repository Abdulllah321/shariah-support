"use client";
import { Input, Button } from "@heroui/react";
import { SearchIcon, X } from "lucide-react";
import { motion } from "framer-motion";
import React, { useState, useEffect, useRef } from "react";

interface FloatingSearchbarProps {
  onCancel: () => void;
  onSearch: (query: string) => void;
  searchOpen: boolean
}

const FloatingSearchbar: React.FC<FloatingSearchbarProps> = ({
  onCancel,
  onSearch,
  searchOpen
}) => {
  const [query, setQuery] = useState("");
  const searchRef = useRef<HTMLDivElement>(null);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  // Debounced search function
  useEffect(() => {
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

    debounceTimeout.current = setTimeout(() => {
      if (query.trim() !== "") {
        onSearch(query);
      }
    }, 300);

    return () => {
      if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    };
  }, [query, onSearch]);

  // Close search bar on clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        onCancel();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onCancel]);

  return (
    <motion.div
      layoutId="searchbar"
      layoutDependency={searchOpen} // Animates when `searchOpen` changes
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="fixed top-16 w-full flex items-center justify-center z-[1000]"
    >
      <div
        ref={searchRef}
        className="relative flex items-center w-[90%] max-w-lg"
      >
        {/* Search Input */}
        <Input
          value={query}
          onValueChange={setQuery}
          onKeyUp={(e) => e.key === "Enter" && onSearch(query)}
          autoFocus
          classNames={{
            label: "text-black/50 dark:text-white/90",
            input: [
              "bg-transparent",
              "text-black/90 dark:text-white/90",
              "placeholder:text-default-700/50 dark:placeholder:text-white/60",
            ],
            innerWrapper: "bg-transparent",
            inputWrapper: [
              "shadow-xl",
              "bg-default-200/50",
              "dark:bg-default/60",
              "backdrop-blur-xl",
              "backdrop-saturate-200",
              "hover:bg-default-200/70",
              "dark:hover:bg-default/70",
              "group-data-[focus=true]:bg-default-200/50",
              "dark:group-data-[focus=true]:bg-default/60",
              "!cursor-text",
            ],
          }}
          label="Search"
          variant="bordered"
          placeholder="Type to search..."
          radius="lg"
          startContent={
            <SearchIcon className="text-gray-400 dark:text-gray-500 w-5 h-5" />
          }
        />

        {/* Cancel Button */}
        <Button
          isIconOnly
          variant="light"
          className="absolute right-3"
          onPress={onCancel}
        >
          <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        </Button>
      </div>
    </motion.div>
  );
};

export default FloatingSearchbar;
