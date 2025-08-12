/**
 * MatchCard component - Display user compatibility with scores and reasoning
 */

import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CompatibilityScore } from "@/components/ui/compatibility-score";
import { InstrumentBadgeList } from "@/components/ui/instrument-badge";
import { GenreBadgeList } from "@/components/ui/genre-badge";
import { Match } from "@/types/dashboard";
import { MapPin, Star, User } from "lucide-react";

interface MatchCardProps {
  match: Match;
  onViewProfile?: (userId: string) => void;
  onRequestAIAnalysis?: (userId: string) => void;
  className?: string;
}

export function MatchCard({
  match,
  onViewProfile,
  onRequestAIAnalysis,
  className,
}: MatchCardProps) {
  const { user, compatibility_score, reasoning, breakdown } = match;

  if (!user) {
    return null;
  }

  // Get experience level color
  const getExperienceColor = (experience: string) => {
    const colors = {
      beginner: "bg-green-100 text-green-800",
      intermediate: "bg-blue-100 text-blue-800",
      advanced: "bg-purple-100 text-purple-800",
      professional: "bg-orange-100 text-orange-800",
    };
    return (
      colors[experience as keyof typeof colors] || "bg-gray-100 text-gray-800"
    );
  };

  // Get primary role icon
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

  return (
    <Card
      className={`card-hover relative overflow-hidden bg-card/80 backdrop-blur-sm border-border shadow-lg ${className}`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-chart-2/5 via-primary/5 to-transparent"></div>
      <div className="absolute inset-0 shimmer opacity-0 hover:opacity-100 transition-opacity duration-500"></div>
      <CardHeader className="pb-2 sm:pb-3 relative z-10">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
            <Avatar className="h-10 w-10 sm:h-12 sm:w-12 ring-2 ring-primary/20 animate-pulse-glow">
              <AvatarImage src={user.avatar_url} alt={user.name} />
              <AvatarFallback className="bg-primary/20 text-primary text-xs sm:text-sm">
                {user.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-base sm:text-lg text-foreground truncate">
                {user.name}
              </h3>
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-xs sm:text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <span>{getRoleIcon(user.primary_role || "other")}</span>
                  <span className="truncate">
                    {(user.primary_role || "musician").charAt(0).toUpperCase() +
                      (user.primary_role || "musician").slice(1)}
                  </span>
                </span>
                {user.location && (
                  <span className="flex items-center gap-1 truncate">
                    <MapPin className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate">{user.location}</span>
                  </span>
                )}
              </div>
            </div>
          </div>
          <CompatibilityScore
            score={compatibility_score}
            size="sm"
            className="sm:size-md animate-pulse-glow"
          />
        </div>
      </CardHeader>

      <CardContent className="space-y-3 sm:space-y-4 pt-0 relative z-10">
        {/* Bio */}
        {user.bio && (
          <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
            {user.bio}
          </p>
        )}

        {/* Experience Level */}
        <div className="flex items-center gap-2">
          <Star className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground animate-pulse" />
          <Badge
            className={`text-xs smooth-transition hover:scale-105 ${getExperienceColor(
              user.experience || "beginner"
            )}`}
          >
            {(user.experience || "beginner").charAt(0).toUpperCase() +
              (user.experience || "beginner").slice(1)}
          </Badge>
        </div>

        {/* Instruments */}
        <div>
          <h4 className="text-xs sm:text-sm font-medium text-foreground mb-1 sm:mb-2">
            Instruments
          </h4>
          <InstrumentBadgeList
            instruments={user.instruments || []}
            maxDisplay={2}
            size="sm"
          />
        </div>

        {/* Genres */}
        <div>
          <h4 className="text-xs sm:text-sm font-medium text-foreground mb-1 sm:mb-2">
            Genres
          </h4>
          <GenreBadgeList genres={user.genres || []} maxDisplay={2} size="sm" />
        </div>

        {/* Compatibility Breakdown */}
        {breakdown && (
          <div className="bg-accent/30 backdrop-blur-sm rounded-lg p-2 sm:p-3 border border-border/50">
            <h4 className="text-xs sm:text-sm font-medium text-foreground mb-1 sm:mb-2">
              Compatibility Breakdown
            </h4>
            <div className="grid grid-cols-3 gap-1 sm:gap-2 text-xs">
              <div className="text-center">
                <div className="font-semibold text-foreground text-xs sm:text-sm animate-pulse">
                  {breakdown.locationScore || 0}/50
                </div>
                <div className="text-muted-foreground text-xs">Location</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-foreground text-xs sm:text-sm animate-pulse animation-delay-1000">
                  {breakdown.genreScore || 0}/30
                </div>
                <div className="text-muted-foreground text-xs">Genres</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-foreground text-xs sm:text-sm animate-pulse animation-delay-2000">
                  {breakdown.experienceScore || 0}/20
                </div>
                <div className="text-muted-foreground text-xs">Experience</div>
              </div>
            </div>
          </div>
        )}

        {/* Reasoning */}
        {reasoning && (
          <div className="bg-primary/10 border border-primary/30 rounded-lg p-2 sm:p-3 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-chart-2/5"></div>
            <h4 className="text-xs sm:text-sm font-medium text-primary mb-1 relative z-10">
              Why you match
            </h4>
            <p className="text-xs sm:text-sm text-primary/80 line-clamp-3 relative z-10">
              {reasoning}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          {onViewProfile && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewProfile(user.id)}
              className="flex-1 text-xs sm:text-sm border-border hover:bg-accent btn-enhanced"
            >
              <User className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
              <span className="hidden xs:inline">View Profile</span>
              <span className="xs:hidden">View</span>
            </Button>
          )}
          {onRequestAIAnalysis && (
            <Button
              variant="default"
              size="sm"
              onClick={() => onRequestAIAnalysis(user.id)}
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground text-xs sm:text-sm btn-enhanced animate-pulse-glow"
            >
              <Star className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
              <span className="hidden xs:inline">AI Analysis</span>
              <span className="xs:hidden">AI</span>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
