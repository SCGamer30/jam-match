/**
 * CompatibilityScore component - Visual representation of compatibility percentage
 */

import React from "react";
import { cn } from "@/lib/utils";

interface CompatibilityScoreProps {
  score: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

export function CompatibilityScore({
  score,
  size = "md",
  showLabel = true,
  className,
}: CompatibilityScoreProps) {
  // Ensure score is between 0 and 100
  const normalizedScore = Math.max(0, Math.min(100, score));

  // Determine color based on score
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 border-green-200 bg-green-50";
    if (score >= 60) return "text-orange-600 border-orange-200 bg-orange-50";
    if (score >= 40) return "text-yellow-600 border-yellow-200 bg-yellow-50";
    return "text-red-600 border-red-200 bg-red-50";
  };

  const getProgressColor = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-orange-500";
    if (score >= 40) return "bg-yellow-500";
    return "bg-red-500";
  };

  const sizeClasses = {
    sm: "w-10 h-10 sm:w-12 sm:h-12 text-xs",
    md: "w-14 h-14 sm:w-16 sm:h-16 text-xs sm:text-sm",
    lg: "w-16 h-16 sm:w-20 sm:h-20 text-sm sm:text-base",
  };

  const progressSizeClasses = {
    sm: "w-6 h-6 sm:w-8 sm:h-8",
    md: "w-8 h-8 sm:w-10 sm:h-10",
    lg: "w-10 h-10 sm:w-12 sm:h-12",
  };

  return (
    <div className={cn("flex flex-col items-center gap-1", className)}>
      {/* Circular progress indicator */}
      <div
        className={cn(
          "relative flex items-center justify-center rounded-full border-2 font-semibold",
          sizeClasses[size],
          getScoreColor(normalizedScore)
        )}
      >
        {/* Background circle */}
        <div className="absolute inset-1 rounded-full bg-gray-100" />

        {/* Progress circle */}
        <div
          className={cn(
            "absolute rounded-full transition-all duration-500 ease-out",
            progressSizeClasses[size],
            getProgressColor(normalizedScore)
          )}
          style={{
            clipPath: `polygon(50% 50%, 50% 0%, ${
              normalizedScore <= 12.5
                ? "50% 0%"
                : normalizedScore <= 37.5
                ? `${50 + (normalizedScore - 12.5) * 2}% 0%`
                : normalizedScore <= 62.5
                ? `100% 0%, 100% ${(normalizedScore - 37.5) * 4}%`
                : normalizedScore <= 87.5
                ? `100% 0%, 100% 100%, ${
                    100 - (normalizedScore - 62.5) * 2
                  }% 100%`
                : `100% 0%, 100% 100%, 0% 100%, 0% ${
                    100 - (normalizedScore - 87.5) * 4
                  }%`
            })`,
          }}
        />

        {/* Score text */}
        <span className="relative z-10 font-bold">
          {Math.round(normalizedScore)}%
        </span>
      </div>

      {/* Label */}
      {showLabel && (
        <span className="text-xs text-gray-600 font-medium text-center">
          Compatibility
        </span>
      )}
    </div>
  );
}
