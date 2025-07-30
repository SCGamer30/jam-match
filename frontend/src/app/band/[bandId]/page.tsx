/**
 * Band Profile Page
 *
 * Displays detailed information about a band including:
 * - All member details with instruments and experience
 * - Compatibility scores between all band members
 * - AI-generated reasoning for compatibility scores
 * - Navigation to chat interface
 * - Access control for band members only
 */

"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CompatibilityScore } from "@/components/ui/compatibility-score";
import { InstrumentBadge } from "@/components/ui/instrument-badge";
import { GenreBadge } from "@/components/ui/genre-badge";
import { bandsApi } from "@/lib/api";
import {
  Band,
  User,
  CompatibilityScore as CompatibilityScoreType,
} from "@/types/dashboard";
import { MessageCircle, Users, Calendar, MapPin, Star } from "lucide-react";

interface BandMembersData {
  band_id: string;
  members: User[];
  compatibility_scores: CompatibilityScoreType[];
  total_members: number;
}

export default function BandProfilePage() {
  const params = useParams();
  const router = useRouter();
  const bandId = params.bandId as string;

  const [band, setBand] = useState<Band | null>(null);
  const [membersData, setMembersData] = useState<BandMembersData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBandData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch band details and members data in parallel
        const [bandDetails, membersDetails] = await Promise.all([
          bandsApi.getBandDetails(bandId),
          bandsApi.getBandMembers(bandId),
        ]);

        setBand(bandDetails);
        setMembersData(membersDetails);
      } catch (err) {
        console.error("Error fetching band data:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load band data"
        );
      } finally {
        setLoading(false);
      }
    };

    if (bandId) {
      fetchBandData();
    }
  }, [bandId]);

  const getCompatibilityScore = (
    user1Id: string,
    user2Id: string
  ): CompatibilityScoreType | null => {
    if (!membersData?.compatibility_scores || user1Id === user2Id) return null;

    return (
      membersData.compatibility_scores.find(
        (score) =>
          (score.user1_id === user1Id && score.user2_id === user2Id) ||
          (score.user1_id === user2Id && score.user2_id === user1Id)
      ) || null
    );
  };

  const handleChatNavigation = () => {
    router.push(`/chat/${bandId}`);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div
              className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-300 mx-auto mb-4"
              role="status"
              aria-label="Loading"
            ></div>
            <p className="text-gray-600">Loading band profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert className="max-w-md mx-auto">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <div className="text-center mt-4">
          <Button onClick={() => router.back()} variant="outline">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  if (!band || !membersData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert className="max-w-md mx-auto">
          <AlertDescription>
            Band not found or you don't have access to view this band.
          </AlertDescription>
        </Alert>
        <div className="text-center mt-4">
          <Button onClick={() => router.push("/dashboard")} variant="outline">
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Band Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {band.name || "Your Band"}
            </h1>
            <div className="flex items-center gap-4 mt-2 text-gray-600">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>
                  Formed {new Date(band.formation_date).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{membersData.total_members} members</span>
              </div>
              <Badge
                variant="secondary"
                className="bg-green-100 text-green-800"
              >
                {band.status}
              </Badge>
            </div>
          </div>
          <Button
            onClick={handleChatNavigation}
            className="bg-orange-300 hover:bg-orange-400"
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            Open Chat
          </Button>
        </div>
      </div>

      {/* Band Members */}
      <div className="grid gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Band Members
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {membersData.members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-start gap-4 p-4 border rounded-lg"
                >
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={member.avatar_url} alt={member.name} />
                    <AvatarFallback className="bg-orange-100 text-orange-800">
                      {member.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-lg">{member.name}</h3>
                      <Badge variant="outline" className="text-xs">
                        {member.primary_role}
                      </Badge>
                    </div>
                    {member.bio && (
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {member.bio}
                      </p>
                    )}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-gray-400" />
                        <span className="text-sm capitalize">
                          {member.experience}
                        </span>
                      </div>
                      {member.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">{member.location}</span>
                        </div>
                      )}
                      <div className="flex flex-wrap gap-1">
                        {member.instruments.map((instrument) => (
                          <InstrumentBadge
                            key={instrument}
                            instrument={instrument}
                          />
                        ))}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {member.genres.map((genre) => (
                          <GenreBadge key={genre} genre={genre} />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Compatibility Matrix */}
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Member Compatibility
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {membersData.members.map((member1, index1) =>
                membersData.members.slice(index1 + 1).map((member2) => {
                  const compatibilityScore = getCompatibilityScore(
                    member1.id,
                    member2.id
                  );

                  return (
                    <div
                      key={`${member1.id}-${member2.id}`}
                      className="border rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-10 w-10">
                              <AvatarImage
                                src={member1.avatar_url}
                                alt={member1.name}
                              />
                              <AvatarFallback className="bg-orange-100 text-orange-800 text-sm">
                                {member1.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{member1.name}</span>
                          </div>
                          <span className="text-gray-400">×</span>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-10 w-10">
                              <AvatarImage
                                src={member2.avatar_url}
                                alt={member2.name}
                              />
                              <AvatarFallback className="bg-orange-100 text-orange-800 text-sm">
                                {member2.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{member2.name}</span>
                          </div>
                        </div>
                        {compatibilityScore && (
                          <CompatibilityScore
                            score={compatibilityScore.final_score}
                          />
                        )}
                      </div>

                      {compatibilityScore && (
                        <div className="space-y-3">
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div className="text-center">
                              <div className="font-medium text-gray-900">
                                Location
                              </div>
                              <div className="text-gray-600">
                                {compatibilityScore.location_score}/50
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="font-medium text-gray-900">
                                Genres
                              </div>
                              <div className="text-gray-600">
                                {compatibilityScore.genre_score}/30
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="font-medium text-gray-900">
                                Experience
                              </div>
                              <div className="text-gray-600">
                                {compatibilityScore.experience_score}/20
                              </div>
                            </div>
                          </div>

                          {compatibilityScore.ai_reasoning && (
                            <div className="bg-gray-50 rounded-lg p-3">
                              <h4 className="font-medium text-gray-900 mb-2">
                                AI Analysis
                              </h4>
                              <p className="text-gray-700 text-sm leading-relaxed">
                                {compatibilityScore.ai_reasoning}
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      {!compatibilityScore && (
                        <div className="text-center py-4 text-gray-500">
                          <p>Compatibility analysis not available</p>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
