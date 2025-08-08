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
      Rock: "bg-primary/10 text-primary border-primary/20 hover:bg-primary/20",
      Pop: "bg-chart-2/10 text-chart-2 border-chart-2/20 hover:bg-chart-2/20",
      Jazz: "bg-accent-foreground/10 text-accent-foreground border-accent-foreground/20 hover:bg-accent-foreground/20",
      Blues: "bg-primary/10 text-primary border-primary/20 hover:bg-primary/20",
      Country:
        "bg-chart-2/10 text-chart-2 border-chart-2/20 hover:bg-chart-2/20",
      Folk: "bg-accent-foreground/10 text-accent-foreground border-accent-foreground/20 hover:bg-accent-foreground/20",
      Classical:
        "bg-primary/10 text-primary border-primary/20 hover:bg-primary/20",
      Electronic:
        "bg-chart-2/10 text-chart-2 border-chart-2/20 hover:bg-chart-2/20",
      "Hip Hop":
        "bg-accent-foreground/10 text-accent-foreground border-accent-foreground/20 hover:bg-accent-foreground/20",
      "R&B": "bg-primary/10 text-primary border-primary/20 hover:bg-primary/20",
      Reggae:
        "bg-chart-2/10 text-chart-2 border-chart-2/20 hover:bg-chart-2/20",
      Punk: "bg-accent-foreground/10 text-accent-foreground border-accent-foreground/20 hover:bg-accent-foreground/20",
      Metal: "bg-primary/10 text-primary border-primary/20 hover:bg-primary/20",
      Alternative:
        "bg-chart-2/10 text-chart-2 border-chart-2/20 hover:bg-chart-2/20",
      Indie:
        "bg-accent-foreground/10 text-accent-foreground border-accent-foreground/20 hover:bg-accent-foreground/20",
      Funk: "bg-primary/10 text-primary border-primary/20 hover:bg-primary/20",
      Soul: "bg-chart-2/10 text-chart-2 border-chart-2/20 hover:bg-chart-2/20",
      Gospel:
        "bg-accent-foreground/10 text-accent-foreground border-accent-foreground/20 hover:bg-accent-foreground/20",
      World: "bg-primary/10 text-primary border-primary/20 hover:bg-primary/20",
      Experimental:
        "bg-chart-2/10 text-chart-2 border-chart-2/20 hover:bg-chart-2/20",
    };
    return (
      colors[genre] ||
      "bg-muted text-muted-foreground border-border hover:bg-muted/80"
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
          className="text-muted-foreground border-border text-xs px-2 py-1"
        >
          +{remainingCount} more
        </Badge>
      )}
    </div>
  );
}
