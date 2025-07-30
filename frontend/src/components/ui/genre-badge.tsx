/**
 * GenreBadge component - Display musical genres as badges
 */

import React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface GenreBadgeProps {
  genre: string;
  variant?: "default" | "secondary" | "outline";
  size?: "sm" | "md";
  className?: string;
}

export function GenreBadge({
  genre,
  variant = "outline",
  size = "sm",
  className,
}: GenreBadgeProps) {
  // Get color scheme for genre
  const getGenreColor = (genre: string) => {
    const colors: Record<string, string> = {
      Rock: "bg-red-100 text-red-800 border-red-200 hover:bg-red-200",
      Pop: "bg-pink-100 text-pink-800 border-pink-200 hover:bg-pink-200",
      Jazz: "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200",
      Blues:
        "bg-indigo-100 text-indigo-800 border-indigo-200 hover:bg-indigo-200",
      Country:
        "bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200",
      Folk: "bg-green-100 text-green-800 border-green-200 hover:bg-green-200",
      Classical:
        "bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200",
      Electronic: "bg-cyan-100 text-cyan-800 border-cyan-200 hover:bg-cyan-200",
      "Hip Hop": "bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200",
      "R&B":
        "bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-200",
      Reggae:
        "bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-200",
      Punk: "bg-red-100 text-red-800 border-red-200 hover:bg-red-200",
      Metal: "bg-slate-100 text-slate-800 border-slate-200 hover:bg-slate-200",
      Alternative:
        "bg-violet-100 text-violet-800 border-violet-200 hover:bg-violet-200",
      Indie: "bg-teal-100 text-teal-800 border-teal-200 hover:bg-teal-200",
      Funk: "bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-200",
      Soul: "bg-rose-100 text-rose-800 border-rose-200 hover:bg-rose-200",
      Gospel: "bg-sky-100 text-sky-800 border-sky-200 hover:bg-sky-200",
      World: "bg-lime-100 text-lime-800 border-lime-200 hover:bg-lime-200",
      Experimental:
        "bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200 hover:bg-fuchsia-200",
    };
    return (
      colors[genre] ||
      "bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200"
    );
  };

  const sizeClasses = {
    sm: "text-xs px-2 py-1",
    md: "text-sm px-3 py-1.5",
  };

  return (
    <Badge
      variant={variant}
      className={cn(
        "font-medium transition-colors",
        sizeClasses[size],
        getGenreColor(genre),
        className
      )}
    >
      {genre}
    </Badge>
  );
}

interface GenreBadgeListProps {
  genres: string[];
  maxDisplay?: number;
  variant?: "default" | "secondary" | "outline";
  size?: "sm" | "md";
  className?: string;
}

export function GenreBadgeList({
  genres,
  maxDisplay = 3,
  variant = "outline",
  size = "sm",
  className,
}: GenreBadgeListProps) {
  const displayGenres = genres.slice(0, maxDisplay);
  const remainingCount = genres.length - maxDisplay;

  return (
    <div className={cn("flex flex-wrap gap-1", className)}>
      {displayGenres.map((genre) => (
        <GenreBadge key={genre} genre={genre} variant={variant} size={size} />
      ))}
      {remainingCount > 0 && (
        <Badge
          variant="outline"
          className="text-gray-600 border-gray-300 text-xs px-2 py-1"
        >
          +{remainingCount} more
        </Badge>
      )}
    </div>
  );
}
