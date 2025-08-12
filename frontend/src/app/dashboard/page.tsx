"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { BandCard } from "@/components/BandCard";
import { MatchCard } from "@/components/MatchCard";
import { Band, Match, User } from "@/types/dashboard";
import {
  Loader2,
  RefreshCw,
  Users,
  Heart,
  Settings,
  AlertCircle,
  CheckCircle,
  Music,
} from "lucide-react";

function DashboardContent() {
  const router = useRouter();

  // Mock data for demo purposes
  const [user] = useState<User>({
    id: "demo-user",
    name: "Alex Johnson",
    primary_role: "guitarist",
    instruments: ["Guitar", "Piano"],
    genres: ["Rock", "Indie", "Jazz"],
    experience: "intermediate",
    location: "San Francisco, CA",
    bio: "Passionate musician looking to create meaningful music with like-minded artists.",
    profile_completed: true,
  });

  const [bands] = useState<Band[]>([
    {
      id: "band-1",
      name: "Electric Dreams",
      drummer_id: "3",
      guitarist_id: "1",
      bassist_id: "2",
      singer_id: "1",
      status: "active",
      compatibility_data: {},
      formation_date: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      members: [
        {
          id: "1",
          name: "Alex Johnson",
          primary_role: "guitarist",
          instruments: ["Guitar"],
          genres: ["Rock", "Indie"],
          experience: "intermediate",
          profile_completed: true,
        },
        {
          id: "2",
          name: "Sam Chen",
          primary_role: "bassist",
          instruments: ["Bass"],
          genres: ["Rock", "Indie"],
          experience: "intermediate",
          profile_completed: true,
        },
        {
          id: "3",
          name: "Jordan Smith",
          primary_role: "drummer",
          instruments: ["Drums"],
          genres: ["Rock", "Indie"],
          experience: "advanced",
          profile_completed: true,
        },
      ],
    },
    {
      id: "band-2",
      name: "Midnight Jazz",
      drummer_id: "5",
      guitarist_id: "1",
      bassist_id: "5",
      singer_id: "4",
      status: "active",
      compatibility_data: {},
      formation_date: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      members: [
        {
          id: "1",
          name: "Alex Johnson",
          primary_role: "guitarist",
          instruments: ["Piano", "Guitar"],
          genres: ["Jazz"],
          experience: "intermediate",
          profile_completed: true,
        },
        {
          id: "4",
          name: "Maya Patel",
          primary_role: "singer",
          instruments: ["Saxophone", "Vocals"],
          genres: ["Jazz"],
          experience: "advanced",
          profile_completed: true,
        },
        {
          id: "5",
          name: "Chris Williams",
          primary_role: "bassist",
          instruments: ["Double Bass"],
          genres: ["Jazz"],
          experience: "professional",
          profile_completed: true,
        },
      ],
    },
  ]);

  const [matches] = useState<Match[]>([
    {
      user: {
        id: "match-1",
        name: "Riley Martinez",
        primary_role: "singer",
        instruments: ["Vocals", "Guitar"],
        genres: ["Pop", "Indie"],
        experience: "intermediate",
        location: "San Francisco, CA",
        bio: "Singer-songwriter looking for a creative band to explore new sounds",
        profile_completed: true,
      },
      compatibility_score: 92,
      reasoning: "High compatibility in musical style and creative approach",
      breakdown: {
        locationScore: 45,
        genreScore: 28,
        experienceScore: 19,
      },
    },
    {
      user: {
        id: "match-2",
        name: "Taylor Kim",
        primary_role: "drummer",
        instruments: ["Drums"],
        genres: ["Rock", "Alternative"],
        experience: "advanced",
        location: "San Francisco, CA",
        bio: "Experienced drummer seeking energetic rock band",
        profile_completed: true,
      },
      compatibility_score: 88,
      reasoning: "Strong rhythmic compatibility and shared musical vision",
      breakdown: {
        locationScore: 50,
        genreScore: 22,
        experienceScore: 16,
      },
    },
  ]);

  const [loading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error] = useState<string | null>(null);

  // Mock refresh function
  const loadDashboardData = async (showRefreshing = false) => {
    if (showRefreshing) {
      setRefreshing(true);
      // Simulate loading
      setTimeout(() => setRefreshing(false), 1000);
    }
  };

  // Event handlers

  const handleCompleteProfile = () => {
    router.push("/profile/setup");
  };

  const handleRefresh = () => {
    loadDashboardData(true);
  };

  const handleViewBand = (bandId: string) => {
    router.push(`/band/${bandId}`);
  };

  const handleOpenChat = (bandId: string) => {
    router.push(`/chat/${bandId}`);
  };

  const handleViewProfile = (userId: string) => {
    // For now, just show an alert - in production this would open a profile modal
    alert(`View profile for user ${userId}`);
  };

  const handleRequestAIAnalysis = async (userId: string) => {
    // Mock AI analysis
    const mockAnalysis = {
      reasoning:
        "High compatibility based on musical preferences and creative goals",
      compatibility_score: 94,
    };
    alert(
      `AI Analysis: ${mockAnalysis.reasoning} (Score: ${mockAnalysis.compatibility_score})`
    );
  };

  const handleSettings = () => {
    router.push("/settings");
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/30 to-secondary flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2
            className="h-8 w-8 animate-spin mx-auto mb-4 text-primary"
            data-testid="loading-spinner"
          />
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/30 to-secondary p-2 sm:p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              Dashboard
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Welcome back, {user?.name}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <Button
              onClick={handleRefresh}
              variant="outline"
              size="sm"
              disabled={refreshing}
              className="border-border text-foreground hover:bg-accent flex-1 sm:flex-none"
            >
              <RefreshCw
                className={`h-4 w-4 mr-1 ${refreshing ? "animate-spin" : ""}`}
              />
              <span className="hidden xs:inline">Refresh</span>
            </Button>
            <Button
              onClick={handleSettings}
              variant="outline"
              size="sm"
              className="border-border text-foreground hover:bg-accent flex-1 sm:flex-none"
            >
              <Settings className="h-4 w-4 mr-1" />
              <span className="hidden xs:inline">Settings</span>
            </Button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert className="mb-6 border-destructive/50 bg-destructive/10">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <AlertDescription className="text-destructive">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Profile Incomplete State */}
        {user && !user.profile_completed && (
          <Card className="mb-8 border-primary/50 bg-primary/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <AlertCircle className="h-5 w-5" />
                Complete Your Profile
              </CardTitle>
              <CardDescription className="text-primary/80">
                Set up your musical profile to start finding compatible band
                members
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-primary/80 mb-4">
                Tell us about your musical preferences, instruments, and
                experience level so we can match you with the perfect bandmates.
              </p>
              <Button
                onClick={handleCompleteProfile}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <Music className="h-4 w-4 mr-2" />
                Complete Profile Setup
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Profile Complete - Show Dashboard Content */}
        {user && user.profile_completed && (
          <div className="space-y-8">
            {/* Status Overview */}
            <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-3">
              <Card className="bg-card/80 backdrop-blur-sm border-border shadow-lg card-hover relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent"></div>
                <CardHeader className="pb-2 sm:pb-3 relative z-10">
                  <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                    Profile Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 relative z-10">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-primary animate-pulse" />
                    <span className="text-base sm:text-lg font-semibold text-foreground">
                      Complete
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                    Ready for matching
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-card/80 backdrop-blur-sm border-border shadow-lg card-hover relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-chart-2/10 to-transparent"></div>
                <CardHeader className="pb-2 sm:pb-3 relative z-10">
                  <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                    Active Bands
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 relative z-10">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 sm:h-5 sm:w-5 text-chart-2 animate-pulse animation-delay-1000" />
                    <span className="text-base sm:text-lg font-semibold text-foreground">
                      {bands.length}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                    {bands.length === 0
                      ? "No bands yet"
                      : `${bands.length} active band${
                          bands.length !== 1 ? "s" : ""
                        }`}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-card/80 backdrop-blur-sm border-border shadow-lg card-hover relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-accent-foreground/10 to-transparent"></div>
                <CardHeader className="pb-2 sm:pb-3 relative z-10">
                  <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                    Potential Matches
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 relative z-10">
                  <div className="flex items-center gap-2">
                    <Heart className="h-4 w-4 sm:h-5 sm:w-5 text-accent-foreground animate-pulse animation-delay-2000" />
                    <span className="text-base sm:text-lg font-semibold text-foreground">
                      {matches.length}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                    {matches.length === 0
                      ? "No matches found"
                      : `${matches.length} compatible musician${
                          matches.length !== 1 ? "s" : ""
                        }`}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Current Bands */}
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3 sm:mb-4">
                Your Bands
              </h2>
              {bands.length > 0 ? (
                <div className="grid gap-3 sm:gap-4 grid-cols-1 lg:grid-cols-2">
                  {bands.map((band) => (
                    <BandCard
                      key={band.id}
                      band={band}
                      currentUserId={user.id}
                      onViewBand={handleViewBand}
                      onOpenChat={handleOpenChat}
                    />
                  ))}
                </div>
              ) : (
                <Card className="text-center py-8 bg-card/80 backdrop-blur-sm border-border shadow-lg">
                  <CardContent>
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      No Bands Yet
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      When you match with compatible musicians, bands will be
                      formed automatically.
                    </p>
                    <Button
                      onClick={handleRefresh}
                      variant="outline"
                      className="border-border text-foreground hover:bg-accent"
                    >
                      Check for New Matches
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Potential Matches */}
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3 sm:mb-4">
                Potential Matches
              </h2>
              {matches.length > 0 ? (
                <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
                  {matches.map((match) => (
                    <MatchCard
                      key={match.user.id}
                      match={match}
                      onViewProfile={handleViewProfile}
                      onRequestAIAnalysis={handleRequestAIAnalysis}
                    />
                  ))}
                </div>
              ) : (
                <Card className="text-center py-8 bg-card/80 backdrop-blur-sm border-border shadow-lg">
                  <CardContent>
                    <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      No Matches Found
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      We&apos;re looking for compatible musicians in your area.
                      Check back soon!
                    </p>
                    <Button
                      onClick={handleRefresh}
                      variant="outline"
                      className="border-border text-foreground hover:bg-accent"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh Matches
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return <DashboardContent />;
}
