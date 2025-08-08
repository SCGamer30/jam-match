/**
 * InstrumentBadge component - Display user instruments as badges
 */

import React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface InstrumentBadgeProps {
  instrument: string;
  variant?: "default" | "secondary" | "outline";
  size?: "sm" | "md";
  className?: string;
}

export function InstrumentBadge({
  instrument,
  variant = "secondary",
  size = "sm",
  className,
}: InstrumentBadgeProps) {
  // Get icon for instrument (using emoji for simplicity)
  const getInstrumentIcon = (instrument: string) => {
    const icons: Record<string, string> = {
      Guitar: "🎸",
      "Bass Guitar": "🎸",
      Drums: "🥁",
      Vocals: "🎤",
      Piano: "🎹",
      Keyboard: "🎹",
      Violin: "🎻",
      Saxophone: "🎷",
      Trumpet: "🎺",
      Flute: "🪈",
      Clarinet: "🎵",
      Cello: "🎻",
      Harmonica: "🎵",
      Banjo: "🪕",
      Mandolin: "🎵",
      Ukulele: "🎸",
      Accordion: "🪗",
      Synthesizer: "🎹",
      Percussion: "🥁",
      Other: "🎵",
    };
    return icons[instrument] || "🎵";
  };

  const sizeClasses = {
    sm: "text-xs px-2 py-1",
    md: "text-sm px-3 py-1.5",
  };

  return (
    <Badge
      variant={variant}
      className={cn(
        "inline-flex items-center gap-1 font-medium bg-primary/10 text-primary hover:bg-primary/20 border-primary/20",
        sizeClasses[size],
        className
      )}
    >
      <span className="text-xs">{getInstrumentIcon(instrument)}</span>
      <span>{instrument}</span>
    </Badge>
  );
}

interface InstrumentBadgeListProps {
  instruments: string[];
  maxDisplay?: number;
  variant?: "default" | "secondary" | "outline";
  size?: "sm" | "md";
  className?: string;
}

export function InstrumentBadgeList({
  instruments,
  maxDisplay = 3,
  variant = "secondary",
  size = "sm",
  className,
}: InstrumentBadgeListProps) {
  const displayInstruments = instruments.slice(0, maxDisplay);
  const remainingCount = instruments.length - maxDisplay;

  return (
    <div className={cn("flex flex-wrap gap-1", className)}>
      {displayInstruments.map((instrument) => (
        <InstrumentBadge
          key={instrument}
          instrument={instrument}
          variant={variant}
          size={size}
        />
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
