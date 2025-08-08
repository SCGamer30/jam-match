"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/useAuth";
import { AuthGuard } from "@/components/AuthGuard";
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
import { userApi, bandsApi, matchingApi } from "@/lib/api";
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
  const { user: authUser, signOut } = useAuth();
  const router = useRouter();

  // State management
  const [user, setUser] = useState<User | null>(null);
  const [bands, setBands] = useState<Band[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load dashboard data
  const loadDashboardData = async (showRefreshing = false) => {
    try {
      if (showRefreshing) setRefreshing(true);
      setError(null);

      // Load user profile
      const userProfile = await userApi.getProfile();
      setUser(userProfile);

      // If profile is completed, load bands and matches
      if (userProfile.profile_completed) {
        const [bandsResponse, matchesResponse] = await Promise.all([
          bandsApi.getUserBands(),
          matchingApi.getUserMatches(),
        ]);

        setBands(bandsResponse.bands);
        setMatches(matchesResponse.matches);
      } else {
        setBands([]);
        setMatches([]);
      }
    } catch (err) {
      console.error("Error loading dashboard data:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load dashboard data"
      );
    } finally {
      setLoading(false);
      if (showRefreshing) setRefreshing(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadDashboardData();
  }, []);

  // Real-time updates (simplified - in production you'd use WebSocket)
  useEffect(() => {
    if (!user?.profile_completed) return;

    const interval = setInterval(() => {
      loadDashboardData();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [user?.profile_completed]);

  // Event handlers
  const handleSignOut = async () => {
    await signOut();
  };

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
    if (!user) return;

    try {
      const analysis = await matchingApi.requestAIAnalysis(user.id, userId);
      alert(
        `AI Analysis: ${analysis.reasoning} (Score: ${analysis.compatibility_score})`
      );
    } catch (err) {
      console.error("Error requesting AI analysis:", err);
      alert("Failed to get AI analysis");
    }
  };

  const handleSettings = () => {
    router.push("/settings");
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2
            className="h-8 w-8 animate-spin mx-auto mb-4 text-orange-600"
            data-testid="loading-spinner"
          />
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white p-2 sm:p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Dashboard
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              Welcome back, {user?.name || authUser?.email}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <Button
              onClick={handleRefresh}
              variant="outline"
              size="sm"
              disabled={refreshing}
              className="border-orange-200 text-orange-700 hover:bg-orange-50 flex-1 sm:flex-none"
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
              className="border-orange-200 text-orange-700 hover:bg-orange-50 flex-1 sm:flex-none"
            >
              <Settings className="h-4 w-4 mr-1" />
              <span className="hidden xs:inline">Settings</span>
            </Button>
            <Button
              onClick={handleSignOut}
              variant="outline"
              size="sm"
              className="border-orange-200 text-orange-700 hover:bg-orange-50 flex-1 sm:flex-none"
            >
              <span className="hidden xs:inline">Sign Out</span>
              <span className="xs:hidden">Exit</span>
            </Button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Profile Incomplete State */}
        {user && !user.profile_completed && (
          <Card className="mb-8 border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-800">
                <AlertCircle className="h-5 w-5" />
                Complete Your Profile
              </CardTitle>
              <CardDescription className="text-orange-700">
                Set up your musical profile to start finding compatible band
                members
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-orange-700 mb-4">
                Tell us about your musical preferences, instruments, and
                experience level so we can match you with the perfect bandmates.
              </p>
              <Button
                onClick={handleCompleteProfile}
                className="bg-orange-200 hover:bg-orange-300 text-orange-900"
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
              <Card>
                <CardHeader className="pb-2 sm:pb-3">
                  <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">
                    Profile Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                    <span className="text-base sm:text-lg font-semibold text-gray-900">
                      Complete
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600 mt-1">
                    Ready for matching
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2 sm:pb-3">
                  <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">
                    Active Bands
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                    <span className="text-base sm:text-lg font-semibold text-gray-900">
                      {bands.length}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600 mt-1">
                    {bands.length === 0
                      ? "No bands yet"
                      : `${bands.length} active band${
                          bands.length !== 1 ? "s" : ""
                        }`}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2 sm:pb-3">
                  <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">
                    Potential Matches
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center gap-2">
                    <Heart className="h-4 w-4 sm:h-5 sm:w-5 text-red-600" />
                    <span className="text-base sm:text-lg font-semibold text-gray-900">
                      {matches.length}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600 mt-1">
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
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
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
                <Card className="text-center py-8">
                  <CardContent>
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      No Bands Yet
                    </h3>
                    <p className="text-gray-600 mb-4">
                      When you match with compatible musicians, bands will be
                      formed automatically.
                    </p>
                    <Button
                      onClick={handleRefresh}
                      variant="outline"
                      className="border-orange-200 text-orange-700 hover:bg-orange-50"
                    >
                      Check for New Matches
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Potential Matches */}
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
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
                <Card className="text-center py-8">
                  <CardContent>
                    <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      No Matches Found
                    </h3>
                    <p className="text-gray-600 mb-4">
                      We&apos;re looking for compatible musicians in your area.
                      Check back soon!
                    </p>
                    <Button
                      onClick={handleRefresh}
                      variant="outline"
                      className="border-orange-200 text-orange-700 hover:bg-orange-50"
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
  return (
    <AuthGuard requireAuth={true}>
      <DashboardContent />
    </AuthGuard>
  );
}
