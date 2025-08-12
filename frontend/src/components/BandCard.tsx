/**
 * BandCard component - Show band information and member avatars
 */

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CompatibilityScore } from "@/components/ui/compatibility-score";
import { Band } from "@/types/dashboard";
import { MessageCircle, Users, Calendar, Music } from "lucide-react";

interface BandCardProps {
  band: Band;
  currentUserId: string;
  onViewBand?: (bandId: string) => void;
  onOpenChat?: (bandId: string) => void;
  className?: string;
}

export function BandCard({
  band,
  currentUserId,
  onViewBand,
  onOpenChat,
  className,
}: BandCardProps) {
  // Calculate average compatibility score
  const calculateAverageCompatibility = () => {
    if (
      !band.compatibility_data ||
      typeof band.compatibility_data !== "object"
    ) {
      return 75; // Default score if no data
    }

    // This would be calculated from actual compatibility scores between members
    // For now, return a reasonable default
    return 78;
  };

  // Get role icon
  const getRoleIcon = (role: string) => {
    const icons = {
      drummer: "🥁",
      guitarist: "🎸",
      bassist: "🎸",
      singer: "🎤",
      other: "🎵",
    };
    return icons[role as keyof typeof icons] || "🎵";
  };

  // Format formation date
  const formatFormationDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Get band name or generate one
  const getBandName = () => {
    if (band.name) return band.name;

    // Generate a name based on member names
    const memberNames = band.members.map((m) => m.name.split(" ")[0]);
    if (memberNames.length <= 2) {
      return memberNames.join(" & ");
    }
    return `${memberNames[0]} & ${memberNames.length - 1} others`;
  };

  const averageCompatibility = calculateAverageCompatibility();

  return (
    <Card
      className={`card-hover relative overflow-hidden bg-card/80 backdrop-blur-sm border-border shadow-lg ${className}`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-chart-2/5 to-transparent"></div>
      <CardHeader className="pb-2 sm:pb-3 relative z-10">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base sm:text-lg text-foreground mb-1 truncate">
              {getBandName()}
            </CardTitle>
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-xs sm:text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>Formed {formatFormationDate(band.formation_date)}</span>
              </div>
              <Badge
                variant="outline"
                className="self-start sm:ml-2 text-xs border-primary/30 text-primary"
              >
                {band.status}
              </Badge>
            </div>
          </div>
          <CompatibilityScore
            score={averageCompatibility}
            size="sm"
            className="sm:size-md animate-pulse-glow"
          />
        </div>
      </CardHeader>

      <CardContent className="space-y-3 sm:space-y-4 pt-0 relative z-10">
        {/* Band Members */}
        <div>
          <div className="flex items-center gap-2 mb-2 sm:mb-3">
            <Users className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
            <h4 className="text-xs sm:text-sm font-medium text-foreground">
              Band Members
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
            {band.members.map((member) => (
              <div
                key={member.id}
                className={`flex items-center gap-2 p-2 rounded-lg smooth-transition ${
                  member.id === currentUserId
                    ? "bg-primary/10 border border-primary/30 animate-pulse-glow"
                    : "bg-accent/50 hover:bg-accent/70"
                }`}
              >
                <Avatar className="h-6 w-6 sm:h-8 sm:w-8">
                  <AvatarImage src={member.avatar_url} alt={member.name} />
                  <AvatarFallback className="bg-primary/20 text-primary text-xs">
                    {member.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="text-xs">
                      {getRoleIcon(member.primary_role)}
                    </span>
                    <span className="text-xs sm:text-sm font-medium text-foreground truncate">
                      {member.id === currentUserId ? "You" : member.name}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground capitalize">
                    {member.primary_role}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Shared Genres */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Music className="h-4 w-4 text-muted-foreground" />
            <h4 className="text-sm font-medium text-foreground">
              Shared Interests
            </h4>
          </div>

          {/* Find common genres among all members */}
          {(() => {
            const allGenres = band.members.flatMap((m) => m.genres);
            const genreCounts = allGenres.reduce((acc, genre) => {
              acc[genre] = (acc[genre] || 0) + 1;
              return acc;
            }, {} as Record<string, number>);

            const sharedGenres = Object.entries(genreCounts)
              .filter(([_, count]) => count >= 2)
              .map(([genre]) => genre)
              .slice(0, 3);

            return sharedGenres.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {sharedGenres.map((genre) => (
                  <Badge
                    key={genre}
                    variant="outline"
                    className="text-xs border-chart-2/30 text-chart-2 hover:bg-chart-2/10 smooth-transition"
                  >
                    {genre}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                Exploring diverse musical styles
              </p>
            );
          })()}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          {onViewBand && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewBand(band.id)}
              className="flex-1 text-xs sm:text-sm border-border hover:bg-accent btn-enhanced"
            >
              <Users className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
              <span className="hidden xs:inline">View Band</span>
              <span className="xs:hidden">View</span>
            </Button>
          )}
          {onOpenChat && (
            <Button
              variant="default"
              size="sm"
              onClick={() => onOpenChat(band.id)}
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground text-xs sm:text-sm btn-enhanced animate-pulse-glow"
            >
              <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
              Chat
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
