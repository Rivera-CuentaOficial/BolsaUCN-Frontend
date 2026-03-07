"use client";

import { Star } from "lucide-react";
import React from "react";

type Props = {
  value: number;
  max?: number;
  editable?: boolean;
  onChange?: (value: number) => void;
};

export function StarsRating({
  value,
  max = 6,
  editable = false,
  onChange,
}: Props) {
  const handleClick = (i: number) => {
    if (!editable || !onChange) return;
    onChange(i + 1);
  };

  return (
    <div className="flex gap-1">
      {Array.from({ length: max }).map((_, i) => (
        <Star
          key={i}
          onClick={() => handleClick(i)}
          className={`
            cursor-pointer 
            transition 
            ${i < value ? "text-yellow-400" : "text-gray-300"}
            ${editable ? "hover:scale-110" : ""}
          `}
          size={22}
        />
      ))}
    </div>
  );
}
