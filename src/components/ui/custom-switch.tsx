"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface CustomSwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
}

export function CustomSwitch({ checked, onCheckedChange, disabled }: CustomSwitchProps) {
  const spring = {
    type: "spring",
    stiffness: 700,
    damping: 30,
  };

  return (
    <div
      className={cn(
        "relative flex h-10 w-24 cursor-pointer items-center rounded-full p-1 transition-colors",
        checked ? "justify-end bg-green-600" : "justify-start bg-red-600",
        disabled && "cursor-not-allowed opacity-50"
      )}
      onClick={() => !disabled && onCheckedChange(!checked)}
    >
      <motion.div
        className="absolute z-10 text-xs font-bold text-white"
        style={{ left: checked ? "1.1rem" : "auto", right: checked ? "auto" : "0.9rem" }}
        initial={false}
        animate={{ opacity: 1 }}
      >
        {checked ? "OPEN" : "CLOSE"}
      </motion.div>
      <motion.div
        className="h-8 w-8 rounded-full bg-white shadow-md"
        layout
        transition={spring}
      />
    </div>
  );
}
