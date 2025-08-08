"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/lib/useAuth";

export default function LandingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      // Redirect authenticated users to dashboard
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return null; // Will redirect to dashboard
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white">
      {/* Hero Section */}
      <div className="container mx-auto px-3 sm:px-4 py-8 sm:py-16">
        <div className="text-center mb-12 sm:mb-16">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
            Find Your Perfect
            <span className="text-orange-600"> Band Members</span>
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 mb-6 sm:mb-8 max-w-2xl mx-auto px-2">
            JamMatch uses AI-powered compatibility analysis to connect musicians
            based on location, musical preferences, and experience level.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center max-w-sm sm:max-w-none mx-auto">
            <Button
              asChild
              size="lg"
              className="bg-orange-200 hover:bg-orange-300 text-orange-900 px-6 sm:px-8 py-3 h-12 sm:h-auto text-base"
            >
              <Link href="/register">Get Started</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-orange-200 text-orange-700 hover:bg-orange-50 px-6 sm:px-8 py-3 h-12 sm:h-auto text-base"
            >
              <Link href="/login">Sign In</Link>
            </Button>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-12 sm:mb-16">
          <Card className="border-orange-100">
            <CardHeader className="pb-4">
              <CardTitle className="text-orange-800 text-lg sm:text-xl">
                🎯 Smart Matching
              </CardTitle>
              <CardDescription className="text-sm sm:text-base">
                Our AI analyzes your musical preferences, experience, and
                location to find the most compatible band members.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-orange-100">
            <CardHeader className="pb-4">
              <CardTitle className="text-orange-800 text-lg sm:text-xl">
                💬 Real-time Chat
              </CardTitle>
              <CardDescription className="text-sm sm:text-base">
                Connect instantly with your matched band members through our
                built-in messaging system.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-orange-100 sm:col-span-2 lg:col-span-1">
            <CardHeader className="pb-4">
              <CardTitle className="text-orange-800 text-lg sm:text-xl">
                🎵 Auto Band Formation
              </CardTitle>
              <CardDescription className="text-sm sm:text-base">
                When 3-4 musicians have high compatibility scores, we
                automatically form a band for you.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* How It Works Section */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8">
            How It Works
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-orange-800 font-bold text-lg">1</span>
              </div>
              <h3 className="font-semibold mb-2 text-base sm:text-lg">
                Create Profile
              </h3>
              <p className="text-sm sm:text-base text-gray-600">
                Tell us about your musical background, instruments, and
                preferences.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-orange-800 font-bold text-lg">2</span>
              </div>
              <h3 className="font-semibold mb-2 text-base sm:text-lg">
                Get Matched
              </h3>
              <p className="text-sm sm:text-base text-gray-600">
                Our AI finds musicians with compatible styles and experience.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-orange-800 font-bold text-lg">3</span>
              </div>
              <h3 className="font-semibold mb-2 text-base sm:text-lg">
                Form Bands
              </h3>
              <p className="text-sm sm:text-base text-gray-600">
                When compatibility is high, we automatically create your band.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-orange-800 font-bold text-lg">4</span>
              </div>
              <h3 className="font-semibold mb-2 text-base sm:text-lg">
                Start Jamming
              </h3>
              <p className="text-sm sm:text-base text-gray-600">
                Connect with your band members and start making music together.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Card className="max-w-2xl mx-auto border-orange-200 bg-orange-50">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl sm:text-2xl text-orange-800">
                Ready to Find Your Band?
              </CardTitle>
              <CardDescription className="text-base sm:text-lg">
                Join thousands of musicians who have found their perfect match.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                asChild
                size="lg"
                className="bg-orange-200 hover:bg-orange-300 text-orange-900 px-8 sm:px-12 py-3 h-12 sm:h-auto text-base"
              >
                <Link href="/register">Create Your Profile</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
