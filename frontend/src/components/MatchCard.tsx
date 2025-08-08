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
    <Card className={`hover:shadow-md transition-shadow ${className}`}>
      <CardHeader className="pb-2 sm:pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
            <Avatar className="h-10 w-10 sm:h-12 sm:w-12">
              <AvatarImage src={user.avatar_url} alt={user.name} />
              <AvatarFallback className="bg-orange-100 text-orange-800 text-xs sm:text-sm">
                {user.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-base sm:text-lg text-gray-900 truncate">
                {user.name}
              </h3>
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <span>{getRoleIcon(user.primary_role)}</span>
                  <span className="truncate">
                    {user.primary_role.charAt(0).toUpperCase() +
                      user.primary_role.slice(1)}
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
            className="sm:size-md"
          />
        </div>
      </CardHeader>

      <CardContent className="space-y-3 sm:space-y-4 pt-0">
        {/* Bio */}
        {user.bio && (
          <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">
            {user.bio}
          </p>
        )}

        {/* Experience Level */}
        <div className="flex items-center gap-2">
          <Star className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
          <Badge className={`text-xs ${getExperienceColor(user.experience)}`}>
            {user.experience.charAt(0).toUpperCase() + user.experience.slice(1)}
          </Badge>
        </div>

        {/* Instruments */}
        <div>
          <h4 className="text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
            Instruments
          </h4>
          <InstrumentBadgeList
            instruments={user.instruments}
            maxDisplay={2}
            size="sm"
          />
        </div>

        {/* Genres */}
        <div>
          <h4 className="text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
            Genres
          </h4>
          <GenreBadgeList genres={user.genres} maxDisplay={2} size="sm" />
        </div>

        {/* Compatibility Breakdown */}
        <div className="bg-gray-50 rounded-lg p-2 sm:p-3">
          <h4 className="text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
            Compatibility Breakdown
          </h4>
          <div className="grid grid-cols-3 gap-1 sm:gap-2 text-xs">
            <div className="text-center">
              <div className="font-semibold text-gray-900 text-xs sm:text-sm">
                {breakdown.locationScore}/50
              </div>
              <div className="text-gray-600 text-xs">Location</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-gray-900 text-xs sm:text-sm">
                {breakdown.genreScore}/30
              </div>
              <div className="text-gray-600 text-xs">Genres</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-gray-900 text-xs sm:text-sm">
                {breakdown.experienceScore}/20
              </div>
              <div className="text-gray-600 text-xs">Experience</div>
            </div>
          </div>
        </div>

        {/* Reasoning */}
        {reasoning && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-2 sm:p-3">
            <h4 className="text-xs sm:text-sm font-medium text-orange-800 mb-1">
              Why you match
            </h4>
            <p className="text-xs sm:text-sm text-orange-700 line-clamp-3">
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
              className="flex-1 text-xs sm:text-sm"
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
              className="flex-1 bg-orange-200 hover:bg-orange-300 text-orange-900 text-xs sm:text-sm"
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
